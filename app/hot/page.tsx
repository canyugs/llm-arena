'use client';

export default function HotPage() {
  return (
    <div className="w-full h-full flex flex-col items-center justify-center p-8">
      <div className="max-w-md w-full bg-white rounded-lg shadow-md p-8 text-center">
        <div className="mb-6 flex justify-center">
          <div className="w-20 h-20 bg-orange-100 rounded-full flex items-center justify-center">
            <img src="/icons/proicons--wrench.svg" alt="Construction" className="h-10 w-10 text-orange-500" />
          </div>
        </div>
        <h1 className="text-2xl font-bold text-gray-800 mb-4">熱門探索功能建置中</h1>
        <p className="text-gray-600 mb-6">
          我們正在整理最熱門的 AI 對話和探索主題，讓您可以發現更多有趣的內容。敬請期待！
        </p>
        <div className="text-sm text-gray-500">
          預計上線時間：2025 年第二季
        </div>
      </div>
    </div>
  );
}
