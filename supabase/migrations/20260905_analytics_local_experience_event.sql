-- Keep the server allowlist and database check constraint aligned when adding
-- privacy-approved product events.
alter table public.analytics_events
  drop constraint if exists analytics_events_event_name_check;

alter table public.analytics_events
  add constraint analytics_events_event_name_check check (event_name in (
    'privacy_consent_updated', 'onboarding_completed', 'auth_login_started',
    'auth_login_completed', 'local_experience_started', 'conversation_started',
    'message_sent', 'cloud_sync_completed', 'content_policy_triggered'
  ));
