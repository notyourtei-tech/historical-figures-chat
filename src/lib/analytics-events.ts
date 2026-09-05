export const ANALYTICS_EVENTS = [
  "privacy_consent_updated",
  "onboarding_completed",
  "auth_login_started",
  "auth_login_completed",
  "local_experience_started",
  "conversation_started",
  "message_sent",
  "cloud_sync_completed",
  "content_policy_triggered",
] as const;

export type AnalyticsEventName = (typeof ANALYTICS_EVENTS)[number];
