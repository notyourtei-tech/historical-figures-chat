"use client";

import type { AnalyticsEventName } from "@/lib/analytics-events";
export type { AnalyticsEventName } from "@/lib/analytics-events";
export type AnalyticsProperties = Record<string, boolean | number | string>;

const CONSENT_KEY = "wan_gu_lingxi_privacy_consent";
const ANONYMOUS_ID_KEY = "wan_gu_lingxi_anonymous_id";

function hasAnalyticsConsent(): boolean {
  try {
    const consent = JSON.parse(localStorage.getItem(CONSENT_KEY) || "{}");
    return consent.analytics === true && consent.completed === true;
  } catch {
    return false;
  }
}

function getAnonymousId(): string {
  const current = localStorage.getItem(ANONYMOUS_ID_KEY);
  if (current) return current;
  const id = crypto.randomUUID?.() || `${Date.now()}-${Math.random().toString(36).slice(2)}`;
  localStorage.setItem(ANONYMOUS_ID_KEY, id);
  return id;
}

/** Sends only approved product metadata. Never pass names, messages, e-mail, or IP data. */
export function trackEvent(eventName: AnalyticsEventName, properties: AnalyticsProperties = {}) {
  if (typeof window === "undefined" || !hasAnalyticsConsent()) return;

  const payload = JSON.stringify({
    eventName,
    properties,
    anonymousId: getAnonymousId(),
  });

  void fetch("/api/analytics", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: payload,
    keepalive: true,
  }).catch(() => undefined);
}
