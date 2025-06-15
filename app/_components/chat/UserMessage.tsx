"use client";
import Image from "next/image";
import { toast } from "@/hooks/use-toast";
import { useState, useRef } from "react";
import html2canvas from "html2canvas";
import { Download } from "lucide-react";

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
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

  const handleShare = () => {
    setIsShareModalOpen(true);
  };

  const handleClose = () => {
    setIsShareModalOpen(false);
  };

  const handleDownload = async () => {
    if (!cardRef.current) return;
    try {
      // 確保字體已加載並強制重新計算佈局
      await document.fonts.ready;
      
      // 強制重繪以確保佈局計算正確
      if (cardRef.current) {
        cardRef.current.style.display = 'none';
        cardRef.current.offsetHeight; // 觸發重排
        cardRef.current.style.display = 'block';
        
        // 等待一幀以確保渲染完成
        await new Promise(resolve => requestAnimationFrame(resolve));
      }
      
      // 獲取實際內容尺寸，包含所有子元素
      const element = cardRef.current;
      const rect = element.getBoundingClientRect();
      const computedStyle = window.getComputedStyle(element);
      
      // 計算包含 padding 和 border 的完整尺寸
      const totalWidth = Math.max(
        element.scrollWidth,
        element.offsetWidth,
        rect.width
      );
      
      const totalHeight = Math.max(
        element.scrollHeight,
        element.offsetHeight,
        rect.height
      );
      
      console.log('Element dimensions:', {
        scrollWidth: element.scrollWidth,
        scrollHeight: element.scrollHeight,
        offsetWidth: element.offsetWidth, 
        offsetHeight: element.offsetHeight,
        rectWidth: rect.width,
        rectHeight: rect.height,
        totalWidth,
        totalHeight
      });
      
      const canvas = await html2canvas(element, { 
        scale: 2,
        backgroundColor: '#F4F9FF',
        useCORS: true,
        allowTaint: true,
        logging: true,
        width: totalWidth, // 增加更多邊距
        height: totalHeight,
        x: 0,
        y: 0,
        scrollX: 0,
        scrollY: 0,
        windowWidth: totalWidth,
        windowHeight: totalHeight,
        foreignObjectRendering: false, // 改為 false 試試
        removeContainer: true,
        imageTimeout: 15000,
      });
      const dataUrl = canvas.toDataURL("image/png");
      const link = document.createElement("a");
      link.href = dataUrl;
      link.download = `chat-share-${Date.now()}.png`;
      link.click();
      toast({
        title: "圖片下載成功！",
        description: "對話截圖已儲存到您的裝置",
        duration: 3000,
      });
      setIsShareModalOpen(false);
    } catch (error) {
      console.error("Failed to generate image:", error);
      toast({
        title: "下載失敗",
        description: "無法生成圖片，請重試",
        variant: "destructive",
        duration: 3000,
      });
    }
  };

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
            className="bg-[#E9EBEE] hover:bg-opacity-90 p-1.5 rounded-full transition-colors duration-200"
            onClick={handleShare}
            aria-label="分享對話"
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

      {isShareModalOpen && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60 backdrop-blur-sm"
          onClick={handleClose}
        >
          <div 
            className="relative bg-white rounded-2xl p-6 w-[95%] max-w-4xl mx-auto shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Title */}
            <div className="text-center mb-6">
              <h2 className="text-3xl font-semibold text-gray-800 mb-4">
                下載對話截圖並分享吧！
              </h2>
              <hr className="w-full border-gray-300" />
            </div>

            {/* Share card preview - scaled down for preview */}
            <div className="max-h-[60vh] overflow-y-auto mb-6 transform origin-top">
              <div 
                ref={cardRef} 
                className="bg-[#F4F9FF] p-4 w-full"
                id="share-card-preview"
                dangerouslySetInnerHTML={{
                  __html: (() => {
                    try {
                      const chatContainer = document.getElementById('chat-container');
                      
                      if (!chatContainer) {
                        return '<div class="text-center text-gray-500 p-10">等待您的問題...</div>';
                      }

                      // 創建一個臨時容器來避免影響原始DOM
                      const tempContainer = document.createElement('div');
                      tempContainer.style.position = 'absolute';
                      tempContainer.style.left = '-9999px';
                      tempContainer.style.top = '-9999px';
                      tempContainer.style.visibility = 'hidden';
                      document.body.appendChild(tempContainer);
                      
                      // 深度克隆並插入到臨時容器
                      const cloned = chatContainer.cloneNode(true) as HTMLElement;
                      tempContainer.appendChild(cloned);
                      
                      // 移除 ID 避免重複
                      cloned.id = 'cloned-chat-container';
                      cloned.querySelectorAll('[id]').forEach((el: any) => {
                        el.id = 'cloned-' + el.id;
                      });
                      
                      // 一次性移除所有不需要的元素
                      const elementsToRemove = [
                        '[id*="user-message-avatar"]',
                        '[id*="user-message-username"]', 
                        '[id*="chat-header-title"]',
                        'button',
                        'input', 
                        'textarea',
                        '[contenteditable]',
                        '[id*="share"]'
                      ];
                      
                      elementsToRemove.forEach(selector => {
                        cloned.querySelectorAll(selector).forEach(el => el.remove());
                      });
                      
                      // 設定問題文字樣式
                      const question = cloned.querySelector('[id*="user-message-question"]') as HTMLElement;
                      if (question) {
                        Object.assign(question.style, {
                          fontSize: '1.2em',
                          textAlign: 'center',
                          lineHeight: '1.5'
                        });
                      }
                      
                      // 設定容器樣式和文字換行
                      Object.assign(cloned.style, {
                        width: 'auto',
                        height: 'auto',
                        overflow: 'visible',
                        maxWidth: 'none',
                        background: 'transparent',
                        wordWrap: 'break-word',
                        wordBreak: 'break-word',
                        whiteSpace: 'normal'
                      });
                      
                      // 確保所有文字元素都有正確的換行設定
                      const textElements = cloned.querySelectorAll('p, div, span, h1, h2, h3, h4, h5, h6, li, td, th');
                      textElements.forEach((el: any) => {
                        el.style.wordWrap = 'break-word';
                        el.style.wordBreak = 'break-word';
                        el.style.whiteSpace = 'normal';
                        el.style.overflowWrap = 'break-word';
                        el.style.maxWidth = '100%';
                      });
                      
                      const result = cloned.innerHTML;
                      
                      // 清理臨時容器
                      document.body.removeChild(tempContainer);
                      
                      return result;
                    } catch (error) {
                      console.error('Error generating preview:', error);
                      return '<div class="text-center text-gray-500 p-10">預覽生成失敗</div>';
                    }
                  })()
                }}
              />
            </div>

            {/* Action button */}
            <div className="text-center">
              <button
                onClick={handleDownload}
                className="px-8 py-3 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white rounded-lg flex items-center justify-center space-x-2 transition-all duration-200 shadow-lg hover:shadow-xl mx-auto"
              >
                <Download size={16} />
                <span>下載圖片</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
