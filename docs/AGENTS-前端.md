# 前端角色開發指引

依據《ROLES_zh-TW.md》中有關「前端 (Next.js)」、「樣式 (Tailwind CSS)」及「UI 元件 (Radix UI + 自訂)」之建議，開發團隊應特別留意以下事項：

## 1. 前端 (Next.js)
- **分支與提交**：使用 `feature/*` 分支開發，並遵循 Conventional Commits（`feat:`, `fix:`, …）合併 PR 至 `main`。
- **關注點分離**：將頁面與共用元件區分管理，核心邏輯應封裝於 Hooks (`hooks/`) 或 React Context (`contexts/`)，符合單一職責原則。
- **元件設計**：共用元件位於 `app/_components/`，確保 DRY，並依需求拆分子元件。

## 2. 樣式 (Tailwind CSS)
- **行動優先**：優先編寫響應式樣式，確保手機與桌面端呈現一致。
- **工具類使用**：盡量使用 Tailwind 原生工具類，減少撰寫額外 CSS，並保持樣式集中管理。
- **可維護性**：避免複雜的自訂 CSS，以變數或 Design Token 方式管理顏色和間距。

## 3. UI 元件 (Radix UI + 自訂)
- **可存取性**：基於 Radix UI 原件實作時，務必遵循無障礙設計，包含鍵盤操作與 ARIA 屬性。
- **模組化**：將通用行為與樣式抽成自訂 UI 元件 (位於 `components/ui/`)，減少重複程式碼。
- **主題一致性**：自訂元件需支援全域主題 (Light / Dark)，與 Tailwind 主題變數同步。