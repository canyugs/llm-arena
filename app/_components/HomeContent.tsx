'use client';

import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { useUser } from '@/app/contexts/UserContext';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

interface Topic {
  id: number;
  title: string;
  views: number;
  days: number;
}

interface HomeContentProps {
  newThreadId: string;
  hotTopics: Topic[];
}

export default function HomeContent({ newThreadId, hotTopics }: HomeContentProps) {
  const { toast } = useToast();
  const user = useUser();
  const router = useRouter();
  const [message, setMessage] = useState('');
  const [mobileMessage, setMobileMessage] = useState('');

  const handleFeatureUnderConstruction = () => {
    toast({
      title: "功能建置中",
      description: "此功能正在開發中，敬請期待！",
      variant: "default",
    });
  };

  const handleLoginRequired = async () => {
    if (!user) {
      toast({
        title: "需要登入",
        description: (
          <div className="flex flex-col space-y-3">
            <span>請先登入以使用此功能</span>
            <Button
              onClick={() => window.location.href = '/api/auth/login'}
              className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg w-fit"
            >
              立即登入
            </Button>
          </div>
        ),
        variant: "default",
        duration: 5000,
      });

      return;
    }

    handleFeatureUnderConstruction();
  };

  const handleSubmit = async (messageText: string) => {
    if (!messageText.trim()) return;
    
    if (!user) {
      handleLoginRequired();
      return;
    }

    // 使用客戶端路由導航，將訊息存儲在 sessionStorage 中
    // 這樣可以避免訊息出現在 URL 中，同時保持 ChatClient 的現有邏輯
    sessionStorage.setItem('pendingMessage', messageText);
    router.push(`/?threadId=${newThreadId}`);
  };

  const handleDesktopSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleSubmit(message);
  };

  const handleMobileSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleSubmit(mobileMessage);
  };

  return (
    <div className="w-full min-h-screen bg-white md:pb-0 pb-16">
      {/* 主要內容區 */}
      <main className="container mx-auto px-4 py-8">
        {/* 頂部區塊 - 只在桌面版顯示 */}
        <section className="hidden md:block bg-[#F8FAFF] rounded-xl py-12 mb-8 p-6 md:p-8 text-center">
          <h1 className="text-2xl md:text-3xl font-medium mb-8 leading-relaxed">
            AI 能理解台灣歷史與價值，是因為有你的參與
          </h1>
          <div className="max-w-4xl mx-auto relative px-4">
            <div className="relative">
              <div className="relative w-full">
                <form onSubmit={handleDesktopSubmit} className="w-full">
                  <div className="relative w-full">
                    <Input
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      className="w-full pr-32 py-7 text-base border border-gray-100 bg-white focus-visible:ring-0 focus-visible:ring-offset-0 rounded-lg shadow-sm"
                      placeholder="AI 想聽你說說話......"
                      required
                    />
                    <Button
                      type="submit"
                      className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-blue-500 hover:bg-blue-600 text-white px-5 py-2.5 rounded-lg flex items-center gap-2"
                    >
                      <img src="/icons/chat/send.svg" alt="Send" width={16} height={16} />
                      <span>{user ? '新的交談' : '登入開始對話'}</span>
                    </Button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </section>

        {/* 手機版固定在底部的輸入框 */}
        <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t p-2 z-20">
          <div className="relative flex items-center">
            <form onSubmit={handleMobileSubmit} className="w-full">
              <div className="relative">
                <Input
                  value={mobileMessage}
                  onChange={(e) => setMobileMessage(e.target.value)}
                  className="pr-14 py-3 text-base border border-gray-100 bg-white focus-visible:ring-0 focus-visible:ring-offset-0 rounded-lg"
                  placeholder="AI想聽你說說話!"
                  required
                />
                <Button
                  type="submit"
                  className="absolute right-1 top-1/2 transform -translate-y-1/2 bg-blue-500 hover:bg-blue-600 text-white p-2 rounded-lg flex items-center justify-center"
                >
                  <img src="/icons/chat/send.svg" alt="Send" width={16} height={16} />
                </Button>
              </div>
            </form>
          </div>
        </div>

        {/* 熱門問題區 */}
        <section className="mt-8 md:bg-gray-50 rounded-xl p-6 md:p-8">
          {/* 手機版標題 - 只在手機版顯示 */}
          <h2 className="text-xl font-medium text-gray-700 mb-6 md:hidden text-left">熱門問題 TOP-10 (開發中)</h2>

          {/* 桌面版標題和搜尋框 - 只在桌面版顯示 */}
          <div className="hidden md:flex justify-between items-center mb-6">
            <h2 className="text-xl font-medium text-gray-700">熱門問題 TOP-10 (開發中)</h2>
            <div className="relative">
              <Input className="pl-10 py-1 text-sm border-gray-200 bg-white focus-visible:ring-0 focus-visible:ring-offset-0 rounded-lg" placeholder="搜尋" />
              <img src="/icons/search.svg" alt="Search" width={16} height={16} className="absolute left-3 top-1/2 transform -translate-y-1/2" />
            </div>
          </div>

          {/* 問題列表 */}
          <div className="space-y-4">
            {hotTopics.map((topic) => (
              <div
                key={topic.id}
                onClick={() => user ? handleSubmit(topic.title) : handleLoginRequired()}
                className="block bg-white rounded-xl p-4 hover:shadow-md transition-shadow duration-200 border border-gray-100 shadow-sm md:shadow-none cursor-pointer"
              >
                <div className="md:flex md:justify-between md:items-center">
                  <h3 className="text-base md:text-lg font-medium text-gray-800 text-center md:text-left w-full">{topic.title}</h3>
                  {/* 觀看數和時間只在桌面版顯示 */}
                  <div className="hidden md:flex items-center text-gray-500 text-sm whitespace-nowrap">
                    <div className="flex items-center mr-6">
                      <img src="/icons/answernumber.svg" alt="Views" width={16} height={16} className="mr-2" />
                      <span>{topic.views}</span>
                    </div>
                    <div className="flex items-center">
                      <img src="/icons/time.svg" alt="Time" width={16} height={16} className="mr-2" />
                      <span>{topic.days}days</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}
