'use client';

import { useState } from "react";
import { redirect } from "next/navigation";
import { CardsChat } from "@/components/cards/chat";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/hooks/use-toast";
import { useUser } from "../contexts/UserContext";

type Message = {
  role: string;
  content: string;
};

export default function Battle(props: { threadId: string }) {
  const { threadId } = props;

  const user = useUser();

  const [input, setInput] = useState<string>('');
  const [suggestedAnswer, setSuggestedAnswer] = useState<string>('');
  const [messagesLeft, setMessagesLeft] = useState<Message[]>([]);
  const [messagesRight, setMessagesRight] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [showSuggestedAnswer, setShowSuggestedAnswer] = useState<boolean>(false);
  const [isSubmittingAnswer, setIsSubmittingAnswer] = useState<boolean>(false);

  const handleSubmit = async (): Promise<void> => {
    if (!input.trim() || isLoading) return;

    const userMessage = input.trim();
    setInput('');
    setIsLoading(true);

    const newUserMessage: Message = { role: 'user', content: userMessage };
    const loadingMessage: Message = { role: 'assistant', content: '思考中...' };

    setMessagesLeft(prev => [...prev, newUserMessage, loadingMessage]);
    setMessagesRight(prev => [...prev, newUserMessage, loadingMessage]);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          threadId,
          message: userMessage
        }),
      });

      if (!response.body) {
        setIsLoading(false);
        return;
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();

      let openaiResponse = '';
      let geminiResponse = '';

      let done = false;

      while (!done) {
        const { value, done: readerDone } = await reader.read();
        done = readerDone;

        if (value) {
          const textChunk = decoder.decode(value, { stream: true });
          const lines = textChunk.split('\n').filter(Boolean);

          for (const line of lines) {
            const data = JSON.parse(line);

            switch (data.type) {
            case 'model1':
              openaiResponse += data.content;
              setMessagesLeft(prev => [
                ...prev.slice(0, -1),
                { role: 'assistant', content: openaiResponse }
              ]);
              break;
            case 'model2':
              geminiResponse += data.content;
              setMessagesRight(prev => [
                ...prev.slice(0, -1),
                { role: 'assistant', content: geminiResponse }
              ]);
            }
          }
        }
      }
      
      // Reset suggested answer after submission
      setSuggestedAnswer('');
      setShowSuggestedAnswer(false);

    } catch {
      setMessagesLeft(prev => [
        ...prev.slice(0, -1),
        { role: 'assistant', content: '請求處理時發生錯誤' }
      ]);
      setMessagesRight(prev => [
        ...prev.slice(0, -1),
        { role: 'assistant', content: '請求處理時發生錯誤' }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmitResult = async (result: 'A_IS_BETTER' | 'B_IS_BETTER' | 'TIE' | 'BOTH_BAD'): Promise<void> => {
    const response = await fetch('/api/submit', {
      method: 'POST',
      body: JSON.stringify({ threadID: threadId, result })
    })

    if (response.ok) {
      toast({
        title: '提交成功',
        description: '感謝您的參與！'
      })
    } else {
      toast({
        title: '提交失敗',
        description: '請稍後再試'
      })
    }
  }

  const handleSubmitSuggestedAnswer = async (): Promise<void> => {
    if (!suggestedAnswer.trim() || isSubmittingAnswer) return;
    
    setIsSubmittingAnswer(true);
    
    try {
      const response = await fetch('/api/suggested-answer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          threadId,
          suggestedAnswer: suggestedAnswer.trim()
        }),
      });
      
      if (response.ok) {
        toast({
          title: '正確答案已提交',
          description: '感謝您的貢獻！'
        });
        setSuggestedAnswer('');
        setShowSuggestedAnswer(false);
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
    } finally {
      setIsSubmittingAnswer(false);
    }
  };

  return (
    <>
      <div className="flex flex-col h-screen">
        <div className="w-full flex flex-col md:flex-row flex-1 overflow-hidden">
          <div className="w-full h-1/2 overflow-y-auto border-2 md:w-1/2 md:h-full md:border-0">
            <CardsChat messages={messagesLeft} title="模型 A" />
          </div>
          <div className="w-full h-1/2 overflow-y-auto border-2 md:w-1/2 md:h-full md:border-0">
            <CardsChat messages={messagesRight} title="模型 B" />
          </div>
        </div>
        <div className="w-full flex justify-center md:mb-8">
          <div className="w-full md:w-[800px] bg-white hover:shadow-2xl shadow-xl transition-all rounded-xl p-2">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSubmit();
              }}
              className="flex gap-2 items-center"
            >
              <img src={user.avatar} alt="avatar" className="w-8 h-8 rounded-full" />
              <Input
                value={input}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setInput(e.target.value)}
                placeholder={isLoading ? "AI 正在回答中..." : "輸入你想要問 AI 的問題 ..."}
                disabled={isLoading}
              />
              <Button type="submit" disabled={isLoading}>
                {isLoading ? "處理中..." : "送出"}
              </Button>
            </form>
            
            <div className="mt-3 flex flex-col gap-2">
              <div className="grid grid-cols-2 md:grid-cols-5 gap-2 items-center">
                <Button
                  onClick={() => { handleSubmitResult('A_IS_BETTER') }}
                  variant="outline"
                  className="w-full"
                  disabled={isLoading}
                >
                  👍 模型 A 比較讚
                </Button>
                <Button
                  onClick={() => { handleSubmitResult('B_IS_BETTER') }}
                  variant="outline"
                  className="w-full"
                  disabled={isLoading}
                >
                  👍 模型 B 比較讚
                </Button>
                <Button
                  onClick={() => { handleSubmitResult('TIE') }}
                  variant="outline"
                  className="w-full"
                  disabled={isLoading}
                >
                  🎉 兩個都不錯
                </Button>
                <Button
                  onClick={() => { handleSubmitResult('BOTH_BAD') }}
                  variant="outline"
                  className="w-full"
                  disabled={isLoading}
                >
                  💩 兩個都很爛
                </Button>
                <Button
                  onClick={() => { redirect('/') }}
                  variant="outline"
                  type="button"
                  disabled={isLoading}
                  className="hidden md:block w-full"
                >
                  🥊 開始新對決
                </Button>
              </div>
              <div className="md:hidden w-full">
                <Button
                  onClick={() => { redirect('/') }}
                  variant="outline"
                  type="button"
                  disabled={isLoading}
                  className="w-full"
                >
                  🥊 開始新對決
                </Button>
              </div>
              
              {/* Correct Answer Button */}
              <div className="mt-2">
                <Button 
                  variant="outline" 
                  className="text-sm w-full"
                  onClick={() => setShowSuggestedAnswer(!showSuggestedAnswer)}
                  disabled={isLoading}
                >
                  {showSuggestedAnswer ? "隱藏正確答案" : "點我輸入正確答案"}
                </Button>
                
                {showSuggestedAnswer && (
                  <div className="mt-2">
                    <Textarea
                      value={suggestedAnswer}
                      onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setSuggestedAnswer(e.target.value)}
                      placeholder="輸入正確答案..."
                      disabled={isLoading || isSubmittingAnswer}
                      className="w-full min-h-[100px] resize-y"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      您提供的正確答案將用於收集資料，幫助我們改進 AI 模型的表現和準確性。
                    </p>
                    <Button
                      onClick={handleSubmitSuggestedAnswer}
                      disabled={isLoading || isSubmittingAnswer || !suggestedAnswer.trim()}
                      className="w-full mt-2"
                    >
                      {isSubmittingAnswer ? "提交中..." : "送出正確答案"}
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
