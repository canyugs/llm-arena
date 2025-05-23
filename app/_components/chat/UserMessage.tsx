"use client";
import Image from "next/image";
import { toast } from "@/hooks/use-toast";

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
  // 處理分享按鈕點擊
  const handleShare = () => {
    // 使用共用 Toast 系統顯示提示
    toast({
      title: "功能建置中",
      variant: "default",
      duration: 3000,
    });
  };

  return (
    <div className={`bg-white rounded-lg p-4 flex items-center ${className}`}>
      {/* User avatar */}
      <div className="mr-3 flex items-center h-full">
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
        <div className="flex items-center mb-1">
          <span className="font-medium text-sm mr-2">{username}</span>
          <span className="text-gray-500 text-xs">{time}</span>
        </div>
        <p className="text-sm text-gray-700">
          {content}
        </p>
      </div>

      {/* Share button */}
      <div className="flex items-center h-full">
        <button
          className="bg-[#E9EBEE] hover:bg-opacity-90 p-1.5 rounded-full"
          onClick={handleShare}
        >
          <Image
            src="/icons/chat/share.svg"
            alt="Share"
            width={16}
            height={16}
          />
        </button>
      </div>
    </div>
  );
};
