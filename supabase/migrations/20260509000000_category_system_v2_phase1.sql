-- ============================================================
-- Category System V2 - Phase 1 (Non-breaking)
--
-- Goals:
-- 1) Introduce normalized category tables.
-- 2) Backfill mapping from legacy posts.category.
-- 3) Keep existing posts.category flow untouched for compatibility.
-- ============================================================

-- 1) Categories master table
create table if not exists categories (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name text not null,
  description text,
  is_hot boolean not null default false,
  is_active boolean not null default true,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- 2) Post-category mapping (many-to-many)
create table if not exists post_categories (
  post_id uuid not null references posts(id) on delete cascade,
  category_id uuid not null references categories(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (post_id, category_id)
);

-- 3) Optional compatibility column for future UI/breadcrumb usage
alter table posts
  add column if not exists primary_category_id uuid references categories(id);

-- 4) Seed base categories used by current system
insert into categories (slug, name, is_hot, is_active, sort_order)
values
  ('blog', 'Blog', true, true, 10),
  ('baohay', 'Bao hay', true, true, 20)
on conflict (slug) do update
set
  name = excluded.name,
  is_active = excluded.is_active;

-- 5) Backfill mapping from legacy posts.category -> post_categories
insert into post_categories (post_id, category_id)
select p.id, c.id
from posts p
join categories c on c.slug = p.category
on conflict (post_id, category_id) do nothing;

-- 6) Backfill primary_category_id from legacy posts.category
update posts p
set primary_category_id = c.id
from categories c
where p.primary_category_id is null
  and c.slug = p.category;

-- 7) Performance indexes
create index if not exists idx_categories_hot_active
  on categories (is_hot, is_active, sort_order, created_at desc);

create index if not exists idx_post_categories_category
  on post_categories (category_id, post_id);

create index if not exists idx_post_categories_post
  on post_categories (post_id, category_id);

create index if not exists idx_posts_primary_category_id
  on posts (primary_category_id);
