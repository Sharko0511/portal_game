-- ============================================================
-- Telegram Integration Migration
-- ============================================================

-- ── 1. Add telegram_chat_id to profiles ──────────────────────
alter table profiles add column telegram_chat_id bigint;

-- ── 2. One-time link tokens ───────────────────────────────────
create table telegram_link_tokens (
  token      text primary key,
  user_id    uuid references profiles(id) on delete cascade not null,
  expires_at timestamptz default (now() + interval '10 minutes') not null
);

alter table telegram_link_tokens enable row level security;

-- Only the service role (used server-side) can manage these tokens.
-- No client-side access needed.
