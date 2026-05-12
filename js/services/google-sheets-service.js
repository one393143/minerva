/**
 * Google Sheets 資料服務 - 修正版
 * 路徑：js/services/google-sheets-service.js
 */
const SHEET_CSV_URL = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vQC11i6DpV8cO-NoRHLsBXsb71TRjjVCX1t8JlAXky_RCDhTCBAUD2GAnpsAIyHT4SR9tiyfvBz1lPk/pub?gid=891092437&single=true&output=csv';

/**
 * 從 Google Sheets 讀取球員積分
 * @returns {Promise<Object>} { playerName: points }
 */
export async function fetchPlayerPointsFromGoogleSheets() {
  try {
    console.log('📊 正在從 Google Sheets 載入積分資料...');
    
    const response = await fetch(SHEET_CSV_URL);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const csvText = await response.text();
    const pointsMap = parseCSVToPoints(csvText);
    
    console.log('✅ 積分資料已載入', pointsMap);
    return pointsMap;
    
  } catch (error) {
    console.error('❌ 從 Google Sheets 載入失敗:', error);
    throw error;
  }
}

/**
 * 解析 CSV 並提取球員姓名與積分
 * 結構：
 *   第 1 行：個人資訊（略過）
 *   第 2 行：標題（名字 | ... | 總計 | ...）
 *   第 3 行起：球員資料
 * @param {string} csvText 
 * @returns {Object} { playerName: points }
 */
function parseCSVToPoints(csvText) {
  const lines = csvText.trim().split('\n');
  
  if (lines.length < 3) {
    throw new Error('試算表格式錯誤：資料行數不足');
  }
  
  // 第 2 行（index 1）是標題，自動找「總計」欄位的位置
  const headerCells = parseCSVLine(lines[1]);
  const totalIndex = headerCells.findIndex(cell => cell.trim() === '總計');
  
  if (totalIndex === -1) {
    console.error('標題行內容：', headerCells);
    throw new Error('找不到「總計」欄位，請確認 Google Sheets 標題列有「總計」這個字');
  }
  
  console.log(`📌 找到「總計」欄位：第 ${totalIndex + 1} 欄`);
  
  // 跳過前兩行（第1行=個人資訊, 第2行=標題）
  const dataLines = lines.slice(2);
  
  const pointsMap = {};
  
  dataLines.forEach((line, index) => {
    try {
      const cells = parseCSVLine(line);
      
      // 第 1 欄（index 0）是球員姓名
      const playerName = cells[0]?.trim();
      
      // 「總計」欄位的積分（支援小數點）
      const pointsStr = cells[totalIndex]?.trim();
      const points = parseFloat(pointsStr) || 0;
      
      if (playerName && playerName !== '') {
        pointsMap[playerName] = points;
        console.log(`  ✓ ${playerName}: ${points} 分`);
      }
    } catch (error) {
      console.warn(`⚠️ 第 ${index + 3} 行解析失敗:`, error.message);
    }
  });
  
  return pointsMap;
}

/**
 * 解析 CSV 單行（處理引號和逗號）
 * @param {string} line 
 * @returns {Array<string>}
 */
function parseCSVLine(line) {
  const result = [];
  let current = '';
  let inQuotes = false;
  
  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    
    if (char === '"') {
      if (inQuotes && line[i + 1] === '"') {
        current += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (char === ',' && !inQuotes) {
      result.push(current);
      current = '';
    } else {
      current += char;
    }
  }
  
  result.push(current);
  return result;
}

/**
 * 更新球員積分
 * @param {Array} players 現有球員陣列
 * @param {Object} pointsMap 積分對照表
 * @returns {Array} 更新後的球員陣列
 */
export function updatePlayersPoints(players, pointsMap) {
  let updatedCount = 0;
  let notFoundCount = 0;
  
  const updatedPlayers = players.map(player => {
    const points = pointsMap[player.name];
    
    if (points !== undefined) {
      updatedCount++;
      return { ...player, points };
    } else {
      notFoundCount++;
      console.warn(`⚠️ 找不到球員「${player.name}」的積分，設為 0`);
      return { ...player, points: 0 };
    }
  });
  
  console.log(`✅ 更新完成：${updatedCount} 位成功，${notFoundCount} 位未找到`);
  
  return updatedPlayers;
}
