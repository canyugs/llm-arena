import { ObjectId } from "mongodb";
import { NextRequest, NextResponse } from "next/server";
import getMongoClient from "@/lib/mongo";

interface RequestBody {
  threadID: string;
  result: 'A_IS_BETTER' | 'B_IS_BETTER' | 'TIE' | 'BOTH_BAD';
}

export async function POST(req: NextRequest) {
  const body: RequestBody = await req.json();
  const { threadID, result } = body;

  if (typeof threadID !== 'string' || typeof result !== 'string') {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 })
  }

  const mongo = await getMongoClient()
  const threads = mongo.db('arena').collection('threads')

  const thread = await threads.findOne({ _id: new ObjectId(threadID) })

  if (!thread) {
    return NextResponse.json({ error: 'Thread not found' }, { status: 404 })
  }

  await threads.updateOne({ _id: new ObjectId(threadID) }, { $set: { result } })

  return NextResponse.json({ message: 'Result submitted' }, { status: 200 })
}
