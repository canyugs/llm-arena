import { OpenAI } from 'openai';
import type { Stream } from 'openai/streaming.mjs';
import type { ChatCompletionChunk } from 'openai/resources/index.mjs';
import type { ResponseProcessor, ProcessedChunk, ModelConfig, ModelMessage } from './types';

export class StandardProcessor implements ResponseProcessor {
  async* processStream(messages: ModelMessage[], modelConfig: ModelConfig): AsyncIterable<ProcessedChunk> {
    const openai = new OpenAI({ baseURL: modelConfig.baseURL, apiKey: modelConfig.apiKey });
    const openaiStream = await openai.chat.completions.create({
      model: modelConfig.model,
      messages,
      stream: true
    });
    const typedStream = openaiStream as Stream<ChatCompletionChunk>;

    for await (const chunk of typedStream) {
      const text = chunk.choices[0]?.delta.content;

      if (text) {
        yield {
          type: 'content',
          content: text,
          channel: 'final'
        };
      }
    }
  }
}