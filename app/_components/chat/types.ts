export type MessageRole = 'user' | 'assistant';

export interface Message {
  role: MessageRole;
  content: string;
  timestamp?: string;
}

export type VoteResult = 'A_IS_BETTER' | 'B_IS_BETTER' | 'TIE' | 'BOTH_BAD';

export interface ChatState {
  messagesLeft: Message[];
  messagesRight: Message[];
  isLoading: boolean;
  hasVoted: boolean;
  selectedVote: string | null;
}
