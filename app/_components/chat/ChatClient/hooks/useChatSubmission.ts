'use client';

import { useState, useEffect } from 'react';
import { Message } from '../../types';
import { fetchChatResponse } from '../utils/apiHelpers';

interface UseChatSubmissionProps {
  threadId: string;
  initialMessage?: string;
  messagesLeft: Message[];
  messagesRight: Message[];
  setMessagesLeft: React.Dispatch<React.SetStateAction<Message[]>>;
  setMessagesRight: React.Dispatch<React.SetStateAction<Message[]>>;
  setIsLoading: React.Dispatch<React.SetStateAction<boolean>>;
}

export function useChatSubmission({
  threadId,
  initialMessage,
  messagesLeft,
  messagesRight,
  setMessagesLeft,
  setMessagesRight,
  setIsLoading
}: UseChatSubmissionProps) {
  const [input, setInput] = useState<string>('');
  
  // 處理初始訊息（從 sessionStorage 或 props）
  useEffect(() => {
    const pendingMessage = sessionStorage.getItem('pendingMessage');
    if (pendingMessage) {
      setInput(pendingMessage);
      sessionStorage.removeItem('pendingMessage');
      
      if (!messagesLeft.length) {
        setTimeout(() => {
          handleSubmitWithMessage(pendingMessage);
        }, 100);
      }
    } else if (initialMessage && initialMessage.trim()) {
      setInput(initialMessage);
      
      if (!messagesLeft.length) {
        setTimeout(() => {
          handleSubmitWithMessage(initialMessage);
        }, 100);
      }
    }
  }, []);
  
  const handleSubmit = async () => {
    if (input.trim()) {
      await handleSubmitWithMessage(input);
    }
  };
  
  const handleSubmitWithMessage = async (messageText: string) => {
    if (!messageText.trim()) return;
    
    setInput('');
    setIsLoading(true);
    
    const newUserMessage: Message = { role: 'user', content: messageText };
    const loadingMessage: Message = { role: 'assistant', content: '思考中...' };
    
    setMessagesLeft(prev => [...prev, newUserMessage, loadingMessage]);
    setMessagesRight(prev => [...prev, newUserMessage, loadingMessage]);
    
    try {
      await fetchChatResponse(threadId, messageText, {
        onHistoryLoaded: (left, right) => {
          // 如果收到歷史訊息，先設定歷史，再加上新的用戶訊息
          if (left.length > 0 || right.length > 0) {
            console.log('[Client] Setting history and current message');
            setMessagesLeft([...left.map(msg => ({ role: msg.role as 'user' | 'assistant', content: msg.content })), newUserMessage, loadingMessage]);
            setMessagesRight([...right.map(msg => ({ role: msg.role as 'user' | 'assistant', content: msg.content })), newUserMessage, loadingMessage]);
          }
        },
        onModel1Update: (content) => {
          setMessagesLeft(prev => [
            ...prev.slice(0, -1),
            { role: 'assistant', content }
          ]);
        },
        onModel2Update: (content) => {
          setMessagesRight(prev => [
            ...prev.slice(0, -1),
            { role: 'assistant', content }
          ]);
        },
        onComplete: () => {
          setIsLoading(false);
        }
      });
    } catch (error) {
      setMessagesLeft(prev => [
        ...prev.slice(0, -1),
        { role: 'assistant', content: '請求處理時發生錯誤' }
      ]);
      setMessagesRight(prev => [
        ...prev.slice(0, -1),
        { role: 'assistant', content: '請求處理時發生錯誤' }
      ]);
      setIsLoading(false);
    }
  };
  
  return {
    input,
    setInput,
    handleSubmit,
    handleSubmitWithMessage
  };
}
