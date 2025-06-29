import { NextRequest, NextResponse } from "next/server";
import { ObjectId } from "mongodb";
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
    metadata?: Record<string, unknown>;
  };
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

export async function POST(request: NextRequest) {
  console.log('[API] POST /api/chat/history - Request started');

  try {
    const { threadId } = await request.json();
    console.log('[API] History request for threadId:', threadId);

    if (!threadId) {
      console.log('[API] No threadId provided, returning empty messages');

      return NextResponse.json({ messagesLeft: [], messagesRight: [] });
    }

    let thread = null;

    try {
      thread = await getThreadMessages(new ObjectId(threadId));
      console.log('[API] Thread loaded:', thread ? 'found' : 'not found');
    } catch (error) {
      console.log('[API] Error loading thread:', error);
      thread = null;
    }

    if (!thread) {
      console.log('[API] Thread not found, returning empty messages');

      return NextResponse.json({ messagesLeft: [], messagesRight: [] });
    }

    const response = {
      messagesLeft: thread.model1Messages || [],
      messagesRight: thread.model2Messages || []
    };

    console.log('[API] Returning history:', {
      leftCount: response.messagesLeft.length,
      rightCount: response.messagesRight.length
    });

    return NextResponse.json(response);

  } catch (error) {
    console.log('[API] Error in history endpoint:', error);

    return NextResponse.json({ messagesLeft: [], messagesRight: [] });
  }
}