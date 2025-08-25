import { OpenAI } from 'openai';
import type { ResponseProcessor, ProcessedChunk, ModelConfig, ModelMessage } from './types';

export class HarmonyProcessor implements ResponseProcessor {
  async* processStream(messages: ModelMessage[], modelConfig: ModelConfig): AsyncIterable<ProcessedChunk> {
    const openai = new OpenAI({ baseURL: modelConfig.baseURL, apiKey: modelConfig.apiKey });
    const response = await openai.chat.completions.create({
      model: modelConfig.model,
      messages,
      stream: true
    });

    let buffer = '';

    for await (const chunk of response) {
      const content = chunk.choices[0]?.delta?.content || '';
      buffer += content;

      // 處理 harmony format 的特殊標記
      const tokens = this.parseHarmonyTokens(buffer);

      for (const token of tokens.complete) {
        yield token;
      }

      buffer = tokens.remaining;
    }

    // 處理剩餘內容
    if (buffer.trim()) {
      yield {
        type: 'content',
        content: buffer,
        channel: 'final'
      };
    }
  }

  private parseHarmonyTokens(buffer: string): { complete: ProcessedChunk[], remaining: string } {
    const complete: ProcessedChunk[] = [];
    let remaining = buffer;

    // 解析 <|start|>role<|channel|>channel<|message|>content 格式
    const harmonyRegex = /<\|start\|\>(\w+)(?:<\|channel\|\>(\w+))?<\|message\|\>([\s\S]*?)(?=<\|start\|\>|$)/g;
    let match;

    while ((match = harmonyRegex.exec(buffer)) !== null) {
      const [fullMatch, role, channel, content] = match;

      if (role === 'assistant') {
        const chunkType = channel === 'analysis' || channel === 'commentary' ? 'reasoning' : 'content';

        complete.push({
          type: chunkType,
          content: content.trim(),
          channel: (channel as 'final' | 'analysis' | 'commentary') || 'final',
          metadata: { role }
        });

        remaining = remaining.replace(fullMatch, '');
      }
    }

    return { complete, remaining };
  }
}