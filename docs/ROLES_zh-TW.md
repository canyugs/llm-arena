# 各開發角色注意事項

本節依據《PROJECT_zh-TW.md》中定義的技術棧角色，並結合專案既有的 Git 工作流程、提交風格及軟體原則，列出開發過程中各領域角色需特別留意的事項。

技術棧角色：
- **前端**：Next.js (React)
- **樣式**：Tailwind CSS
- **資料庫**：MongoDB
- **容器化**：Docker Compose
- **LLM 整合**：OpenAI、Google Gemini、AWS Bedrock
- **UI 元件**：Radix UI 及自訂元件

---

## 1. 前端 (Next.js)

- **分支與提交**：使用 `feature/*` 分支開發，並遵循 Conventional Commits（`feat:`, `fix:`, …）合併 PR 至 `main`。
- **關注點分離**：將頁面與共用元件區分管理，核心邏輯應封裝於 Hooks (`hooks/`) 或 React Context (`contexts/`)，符合單一職責原則。
- **元件設計**：共用元件位於 `app/_components/`，確保 DRY，並依需求拆分子元件。

## 2. 樣式 (Tailwind CSS)

- **行動優先**：優先編寫響應式樣式，確保手機與桌面端呈現一致。
- **工具類使用**：盡量使用 Tailwind 原生工具類，減少撰寫額外 CSS，並保持樣式集中管理。
- **可維護性**：避免複雜的自訂 CSS，以變數或 Design Token 方式管理顏色和間距。

## 3. 資料庫 (MongoDB)

- **架構設計**：以文件 (Document) 為單位設計，並在必要處建立 Index 以提升查詢效能。
- **遷移與版本**：資料模型變更時應同步更新對應的 migration 或 scripts，並在 PR 中說明變更原因。
- **連線管理**：使用環境變數配置連線字串，並在程式中統一管理連線邏輯，避免重複初始化。

## 4. 容器化 (Docker Compose)

- **環境一致性**：開發、測試與部署皆透過 Docker Compose 啟動，以確保本地與生產環境一致。
- **資源隔離**：資料庫資料需掛載到 Volume，避免容器重建時遺失資料。
- **版本鎖定**：在 `docker-compose.yml` 中明確指定 Image 標籤版本，不使用 `latest`。

## 5. LLM 整合 (OpenAI / Google Gemini / AWS Bedrock)

- **抽象層**：在 `lib/` 中為不同 Provider 建立統一介面，提高可擴展性。
- **錯誤處理**：對 API 呼叫結果進行梯度重試與錯誤攔截，並顯示適當提示，符合優雅錯誤處理。
- **金鑰管理**：所有金鑰與敏感資訊均透過環境變數注入，不硬編碼於程式碼中。

## 6. UI 元件 (Radix UI + 自訂)

- **可存取性**：基於 Radix UI 原件實作時，務必遵循無障礙設計，包含鍵盤操作與 ARIA 屬性。
- **模組化**：將通用行為與樣式抽成自訂 UI 元件 (位於 `components/ui/`)，減少重複程式碼。
- **主題一致性**：自訂元件需支援全域主題 (Light / Dark)，與 Tailwind 主題變數同步。

---

> 更多專案開發指南請參考：
> - Git 工作流程 & 提交風格
> - 軟體原則 (關注點分離、單一職責、DRY、優雅錯誤處理與漸進增強)