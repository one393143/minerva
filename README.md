# 極限棒球陣容大師 Pro Manager

⚾ 專業棒球隊陣容管理系統

## 🎯 功能特色

### 1. 使用者系統
- 多使用者身份管理（建德、智明、昌慈、俊廷、冠榮）
- 個人化操作記錄
- 訪客模式

### 2. 球員管理
- 完整球員資料（8 項能力等級 S~F）
- 主要/次要守備位置設定
- 出席狀態管理
- 積分系統
- Excel 匯入/匯出

### 3. 陣容配置
- 視覺化守備位置配置
- 打線編排與最佳化
- 輪替陣容管理
- 投手打擊設定

### 4. 自動最佳化
- **積分優先模式**：高積分球員優先上場
- **守備最佳化**：強化防守陣容
- **打擊最大化**：強化進攻火力
- **平衡模式**：綜合能力平衡
- **打序最佳化**：智能安排打擊順序

### 5. 雲端同步
- Firebase Firestore 即時同步
- 球員名單手動上傳（防止衝突）
- 陣容配置版本管理
- 歷史記錄保留（最近 50 筆）

## 🏗️ 技術架構

### 前端
- **React 18** - UI 框架
- **Tailwind CSS** - 樣式框架
- **Babel Standalone** - JSX 轉譯

### 後端
- **Firebase Firestore** - 雲端資料庫
- **GitHub Pages** - 靜態網站託管

### 模組化設計
```
minerva/
├── index.html              # 使用者選擇頁面
├── app.html                # 主應用程式
├── css/
│   └── styles.css          # 全域樣式
├── js/
│   ├── firebase-config.js  # Firebase 配置
│   ├── user-service.js     # 使用者管理
│   ├── data-service.js     # 資料存取
│   ├── lineup-service.js   # 陣容邏輯
│   └── app.js              # 主程式
└── README.md
```

## 🚀 部署方式

### GitHub Pages
1. 推送程式碼到 GitHub
2. 進入 Repository Settings
3. Pages → Source → 選擇 `main` 分支
4. 儲存後等待部署完成

### 本地開發
```bash
# 使用任意 HTTP 伺服器
python -m http.server 8000
# 或
npx serve
```

## 📊 資料結構

### Firestore Collections

#### `players/current`
```javascript
{
  data: [
    {
      id: string,
      name: string,
      number: string,
      primaryPosition: string,
      secondaryPositions: string[],
      grades: {
        hitting: 'S'|'A'|'B'|'C'|'D'|'E'|'F',
        power: ...,
        // ... 8 項能力
      },
      willAttend: boolean,
      points: number
    }
  ],
  lastUpdatedBy: string,
  lastUpdatedAt: Timestamp,
  version: number
}
```

#### `lineups/{lineupId}`
```javascript
{
  name: string,
  createdBy: string,
  createdAt: Timestamp,
  lineup: { [position]: playerId },
  battingOrder: [{ playerId, position }],
  rotations: [...],
  pitcherBats: boolean
}
```

## 🎨 等級系統

### 能力等級顏色
- **S** 🟣 紫色 (頂級)
- **A** 🟡 金色 (優秀)
- **B** 🔵 銀藍色 (良好)
- **C** 🟠 銅色 (普通)
- **D** 🟢 綠色 (及格)
- **E** ⚪ 白色 (不足)
- **F** ⚪ 白色 (極差)

### 球員卡稀有度
- 平均 ≥ A → 紫卡
- 平均 ≥ B → 金卡
- 平均 ≥ C → 銀卡
- 平均 ≥ D → 灰卡
- 平均 < D → 白卡

## 👥 團隊成員

- **建德** 👨‍💼
- **智明** 🧑‍🎓
- **昌慈** 👨‍💻
- **俊廷** 🧑‍🔬
- **冠榮** 👨‍🏫

## 📝 更新日誌

### v2.0.0 (2026-01-05)
- ✅ 模組化架構重構
- ✅ 使用者系統
- ✅ 雲端同步優化
- ✅ 積分優先模式
- ✅ 陣容歷史管理

### v1.0.0 (2025-12-XX)
- ✅ 基礎功能實作
- ✅ 球員管理
- ✅ 陣容配置
- ✅ Firebase 整合

## 📄 授權

© 2026 minerva夢想家 - All Rights Reserved

---

**Powered by Firebase & React**
