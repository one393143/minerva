/**
 * Google Sheets 資料服務 - 修正版
 * 路徑：js/services/google-sheets-service.js
 */

const SHEET_CSV_URL = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vQC11i6DpV8cO-NoRHLsBXsb71TRjjVCX1t8JlAXky_RCDhTCBAUD2GAnpsAIyHT4SR9tiyfvBz1lPk/pub?gid=1645476851&single=true&output=csv';

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
 * @param {string} csvText 
 * @returns {Object} { playerName: points }
 */
function parseCSVToPoints(csvText) {
  const lines = csvText.trim().split('\n');
  
  if (lines.length < 3) {
    throw new Error('試算表格式錯誤：資料行數不足');
  }
  
  // 跳過第一行（統整資訊）和第二行（標題）
  const dataLines = lines.slice(1);
  
  const pointsMap = {};
  
  dataLines.forEach((line, index) => {
    try {
      const cells = parseCSVLine(line);
      
      // 第三欄（index 2）是球員姓名
      const playerName = cells[1]?.trim();
      
      // 最後一欄是積分
      const pointsStr = cells[2]?.trim();
      const points = parseInt(pointsStr) || 0;
      
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
        // 處理雙引號轉義
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
      return { ...player, points: 0 };  // 🆕 修改：未找到設為 0
    }
  });
  
  console.log(`✅ 更新完成：${updatedCount} 位成功，${notFoundCount} 位未找到`);
  
  return updatedPlayers;
}
