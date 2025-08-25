import type { ResponseProcessor, ModelConfig } from './types';
import { StandardProcessor } from './StandardProcessor';
import { HarmonyProcessor } from './HarmonyProcessor';
import { ThinkingProcessor } from './ThinkingProcessor';
import { BedrockProcessor } from './BedrockProcessor';

export class ProcessorFactory {
  static createProcessor(modelConfig: ModelConfig): ResponseProcessor {
    const format = modelConfig.responseFormat || 'standard';

    switch (format) {
    case 'harmony':
      return new HarmonyProcessor();
    case 'thinking':
      return new ThinkingProcessor();
    case 'bedrock':
      return new BedrockProcessor();
    case 'standard':
    default:
      return new StandardProcessor();
    }
  }
}

// 也可以作為便利函數導出
export function createProcessor(modelConfig: ModelConfig): ResponseProcessor {
  return ProcessorFactory.createProcessor(modelConfig);
}