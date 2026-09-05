/**
 * A deliberately local-only identity for the zero-cost experience mode.
 *
 * It is not an authentication system and must never be used to authorize an
 * API request.  In particular, passwords are intentionally not accepted by
 * this module, stored, or sent over the network.
 */
export type LocalDemoSession = {
  kind: "local";
  email: string;
  createdAt: number;
};

const STORAGE_KEY = "wan_gu_ling_xi_local_session_v1";

export function readLocalDemoSession(): LocalDemoSession | null {
  if (typeof window === "undefined") return null;
  try {
    const parsed = JSON.parse(window.localStorage.getItem(STORAGE_KEY) || "null") as Partial<LocalDemoSession> | null;
    if (parsed?.kind !== "local" || typeof parsed.email !== "string" || !parsed.email.trim() || typeof parsed.createdAt !== "number") {
      return null;
    }
    return { kind: "local", email: parsed.email.trim(), createdAt: parsed.createdAt };
  } catch {
    return null;
  }
}

export function createLocalDemoSession(email: string): LocalDemoSession {
  const session: LocalDemoSession = { kind: "local", email: email.trim(), createdAt: Date.now() };
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(session));
  return session;
}

export function clearLocalDemoSession() {
  if (typeof window !== "undefined") window.localStorage.removeItem(STORAGE_KEY);
}
