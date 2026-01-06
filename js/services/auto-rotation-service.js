/**
 * 自動輪替服務 (重構版)
 * 使用全域搜索評分 (Global Score-Based Search)
 */

export const calculateAutoRotation = (
    currentRotation,
    allPlayers,
    config
) => {
    const {
        substituteCount,
        newPitcherId
    } = config;

    // --- 1. 初始化資料與狀態判斷 ---

    const lineup = { ...currentRotation.lineup };
    const battingOrder = [...currentRotation.battingOrder];

    // 狀態追蹤
    const currentCounts = currentRotation.substitutionCounts || {};
    const tiredPlayers = new Set(currentRotation.tiredPlayers || []);
    // 🆕 守備局數追蹤 (Tenure): 記錄球員連續在場上的局數
    const currentTenure = currentRotation.fieldingTenure || {};

    let currentPitcherId = lineup.P;

    // 建立場上野手名單 (Fielders)
    // 包含位置、是否疲勞(Tired)、是否新鮮人(Fresh)
    let fielders = [];
    const fielderIds = new Set();

    battingOrder.forEach((slot, idx) => {
        // 計算 Tenure
        // 若有紀錄則用紀錄，若無(舊資料轉移)則：疲勞者設為 2，新人設為 1
        let tenure = currentTenure[slot.playerId];
        if (tenure === undefined) {
            tenure = tiredPlayers.has(slot.playerId) ? 2 : 1;
        }

        const rawPoints = allPlayers.find(p => p.id === slot.playerId)?.points || 0;

        // 為了相容 UI 顯示：Tired (Tenure >= 2) -> points/10
        const isTired = tenure >= 2;
        const points = isTired ? Math.floor(rawPoints / 10) : rawPoints;
        const isFresh = tenure <= 1;

        fielders.push({
            id: slot.playerId,
            pos: slot.position,
            slotIdx: idx,
            rawPoints: rawPoints, // 保留原始積分用於權重計算
            points,
            isTired,
            isFresh,
            tenure // 🆕 連續局數
        });
        fielderIds.add(slot.playerId);
    });

    // 處理投手調度 (預處理)
    // 投手更換視為強制事件，優先處理，產生初始空缺
    let openPositions = []; // 已經空出來的位置
    let leavingPlayers = []; // 確定離場的球員
    let nextCounts = { ...currentCounts }; // 複製計數狀態

    // 若指定更換投手
    if (newPitcherId && newPitcherId !== currentPitcherId) {
        // 原投手離場
        leavingPlayers.push(currentPitcherId);
        nextCounts[currentPitcherId] = (nextCounts[currentPitcherId] || 0) + 1;

        // 檢查新投手來源
        const fielderIndex = fielders.findIndex(f => f.id === newPitcherId);
        if (fielderIndex !== -1) {
            // 來源是場上野手 -> 該位置空出來
            const fielder = fielders[fielderIndex];
            openPositions.push(fielder.pos);
            // 從野手名單移除 (不參與後續的 N 人輪替計算)
            fielders.splice(fielderIndex, 1);
        }
        currentPitcherId = newPitcherId;
    }

    // 建立板凳名單 (Bench)
    // 分類：Unplayed (未上場), Subbed (已換下), Out (禁賽)
    const benchCandidates = allPlayers
        .filter(p =>
            p.willAttend &&
            p.id !== currentPitcherId &&
            !fielderIds.has(p.id) && // 原本就在場上的
            !leavingPlayers.includes(p.id) // 剛被換下的原投手
        )
        .map(p => {
            const count = currentCounts[p.id] || 0;
            const isOut = count >= 2;
            if (isOut) return null;

            const isUnplayed = count === 0;
            const effectivePoints = isUnplayed ? p.points : Math.floor(p.points / 10);

            return {
                ...p,
                isUnplayed,
                effectivePoints,
                startCount: count
            };
        })
        .filter(p => p !== null)
        // 預先排序優化搜尋：未上場 > 積分高
        .sort((a, b) => {
            if (a.isUnplayed !== b.isUnplayed) return b.isUnplayed ? 1 : -1;
            return b.effectivePoints - a.effectivePoints;
        });

    // --- 2. 搜尋最佳解 (Search Best Move) ---

    // 目標：移除 substituteCount - openPositions.length 個野手
    // 使得：得分最高 (Unplayed 進場 + 疲勞者退場 - 新人退場)

    const neededSlots = substituteCount;
    const slotsToFree = Math.max(0, neededSlots - openPositions.length);

    if (slotsToFree > fielders.length) {
        return { error: '場上野手不足以進行替換' };
    }

    // 產生所有可能的 "移除組合"
    // 因為 N 通常很小 (1~3)，C(9, 3) = 84，非常快
    const possibleRemovalIndices = getCombinations(fielders.length, slotsToFree);

    let bestMove = null;
    let maxScore = -Infinity;

    // 評分權重定義
    const SCORES = {
        UNPLAYED_IN: 5000,   // 讓未上場的人上場 (最重要)
        TENURE_WEIGHT: 500,  // 局數權重：每多一局，移除誘因 +500
        FRESH_PROTECT: -2000, // 新人保護 (扣分)
        REMOVE_POINTS_PENALTY: 1 // 積分懲罰 (盡量留高分)
    };

    possibleRemovalIndices.forEach(indicesToRemove => {
        // 1. 建立此 move 的情境
        const removedFielders = indicesToRemove.map(i => fielders[i]);
        const stayingFielders = fielders.filter((_, i) => !indicesToRemove.includes(i));

        // 計算 "移除成本" 分數
        let moveScore = 0;

        removedFielders.forEach(f => {
            // 規則：越資深越該走
            // Tenure=1: +500
            // Tenure=4: +2000
            moveScore += f.tenure * SCORES.TENURE_WEIGHT;

            // 規則：新人保護 (Tenure=1)
            // 雖然上面 +500，但這裡會扣 -2000 => 淨 -1500 (保護)
            if (f.tenure <= 1) {
                moveScore += SCORES.FRESH_PROTECT;
            }

            // 規則：保留強棒
            // 移除高分球員會扣分 (e.g. 100分 -> -100)
            moveScore -= f.rawPoints * SCORES.REMOVE_POINTS_PENALTY;
        });

        // 2. 嘗試填補空缺 (Matching)
        const positionsToFill = [...openPositions, ...removedFielders.map(f => f.pos)];

        // 在 Bench 中尋找能填補這些位置的最佳組合
        // 這是一個 Maximum Weight Matching 問題
        // 使用回溯法 (Backtracking) 尋找最高分的填補方案
        const fillResult = findBestFill(benchCandidates, positionsToFill);

        if (fillResult.success) {
            // 加上填補方案的分數
            moveScore += fillResult.score;

            // 比較是否為最佳解
            if (moveScore > maxScore) {
                maxScore = moveScore;
                bestMove = {
                    removedFielders,
                    selectedCandidates: fillResult.assignment, // Map<Pos, Player>
                    finalOpenPositions: positionsToFill
                };
            }
        }
    });

    if (!bestMove) {
        return { error: '無法找到合適的替補組合。板凳球員無法填補空缺的守備位置。' };
    }

    // --- 3. 執行最佳解 ---

    // 更新計數 (移除者 +1)
    bestMove.removedFielders.forEach(f => {
        nextCounts[f.id] = (nextCounts[f.id] || 0) + 1;
    });

    // 建構下個輪替的 Tenure Map
    const nextTenure = {};

    // 1. 留在場上的野手 -> Tenure + 1
    fielders.forEach(f => {
        if (!bestMove.removedFielders.includes(f)) {
            nextTenure[f.id] = f.tenure + 1;
        }
    });

    // 2. 剛上場的野手 (Incoming) -> Tenure = 1
    Object.values(bestMove.selectedCandidates).forEach(player => {
        nextTenure[player.id] = 1;
    });

    // 3. 投手
    if (!newPitcherId || newPitcherId === lineup.P) {
        if (currentPitcherId) {
            const pTenure = currentTenure[currentPitcherId] || (tiredPlayers.has(currentPitcherId) ? 2 : 1);
            nextTenure[currentPitcherId] = pTenure + 1;
        }
    } else {
        nextTenure[newPitcherId] = 1;
    }

    // 為了相容性，同時產生 tiredPlayers (Tenure >= 2 的人)
    const newTiredPlayers = Object.entries(nextTenure)
        .filter(([_, t]) => t >= 2)
        .map(([id, _]) => id);


    // 建立新陣容
    const newBattingOrder = battingOrder.map(slot => {
        // 檢查是否被移除
        const removedFielder = bestMove.removedFielders.find(f => f.id === slot.playerId);
        if (removedFielder) {
            // 此位置由誰補?
            const filler = bestMove.selectedCandidates[removedFielder.pos];
            return { ...slot, playerId: filler.id };
        }

        // 檢查是否轉投手 (原位置誰補?)
        if (slot.playerId === newPitcherId) {
            const filler = bestMove.selectedCandidates[slot.position];
            if (filler) return { ...slot, playerId: filler.id };
        }

        return slot;
    });

    // 建立新的 Lineup Map
    const newLineup = { ...lineup };
    newLineup.P = currentPitcherId;
    Object.entries(bestMove.selectedCandidates).forEach(([pos, player]) => {
        newLineup[pos] = player.id;
    });

    return {
        lineup: newLineup,
        battingOrder: newBattingOrder,
        pitcherId: currentPitcherId,
        substitutionCounts: nextCounts,
        tiredPlayers: newTiredPlayers,
        fieldingTenure: nextTenure // 🆕 回傳新的局數狀態
    };
};

