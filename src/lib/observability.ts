import * as Sentry from "@sentry/nextjs";

function scrub(value: unknown): unknown {
  if (!value || typeof value !== "object") return value;
  const source = value as Record<string, unknown>;
  const output: Record<string, unknown> = {};
  for (const [key, item] of Object.entries(source)) {
    if (/authorization|cookie|email|phone|content|message|ip/i.test(key)) continue;
    output[key] = item;
  }
  return output;
}

/** Captures operational errors with PII removed before they leave the app. */
export function captureOperationalError(error: unknown, context: Record<string, unknown> = {}) {
  if (!process.env.SENTRY_DSN && !process.env.NEXT_PUBLIC_SENTRY_DSN) return;
  Sentry.withScope((scope) => {
    scope.setContext("safe_context", scrub(context) as Record<string, unknown>);
    Sentry.captureException(error);
  });
}
