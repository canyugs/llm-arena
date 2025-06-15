'use client';

import { AIResponse } from '../../AIResponse';
import { useChatContext } from '../context/ChatContext';

export default function AIResponseContainer() {
  const { messagesLeft, messagesRight } = useChatContext();
  
  return (
    <div className="w-full max-w-[1024px] overflow-visible">
      {/* Mobile view - horizontal scroll */}
      <div className="md:hidden mb-4 overflow-visible">
        <div
          id="mobile-ai-response-container"
          className="flex h-[350px] w-screen overflow-x-auto scroll-smooth scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent snap-x snap-mandatory gap-4"
        >
          {/* AI 1 response */}
          <div className="w-[80vw] max-w-[360px] flex-shrink-0 snap-start">
            <AIResponse
              number="1號"
              content={
                messagesLeft.length > 0 &&
                messagesLeft[messagesLeft.length - 1].role === 'assistant'
                  ? messagesLeft[messagesLeft.length - 1].content
                  : "等待您的問題..."
              }
            />
          </div>

          {/* AI 2 response */}
          <div className="w-[80vw] max-w-[360px] flex-shrink-0 snap-start">
            <AIResponse
              number="2號"
              content={
                messagesRight.length > 0 &&
                messagesRight[messagesRight.length - 1].role === 'assistant'
                  ? messagesRight[messagesRight.length - 1].content
                  : "等待您的問題..."
              }
            />
          </div>
        </div>
      </div>

      {/* Desktop view - side by side */}
      <div id="desktop-ai-response-container" className="hidden md:flex flex-row gap-4 w-full">
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
  );
}
