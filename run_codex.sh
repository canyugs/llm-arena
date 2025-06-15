#! /bin/bash

## 前端
codex --approval-mode full-auto --full-stdout --project-doc ./AGENTS-frontend.md "$(cat prompt.txt)"
exit 0

echo "[$(date '+%Y-%m-%d %H:%M:%S')] $(codex --approval-mode full-auto --full-stdout --project-doc ./AGENTS-frontend.md "$(cat prompt.txt)")" >> "$(date '+%Y-%m-%d_%H-%M-%S').txt"

## 發送訊息到 Telegram

```bash
curl https://api.telegram.org/bot7727653899:AAGaW5PwYia06q7bjJdwdAetmYNnnLR2QQQ/getUpdates

{"ok":true,"result":[{"update_id":88489956,
"message":{"message_id":2,"from":{"id":226760773,"is_bot":false,"first_name":"Can","last_name":"Yu","username":"canyu","language_code":"zh-hans"},"chat":{"id":226760773,"first_name":"Can","last_name":"Yu","username":"canyu","type":"private"},"date":1749989908,"text":"hi"}}]}%  


curl -X POST https://api.telegram.org/bot7727653899:AAGaW5PwYia06q7bjJdwdAetmYNnnLR2QQQ/sendMessage \
  -d chat_id=226760773 \
  -d text="這是測試訊息 from curl"
```