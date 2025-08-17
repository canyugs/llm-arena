'use client';

import { useMemo } from 'react';
import logger from '@/lib/logger';
import { AIResponse } from '../../AIResponse';
import { useChatContext } from '../context/ChatContext';

export default function AIResponseContainer() {
  const { messagesLeft, messagesRight } = useChatContext();

  // 調試：追蹤重新渲染（生產環境預設關閉，見 logger 實作）
  logger.debug('[AIResponseContainer] Rendering with:', {
    leftCount: messagesLeft.length,
    rightCount: messagesRight.length,
    timestamp: new Date().toISOString()
  });

  // 使用 useMemo 穩定內容計算，避免不必要的重新渲染
  const leftContent = useMemo(() => {
    return messagesLeft.length > 0 &&
           messagesLeft[messagesLeft.length - 1].role === 'assistant'
      ? messagesLeft[messagesLeft.length - 1].content
      : "等待您的問題...";
  }, [messagesLeft]);

  const rightContent = useMemo(() => {
    return messagesRight.length > 0 &&
           messagesRight[messagesRight.length - 1].role === 'assistant'
      ? messagesRight[messagesRight.length - 1].content
      : "等待您的問題...";
  }, [messagesRight]);

  return (
    <div id="ai-responses-container" className="w-full max-w-[1024px] overflow-visible">
      {/* Mobile view - horizontal scroll */}
      <div className="md:hidden mb-4 overflow-visible">
        <div
          className="flex h-[350px] w-screen overflow-x-auto scroll-smooth scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent snap-x snap-mandatory gap-4"
        >
          {/* AI 1 response */}
          <div className="w-[80vw] max-w-[360px] flex-shrink-0 snap-start">
            <AIResponse
              number="1號"
              content={leftContent}
            />
          </div>

          {/* AI 2 response */}
          <div className="w-[80vw] max-w-[360px] flex-shrink-0 snap-start">
            <AIResponse
              number="2號"
              content={rightContent}
            />
          </div>
        </div>
      </div>

      {/* Desktop view - side by side */}
      <div className="hidden md:flex flex-row gap-4 w-full">
        {/* AI 1 response */}
        <div className="w-1/2">
          <AIResponse
            number="1號"
            content={leftContent}
          />
        </div>

        {/* AI 2 response */}
        <div className="w-1/2">
          <AIResponse
            number="2號"
            content={rightContent}
          />
        </div>
      </div>
    </div>
  );
}
