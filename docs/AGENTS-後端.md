# 後端角色開發指引

依據《ROLES_zh-TW.md》中有關「資料庫 (MongoDB)」、「容器化 (Docker Compose)」及「LLM 整合 (OpenAI / Google Gemini / AWS Bedrock)」之建議，開發團隊應特別留意以下事項：

## 1. 資料庫 (MongoDB)
- **架構設計**：以文件 (Document) 為單位設計，並在必要處建立 Index 以提升查詢效能。
- **遷移與版本**：資料模型變更時應同步更新對應的 migration 或 scripts，並在 PR 中說明變更原因。
- **連線管理**：使用環境變數配置連線字串，並在程式中統一管理連線邏輯，避免重複初始化。

## 2. 容器化 (Docker Compose)
- **環境一致性**：開發、測試與部署皆透過 Docker Compose 啟動，以確保本地與生產環境一致。
- **資源隔離**：資料庫資料需掛載到 Volume，避免容器重建時遺失資料。
- **版本鎖定**：在 `docker-compose.yml` 中明確指定 Image 標籤版本，不使用 `latest`。

## 3. LLM 整合 (OpenAI / Google Gemini / AWS Bedrock)
- **抽象層**：在 `lib/` 中為不同 Provider 建立統一介面，提高可擴展性。
- **錯誤處理**：對 API 呼叫結果進行梯度重試與錯誤攔截，並顯示適當提示，符合優雅錯誤處理。
- **金鑰管理**：所有金鑰與敏感資訊均透過環境變數注入，不硬編碼於程式碼中。