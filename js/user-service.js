/**
 * 使用者服務模組
 * 管理使用者身份與本地儲存
 */

export const USERS = ["建德", "智明", "昌慈", "俊廷", "冠榮", "訪客"];

const STORAGE_KEY = 'minerva_current_user';

/**
 * 設定當前使用者
 * @param {string} userName - 使用者名稱
 */
export function setCurrentUser(userName) {
  if (!USERS.includes(userName)) {
    console.warn(`未知的使用者: ${userName}`);
    return false;
  }
  localStorage.setItem(STORAGE_KEY, userName);
  console.log(`✅ 使用者已設定: ${userName}`);
  return true;
}

/**
 * 取得當前使用者
 * @returns {string|null} 使用者名稱
 */
export function getCurrentUser() {
  const user = localStorage.getItem(STORAGE_KEY);
  if (!user || !USERS.includes(user)) {
    console.warn('⚠️ 未找到有效使用者，請重新登入');
    return null;
  }
  return user;
}

/**
 * 清除當前使用者（登出）
 */
export function clearCurrentUser() {
  localStorage.removeItem(STORAGE_KEY);
  console.log('✅ 使用者已登出');
}

/**
 * 檢查是否已登入
 * @returns {boolean}
 */
export function isLoggedIn() {
  return getCurrentUser() !== null;
}

/**
 * 取得使用者顏色（用於 UI 顯示）
 * @param {string} userName 
 * @returns {string} Tailwind 顏色類別
 */
export function getUserColor(userName) {
  const colors = {
    '建德': 'blue',
    '智明': 'green',
    '昌慈': 'purple',
    '俊廷': 'orange',
    '冠榮': 'red',
    '訪客': 'gray'
  };
  return colors[userName] || 'gray';
}

/**
 * 取得使用者圖示
 * @param {string} userName 
 * @returns {string} Emoji
 */
export function getUserIcon(userName) {
  const icons = {
    '建德': '👨‍💼',
    '智明': '🧑‍🎓',
    '昌慈': '👨‍💻',
    '俊廷': '🧑‍🔬',
    '冠榮': '👨‍🏫',
    '訪客': '👤'
  };
  return icons[userName] || '👤';
}
