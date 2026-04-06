-- ============================================================
-- Post Article Fields Migration
-- Adds rich article metadata to posts table and makes
-- admin-authored published posts publicly readable (no login).
-- ============================================================

-- ── 1. New columns ───────────────────────────────────────────

alter table posts
  add column if not exists category            text    not null default 'blog'
    check (category in ('blog', 'baohay', 'audiochat')),
  add column if not exists level               text
    check (level in ('A1','A2','B1','B2','C1','C2')),
  add column if not exists audio_url           text,
  add column if not exists cover_image_caption text,
  add column if not exists reading_time        integer not null default 0,
  add column if not exists tags                text[]  not null default '{}',
  add column if not exists word_count          integer not null default 0,
  add column if not exists event_encounters    integer not null default 0,
  add column if not exists cards_count         integer not null default 0,
  add column if not exists feedback_intro      text,
  add column if not exists player_feedback     jsonb   not null default '[]';

-- ── 2. Indexes ───────────────────────────────────────────────

create index if not exists idx_posts_category on posts(category);
create index if not exists idx_posts_level    on posts(level);

-- ── 3. Rebuild posts_with_counts view (adds author_role) ─────

drop view if exists posts_with_counts;

create view posts_with_counts as
  select
    p.*,
    pr.display_name                  as author_name,
    pr.role                          as author_role,
    count(distinct l.id)::int        as like_count,
    count(distinct c.id)::int        as comment_count
  from posts p
  left join profiles pr on pr.id    = p.author_id
  left join likes l     on l.post_id = p.id
  left join comments c  on c.post_id = p.id
  group by p.id, pr.display_name, pr.role;

-- ── 4. Public RLS: admin posts readable without login ────────

create policy "Admin posts are publicly readable"
  on posts for select to anon
  using (
    published = true
    and exists (
      select 1 from profiles
      where id   = posts.author_id
        and role = 'admin'
    )
  );
