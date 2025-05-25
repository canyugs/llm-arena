'use client';

export default function GamePage() {
  return (
    <div className="w-full h-full flex flex-col items-center justify-center p-8">
      <div className="max-w-md w-full bg-white rounded-lg shadow-md p-8 text-center">
        <div className="mb-6 flex justify-center">
          <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center">
            <img src="/icons/proicons--wrench.svg" alt="Construction" className="h-10 w-10 text-blue-500" />
          </div>
        </div>
        <h1 className="text-2xl font-bold text-gray-800 mb-4">AI 遊戲功能建置中</h1>
        <p className="text-gray-600 mb-6">
          我們正在努力開發更多有趣的 AI 遊戲體驗。敬請期待！
        </p>
        <div className="text-sm text-gray-500">
          預計上線時間：2025 年第三季
        </div>
      </div>
    </div>
  );
}
