/**
 * 生成分享用的聊天內容 HTML
 */
export const generateShareContent = (): string => {
  try {
    // 尋找統一的 AI 回應容器
    const aiContainer = document.getElementById('ai-responses-container');

    if (!aiContainer) {
      return '<div class="text-center text-gray-500 p-10">等待您的問題...</div>';
    }

    // 克隆並清理內容
    const clonedContent = cloneAndCleanContent(aiContainer);

    return clonedContent;
  } catch (error) {
    console.error('Error generating share content:', error);

    return '<div class="text-center text-gray-500 p-10">預覽生成失敗</div>';
  }
};

/**
 * 克隆並清理內容
 */
const cloneAndCleanContent = (container: HTMLElement): string => {
  const cloned = container.cloneNode(true) as HTMLElement;

  // 移除不需要的按鈕和輸入框
  cloned.querySelectorAll('button, input, textarea').forEach(el => el.remove());

  // 移除分享相關元素
  cloned.querySelectorAll('[id*="share"]').forEach(el => el.remove());

  return cloned.innerHTML;
};