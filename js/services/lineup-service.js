/**
 * 陣容邏輯服務模組 - 支援投手與 DH 設定
 * 路徑：js/services/lineup-service.js
 */

const ALL_POSITIONS = ['P', 'C', '1B', '2B', '3B', 'SS', 'LF', 'CF', 'RF', 'FE'];

export function autoOptimizeByPoints(players, pitcherId, dhCount = 1) {
  const availablePlayers = players.filter(p => p.willAttend && p.id !== pitcherId);
  const sortedPlayers = [...availablePlayers].sort((a, b) => b.points - a.points);
  
  const newLineup = { P: pitcherId };
  const assigned = new Set([pitcherId]);
  
  // 先排守備位置
  for (const player of sortedPlayers) {
    if (assigned.has(player.id)) continue;
    
    if (!newLineup[player.primaryPosition] && ALL_POSITIONS.includes(player.primaryPosition)) {
      newLineup[player.primaryPosition] = player.id;
      assigned.add(player.id);
      continue;
    }
    
    let positionAssigned = false;
    for (const secondaryPos of (player.secondaryPositions || [])) {
      if (ALL_POSITIONS.includes(secondaryPos) && !newLineup[secondaryPos]) {
        newLineup[secondaryPos] = player.id;
        assigned.add(player.id);
        positionAssigned = true;
        break;
      }
    }
    
    if (positionAssigned) continue;
  }
  
  // 再排 DH
  const dhPositions = [];
  for (let i = 1; i <= dhCount; i++) {
    dhPositions.push(`DH${i}`);
  }
  
  for (const dhPos of dhPositions) {
    const candidate = sortedPlayers.find(p => !assigned.has(p.id));
    if (candidate) {
      newLineup[dhPos] = candidate.id;
      assigned.add(candidate.id);
    }
  }
  
  console.log('🎯 積分優先排陣完成', newLineup);
  return newLineup;
}

export function autoOptimizeDefense(players, pitcherId, dhCount = 1) {
  const availablePlayers = players.filter(p => p.willAttend && p.id !== pitcherId);
  const gradeValues = { S: 7, A: 6, B: 5, C: 4, D: 3, E: 2, F: 1 };
  
  const sortedPlayers = [...availablePlayers].sort((a, b) => {
    if (b.points !== a.points) return b.points - a.points;
    return gradeValues[b.grades.defense] - gradeValues[a.grades.defense];
  });
  
  const newLineup = { P: pitcherId };
  const assigned = new Set([pitcherId]);
  
  for (const pos of ALL_POSITIONS) {
    if (pos === 'P') continue;
    const candidate = sortedPlayers.find(p => {
      if (assigned.has(p.id)) return false;
      if (p.primaryPosition === pos) return true;
      if (p.secondaryPositions?.includes(pos)) return true;
      return false;
    });
    
    if (candidate) {
      newLineup[pos] = candidate.id;
      assigned.add(candidate.id);
    }
  }
  
  const dhPositions = [];
  for (let i = 1; i <= dhCount; i++) {
    dhPositions.push(`DH${i}`);
  }
  
  for (const dhPos of dhPositions) {
    const candidate = sortedPlayers.find(p => !assigned.has(p.id));
    if (candidate) {
      newLineup[dhPos] = candidate.id;
      assigned.add(candidate.id);
    }
  }
  
  console.log('🛡️ 守備最佳化完成', newLineup);
  return newLineup;
}

export function autoOptimizeOffense(players, pitcherId, dhCount = 1) {
  const availablePlayers = players.filter(p => p.willAttend && p.id !== pitcherId);
  const gradeValues = { S: 7, A: 6, B: 5, C: 4, D: 3, E: 2, F: 1 };
  
  const sortedPlayers = [...availablePlayers].sort((a, b) => {
    if (b.points !== a.points) return b.points - a.points;
    const offenseA = gradeValues[a.grades.power] + gradeValues[a.grades.hitting];
    const offenseB = gradeValues[b.grades.power] + gradeValues[b.grades.hitting];
    return offenseB - offenseA;
  });
  
  const newLineup = { P: pitcherId };
  const assigned = new Set([pitcherId]);
  
  for (const pos of ALL_POSITIONS) {
    if (pos === 'P') continue;
    const candidate = sortedPlayers.find(p => {
      if (assigned.has(p.id)) return false;
      if (p.primaryPosition === pos) return true;
      if (p.secondaryPositions?.includes(pos)) return true;
      return false;
    });
    
    if (candidate) {
      newLineup[pos] = candidate.id;
      assigned.add(candidate.id);
    }
  }
  
  const dhPositions = [];
  for (let i = 1; i <= dhCount; i++) {
    dhPositions.push(`DH${i}`);
  }
  
  for (const dhPos of dhPositions) {
    const candidate = sortedPlayers.find(p => !assigned.has(p.id));
    if (candidate) {
      newLineup[dhPos] = candidate.id;
      assigned.add(candidate.id);
    }
  }
  
  console.log('⚔️ 打擊最大化完成', newLineup);
  return newLineup;
}

export function autoOptimizeBalanced(players, pitcherId, dhCount = 1) {
  const availablePlayers = players.filter(p => p.willAttend && p.id !== pitcherId);
  const gradeValues = { S: 7, A: 6, B: 5, C: 4, D: 3, E: 2, F: 1 };
  
  const sortedPlayers = [...availablePlayers].sort((a, b) => {
    if (b.points !== a.points) return b.points - a.points;
    const avgA = Object.values(a.grades).reduce((sum, g) => sum + gradeValues[g], 0) / 8;
    const avgB = Object.values(b.grades).reduce((sum, g) => sum + gradeValues[g], 0) / 8;
    return avgB - avgA;
  });
  
  const newLineup = { P: pitcherId };
  const assigned = new Set([pitcherId]);
  
  for (const pos of ALL_POSITIONS) {
    if (pos === 'P') continue;
    const candidate = sortedPlayers.find(p => {
      if (assigned.has(p.id)) return false;
      if (p.primaryPosition === pos) return true;
      if (p.secondaryPositions?.includes(pos)) return true;
      return false;
    });
    
    if (candidate) {
      newLineup[pos] = candidate.id;
      assigned.add(candidate.id);
    }
  }
  
  const dhPositions = [];
  for (let i = 1; i <= dhCount; i++) {
    dhPositions.push(`DH${i}`);
  }
  
  for (const dhPos of dhPositions) {
    const candidate = sortedPlayers.find(p => !assigned.has(p.id));
    if (candidate) {
      newLineup[dhPos] = candidate.id;
      assigned.add(candidate.id);
    }
  }
  
  console.log('⚖️ 平衡模式完成', newLineup);
  return newLineup;
}

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
