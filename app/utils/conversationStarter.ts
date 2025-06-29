export interface ConversationInitConfig {
  question: string;
  category: string;
  source: string;
  metadata?: Record<string, any>;
}

interface CreateChatRequest {
  category?: string;
  initialContext?: {
    initialQuestion: string;
    source: string;
    metadata?: Record<string, any>;
  };
}

interface CreateChatResponse {
  threadId: string;
  success: boolean;
}

/**
 * 調用後端 API 創建新對話
 * @param config 對話初始化配置
 * @returns Promise<string> 新創建的 threadId
 */
export async function createNewConversation(config: ConversationInitConfig): Promise<string> {
  const requestBody: CreateChatRequest = {
    category: config.category,
    initialContext: {
      initialQuestion: config.question,
      source: config.source,
      metadata: config.metadata
    }
  };

  const response = await fetch('/api/chat/create', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(requestBody),
    credentials: 'include' // 確保 cookie 被包含在請求中
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || '創建對話失敗');
  }

  const data: CreateChatResponse = await response.json();

  return data.threadId;
}

/**
 * 啟動新對話的通用函數
 * @param config 對話初始化配置
 * @returns Promise<string> 新的 threadId
 */
export async function startNewConversation(config: ConversationInitConfig): Promise<string> {
  return await createNewConversation(config);
}
