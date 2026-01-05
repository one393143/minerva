/**
 * Firebase 配置模組
 * 初始化 Firebase 並匯出 Firestore 實例
 */

import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js';
import { getFirestore } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js';

// Firebase 配置
const firebaseConfig = {
  apiKey: "AIzaSyAwmH0zHsXFWP7Lt5RtSgbJCRljtMOwAL8",
  authDomain: "baseball-roster-manager-71b72.firebaseapp.com",
  projectId: "baseball-roster-manager-71b72",
  storageBucket: "baseball-roster-manager-71b72.firebasestorage.app",
  messagingSenderId: "423902203072",
  appId: "1:423902203072:web:a670744b7d08a53bcab125",
  measurementId: "G-XVBBJ63WQ2"
};

// 初始化 Firebase
const app = initializeApp(firebaseConfig);

// 初始化 Firestore
export const db = getFirestore(app);

console.log('✅ Firebase 已初始化');
