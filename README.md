# Chatbot Arena

Simple chatbot arena for testing and comparing different chatbots.

This project is part of the [FreeSEED "Made In Taiwan" LLM](https://freeseed.ai) project.

## Local Development

建立 `.env` 檔案，[內容在這](https://discord.com/channels/1342206310225022996/1342215083194974268/1348125670726701088) 。（注意 `OPENAI_API_KEY`, `GEMINI_API_KEY` 請自行建立）

```
pnpm install
pnpm dev
```

就可以進到 `http://localhost:3000` 開始開發了


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
