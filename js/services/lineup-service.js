/**
 * 陣容自動最佳化服務 - 完整修正版
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
 */
function getPositionFitScoreForDefense(player, position) {
  const defenseGrade = GRADE_VALUES[player.grades.defense];
  
  // 投手位置特殊處理
  if (position === 'P') {
    if (player.primaryPosition === 'P') return 300;
    if (player.secondaryPositions?.includes('P')) return 150;
    return 0; // 非投手完全不能守投手
  }
  
  // FE (游擊手替補) 特殊處理
  if (position === 'FE') {
    if (['SS', '2B', '3B'].includes(player.primaryPosition)) return 200;
    if (player.secondaryPositions?.some(p => ['SS', '2B', '3B'].includes(p))) return 100;
    if (defenseGrade >= 4) return 50; // 守備 C 以上可以守 FE
    return 10;
  }
  
  // DH 特殊處理
  if (position.startsWith('DH')) {
    return 50; // DH 不需要守備，給予基本分
  }
  
  // 一般位置：守備能力 C 以上可以守任何位置
  if (defenseGrade >= 4) {
    if (player.primaryPosition === position) return 300;
    if (player.secondaryPositions?.includes(position)) return 200;
    return 100; // 守備好的球員可以守任何位置
  } else {
    if (player.primaryPosition === position) return 300;
    if (player.secondaryPositions?.includes(position)) return 200;
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
    if (player.primaryPosition === 'P') return 300;
    if (player.secondaryPositions?.includes('P')) return 150;
    return 0; // 非投手完全不能守投手
  }
  
  // FE (游擊手替補) 特殊處理
  if (position === 'FE') {
    if (['SS', '2B', '3B'].includes(player.primaryPosition)) return 200;
    if (player.secondaryPositions?.some(p => ['SS', '2B', '3B'].includes(p))) return 100;
    if (defenseGrade >= 4) return 50; // 守備 C 以上可以守 FE
    return 10;
  }
  
  // DH 特殊處理
  if (position.startsWith('DH')) {
    return 300; // DH 最適合打擊好的球員
  }
  
  // 一般位置：守備能力 C 以上可以守任何位置
  if (defenseGrade >= 4) {
    if (player.primaryPosition === position) return 300;
    if (player.secondaryPositions?.includes(position)) return 200;
    return 100; // 守備好的球員可以守任何位置
  } else {
    if (player.primaryPosition === position) return 300;
    if (player.secondaryPositions?.includes(position)) return 200;
    return 0; // 守備差的球員不能亂守
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
 * 守備最佳化模式（修正版）
 */
export function autoOptimizeDefense(players, pitcherId, dhCount = 1) {
  console.log('🛡️ 守備最佳化開始');
  
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
    const fitScore = getPositionFitScoreForDefense(player, position);
    if (fitScore === 0) return 0;
    
    const defenseScore = getDefenseScore(player);
    
    // 守備能力權重 >> 位置適性權重
    return defenseScore * 100 + fitScore;
  };

  const lineup = hungarianAssignment(availablePlayers, positions, scoringFunction);
  
  // 顯示守備分析
  console.log('🛡️ 守備分析:');
  Object.entries(lineup).forEach(([pos, playerId]) => {
    const player = availablePlayers.find(p => p.id === playerId);
    if (player) {
      const defScore = getDefenseScore(player);
      const fitScore = getPositionFitScoreForDefense(player, pos);
      console.log(`${pos}: ${player.name} (守備:${defScore}, 適性:${fitScore}, 總分:${defScore * 100 + fitScore})`);
    }
  });
  
  console.log('🛡️ 守備最佳化完成');
  return lineup;
}

/**
 * 火力最大化模式（修正版）
 * 策略：打擊好的球員優先上場，但投手必須由使用者指定
 */
export function autoOptimizeOffense(players, pitcherId, dhCount = 1) {
  console.log('⚔️ 火力最大化開始');
  
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

  // 🆕 選出打擊前 N-1 名球員（扣除投手）
  let topHitters = availablePlayers
    .filter(p => p.id !== pitcherId)
    .sort((a, b) => {
      const scoreA = getOffenseScore(a);
      const scoreB = getOffenseScore(b);
      return scoreB - scoreA;
    })
    .slice(0, N - 1);

  console.log('🏆 打擊前 N-1 名球員:', topHitters.map(p => {
    const offScore = getOffenseScore(p);
    return `${p.name}(打擊:${offScore})`;
  }));

  let attempt = 0;
  let lineup = null;

  while (attempt < 5) {
    const candidates = [pitcher, ...topHitters];
    
    console.log(`🔄 第 ${attempt + 1} 次嘗試，候選球員:`, candidates.map(p => p.name));

    const scoringFunction = (player, position) => {
      const fitScore = getPositionFitScoreForOffense(player, position);
      if (fitScore === 0) return 0;
      
      const offenseScore = getOffenseScore(player);
      
      // 🔑 打擊能力權重 >> 位置適性權重
      return offenseScore * 100 + fitScore;
    };

    lineup = hungarianAssignment(candidates, positions, scoringFunction);

    const filledCount = Object.keys(lineup).length;
    console.log(`✅ 已填滿 ${filledCount}/${N} 個位置`);

    if (filledCount >= N - 1) {
      break;
    }

    // 遞補下一位打擊好的球員
    const nextHitter = availablePlayers
      .filter(p => p.id !== pitcherId && !topHitters.some(tp => tp.id === p.id))
      .sort((a, b) => {
        const scoreA = getOffenseScore(a);
        const scoreB = getOffenseScore(b);
        return scoreB - scoreA;
      })[0];

    if (!nextHitter) {
      console.warn('⚠️ 沒有更多球員可遞補');
      break;
    }

    console.log(`🔄 遞補球員: ${nextHitter.name}(打擊:${getOffenseScore(nextHitter)})`);
    topHitters[topHitters.length - 1] = nextHitter;
    attempt++;
  }

  // 顯示打擊分析
  console.log('⚔️ 打擊分析:');
  Object.entries(lineup).forEach(([pos, playerId]) => {
    const player = availablePlayers.find(p => p.id === playerId);
    if (player) {
      const offScore = getOffenseScore(player);
      const fitScore = getPositionFitScoreForOffense(player, pos);
      console.log(`${pos}: ${player.name} (打擊:${offScore}, 適性:${fitScore}, 總分:${offScore * 100 + fitScore})`);
    }
  });
  
  console.log('⚔️ 火力最大化完成');
  return lineup || { P: pitcherId };
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
