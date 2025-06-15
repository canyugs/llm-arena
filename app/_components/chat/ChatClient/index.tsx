'use client';

import { useState, useEffect } from 'react';
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

export default function ChatClient({ threadId, initialMessage }: { threadId: string; initialMessage?: string }) {
  const user = useUser();
  
  // 使用自定義 hooks 管理狀態和邏輯
  const { 
    messagesLeft, 
    messagesRight, 
    isLoading, 
    setMessagesLeft, 
    setMessagesRight, 
    setIsLoading 
  } = useChatMessages();

  // 頁面載入時載入歷史對話（如果有 threadId 且沒有 initialMessage）
  useEffect(() => {
    async function loadExistingHistory() {
      // 如果有 initialMessage，表示這是新對話，不需要載入歷史
      if (initialMessage) {
        console.log('[Client] Skipping history load - has initialMessage');
        return;
      }
      
      // 如果已經有訊息或正在載入，不重複載入
      if (messagesLeft.length > 0 || messagesRight.length > 0 || isLoading) {
        return;
      }
      
      console.log('[Client] Loading existing history for threadId:', threadId);
      
      try {
        // 使用一個特殊的 API 來只載入歷史，不發送新訊息
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
            setMessagesLeft(left.map((msg: {role: string, content: string}) => ({ role: msg.role as 'user' | 'assistant', content: msg.content })));
            setMessagesRight(right.map((msg: {role: string, content: string}) => ({ role: msg.role as 'user' | 'assistant', content: msg.content })));
          }
        }
      } catch (error) {
        console.log('[Client] Error loading history:', error);
      }
    }
    
    loadExistingHistory();
  }, [threadId, initialMessage, messagesLeft.length, messagesRight.length, isLoading]);
  
  const { 
    input, 
    setInput, 
    handleSubmit, 
    handleSubmitWithMessage 
  } = useChatSubmission({
    threadId,
    initialMessage,
    messagesLeft,
    messagesRight,
    setMessagesLeft,
    setMessagesRight,
    setIsLoading
  });
  
  const { 
    selectedVote, 
    hasVoted, 
    setHasVoted, 
    handleVoteSelect 
  } = useVoting({ threadId });
  
  // 控制回答側邊欄的顯示
  const [showAnswerSidebar, setShowAnswerSidebar] = useState(false);
  
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
                {/* 顯示最後一個用戶訊息 */}
                {messagesLeft.length >= 2 && messagesLeft[messagesLeft.length - 2].role === 'user' && (
                  <UserMessage
                    username={user?.username || "知識狂熱士"}
                    time={new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    content={messagesLeft[messagesLeft.length - 2].content}
                    className="mb-4 w-full max-w-[1024px]"
                  />
                )}

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
