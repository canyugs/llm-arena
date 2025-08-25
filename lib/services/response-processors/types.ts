export interface ProcessedChunk {
  type: 'content' | 'reasoning' | 'tool_call' | 'metadata';
  content: string;
  channel?: 'final' | 'analysis' | 'commentary';
  metadata?: Record<string, unknown>;
}

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

export type ModelMessage = { role: 'user' | 'assistant'; content: string };

export interface ResponseProcessor {
  processStream(messages: ModelMessage[], modelConfig: ModelConfig): AsyncIterable<ProcessedChunk>;
}