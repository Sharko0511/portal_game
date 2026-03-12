-- ============================================================
-- Social Blog Feature Migration
-- Run in: Supabase Dashboard > SQL Editor
-- ============================================================

-- ── 1. follows ───────────────────────────────────────────────

create table follows (
  id           uuid default gen_random_uuid() primary key,
  follower_id  uuid references profiles(id) on delete cascade not null,
  following_id uuid references profiles(id) on delete cascade not null,
  created_at   timestamptz default now(),
  unique(follower_id, following_id),
  check (follower_id <> following_id)
);

alter table follows enable row level security;

create policy "Follows viewable by authenticated users"
  on follows for select to authenticated using (true);

create policy "Users can follow others"
  on follows for insert to authenticated
  with check (auth.uid() = follower_id);

create policy "Users can unfollow"
  on follows for delete to authenticated
  using (auth.uid() = follower_id);

create index idx_follows_follower  on follows(follower_id);
create index idx_follows_following on follows(following_id);

-- ── 2. posts ─────────────────────────────────────────────────

create table posts (
  id              uuid default gen_random_uuid() primary key,
  author_id       uuid references profiles(id) on delete cascade not null,
  title           text not null,
  content         text not null,       -- TipTap HTML output
  cover_image_url text,                -- Supabase Storage public URL
  slug            text unique not null, -- title + timestamp suffix
  published       boolean default true,
  created_at      timestamptz default now(),
  updated_at      timestamptz default now()
);

alter table posts enable row level security;

-- visible to: the author OR users who follow the author
create policy "Posts visible to author and followers"
  on posts for select to authenticated
  using (
    auth.uid() = author_id
    or exists (
      select 1 from follows
      where follower_id  = auth.uid()
      and   following_id = author_id
    )
  );

create policy "Users can create posts"
  on posts for insert to authenticated
  with check (auth.uid() = author_id);

create policy "Authors can update their posts"
  on posts for update to authenticated
  using (auth.uid() = author_id);

create policy "Authors and admins can delete posts"
  on posts for delete to authenticated
  using (
    auth.uid() = author_id
    or exists (
      select 1 from profiles
      where id = auth.uid() and role = 'admin'
    )
  );

create index idx_posts_author     on posts(author_id);
create index idx_posts_created_at on posts(created_at desc);

-- ── 3. comments ──────────────────────────────────────────────

create table comments (
  id        uuid default gen_random_uuid() primary key,
  post_id   uuid references posts(id) on delete cascade not null,
  author_id uuid references profiles(id) on delete cascade not null,
  content   text not null,
  created_at timestamptz default now()
);

alter table comments enable row level security;

-- only users who can see the post can see its comments
create policy "Comments visible to post viewers"
  on comments for select to authenticated
  using (
    exists (
      select 1 from posts
      where posts.id = post_id
      and (
        posts.author_id = auth.uid()
        or exists (
          select 1 from follows
          where follower_id  = auth.uid()
          and   following_id = posts.author_id
        )
      )
    )
  );

create policy "Users can comment on visible posts"
  on comments for insert to authenticated
  with check (auth.uid() = author_id);

create policy "Authors and admins can delete comments"
  on comments for delete to authenticated
  using (
    auth.uid() = author_id
    or exists (
      select 1 from profiles
      where id = auth.uid() and role = 'admin'
    )
  );

create index idx_comments_post on comments(post_id);

-- ── 4. likes ─────────────────────────────────────────────────

create table likes (
  id         uuid default gen_random_uuid() primary key,
  post_id    uuid references posts(id) on delete cascade not null,
  user_id    uuid references profiles(id) on delete cascade not null,
  created_at timestamptz default now(),
  unique(post_id, user_id)
);

alter table likes enable row level security;

create policy "Likes visible to post viewers"
  on likes for select to authenticated
  using (
    exists (
      select 1 from posts
      where posts.id = post_id
      and (
        posts.author_id = auth.uid()
        or exists (
          select 1 from follows
          where follower_id  = auth.uid()
          and   following_id = posts.author_id
        )
      )
    )
  );

create policy "Users can like visible posts"
  on likes for insert to authenticated
  with check (auth.uid() = user_id);

create policy "Users can unlike"
  on likes for delete to authenticated
  using (auth.uid() = user_id);

-- ── 5. posts_with_counts view ────────────────────────────────

create view posts_with_counts as
  select
    p.*,
    pr.display_name                  as author_name,
    count(distinct l.id)::int        as like_count,
    count(distinct c.id)::int        as comment_count
  from posts p
  left join profiles pr on pr.id    = p.author_id
  left join likes l     on l.post_id = p.id
  left join comments c  on c.post_id = p.id
  group by p.id, pr.display_name;

-- ── 6. Storage bucket ────────────────────────────────────────
-- Run these separately in Supabase Dashboard > Storage
-- or via Supabase CLI:
--
-- 1. Create bucket:
--    INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
--    VALUES (
--      'post-images',
--      'post-images',
--      true,
--      5242880,   -- 5 MB
--      ARRAY['image/jpeg','image/png','image/webp','image/gif']
--    );
--
-- 2. Storage upload policy (users upload to their own folder):
--    CREATE POLICY "Users can upload their own images"
--      ON storage.objects FOR INSERT TO authenticated
--      WITH CHECK (
--        bucket_id = 'post-images'
--        AND (storage.foldername(name))[1] = auth.uid()::text
--      );
--
-- 3. Storage delete policy:
--    CREATE POLICY "Users can delete their own images"
--      ON storage.objects FOR DELETE TO authenticated
--      USING (
--        bucket_id = 'post-images'
--        AND (storage.foldername(name))[1] = auth.uid()::text
--      );
