"use client";
import Image from "next/image";

// 輸入框元件
export type InputBoxProps = {
  placeholder: string;
  className?: string;
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onSubmit?: () => void;
  disabled?: boolean;
  hasVoted?: boolean; // 新增屬性，用來判斷是否已投票
};

export const InputBox = ({
  placeholder,
  className = "",
  value = "",
  onChange,
  onSubmit,
  disabled = false,
  hasVoted = false // 預設為未投票
}: InputBoxProps) => {
  // 共用的輸入框樣式
  const commonInputStyle = "border border-[#E9EBEE] rounded-lg overflow-hidden";

  // 根據投票狀態決定按鈕樣式
  const commonButtonStyle = hasVoted
    ? "bg-[#2388FF] p-2 rounded-full flex items-center justify-center"
    : "bg-[#BAC0CC] p-2 rounded-full flex items-center justify-center";

  // 根據投票狀態決定輸入框背景色
  const formBgColor = hasVoted ? "bg-white" : "bg-[#F0F2F5]";

  return (
    <>
      {/* 桌面版輸入框 - 在手機版中隱藏 */}
      <div className={`container mx-auto px-4 mt-6 hidden md:flex justify-center ${className}`}>
        <div className={`${commonInputStyle} w-full max-w-[600px]`}>
          <form
            onSubmit={(e) => {
              e.preventDefault();

              if (onSubmit) {
                onSubmit();
              }
            }}
            className={`relative ${formBgColor} px-6 py-2 flex items-center`}
          >
            <input
              type="text"
              value={value}
              onChange={onChange}
              placeholder={placeholder}
              disabled={disabled}
              className="flex-1 text-sm bg-transparent border-none outline-none"
            />
            <button
              type="submit"
              disabled={disabled}
              className={`ml-4 ${commonButtonStyle} ${disabled ? 'opacity-50 cursor-not-allowed' : 'hover:bg-opacity-90'}`}
            >
              <Image
                src="/icons/chat/send.svg"
                alt="Send"
                width={20}
                height={20}
              />
            </button>
          </form>
        </div>
      </div>

      {/* 手機版輸入框 - 在桌面版中隱藏 */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4 md:hidden">
        <div className="container mx-auto">
          <div className={`relative ${commonInputStyle} bg-white shadow-sm`}>
            <input
              type="text"
              value={value}
              onChange={onChange}
              placeholder={placeholder}
              disabled={disabled}
              className="w-full px-4 py-3 text-sm focus:outline-none pr-12"
            />
            <button
              onClick={onSubmit}
              disabled={disabled}
              className={`absolute right-0 top-0 bottom-0 ${hasVoted ? 'bg-[#2388FF] text-white' : 'bg-[#BAC0CC]'} px-3 flex items-center justify-center ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              <Image
                src="/icons/chat/send.svg"
                alt="Send"
                width={20}
                height={20}
              />
            </button>
          </div>
        </div>
      </div>
    </>
  );
};
