import { BedrockRuntimeClient, ConverseStreamCommand, ConverseStreamOutput } from '@aws-sdk/client-bedrock-runtime';
import type { ResponseProcessor, ProcessedChunk, ModelConfig, ModelMessage } from './types';

export class BedrockProcessor implements ResponseProcessor {
  async* processStream(messages: ModelMessage[], modelConfig: ModelConfig): AsyncIterable<ProcessedChunk> {
    const client = new BedrockRuntimeClient({
      region: 'us-east-1',
      credentials: {
        accessKeyId: modelConfig.apiKey.split(':')[0],
        secretAccessKey: modelConfig.apiKey.split(':')[1],
      },
    });

    // 從 baseURL 或 model 中提取實際的 modelId
    const modelId = this.extractModelId(modelConfig);

    const response = await client.send(new ConverseStreamCommand({
      inferenceConfig: {},
      modelId,
      messages: messages.map((message) => ({
        role: message.role,
        content: [{ text: message.content }]
      })),
    }));

    if (!response.stream) {
      throw new Error(JSON.stringify(response));
    }

    const bedrockStream = response.stream as AsyncIterable<ConverseStreamOutput>;

    for await (const chunk of bedrockStream) {
      // 處理推理內容
      if (chunk.contentBlockDelta?.delta?.reasoningContent?.text) {
        yield {
          type: 'reasoning',
          content: chunk.contentBlockDelta.delta.reasoningContent.text,
          channel: 'analysis',
          metadata: { source: 'bedrock_reasoning' }
        };
      }

      // 處理一般回應內容
      if (chunk.contentBlockDelta?.delta?.text) {
        yield {
          type: 'content',
          content: chunk.contentBlockDelta.delta.text,
          channel: 'final'
        };
      }
    }
  }

  private extractModelId(modelConfig: ModelConfig): string {
    // 支援多種格式：
    // 1. model: "bedrock@anthropic.claude-3-sonnet" (舊格式相容)
    // 2. baseURL: "bedrock://us-east-1" + model: "anthropic.claude-3-sonnet"
    // 3. model: "anthropic.claude-3-sonnet" (直接模型ID)

    if (modelConfig.model.startsWith('bedrock@')) {
      return modelConfig.model.split('@')[1];
    }

    if (modelConfig.baseURL?.startsWith('bedrock://')) {
      return modelConfig.model;
    }

    return modelConfig.model;
  }
}