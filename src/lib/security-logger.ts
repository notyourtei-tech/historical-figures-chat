type SecurityEvent = {
  timestamp: string;
  type: "RATE_LIMIT" | "INVALID_INPUT" | "INVALID_ORIGIN" | "AUTH_FAILURE" | "SUSPICIOUS_ACTIVITY";
  ip?: string;
  path?: string;
  detail?: string;
};

const securityLog: SecurityEvent[] = [];
const MAX_LOG_SIZE = 1000;

export function logSecurityEvent(event: Omit<SecurityEvent, "timestamp">) {
  const entry: SecurityEvent = {
    ...event,
    timestamp: new Date().toISOString(),
  };

  securityLog.push(entry);

  if (securityLog.length > MAX_LOG_SIZE) {
    securityLog.splice(0, securityLog.length - MAX_LOG_SIZE);
  }

  if (process.env.NODE_ENV === "development") {
    console.warn(`[Security] ${event.type}: ${event.detail || ""} | IP: ${event.ip || "unknown"} | Path: ${event.path || "/"}`);
  }
}

export function getSecurityLog(limit: number = 100): SecurityEvent[] {
  return securityLog.slice(-limit);
}

export function clearSecurityLog() {
  securityLog.length = 0;
}
