/**
 * 陣容邏輯服務模組
 * 處理自動排陣演算法
 */

const ALL_POSITIONS = ['P', 'C', '1B', '2B', '3B', 'SS', 'LF', 'CF', 'RF', 'FE', 'DH1', 'DH2', 'DH3'];

/**
 * 積分優先模式自動排陣
 * @param {Array} players - 球員陣列
 * @returns {Object} lineup
 */
export function autoOptimizeByPoints(players) {
  const availablePlayers = players.filter(p => p.willAttend);
  
  // 按積分降序排列
  const sortedPlayers = [...availablePlayers].sort((a, b) => b.points - a.points);
  
  const newLineup = {};
  const assigned = new Set();
  
  for (const player of sortedPlayers) {
    if (assigned.has(player.id)) continue;
    
    // 1. 優先嘗試主要位置
    if (!newLineup[player.primaryPosition]) {
      newLineup[player.primaryPosition] = player.id;
      assigned.add(player.id);
      console.log(`✅ ${player.name} → ${player.primaryPosition} (主要位置)`);
      continue;
    }
    
    // 2. 嘗試次要位置
    let positionAssigned = false;
    
    for (const secondaryPos of (player.secondaryPositions || [])) {
      if (secondaryPos === 'DH') {
        // 處理 DH 的特殊情況
        const dhPos = ['DH1', 'DH2', 'DH3'].find(dh => !newLineup[dh]);
        if (dhPos) {
          newLineup[dhPos] = player.id;
          assigned.add(player.id);
          console.log(`✅ ${player.name} → ${dhPos} (次要位置: DH)`);
          positionAssigned = true;
          break;
        }
      } else if (!newLineup[secondaryPos]) {
        newLineup[secondaryPos] = player.id;
        assigned.add(player.id);
        console.log(`✅ ${player.name} → ${secondaryPos} (次要位置)`);
        positionAssigned = true;
        break;
      }
    }
    
    if (!positionAssigned) {
      console.log(`⚠️ ${player.name} 無可用位置`);
    }
  }
  
  console.log('🎯 積分優先排陣完成', newLineup);
  return newLineup;
}

/**
 * 守備最佳化模式
 * @param {Array} players - 球員陣列
 * @returns {Object} lineup
 */
export function autoOptimizeDefense(players) {
  const availablePlayers = players.filter(p => p.willAttend);
  const gradeValues = { S: 7, A: 6, B: 5, C: 4, D: 3, E: 2, F: 1 };
  
  const sortedPlayers = [...availablePlayers].sort((a, b) => {
    if (b.points !== a.points) return b.points - a.points;
    return gradeValues[b.grades.defense] - gradeValues[a.grades.defense];
  });
  
  const newLineup = {};
  const assigned = new Set();
  
  for (const pos of ALL_POSITIONS) {
    const candidate = sortedPlayers.find(p => {
      if (assigned.has(p.id)) return false;
      if (p.primaryPosition === pos) return true;
      if (p.secondaryPositions?.includes(pos)) return true;
      if (pos.match(/^DH/) && p.secondaryPositions?.includes('DH')) return true;
      return false;
    });
    
    if (candidate) {
      newLineup[pos] = candidate.id;
      assigned.add(candidate.id);
    }
  }
  
  console.log('🛡️ 守備最佳化完成', newLineup);
  return newLineup;
}

/**
 * 打擊最大化模式
 * @param {Array} players - 球員陣列
 * @returns {Object} lineup
 */
