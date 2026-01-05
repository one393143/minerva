/**
 * 陣容自動最佳化服務 - 守備最佳化完整修正版
 * 檔案位置: js/services/lineup-service.js
 */

import { ALL_POSITIONS, POSITION_OPTIONS } from '../utils/constants.js';

const GRADE_VALUES = { S: 7, A: 6, B: 5, C: 4, D: 3, E: 2, F: 1 };

/**
 * 計算球員的守備能力分數
 */
function getDefenseScore(player) {
  return (
    GRADE_VALUES[player.grades.defense] * 3 +
    GRADE_VALUES[player.grades.accuracy] * 2 +
    GRADE_VALUES[player.grades.armStrength] * 2 +
    GRADE_VALUES[player.grades.iq] * 1
  );
}

/**
 * 計算球員的打擊能力分數
 */
function getOffenseScore(player) {
  return (
    GRADE_VALUES[player.grades.hitting] * 3 +
    GRADE_VALUES[player.grades.power] * 3 +
    GRADE_VALUES[player.grades.discipline] * 2
  );
}

/**
 * 計算球員在特定位置的適性分數（守備模式專用）
 * 🔑 關鍵修正：守備 C 以上，主要/次要位置的適性差距縮小
 */
function getPositionFitScoreForDefense(player, position) {
  const defenseGrade = GRADE_VALUES[player.grades.defense];
  
  // 投手位置特殊處理
  if (position === 'P') {
    if (player.primaryPosition === 'P') return 100;
    if (player.secondaryPositions?.includes('P')) return 50;
    return 0; // 非投手完全不能守投手
  }
  
  // FE (游擊手替補) 特殊處理
  if (position === 'FE') {
    if (['SS', '2B', '3B'].includes(player.primaryPosition)) return 80;
    if (player.secondaryPositions?.some(p => ['SS', '2B', '3B'].includes(p))) return 60;
    if (defenseGrade >= 4) return 40; // 守備 C 以上可以守 FE
    return 10;
  }
  
  // 🚫 守備模式不應該有 DH
  if (position.startsWith('DH')) {
    return 0; // 守備模式中 DH 不參與評分
  }
  
  // 🔑 關鍵修正：守備 C 以上，位置適性差距縮小
  if (defenseGrade >= 4) {
    // 守備好的球員，主要/次要位置差距很小
    if (player.primaryPosition === position) return 100;
    if (player.secondaryPositions?.includes(position)) return 95; // 🔑 從 200 改成 95
    return 80; // 守備好的球員可以守任何位置
  } else {
    // 守備差的球員，只能守主要/次要位置
    if (player.primaryPosition === position) return 100;
    if (player.secondaryPositions?.includes(position)) return 80;
    return 0; // 守備差的球員不能亂守
  }
}

/**
 * 計算球員在特定位置的適性分數（打擊模式專用）
 */
function getPositionFitScoreForOffense(player, position) {
  const defenseGrade = GRADE_VALUES[player.grades.defense];
  
  // 投手位置特殊處理
  if (position === 'P') {
    if (player.primaryPosition === 'P') return 100;
    if (player.secondaryPositions?.includes('P')) return 50;
    return 0;
  }
  
  // FE (游擊手替補) 特殊處理
  if (position === 'FE') {
    if (['SS', '2B', '3B'].includes(player.primaryPosition)) return 80;
    if (player.secondaryPositions?.some(p => ['SS', '2B', '3B'].includes(p))) return 60;
    if (defenseGrade >= 4) return 40;
    return 10;
  }
  
  // DH 特殊處理
  if (position.startsWith('DH')) {
    return 100; // DH 最適合打擊好的球員
  }
  
  // 一般位置：守備能力 C 以上可以守任何位置
  if (defenseGrade >= 4) {
    if (player.primaryPosition === position) return 100;
    if (player.secondaryPositions?.includes(position)) return 95;
    return 80;
  } else {
    if (player.primaryPosition === position) return 100;
    if (player.secondaryPositions?.includes(position)) return 80;
    return 0;
  }
}

