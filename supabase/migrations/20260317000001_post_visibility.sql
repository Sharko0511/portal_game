-- ============================================================
-- Post Visibility Migration
-- Replaces boolean `published` with enum-like visibility:
--   'private' — owner only
--   'share'   — owner + followers (requires login)
--   'public'  — everyone (no login needed), set by admin
-- ============================================================

-- ── 1. Add visibility column ──────────────────────────────────

alter table posts
  add column if not exists visibility text not null default 'private'
    check (visibility in ('private', 'share', 'public'));

-- ── 2. Migrate existing data ──────────────────────────────────
-- published = true  → 'public'  (were admin posts, keep them public)
-- published = false → 'private'

update posts set visibility = 'public'  where published = true;
update posts set visibility = 'private' where published = false;

-- ── 3. Index for fast filtering ───────────────────────────────

create index if not exists idx_posts_visibility on posts(visibility);

-- ── 4. Rebuild posts_with_counts view (swap published → visibility) ──

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

-- ── 5. Drop old RLS policy (used published = true) ────────────

drop policy if exists "Admin posts are publicly readable" on posts;
drop policy if exists "Posts visible to author and followers" on posts;

-- ── 6. New RLS policies ───────────────────────────────────────

-- Public posts: anyone (including anon) can read
create policy "Public posts readable by anyone"
  on posts for select to anon, authenticated
  using (visibility = 'public');

-- Share posts: author or followers (authenticated only)
create policy "Share posts visible to author and followers"
  on posts for select to authenticated
  using (
    visibility = 'share'
    and (
      auth.uid() = author_id
      or exists (
        select 1 from follows
        where follower_id  = auth.uid()
        and   following_id = author_id
      )
    )
  );

-- Private posts: owner only
create policy "Private posts visible to owner only"
  on posts for select to authenticated
  using (
    visibility = 'private'
    and auth.uid() = author_id
  );
