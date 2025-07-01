/**
 * 生成分享用的聊天內容 HTML
 */
export const generateShareContent = (originalQuestion?: string): string => {
  try {
    // 生成題目部分的 HTML
    const questionHtml = originalQuestion 
      ? `<div class="text-center mb-10 mt-6">
           <div class="text-gray-500 text-lg leading-relaxed">${originalQuestion}</div>
         </div>`
      : '';

    // 尋找統一的 AI 回應容器
    const aiContainer = document.getElementById('ai-responses-container');

    if (!aiContainer) {
      return questionHtml + '<div class="text-center text-gray-500 p-10">等待您的問題...</div>';
    }

    // 克隆並清理內容
    const clonedContent = cloneAndCleanContent(aiContainer);

    // 組合題目和回應內容，添加強制桌面版布局的樣式
    const wrappedContent = `
      <style>
        /* 強制桌面版布局樣式 */
        .md\\:hidden { display: none !important; }
        .hidden.md\\:flex, .hidden { display: flex !important; }
        .w-1\\/2 { width: 50% !important; }
        .flex-row { display: flex !important; flex-direction: row !important; }
        .gap-4 { gap: 1rem !important; }
      </style>
      ${questionHtml}${clonedContent}
    `;
    
    return wrappedContent;
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

  // 強制使用桌面版布局 - 隱藏手機版的水平滾動容器
  cloned.querySelectorAll('.md\\:hidden').forEach(el => {
    (el as HTMLElement).style.display = 'none';
  });

  // 強制顯示桌面版的並排布局
  cloned.querySelectorAll('.hidden.md\\:flex').forEach(el => {
    (el as HTMLElement).style.display = 'flex';
    (el as HTMLElement).classList.remove('hidden');
    (el as HTMLElement).classList.add('flex');
  });

  return cloned.innerHTML;
};