/**
 * 計算球員在特定位置的適性分數（一般模式）
 */
function getPositionFitScore(player, position) {
  // 投手位置特殊處理
  if (position === 'P') {
    if (player.primaryPosition === 'P') return 1000;
    if (player.secondaryPositions?.includes('P')) return 500;
    return 0;
  }
  
  // FE (游擊手替補) 特殊處理
  if (position === 'FE') {
    if (['SS', '2B', '3B'].includes(player.primaryPosition)) return 800;
    if (player.secondaryPositions?.some(p => ['SS', '2B', '3B'].includes(p))) return 400;
    return 100;
  }
  
  // DH 特殊處理
  if (position.startsWith('DH')) {
    if (player.secondaryPositions?.includes('DH')) return 300;
    return 100;
  }
  
  // 一般位置
  if (player.primaryPosition === position) return 1000;
  if (player.secondaryPositions?.includes(position)) return 300;
  
  return 0;
}

/**
 * 匈牙利演算法核心函數
 */
function hungarianAssignment(players, positions, scoringFunction) {
  if (players.length === 0 || positions.length === 0) {
    console.warn('⚠️ 球員或位置為空');
    return {};
  }

  const n = Math.max(players.length, positions.length);
  
  // 建立評分矩陣 (越大越好)
  const scoreMatrix = [];
  for (let i = 0; i < n; i++) {
    const row = [];
    for (let j = 0; j < n; j++) {
      const player = players[i];
      const position = positions[j];
      
      if (!player || !position) {
        row.push(0);
      } else {
        const score = scoringFunction(player, position);
        row.push(score);
      }
    }
    scoreMatrix.push(row);
  }

  // 轉換成成本矩陣 (越小越好)
  const maxScore = Math.max(...scoreMatrix.flat());
  const costMatrix = scoreMatrix.map(row => 
    row.map(score => maxScore - score)
  );

  console.log('📊 評分矩陣:', scoreMatrix);
  console.log('💰 成本矩陣:', costMatrix);

  // 執行匈牙利演算法
  const munkres = new Munkres();
  const assignments = munkres.compute(costMatrix);

  console.log('🔄 匈牙利演算法結果:', assignments);

  // 轉換成陣容物件
  const lineup = {};
  let totalScore = 0;

  for (const [playerIdx, posIdx] of assignments) {
    const player = players[playerIdx];
    const position = positions[posIdx];
    
    if (!player || !position) continue;
    
    const score = scoreMatrix[playerIdx][posIdx];
    
    if (score === 0) continue;
    
    lineup[position] = player.id;
    totalScore += score;
  }

  console.log('✅ 最終陣容:', lineup);
  console.log('📈 總分:', totalScore);

  return lineup;
}

/**
 * 積分優先模式
 */
