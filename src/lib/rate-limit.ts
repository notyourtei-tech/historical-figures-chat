const rateLimitMap = new Map<string, { count: number; resetTime: number }>();

export function rateLimit(
  key: string,
  limit: number = 20,
  windowMs: number = 60000
): { allowed: boolean; remaining: number } {
  const now = Date.now();
  const record = rateLimitMap.get(key);

  if (!record || now > record.resetTime) {
    rateLimitMap.set(key, { count: 1, resetTime: now + windowMs });
    return { allowed: true, remaining: limit - 1 };
  }

  if (record.count >= limit) {
    return { allowed: false, remaining: 0 };
  }

  record.count++;
  return { allowed: true, remaining: limit - record.count };
}

const VALID_IDS = new Set([
  "confucius", "mencius", "socrates", "plato", "laozi", "einstein",
  "newton", "libai", "shakespeare", "sunzi", "davinci", "wuqingyuan", "huineng",
]);

export function isValidCelebrityId(id: string): boolean {
  return VALID_IDS.has(id);
}

export function sanitizeInput(text: string, maxLength: number = 2000): string {
  return text
    .replace(/<[^>]*>/g, "")
    .replace(/javascript:/gi, "")
    .replace(/on\w+\s*=/gi, "")
    .trim()
    .slice(0, maxLength);
}
