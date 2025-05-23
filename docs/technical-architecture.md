# LLM Arena 技術架構文件

## 1. 專案概述

LLM Arena 是一個大型語言模型（LLM）競技場平台，允許使用者比較不同 AI 模型的回答質量。本專案是 [FreeSEED "Made In Taiwan" LLM](https://freeseed.ai) 計畫的一部分，旨在提供一個簡單的界面來測試和比較不同的聊天機器人模型。

## 2. 技術堆疊

### 2.1 前端技術
- **框架**: Next.js 15.1.7
- **UI 庫**: React 19
- **樣式**: Tailwind CSS
- **UI 元件**: Radix UI (包含 Avatar, Button, Separator, Toast 等元件)
- **狀態管理**: React Context API

### 2.2 後端技術
- **API 路由**: Next.js API Routes
- **資料庫**: MongoDB
- **認證**: JSON Web Token (JWT)

### 2.3 AI 整合
- **OpenAI API**: 用於與 ChatGPT 等 OpenAI 模型互動
- **AWS Bedrock**: 用於與 Amazon 的 AI 模型互動
- **Google Gemini API**: 用於與 Google 的 Gemini 模型互動

## 3. 系統架構

### 3.1 目錄結構
```
/llm-arena
├── app/                    # Next.js 應用程式目錄
│   ├── _components/        # 應用層級元件
│   ├── api/                # API 路由
│   │   ├── auth/           # 認證相關 API
│   │   ├── chat/           # 聊天相關 API
│   │   ├── submit/         # 提交評價相關 API
│   │   ├── submit-answer/  # 提交答案相關 API
│   │   └── user/           # 使用者相關 API
│   ├── contexts/           # React 上下文
│   ├── markdown/           # Markdown 內容
│   ├── privacy-policy/     # 隱私政策頁面
│   ├── providers/          # 提供者元件
│   └── terms-of-service/   # 服務條款頁面
├── components/             # 共用元件
│   ├── cards/              # 卡片相關元件
│   └── ui/                 # UI 元件庫
├── hooks/                  # 自定義 React Hooks
└── lib/                    # 工具函數和庫
```

### 3.2 核心元件
- **Battle.tsx**: 主要的競技場界面，顯示兩個模型的回答並允許使用者進行比較
- **CardsChat.tsx**: 顯示聊天訊息的卡片元件
- **UI 元件**: 基於 Radix UI 的自定義元件，如按鈕、輸入框、分隔線等

## 4. 資料流程

### 4.1 聊天流程
1. 使用者在 Battle 界面輸入問題
2. 前端將問題發送到 `/api/chat` 端點
3. 後端隨機選擇兩個 LLM 模型（如果是新對話）
4. 後端同時向兩個 LLM 模型發送請求
5. 使用 Stream API 將模型回答實時傳回前端
6. 前端顯示兩個模型的回答

### 4.2 評價流程
1. 使用者查看兩個模型的回答後，選擇評價（A 比較好、B 比較好、平手、都不好）
2. 評價結果通過 `/api/submit` 端點發送到後端
3. 後端將評價結果存儲到 MongoDB 中

### 4.3 使用者答案提交流程
1. 使用者可以選擇提供自己的正確答案
2. 答案通過 `/api/submit-answer` 端點發送到後端
3. 後端將使用者答案與對話記錄一起存儲

## 5. 資料模型

### 5.1 對話線程 (Thread)
```json
{
  "_id": "ObjectId",
  "userID": "ObjectId",
  "selectedModels": ["model1", "model2"],
  "model1Messages": [
    { "role": "user", "content": "問題內容" },
    { "role": "assistant", "content": "回答內容" }
  ],
  "model2Messages": [
    { "role": "user", "content": "問題內容" },
    { "role": "assistant", "content": "回答內容" }
  ],
  "result": "A_IS_BETTER | B_IS_BETTER | TIE | BOTH_BAD"
}
```

### 5.2 模型配置 (Model)
```json
{
  "model": "模型名稱",
  "baseURL": "API 基礎 URL",
  "apiKey": "API 金鑰"
}
```

## 6. API 端點

### 6.1 聊天 API
- **端點**: `/api/chat`
- **方法**: POST
- **請求體**: 
  ```json
  {
    "threadId": "對話線程 ID",
    "message": "使用者訊息"
  }
  ```
- **回應**: 流式回應，包含兩個模型的實時回答

#### 6.1.1 取得可用模型
```typescript
const getAvailableModels = async () => {
  const mongo = await getMongoClient();

  try {
    const models = mongo.db('arena').collection<{ model: string, baseURL: string, apiKey: string }>('models');
    const find = await models.find({}).toArray();

    return find;
  } catch (error) {
    throw new Error(`Failed to get available models: ${error}`);
  } finally {
    await mongo.close();
  }
}
```

#### 6.1.2 處理聊天請求
```typescript
export async function POST(request: NextRequest) {
  const { threadId, message } = await request.json();
  const cookies = request.cookies;

  const token = cookies.get('token')?.value;

  if (!token) {
    return new Response('Unauthorized', { status: 401 });
  }

  const userID = verifyToken(token);

  if (!userID) {
    return new Response('Unauthorized', { status: 401 });
  }
  
  // ... 後續處理邏輯
}
```

### 6.2 提交評價 API
- **端點**: `/api/submit`
- **方法**: POST
- **請求體**: 
  ```json
  {
    "threadID": "對話線程 ID",
    "result": "A_IS_BETTER | B_IS_BETTER | TIE | BOTH_BAD"
  }
  ```

### 6.3 提交使用者答案 API
- **端點**: `/api/submit-answer`
- **方法**: POST
- **請求體**: 
  ```json
  {
    "threadID": "對話線程 ID",
    "userAnswer": "使用者提供的答案"
  }
  ```

## 7. 安全性考量

### 7.1 認證
- 使用 JWT 進行使用者認證
- 使用 Discord OAuth 進行第三方登入

### 7.2 API 金鑰管理
- AI 服務的 API 金鑰存儲在伺服器端
- 使用環境變數進行配置

## 8. 部署資訊

- 專案部署在 [Zeabur](https://zeabur.com) 平台
- 使用 MongoDB 作為資料庫服務
- 本地開發使用 pnpm 作為套件管理工具

## 9. 擴展性考量

### 9.1 新增模型
- 在 MongoDB 的 models 集合中添加新模型配置
- 系統會自動將新模型納入隨機選擇池

### 9.2 自定義評價標準
- 可以擴展 result 字段以支持更多評價選項
- 可以添加更詳細的評價維度

## 10. 效能優化

- 使用流式回應 (Streaming) 提高使用者體驗
- 使用 Next.js 的 Turbopack 加速開發體驗
- 使用 React 19 的最新功能提升前端性能

## 11. 本地開發指南

### 11.1 環境設置
1. 建立 `.env` 檔案，包含必要的環境變數
2. 確保設置了 `OPENAI_API_KEY` 和 `GEMINI_API_KEY` 等必要的 API 金鑰

### 11.2 啟動開發伺服器
```bash
pnpm install
pnpm dev
```

### 11.3 訪問開發環境
開發伺服器啟動後，訪問 `http://localhost:3000` 開始開發

---

此文件提供了 LLM Arena 專案的技術架構概述，可作為開發者理解和擴展專案的參考。
