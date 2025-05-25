'use client';

import { useState } from "react";
import Image from "next/image";
import { CardsChat } from "@/components/cards/chat";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";
import { useUser } from "../contexts/UserContext";

type Message = {
  role: string;
  content: string;
};

export default function Battle(props: { threadId: string }) {
  const { threadId } = props;

  const user = useUser();

  const [input, setInput] = useState<string>('');
  const [messagesLeft, setMessagesLeft] = useState<Message[]>([]);
  const [messagesRight, setMessagesRight] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [showUserAnswer, setShowUserAnswer] = useState<boolean>(false);
  const [userAnswer, setUserAnswer] = useState<string>('');

  const handleSubmit = async (): Promise<void> => {
    if (!input.trim() || isLoading) return;

    const userMessage = input.trim();
    setInput('');
    setIsLoading(true);

    const newUserMessage: Message = { role: 'user', content: userMessage };
    const loadingMessage: Message = { role: 'assistant', content: '思考中...' };

    setMessagesLeft(prev => [...prev, newUserMessage, loadingMessage]);
    setMessagesRight(prev => [...prev, newUserMessage, loadingMessage]);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          threadId,
          message: userMessage
        }),
      });

      if (!response.body) {
        setIsLoading(false);

        return;
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();

      let openaiResponse = '';
      let geminiResponse = '';

      let done = false;

      while (!done) {
        const { value, done: readerDone } = await reader.read();
        done = readerDone;

        if (value) {
          const textChunk = decoder.decode(value, { stream: true });
          const lines = textChunk.split('\n').filter(Boolean);

          for (const line of lines) {
            const data = JSON.parse(line);

            switch (data.type) {
            case 'model1':
              openaiResponse += data.content;
              setMessagesLeft(prev => [
                ...prev.slice(0, -1),
                { role: 'assistant', content: openaiResponse }
              ]);
              break;
            case 'model2':
              geminiResponse += data.content;
              setMessagesRight(prev => [
                ...prev.slice(0, -1),
                { role: 'assistant', content: geminiResponse }
              ]);
            }
          }
        }
      }

    } catch {
      setMessagesLeft(prev => [
        ...prev.slice(0, -1),
        { role: 'assistant', content: '請求處理時發生錯誤' }
      ]);
      setMessagesRight(prev => [
        ...prev.slice(0, -1),
        { role: 'assistant', content: '請求處理時發生錯誤' }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmitResult = async (result: 'A_IS_BETTER' | 'B_IS_BETTER' | 'TIE' | 'BOTH_BAD'): Promise<void> => {
    const response = await fetch('/api/submit', {
      method: 'POST',
      body: JSON.stringify({ threadID: threadId, result })
    })

    if (response.ok) {
      toast({
        title: '提交成功',
        description: '感謝您的參與！'
      })
    } else {
      toast({
        title: '提交失敗',
        description: '請稍後再試'
      })
    }
  };

  const handleSubmitUserAnswer = async (): Promise<void> => {
    if (!userAnswer.trim()) {
      toast({
        title: '冒險者！你的答案卷軸是空的',
        description: '在踏上征途前，請先寫下你的智慧之語！'
      });

      return;
    }

    const response = await fetch('/api/submit-answer', {
      method: 'POST',
      body: JSON.stringify({
        threadID: threadId,
        userAnswer
      })
    });

    if (response.ok) {
      toast({
        title: '答案已收入知識寶庫！',
        description: '太厲害了！你的智慧之光照亮了整個魔法世界！'
      });

      setUserAnswer('');
      setShowUserAnswer(false);
    } else {
      toast({
        title: '魔法傳送失敗',
        description: '哎呀！魔法能量不足，請稍後再試一次吧～'
      });
    }
  };

  return (
    <div className="w-full h-full relative">
      <div className="flex flex-col h-full">
        <div className="flex-1 overflow-auto p-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-white rounded-xl p-4 shadow-sm">
              <h2 className="text-lg font-semibold mb-2 text-center">AI 1號</h2>
              <CardsChat messages={messagesLeft} title="模型 A" />
            </div>
            <div className="bg-white rounded-xl p-4 shadow-sm">
              <h2 className="text-lg font-semibold mb-2 text-center">AI 2號</h2>
              <CardsChat messages={messagesRight} title="模型 B" />
            </div>
          </div>
        </div>
        <div className="p-4 border-t bg-white">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSubmit();
            }}
            className="flex gap-2 items-center"
          >
            <img src={user?.avatar || '/default-avatar.png'} alt="avatar" className="w-8 h-8 rounded-full" />
            <div className="relative flex-1">
              <Input
                value={input}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setInput(e.target.value)}
                placeholder={isLoading ? "AI 正在回答中..." : "輸入你想要問 AI 的問題 ..."}
                disabled={isLoading}
                className="pr-10"
              />
              <button
                type="submit"
                disabled={isLoading}
                className="absolute right-2 top-1/2 transform -translate-y-1/2"
              >
                <Image
                  src="/icons/chat/send.svg"
                  alt="Send"
                  width={24}
                  height={24}
                />
              </button>
            </div>
          </form>
          <div className="mt-4">
            <h3 className="text-center font-medium mb-4">您覺得哪個回覆比較好？</h3>
            <div className="flex justify-center gap-4 mb-4">
              <Button
                onClick={() => { handleSubmitResult('A_IS_BETTER') }}
                variant="outline"
                className="flex items-center gap-2 px-4 py-2 rounded-full"
                disabled={isLoading}
              >
                <Image src="/icons/chat/thumb-left.svg" alt="Left" width={20} height={20} />
                <span>一號比較好</span>
              </Button>
              <Button
                onClick={() => { handleSubmitResult('B_IS_BETTER') }}
                variant="outline"
                className="flex items-center gap-2 px-4 py-2 rounded-full"
                disabled={isLoading}
              >
                <span>二號比較好</span>
                <Image src="/icons/chat/thumb-right.svg" alt="Right" width={20} height={20} />
              </Button>
            </div>
            <div className="flex justify-center gap-4">
              <Button
                onClick={() => { handleSubmitResult('TIE') }}
                variant="outline"
                className="flex items-center gap-2 px-4 py-2 rounded-full"
                disabled={isLoading}
              >
                <Image src="/icons/chat/tie.svg" alt="Tie" width={20} height={20} />
                <span>平手</span>
              </Button>
              <Button
                onClick={() => { handleSubmitResult('BOTH_BAD') }}
                variant="outline"
                className="flex items-center gap-2 px-4 py-2 rounded-full"
                disabled={isLoading}
              >
                <Image src="/icons/chat/badface.svg" alt="Bad" width={20} height={20} />
                <span>都不好</span>
              </Button>
              <Button
                onClick={() => {
                  if (messagesLeft.length === 0 || messagesRight.length === 0) {
                    toast({
                      title: '等等！冒險尚未開始',
                      description: '先向智慧大師提出你的問題，才能記錄你的答案卷軸！'
                    });

                    return;
                  }

                  setShowUserAnswer(true);
                }}
                variant="outline"
                className="flex items-center gap-2 px-4 py-2 rounded-full"
                disabled={isLoading}
              >
                <Image src="/icons/chat/write.svg" alt="Write" width={20} height={20} />
                <span>提供正確答案</span>
              </Button>
            </div>
          </div>
          {showUserAnswer && (
            <div className="mt-5 bg-gray-50 p-4 rounded-lg">
              <h3 className="font-medium mb-2">提供您的正確答案</h3>
              <textarea
                value={userAnswer}
                onChange={(e) => setUserAnswer(e.target.value)}
                placeholder="請提供您的答案..."
                className="w-full p-3 border rounded-lg min-h-[120px] focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                disabled={isLoading}
              />
              <div className="flex justify-end mt-3 gap-2">
                <Button
                  onClick={() => { setShowUserAnswer(false); setUserAnswer(''); }}
                  variant="outline"
                  className="rounded-full"
                  disabled={isLoading}
                >
                  取消
                </Button>
                <Button
                  onClick={() => { handleSubmitUserAnswer(); }}
                  disabled={isLoading || !userAnswer.trim()}
                  className="rounded-full bg-blue-500 hover:bg-blue-600"
                >
                  <div className="flex items-center gap-2">
                    <Image src="/icons/chat/share.svg" alt="Share" width={16} height={16} />
                    <span>送出答案</span>
                  </div>
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
