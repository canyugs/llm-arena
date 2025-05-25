'use client';

import { useState, useEffect } from "react";
import { toast } from "@/hooks/use-toast";
import { useUser } from "@/app/contexts/UserContext";
import { VoteButton } from "./VoteButton";
import { AIResponse } from "./AIResponse";
import { UserMessage } from "./UserMessage";
import { InputBox } from "./InputBox";
import { AnswerSidebar } from "./AnswerSidebar";

type Message = {
  role: string;
  content: string;
};

export default function ChatClient({ threadId, initialMessage }: { threadId: string; initialMessage?: string }) {
  const user = useUser();

  // 記錄選中的投票按鈕
  const [selectedVote, setSelectedVote] = useState<string | null>(null);
  // 控制回答側邊欄的顯示
  const [showAnswerSidebar, setShowAnswerSidebar] = useState(false);
  // 聊天消息狀態
  const [messagesLeft, setMessagesLeft] = useState<Message[]>([]);
  const [messagesRight, setMessagesRight] = useState<Message[]>([]);
  // 用戶輸入
  const [input, setInput] = useState<string>(initialMessage || '');

  // 如果有初始消息，自動提交
  useEffect(() => {
    if (initialMessage && initialMessage.trim() && !isLoading && messagesLeft.length === 0) {
      handleSubmit();
    }
  }, []);
  // 加載狀態
  const [isLoading, setIsLoading] = useState<boolean>(false);
  // 用戶答案
  const [userAnswer, setUserAnswer] = useState<string>('');
  // 是否已經投票
  const [hasVoted, setHasVoted] = useState<boolean>(false);

  // 處理提交消息
  const handleSubmit = async (): Promise<void> => {
    if (!input.trim() || isLoading) return;

    const userMessage = input.trim();
    setInput('');
    setIsLoading(true);
    setHasVoted(false); // 重置投票狀態
    setSelectedVote(null); // 重置選中的投票按鈕

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

    } catch (error) {
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

  // 處理按鈕選擇
  const handleVoteSelect = (text: string) => {
    // 如果正在加載或已經投票，不允許選擇
    if (isLoading || hasVoted) return;

    // 如果是「我來回答」按鈕，顯示側邊欄
    if (text === "我來回答") {
      setShowAnswerSidebar(true);

      return;
    }

    // 如果選中的是已經選中的按鈕，則取消選中
    if (selectedVote === text) {
      setSelectedVote(null);
    } else {
      setSelectedVote(text);

      // 根據選擇的按鈕，提交相應的結果
      let result: 'A_IS_BETTER' | 'B_IS_BETTER' | 'TIE' | 'BOTH_BAD';

      switch (text) {
      case "1號比較讚":
        result = 'A_IS_BETTER';
        break;
      case "2號比較讚":
        result = 'B_IS_BETTER';
        break;
      case "平手":
        result = 'TIE';
        break;
      case "兩邊都很爛":
        result = 'BOTH_BAD';
        break;
      default:
        return;
      }

      // 提交投票結果
      handleSubmitResult(result);
    }
  };

  // 提交投票結果
  const handleSubmitResult = async (result: 'A_IS_BETTER' | 'B_IS_BETTER' | 'TIE' | 'BOTH_BAD'): Promise<void> => {
    const response = await fetch('/api/submit', {
      method: 'POST',
      body: JSON.stringify({ threadID: threadId, result })
    });

    if (response.ok) {
      toast({
        title: '提交成功',
        description: '感謝您的參與！'
      });
      setHasVoted(true); // 標記已經投票
    } else {
      toast({
        title: '提交失敗',
        description: '請稍後再試'
      });
    }
  };

  // 關閉側邊欄
  const handleCloseSidebar = () => {
    setShowAnswerSidebar(false);
  };

  // 自定義 InputBox 組件的 props
  const inputBoxProps = {
    placeholder: hasVoted
      ? "輸入你想要問 AI 的問題 ..."
      : "點一下回覆的評價按鈕就能繼續跟我聊天！",
    value: input,
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => setInput(e.target.value),
    onSubmit: handleSubmit,
    disabled: isLoading || !hasVoted
  };

  return (
    <div className="w-full h-full">
      {/* 回答側邊欄 */}
      <AnswerSidebar
        isOpen={showAnswerSidebar}
        onClose={handleCloseSidebar}
        threadId={threadId}
        onSuccess={() => setHasVoted(true)}
      />
      {/* Main content container */}
      <div className="container mx-auto px-4 mt-6 mb-20 md:mb-0">
        <div className="bg-[#F4F9FF] rounded-lg p-6 flex flex-col items-center">
          {messagesLeft.length === 0 ? (
            // 初始狀態顯示歡迎訊息
            <div className="text-center my-6 w-full max-w-[1024px]">
              <h2 className="text-xl font-medium text-gray-800">歡迎來到 AI 競技場</h2>
              <p className="text-gray-600 mt-2">輸入您的問題，讓兩個 AI 模型為您解答！</p>
            </div>
          ) : (
            // 顯示聊天記錄
            <>
              {/* 顯示最後一個用戶訊息 */}
              {messagesLeft.length >= 2 && messagesLeft[messagesLeft.length - 2].role === 'user' && (
                <UserMessage
                  username={user?.username || "知識狂熱士"}
                  time={new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  content={messagesLeft[messagesLeft.length - 2].content}
                  className="mb-4 w-full max-w-[1024px]"
                />
              )}

              {/* Main question */}
              <div className="text-center my-6 w-full max-w-[1024px]">
                <h2 className="text-xl font-medium text-gray-800">您覺得哪個回覆比較好？</h2>
              </div>

              {/* AI responses - side by side on desktop, horizontal scroll on mobile */}
              <div className="w-full max-w-[1024px] overflow-x-auto md:overflow-visible">
                {/* Mobile view - horizontal scroll */}
                <div className="md:hidden w-full mb-4">
                  {/* Scroll container - with enhanced scrolling for all devices */}
                  <div className="flex flex-row gap-6 w-full overflow-x-auto pb-4 px-4 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent">
                    {/* Wrapper to ensure consistent heights */}
                    <div className="flex h-[350px] gap-4 min-w-max">
                      {/* AI 1 response */}
                      <div className="w-[80vw] max-w-[400px] flex-shrink-0">
                        <AIResponse
                          number="1號"
                          content={messagesLeft.length > 0 && messagesLeft[messagesLeft.length - 1].role === 'assistant'
                            ? messagesLeft[messagesLeft.length - 1].content
                            : "等待您的問題..."}
                        />
                      </div>

                      {/* AI 2 response */}
                      <div className="w-[80vw] max-w-[400px] flex-shrink-0">
                        <AIResponse
                          number="2號"
                          content={messagesRight.length > 0 && messagesRight[messagesRight.length - 1].role === 'assistant'
                            ? messagesRight[messagesRight.length - 1].content
                            : "等待您的問題..."}
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Desktop view - side by side */}
                <div className="hidden md:flex flex-row gap-4 w-full">
                  {/* AI 1 response */}
                  <div className="w-1/2">
                    <AIResponse
                      number="1號"
                      content={messagesLeft.length > 0 && messagesLeft[messagesLeft.length - 1].role === 'assistant'
                        ? messagesLeft[messagesLeft.length - 1].content
                        : "等待您的問題..."}
                    />
                  </div>

                  {/* AI 2 response */}
                  <div className="w-1/2">
                    <AIResponse
                      number="2號"
                      content={messagesRight.length > 0 && messagesRight[messagesRight.length - 1].role === 'assistant'
                        ? messagesRight[messagesRight.length - 1].content
                        : "等待您的問題..."}
                    />
                  </div>
                </div>
              </div>

              {/* Voting buttons - 1號 and 2號 */}
              <div className="flex justify-center gap-4 w-full max-w-[1024px] mt-6">
                <VoteButton
                  icon="/icons/chat/thumb-left.svg"
                  alt="Thumb Left"
                  text="1號比較讚"
                  className="flex-1"
                  isActive={selectedVote === "1號比較讚"}
                  onClick={() => handleVoteSelect("1號比較讚")}
                />
                <VoteButton
                  icon="/icons/chat/thumb-right.svg"
                  alt="Thumb Right"
                  text="2號比較讚"
                  className="flex-1"
                  isActive={selectedVote === "2號比較讚"}
                  onClick={() => handleVoteSelect("2號比較讚")}
                />
              </div>

              {/* Additional voting options - 3 buttons */}
              <div className="grid grid-cols-3 gap-4 w-full max-w-[1024px] mt-4">
                <VoteButton
                  icon="/icons/chat/tie.svg"
                  alt="Tie"
                  text="平手"
                  isActive={selectedVote === "平手"}
                  onClick={() => handleVoteSelect("平手")}
                />
                <VoteButton
                  icon="/icons/chat/badface.svg"
                  alt="Both Bad"
                  text="兩邊都很爛"
                  isActive={selectedVote === "兩邊都很爛"}
                  onClick={() => handleVoteSelect("兩邊都很爛")}
                />
                <VoteButton
                  icon="/icons/chat/write.svg"
                  alt="Provide Answer"
                  text="我來回答"
                  isActive={selectedVote === "我來回答"}
                  onClick={() => handleVoteSelect("我來回答")}
                />
              </div>
            </>
          )}
        </div>
      </div>

      {/* 使用更新後的 InputBox 組件 */}
      <InputBox
        placeholder={hasVoted ? "輸入你想要問 AI 的問題 ..." : "點一下回覆的評價按鈕就能繼續跟我聊天！"}
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onSubmit={handleSubmit}
        disabled={isLoading || !hasVoted}
        hasVoted={hasVoted}
      />
    </div>
  );
}
