import { NextRequest } from "next/server";
import { ObjectId } from "mongodb";
import { OpenAI } from "openai";
import { Stream } from "openai/streaming.mjs";
import { ChatCompletionChunk } from "openai/resources/index.mjs";
import { BedrockRuntimeClient, ConverseStreamCommand, ConverseStreamOutput } from "@aws-sdk/client-bedrock-runtime";
import { verifyToken } from "@/lib/jwt";
import getMongoClient from "@/lib/mongo";

const getAvailableModels = async () => {
  const mongo = await getMongoClient();

  try {
    const models = mongo.db('arena').collection<{ model: string, baseURL: string, apiKey: string }>('models');
    const find = await models.find({}).toArray();

    return find;
  } catch (error) {
    throw new Error(`Failed to get available models: ${error}`);
  } finally {
    await mongo.close();
  }
}

export async function POST(request: NextRequest) {
  console.log('[API] POST /api/chat - Request started');
  const { threadId, message } = await request.json();
  console.log('[API] Request data:', { threadId, messageLength: message?.length });
  
  const cookies = request.cookies;
  const token = cookies.get('token')?.value;

  if (!token) {
    return new Response('Unauthorized', { status: 401 });
  }

  const userID = verifyToken(token);

  if (!userID) {
    return new Response('Unauthorized', { status: 401 });
  }

  if (!threadId || !message) {
    return new Response('Invalid request', { status: 400 });
  }

  if (typeof message !== 'string' || typeof threadId !== 'string') {
    return new Response('Invalid message', { status: 400 });
  }

  const threadID = new ObjectId(threadId);

  console.log('[API] Getting thread messages for:', threadID.toString());
  let thread = await getThreadMessages(threadID);

  if (!thread) {
    console.log('[API] Thread not found, creating new thread');
    const selectedModels = await selectRandomModels();
    console.log('[API] Selected models:', selectedModels);
    await saveThreadModels(threadID, selectedModels, userID);
    thread = await getThreadMessages(threadID);
  }

  if (!thread) {
    console.log('[API] ERROR: Thread not found and failed to create new');
    return new Response('Thread not found and failed to create new', { status: 404 });
  }

  console.log('[API] Thread loaded successfully:', { 
    selectedModels: thread.selectedModels,
    model1MessagesCount: thread.model1Messages?.length || 0,
    model2MessagesCount: thread.model2Messages?.length || 0
  });

  const encoder = new TextEncoder();
  const { readable, writable } = new TransformStream();
  const writer = writable.getWriter();

  // 立即發送歷史訊息（如果有的話）
  if (thread.model1Messages?.length > 0 || thread.model2Messages?.length > 0) {
    console.log('[API] Sending existing history');
    await writer.write(encoder.encode(JSON.stringify({
      type: 'history',
      messagesLeft: thread.model1Messages || [],
      messagesRight: thread.model2Messages || []
    }) + '\n'));
  }

  const updateThread = async (modelId: string, fullResponse: string) => {
    await updateThreadMessages(threadID, modelId, { role: 'assistant', content: fullResponse }, userID);
  };

  for (const modelId of thread.selectedModels) {
    await updateThreadMessages(threadID, modelId, { role: 'user', content: message }, userID);
  }

  (async () => {
    try {
      console.log('[API] Starting model processing');
      const availableModels = await getAvailableModels();
      console.log('[API] Available models count:', availableModels.length);

      const modelPromises = thread.selectedModels.map(async (modelId: string, index: number) => {
        console.log(`[API] Processing model ${index + 1}/${thread.selectedModels.length}:`, modelId);
        const modelConfig = availableModels.find((model) => model.model === modelId);

        if (!modelConfig) {
          console.log(`[API] ERROR: Model configuration not found for model ${modelId}`);
          throw new Error(`Model configuration not found for model ${modelId}`);
        }

        const messages = thread[index === 0 ? 'model1Messages' : 'model2Messages'] || [];
        console.log(`[API] Model ${modelId} existing messages count:`, messages.length);
        const updatedMessages = [...messages, { role: 'user', content: message } as { role: 'user' | 'assistant', content: string }];

        let streamResponse: StreamResponse;

        if (modelConfig.model.startsWith('bedrock@')) {
          const client = new BedrockRuntimeClient({
            region: "us-east-1",
            credentials: {
              accessKeyId: modelConfig.apiKey.split(':')[0],
              secretAccessKey: modelConfig.apiKey.split(':')[1],
            }
          });
          const response = await client.send(new ConverseStreamCommand({
            inferenceConfig: {},
            modelId: modelConfig.model.split('@')[1],
            messages: updatedMessages.map((message) => ({ role: message.role, content: [{ text: message.content }] }))
          }));

          if (!response.stream) {
            throw new Error(JSON.stringify(response));
          }

          streamResponse = {
            type: 'bedrock',
            stream: response.stream
          }
        } else {
          streamResponse = {
            type: 'openai',
            stream: await new OpenAI({ baseURL: modelConfig.baseURL, apiKey: modelConfig.apiKey, }).chat.completions.create({ model: modelConfig.model, messages: updatedMessages, stream: true, })
          }
        }

        return {
          modelId,
          streamResponse
        };
      });

      const responsePromises = modelPromises.map(async (modelPromise) => {
        const { modelId, streamResponse } = await modelPromise;

        let openAIStream: Stream<ChatCompletionChunk> | undefined;
        let bedrockStream: AsyncIterable<ConverseStreamOutput> | undefined;

        switch (streamResponse.type) {
        case "openai":
          openAIStream = streamResponse.stream;
          break;
        case "bedrock":
          bedrockStream = streamResponse.stream;
          break;
        }

        let fullResponse = '';

        if (openAIStream) {
          console.log(`[API] Starting OpenAI stream for model: ${modelId}`);
          let chunkCount = 0;
          for await (const chunk of openAIStream) {
            const text = chunk.choices[0]?.delta.content;

            if (text) {
              chunkCount++;
              fullResponse += text;
              const responseType = modelId === thread.selectedModels[0] ? 'model1' : 'model2';
              await writer.write(encoder.encode(JSON.stringify({
                type: responseType,
                content: text
              }) + '\n'));
              
              if (chunkCount % 10 === 0) {
                console.log(`[API] Model ${modelId} - Chunk ${chunkCount}, Response length: ${fullResponse.length}`);
              }
            }
          }
          console.log(`[API] Model ${modelId} OpenAI stream completed. Total chunks: ${chunkCount}, Final response length: ${fullResponse.length}`);
        }

        if (bedrockStream) {
          console.log(`[API] Starting Bedrock stream for model: ${modelId}`);
          let chunkCount = 0;
          for await (const chunk of bedrockStream) {
            let text = '';

            if (chunk.contentBlockDelta?.delta?.reasoningContent?.text) {
              text = chunk.contentBlockDelta.delta.reasoningContent.text;
            }

            if (chunk.contentBlockDelta?.delta?.text) {
              text = chunk.contentBlockDelta?.delta?.text;
            }

            if (text) {
              chunkCount++;
              fullResponse += text;
              const responseType = modelId === thread.selectedModels[0] ? 'model1' : 'model2';
              await writer.write(encoder.encode(JSON.stringify({
                type: responseType,
                content: text
              }) + '\n'));
              
              if (chunkCount % 10 === 0) {
                console.log(`[API] Model ${modelId} - Chunk ${chunkCount}, Response length: ${fullResponse.length}`);
              }
            }
          }
          console.log(`[API] Model ${modelId} Bedrock stream completed. Total chunks: ${chunkCount}, Final response length: ${fullResponse.length}`);
        }

        await updateThread(modelId, fullResponse);
        console.log(`[API] Model ${modelId} processing completed. Final response saved to database.`);

        return { modelId, done: true };
      });

      console.log('[API] Waiting for all model responses to complete...');
      await Promise.all(responsePromises);
      console.log('[API] All model responses completed. Closing writer.');
      await writer.close();

    } catch (error) {
      console.log('[API] ERROR in model processing:', error);
      await writer.close();
    }
  })();

  console.log('[API] Returning streaming response');
  return new Response(readable, {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
    },
  });
}

