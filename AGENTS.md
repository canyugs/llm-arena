# llm-arena

use zh-TW

At very beginning of your task, please run the following command to send a notification to Telegram:

```bash
~/Documents/bin/messages/send_tg_message.sh '您好，主人，我已為您啟動 "{{one_line_summary_of_task}}" 工作!'
```

At end of your task, please run the following command to send a notification to Telegram:

```bash
~/Documents/bin/messages/send_tg_message.sh '您好，主人，我已完成 "{{one_line_summary_of_task}}" 工作!'
```

## Software Principles

- Separation of concerns (clear directory structure)
- Single responsibility (focused utilities and API routes)
- DRY (shared components, utilities, context providers)
- Graceful error handling and progressive enhancement

## Technology Stack

following Next.js best practice

- **Frontend**: Next.js 15.1.7 (React 19)
- **Styling**: Tailwind CSS
- **LLM Integrations**: OpenAI, Google Gemini, AWS Bedrock
- **UI Components**: Radix UI with custom components

## UI Implementation Details

- Built with Radix UI primitives and custom components (`/components/ui/`)
- Battle component: side-by-side chat + voting interface
- Home interface: search, hot topics, login
- Toast notifications for feedback
- Mobile-first responsive design via Tailwind CSS

## Git Workflow & Commit Style

- Branches: `main` for production, `feature/*` for in-progress work
- Conventional Commits (`feat:`, `fix:`, `refactor:`, etc.)
- Pull requests to merge features back into `main`

