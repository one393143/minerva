# 極限棒球陣容大師 Pro Manager

⚾ 專業棒球隊陣容管理系統 - 完整模組化架構

## 🎯 功能特色

### 1. 使用者系統
- **多使用者身份管理**（建德、智明、昌慈、俊廷、冠榮）
- 個人化操作記錄與追蹤
- 訪客模式支援
- LocalStorage 持久化登入狀態

### 2. 球員管理
- **完整球員資料**
  - 8 項能力等級評分（S~F）
  - 主要/次要守備位置設定
  - 出席狀態管理
  - 積分系統（影響排陣優先度）
- **批次操作**
  - Excel 匯入/匯出
  - 全員出席/不出席切換
  - 批次刪除
- **手機友善介面**
  - 優化的編輯表單
  - 響應式設計
  - 滾動支援

### 3. 陣容配置

#### 守備配置 (Field)
- 視覺化棒球場地圖
- 拖拉式位置分配
- 10 個守備位置 + 3 個 DH 位置
- 即時板凳球員顯示

#### 打線編排 (Lineup)
- 自動生成打擊順序
- 手動調整打序（上移/下移）
- 投手打擊開關
- 一鍵複製打序

#### 輪替管理 (Rotation)
- 多局次陣容規劃
- 換人/換位置模擬
- 投手輪替管理
- 陣容複製與編輯

### 4. 自動最佳化引擎

#### 守備自動排陣
選擇先發投手和 DH 數量後，系統自動排列：

- **積分優先模式** 🎯
  - 高積分球員優先上場
  - 適合重要比賽

- **守備最佳化** 🛡️
  - 強化防守陣容
  - 優先考慮守備等級

- **打擊最大化** ⚔️
  - 強化進攻火力
  - 優先考慮打擊與力量

- **平衡模式** ⚖️
  - 綜合能力平衡
  - 考慮所有能力平均值

#### 打線自動最佳化
- **1-2 棒**：速度 + 打擊（上壘率）
- **3-5 棒**：力量 + 打擊（長打力）
- **6-9 棒**：打擊能力排序

### 5. 雲端同步 (Firebase Firestore)

#### 球員名單同步
- 手動上傳機制（防止衝突）
- 版本控制系統
- 強制覆蓋選項
- 即時重新載入

#### 陣容配置管理
- 自訂陣容名稱（含預設範例）
- 歷史記錄保留（最近 50 筆）
- 一鍵載入歷史陣容
- 自動清理舊記錄

## 🏗️ 技術架構

### 前端技術棧
- **React 18** - UI 框架（CDN）
- **Tailwind CSS** - 樣式框架
- **ES Modules** - 模組化架構
- **LocalStorage** - 本地資料持久化

### 後端服務
- **Firebase Firestore** - NoSQL 雲端資料庫
- **Firebase SDK 10.7.1** - 官方 JavaScript SDK
- **GitHub Pages** - 靜態網站託管

### 專案結構

```
minerva/
├── index.html                          # 使用者登入頁面
├── app.html                            # 主應用框架
├── css/
│   └── styles.css                      # 全域樣式與動畫
├── js/
│   ├── config/
│   │   └── firebase-config.js          # Firebase 配置
│   ├── services/                       # 業務邏輯層
│   │   ├── user-service.js             # 使用者管理
│   │   ├── data-service.js             # 資料同步
│   │   └── lineup-service.js           # 陣容演算法
│   ├── utils/                          # 工具函數
│   │   ├── constants.js                # 常數定義
│   │   ├── helpers.js                  # 輔助函數
│   │   └── excel-utils.js              # Excel 處理
│   ├── components/                     # UI 元件
│   │   ├── GradeBar.js                 # 能力條
│   │   ├── PlayerCard.js               # 球員卡片
│   │   ├── Header.js                   # 頁首
│   │   ├── Navigation.js               # 底部導航
│   │   └── Notification.js             # 通知訊息
│   ├── pages/                          # 頁面元件
│   │   ├── FieldPage.js                # 守備配置頁
│   │   ├── BattingPage.js              # 打線編排頁
│   │   ├── RotationPage.js             # 輪替管理頁
│   │   └── RosterPage.js               # 球員名單頁
│   ├── modals/                         # 彈窗元件
│   │   ├── PositionSelectModal.js      # 位置選擇
│   │   ├── PlayerEditModal.js          # 球員編輯
│   │   ├── LineupHistoryModal.js       # 陣容歷史
│   │   └── RotationEditModal.js        # 輪替編輯
│   └── app.js                          # 主程式入口
└── README.md                           # 專案說明文件
```

