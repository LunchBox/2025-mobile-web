# SQL 語言入門課程導覽頁

> 一頁式課程介紹網站，涵蓋智慧導覽、行事曆匯出、課程衝突檢查與 SQL 沙盒等互動功能，支援繁體中文／英文切換、深度無障礙體驗與響應式版面。

---

## 📑 目錄

1. [專案概要](#專案概要)  
2. [核心特色](#核心特色)  
3. [前置需求](#前置需求)  
4. [快速開始](#快速開始)  
5. [檔案結構](#檔案結構)  
6. [技術亮點與實作說明](#技術亮點與實作說明)  
7. [無障礙與設計考量](#無障礙與設計考量)  
8. [多語系管理](#多語系管理)  
9. [資料儲存與狀態維護](#資料儲存與狀態維護)  
10. [可自訂項目](#可自訂項目)  
11. [常見問題](#常見問題)  
12. [授權聲明](#授權聲明)

---

## 專案概要

此專案為「SQL 語言入門」課程的官方介紹頁，目標是幫助潛在學員在單一頁面中快速獲得所有報名前所需資訊，並透過互動式工具提升體驗。頁面同時提供多語系、自動化提醒、行事曆整合以及導覽 (guided tour) 功能。

---

## 核心特色

- **導覽模式 (Guided Tour)：** 以焦點框與說明面板，引導使用者快速了解關鍵區塊。
- **智慧日程工具：** 一鍵匯出 `.csi` 行事曆檔、輸入課程代碼檢查時間是否撞期。
- **SQL 線上沙盒：** 支援示範查詢的模擬執行與結果呈現。
- **LinkedIn 分享草稿生成器：** 產生可直接貼上的學習成果文案，支援複製/重新生成。
- **收藏與候補提醒：** 使用本地儲存記錄收藏狀態、候補通知設定。
- **多語系切換：** 提供繁體中文與英文介面，即時切換所有文案。
- **響應式設計：** 手機、平板、桌面皆有最佳化版面。

---

## 前置需求

- 現代瀏覽器（Chrome、Edge、Safari、Firefox 最新版）  
- 若需測試剪貼簿複製功能，請使用 HTTPS 或本機 `localhost` 環境  
- 無需額外建置工具或框架

---

## 快速開始

1. 下載或複製 `index.html` 至本機。
2. 直接以瀏覽器開啟檔案即可使用全部功能。
3. 選用：
   - 若要自訂內容，請參考 [可自訂項目](#可自訂項目)。
   - 使用 `Live Server` 或任何靜態伺服器可獲得更佳體驗。

---

## 檔案結構

project-root/
└── index.html # 完整單頁程式

> 本專案為純前端單檔案，所有 CSS 與 JavaScript 皆嵌入於 `index.html` 中。

---

## 技術亮點與實作說明

### 1. 導覽焦點框偏移修正
- 移除 `transform: translate(-50%, -50%)`，改以元素之實際 `getBoundingClientRect()` 計算。
- 加入 `border` 考量並保留原元素圓角 (`borderRadius`)。
- 同步監聽 `resize` 與 `scroll`，確保焦點框在響應式排版下仍準確貼合。

### 2. 響應式與排版優化
- 採用 `clamp()` 控制字體大小，自 320px 寬度起即可舒適瀏覽。
- 以 CSS Grid / Flex 交錯排版，並於 `<640px`、`≥640px`、`≥1024px` 三組斷點調整。
- Sticky 側欄保留於桌面尺寸，手機自動堆疊。

### 3. 智慧日程工具
- 利用內建 `courseSessions` 陣列與 `Date` 物件比對時間撞期。
- `.csi` 行事曆檔透過 Blob 動態生成與下載。

### 4. SQL 沙盒
- 以範例資料陣列模擬資料庫。
- 透過查詢字串正規化 (`normalizeQuery`) 比對允許的 demo 查詢。
- 支援多種結果格式（完整表格、欄位挑選、統計匯總）。

### 5. LinkedIn 文案生成
- 根據語系選擇不同模板，注入課程名稱／代碼等變數。
- 透過 `navigator.clipboard` 處理複製，並提供錯誤回饋與 Toast 提示。

---

## 無障礙與設計考量

- **ARIA 支援：** 導覽層 (`tour`) 以 `role="dialog"`、`aria-modal="true"` 提供螢幕閱讀器提示。
- **Keyboard Friendly：** 導覽可用方向鍵、Esc 操控；表單與按鈕具 `aria-pressed`、`aria-live` 等屬性。
- **顏色對比：** 主色調 (#f37b6a) 與文字顏色符合 WCAG AA 對比建議，另提供 hover/focus 狀態。
- **減少動態偏好：** 尊重 `prefers-reduced-motion`，於 CSS 中停用過度動畫。

---

## 多語系管理

- 所有文案集中於 `translations` 物件，支援 `zh`／`en`。
- HTML 元素使用 `data-i18n`、`data-i18n-list`、`data-i18n-placeholder` 控制文字與 placeholder。
- 切換語言時：
  - 重新渲染課程內容、清單、導覽步驟、Toast 等。
  - 更新 `document.title` 與 `<html lang="">`。

---

## 資料儲存與狀態維護

| 功能項目         | 儲存方式             | localStorage Key             |
|-----------------|----------------------|------------------------------|
| 收藏課程         | `localStorage`       | `sql_course_favorite`        |
| 候補提醒         | `localStorage`       | `sql_course_notify`          |
| 準備清單勾選狀態 | `localStorage` (JSON)| `sql_course_checklist`       |
| 導覽狀態         | 於記憶體維護         | `tourActive`, `currentTourIndex` |
| SQL 沙盒結果     | 於記憶體維護         | `lastSandboxResultType` 等    |

> 若需重置使用者狀態，可於瀏覽器開發者工具手動清除對應 `localStorage` key。

---

## 可自訂項目

1. **課程與行事曆資料**  
   - 修改 `courseSessions`、`translations.*.courseName` 等常數即可。
   - 行事曆匯出為 `.csi` 副檔名，可視需求改為 `.ics`。

2. **課程衝突資料庫**  
   - 調整 `otherCourses` 陣列即可新增或移除比對對象。

3. **SQL 沙盒**  
   - 更新 `sandboxMembers` 或擴充 `sandboxQueryHandlers` 以支援更多示範查詢。

4. **LinkedIn 模板**  
   - 修改 `milestoneTemplates` 陣列，支援自訂標籤與多版本文案。

5. **導覽步驟**  
   - 於 `tourStepsConfig` 新增或調整 `selector`、`titleKey`、`bodyKey`。

---

## 常見問題

### ❓ 為何導覽焦點框仍有偏差？
請確保目標元素在頁面中渲染完成，若是動態內容，需於導覽開始前確保 DOM 已更新。亦可在 `showTourStep` 中增加延遲。

### ❓ 剪貼簿複製失敗？
瀏覽器需在安全環境 (HTTPS 或 `localhost`) 方可自動複製，否則顯示提示文字請使用 `Ctrl/Cmd + C`。

### ❓ `.csi` 無法辨識？
大多日曆應用支援 `.ics`。若需提升相容性，可將副檔名及 MIME type 替換成 `.ics` / `text/calendar`.

---

## 授權聲明

- 本範例程式碼可自由用於學習或內部專案。  

---

✨ 如需進一步客製、整合 API 或串接後端資料庫，歡迎提出需求！