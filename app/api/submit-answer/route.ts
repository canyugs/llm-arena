import { ObjectId } from "mongodb";
import { NextRequest, NextResponse } from "next/server";
import getMongoClient from "@/lib/mongo";

interface RequestBody {
  threadID: string;
  userAnswer: string;
}

export async function POST(req: NextRequest) {
  const body: RequestBody = await req.json();
  const { threadID, userAnswer } = body;

  if (typeof threadID !== 'string' || typeof userAnswer !== 'string') {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
  }

  const mongo = await getMongoClient();
  const threads = mongo.db('arena').collection('threads');

  const thread = await threads.findOne({ _id: new ObjectId(threadID) });

  if (!thread) {
    return NextResponse.json({ error: 'Thread not found' }, { status: 404 });
  }

  // Update the thread with the user's answer
  await threads.updateOne(
    { _id: new ObjectId(threadID) },
    { $set: { userAnswer } }
  );

  return NextResponse.json({ message: 'User answer submitted' }, { status: 200 });
}