## 🚀 部署方式

### 方法 1: GitHub Pages（推薦）

1. **推送程式碼到 GitHub**
```bash
git add .
git commit -m "Deploy baseball lineup manager"
git push origin main
```

2. **啟用 GitHub Pages**
   - 進入 Repository Settings
   - Pages → Source → 選擇 `main` 分支
   - 儲存後等待部署完成（約 1-2 分鐘）

3. **訪問網站**
   ```
   https://[your-username].github.io/minerva/
   ```

### 方法 2: 本地開發

#### 使用 Python HTTP Server
```bash
cd minerva
python -m http.server 8000
# 開啟 http://localhost:8000/index.html
```

#### 使用 Node.js serve
```bash
npx serve minerva
# 開啟顯示的 URL
```

#### 使用 VS Code Live Server
1. 安裝 Live Server 擴充功能
2. 右鍵 `index.html`
3. 選擇 "Open with Live Server"

**⚠️ 重要提示：** 由於使用 ES Modules，**必須透過 HTTP Server 運行**，直接開啟 HTML 檔案會出現 CORS 錯誤。

## 📊 資料結構

### Firestore Collections

#### `players/current` - 球員名單
```javascript
{
  data: [
    {
      id: "uuid-string",              // 唯一識別碼
      name: "王電類",                  // 球員姓名
      number: "87",                    // 背號
      primaryPosition: "SS",           // 主要守備位置
      secondaryPositions: ["2B", "3B"], // 次要守備位置
      grades: {
        hitting: "A",      // 打擊
        power: "S",        // 力量
        discipline: "B",   // 選球
        speed: "A",        // 速度
        defense: "S",      // 守備
        accuracy: "A",     // 傳球準度
        armStrength: "B",  // 臂力
        iq: "A"            // 球商
      },
      willAttend: true,    // 出席狀態
      points: 87           // 積分
    }
    // ... more players
  ],
  lastUpdatedBy: "建德",              // 最後更新者
  lastUpdatedAt: Timestamp,           // 最後更新時間
  version: 5                          // 版本號（防衝突）
}
```

#### `lineups/{lineupId}` - 陣容配置
```javascript
{
  name: "1/4(日）冬盟G3 VS卡吐司",    // 陣容名稱
  createdBy: "建德",                  // 建立者
  createdAt: Timestamp,               // 建立時間
  lineup: {
    P: "player-id-1",
    C: "player-id-2",
    "1B": "player-id-3",
    // ... 其他位置
    DH1: "player-id-10",
    DH2: "player-id-11",
    DH3: "player-id-12"
  },
  battingOrder: [
    { playerId: "player-id-2", position: "C" },
    { playerId: "player-id-3", position: "1B" },
    // ... 打擊順序
  ],
  rotations: [
    {
      id: "rotation-id-1",
      name: "第1局",
      lineup: { /* ... */ },
      battingOrder: [ /* ... */ ]
    }
    // ... 更多輪替
  ],
  pitcherBats: false                  // 投手是否打擊
}
```

## 🎨 等級系統

### 能力等級與顏色

| 等級 | 顏色 | 說明 | 代表意義 |
|------|------|------|----------|
| **S** | 🟣 紫色 | 頂級 | 職業水準 |
| **A** | 🟡 金色 | 優秀 | 明星級 |
| **B** | 🔵 銀藍色 | 良好 | 先發水準 |
| **C** | 🟠 銅色 | 普通 | 平均水準 |
| **D** | 🟢 綠色 | 及格 | 替補水準 |
| **E** | ⚪ 白色 | 不足 | 需加強 |
| **F** | ⚪ 白色 | 極差 | 明顯弱點 |

### 球員卡稀有度（自動計算）

根據 8 項能力平均值：
- **平均 ≥ A** → 🟣 紫卡（傳奇）
- **平均 ≥ B** → 🟡 金卡（明星）
- **平均 ≥ C** → 🔵 銀卡（先發）
- **平均 ≥ D** → ⚫ 灰卡（替補）
- **平均 < D** → ⚪ 白卡（練習生）

## 👥 團隊成員

| 成員 | 圖示 | 角色 |
|------|------|------|
| **建德** | 👨‍💼 | 管理者 |
| **智明** | 🧑‍🎓 | 分析師 |
| **昌慈** | 👨‍💻 | 技術顧問 |
| **俊廷** | 🧑‍🔬 | 數據科學家 |
| **冠榮** | 👨‍🏫 | 教練 |