export function autoOptimizeByPoints(players, pitcherId, dhCount = 1) {
  console.log('🎯 積分優先排陣開始');
  
  const availablePlayers = players.filter(p => p.willAttend);
  const pitcher = availablePlayers.find(p => p.id === pitcherId);
  
  if (!pitcher) {
    console.error('❌ 找不到指定的投手');
    return { P: pitcherId };
  }

  const positions = ['P', 'C', '1B', '2B', '3B', 'SS', 'LF', 'CF', 'RF', 'FE'];
  for (let i = 1; i <= dhCount; i++) {
    positions.push(`DH${i}`);
  }
  const N = positions.length;

  console.log(`📍 需要填滿 ${N} 個位置:`, positions);

  let topPlayers = availablePlayers
    .filter(p => p.id !== pitcherId)
    .sort((a, b) => b.points - a.points)
    .slice(0, N - 1);

  console.log('🏆 積分前 N-1 名球員:', topPlayers.map(p => `${p.name}(${p.points})`));

  let attempt = 0;
  let lineup = null;

  while (attempt < 5) {
    const candidates = [pitcher, ...topPlayers];
    
    console.log(`🔄 第 ${attempt + 1} 次嘗試，候選球員:`, candidates.map(p => p.name));

    const scoringFunction = (player, position) => {
      const fitScore = getPositionFitScore(player, position);
      if (fitScore === 0) return 0;
      
      return fitScore * 1000 + player.points;
    };

    lineup = hungarianAssignment(candidates, positions, scoringFunction);

    const filledCount = Object.keys(lineup).length;
    console.log(`✅ 已填滿 ${filledCount}/${N} 個位置`);

    if (filledCount >= N - 1) {
      break;
    }

    const nextPlayer = availablePlayers
      .filter(p => p.id !== pitcherId && !topPlayers.some(tp => tp.id === p.id))
      .sort((a, b) => b.points - a.points)[0];

    if (!nextPlayer) {
      console.warn('⚠️ 沒有更多球員可遞補');
      break;
    }

    console.log(`🔄 遞補球員: ${nextPlayer.name}(${nextPlayer.points})`);
    topPlayers[topPlayers.length - 1] = nextPlayer;
    attempt++;
  }

  console.log('🎯 積分優先排陣完成');
  return lineup || { P: pitcherId };
}

/**
 * 守備最佳化模式（完整修正版）
 * 🔑 策略：
 * 1. 先排守備位置（不含 DH）
 * 2. 剩下的球員中，選打擊好的去 DH
 * 3. 守備 C 以上，主要/次要位置適性差距極小
 */
export function autoOptimizeDefense(players, pitcherId, dhCount = 1) {
  console.log('🛡️ 守備最佳化開始（完整修正版）');
  
  const availablePlayers = players.filter(p => p.willAttend);
  const pitcher = availablePlayers.find(p => p.id === pitcherId);
  
  if (!pitcher) {
    console.error('❌ 找不到指定的投手');
    return { P: pitcherId };
  }

  // 🔑 步驟 1：先排守備位置（不含 DH）
  const defensePositions = ['P', 'C', '1B', '2B', '3B', 'SS', 'LF', 'CF', 'RF', 'FE'];
  
  console.log('🛡️ 步驟 1：排守備位置（不含 DH）');
  console.log('📍 守備位置:', defensePositions);

  const scoringFunction = (player, position) => {
    const fitScore = getPositionFitScoreForDefense(player, position);
    if (fitScore === 0) return 0;
    
    const defenseScore = getDefenseScore(player);
    
    // 🔑 守備能力權重 >>> 位置適性權重
    // 守備能力 * 1000，位置適性只是微調
    return defenseScore * 1000 + fitScore;
  };

  const defenseLineup = hungarianAssignment(availablePlayers, defensePositions, scoringFunction);
  
  // 顯示守備分析
  console.log('🛡️ 守備位置分析:');
  Object.entries(defenseLineup).forEach(([pos, playerId]) => {
    const player = availablePlayers.find(p => p.id === playerId);
    if (player) {
      const defScore = getDefenseScore(player);
      const fitScore = getPositionFitScoreForDefense(player, pos);
      console.log(`${pos}: ${player.name} (守備:${defScore}, 適性:${fitScore}, 總分:${defScore * 1000 + fitScore})`);
    }
  });

  // 🔑 步驟 2：剩下的球員中，選打擊好的去 DH
  if (dhCount > 0) {
    console.log(`\n🏏 步驟 2：選打擊好的球員去 DH (需要 ${dhCount} 個)`);
    
    const assignedPlayerIds = new Set(Object.values(defenseLineup));
    const remainingPlayers = availablePlayers.filter(p => !assignedPlayerIds.has(p.id));
    
    console.log('🏏 剩餘球員:', remainingPlayers.map(p => p.name));
    
    // 依照打擊能力排序
    const dhCandidates = remainingPlayers
      .sort((a, b) => {
        const offenseA = getOffenseScore(a);
        const offenseB = getOffenseScore(b);
        return offenseB - offenseA;
      })
      .slice(0, dhCount);
    
    console.log('🏏 DH 候選人（依打擊能力排序）:');
    dhCandidates.forEach((p, idx) => {
      const offScore = getOffenseScore(p);
      console.log(`DH${idx + 1}: ${p.name} (打擊:${offScore})`);
      defenseLineup[`DH${idx + 1}`] = p.id;
    });
  }
  
  console.log('\n🛡️ 守備最佳化完成');
  console.log('✅ 最終陣容:', defenseLineup);
  
  return defenseLineup;
}

