import { useState } from "react";
import { toast } from "@/hooks/use-toast";
import { useChatContext } from "../ChatClient/context/ChatContext";

export const useShare = () => {
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const { isLoading, messagesLeft, messagesRight } = useChatContext();

  // 檢查對話是否完成
  const isConversationComplete = () => {
    // 檢查是否正在載入
    if (isLoading) return false;

    // 檢查是否有AI回應
    const hasLeftResponse = messagesLeft.length > 0 &&
      messagesLeft[messagesLeft.length - 1].role === 'assistant';
    const hasRightResponse = messagesRight.length > 0 &&
      messagesRight[messagesRight.length - 1].role === 'assistant';

    // 至少要有一個AI回應才能分享
    return hasLeftResponse || hasRightResponse;
  };

  const handleShare = () => {
    if (!isConversationComplete()) {
      toast({
        title: "請等待回應完成",
        description: "請等待AI回應完成後再分享",
        variant: "destructive",
      });

      return;
    }

    setIsShareModalOpen(true);
  };

  const closeShareModal = () => {
    setIsShareModalOpen(false);
  };

  return {
    isShareModalOpen,
    isConversationComplete,
    handleShare,
    closeShareModal
  };
};