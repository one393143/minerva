# 極限棒球陣容大師 Pro Manager

**專業級棒球隊伍管理系統 | 戰術排陣 | 自動輪替 | 數據分析**

---

# 📘 上半部：使用者手冊 (User Manual)

## 🌟 最佳使用體驗流程 (Best Practice)

為了讓您能最快速、順暢地完成一場比賽的排陣工作，建議依照以下標準流程操作：

1.  **賽前準備 (Roster)**
    *   進入 **「球員名單」** 頁面。
    *   點擊 **「同步 Google Sheets 積分」** 確保所有球員積分為最新狀態。
    *   確認當日 **「出席狀態」** (可使用全選/全取消功能快速調整)。
    *   *Tip: 只有「出席」的球員才會出現在排陣候選名單中。*

2.  **先發佈局 (Field)**
    *   進入 **「守備配置」** 頁面。
    *   點擊右上角 **「自動排陣」**。
    *   設定先發投手 (SP) 與 指定打擊 (DH) 數量。
    *   選擇 **「積分優先」** (建議) 模式，系統將根據球員積分與守備適性自動填入最佳先發名單。
    *   手動微調特定位置 (點擊位置 -> 選擇球員)。

3.  **火力最大化 (Batting)**
    *   進入 **「打線編排」** 頁面。
    *   點擊 **「自動棒次」**。
    *   系統會依據 1-2 棒 (速度/上壘)、3-5 棒 (力量/長打)、6-9 棒 (打擊能力) 邏輯自動排序。
    *   確認 **「投手打擊」** 開關狀態。

4.  **局局輪替 (Rotation)**
    *   進入 **「輪替管理」** 頁面。
    *   點擊 **「新增下一局」** (複製上一局陣容)。
    *   點擊 **「自動輪替」** 按鈕。
    *   設定 **「替換人數」** (例如：3人) 與 **「新任投手」**。
    *   系統會根據 **「公平性原則」** (優先讓坐板凳最久者上場、保護剛上場者) 自動計算換人方案。

5.  **雲端存檔 (Save)**
    *   所有設定完成後，點擊 Header 的 **「上傳雲端」**。
    *   輸入陣容名稱 (如：1/6 冬盟 G3)，以利隊友查看或後續載入。

---

## 🛠️ 功能介紹 (Features)

### 1. 👥 球員名單 (Roster Page)
*   **球員管理**：新增、編輯、刪除球員資料。
*   **數據整合**：支援 Excel 匯入/匯出，以及 Google Sheets 積分同步。
*   **多維度能力**：每位球員擁有 8 項能力值 (打擊、力量、速度、守備等) 及主要/次要守備位置。
*   **狀態追蹤**：出席狀況開關、積分顯示。

### 2. 🏟️ 守備配置 (Field Page)
*   **視覺化球場**：直觀的棒球場地圖，清楚顯示各個守備位置。
*   **智能選人**：點擊位置時，系統會自動排序「最佳候選人」(依據守備位置適性 > 積分 > 能力值)。
*   **自動化引擎**：提供四種自動排陣模式，一鍵生成陣容。
*   **板凳區**：即時顯示未上場球員清單。

### 3. ⚾ 打線編排 (Batting Page)
*   **打擊順序**：拖曳或點擊按鈕調整棒次 (上移/下移)。
*   **靈活規則**：支援「投手打擊/不打擊」切換，DH (指定打擊) 自動納入打線。
*   **快速複製**：一鍵複製文字版打序，方便貼到 Line 群組公告。

### 4. 🔄 輪替管理 (Rotation Page)
*   **多局規劃**：可建立無限局數的輪替計畫 (第 1 局、第 2 局...)。
*   **公平演算法**：內建複雜的自動輪替建議，解決「誰該下場」、「誰該上場」的難題。
*   **詳細資訊**：顯示每局的更動摘要 (In/Out 資訊) 與疲勞度警示。

### 5. 📇 球員卡 (Card Page)
*   **視覺化展示**：生成精美的球員能力卡片，包含等級 (S~F) 與雷達圖。
*   **卡片分級**：根據綜合能力自動賦予卡片稀有度顏色 (紫卡、金卡、銀卡等)。

---

## ⚙️ 設定邏輯與演算法解密

為了讓使用者理解系統「為什麼這樣排」，以下公開核心邏輯：

### 1. 自動守備排陣 (Field Auto-Optimize)
系統依據不同模式給予球員權重分數 (Weight)：
*   **🎯 積分優先 (Points)**：最重視 `points` (平時貢獻/實力積分)。由高分者優先填入其主要位置，其次為次要位置。
*   **🛡️ 守備最佳化 (Defense)**：權重側重 `defense`, `accuracy`, `armStrength`, `speed`。確保場上防守滴水不漏。
*   **⚔️ 打擊最大化 (Offense)**：權重側重 `hitting`, `power`, `discipline`。無視守備漏洞，只求火力輸出。
*   **⚖️ 平衡模式 (Balanced)**：所有能力值平均加權。

