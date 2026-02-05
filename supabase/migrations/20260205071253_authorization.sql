-- ============================================================
-- Authorization Migration
-- Feature: authorization
-- Step 1: Backend - Models, Schema, RLS
-- ============================================================

-- 1. TABLES (must come before functions that reference them)
-- ============================================================

-- Profiles table (extends auth.users)
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text not null check (char_length(display_name) between 2 and 30),
  email text not null,
  role text not null default 'user' check (role in ('user', 'admin')),
  is_banned boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index idx_profiles_role on public.profiles (role);
create index idx_profiles_email on public.profiles (email);

-- Update scores table: add user_id column
alter table public.scores
  add column user_id uuid references public.profiles(id) on delete cascade;

-- Game configuration table
create table public.game_config (
  id text primary key,
  display_name text not null,
  description text not null default '',
  icon text not null default '',
  enabled boolean not null default true,
  config jsonb not null default '{}',
  sort_order integer not null default 0,
  updated_at timestamptz not null default now(),
  updated_by uuid references public.profiles(id)
);

-- Site configuration table (key-value store)
create table public.site_config (
  key text primary key,
  value jsonb not null,
  description text not null default '',
  updated_at timestamptz not null default now()
);

-- 2. HELPER FUNCTIONS
-- ============================================================

-- Check if current user is admin
create or replace function public.is_admin()
returns boolean as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid()
    and role = 'admin'
  );
$$ language sql security definer stable;

-- Check if current user is not banned
create or replace function public.is_not_banned()
returns boolean as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid()
    and is_banned = false
  );
$$ language sql security definer stable;

-- Auto-update updated_at timestamp
create or replace function public.update_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

-- Auto-create profile when user registers
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email, display_name)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data ->> 'display_name', split_part(new.email, '@', 1))
  );
  return new;
end;
$$ language plpgsql security definer;

-- 3. TRIGGERS
-- ============================================================

-- Auto-create profile on user registration
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Auto-update updated_at
create trigger profiles_updated_at
  before update on public.profiles
  for each row execute function public.update_updated_at();

create trigger game_config_updated_at
  before update on public.game_config
  for each row execute function public.update_updated_at();

create trigger site_config_updated_at
  before update on public.site_config
  for each row execute function public.update_updated_at();

-- 4. RLS POLICIES
-- ============================================================

-- profiles
alter table public.profiles enable row level security;

create policy "Profiles are publicly readable"
  on public.profiles for select
  to anon, authenticated
  using (true);

create policy "Users can update own profile"
  on public.profiles for update
  to authenticated
  using (auth.uid() = id);

create policy "Admins can update any profile"
  on public.profiles for update
  to authenticated
  using (is_admin());

-- scores (drop old policies, create new ones)
drop policy if exists "Scores are publicly readable" on public.scores;
drop policy if exists "Anyone can insert scores" on public.scores;

create policy "Scores are publicly readable"
  on public.scores for select
  to anon, authenticated
  using (true);

create policy "Authenticated non-banned users can insert scores"
  on public.scores for insert
  to authenticated
  with check (auth.uid() = user_id and is_not_banned());

create policy "Admins can delete scores"
  on public.scores for delete
  to authenticated
  using (is_admin());

-- game_config
alter table public.game_config enable row level security;

create policy "Game config is publicly readable"
  on public.game_config for select
  to anon, authenticated
  using (true);

create policy "Admins can update game config"
  on public.game_config for update
  to authenticated
  using (is_admin());

create policy "Admins can insert game config"
  on public.game_config for insert
  to authenticated
  with check (is_admin());

-- site_config
alter table public.site_config enable row level security;

create policy "Site config is publicly readable"
  on public.site_config for select
  to anon, authenticated
  using (true);

create policy "Admins can update site config"
  on public.site_config for update
  to authenticated
  using (is_admin());

create policy "Admins can insert site config"
  on public.site_config for insert
  to authenticated
  with check (is_admin());

-- 5. SEED DATA
-- ============================================================

-- Game configurations
insert into public.game_config (id, display_name, description, icon, enabled, config, sort_order)
values
  ('snake', 'Snake', 'Classic snake game. Eat food, grow longer, don''t hit yourself!', '🐍', true,
   '{"speed": 120, "grid_size": 20, "growth_per_food": 1, "score_per_food": 10}', 1),
  ('pong', 'Pong', 'The original arcade classic. Beat the AI paddle!', '🏓', true,
   '{"ball_speed": 4, "ai_speed": 3, "win_score": 5, "speed_increment": 1.05}', 2),
  ('breakout', 'Breakout', 'Smash all the bricks with your ball and paddle.', '🧱', true,
   '{"ball_speed": 3, "lives": 3, "brick_rows": 5, "brick_cols": 10, "score_per_brick": 10}', 3);

-- Site configurations
insert into public.site_config (key, value, description)
values
  ('site_title', '"Game Portal"', 'Site title shown in navbar and browser tab'),
  ('maintenance_mode', 'false', 'When enabled, non-admin users see a maintenance page'),
  ('registration_enabled', 'true', 'When disabled, the registration page is hidden');
