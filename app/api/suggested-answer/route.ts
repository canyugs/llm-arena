import { NextRequest } from "next/server";
import { ObjectId } from "mongodb";
import getMongoClient from "@/lib/mongo";
import { verifyToken } from "@/lib/jwt";

export async function POST(request: NextRequest) {
  const { threadId, suggestedAnswer } = await request.json();
  const cookies = request.cookies;

  const token = cookies.get('token')?.value;

  if (!token) {
    return new Response('Unauthorized', { status: 401 });
  }

  const userID = verifyToken(token);

  if (!userID) {
    return new Response('Unauthorized', { status: 401 });
  }

  if (!threadId || !suggestedAnswer) {
    return new Response('Invalid request', { status: 400 });
  }

  if (typeof suggestedAnswer !== 'string' || typeof threadId !== 'string') {
    return new Response('Invalid data format', { status: 400 });
  }

  const threadID = new ObjectId(threadId);

  try {
    await saveSuggestedAnswer(threadID, suggestedAnswer, userID);
    return new Response(JSON.stringify({ success: true }), {
      headers: { 'Content-Type': 'application/json' },
      status: 200,
    });
  } catch (error) {
    console.error('Error saving suggested answer:', error);
    return new Response(JSON.stringify({ success: false, error: 'Failed to save suggested answer' }), {
      headers: { 'Content-Type': 'application/json' },
      status: 500,
    });
  }
}

async function saveSuggestedAnswer(
  threadID: ObjectId,
  suggestedAnswer: string,
  userID: ObjectId
) {
  const mongo = await getMongoClient();

  try {
    const threads = mongo.db('arena').collection('threads');
    const find = await threads.findOne({ _id: threadID });

    if (!find) {
      throw new Error('Thread not found');
    }

    await threads.updateOne(
      { _id: threadID },
      {
        $set: {
          suggestedAnswer: {
            answer: suggestedAnswer
          }
        }
      }
    );
  } finally {
    await mongo.close();
  }
}
