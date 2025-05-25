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
  const { threadId, message } = await request.json();
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

  let thread = await getThreadMessages(threadID);

  if (!thread) {
    const selectedModels = await selectRandomModels();
    await saveThreadModels(threadID, selectedModels, userID);
    thread = await getThreadMessages(threadID);
  }

  if (!thread) {
    return new Response('Thread not found and failed to create new', { status: 404 });
  }

  const encoder = new TextEncoder();
  const { readable, writable } = new TransformStream();
  const writer = writable.getWriter();

  const updateThread = async (modelId: string, fullResponse: string) => {
    await updateThreadMessages(threadID, modelId, { role: 'assistant', content: fullResponse }, userID);
  };

  for (const modelId of thread.selectedModels) {
    await updateThreadMessages(threadID, modelId, { role: 'user', content: message }, userID);
  }

  (async () => {
    try {
      const availableModels = await getAvailableModels();

      const modelPromises = thread.selectedModels.map(async (modelId: string, index: number) => {
        const modelConfig = availableModels.find((model) => model.model === modelId);

        if (!modelConfig) {
          throw new Error(`Model configuration not found for model ${modelId}`);
        }

        const messages = thread[index === 0 ? 'model1Messages' : 'model2Messages'] || [];
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
          for await (const chunk of openAIStream) {
            const text = chunk.choices[0]?.delta.content;

            if (text) {
              fullResponse += text;
              await writer.write(encoder.encode(JSON.stringify({
                type: modelId === thread.selectedModels[0] ? 'model1' : 'model2',
                content: text
              }) + '\n'));
            }
          }
        }

        if (bedrockStream) {
          for await (const chunk of bedrockStream) {
            let text = '';

            if (chunk.contentBlockDelta?.delta?.reasoningContent?.text) {
              text = chunk.contentBlockDelta.delta.reasoningContent.text;
            }

            if (chunk.contentBlockDelta?.delta?.text) {
              text = chunk.contentBlockDelta?.delta?.text;
            }

            if (text) {
              fullResponse += text;
              await writer.write(encoder.encode(JSON.stringify({
                type: modelId === thread.selectedModels[0] ? 'model1' : 'model2',
                content: text
              }) + '\n'));
            }
          }
        }

        await updateThread(modelId, fullResponse);

        return { modelId, done: true };
      });

      await Promise.all(responsePromises);
      await writer.close();

    } catch {
      await writer.close();
    }
  })();

  return new Response(readable, {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
    },
  });
}

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

    const field = modelId === find.selectedModels[0] ? 'modelAMessages' : 'modelBMessages';

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
  model1Messages: { role: 'user' | 'assistant', content: string }[];
  model2Messages: { role: 'user' | 'assistant', content: string }[];
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