## 🔧 開發指南

### 新增功能模組

#### 1. 建立新元件
```javascript
// js/components/NewComponent.js
export const NewComponent = ({ prop1, prop2 }) => {
  return React.createElement('div', {
    className: 'your-classes'
  }, 'Content');
};
```

#### 2. 在 app.js 中匯入
```javascript
import { NewComponent } from './components/NewComponent.js';
```

#### 3. 在 Render 中使用
```javascript
React.createElement(NewComponent, {
  prop1: value1,
  prop2: value2
})
```

### 修改樣式

#### 全域樣式
編輯 `css/styles.css`
```css
.your-custom-class {
  /* CSS rules */
}
```

#### 元件樣式
使用 Tailwind CSS classes
```javascript
className: 'bg-slate-900 rounded-xl p-4'
```

### 新增 Firebase 功能

#### 1. 在 data-service.js 新增函數
```javascript
export async function yourNewFunction() {
  const docRef = doc(db, 'collection', 'document');
  // ... Firebase operations
}
```

#### 2. 在 app.js 中呼叫
```javascript
import { yourNewFunction } from './services/data-service.js';

const handleYourAction = async () => {
  await yourNewFunction();
};
```

## 📱 瀏覽器支援

| 瀏覽器 | 最低版本 | 狀態 |
|--------|----------|------|
| Chrome | 90+ | ✅ 完全支援 |
| Firefox | 88+ | ✅ 完全支援 |
| Safari | 14+ | ✅ 完全支援 |
| Edge | 90+ | ✅ 完全支援 |
| Mobile Safari | iOS 14+ | ✅ 完全支援 |
| Chrome Mobile | Android 90+ | ✅ 完全支援 |

## 🐛 故障排除

### 問題 1: 點擊使用者沒反應
**解決方案：**
1. 按 F12 開啟開發者工具
2. 檢查 Console 是否有錯誤
3. 確認 `js/services/user-service.js` 存在
4. 確認路徑正確

### 問題 2: 跳轉後白畫面
**解決方案：**
1. 檢查 Console 錯誤訊息
2. 確認所有模組檔案都已建立
3. 確認 Firebase 配置正確
4. 清除瀏覽器快取

### 問題 3: Firebase 連線失敗
**解決方案：**
1. 檢查網路連線
2. 確認 `js/config/firebase-config.js` 配置正確
3. 檢查 Firestore 安全規則：
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read, write: if true; // 開發環境
    }
  }
}
```

### 問題 4: Excel 匯入失敗
**解決方案：**
1. 確認 Excel 格式正確
2. 必須包含以下欄位：
   - 姓名 (name)
   - 背號 (number)
   - 主要守備位置 (primaryPosition)
3. 能力等級必須是 S/A/B/C/D/E/F

### 問題 5: 自動排陣沒反應
**解決方案：**
1. 確認至少有一位投手（主要或次要位置為 P）
2. 確認有足夠的出席球員
3. 檢查 Console 是否有錯誤訊息

## 📝 更新日誌

### v2.1.0 (2026-01-05) - 最佳化更新
- ✅ 優化球員編輯表單（手機友善）
- ✅ 自動排陣前選擇投手與 DH 數量
- ✅ 上傳陣容加入預設範例文字
- ✅ 修正投手預設位置 undefined 問題
- ✅ 投手不自動加入打擊順序（除非勾選）
- ✅ 改善 Modal 使用體驗

### v2.0.0 (2026-01-05) - 模組化重構
- ✅ 完整模組化架構重構
- ✅ 拆分 20+ 個獨立模組
- ✅ 使用者系統整合
- ✅ 雲端同步優化
- ✅ 積分優先模式
- ✅ 陣容歷史管理
- ✅ 大幅改善可維護性與擴充性

### v1.0.0 (2025-12-XX) - 初始版本
- ✅ 基礎功能實作
- ✅ 球員管理系統
- ✅ 陣容配置功能
- ✅ Firebase 整合

## 📄 授權

© 2026 極限棒球隊 - All Rights Reserved

本專案僅供極限棒球隊內部使用，未經授權不得複製、修改或散佈。

---

## 🔗 相關連結

- **GitHub Repository**: [your-repo-url]
- **Live Demo**: [your-github-pages-url]
- **Firebase Console**: [your-firebase-console-url]
- **技術支援**: 聯絡昌慈 👨‍💻

---

**Powered by Firebase & React** | **Made with ⚾ by 極限棒球隊**
