"use client";

import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';
import rehypeSanitize from 'rehype-sanitize';

// AI 回應元件
export type AIResponseProps = {
  number: string; // AI 編號，例如 "1號" 或 "2號"
  content: string; // 回應內容
  className?: string;
};

export const AIResponse = ({
  number,
  content,
  className = ""
}: AIResponseProps) => {
  return (
    <div className={`flex-1 bg-white rounded-lg border border-gray-100 shadow-sm overflow-hidden h-full flex flex-col ${className}`}>
      <div className="px-4 py-2 bg-gray-100 text-sm font-medium text-gray-500">
        <div className="inline-block bg-white rounded-full px-3 py-1">
          AI {number}
        </div>
      </div>
      <div className="p-4 flex-1 overflow-y-auto prose prose-sm max-w-none text-sm text-gray-700">
        <ReactMarkdown 
          remarkPlugins={[remarkGfm]} 
          rehypePlugins={[rehypeRaw, rehypeSanitize]}
        >
          {content}
        </ReactMarkdown>
      </div>
    </div>
  );
};
