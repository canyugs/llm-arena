## 繁體中文說明 (zh-TW)

### 專案概述

LLM Arena 是一個簡單的聊天機器人競技場，用於測試和比較不同的聊天機器人。本專案隸屬於 FreeSEED「Made In Taiwan」LLM 計畫。

### 技術棧

- **前端**：Next.js 15.1.7 (React 19)
- **樣式**：Tailwind CSS
- **資料庫**：MongoDB
- **容器化**：Docker Compose
- **LLM 整合**：OpenAI、Google Gemini、AWS Bedrock
- **UI 元件**：Radix UI 及自訂元件

### 專案結構

```text
llm-arena/
├── app/                    # Next.js 應用程式主要目錄
│   ├── _components/        # 共用元件
│   ├── api/                # API 路由 (auth、chat、submit、user)
│   ├── contexts/           # React Context
│   ├── daily-topic/        # 每日話題功能
│   ├── game/               # 遊戲功能 (開發中)
│   ├── markdown/           # 靜態/MD 內容
│   ├── page.tsx            # 主頁面
│   └── layout.tsx          # 應用程式佈局
├── components/             # UI 元件程式庫
├── hooks/                  # 自訂 React Hooks
├── lib/                    # 工具函式與函式庫
├── public/                 # 靜態資源
└── scripts/                # 腳本
```

### 核心功能

#### Chatbot Arena

使用者可以同時與兩個隨機挑選的 LLM 模型進行互動，並評價它們的回應。模型以匿名方式配對，確保公平比較。

#### 資料儲存格式

對話與評價結果儲存在 MongoDB 中。以下為典型的文件範例：

```json
{
  "_id": "...",
  "userID": "...",
  "selectedModels": ["chatgpt-4o-latest", "gemini-1.5-flash"],
  "model1Messages": [...],
  "model2Messages": [...],
  "result": "A_IS_BETTER"
}
```

#### 熱門話題

首頁會顯示可供使用者點擊以開始對話的熱門話題列表。

#### 遊戲功能 (開發中)

遊戲模式正在開發中，預計於 2025 年第三季推出。

### API 實作

#### Chat API

- 整合 OpenAI、Google Gemini 及 AWS Bedrock
- 支援串流回應以提供即時聊天體驗
- 隨機選擇兩個模型並儲存對話紀錄

### 本地開發與部署

**本地環境**：
```bash
pnpm install
pnpm dev
pnpm dev-db      # 使用 Docker Compose 啟動 MongoDB
pnpm clear-db    # 停止 DB 並刪除卷
```

**部署**：透過 Zeabur 一鍵部署，`main` 分支自動建置。

### 未來規劃

1. 推出遊戲功能 (2025 Q3)
2. 新增更多 LLM 提供者
3. 持續優化 UI/UX

### UI 實作細節

- 基於 Radix UI 原件與自訂元件 (`/components/ui/`)
- Battle 元件：並排聊天＋投票介面
- 首頁介面：搜尋、熱門話題、登入
- Toast 通知：系統反饋
- 行動優先響應式設計 (Tailwind CSS)

### Git 工作流程 & 提交風格

- 分支：`main` (生產), `feature/*` (開發中)
- 採用 Conventional Commits（`feat:`、`fix:`、`refactor:`…）
- 以 PR 合併回 `main`

### 軟體原則

- 關注點分離（目錄結構清晰）
- 單一職責（專注工具函式與 API 路由）
- DRY（共用元件、工具函式、Context 提供器）
- 優雅錯誤處理與漸進增強

### 部署詳情與環境設定

- Zeabur 自動偵測 Next.js，透過儀表板設定環境變數
- 環境變數：LLM API 金鑰、MongoDB 連線字串、認證設定
- 已提供 `.env.example` 作為本地開發範本

### 測試與 QA

- 手動測試：聊天串流、UI/UX、認證流程
- 計畫：Jest + React Testing Library、Cypress e2e、GitHub Actions CI

### TL;DR

- 使用 Next.js + Tailwind 的盲測 A/B LLM 對比 Web 應用
- 主要目錄：`/app`、`/components`、`/hooks`、`/lib`
- 本地啟動：`pnpm dev` + `pnpm dev-db`