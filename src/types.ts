export type Category = '哲学家' | '科学家' | '文学家' | '政治家' | '军事家' | '企业家' | '艺术家' | '探险家' | '神职人员' | '弈者' | '智者' | '政治军事领袖';
export type Era = '上古' | '春秋' | '战国' | '秦' | '古典时代' | '古希腊' | '古罗马' | '中世纪' | '文艺复兴' | '启蒙运动' | '近代' | '现代';
export type Language = 'zh' | 'en' | 'ja' | 'vi' | 'my';

export interface Celebrity {
  id: string;
  name: { [key in Language]: string };
  title: { [key in Language]: string };
  category: Category;
  era: Era;
  origin: { [key in Language]: string };
  description: { [key in Language]: string };
  avatar: string;
  tone: { [key in Language]: string };
  coreThoughts: { [key in Language]: string[] };
  keyWorks: { [key in Language]: string[] };
  personalityTraits: { [key in Language]: string[] };
  expertise: { [key in Language]: string[] };
  interests: string[]; // 用于匹配用户兴趣的标签，如 "围棋", "占卜", "物理", "绘画"
}

export interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
}

export interface UserProfile {
  name: string;
  interests: string[];
  language: Language;
  mbti?: string;
}
