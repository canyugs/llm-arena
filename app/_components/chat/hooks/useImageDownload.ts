import { useRef } from "react";
import { toast } from "@/hooks/use-toast";
import html2canvas from "html2canvas";

interface UseImageDownloadOptions {
  backgroundColor?: string;
  scale?: number;
  onSuccess?: () => void;
  onError?: (error: Error) => void;
}

export const useImageDownload = (options: UseImageDownloadOptions = {}) => {
  const {
    backgroundColor = '#F4F9FF',
    scale = 2,
    onSuccess,
    onError
  } = options;

  const elementRef = useRef<HTMLDivElement>(null);

  const downloadAsImage = async (filename?: string) => {
    if (!elementRef.current) {
      const error = new Error('Element reference is not available');
      onError?.(error);
      return;
    }

    try {
      // 確保字體已加載並強制重新計算佈局
      await document.fonts.ready;
      await prepareElementForCapture(elementRef.current);
      
      const canvas = await captureElementAsCanvas(elementRef.current, {
        backgroundColor,
        scale
      });
      
      await downloadCanvas(canvas, filename);
      
      toast({
        title: "圖片下載成功！",
        description: "對話截圖已儲存到您的裝置",
        duration: 1500,
      });
      
      onSuccess?.();
    } catch (error) {
      console.error("Failed to generate image:", error);
      
      const errorMessage = error instanceof Error ? error.message : '未知錯誤';
      toast({
        title: "下載失敗",
        description: `無法生成圖片：${errorMessage}`,
        variant: "destructive",
        duration: 1500,
      });

      onError?.(error instanceof Error ? error : new Error(String(error)));
    }
  };

  return {
    elementRef,
    downloadAsImage
  };
};

/**
 * 準備元素以進行截圖
 * @param element - 要截圖的元素
 */
const prepareElementForCapture = async (element: HTMLElement): Promise<void> => {
  // 強制重繪以確保佈局計算正確
  element.style.display = 'none';
  void element.offsetHeight; // 觸發重排
  element.style.display = 'block';
  
  // 等待一幀以確保渲染完成
  await new Promise(resolve => requestAnimationFrame(resolve));
};

/**
 * 將元素轉換為 Canvas
 * @param element - 要轉換的元素
 * @param options - html2canvas 選項
 * @returns Promise<HTMLCanvasElement>
 */
const captureElementAsCanvas = async (
  element: HTMLElement,
  options: { backgroundColor: string; scale: number }
): Promise<HTMLCanvasElement> => {
  const rect = element.getBoundingClientRect();
  
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
  
  return await html2canvas(element, { 
    scale: options.scale,
    backgroundColor: options.backgroundColor,
    useCORS: true,
    allowTaint: true,
    logging: true,
    width: totalWidth,
    height: totalHeight,
    x: 0,
    y: 0,
    scrollX: 0,
    scrollY: 0,
    windowWidth: totalWidth,
    windowHeight: totalHeight,
    foreignObjectRendering: false,
    removeContainer: true,
    imageTimeout: 15000,
  });
};

/**
 * 下載 Canvas 為圖片
 * @param canvas - 要下載的 Canvas
 * @param filename - 檔案名稱
 */
const downloadCanvas = async (canvas: HTMLCanvasElement, filename?: string): Promise<void> => {
  const dataUrl = canvas.toDataURL("image/png");
  const link = document.createElement("a");
  link.href = dataUrl;
  link.download = filename || `chat-share-${Date.now()}.png`;
  link.click();
}; 