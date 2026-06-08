export type MBTIType = string; // e.g., 'INTJ', 'ENFP'

export interface Question {
  id: number;
  text: string;
  options: {
    label: string;
    value: string; // 'E', 'I', 'S', 'N', 'T', 'F', 'J', 'P'
  }[];
}

export interface Celebrity {
  id: string;
  name: string;
  title: string;
  mbti: MBTIType;
  description: string;
  avatar: string;
  tone: string; // Instructions for AI tone
  origin: string; // "China", "Ancient Greece", etc.
  keyWorks?: string[]; // Representative works or sources
  personalityTraits?: string[]; // Specific personality markers
  historicalEvents?: string[]; // Key life events or anecdotes
}

export interface User {
  id: string;
  username: string;
  password?: string; // 仅用于本地模拟存储验证
  nickname?: string;
  avatar?: string;
}

export interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
}

export interface AuthState {
  user: User | null;
  loading: boolean;
}
