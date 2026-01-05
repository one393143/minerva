/**
 * 陣容自動最佳化服務 - 使用匈牙利演算法
 * 檔案位置: js/services/lineup-service.js
 */

import { ALL_POSITIONS, POSITION_OPTIONS } from '../utils/constants.js';

const GRADE_VALUES = { S: 7, A: 6, B: 5, C: 4, D: 3, E: 2, F: 1 };

/**
 * 計算球員在特定位置的適性分數
 */
function getPositionFitScore(player, position) {
  // 投手位置特殊處理
  if (position === 'P') {
    if (player.primaryPosition === 'P') return 1000;
    if (player.secondaryPositions?.includes('P')) return 500;
    return 0; // 非投手完全不能守投手
  }
  
  // FE (游擊手替補) 特殊處理
  if (position === 'FE') {
    if (['SS', '2B', '3B'].includes(player.primaryPosition)) return 800;
    if (player.secondaryPositions?.some(p => ['SS', '2B', '3B'].includes(p))) return 400;
    return 100; // 任何人都可以當 FE，但內野手優先
  }
  
  // DH 特殊處理
  if (position.startsWith('DH')) {
    if (player.secondaryPositions?.includes('DH')) return 300;
    return 100; // 任何人都可以當 DH
  }
  
  // 一般位置
  if (player.primaryPosition === position) return 1000;
  if (player.secondaryPositions?.includes(position)) return 300;
  
  return 0; // 完全不適合
}

/**
 * 匈牙利演算法核心函數
 * @param {Array} players - 球員陣列
 * @param {Array} positions - 位置陣列
 * @param {Function} scoringFunction - 評分函數 (player, position) => score
 * @returns {Object} lineup - { position: playerId }
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
        row.push(0); // 虛擬球員或虛擬位置
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
    
    // 跳過虛擬配對
    if (!player || !position) continue;
    
    const score = scoreMatrix[playerIdx][posIdx];
    
    // 跳過分數為 0 的配對（完全不適合）
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
 * 策略：前 N 名積分最高的球員必須上場（N = 場上位置數）
 */
export function autoOptimizeByPoints(players, pitcherId, dhCount = 1) {
  console.log('🎯 積分優先排陣開始');
  
  const availablePlayers = players.filter(p => p.willAttend);
  const pitcher = availablePlayers.find(p => p.id === pitcherId);
  
  if (!pitcher) {
    console.error('❌ 找不到指定的投手');
    return { P: pitcherId };
  }

  // 計算需要的位置
  const positions = ['P', 'C', '1B', '2B', '3B', 'SS', 'LF', 'CF', 'RF', 'FE'];
  for (let i = 1; i <= dhCount; i++) {
    positions.push(`DH${i}`);
  }
  const N = positions.length;

  console.log(`📍 需要填滿 ${N} 個位置:`, positions);

  // 選出積分前 N-1 名球員（扣除投手）
  let topPlayers = availablePlayers
    .filter(p => p.id !== pitcherId)
    .sort((a, b) => b.points - a.points)
    .slice(0, N - 1);

  console.log('🏆 積分前 N-1 名球員:', topPlayers.map(p => `${p.name}(${p.points})`));

  // 嘗試最多 5 次遞補
  let attempt = 0;
  let lineup = null;

  while (attempt < 5) {
    const candidates = [pitcher, ...topPlayers];
    
    console.log(`🔄 第 ${attempt + 1} 次嘗試，候選球員:`, candidates.map(p => p.name));

    // 評分函數：位置適性 >> 積分
    const scoringFunction = (player, position) => {
      const fitScore = getPositionFitScore(player, position);
      if (fitScore === 0) return 0;
      
      return fitScore * 1000 + player.points;
    };

    lineup = hungarianAssignment(candidates, positions, scoringFunction);

    // 檢查是否成功填滿所有位置
    const filledCount = Object.keys(lineup).length;
    console.log(`✅ 已填滿 ${filledCount}/${N} 個位置`);

    if (filledCount >= N - 1) {
      // 允許最多 1 個位置空缺
      break;
    }

    // 遞補下一位球員
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
 * 守備最佳化模式
 * 策略：每個位置選守備能力最強的球員
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

  // 評分函數：位置適性 >> 守備能力
  const scoringFunction = (player, position) => {
    const fitScore = getPositionFitScore(player, position);
    if (fitScore === 0) return 0;
    
    const defenseScore = 
      GRADE_VALUES[player.grades.defense] * 3 +
      GRADE_VALUES[player.grades.accuracy] * 2 +
      GRADE_VALUES[player.grades.armStrength] * 2 +
      GRADE_VALUES[player.grades.iq] * 1;
    
    return fitScore * 1000 + defenseScore * 10;
  };

  const lineup = hungarianAssignment(availablePlayers, positions, scoringFunction);
  
  console.log('🛡️ 守備最佳化完成');
  return lineup;
}

/**
 * 火力最大化模式
 * 策略：每個位置選打擊能力最強的球員（包含投手位置）
 */
export function autoOptimizeOffense(players, pitcherId, dhCount = 1) {
  console.log('⚔️ 火力最大化開始');
  
  const availablePlayers = players.filter(p => p.willAttend);

  const positions = ['P', 'C', '1B', '2B', '3B', 'SS', 'LF', 'CF', 'RF', 'FE'];
  for (let i = 1; i <= dhCount; i++) {
    positions.push(`DH${i}`);
  }

  // 評分函數：位置適性 >> 打擊能力
  const scoringFunction = (player, position) => {
    const fitScore = getPositionFitScore(player, position);
    if (fitScore === 0) return 0;
    
    const offenseScore = 
      GRADE_VALUES[player.grades.hitting] * 3 +
      GRADE_VALUES[player.grades.power] * 3 +
      GRADE_VALUES[player.grades.discipline] * 2;
    
    return fitScore * 1000 + offenseScore * 10;
  };

  const lineup = hungarianAssignment(availablePlayers, positions, scoringFunction);
  
  console.log('⚔️ 火力最大化完成');
  return lineup;
}

/**
 * 平衡模式
 * 策略：綜合考慮所有能力 + 積分
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

  // 評分函數：位置適性 >> 綜合能力 >> 積分
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
 * 打序最佳化（維持原邏輯）
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
  
  // 1-2棒：速度 + 選球 + 打擊（上壘能力）
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
  
  // 3-5棒：力量 + 打擊（長打能力）
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
