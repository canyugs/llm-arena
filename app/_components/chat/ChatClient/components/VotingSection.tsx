'use client';

import { VoteButton } from '../../VoteButton';
import { useChatContext } from '../context/ChatContext';

interface VotingSectionProps {
  onVoteSelect: (text: string) => void;
}

export default function VotingSection({ onVoteSelect }: VotingSectionProps) {
  const { selectedVote } = useChatContext();

  return (
    <>
      {/* Voting buttons - 1號 and 2號 */}
      <div className="flex justify-center gap-4 w-full max-w-[1024px] mt-6">
        <VoteButton
          icon="/icons/chat/thumb-left.svg"
          alt="Thumb Left"
          text="1號比較讚"
          className="flex-1"
          isActive={selectedVote === "1號比較讚"}
          onClick={() => onVoteSelect("1號比較讚")}
        />
        <VoteButton
          icon="/icons/chat/thumb-right.svg"
          alt="Thumb Right"
          text="2號比較讚"
          className="flex-1"
          isActive={selectedVote === "2號比較讚"}
          onClick={() => onVoteSelect("2號比較讚")}
        />
      </div>

      {/* Additional voting options - 3 buttons */}
      <div className="grid grid-cols-3 gap-4 w-full max-w-[1024px] mt-4">
        <VoteButton
          icon="/icons/chat/tie.svg"
          alt="Tie"
          text="平手"
          isActive={selectedVote === "平手"}
          onClick={() => onVoteSelect("平手")}
        />
        <VoteButton
          icon="/icons/chat/badface.svg"
          alt="Both Bad"
          text="兩邊都很爛"
          isActive={selectedVote === "兩邊都很爛"}
          onClick={() => onVoteSelect("兩邊都很爛")}
        />
        <VoteButton
          icon="/icons/chat/write.svg"
          alt="Provide Answer"
          text="我來回答"
          isActive={selectedVote === "我來回答"}
          onClick={() => onVoteSelect("我來回答")}
        />
      </div>
    </>
  );
}
