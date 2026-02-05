# Step 1 - Backend: Models, Schema & SQL Migration

## Status: ✅ Completed
## Relates to: US-01, US-02, US-05, US-06, US-07, US-08, US-09

---

## Overview
Create all database tables, functions, triggers, and RLS policies needed for the authorization system. Everything is defined in a single SQL migration file pushed via Supabase CLI.

---

## 1.1 Database Tables

### Table: `profiles`
Extends Supabase `auth.users`. Auto-created when a user registers.

```sql
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text not null check (char_length(display_name) between 2 and 30),
  email text not null,
  role text not null default 'user' check (role in ('user', 'admin')),
  is_banned boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
```

**Indexes:**
- `idx_profiles_role` on `(role)` — for admin queries filtering by role
- `idx_profiles_email` on `(email)` — for search by email

**Notes:**
- `id` is a foreign key to `auth.users(id)` with `on delete cascade` so deleting the auth user also removes the profile
- `email` is copied from `auth.users` for easy querying (avoids joining auth schema)
- `role` is constrained to `'user'` or `'admin'` via CHECK

---

### Table: `scores` (UPDATE existing)
Add `user_id` column to link scores to authenticated users.

```sql
alter table public.scores
  add column user_id uuid references public.profiles(id) on delete cascade;
```

**Migration concern:**
- Existing rows will have `user_id = null` (anonymous scores from before auth)
- New scores require `user_id` (enforced via RLS policy, not NOT NULL constraint, to preserve old data)

---

### Table: `game_config`
Stores per-game settings. Admins can enable/disable games and tweak difficulty.

```sql
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
```

**`config` JSONB structure per game:**

Snake:
```json
{
  "speed": 120,
  "grid_size": 20,
  "growth_per_food": 1,
  "score_per_food": 10
}
```

Pong:
```json
{
  "ball_speed": 4,
  "ai_speed": 3,
  "win_score": 5,
  "speed_increment": 1.05
}
```

Breakout:
```json
{
  "ball_speed": 3,
  "lives": 3,
  "brick_rows": 5,
  "brick_cols": 10,
  "score_per_brick": 10
}
```

---

### Table: `site_config`
Key-value store for global site settings.

```sql
create table public.site_config (
  key text primary key,
  value jsonb not null,
  description text not null default '',
  updated_at timestamptz not null default now()
);
```

**Default rows:**

| key | value | description |
|-----|-------|-------------|
| `site_title` | `"Game Portal"` | Displayed in navbar and browser tab |
| `maintenance_mode` | `false` | When true, non-admins see maintenance page |
| `registration_enabled` | `true` | When false, register page is hidden/disabled |

---

## 1.2 Database Functions

### Function: `is_admin()`
Helper function used in RLS policies to check if the current user is an admin.

```sql
create or replace function public.is_admin()
returns boolean as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid()
    and role = 'admin'
  );
$$ language sql security definer stable;
```

**Usage in RLS:** `using (is_admin())` — clean, reusable, single source of truth.

---

### Function: `is_not_banned()`
Helper to check if current user is not banned.

```sql
create or replace function public.is_not_banned()
returns boolean as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid()
    and is_banned = false
  );
$$ language sql security definer stable;
```

---

### Function: `handle_new_user()`
Trigger function that auto-creates a profile when a new user registers via Supabase Auth.

```sql
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
```

**Notes:**
- `display_name` comes from `raw_user_meta_data` passed during `signUp()`
- Fallback: uses the email prefix (e.g. `john` from `john@example.com`)

---

### Function: `update_updated_at()`
Generic trigger function to auto-update `updated_at` on row modification.

```sql
create or replace function public.update_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;
```

---

## 1.3 Triggers

```sql
-- Auto-create profile on user registration
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Auto-update updated_at on profiles
create trigger profiles_updated_at
  before update on public.profiles
  for each row execute function public.update_updated_at();

-- Auto-update updated_at on game_config
create trigger game_config_updated_at
  before update on public.game_config
  for each row execute function public.update_updated_at();

-- Auto-update updated_at on site_config
create trigger site_config_updated_at
  before update on public.site_config
  for each row execute function public.update_updated_at();
```

---

## 1.4 RLS Policies

### `profiles` table

| Policy Name | Operation | Who | Rule |
|-------------|-----------|-----|------|
| `Profiles are publicly readable` | SELECT | anon, authenticated | `true` |
| `Users can update own profile` | UPDATE | authenticated | `auth.uid() = id` |
| `Admins can update any profile` | UPDATE | authenticated | `is_admin()` |

