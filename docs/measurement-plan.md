# Product measurement plan

## Baseline and goal

Baseline readiness: **broken (15/100)** before this release. There was no consent-gated event collection, no stable event dictionary, and no way to connect product use to account or sync outcomes.

The target is **decision-ready (80/100)**: answer whether visitors activate, whether sign-in creates durable use, whether cloud sync succeeds, and whether safety controls fire. This is a first-party, consent-only system; it is intentionally not a behavioural advertising stack.

## Event index

| Event | Trigger | Approved properties | Decision supported |
| --- | --- | --- | --- |
| `privacy_consent_updated` | User changes privacy setting | `ai_processing`, `analytics`, `version` | Can AI/analytics features be offered responsibly? |
| `onboarding_completed` | Onboarding ends | `language`, `has_mbti`, `interest_count` | Where do visitors finish initial setup? |
| `auth_login_started` | Google or magic-link button | `method` | Which free login path is preferred? |
| `auth_login_completed` | Browser session becomes authenticated | `provider` | Are login starts turning into sessions? |
| `conversation_started` | A synced cloud conversation opens | `celebrity_id` | Which learning personas retain users? |
| `message_sent` | User submits an AI message | `celebrity_id`, `length_bucket` | Is the core dialogue loop activated? |
| `cloud_sync_completed` | Conversation sync returns OK | `message_count` | Is cross-device continuity reliable? |
| `content_policy_triggered` | Content policy blocks a request | `action` | Is moderation load changing over time? |

Never include a message, name, email, phone number, IP address, URL query value, or free-text metadata in event properties.

## Validation cadence

- Before release: run `npm test`, `npm run build`, and `npm run test:e2e`.
- Weekly: compare login start/completion and sync success/failure trends; inspect Sentry for new route errors.
- Monthly: review the event index, delete unused events, and re-check consent wording before adding a new collector.
