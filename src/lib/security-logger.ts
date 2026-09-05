import { createHash } from "crypto";
import { captureOperationalError } from "@/lib/observability";

type SecurityEvent = {
  timestamp: string;
  type: "RATE_LIMIT" | "INVALID_INPUT" | "INVALID_ORIGIN" | "AUTH_FAILURE" | "SUSPICIOUS_ACTIVITY" | "CONTENT_POLICY";
  ipHash?: string;
  path?: string;
  detail?: string;
};

const MAX_IN_MEMORY = 200;

const securityLog: SecurityEvent[] = [];

function hashIp(ip?: string): string | undefined {
  if (!ip || ip === "unknown") return undefined;
  return createHash("sha256").update(ip).digest("hex").slice(0, 16);
}

export function logSecurityEvent(event: {
  type: SecurityEvent["type"];
  ip?: string;
  path?: string;
  detail?: string;
}) {
  const entry: SecurityEvent = {
    timestamp: new Date().toISOString(),
    type: event.type,
    ipHash: hashIp(event.ip),
    path: event.path,
    // Details are category-level only; callers must never put requests/messages here.
    detail: event.detail?.replace(/[\r\n]/g, " ").slice(0, 120),
  };

  securityLog.push(entry);
  if (securityLog.length > MAX_IN_MEMORY) {
    securityLog.splice(0, securityLog.length - MAX_IN_MEMORY);
  }

  if (process.env.NODE_ENV === "development") {
    console.warn(`[Security] ${entry.type}: ${entry.detail || ""} | Path: ${entry.path || "/"}`);
  }

  captureOperationalError(new Error(`Security event: ${entry.type}`), {
    eventType: entry.type,
    path: entry.path,
    ipHash: entry.ipHash,
  });
}

export function getSecurityLog(limit: number = 100): SecurityEvent[] {
  if (securityLog.length >= limit) {
    return securityLog.slice(-limit);
  }

  return securityLog.slice(-limit);
}

export function clearSecurityLog() {
  securityLog.length = 0;
}