**Important:** The "Users can update own profile" policy should restrict which columns users can change. Since RLS can't restrict columns, we enforce this at the API layer — users can only update `display_name`, admins can update `role`, `is_banned`.

### `scores` table (replace existing policies)

| Policy Name | Operation | Who | Rule |
|-------------|-----------|-----|------|
| `Scores are publicly readable` | SELECT | anon, authenticated | `true` |
| `Authenticated non-banned users can insert` | INSERT | authenticated | `auth.uid() = user_id and is_not_banned()` |
| `Admins can delete scores` | DELETE | authenticated | `is_admin()` |

### `game_config` table

| Policy Name | Operation | Who | Rule |
|-------------|-----------|-----|------|
| `Game config is publicly readable` | SELECT | anon, authenticated | `true` |
| `Admins can update game config` | UPDATE | authenticated | `is_admin()` |
| `Admins can insert game config` | INSERT | authenticated | `is_admin()` |

### `site_config` table

| Policy Name | Operation | Who | Rule |
|-------------|-----------|-----|------|
| `Site config is publicly readable` | SELECT | anon, authenticated | `true` |
| `Admins can update site config` | UPDATE | authenticated | `is_admin()` |
| `Admins can insert site config` | INSERT | authenticated | `is_admin()` |

---

## 1.5 Seed Data

### game_config seed

```sql
insert into public.game_config (id, display_name, description, icon, enabled, config, sort_order)
values
  ('snake', 'Snake', 'Classic snake game. Eat food, grow longer, don''t hit yourself!', '🐍', true,
   '{"speed": 120, "grid_size": 20, "growth_per_food": 1, "score_per_food": 10}', 1),
  ('pong', 'Pong', 'The original arcade classic. Beat the AI paddle!', '🏓', true,
   '{"ball_speed": 4, "ai_speed": 3, "win_score": 5, "speed_increment": 1.05}', 2),
  ('breakout', 'Breakout', 'Smash all the bricks with your ball and paddle.', '🧱', true,
   '{"ball_speed": 3, "lives": 3, "brick_rows": 5, "brick_cols": 10, "score_per_brick": 10}', 3);
```

### site_config seed

```sql
insert into public.site_config (key, value, description)
values
  ('site_title', '"Game Portal"', 'Site title shown in navbar and browser tab'),
  ('maintenance_mode', 'false', 'When enabled, non-admin users see a maintenance page'),
  ('registration_enabled', 'true', 'When disabled, the registration page is hidden');
```

---

## 1.6 Migration File

**File:** `supabase/migrations/YYYYMMDD_authorization.sql`

**Execution order within migration:**
1. Create helper functions (`is_admin`, `is_not_banned`, `update_updated_at`, `handle_new_user`)
2. Create `profiles` table + indexes
3. Create `auth.users` trigger
4. Alter `scores` table (add `user_id`, drop old RLS policies, create new ones)
5. Create `game_config` table
6. Create `site_config` table
7. Apply all RLS policies
8. Insert seed data
9. Create `updated_at` triggers

---

## 1.7 First Admin User

After migration, manually set the first admin via SQL:

```sql
-- Register via the app first, then run:
update public.profiles
set role = 'admin'
where email = 'your-admin-email@example.com';
```

Or create a seed script that checks an environment variable for the admin email.

---

## Tasks

| # | Task | Status | Notes |
|---|------|--------|-------|
| 1 | Write `is_admin()` function | ⬜ | |
| 2 | Write `is_not_banned()` function | ⬜ | |
| 3 | Write `update_updated_at()` function | ⬜ | |
| 4 | Write `handle_new_user()` trigger function | ⬜ | |
| 5 | Create `profiles` table SQL | ⬜ | |
| 6 | Create `on_auth_user_created` trigger | ⬜ | |
| 7 | Alter `scores` table (add user_id) | ⬜ | |
| 8 | Create `game_config` table SQL | ⬜ | |
| 9 | Create `site_config` table SQL | ⬜ | |
| 10 | Write all RLS policies for `profiles` | ⬜ | |
| 11 | Replace RLS policies for `scores` | ⬜ | |
| 12 | Write RLS policies for `game_config` | ⬜ | |
| 13 | Write RLS policies for `site_config` | ⬜ | |
| 14 | Write seed data for `game_config` | ⬜ | |
| 15 | Write seed data for `site_config` | ⬜ | |
| 16 | Combine into single migration file | ⬜ | |
| 17 | Push migration via `npx supabase db push` | ⬜ | |
| 18 | Verify all tables exist in Supabase dashboard | ⬜ | |
| 19 | Register test user and verify profile auto-created | ⬜ | |
| 20 | Set first admin user via SQL | ⬜ | |