/**
 * 火力最大化模式（修正版）
 * 策略：
 * 1. 先排守備位置（不含 DH）
 * 2. 剩下的球員中，選打擊好的去 DH
 * 3. 打擊能力 >>> 位置適性
 */
export function autoOptimizeOffense(players, pitcherId, dhCount = 1) {
  console.log('⚔️ 火力最大化開始');
  
  const availablePlayers = players.filter(p => p.willAttend);
  const pitcher = availablePlayers.find(p => p.id === pitcherId);
  
  if (!pitcher) {
    console.error('❌ 找不到指定的投手');
    return { P: pitcherId };
  }

  // 步驟 1：先排守備位置（不含 DH）
  const fieldPositions = ['P', 'C', '1B', '2B', '3B', 'SS', 'LF', 'CF', 'RF', 'FE'];
  
  console.log('⚔️ 步驟 1：排守備位置（不含 DH）');
  console.log('📍 守備位置:', fieldPositions);

  const scoringFunction = (player, position) => {
    const fitScore = getPositionFitScoreForOffense(player, position);
    if (fitScore === 0) return 0;
    
    const offenseScore = getOffenseScore(player);
    
    // 打擊能力權重 >>> 位置適性權重
    return offenseScore * 1000 + fitScore;
  };

  const offenseLineup = hungarianAssignment(availablePlayers, fieldPositions, scoringFunction);
  
  // 顯示打擊分析
  console.log('⚔️ 守備位置分析:');
  Object.entries(offenseLineup).forEach(([pos, playerId]) => {
    const player = availablePlayers.find(p => p.id === playerId);
    if (player) {
      const offScore = getOffenseScore(player);
      const fitScore = getPositionFitScoreForOffense(player, pos);
      console.log(`${pos}: ${player.name} (打擊:${offScore}, 適性:${fitScore}, 總分:${offScore * 1000 + fitScore})`);
    }
  });

  // 步驟 2：剩下的球員中，選打擊好的去 DH
  if (dhCount > 0) {
    console.log(`\n🏏 步驟 2：選打擊好的球員去 DH (需要 ${dhCount} 個)`);
    
    const assignedPlayerIds = new Set(Object.values(offenseLineup));
    const remainingPlayers = availablePlayers.filter(p => !assignedPlayerIds.has(p.id));
    
    console.log('🏏 剩餘球員:', remainingPlayers.map(p => p.name));
    
    const dhCandidates = remainingPlayers
      .sort((a, b) => {
        const offenseA = getOffenseScore(a);
        const offenseB = getOffenseScore(b);
        return offenseB - offenseA;
      })
      .slice(0, dhCount);
    
    console.log('🏏 DH 候選人（依打擊能力排序）:');
    dhCandidates.forEach((p, idx) => {
      const offScore = getOffenseScore(p);
      console.log(`DH${idx + 1}: ${p.name} (打擊:${offScore})`);
      offenseLineup[`DH${idx + 1}`] = p.id;
    });
  }
  
  console.log('\n⚔️ 火力最大化完成');
  console.log('✅ 最終陣容:', offenseLineup);
  
  return offenseLineup;
}

/**
 * 平衡模式
 */
