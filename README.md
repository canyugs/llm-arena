# Chatbot Arena

Simple chatbot arena for testing and comparing different chatbots.

This project is part of the [FreeSEED "Made In Taiwan" LLM](https://freeseed.ai) project.

## Local Development

```
JWT_SECRET=
MONGO_URI=
OPENAI_API_KEY=
GEMINI_API_KEY=
OAUTH_CLIENT_ID=
OAUTH_CLIENT_SECRET=
OAUTH_CALLBACK_URL=http://localhost:3000/api/auth/discord/callback
```

```
pnpm install
pnpm dev
```

## Deploy

Deployed on [Zeabur](https://zeabur.com?utm_source=github&utm_campaign=freeseed-chatbot-arena) with one click.

## Data Format

The original data format stored in MongoDB:

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
