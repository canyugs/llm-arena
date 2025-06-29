import { VoteResult } from '../../types';

// 請求去重：追蹤正在進行的請求
const activeRequests = new Set<string>();

export async function fetchChatResponse(
  threadId: string,
  message: string,
  callbacks: {
    onModel1Update: (content: string) => void,
    onModel2Update: (content: string) => void,
    onComplete: () => void,
    onHistoryLoaded?: (messagesLeft: Array<{role: string, content: string}>, messagesRight: Array<{role: string, content: string}>) => void
  },
  category?: string,
  initialContext?: { question: string; source: string; metadata?: any }
) {
  // 生成請求唯一標識
  const requestKey = `${threadId}-${message}-${Date.now()}`;

  // 檢查是否已有相同請求正在進行
  if (activeRequests.has(threadId)) {
    console.log('[API] Duplicate request detected for threadId:', threadId, 'skipping...');
    callbacks.onComplete();

    return;
  }

  // 標記請求開始
  activeRequests.add(threadId);
  console.log('[API] Starting request for threadId:', threadId);
  const requestBody: any = {
    threadId,
    message
  };

  // 如果有對話配置參數，添加到請求中
  if (category) {
    requestBody.category = category;
  }

  if (initialContext) {
    requestBody.initialContext = initialContext;
  }

  const response = await fetch('/api/chat', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify(requestBody),
  });

  if (!response.body) {
    // 清理請求標記
    activeRequests.delete(threadId);
    console.log('[API] Request completed for threadId:', threadId);
    callbacks.onComplete();

    return;
  }

  const reader = response.body.getReader();
  const decoder = new TextDecoder();

  let openaiResponse = '';
  let geminiResponse = '';

  let done = false;

  // 使用串流讀取回應
  while (!done) {
    const { value, done: readerDone } = await reader.read();
    done = readerDone;

    if (value) {
      const textChunk = decoder.decode(value, { stream: true });
      const lines = textChunk.split('\n').filter(Boolean);

      for (const line of lines) {
        const data = JSON.parse(line);

        switch (data.type) {
        case 'history':
          // 處理歷史訊息
          console.log('[Client] Received history:', { leftCount: data.messagesLeft.length, rightCount: data.messagesRight.length });
          callbacks.onHistoryLoaded?.(data.messagesLeft, data.messagesRight);
          break;
        case 'model1':
          openaiResponse += data.content;
          // 每次收到新的內容片段時，即時更新 UI
          callbacks.onModel1Update(openaiResponse);
          break;
        case 'model2':
          geminiResponse += data.content;
          // 每次收到新的內容片段時，即時更新 UI
          callbacks.onModel2Update(geminiResponse);
          break;
        }
      }
    }
  }

  // 清理請求標記
  activeRequests.delete(threadId);
  console.log('[API] Request completed for threadId:', threadId);
  callbacks.onComplete();
}

export async function submitVoteResult(threadId: string, result: VoteResult): Promise<boolean> {
  const response = await fetch('/api/submit', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ threadID: threadId, result })
  });

  return response.ok;
}
