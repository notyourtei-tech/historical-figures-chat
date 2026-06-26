export const ErrorCode = {
  MISSING_API_KEY: "MISSING_API_KEY",
  API_CALL_FAILED: "API_CALL_FAILED",
  INVALID_RESPONSE: "INVALID_RESPONSE",
  RATE_LIMIT: "RATE_LIMIT_EXCEEDED",
  SERVER_ERROR: "SERVER_ERROR",
  INVALID_REQUEST: "INVALID_REQUEST",
  INVALID_ORIGIN: "INVALID_ORIGIN",
  AI_EMPTY_RESPONSE: "AI_EMPTY_RESPONSE",
  REQUEST_TIMEOUT: "REQUEST_TIMEOUT",
} as const;

export type ErrorCode = (typeof ErrorCode)[keyof typeof ErrorCode];

export function isErrorCode(value: string): value is ErrorCode {
  return Object.values(ErrorCode).includes(value as ErrorCode);
}
