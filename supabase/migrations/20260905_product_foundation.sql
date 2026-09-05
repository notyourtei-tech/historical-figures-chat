-- Product foundation: authenticated cloud conversations, consent, minimal
-- analytics, and category-only moderation telemetry. Run in Supabase SQL Editor.
create extension if not exists pgcrypto;

create table if not exists public.conversations (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  celebrity_id text not null check (char_length(celebrity_id) between 1 and 64),
  language text not null default 'zh' check (language in ('zh', 'en', 'ja', 'vi', 'my')),
  title text not null default '' check (char_length(title) <= 120),
  last_message text not null default '' check (char_length(last_message) <= 240),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, celebrity_id)
);

create table if not exists public.conversation_messages (
  id uuid primary key default gen_random_uuid(),
  conversation_id uuid not null references public.conversations(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  sequence integer not null check (sequence >= 0 and sequence <= 100),
  role text not null check (role in ('user', 'assistant')),
  content text not null check (char_length(content) between 1 and 2000),
  created_at timestamptz not null default now(),
  unique (conversation_id, sequence)
);

create table if not exists public.privacy_consents (
  user_id uuid primary key references auth.users(id) on delete cascade,
  version text not null check (char_length(version) <= 32),
  ai_processing boolean not null default false,
  analytics boolean not null default false,
  updated_at timestamptz not null default now()
);

create table if not exists public.analytics_events (
  id bigint generated always as identity primary key,
  occurred_at timestamptz not null default now(),
  user_id uuid references auth.users(id) on delete set null,
  anonymous_id uuid,
  event_name text not null check (event_name in (
    'privacy_consent_updated', 'onboarding_completed', 'auth_login_started',
    'auth_login_completed', 'conversation_started', 'message_sent',
    'cloud_sync_completed', 'content_policy_triggered'
  )),
  properties jsonb not null default '{}'::jsonb
);

create table if not exists public.moderation_events (
  id bigint generated always as identity primary key,
  occurred_at timestamptz not null default now(),
  category text not null check (category in (
    'sexual_content_involving_minors', 'self_harm_or_suicide',
    'credible_violent_threat', 'personal_data'
  )),
  action text not null check (action in ('warn', 'block')),
  source text not null check (source in ('chat'))
);

create or replace function public.set_updated_at()
returns trigger language plpgsql security invoker set search_path = public as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists conversations_set_updated_at on public.conversations;
create trigger conversations_set_updated_at
before update on public.conversations
for each row execute function public.set_updated_at();

drop trigger if exists privacy_consents_set_updated_at on public.privacy_consents;
create trigger privacy_consents_set_updated_at
before update on public.privacy_consents
for each row execute function public.set_updated_at();

alter table public.conversations enable row level security;
alter table public.conversation_messages enable row level security;
alter table public.privacy_consents enable row level security;
alter table public.analytics_events enable row level security;
alter table public.moderation_events enable row level security;

create policy "Users read own conversations" on public.conversations
for select using ((select auth.uid()) = user_id);
create policy "Users create own conversations" on public.conversations
for insert with check ((select auth.uid()) = user_id);
create policy "Users update own conversations" on public.conversations
for update using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
create policy "Users delete own conversations" on public.conversations
for delete using ((select auth.uid()) = user_id);

create policy "Users read own messages" on public.conversation_messages
for select using ((select auth.uid()) = user_id);
create policy "Users create own messages" on public.conversation_messages
for insert with check ((select auth.uid()) = user_id);
create policy "Users update own messages" on public.conversation_messages
for update using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
create policy "Users delete own messages" on public.conversation_messages
for delete using ((select auth.uid()) = user_id);

create policy "Users read own privacy consent" on public.privacy_consents
for select using ((select auth.uid()) = user_id);
create policy "Users create own privacy consent" on public.privacy_consents
for insert with check ((select auth.uid()) = user_id);
create policy "Users update own privacy consent" on public.privacy_consents
for update using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);

-- analytics_events and moderation_events have no public policies. Only the
-- server's service-role key may write them; no browser can read them.
create index if not exists conversations_user_updated_idx on public.conversations(user_id, updated_at desc);
create index if not exists messages_conversation_sequence_idx on public.conversation_messages(conversation_id, sequence);
create index if not exists analytics_events_name_time_idx on public.analytics_events(event_name, occurred_at desc);