export function autoOptimizeOffense(players) {
  const availablePlayers = players.filter(p => p.willAttend);
  const gradeValues = { S: 7, A: 6, B: 5, C: 4, D: 3, E: 2, F: 1 };
  
  const sortedPlayers = [...availablePlayers].sort((a, b) => {
    if (b.points !== a.points) return b.points - a.points;
    const offenseA = gradeValues[a.grades.power] + gradeValues[a.grades.hitting];
    const offenseB = gradeValues[b.grades.power] + gradeValues[b.grades.hitting];
    return offenseB - offenseA;
  });
  
  const newLineup = {};
  const assigned = new Set();
  
  for (const pos of ALL_POSITIONS) {
    const candidate = sortedPlayers.find(p => {
      if (assigned.has(p.id)) return false;
      if (p.primaryPosition === pos) return true;
      if (p.secondaryPositions?.includes(pos)) return true;
      if (pos.match(/^DH/) && p.secondaryPositions?.includes('DH')) return true;
      return false;
    });
    
    if (candidate) {
      newLineup[pos] = candidate.id;
      assigned.add(candidate.id);
    }
  }
  
  console.log('⚔️ 打擊最大化完成', newLineup);
  return newLineup;
}

/**
 * 平衡模式
 * @param {Array} players - 球員陣列
 * @returns {Object} lineup
 */
export function autoOptimizeBalanced(players) {
  const availablePlayers = players.filter(p => p.willAttend);
  const gradeValues = { S: 7, A: 6, B: 5, C: 4, D: 3, E: 2, F: 1 };
  
  const sortedPlayers = [...availablePlayers].sort((a, b) => {
    if (b.points !== a.points) return b.points - a.points;
    const avgA = Object.values(a.grades).reduce((sum, g) => sum + gradeValues[g], 0) / 8;
    const avgB = Object.values(b.grades).reduce((sum, g) => sum + gradeValues[g], 0) / 8;
    return avgB - avgA;
  });
  
  const newLineup = {};
  const assigned = new Set();
  
  for (const pos of ALL_POSITIONS) {
    const candidate = sortedPlayers.find(p => {
      if (assigned.has(p.id)) return false;
      if (p.primaryPosition === pos) return true;
      if (p.secondaryPositions?.includes(pos)) return true;
      if (pos.match(/^DH/) && p.secondaryPositions?.includes('DH')) return true;
      return false;
    });
    
    if (candidate) {
      newLineup[pos] = candidate.id;
      assigned.add(candidate.id);
    }
  }
  
  console.log('⚖️ 平衡模式完成', newLineup);
  return newLineup;
}

/**
 * 自動最佳化打序
 * @param {Object} lineup - 守備配置
 * @param {Array} players - 球員陣列
 * @param {boolean} pitcherBats - 投手是否打擊
 * @returns {Array} battingOrder
 */
export function autoOptimizeBatting(lineup, players, pitcherBats) {
  const gradeValues = { S: 7, A: 6, B: 5, C: 4, D: 3, E: 2, F: 1 };
  
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
  
  // 1-2棒：速度 + 打擊
  pool.sort((a, b) => 
    (gradeValues[b.player.grades.speed] * 1.5 + gradeValues[b.player.grades.hitting] + b.player.points * 0.1) -
    (gradeValues[a.player.grades.speed] * 1.5 + gradeValues[a.player.grades.hitting] + a.player.points * 0.1)
  );
  for (let i = 0; i < 2 && pool.length > 0; i++) optimized.push(pool.shift());
  
  // 3-5棒：力量 + 打擊
  pool.sort((a, b) => 
    (gradeValues[b.player.grades.power] * 1.5 + gradeValues[b.player.grades.hitting] + b.player.points * 0.1) -
    (gradeValues[a.player.grades.power] * 1.5 + gradeValues[a.player.grades.hitting] + a.player.points * 0.1)
  );
  for (let i = 0; i < 3 && pool.length > 0; i++) optimized.push(pool.shift());
  
  // 6-9棒：打擊
  pool.sort((a, b) => 
    gradeValues[b.player.grades.hitting] + b.player.points * 0.1 -
    (gradeValues[a.player.grades.hitting] + a.player.points * 0.1)
  );
  optimized = [...optimized, ...pool];
  
  const battingOrder = optimized.map(item => ({
    playerId: item.player.id,
    position: item.pos
  }));
  
  console.log('⚡ 打序最佳化完成', battingOrder);
  return battingOrder;
}
