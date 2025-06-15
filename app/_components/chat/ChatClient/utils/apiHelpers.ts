import { VoteResult } from '../../types';

export async function fetchChatResponse(threadId: string, message: string, callbacks: {
  onModel1Update: (content: string) => void,
  onModel2Update: (content: string) => void,
  onComplete: () => void,
  onHistoryLoaded?: (messagesLeft: Array<{role: string, content: string}>, messagesRight: Array<{role: string, content: string}>) => void
}) {
  const response = await fetch('/api/chat', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify({
      threadId,
      message
    }),
  });
  
  if (!response.body) {
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
