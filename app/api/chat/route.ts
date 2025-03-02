import { NextRequest } from "next/server";
import { ObjectId } from "mongodb";
import { OpenAI } from "openai";
import getMongoClient from "@/lib/mongo";
import { verifyToken } from "@/lib/jwt";

const availableModels = [
  {
    model: 'chatgpt-4o-latest',
    baseURL: 'https://api.openai.com/v1/',
    apiKey: process.env.OPENAI_API_KEY,
  },
  {
    model: 'gemini-1.5-flash',
    baseURL: 'https://generativelanguage.googleapis.com/v1beta/',
    apiKey: process.env.GEMINI_API_KEY,
  },
];

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
    const selectedModels = selectRandomModels();
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
      const modelPromises = thread.selectedModels.map((modelId: string, index: number) => {
        const modelConfig = availableModels.find((model) => model.model === modelId);

        if (!modelConfig) {
          throw new Error(`Model configuration not found for model ${modelId}`);
        }

        const messages = thread[index === 0 ? 'model1Messages' : 'model2Messages'] || [];
        const updatedMessages = [...messages, { role: 'user', content: message } as { role: 'user' | 'assistant', content: string }];

        return {
          modelId,
          promise: new OpenAI({
            baseURL: modelConfig.baseURL,
            apiKey: modelConfig.apiKey,
          }).chat.completions.create({
            model: modelConfig.model,
            messages: updatedMessages,
            stream: true,
          })
        };
      });

      const responsePromises = modelPromises.map(async ({ modelId, promise }) => {
        const response = await promise;
        let fullResponse = '';

        for await (const chunk of response) {
          const text = chunk.choices[0]?.delta.content;

          if (text) {
            fullResponse += text;
            await writer.write(encoder.encode(JSON.stringify({
              type: modelId === thread.selectedModels[0] ? 'model1' : 'model2',
              content: text
            }) + '\n'));
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

function selectRandomModels(): string[] {
  const indices = Array.from({ length: availableModels.length }, (_, i) => i.toString());
  const shuffled = indices.sort(() => 0.5 - Math.random());

  return shuffled.slice(0, 2).map((index) => availableModels[parseInt(index)].model);
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
