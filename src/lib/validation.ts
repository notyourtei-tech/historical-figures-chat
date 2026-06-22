import { z } from "zod";

const LanguageSchema = z.enum(["zh", "en", "ja", "vi", "my"]);

const CategorySchema = z.enum([
  "哲学家", "科学家", "文学家", "政治家", "军事家", "企业家",
  "艺术家", "探险家", "神职人员", "弈者", "智者", "政治军事领袖"
]);

const EraSchema = z.enum([
  "上古", "春秋", "战国", "秦", "古典时代", "古希腊", "古罗马",
  "中世纪", "文艺复兴", "启蒙运动", "近代", "现代"
]);

const MessageSchema = z.object({
  id: z.string().max(100),
  role: z.enum(["user", "assistant"]),
  content: z.string().min(1).max(2000),
  timestamp: z.number().positive(),
});

const LangMapSchema = z.object({
  zh: z.string(),
  en: z.string(),
  ja: z.string(),
  vi: z.string(),
  my: z.string(),
});

const LangArraySchema = z.object({
  zh: z.array(z.string()),
  en: z.array(z.string()),
  ja: z.array(z.string()),
  vi: z.array(z.string()),
  my: z.array(z.string()),
});

const CelebritySchema = z.object({
  id: z.string().min(1).max(50),
  name: LangMapSchema,
  title: LangMapSchema,
  category: CategorySchema,
  era: EraSchema,
  origin: LangMapSchema,
  description: LangMapSchema,
  avatar: z.string().url(),
  tone: LangMapSchema,
  coreThoughts: LangArraySchema,
  keyWorks: LangArraySchema,
  personalityTraits: LangArraySchema,
  expertise: LangArraySchema,
  interests: z.array(z.string()),
});

export const ChatRequestSchema = z.object({
  celebrity: CelebritySchema,
  messages: z.array(MessageSchema).min(1).max(50),
  language: LanguageSchema.default("zh"),
});

export const GreetingRequestSchema = z.object({
  celebrity: CelebritySchema,
  language: LanguageSchema.default("zh"),
});

export type ChatRequest = z.infer<typeof ChatRequestSchema>;
export type GreetingRequest = z.infer<typeof GreetingRequestSchema>;
