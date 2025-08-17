export interface ApiMessage {
  role: string; // 'user' | 'assistant' | other fallback
  content: string;
}

export type ChatStreamEvent =
  | { type: 'history'; messagesLeft: ApiMessage[]; messagesRight: ApiMessage[] }
  | { type: 'model1'; content: string }
  | { type: 'model2'; content: string };

// Server-only types (type-only import avoids bundling client code)
import type { ObjectId } from 'mongodb';

export interface ThreadDocument {
  _id: ObjectId;
  userID: ObjectId;
  createdAt: Date;
  updatedAt: Date;
  category: string;
  initialContext: {
    question: string;
    source: string;
    metadata?: Record<string, unknown>;
  };
  selectedModels: string[];
  model1Messages: { role: 'user' | 'assistant'; content: string }[];
  model2Messages: { role: 'user' | 'assistant'; content: string }[];
}


