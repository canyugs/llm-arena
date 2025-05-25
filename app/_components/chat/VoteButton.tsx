"use client";
import Image from "next/image";

// 投票按鈕元件
export type VoteButtonProps = {
  icon: string;
  alt: string;
  text: string;
  className?: string;
  isActive: boolean; // 按鈕是否處於選中狀態
  onClick: () => void; // 點擊事件
};

export const VoteButton = ({
  icon,
  alt,
  text,
  className = "",
  isActive,
  onClick
}: VoteButtonProps) => {
  // 根據 active 狀態設置不同的樣式
  const buttonStyle = isActive
    ? "bg-[#C5E0FF] border-[#C5E0FF] hover:bg-[#C5E0FF]"
    : "bg-white border-gray-200 hover:bg-gray-50";

  const textStyle = isActive ? "text-[#0066CC]" : "text-gray-600";

  return (
    <button
      onClick={onClick}
      className={`flex items-center justify-center py-3 border rounded-lg ${buttonStyle} ${className}`}
    >
      <Image
        src={icon}
        alt={alt}
        width={20}
        height={20}
        className={`mr-2 ${isActive ? "text-[#0066CC]" : ""}`}
      />
      <span className={`text-sm ${textStyle}`}>{text}</span>
    </button>
  );
};
