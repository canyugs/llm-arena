import 'server-only';
import { OpenAI } from 'openai';
import { BedrockRuntimeClient, ConverseStreamCommand, ConverseStreamOutput } from '@aws-sdk/client-bedrock-runtime';
import type { Stream } from 'openai/streaming.mjs';
import type { ChatCompletionChunk } from 'openai/resources/index.mjs';
import { getDb } from '@/lib/mongo';

export interface ModelConfig {
  model: string;
  baseURL: string;
  apiKey: string;
}

export async function getAvailableModels(): Promise<ModelConfig[]> {
  const db = await getDb('arena');
  const models = db.collection<ModelConfig>('models');
  const find = await models.find({}).toArray();

  return find;
}

export function shuffle<T>(array: T[]): T[] {
  const arr = [...array];

  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }

  return arr;
}

export async function selectRandomModels(count: number = 2): Promise<string[]> {
  const availableModels = await getAvailableModels();
  const shuffledModels = shuffle(availableModels);

  return shuffledModels.slice(0, count).map((item) => item.model);
}

export type ModelMessage = { role: 'user' | 'assistant'; content: string };

export async function getModelTextStream(
  modelConfig: ModelConfig,
  messages: ModelMessage[],
): Promise<AsyncIterable<string>> {
  if (modelConfig.model.startsWith('bedrock@')) {
    const client = new BedrockRuntimeClient({
      region: 'us-east-1',
      credentials: {
        accessKeyId: modelConfig.apiKey.split(':')[0],
        secretAccessKey: modelConfig.apiKey.split(':')[1],
      },
    });

    const response = await client.send(new ConverseStreamCommand({
      inferenceConfig: {},
      modelId: modelConfig.model.split('@')[1],
      messages: messages.map((message) => ({ role: message.role, content: [{ text: message.content }] })),
    }));

    if (!response.stream) {
      throw new Error(JSON.stringify(response));
    }

    const stream = response.stream as AsyncIterable<ConverseStreamOutput>;

    async function* iterator() {
      for await (const chunk of stream) {
        let text = '';

        if (chunk.contentBlockDelta?.delta?.reasoningContent?.text) {
          text = chunk.contentBlockDelta.delta.reasoningContent.text;
        }

        if (chunk.contentBlockDelta?.delta?.text) {
          text = chunk.contentBlockDelta.delta.text;
        }

        if (text) {
          yield text;
        }
      }
    }

    return iterator();
  }

  const openai = new OpenAI({ baseURL: modelConfig.baseURL, apiKey: modelConfig.apiKey });
  const stream = await openai.chat.completions.create({ model: modelConfig.model, messages, stream: true });
  const openaiStream = stream as Stream<ChatCompletionChunk>;

  async function* iterator() {
    for await (const chunk of openaiStream) {
      const text = chunk.choices[0]?.delta.content;
      if (text) yield text;
    }
  }

  return iterator();
}
