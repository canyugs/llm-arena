# AGENTS

This file contains a high-level overview of the **llm-arena** (Chatbot Arena) codebase.

## Project Overview

LLM Arena is a simple chatbot arena for testing and comparing different chatbots. This project is part of the FreeSEED "Made In Taiwan" LLM project.

## Technology Stack

- **Frontend**: Next.js 15.1.7 (React 19)
- **Styling**: Tailwind CSS
- **Database**: MongoDB
- **Containerization**: Docker Compose
- **LLM Integrations**: OpenAI, Google Gemini, AWS Bedrock
- **UI Components**: Radix UI with custom components

## Project Structure

```text
llm-arena/
├── app/                    # Next.js application main directory
│   ├── _components/        # Shared components
│   ├── api/                # API routes (auth, chat, submit, user)
│   ├── contexts/           # React contexts
│   ├── daily-topic/        # Daily topic feature
│   ├── game/               # Game functionality (under construction)
│   ├── markdown/           # Static/MD content
│   ├── page.tsx            # Main page
│   └── layout.tsx          # Application layout
├── components/             # UI component library
├── hooks/                  # Custom React Hooks
├── lib/                    # Utility functions and libraries
├── public/                 # Static assets
└── scripts/                # Scripts
```

## Core Features

### Chatbot Arena

Users interact with two randomly selected LLM models side by side and evaluate their responses. Models are paired randomly and labeled anonymously to ensure unbiased comparison.

### Data Storage Format

Conversations and evaluation results are stored in MongoDB. A typical document looks like:

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

### Hot Topics

The home page displays a list of popular topics for users to click and start conversations.

### Game Functionality (Under Construction)

A game mode is in development, expected to launch in Q3 2025.

## API Implementation

### Chat API

- Integrates with OpenAI, Google Gemini, and AWS Bedrock
- Supports streaming responses for real-time chat
- Randomly selects two models and stores conversation history

## Local Development & Deployment

**Local setup**:
```bash
pnpm install
pnpm dev
pnpm dev-db      # start MongoDB via Docker Compose
pnpm clear-db    # stop DB and remove volumes
```

**Deployment**: One-click deploy on Zeabur with automatic builds on `main`.

## Future Plans

1. Launch game functionality (Q3 2025)
2. Add more LLM providers
3. Improve UI/UX

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

## Software Principles

- Separation of concerns (clear directory structure)
- Single responsibility (focused utilities and API routes)
- DRY (shared components, utilities, context providers)
- Graceful error handling and progressive enhancement

## Deployment Details & Environment

- Zeabur auto-detects Next.js, uses dashboard-specified env vars
- Environment variables: LLM API keys, MongoDB connection string, auth settings
- `.env.example` provided for local development

## Testing & QA

- Manual testing: chat streaming, UI/UX, authentication
- Planned: Jest + React Testing Library, Cypress e2e, CI via GitHub Actions

## TL;DR

- Web app for blind A/B LLM comparison using Next.js + Tailwind
- Key directories: `/app`, `/components`, `/hooks`, `/lib`
- Run locally with `pnpm dev` and `pnpm dev-db`