// 类型定义
export type Language = 'zh' | 'en' | 'ja' | 'vi' | 'my';

export interface Celebrity {
  id: string;
  name: Record<Language, string>;
  title: Record<Language, string>;
  category: string;
  era: string;
  origin: Record<Language, string>;
  description: Record<Language, string>;
  avatar: string;
  tone: Record<Language, string>;
  coreThoughts: Record<Language, string[]>;
  keyWorks: Record<Language, string[]>;
  personalityTraits: Record<Language, string[]>;
  expertise: Record<Language, string[]>;
  interests: string[];
}

export interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
  isError?: boolean;
}

export interface UserProfile {
  name: string;
  interests: string[];
  language: Language;
  mbti?: string;
}

export interface ChatResult {
  success: boolean;
  content?: string;
  error?: string;
}
