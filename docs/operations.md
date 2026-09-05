# Operations and alerting

## Health endpoint

`GET /api/health` is public, cache-disabled, and intentionally exposes only high-level configuration state. It never exposes keys, user data, or provider responses.

Create a free uptime monitor (for example, UptimeRobot) for `https://YOUR_DOMAIN/api/health` and direct alerts to the operating mailbox. Treat repeated failures as an incident; the endpoint remains HTTP 200 when optional integrations are unconfigured, so it monitors web availability rather than billing/configuration status.

## Error monitoring

1. Create a Sentry project and add `SENTRY_DSN` and `NEXT_PUBLIC_SENTRY_DSN` in the deployment environment.
2. Create alerts for: a new issue, error count above 10 in 10 minutes, and a release regression.
3. Add `SENTRY_ENVIRONMENT=production` in production.

The Sentry initialization disables default PII and strips cookies, headers, request bodies, and user information. Do not turn on session replay or increase the trace sample rate until its privacy impact has been separately approved.

## Incident playbook

1. Check `/api/health`, deployment status, and Sentry error group.
2. If AI failures increase, keep browsing and local history available, and check the configured provider key/rate limit without copying messages into tickets.
3. If login or sync fails, check Supabase status and RLS migration state; never disable RLS as a quick fix.
4. Record the incident using categories and timings only. Do not paste user conversations, email addresses, cookies, or IPs into incident notes.
