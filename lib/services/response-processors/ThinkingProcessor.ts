import { OpenAI } from 'openai';
import type { Stream } from 'openai/streaming.mjs';
import type { ChatCompletionChunk } from 'openai/resources/index.mjs';
import type { ResponseProcessor, ProcessedChunk, ModelConfig, ModelMessage } from './types';

export class ThinkingProcessor implements ResponseProcessor {
  async* processStream(messages: ModelMessage[], modelConfig: ModelConfig): AsyncIterable<ProcessedChunk> {
    const openai = new OpenAI({ baseURL: modelConfig.baseURL, apiKey: modelConfig.apiKey });
    const openaiStream = await openai.chat.completions.create({
      model: modelConfig.model,
      messages,
      stream: true
    });
    const typedStream = openaiStream as Stream<ChatCompletionChunk>;

    let buffer = '';
    let inThinkingBlock = false;
    let thinkingContent = '';

    for await (const chunk of typedStream) {
      const text = chunk.choices[0]?.delta.content;
      if (!text) continue;

      buffer += text;

      // 處理思考標記
      const processed = this.processThinkingContent(buffer, inThinkingBlock, thinkingContent);

      // 輸出思考內容
      if (processed.thinkingChunk) {
        yield processed.thinkingChunk;
      }

      // 輸出最終回應內容
      if (processed.contentChunk) {
        yield processed.contentChunk;
      }

      // 更新狀態
      buffer = processed.remainingBuffer;
      inThinkingBlock = processed.inThinkingBlock;
      thinkingContent = processed.thinkingContent;
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

  private processThinkingContent(
    buffer: string,
    inThinkingBlock: boolean,
    currentThinking: string
  ): {
    thinkingChunk?: ProcessedChunk;
    contentChunk?: ProcessedChunk;
    remainingBuffer: string;
    inThinkingBlock: boolean;
    thinkingContent: string;
  } {
    const thinkStartRegex = /<think>/g;
    const thinkEndRegex = /<\/think>/g;

    let remainingBuffer = buffer;
    let newInThinkingBlock = inThinkingBlock;
    let newThinkingContent = currentThinking;

    // 檢查開始標記
    const startMatch = thinkStartRegex.exec(buffer);

    if (startMatch && !inThinkingBlock) {
      newInThinkingBlock = true;
      remainingBuffer = buffer.substring(startMatch.index + startMatch[0].length);
      newThinkingContent = '';
    }

    // 檢查結束標記
    const endMatch = thinkEndRegex.exec(buffer);

    if (endMatch && inThinkingBlock) {
      const thinkingText = buffer.substring(0, endMatch.index);
      newThinkingContent += thinkingText;

      const thinkingChunk: ProcessedChunk = {
        type: 'reasoning',
        content: newThinkingContent,
        channel: 'analysis',
        metadata: { source: 'thinking' }
      };

      newInThinkingBlock = false;
      remainingBuffer = buffer.substring(endMatch.index + endMatch[0].length);
      newThinkingContent = '';

      return {
        thinkingChunk,
        remainingBuffer,
        inThinkingBlock: newInThinkingBlock,
        thinkingContent: newThinkingContent
      };
    }

    // 如果在思考區塊中，累積內容
    if (inThinkingBlock) {
      newThinkingContent += buffer;
      remainingBuffer = '';
    }

    // 如果不在思考區塊中且有內容，作為最終回應輸出
    if (!inThinkingBlock && remainingBuffer.trim()) {
      const contentChunk: ProcessedChunk = {
        type: 'content',
        content: remainingBuffer,
        channel: 'final'
      };

      return {
        contentChunk,
        remainingBuffer: '',
        inThinkingBlock: newInThinkingBlock,
        thinkingContent: newThinkingContent
      };
    }

    return {
      remainingBuffer,
      inThinkingBlock: newInThinkingBlock,
      thinkingContent: newThinkingContent
    };
  }
}