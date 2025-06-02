'use client';

import { useState } from 'react';
import { toast } from '@/hooks/use-toast';
import { VoteResult } from '../../types';
import { submitVoteResult } from '../utils/apiHelpers';

interface UseVotingProps {
  threadId: string;
}

export function useVoting({ threadId }: UseVotingProps) {
  const [selectedVote, setSelectedVote] = useState<string | null>(null);
  const [hasVoted, setHasVoted] = useState<boolean>(false);
  
  const handleVoteSelect = async (text: string) => {
    if (!text) {
      return;
    }
    
    // 如果選中的是已經選中的按鈕，則取消選中
    if (selectedVote === text) {
      setSelectedVote(null);
      return;
    }
    
    setSelectedVote(text);
    
    // 根據選擇的按鈕，提交相應的結果
    let result: VoteResult;
    
    switch (text) {
      case "1號比較讚":
        result = 'A_IS_BETTER';
        break;
      case "2號比較讚":
        result = 'B_IS_BETTER';
        break;
      case "平手":
        result = 'TIE';
        break;
      case "兩邊都很爛":
        result = 'BOTH_BAD';
        break;
      case "我來回答":
        // 處理「我來回答」選項
        return;
      default:
        return;
    }
    
    // 提交投票結果
    try {
      const success = await submitVoteResult(threadId, result);
      if (success) {
        toast({
          title: '提交成功',
          description: '感謝您的參與！'
        });
        setHasVoted(true);
      } else {
        toast({
          title: '提交失敗',
          description: '請稍後再試'
        });
      }
    } catch (error) {
      toast({
        title: '提交失敗',
        description: '請稍後再試'
      });
    }
  };
  
  return {
    selectedVote,
    hasVoted,
    setHasVoted,
    handleVoteSelect
  };
}
