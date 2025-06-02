'use client';

import { useState } from 'react';
import { Message } from '../../types';

export function useChatMessages() {
  const [messagesLeft, setMessagesLeft] = useState<Message[]>([]);
  const [messagesRight, setMessagesRight] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  
  return {
    messagesLeft,
    messagesRight,
    isLoading,
    setMessagesLeft,
    setMessagesRight,
    setIsLoading
  };
}
