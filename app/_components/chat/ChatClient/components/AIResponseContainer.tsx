'use client';

import { AIResponse } from '../../AIResponse';
import { useChatContext } from '../context/ChatContext';

export default function AIResponseContainer() {
  const { messagesLeft, messagesRight } = useChatContext();
  
  return (
    <div className="w-full max-w-[1024px] overflow-x-auto md:overflow-visible">
      {/* Mobile view - horizontal scroll */}
      <div className="md:hidden w-full mb-4">
        <div className="flex flex-row gap-6 w-full overflow-x-auto pb-4 px-4 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent">
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
  );
}
