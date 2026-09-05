import { z } from "zod";

const LanguageSchema = z.enum(["zh", "en", "ja", "vi", "my"]);

const MessageSchema = z.object({
  id: z.string().max(100),
  role: z.enum(["user", "assistant"]),
  content: z.string().min(1).max(2000),
  timestamp: z.number().positive(),
});

// Client-provided character biographies must never become a model prompt. The
// server resolves this id against its trusted, versioned character catalogue.
const CelebritySchema = z.object({ id: z.string().regex(/^[a-z0-9_-]{1,64}$/i) });

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
