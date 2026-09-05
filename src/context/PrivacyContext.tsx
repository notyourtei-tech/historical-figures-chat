"use client";

import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { trackEvent } from "@/lib/analytics";

export const PRIVACY_CONSENT_KEY = "wan_gu_ling_xi_privacy_consent";
export const PRIVACY_POLICY_VERSION = "2026-09-05";

export type PrivacyConsent = {
  version: string;
  completed: boolean;
  aiProcessing: boolean;
  analytics: boolean;
  updatedAt: number;
};

const initialConsent: PrivacyConsent = {
  version: PRIVACY_POLICY_VERSION,
  completed: false,
  aiProcessing: false,
  analytics: false,
  updatedAt: 0,
};

type PrivacyContextValue = {
  consent: PrivacyConsent;
  ready: boolean;
  updateConsent: (patch: Pick<PrivacyConsent, "aiProcessing" | "analytics">) => void;
};

const PrivacyContext = createContext<PrivacyContextValue | undefined>(undefined);

function parseConsent(value: string | null): PrivacyConsent | null {
  try {
    const data = JSON.parse(value || "null") as Partial<PrivacyConsent> | null;
    if (!data || typeof data.completed !== "boolean" || typeof data.aiProcessing !== "boolean" || typeof data.analytics !== "boolean") return null;
    return {
      version: data.version === PRIVACY_POLICY_VERSION ? data.version : PRIVACY_POLICY_VERSION,
      completed: data.version === PRIVACY_POLICY_VERSION && data.completed,
      aiProcessing: data.version === PRIVACY_POLICY_VERSION && data.aiProcessing,
      analytics: data.version === PRIVACY_POLICY_VERSION && data.analytics,
      updatedAt: typeof data.updatedAt === "number" ? data.updatedAt : 0,
    };
  } catch {
    return null;
  }
}

export function PrivacyProvider({ children }: { children: React.ReactNode }) {
  const [consent, setConsent] = useState<PrivacyConsent>(initialConsent);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const saved = parseConsent(localStorage.getItem(PRIVACY_CONSENT_KEY));
    if (saved) setConsent(saved);
    setReady(true);
  }, []);

  const updateConsent = useCallback((patch: Pick<PrivacyConsent, "aiProcessing" | "analytics">) => {
    const next: PrivacyConsent = {
      version: PRIVACY_POLICY_VERSION,
      completed: true,
      aiProcessing: patch.aiProcessing,
      analytics: patch.analytics,
      updatedAt: Date.now(),
    };
    setConsent(next);
    localStorage.setItem(PRIVACY_CONSENT_KEY, JSON.stringify(next));
    void fetch("/api/privacy/consent", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(next),
      keepalive: true,
    }).catch(() => undefined);
    if (next.analytics) {
      trackEvent("privacy_consent_updated", { ai_processing: next.aiProcessing, analytics: true, version: next.version });
    }
  }, []);

  const value = useMemo(() => ({ consent, ready, updateConsent }), [consent, ready, updateConsent]);
  return <PrivacyContext.Provider value={value}>{children}</PrivacyContext.Provider>;
}

export function usePrivacy() {
  const context = useContext(PrivacyContext);
  if (!context) throw new Error("usePrivacy must be used inside PrivacyProvider");
  return context;
}
