/**
 * Firebase 配置模組
 * 路徑：js/config/firebase-config.js
 */

import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js';
import { getFirestore } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js';

const firebaseConfig = {
  apiKey: "AIzaSyAwmH0zHsXFWP7Lt5RtSgbJCRljtMOwAL8",
  authDomain: "baseball-roster-manager-71b72.firebaseapp.com",
  projectId: "baseball-roster-manager-71b72",
  storageBucket: "baseball-roster-manager-71b72.firebasestorage.app",
  messagingSenderId: "423902203072",
  appId: "1:423902203072:web:a670744b7d08a53bcab125",
  measurementId: "G-XVBBJ63WQ2"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);

console.log('✅ Firebase 已初始化');
