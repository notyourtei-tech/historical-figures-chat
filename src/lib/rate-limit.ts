import { Redis } from "@upstash/redis";
import { celebrities } from "@/data/celebrities";

const UPSTASH_URL = process.env.UPSTASH_REDIS_REST_URL;
const UPSTASH_TOKEN = process.env.UPSTASH_REDIS_REST_TOKEN;

let redis: Redis | null = null;
if (UPSTASH_URL && UPSTASH_TOKEN) {
  redis = new Redis({ url: UPSTASH_URL, token: UPSTASH_TOKEN });
}

// Sliding window in-memory rate limiter
type RateLimitResult = { allowed: boolean; remaining: number; resetAfterSeconds: number };

const inMemoryMap = new Map<string, { timestamps: number[]; expiresAt: number }>();
const CLEANUP_INTERVAL_MS = 5 * 60 * 1000;
let lastCleanup = Date.now();

function cleanupExpiredEntries() {
  const now = Date.now();
  if (now - lastCleanup < CLEANUP_INTERVAL_MS) return;
  lastCleanup = now;
  for (const [key, record] of inMemoryMap) {
    if (record.expiresAt <= now) {
      inMemoryMap.delete(key);
    }
  }
}

function inMemoryRateLimit(
  key: string,
  limit: number,
  windowMs: number
): RateLimitResult {
  cleanupExpiredEntries();
  const now = Date.now();
  const windowStart = now - windowMs;

  let record = inMemoryMap.get(key);
  if (!record) {
    record = { timestamps: [], expiresAt: now + windowMs };
    inMemoryMap.set(key, record);
  }

  record.timestamps = record.timestamps.filter((t) => t > windowStart);
  record.expiresAt = now + windowMs;

  const getResetAfterSeconds = () => Math.max(1, Math.ceil(((record?.timestamps[0] || now) + windowMs - now) / 1000));

  if (record.timestamps.length >= limit) {
    return { allowed: false, remaining: 0, resetAfterSeconds: getResetAfterSeconds() };
  }

  record.timestamps.push(now);
  return { allowed: true, remaining: limit - record.timestamps.length, resetAfterSeconds: getResetAfterSeconds() };
}

async function redisRateLimit(
  key: string,
  limit: number,
  windowMs: number
): Promise<RateLimitResult> {
  const now = Date.now();
  const windowKey = `rl:${key}:${Math.floor(now / windowMs)}`;
  const count = await redis!.incr(windowKey);

  if (count === 1) {
    await redis!.pexpire(windowKey, windowMs);
  }

  const remaining = Math.max(0, limit - count);
  const ttl = await redis!.pttl(windowKey);
  const resetAfterSeconds = Math.max(1, Math.ceil((ttl > 0 ? ttl : windowMs) / 1000));
  return { allowed: count <= limit, remaining, resetAfterSeconds };
}

export async function rateLimit(
  key: string,
  limit: number = 20,
  windowMs: number = 60000
): Promise<RateLimitResult> {
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
    const parts = forwarded.split(",");
    const trustedCount = parseInt(process.env.TRUSTED_PROXY_COUNT || "1", 10);
    const idx = Math.min(parts.length - 1, Math.max(0, trustedCount - 1));
    const ip = parts[idx]?.trim();
    if (ip) return ip;
  }

  const realIp = headers.get("x-real-ip");
  if (realIp) return realIp;

  const connectingIp = headers.get("cf-connecting-ip");
  if (connectingIp) return connectingIp;

  return "unknown";
}

export function isValidCelebrityId(id: string): boolean {
  return celebrities.some((c) => c.id === id);
}

export function sanitizeInput(text: string, maxLength: number = 2000): string {
  return text
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "")
    .replace(/javascript:/gi, "")
    .replace(/data:text\/html/gi, "")
    .replace(/vbscript:/gi, "")
    .replace(/\bon\w+\s*=\s*["'][^"']*["']/gi, "")
    .replace(/\x00/g, "")
    .trim()
    .slice(0, maxLength);
}
