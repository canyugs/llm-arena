'use client';

import { useState, useEffect, useRef } from 'react';
import { useUser } from '@/app/contexts/UserContext';
import { UserMessage } from '../UserMessage';
import { AnswerSidebar } from '../AnswerSidebar';
import { ChatProvider } from './context/ChatContext';
import AIResponseContainer from './components/AIResponseContainer';
import VotingSection from './components/VotingSection';
import ChatHeader from './components/ChatHeader';
import ChatControls from './components/ChatControls';
import { useChatMessages } from './hooks/useChatMessages';
import { useChatSubmission } from './hooks/useChatSubmission';
import { useVoting } from './hooks/useVoting';

export default function ChatClient({ threadId }: { threadId: string }) {
  const user = useUser();

  // 使用 ref 追蹤載入狀態，防止重複載入
  const isLoadingRef = useRef(false);
  const loadedThreadIdRef = useRef<string | null>(null);

  // 使用自定義 hooks 管理狀態和邏輯
  const {
    messagesLeft,
    messagesRight,
    isLoading,
    setMessagesLeft,
    setMessagesRight,
    setIsLoading
  } = useChatMessages();

  // 頁面載入時載入歷史對話和 thread 信息
  useEffect(() => {
    async function loadThreadData() {
      // 防止重複載入：檢查是否已經載入過相同的 threadId
      if (isLoadingRef.current || loadedThreadIdRef.current === threadId) {
        console.log('[Client] Skipping duplicate load for threadId:', threadId);

        return;
      }

      // 如果已經有訊息，不重複載入
      if (messagesLeft.length > 0 || messagesRight.length > 0) {
        console.log('[Client] Messages already exist, skipping load');

        return;
      }

      // 標記開始載入
      isLoadingRef.current = true;
      loadedThreadIdRef.current = threadId;

      console.log('[Client] Loading thread data for threadId:', threadId);

      try {
        // 載入歷史對話
        const response = await fetch('/api/chat/history', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({ threadId })
        });

        if (response.ok) {
          const { messagesLeft: left, messagesRight: right } = await response.json();
          console.log('[Client] History loaded:', { leftCount: left.length, rightCount: right.length });

          if (left.length > 0 || right.length > 0) {
            // 有歷史對話，直接載入
            setMessagesLeft(left.map((msg: {role: string, content: string}) => ({ role: msg.role as 'user' | 'assistant', content: msg.content })));
            setMessagesRight(right.map((msg: {role: string, content: string}) => ({ role: msg.role as 'user' | 'assistant', content: msg.content })));
          } else {
            // 沒有歷史對話，嘗試獲取 thread 的初始問題
            await loadInitialQuestion();
          }
        }
      } catch (error) {
        console.log('[Client] Error loading thread data:', error);
      } finally {
        // 載入完成，重置載入狀態
        isLoadingRef.current = false;
      }
    }

    async function loadInitialQuestion() {
      // 重試機制：新創建的 thread 可能需要一點時間才能在數據庫中可用
      const maxRetries = 3;
      const retryDelay = 1000; // 1秒

      for (let attempt = 1; attempt <= maxRetries; attempt++) {
        try {
          console.log(`[Client] Attempting to load thread info (attempt ${attempt}/${maxRetries})`);

          // 獲取 thread 詳細信息
          const response = await fetch('/api/thread/info', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify({ threadId })
          });

          if (response.ok) {
            const threadInfo = await response.json();
            const initialQuestion = threadInfo.initialContext?.question;

            if (initialQuestion && initialQuestion.trim()) {
              console.log('[Client] Found initial question, auto-submitting:', initialQuestion);
              // 自動提交初始問題
              setTimeout(() => {
                handleSubmitWithMessage(initialQuestion);
              }, 100);

              return; // 成功後退出
            } else {
              console.log('[Client] Thread found but no initial question');

              return; // thread 存在但沒有問題，也退出
            }
          } else if (response.status === 404 && attempt < maxRetries) {
            // Thread 不存在，等待一下再重試
            console.log(`[Client] Thread not found, retrying in ${retryDelay}ms...`);
            await new Promise(resolve => setTimeout(resolve, retryDelay));
            continue;
          } else {
            console.log(`[Client] Failed to load thread info: ${response.status}`);
            break;
          }
        } catch (error) {
          console.log(`[Client] Error loading initial question (attempt ${attempt}):`, error);

          if (attempt < maxRetries) {
            await new Promise(resolve => setTimeout(resolve, retryDelay));
          }
        }
      }

      console.log('[Client] Failed to load initial question after all retries');
    }

    loadThreadData();
  }, [threadId, isLoading]);

  // 控制回答側邊欄的顯示
  const [showAnswerSidebar, setShowAnswerSidebar] = useState(false);

  // 先調用 useVoting 來獲取投票狀態
  const {
    selectedVote,
    hasVoted,
    setHasVoted,
    handleVoteSelect
  } = useVoting({
    threadId,
    onShowAnswerSidebar: () => setShowAnswerSidebar(true) // 傳遞回調函數
  });

  // 再調用 useChatSubmission，傳遞投票狀態
  const {
    input,
    setInput,
    handleSubmit,
    handleSubmitWithMessage
  } = useChatSubmission({
    threadId,
    messagesLeft,
    messagesRight,
    setMessagesLeft,
    setMessagesRight,
    setIsLoading,
    hasVoted // 傳遞投票狀態
  });

  // 關閉側邊欄
  const handleCloseSidebar = () => {
    setShowAnswerSidebar(false);
  };

  return (
    <ChatProvider value={{
      messagesLeft,
      messagesRight,
      isLoading,
      selectedVote,
      hasVoted,
      threadId
    }}>
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
          <div className="bg-[#F4F9FF] rounded-lg p-4 flex flex-col items-center">
            {messagesLeft.length === 0 ? (
              // 初始狀態顯示歡迎訊息
              <ChatHeader showWelcome={true} />
            ) : (
              // 顯示聊天記錄
              <>
                {/* 顯示用戶訊息 - 改進邏輯以處理各種情況 */}
                {(() => {
                  // 情況1：有至少2條訊息，顯示倒數第二條（用戶問題）
                  if (messagesLeft.length >= 2 && messagesLeft[messagesLeft.length - 2].role === 'user') {
                    return (
                      <UserMessage
                        username={user?.username || "知識狂熱士"}
                        time={new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        content={messagesLeft[messagesLeft.length - 2].content}
                        className="mb-4 w-full max-w-[1024px]"
                      />
                    );
                  }
                  // 情況2：只有1條訊息且是用戶問題，直接顯示
                  else if (messagesLeft.length === 1 && messagesLeft[0].role === 'user') {
                    return (
                      <UserMessage
                        username={user?.username || "知識狂熱士"}
                        time={new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        content={messagesLeft[0].content}
                        className="mb-4 w-full max-w-[1024px]"
                      />
                    );
                  }
                  // 情況3：最後一條是用戶訊息（可能正在等待AI回應）
                  else if (messagesLeft.length > 0 && messagesLeft[messagesLeft.length - 1].role === 'user') {
                    return (
                      <UserMessage
                        username={user?.username || "知識狂熱士"}
                        time={new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        content={messagesLeft[messagesLeft.length - 1].content}
                        className="mb-4 w-full max-w-[1024px]"
                      />
                    );
                  }

                  return null;
                })()}

                <ChatHeader showWelcome={false} />
                <AIResponseContainer />
                <VotingSection onVoteSelect={handleVoteSelect} />
              </>
            )}
          </div>
        </div>

        <ChatControls
          input={input}
          setInput={setInput}
          onSubmit={handleSubmit}
          disabled={isLoading || !hasVoted}
          hasVoted={hasVoted}
        />
      </div>
    </ChatProvider>
  );
}
