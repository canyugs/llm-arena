import Link from "next/link";
import ChatClient from "../../_components/chat/ChatClient";

interface ChatPageProps {
  params: Promise<{ threadId: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

// 簡單的 threadId 驗證函數
function isValidThreadId(threadId: string): boolean {
  // 檢查是否為有效的十六進制字符串（24字符的 MongoDB ObjectId 或 32字符的 UUID）
  return /^[a-f0-9]{24}$|^[a-f0-9]{32}$/i.test(threadId);
}

export default async function ChatPage({ params }: ChatPageProps) {
  const { threadId } = await params;

  // 驗證 threadId 格式
  if (!threadId || !isValidThreadId(threadId)) {
    return (
      <div className="w-full h-full flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-800 mb-4">無效的對話 ID</h1>
          <p className="text-gray-600 mb-4">請檢查 URL 是否正確，或返回首頁開始新對話。</p>
          <Link
            href="/"
            className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg"
          >
            返回首頁
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-full relative">
      <ChatClient
        threadId={threadId}
      />
    </div>
  );
}