// GET API 已移除 - 歷史訊息現在通過 POST API 一併處理

function shuffle<T>(array: T[]): T[] {
  const arr = [...array];

  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }

  return arr;
}

async function selectRandomModels(): Promise<string[]> {
  const availableModels = await getAvailableModels();
  const shuffledModels = shuffle(availableModels);

  return shuffledModels.slice(0, 2).map((item) => item.model);
}

async function saveThreadModels(
  threadID: ObjectId,
  modelIds: string[],
  userID: ObjectId
) {
  const mongo = await getMongoClient();

  try {
    const threads = mongo.db('arena').collection('threads');
    await threads.updateOne(
      { _id: threadID },
      {
        $set: {
          selectedModels: modelIds,
          userID
        }
      },
      { upsert: true }
    );
  } finally {
    await mongo.close();
  }
}

async function updateThreadMessages(
  threadID: ObjectId,
  modelId: string,
  message: { role: 'user' | 'assistant', content: string },
  userID: ObjectId
) {
  const mongo = await getMongoClient();

  try {
    const threads = mongo.db('arena').collection('threads');
    const find = await threads.findOne({ _id: threadID });

    if (!find) {
      throw new Error('Thread not found');
    }

    const field = modelId === find.selectedModels[0] ? 'model1Messages' : 'model2Messages';

    await threads.updateOne(
      { _id: threadID },
      // @ts-expect-error $push is not typed
      { $push: { [field]: message } }
    );
  } finally {
    await mongo.close();
  }
}

interface ThreadDocument {
  _id: ObjectId;
  userID: ObjectId;
  selectedModels: string[];
  model1Messages: { role: 'user' | 'assistant'; content: string }[];
  model2Messages: { role: 'user' | 'assistant'; content: string }[];
}

async function getThreadMessages(threadID: ObjectId) {
  const mongo = await getMongoClient();

  try {
    const threads = mongo.db('arena').collection<ThreadDocument>('threads');
    const thread = await threads.findOne({ _id: threadID })

    if (!thread) {
      return null;
    }

    return thread;
  } catch (error) {
    console.log('[DB] Error getting thread messages:', error);
    return null;
  } finally {
    await mongo.close();
  }
}

interface OpenAIStreamResponse {
  type: 'openai';
  stream: Stream<ChatCompletionChunk>
}

interface BedrockStreamResponse {
  type: 'bedrock';
  stream: AsyncIterable<ConverseStreamOutput>
}

type StreamResponse = OpenAIStreamResponse | BedrockStreamResponse;