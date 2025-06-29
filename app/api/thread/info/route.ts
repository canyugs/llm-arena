import { NextRequest, NextResponse } from "next/server";
import { ObjectId } from "mongodb";
import { verifyToken } from "@/lib/jwt";
import getMongoClient from "@/lib/mongo";

interface ThreadDocument {
  _id: ObjectId;
  userID: ObjectId;
  createdAt: Date;
  updatedAt: Date;
  category: string;
  initialContext: {
    question: string;
    source: string;
    metadata?: any;
  };
  selectedModels: string[];
  model1Messages: { role: 'user' | 'assistant'; content: string }[];
  model2Messages: { role: 'user' | 'assistant'; content: string }[];
}

async function getThreadInfo(threadID: ObjectId, userID: ObjectId) {
  const mongo = await getMongoClient();

  try {
    const threads = mongo.db('arena').collection<ThreadDocument>('threads');
    const thread = await threads.findOne({
      _id: threadID,
      userID: userID // 確保用戶只能訪問自己的 thread
    });

    if (!thread) {
      return null;
    }

    return thread;
  } catch (error) {
    console.log('[DB] Error getting thread info:', error);

    return null;
  } finally {
    await mongo.close();
  }
}

export async function POST(request: NextRequest) {
  console.log('[API] POST /api/thread/info - Request started');

  try {
    const { threadId } = await request.json();
    console.log('[API] Thread info request for threadId:', threadId);

    if (!threadId) {
      return NextResponse.json({ error: 'Thread ID is required' }, { status: 400 });
    }

    // 驗證用戶身份
    const cookies = request.cookies;
    const token = cookies.get('token')?.value;

    if (!token) {
      console.log('[API] No token found');

      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    let userID: ObjectId;

    try {
      userID = verifyToken(token);
      console.log('[API] User authenticated:', userID.toHexString());
    } catch (error) {
      console.log('[API] Token verification failed:', error);

      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    let thread = null;

    try {
      thread = await getThreadInfo(new ObjectId(threadId), userID);
      console.log('[API] Thread loaded:', thread ? 'found' : 'not found');
    } catch (error) {
      console.log('[API] Error loading thread:', error);

      return NextResponse.json({ error: 'Invalid thread ID' }, { status: 400 });
    }

    if (!thread) {
      console.log('[API] Thread not found or access denied');

      return NextResponse.json({ error: 'Thread not found' }, { status: 404 });
    }

    const response = {
      threadId: thread._id.toString(),
      category: thread.category,
      initialContext: thread.initialContext,
      createdAt: thread.createdAt,
      updatedAt: thread.updatedAt,
      selectedModels: thread.selectedModels
    };

    console.log('[API] Returning thread info:', {
      threadId: response.threadId,
      question: response.initialContext?.question?.substring(0, 50) + '...'
    });

    return NextResponse.json(response);

  } catch (error) {
    console.log('[API] Error in thread info endpoint:', error);

    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
