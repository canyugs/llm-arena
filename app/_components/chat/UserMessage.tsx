"use client";
import Image from "next/image";
import { ShareModal } from "./ShareModal";
import { useShare } from "./hooks/useShare";

// 用戶訊息元件
export type UserMessageProps = {
  username: string; // 用戶名稱
  time: string; // 時間
  content: string; // 訊息內容
  className?: string;
};

export const UserMessage = ({
  username,
  time,
  content,
  className = ""
}: UserMessageProps) => {
  const { isShareModalOpen, isConversationComplete, handleShare, closeShareModal } = useShare();

  return (
    <>
      <div className={`bg-white rounded-lg p-4 flex items-center ${className}`}>
        {/* User avatar */}
        <div id="user-message-avatar" className="mr-3 flex items-center h-full">
          <div className="w-8 h-8 bg-[#E9F3FF] rounded-full flex items-center justify-center">
            <Image
              src="/icons/nav/profile.svg"
              alt="User"
              width={16}
              height={16}
            />
          </div>
        </div>

        {/* User info and message */}
        <div className="flex-1 flex flex-col justify-center">
          <div id="user-message-username" className="flex items-center mb-1">
            <span className="font-medium text-sm mr-2">{username}</span>
            <span className="text-gray-500 text-xs">{time}</span>
          </div>
          <p id="user-message-question" className="text-sm text-gray-700">{content}</p>
        </div>

        {/* Share button */}
        <div id="user-message-share-button" className="flex items-center h-full">
          <button
            className={`p-1.5 rounded-full transition-all duration-200 ${
              isConversationComplete() 
                ? 'bg-[#E9EBEE] hover:bg-opacity-90 cursor-pointer' 
                : 'bg-gray-200 cursor-not-allowed opacity-50'
            }`}
            onClick={handleShare}
            aria-label={isConversationComplete() ? '分享對話' : '請等待AI回應完成'}
            title={isConversationComplete() ? '分享對話' : '請等待AI回應完成'}
            disabled={!isConversationComplete()}
          >
            <Image
              src="/icons/chat/share.svg"
              alt="Share"
              width={16}
              height={16}
              className={`transition-opacity duration-200 ${
                isConversationComplete() ? 'opacity-100' : 'opacity-50'
              }`}
            />
          </button>
        </div>
      </div>

      <ShareModal 
        isOpen={isShareModalOpen} 
        onClose={closeShareModal} 
      />
    </>
  );
};