### 2. 自動打線 (Batting Auto-Order)
系統將打線分為三個區段進行最佳化：
*   **前段棒次 (1-2棒)**：`Speed` (速度) + `Hitting` (打擊) 權重最高。目標是高上壘率與戰術執行力。
*   **中心棒次 (3-5棒)**：`Power` (力量) + `Hitting` (打擊) 權重最高。目標是清壘與長打能力。
*   **後段棒次 (6-9棒)**：依據剩餘球員的綜合打擊能力排序。

### 3. 自動輪替公平性 (Auto-Rotation Fairness)
這是本系統最核心且複雜的演算法，旨在達成「人人有球打」且「戰力不崩盤」：
*   **優先上場 (Priority In)**：目前在板凳區，且連續坐板凳局數 (Bench Streak) 最久的球員優先上場。
*   **優先下場 (Priority Out)**：
    *   場上連續出賽 (Fielding Streak) 最久的球員優先考慮下場。
    *   **保護機制**：剛上場不到 1 局的球員會有「保護期」，系統會極力避免將其換下。
*   **位置適性**：換人時，系統會嘗試尋找「最佳替補解」，意即 A 下場換 B 上場時，B 必須能守 A 的位置，或是透過 C 移防來達成連鎖調度。

---

# 💻 下半部：程式手冊 (Developer Manual)

## 🏗️ 系統架構 (Architecture)

本專案採用 **"Buildless" Modern Web Architecture**。
不使用 Webpack/Vite 等打包工具，直接利用瀏覽器原生的 **ES Modules (ESM)** 進行開發與運行。

### 技術堆疊
*   **核心框架**: React 18 (透過 CDN 引入 UMD/ESM)。
*   **UI 樣式**: Tailwind CSS (透過 CDN Runtime 或預編譯 CSS)。
*   **資料庫**: Firebase Firestore (NoSQL Cloud DB)。
*   **語言**: Vanilla JavaScript (ES6+)。
*   **架構模式**: Modular Monolith (模組化單體)。

### 目錄結構
```
js/
├── app.js                # [Controller] 應用程式入口，狀態管理 (State Management) 與 路由 (Ranking)。
├── pages/                # [Views] 各個主要頁面 (Field, Batting, Rotation...)，負責 UI 呈現。
├── services/             # [Model/Logic] 業務邏輯層。
│   ├── data-service.js   # Firebase CRUD 操作。
│   ├── lineup-service.js # 排陣與打線演算法。
│   ├── auto-rotation-service.js # 複雜的輪替公平性演算法。
│   └── google-sheets-service.js # 外部 API 整合。
├── components/           # [Components] 重用 UI 元件 (Card, Header, Modal)。
└── utils/                # [Utils] 工具函式。
```

## 🔗 模組串接原理

1.  **Entry Point (`index.html` & `app.js`)**:
    *   `index.html` 載入 React, Firebase SDK 與 `app.js`。
    *   `app.js` 使用 `ReactDOM.createRoot` 渲染，並透過 `useState` 管理全域狀態 (`players`, `lineup`, `rotations`)。

2.  **State Down, Action Up**:
    *   `App.js` 將狀態 (State) 作為 Props 向下傳遞給 `pages/`。
    *   `pages/` 觸發使用者行為時，呼叫 `App.js` 傳遞下來的 Callback (如 `handleSavePlayer`)。

3.  **Service Integration**:
    *   `App.js` 不包含複雜運算邏輯，而是呼叫 `services/` 中的純函式 (Pure Functions)。
    *   例如：按下「自動輪替」 -> `App.js` 呼叫 `auto-rotation-service.calculateAutoRotation(...)` -> 接收回傳結果 -> `setState` 更新畫面。

## ⚠️ 可能的漏洞與不足之處 (Limitations & Vulnerabilities)

### 1. 安全性 (Security)
*   **Firebase Rules**: 目前開發階段可能配置為 `allow read, write: if true;`。在正式上線前必須設定 Firestore Security Rules，限制只有授權的 User UID 可以寫入資料，否則任何人皆可竄改球員數據。
*   **API Keys**: Google Sheets API Key 若直接寫在前端程式碼中暴露，有配額被盜用的風險。建議透過 Firebase Functions (Backend Proxy) 呼叫。

### 2. 資料一致性 (Data Consistency)
*   **Race Conditions**: 由於沒有後端鎖 (Lock) 機制，若兩位管理員同時編輯「同一份陣容」並上傳，系統採用 **Last Write Wins** (最後上傳者覆蓋) 策略，可能導致前一人的修改遺失。
*   **Offline Mode**: 目前尚未完整實作 PWA 離線支援，網路斷線時無法進行排陣儲存。

### 3. 表演效能 (Performance)
*   **React Render**: 因為沒有使用編譯器 (JSX -> JS)，而是直接使用 `React.createElement`，雖然在現代瀏覽器效能尚可，但若球員數據量極大 (>500人)，可能會感受到 UI 渲染延遲。
*   **Global Layout Reflow**: 每次輪替計算涉及大量的排列組合搜尋 (Backtracking/Greedy Search)，在手機端運算時可能會造成短暫的 UI 卡頓 (Blocking Main Thread)。

### 4. 瀏覽器相容性
*   由於使用原生 ES Modules (`import ... from ...`)，不支援 IE 或過於老舊的瀏覽器。必須在支援 ES6+ 的環境下執行。