// --- 輔助函式 ---

// 產生 C(n, k) 組合索引
function getCombinations(totalItemCount, selectCount) {
    const results = [];
    function backtrack(start, combo) {
        if (combo.length === selectCount) {
            results.push([...combo]);
            return;
        }
        for (let i = start; i < totalItemCount; i++) {
            combo.push(i);
            backtrack(i + 1, combo);
            combo.pop();
        }
    }
    backtrack(0, []);
    return results;
}

// 尋找最佳填補方案 (Backtracking)
// positions: 需要填補的位置陣列 (例如 ['1B', 'SS'])
// candidates: 有資格的板凳球員 (已排序：Unplayed > High Point)
// 回傳: { success: bool, score: number, assignment: Map<Pos, Player> }
function findBestFill(candidates, positions) {
    let maxScore = -Infinity;
    let bestAssignment = null;
    const targetCount = positions.length;

    // 優化：剪枝 (若 candidates 不夠多直接失敗)
    if (candidates.length < targetCount) return { success: false };
    if (targetCount === 0) return { success: true, score: 0, assignment: {} };

    const usedIndices = new Set();
    const currentAssignment = {};

    function backtrack(posIdx, currentScore) {
        // Base Case: 所有位置都填滿了
        if (posIdx === targetCount) {
            if (currentScore > maxScore) {
                maxScore = currentScore;
                bestAssignment = { ...currentAssignment };
            }
            return;
        }

        const pos = positions[posIdx];

        // 嘗試從板凳中找人填此位置
        for (let i = 0; i < candidates.length; i++) {
            if (usedIndices.has(i)) continue;

            const player = candidates[i];
            const playable = [player.primaryPosition, ...(player.secondaryPositions || [])];

            if (pos === 'DH' || playable.includes(pos)) {
                // 選這個人
                usedIndices.add(i);
                currentAssignment[pos] = player;

                // 計算加分
                let addedScore = player.effectivePoints;
                if (player.isUnplayed) addedScore += 5000; // 超高權重：優先讓沒上過的人上

                // 遞迴
                backtrack(posIdx + 1, currentScore + addedScore);

                // 回溯
                delete currentAssignment[pos];
                usedIndices.delete(i);
            }
        }
    }

    backtrack(0, 0);

    if (bestAssignment) {
        return { success: true, score: maxScore, assignment: bestAssignment };
    }
    return { success: false };
}
