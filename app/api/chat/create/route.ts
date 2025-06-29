import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { ObjectId } from "mongodb";
import { verifyToken } from "@/lib/jwt";
import getMongoClient from "@/lib/mongo";

interface CreateChatRequest {
  category?: string;
  initialContext?: {
    initialQuestion: string;
    source: string;
    metadata?: Record<string, any>;
  };
}

export async function POST(request: NextRequest) {
  try {
    // 驗證用戶身份
    const cookieStore = await cookies();
    const token = cookieStore.get('token')?.value;

    if (!token) {
      console.log('[API] No token found');

      return NextResponse.json({ error: "未授權" }, { status: 401 });
    }

    let userID: ObjectId;

    try {
      userID = verifyToken(token);
      console.log('[API] User authenticated:', userID.toHexString());
    } catch (error) {
      console.log('[API] Token verification failed:', error);

      return NextResponse.json({ error: "無效的令牌" }, { status: 401 });
    }

    const body: CreateChatRequest = await request.json();
    const { category = "general", initialContext } = body;

    // 生成新的 threadId
    const threadId = new ObjectId().toHexString();

    // 連接到 MongoDB
    const client = await getMongoClient();
    const db = client.db("arena"); // 使用正確的數據庫名稱
    const threadsCollection = db.collection("threads");

    // 創建新的對話記錄
    const now = new Date();
    const threadDocument = {
      _id: new ObjectId(threadId),
      userID: userID, // 使用已驗證的 userID
      selectedModels: [], // 添加 selectedModels 字段，稍後會被 chat API 填充
      model1Messages: [],
      model2Messages: [],
      createdAt: now,
      updatedAt: now,
      category,
      initialContext: {
        question: initialContext?.initialQuestion || '',
        source: initialContext?.source || 'unknown',
        metadata: initialContext?.metadata || {}
      }
    };

    await threadsCollection.insertOne(threadDocument);
    await client.close(); // 關閉數據庫連接

    console.log('[API] Created new thread:', threadId, 'for user:', userID.toHexString());

    return NextResponse.json({
      threadId,
      success: true
    });

  } catch (error) {
    console.error("創建對話失敗:", error);

    return NextResponse.json(
      { error: "創建對話失敗" },
      { status: 500 }
    );
  }
}
