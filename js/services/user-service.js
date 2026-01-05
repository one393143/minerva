/**
 * 使用者服務模組
 * 路徑：js/services/user-service.js
 */

export const USERS = ["建德", "智明", "昌慈", "俊廷", "冠榮", "訪客"];

const STORAGE_KEY = 'minerva_current_user';

export function setCurrentUser(userName) {
  if (!USERS.includes(userName)) {
    console.warn(`未知的使用者: ${userName}`);
    return false;
  }
  try {
    localStorage.setItem(STORAGE_KEY, userName);
    console.log(`✅ 使用者已設定: ${userName}`);
    return true;
  } catch (error) {
    console.error('❌ 設定使用者失敗:', error);
    return false;
  }
}

export function getCurrentUser() {
  try {
    const user = localStorage.getItem(STORAGE_KEY);
    if (!user || !USERS.includes(user)) {
      console.warn('⚠️ 未找到有效使用者');
      return null;
    }
    return user;
  } catch (error) {
    console.error('❌ 取得使用者失敗:', error);
    return null;
  }
}

export function clearCurrentUser() {
  try {
    localStorage.removeItem(STORAGE_KEY);
    console.log('✅ 使用者已登出');
  } catch (error) {
    console.error('❌ 登出失敗:', error);
  }
}

export function isLoggedIn() {
  return getCurrentUser() !== null;
}

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
