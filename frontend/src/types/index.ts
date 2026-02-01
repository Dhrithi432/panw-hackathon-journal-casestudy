export interface User {
    id: string;
    username: string;
    email: string;
  }
  
  export interface ChatMessage {
    id: string;
    role: 'user' | 'assistant';
    content: string;
    timestamp: Date;
  }
  
  export interface JournalSession {
    id: string;
    title: string;
    messages: ChatMessage[];
    createdAt: Date;
    updatedAt: Date;
    sentiment?: 'positive' | 'neutral' | 'negative';
  }
  
  export interface MoodData {
    date: string;
    sentiment: number;
    entryCount: number;
  }