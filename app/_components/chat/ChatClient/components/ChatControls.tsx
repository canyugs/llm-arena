'use client';

import { InputBox } from '../../InputBox';

interface ChatControlsProps {
  input: string;
  setInput: (value: string) => void;
  onSubmit: () => void;
  disabled: boolean;
  hasVoted: boolean;
}

export default function ChatControls({
  input,
  setInput,
  onSubmit,
  disabled,
  hasVoted
}: ChatControlsProps) {
  return (
    <InputBox
      placeholder={hasVoted ? "輸入你想要問 AI 的問題 ..." : "點一下回覆的評價按鈕就能繼續跟我聊天！"}
      value={input}
      onChange={(e) => setInput(e.target.value)}
      onSubmit={onSubmit}
      disabled={disabled}
      hasVoted={hasVoted}
    />
  );
}
