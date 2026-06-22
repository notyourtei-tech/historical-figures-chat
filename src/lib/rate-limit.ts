import { Redis } from "@upstash/redis";
import { celebrities } from "@/data/celebrities";

const UPSTASH_URL = process.env.UPSTASH_REDIS_REST_URL;
const UPSTASH_TOKEN = process.env.UPSTASH_REDIS_REST_TOKEN;

let redis: Redis | null = null;
if (UPSTASH_URL && UPSTASH_TOKEN) {
  redis = new Redis({ url: UPSTASH_URL, token: UPSTASH_TOKEN });
}

const inMemoryMap = new Map<string, { count: number; resetTime: number }>();
const CLEANUP_INTERVAL_MS = 5 * 60 * 1000;
let lastCleanup = Date.now();

function cleanupExpiredEntries() {
  const now = Date.now();
  if (now - lastCleanup < CLEANUP_INTERVAL_MS) return;
  lastCleanup = now;
  for (const [key, record] of inMemoryMap) {
    if (now > record.resetTime) {
      inMemoryMap.delete(key);
    }
  }
}

function inMemoryRateLimit(
  key: string,
  limit: number,
  windowMs: number
): { allowed: boolean; remaining: number } {
  cleanupExpiredEntries();
  const now = Date.now();
  const record = inMemoryMap.get(key);

  if (!record || now > record.resetTime) {
    inMemoryMap.set(key, { count: 1, resetTime: now + windowMs });
    return { allowed: true, remaining: limit - 1 };
  }

  if (record.count >= limit) {
    return { allowed: false, remaining: 0 };
  }

  record.count++;
  return { allowed: true, remaining: limit - record.count };
}

async function redisRateLimit(
  key: string,
  limit: number,
  windowMs: number
): Promise<{ allowed: boolean; remaining: number }> {
  const now = Date.now();
  const windowKey = `rl:${key}:${Math.floor(now / windowMs)}`;
  const count = await redis!.incr(windowKey);

  if (count === 1) {
    await redis!.pexpire(windowKey, windowMs);
  }

  const remaining = Math.max(0, limit - count);
  return { allowed: count <= limit, remaining };
}

export async function rateLimit(
  key: string,
  limit: number = 20,
  windowMs: number = 60000
): Promise<{ allowed: boolean; remaining: number }> {
  if (redis) {
    try {
      return await redisRateLimit(key, limit, windowMs);
    } catch (err) {
      console.warn("[RateLimit] Redis failed, falling back to in-memory:", err);
      return inMemoryRateLimit(key, limit, windowMs);
    }
  }
  return inMemoryRateLimit(key, limit, windowMs);
}

export function getClientIp(headers: Headers): string {
  const forwarded = headers.get("x-forwarded-for");
  if (forwarded) {
    const firstIp = forwarded.split(",")[0]?.trim();
    if (firstIp) return firstIp;
  }
  const realIp = headers.get("x-real-ip");
  if (realIp) return realIp;
  return "unknown";
}

export function isValidCelebrityId(id: string): boolean {
  return celebrities.some((c) => c.id === id);
}

export function sanitizeInput(text: string, maxLength: number = 2000): string {
  return text
    .replace(/<[^>]*>/g, "")
    .replace(/javascript:/gi, "")
    .replace(/on\w+\s*=/gi, "")
    .replace(/\x00/g, "")
    .trim()
    .slice(0, maxLength);
}
