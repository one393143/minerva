/**
 * 自動輪替服務
 * 處理覆雜的換人邏輯與守備位置媒合
 */

export const calculateAutoRotation = (
    currentRotation,
    allPlayers,
    config
) => {
    const {
        substituteCount, // 替換人數 (不含投手更換)
        newPitcherId,    // 指定新投手 ID (可為 null，表示不換投)
        protectPitcher   // 是否保護原投手不下場 (通常換下的投手就下場休息)
    } = config;

    // 1. 準備資料
    const lineup = { ...currentRotation.lineup };
    const battingOrder = [...currentRotation.battingOrder];
    const fieldPositionMap = {}; // 紀錄每個位置是誰
    let currentPitcherId = lineup.P;

    // 建立目前場上野手名單 (排除投手)
    let fielders = [];
    battingOrder.forEach((slot, idx) => {
        fielders.push({
            id: slot.playerId,
            pos: slot.position,
            slotIdx: idx,
            points: allPlayers.find(p => p.id === slot.playerId)?.points || 0
        });
        fieldPositionMap[slot.position] = slot.playerId;
    });

    // 2. 處理投手調度
    // 變數 state 用來追蹤場上狀況
    let openPositions = []; // 已經空出來的位置
    let leavingPlayers = []; // 確定離場的球員
    let incomingPlayers = []; // 確定上場的球員

    // 如果有指定新投手
    if (newPitcherId && newPitcherId !== currentPitcherId) {
        // 原投手離場 (預設邏輯)
        leavingPlayers.push(currentPitcherId);

        // 檢查新投手來源
        const fielderIndex = fielders.findIndex(f => f.id === newPitcherId);

        if (fielderIndex !== -1) {
            // 來源是場上野手 -> 該位置空出來
            const fielder = fielders[fielderIndex];
            openPositions.push(fielder.pos);
            // 從野手名單移除 (他轉去當投手了，位置空出來給人補)
            fielders.splice(fielderIndex, 1);
        } else {
            // 來源是板凳 -> 佔用一個上場名額? 
            // 邏輯定義：指定投手是獨立事件。
            // 新投手直接上投手丘，不影響原本的"N人輪替"計算，除非我們把換投也算在N內。
            // 根據需求："設定要一次替換幾個人... 另外設定是否換投" -> 兩者分開
        }

        // 更新陣容中的投手
        currentPitcherId = newPitcherId;
    }

    // 3. 挑選替補球員 (Incoming)
    const availableBench = allPlayers.filter(p =>
        p.willAttend &&
        p.id !== currentPitcherId && // 不含新投手
        !fielders.find(f => f.id === p.id) && // 不含場上野手
        !leavingPlayers.includes(p.id) // 不含已離場(原投手)
    );

    // 依積分排序
    const sortedBench = [...availableBench].sort((a, b) => b.points - a.points);

    // 取前 N 位
    const candidates = sortedBench.slice(0, substituteCount);

    // 4. 決定退場野手 (Outgoing) 與 配對
    // 這是最難的部分：我們要從 fielders 中挑選 substituteCount - openPositions.length 個人離場
    // 使得 openPositions + newOpenPositions 能夠被 candidates 完美填補

    const neededSlots = substituteCount; // 總共需要 N 個空位給 N 個替補
    const slotsToCreate = Math.max(0, neededSlots - openPositions.length); // 還需要透過移除野手製造多少空位

    if (slotsToCreate > fielders.length) {
        return { success: false, message: '場上野手不足以進行替換' };
    }

    // 將野手按積分由低到高排序，作為移除的優先順序
    const sortedFielders = [...fielders].sort((a, b) => a.points - b.points);

    // 4.1 遞迴尋找可行解 (Fallback Logic)
    // 我們需要從 sortedFielders 中移除 slotsToCreate 個人
    // 嘗試組合：從 "積分最低" 的組合開始嘗試

    // 產生所有移除組合 (Combinations)，優先順序為積分總和低者
    // 為簡化計算，若 slotsToCreate 很大，DFS 可能慢。但棒球野手僅 8-9 人，N通常 1-3，可接受。

    const findvalidSubstitution = () => {
        // 取得所有可能的移除組合 indices
        const indices = Array.from({ length: sortedFielders.length }, (_, i) => i);

        // 生成組合函式
        function* getCombinations(arr, k) {
            if (k === 0) { yield []; return; }
            if (arr.length === k) { yield arr; return; }

            const head = arr[0];
            const tail = arr.slice(1);

            for (const combo of getCombinations(tail, k - 1)) {
                yield [head, ...combo];
            }
            for (const combo of getCombinations(tail, k)) {
                yield combo;
            }
        }

        // 依序檢查每個組合
        for (const removeIndices of getCombinations(indices, slotsToCreate)) {
            // 取得被移除的野手及其位置
            const removedFielders = removeIndices.map(idx => sortedFielders[idx]);
            const currentOpenPositions = [...openPositions, ...removedFielders.map(f => f.pos)];

            // 檢查 candidates 是否能填補 currentOpenPositions
            // 這是一個二分圖匹配問題 (Bipartite Matching)，或簡單的回溯分配
            if (canFillPositions(candidates, currentOpenPositions)) {
                return { success: true, removedFielders, finalOpenPositions: currentOpenPositions };
            }
        }

        return { success: false };
    };

    // 檢查是否能填補的輔助函式 (Backtracking)
    const canFillPositions = (players, positions) => {
        if (players.length === 0 && positions.length === 0) return true;
        if (players.length !== positions.length) return false; // 理論上數量應一致

        const player = players[0];
        const remainingPlayers = players.slice(1);

        // 該球員能守的位置
        const playablePos = [player.primaryPosition, ...(player.secondaryPositions || [])];

        // 嘗試分配到任一符合的空缺
        for (let i = 0; i < positions.length; i++) {
            const pos = positions[i];
            // 檢查位置相符 (忽略大小寫與 DH)
            // 假設只有特定位置需嚴格匹配，DH 可任意? 不，DH 通常也算一個位置，但替補只有守備位置
            // 規則：如果空缺是 DH，任何人都可補? 還是必須看設定?
            // 假設：簡單起見，檢查 Primary/Secondary 是否包含該位置
            // 特殊：如果是外野 (LF, CF, RF) 且球員有 'OF'，或球員有特定位置

            if (isPositionMatch(player, pos)) {
                const remainingPositions = [...positions];
                remainingPositions.splice(i, 1);
                if (canFillPositions(remainingPlayers, remainingPositions)) return true;
            }
        }

        return false;
    };

    const isPositionMatch = (player, pos) => {
        if (pos === 'DH') return true; // 假設任何人都能打 DH
        const allPos = [player.primaryPosition, ...(player.secondaryPositions || [])];
        return allPos.includes(pos);
    };

    // 執行搜尋
    // 注意：candidates 數量必須等於 currentOpenPositions 數量
    // candidates 來自板凳，數量是 substituteCount
    // currentOpenPositions 數量是 openPositions(轉投手的野手位) + slotsToCreate
    // substituteCount = neededSlots
    // openPositions.length + slotsToCreate = openPositions.length + (neededSlots - openPositions.length) = neededSlots
    // 數量正確。

    const result = findvalidSubstitution();

    if (!result.success) {
        return {
            id: null,
            error: `無法找到合適的替補組合。前 ${substituteCount} 名板凳球員無法完全填補空缺的守備位置。`
        };
    }

    // 5. 建構新陣容
    // 此時我們有：
    // result.removedFielders: 被換下的野手
    // candidates: 上場的替補

    // 根據 canFillPositions 的邏輯，我們需要真正產生 "誰去哪個位置" 的 Map
    // 為了省事，我們可以再跑一次分配邏輯並回傳 Map，或直接由使用者手動調整? 
    // 不，需求是「自動輪替」，所以要自動填好。

    const positionAssignment = assignPositions(candidates, result.finalOpenPositions);

    // 構建新的 Batting Order
    const newBattingOrder = battingOrder.map(slot => {
        // 檢查此 slot 是否是被移除的野手
        const removedFielder = result.removedFielders.find(f => f.id === slot.playerId);
        if (removedFielder) {
            // 此位置被騰空了，需要找人填
            // 誰填這個位置 (removedFielder.pos)?
            const newPlayerId = positionAssignment[removedFielder.pos];
            const newPlayer = candidates.find(p => p.id === newPlayerId);

            return {
                ...slot,
                playerId: newPlayerId,
                // position 保持不變 (位置不動)
            };
        }

        // 檢查此 slot 是否是轉去當投手的野手
        // 若 newPitcherId 是野手，他在 battingOrder 裡，但他原本的 position 被歸在 openPositions 裡被填補了
        // 這裡要注意：如果野手轉投手，他的 battingOrder slot 應該變成 "P" 還是 保持原棒次但換人?
        // 通常：野手轉投 -> 他還在打線嗎? 
        // 若不設 DH，投手打擊 -> 該野手變成投手，棒次不變，position 變 P? 
        // 但上方邏輯是 "野手位置空出來"，代表該"守備位置"要給人補。
        // 該野手若變成 P，他原本的棒次 (slot) 應該是給 "補他原本守備位置的人" 還是 "他自己(P)"?
        // 邏輯：A守SS打第1棒。A轉P。
        // 狀況1：A繼續打第1棒(P)。SS空出來找B補，B打哪? B應該打A原本的棒次? 不對，這樣A就沒棒次了。
        // 狀況2：A轉P且退出打線(有DH)? 
        // 為簡化：假設替補邏輯是 "位置填補"。
        // A(SS) 轉 P。SS 位空出。B(SS) 替補上場。
        // 在打序中，原本 A 的格子 (第1棒 SS) 應該變成 B (第1棒 SS)。 A 則移動到投手欄 (P)。

        if (slot.playerId === newPitcherId) {
            // 這是轉去當投手的野手
            // 他的原始位置 slot.position 應該已經被填補了
            const fillerId = positionAssignment[slot.position];
            if (fillerId) {
                return {
                    ...slot,
                    playerId: fillerId,
                    // position 不變
                };
            }
        }

        return slot;
    });

    // 更新 Lineup Object
    const newLineup = { ...lineup };
    newLineup.P = currentPitcherId;

    // 更新野手位置
    Object.entries(positionAssignment).forEach(([pos, pid]) => {
        newLineup[pos] = pid;
    });

    return {
        lineup: newLineup,
        battingOrder: newBattingOrder,
        pitcherId: currentPitcherId
    };
};

// 簡單的分配實作 (Greedy/Backtracking 再次確認)
const assignPositions = (players, positions) => {
    const assignment = {};

    const solve = (pIdx, availablePos) => {
        if (pIdx === players.length) return true;

        const player = players[pIdx];
        const playable = [player.primaryPosition, ...(player.secondaryPositions || [])];

        for (let i = 0; i < availablePos.length; i++) {
            const pos = availablePos[i];
            if (pos === 'DH' || playable.includes(pos)) {
                // Try assign
                assignment[pos] = player.id;
                const nextPos = [...availablePos];
                nextPos.splice(i, 1);

                if (solve(pIdx + 1, nextPos)) return true;

                // Backtrack
                delete assignment[pos];
            }
        }
        return false;
    };

    solve(0, positions);
    return assignment;
};
