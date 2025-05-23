import { ObjectId } from "mongodb";
import ChatClient from "./_components/chat/ChatClient";
import HomeContent from "./_components/HomeContent";

export default async function Home({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
  // 預先生成一個 threadId 供頁面使用
  const newThreadId = new ObjectId().toHexString();

  const params = await searchParams;
  const { threadId, message } = params;

  // 如果有 threadId 和 message，顯示聊天界面
  if (threadId && typeof threadId === 'string') {
    return (
      <div className="w-full h-full relative">
        <ChatClient threadId={threadId} initialMessage={typeof message === 'string' ? message : undefined} />
      </div>
    );
  }

  // 假資料：熱門問題
  const hotTopics = [
    { id: 1, title: '如果未來 AI 出題，考試會變成什麼樣子？', views: 35, days: 2 },
    { id: 2, title: '幫我分析歷年台灣高雄地區的立委選舉各行政區趨勢，數據......', views: 52, days: 2 },
    { id: 3, title: '如何訓練 AI 用最道地的台語聊天？', views: 35, days: 2 },
    { id: 4, title: '請告訴我LLM的演變歷史，以及簡單的理論介紹', views: 35, days: 2 },
    { id: 5, title: '請幫設計一款結合台灣夜市文化的手遊(包含玩法)', views: 35, days: 2 },
    { id: 6, title: '現在台灣房價還會繼續漲嗎', views: 28, days: 1 },
    { id: 7, title: '幫我寫一首有押韻的當代台語流行歌詞風格類似流子菸', views: 42, days: 3 },
    { id: 8, title: '你覺得買筆電和電腦的優缺點在哪', views: 31, days: 2 },
    { id: 9, title: '幫我設計一份台灣未來城市概念計畫書', views: 47, days: 4 },
    { id: 10, title: '如果發生地震的話該怎麼辦', views: 63, days: 1 }
  ];

  return <HomeContent newThreadId={newThreadId} hotTopics={hotTopics} />;

}

;
