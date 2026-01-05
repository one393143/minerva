/**
 * 資料服務模組
 * 路徑：js/services/data-service.js
 */

import { db } from '../config/firebase-config.js';
import { 
  doc, 
  getDoc, 
  setDoc, 
  collection, 
  query, 
  orderBy, 
  limit, 
  getDocs,
  deleteDoc,
  Timestamp 
} from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js';

export async function loadPlayers() {
  try {
    const docRef = doc(db, 'players', 'current');
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      const data = docSnap.data();
      console.log('✅ 球員名單已載入', data);
      return {
        data: data.data || [],
        lastUpdatedBy: data.lastUpdatedBy || '未知',
        lastUpdatedAt: data.lastUpdatedAt?.toDate() || new Date(),
        version: data.version || 0
      };
    } else {
      console.log('📝 尚無球員資料，返回空陣列');
      return {
        data: [],
        lastUpdatedBy: '系統',
        lastUpdatedAt: new Date(),
        version: 0
      };
    }
  } catch (error) {
    console.error('❌ 載入球員名單失敗:', error);
    throw error;
  }
}

export async function savePlayers(players, userId, currentVersion = 0) {
  try {
    const docRef = doc(db, 'players', 'current');
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      const cloudVersion = docSnap.data().version || 0;
      if (cloudVersion > currentVersion) {
        console.warn('⚠️ 雲端資料已更新，版本衝突');
        return false;
      }
    }
    
    await setDoc(docRef, {
      data: players,
      lastUpdatedBy: userId,
      lastUpdatedAt: Timestamp.now(),
      version: currentVersion + 1
    });
    
    console.log('✅ 球員名單已上傳', { by: userId, version: currentVersion + 1 });
    return true;
  } catch (error) {
    console.error('❌ 上傳球員名單失敗:', error);
    throw error;
  }
}

export async function loadLineups(limitCount = 50) {
  try {
    const lineupsRef = collection(db, 'lineups');
    const q = query(lineupsRef, orderBy('createdAt', 'desc'), limit(limitCount));
    const querySnapshot = await getDocs(q);
    
    const lineups = [];
    querySnapshot.forEach((doc) => {
      lineups.push({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate()
      });
    });
    
    console.log(`✅ 已載入 ${lineups.length} 筆陣容`);
    return lineups;
  } catch (error) {
    console.error('❌ 載入陣容列表失敗:', error);
    throw error;
  }
}

export async function saveLineup(lineupData, userId, name) {
  try {
    const timestamp = Date.now();
    const docId = `${timestamp}_${userId}`;
    const docRef = doc(db, 'lineups', docId);
    
    await setDoc(docRef, {
      name,
      createdBy: userId,
      createdAt: Timestamp.now(),
      lineup: lineupData.lineup || {},
      battingOrder: lineupData.battingOrder || [],
      rotations: lineupData.rotations || [],
      pitcherBats: lineupData.pitcherBats || false
    });
    
    console.log('✅ 陣容已上傳', { id: docId, name, by: userId });
    await cleanupOldLineups();
    return docId;
  } catch (error) {
    console.error('❌ 上傳陣容失敗:', error);
    throw error;
  }
}

async function cleanupOldLineups() {
  try {
    const lineupsRef = collection(db, 'lineups');
    const q = query(lineupsRef, orderBy('createdAt', 'desc'));
    const querySnapshot = await getDocs(q);
    
    const docs = [];
    querySnapshot.forEach((doc) => docs.push(doc));
    
    if (docs.length > 50) {
      const toDelete = docs.slice(50);
      for (const doc of toDelete) {
        await deleteDoc(doc.ref);
      }
      console.log(`🗑️ 已清理 ${toDelete.length} 筆舊陣容`);
    }
  } catch (error) {
    console.error('❌ 清理舊陣容失敗:', error);
  }
}

export async function loadLineup(lineupId) {
  try {
    const docRef = doc(db, 'lineups', lineupId);
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      const data = docSnap.data();
      console.log('✅ 陣容已載入', lineupId);
      return {
        id: docSnap.id,
        ...data,
        createdAt: data.createdAt?.toDate()
      };
    } else {
      throw new Error('陣容不存在');
    }
  } catch (error) {
    console.error('❌ 載入陣容失敗:', error);
    throw error;
  }
}
