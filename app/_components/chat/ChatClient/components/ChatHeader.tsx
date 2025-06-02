'use client';

interface ChatHeaderProps {
  showWelcome: boolean;
}

export default function ChatHeader({ showWelcome }: ChatHeaderProps) {
  if (showWelcome) {
    return (
      <div className="text-center my-6 w-full max-w-[1024px]">
        <h2 className="text-xl font-medium text-gray-800">歡迎來到 AI 競技場</h2>
        <p className="text-gray-600 mt-2">輸入您的問題，讓兩個 AI 模型為您解答！</p>
      </div>
    );
  }
  
  return (
    <div className="text-center my-6 w-full max-w-[1024px]">
      <h2 className="text-xl font-medium text-gray-800">您覺得哪個回覆比較好？</h2>
    </div>
  );
}
