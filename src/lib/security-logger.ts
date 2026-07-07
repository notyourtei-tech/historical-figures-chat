import { readFileSync, writeFileSync, existsSync, mkdirSync } from "fs";
import { appendFile } from "fs/promises";
import { join } from "path";

type SecurityEvent = {
  timestamp: string;
  type: "RATE_LIMIT" | "INVALID_INPUT" | "INVALID_ORIGIN" | "AUTH_FAILURE" | "SUSPICIOUS_ACTIVITY";
  ip?: string;
  path?: string;
  detail?: string;
};

const LOG_DIR = join(process.cwd(), ".logs");
const LOG_FILE = join(LOG_DIR, "security.jsonl");
const MAX_IN_MEMORY = 200;

const securityLog: SecurityEvent[] = [];

function ensureLogDir() {
  if (!existsSync(LOG_DIR)) {
    mkdirSync(LOG_DIR, { recursive: true });
  }
}

function persistToFile(entry: SecurityEvent) {
  try {
    ensureLogDir();
    appendFile(LOG_FILE, JSON.stringify(entry) + "\n", "utf-8").catch(() => {});
  } catch {
    // File write failed, in-memory buffer is the fallback
  }
}

export function logSecurityEvent(event: Omit<SecurityEvent, "timestamp">) {
  const entry: SecurityEvent = {
    ...event,
    timestamp: new Date().toISOString(),
  };

  securityLog.push(entry);
  if (securityLog.length > MAX_IN_MEMORY) {
    securityLog.splice(0, securityLog.length - MAX_IN_MEMORY);
  }

  persistToFile(entry);

  if (process.env.NODE_ENV === "development") {
    console.warn(`[Security] ${event.type}: ${event.detail || ""} | IP: ${event.ip || "unknown"} | Path: ${event.path || "/"}`);
  }
}

export function getSecurityLog(limit: number = 100): SecurityEvent[] {
  if (securityLog.length >= limit) {
    return securityLog.slice(-limit);
  }

  try {
    ensureLogDir();
    if (existsSync(LOG_FILE)) {
      const lines = readFileSync(LOG_FILE, "utf-8").trim().split("\n").filter(Boolean);
      const fileEvents: SecurityEvent[] = lines
        .slice(-limit)
        .map((line) => {
          try { return JSON.parse(line) as SecurityEvent; }
          catch { return null; }
        })
        .filter((e): e is SecurityEvent => e !== null);
      return fileEvents.slice(-limit);
    }
  } catch {
    // Fall through to in-memory
  }

  return securityLog.slice(-limit);
}

export function clearSecurityLog() {
  securityLog.length = 0;
  try {
    ensureLogDir();
    writeFileSync(LOG_FILE, "", "utf-8");
  } catch {
    // Ignore
  }
}
