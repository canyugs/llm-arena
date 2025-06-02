# LLM Arena Project Documentation

## Project Overview

LLM Arena is a simple chatbot arena for testing and comparing different chatbots. This project is part of the [FreeSEED "Made In Taiwan" LLM](https://freeseed.ai) project.

## Technology Stack

- **Frontend Framework**: Next.js 15.1.7 (using React 19)
- **Styling**: Tailwind CSS
- **Database**: MongoDB
- **Containerization**: Docker Compose
- **LLM API Integrations**:
  - OpenAI API
  - Google Gemini API
  - AWS Bedrock
- **UI Components**: Radix UI with custom components

## Project Structure

```
llm-arena/
├── app/                    # Next.js application main directory
│   ├── _components/        # Shared components
│   ├── api/                # API routes
│   │   ├── auth/           # Authentication-related APIs
│   │   ├── chat/           # Chat functionality APIs
│   │   ├── submit/         # Submit evaluation APIs
│   │   ├── submit-answer/  # Submit answer APIs
│   │   └── user/           # User-related APIs
│   ├── contexts/           # React contexts
│   ├── daily-topic/        # Daily topic feature
│   ├── game/               # Game functionality (under construction)
│   ├── markdown/           # Markdown content
│   ├── page.tsx            # Main page
│   └── layout.tsx          # Application layout
├── components/             # UI component library
├── hooks/                  # Custom React Hooks
├── lib/                    # Utility functions and libraries
├── public/                 # Static assets
└── scripts/                # Scripts
```

## Core Features

### 1. Chatbot Arena

Users can interact with two randomly selected LLM models simultaneously and then evaluate their responses. The system randomly selects two models for comparison, and users don't know which specific models they are interacting with, ensuring unbiased evaluation.

### 2. Data Storage Format

Data is stored in MongoDB in the following format:

```json
{
  "_id": "66d063e5626b5d0026a101e2",
  "userID": "66d063e5626b5d0026a101e1",
  "selectedModels": ["chatgpt-4o-latest", "gemini-1.5-flash"],
  "model1Messages": [
    {
      "role": "user",
      "content": "Hello, how are you?"
    },
    {
      "role": "assistant",
      "content": "I'm good, thank you!"
    }
  ],
  "model2Messages": [
    {
      "role": "user",
      "content": "Hello, how are you?"
    },
    {
      "role": "assistant",
      "content": "I'm good, thank you!"
    }
  ],
  "result": "A_IS_BETTER"
}
```

### 3. Hot Topics

The homepage displays a series of popular topics that users can click on to start conversations with AI.

### 4. Game Functionality (Under Construction)

The game functionality is currently under development and is expected to launch in Q3 2025.

## API Implementation

### Chat API

- Implements integration with multiple LLM models, including OpenAI, Google Gemini, and AWS Bedrock
- Supports streaming responses for a real-time chat experience
- Randomly selects two models for comparison
- Stores conversation history between users and models

## Deployment Information

The project is deployed using [Zeabur](https://zeabur.com) with one-click deployment.

## Local Development

1. Create a `.env` file (content provided in the Discord channel)
2. Install dependencies: `pnpm install`
3. Start the development server: `pnpm dev`
4. Visit `http://localhost:3000` to start development

## Database Management

- Start the database: `pnpm dev-db`
- Clear the database: `pnpm clear-db`

## Future Plans

1. Game functionality will be launched in Q3 2025
2. Potential addition of more LLM models for comparison
3. Improvements to the user interface and experience

## UI Implementation Details

### Component Structure

The UI is built using a combination of Radix UI primitives and custom components:

- **UI Components**: Located in `/components/ui/`
  - Button, Input, Card, Avatar, Toast components for consistent styling
  - Built with accessibility in mind using Radix UI primitives

### Key UI Features

1. **Battle Component**: The core comparison interface
   - Side-by-side chat interface for comparing two AI models
   - Streaming responses with real-time updates
   - Evaluation buttons for users to select which model performed better

2. **Home Interface**: Entry point for users
   - Search input for asking questions
   - Hot topics section with popular questions
   - Login/authentication integration

3. **Toast Notifications**: Used for system feedback
   - Confirmation messages for submissions
   - Error notifications
   - Feature availability notices

### Responsive Design

The application is built with mobile-first responsive design principles using Tailwind CSS:
- Adaptive layouts for different screen sizes
- Mobile-specific input handling
- Touch-friendly UI elements

## Git Workflow

### Branch Structure

- **main**: Production-ready code
- **feature/chat-system-and-pages**: Development branch for chat functionality

### Development Process

1. Feature branches are created from `main`
2. Development and testing occur on feature branches
3. Pull requests are used to merge features back to `main`
4. The repository is hosted on GitHub at `github.com:canyugs/llm-arena.git`

### Commit Style

The project follows the Conventional Commits specification for commit messages:

- **feat**: A new feature or enhancement (e.g., `feat: add UI icons for chat interface`)
- **fix**: A bug fix (e.g., `fix: mobile toast auto-dismiss issue`)
- **refactor**: Code changes that neither fix bugs nor add features (e.g., `refactor: use sessionStorage instead of URL params`)
- **docs**: Documentation changes
- **style**: Changes that don't affect code functionality (formatting, etc.)
- **test**: Adding or correcting tests
- **chore**: Changes to build process or auxiliary tools

Commit messages often include detailed descriptions for complex changes, especially for feature additions and significant refactoring.

## Software Development Principles

The project follows several key software development principles:

### Separation of Concerns

- **Component-Based Architecture**: UI elements are organized into reusable components
- **Directory Structure**: Clear separation between app logic, components, and utilities
- **Context API**: React Context is used for state management across components

### Single Responsibility Principle

- **Utility Functions**: Small, focused utility files (e.g., `jwt.ts`, `mongo.ts`)
- **API Routes**: Each API route handles a specific functionality
- **UI Components**: Components are designed with specific, well-defined purposes

### DRY (Don't Repeat Yourself)

- **Shared Components**: Common UI elements are abstracted into reusable components
- **Utility Functions**: Common operations are extracted into utility functions
- **Context Providers**: Shared state is managed through context providers

### Error Handling

- **Graceful Error Handling**: API routes include proper error handling
- **User Feedback**: Toast notifications for error states
- **Environment Validation**: Checking for required environment variables

### Progressive Enhancement

- **Feature Flags**: Some features (like the game functionality) are marked as under construction
- **Responsive Design**: Mobile-first approach with progressive enhancement for larger screens
- **Graceful Degradation**: Fallbacks for when certain features are unavailable

## Deployment Details

### Zeabur Deployment

The project is deployed on [Zeabur](https://zeabur.com) with a one-click deployment process:

1. Zeabur automatically detects the Next.js application
2. Environment variables are configured in the Zeabur dashboard
3. Automatic deployments are triggered on commits to the main branch

### Environment Configuration

The application uses environment variables for configuration:

- API keys for various LLM providers (OpenAI, Gemini, AWS Bedrock)
- MongoDB connection strings
- Authentication settings

A `.env.example` file is provided as a template for local development.

## Testing and Quality Assurance

### Manual Testing

The application is currently tested manually with the following focus areas:

1. **Chat Functionality**: Testing the streaming responses and model comparisons
2. **User Experience**: Ensuring the UI is intuitive and responsive
3. **Authentication**: Verifying user login and session management

### Future Testing Plans

1. Implement automated testing with Jest and React Testing Library
2. Add end-to-end testing with Cypress
3. Implement continuous integration testing with GitHub Actions
