'use client';

import { useState } from 'react';
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

  // 移除 GET 請求的 useEffect，歷史會在 POST 時一併處理
  
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