export function autoOptimizeBalanced(players, pitcherId, dhCount = 1) {
  console.log('⚖️ 平衡模式開始');
  
  const availablePlayers = players.filter(p => p.willAttend);
  const pitcher = availablePlayers.find(p => p.id === pitcherId);
  
  if (!pitcher) {
    console.error('❌ 找不到指定的投手');
    return { P: pitcherId };
  }

  const positions = ['P', 'C', '1B', '2B', '3B', 'SS', 'LF', 'CF', 'RF', 'FE'];
  for (let i = 1; i <= dhCount; i++) {
    positions.push(`DH${i}`);
  }

  const scoringFunction = (player, position) => {
    const fitScore = getPositionFitScore(player, position);
    if (fitScore === 0) return 0;
    
    const allStats = Object.values(player.grades)
      .reduce((sum, grade) => sum + GRADE_VALUES[grade], 0);
    const avgScore = allStats / 8;
    
    return fitScore * 1000 + avgScore * 50 + player.points * 0.5;
  };

  const lineup = hungarianAssignment(availablePlayers, positions, scoringFunction);
  
  console.log('⚖️ 平衡模式完成');
  return lineup;
}

/**
 * 打序最佳化
 */
export function autoOptimizeBatting(lineup, players, pitcherBats) {
  console.log('⚡ 打序最佳化開始');
  
  const activeOnField = Object.entries(lineup)
    .filter(([pos, pid]) => pid && (pitcherBats || pos !== 'P'))
    .map(([pos, pid]) => ({
      pos,
      player: players.find(p => p.id === pid)
    }))
    .filter(x => x.player);
  
  if (activeOnField.length === 0) return [];
  
  let pool = [...activeOnField];
  let optimized = [];
  
  // 1-2棒：速度 + 選球 + 打擊
  pool.sort((a, b) => {
    const scoreA = 
      GRADE_VALUES[a.player.grades.speed] * 2 +
      GRADE_VALUES[a.player.grades.discipline] * 1.5 +
      GRADE_VALUES[a.player.grades.hitting] * 1 +
      a.player.points * 0.3;
    
    const scoreB = 
      GRADE_VALUES[b.player.grades.speed] * 2 +
      GRADE_VALUES[b.player.grades.discipline] * 1.5 +
      GRADE_VALUES[b.player.grades.hitting] * 1 +
      b.player.points * 0.3;
    
    return scoreB - scoreA;
  });
  for (let i = 0; i < 2 && pool.length > 0; i++) optimized.push(pool.shift());
  
  // 3-5棒：力量 + 打擊
  pool.sort((a, b) => {
    const scoreA = 
      GRADE_VALUES[a.player.grades.power] * 2 +
      GRADE_VALUES[a.player.grades.hitting] * 2 +
      GRADE_VALUES[a.player.grades.discipline] * 1 +
      a.player.points * 0.3;
    
    const scoreB = 
      GRADE_VALUES[b.player.grades.power] * 2 +
      GRADE_VALUES[b.player.grades.hitting] * 2 +
      GRADE_VALUES[b.player.grades.discipline] * 1 +
      b.player.points * 0.3;
    
    return scoreB - scoreA;
  });
  for (let i = 0; i < 3 && pool.length > 0; i++) optimized.push(pool.shift());
  
  // 6-9棒：打擊能力 + 積分
  pool.sort((a, b) => {
    const scoreA = 
      GRADE_VALUES[a.player.grades.hitting] * 2 +
      GRADE_VALUES[a.player.grades.power] * 1 +
      a.player.points * 0.3;
    
    const scoreB = 
      GRADE_VALUES[b.player.grades.hitting] * 2 +
      GRADE_VALUES[b.player.grades.power] * 1 +
      b.player.points * 0.3;
    
    return scoreB - scoreA;
  });
  optimized = [...optimized, ...pool];
  
  const battingOrder = optimized.map(item => ({
    playerId: item.player.id,
    position: item.pos
  }));
  
  console.log('⚡ 打序最佳化完成', battingOrder);
  return battingOrder;
}
