import 'server-only';
import { getDb } from '@/lib/mongo';
import { createProcessor, type ProcessedChunk } from './response-processors';

export interface ModelConfig {
  model: string;
  baseURL: string;
  apiKey: string;
  responseFormat?: 'standard' | 'harmony' | 'thinking' | 'bedrock';
  formatOptions?: {
    showReasoning?: boolean;
    channelFilter?: string[];
  };
  enabled?: boolean;
}

export async function getAvailableModels(): Promise<ModelConfig[]> {
  const db = await getDb('arena');
  const models = db.collection<ModelConfig>('models');
  const find = await models.find({}).toArray();

  // Filter to only return enabled models, treating missing enabled field as enabled for backward compatibility
  return find.filter(model => model.enabled !== false);
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
  const processor = createProcessor(modelConfig);
  const processedStream = processor.processStream(messages, modelConfig);

  async function* iterator() {
    for await (const chunk of processedStream) {
      if (chunk.type === 'content') {
        yield chunk.content;
      }
    }
  }

  return iterator();
}

export async function getModelProcessedStream(
  modelConfig: ModelConfig,
  messages: ModelMessage[],
): Promise<AsyncIterable<ProcessedChunk>> {
  const processor = createProcessor(modelConfig);

  return processor.processStream(messages, modelConfig);
}
