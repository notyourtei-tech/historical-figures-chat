# Production setup checklist

This repository starts in a genuinely zero-external-cost mode: `HISTORICAL_CHAT_MODE=offline` uses a local persona engine and the local experience login. It needs no account, database, model key, email service, or SMS service. The local login stores only a display email in the current browser; it never stores or uploads the entered password and it must not be mistaken for a cloud account.

No third-party free tier can be guaranteed forever. Supabase, email delivery, model APIs, monitoring vendors, and hosting can change quotas, terms, or availability. Keep every integration below opt-in and budget-alerted; the local mode remains the no-vendor fallback. Do not send any service-role key, SMTP key, or OAuth client secret through chat or commit it to Git.

## 1. Optional Supabase: auth and cloud conversations

1. Create a Supabase project and run `supabase/migrations/20260905_product_foundation.sql` once in its SQL Editor.
2. In Authentication > URL Configuration, set the Site URL to the production domain and add both `http://localhost:3001/auth/callback` and `https://YOUR_DOMAIN/auth/callback` to Redirect URLs.
3. Add `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`, and the server-only `SUPABASE_SERVICE_ROLE_KEY` to the hosting environment. Keep the service-role key out of the browser and out of all `NEXT_PUBLIC_` variables.
4. Confirm RLS remains enabled on every table in the migration. A normal signed-in user must only see their own rows.

## 2. Optional Google sign-in

1. In Google Cloud Console, create an OAuth 2.0 Web application for this project.
2. Add the redirect URI shown by Supabase: `https://YOUR_PROJECT_REF.supabase.co/auth/v1/callback`.
3. Copy the Google Client ID and Client Secret into Supabase Authentication > Providers > Google, enable the provider, and save.
4. Test in an incognito window with a non-owner Google account. The browser must return through `/auth/callback` to the requested app page.

Google OAuth itself normally does not require a paid authentication product. It can still be subject to Google account, consent-screen, and quota policies, so it is not a lifetime-free guarantee.

## 3. Optional email magic link

The default Supabase mail service is deliberately rate-limited and intended for testing; it is not a public production mail service. For a free launch, connect a custom SMTP provider with a free tier (for example, Resend) in Supabase Authentication > SMTP. At the time this guide was written, Resend's free transactional tier states 3,000 emails/month and 100/day; verify its current limit before launch. The sender domain/address, verification, DNS records, and free-tier limits belong to that provider; test delivery and spam placement before publishing.

This app uses passwordless magic links, not password storage. Set the email redirect URL to the same `/auth/callback` URLs above.

## 4. Phone number login

Do not enable phone/SMS login for the no-cost launch. SMS OTP requires an SMS provider and messages are billed by that provider. The interface explains this rather than falsely presenting a free phone-login option. Add it only after choosing a funded provider and adding fraud, CAPTCHA, country, and rate-limit rules.

## 5. Optional online-model mode

Keep `HISTORICAL_CHAT_MODE=offline` for the no-vendor baseline. To enable model-generated answers, explicitly set `HISTORICAL_CHAT_MODE=online` and provide an `OPENROUTER_API_KEY`. Model-provider availability and any “free” route can change; use spend limits and an alert before allowing live traffic. The application falls back to its local persona engine if the optional online service is absent or unavailable.

## 6. Final release gate

1. Add Sentry DSNs, set up `/api/health` uptime alerting, and configure a real escalation mailbox.
2. Run `npm test`, `npm run build`, `npm run test:e2e`, and the Android/iOS acceptance steps in `docs/real-device-e2e.md`.
3. Test Google login, magic link, cross-device conversation restore, account export, permanent account deletion, consent withdrawal, and safety rejection in a staging project.
4. Keep a written support contact, privacy owner, deletion-request process, and incident owner before taking public traffic.
