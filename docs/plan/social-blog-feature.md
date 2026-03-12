# Social Blog Feature Plan

## Overview
Add a Twitter-style social layer to the game portal. Users can follow each other, write rich-text blog posts, comment, like, and share. Posts are only visible to followers (+ the author). Images upload directly to Supabase Storage. Built entirely within the existing Next.js App Router stack — no separate backend required.

---

## Tech Stack (no new backend)
| Layer | Tool |
|-------|------|
| Database | Supabase PostgreSQL + RLS |
| Storage | Supabase Storage (`post-images` bucket) |
| API | Next.js Route Handlers (`app/api/blog/`) |
| Auth | Existing `requireAuth` / `getUser` from `lib/auth.ts` |
| Data fetching | TanStack React Query v5 |
| Rich text editor | TipTap (`@tiptap/react` + `@tiptap/starter-kit`) |
| Styling | Tailwind CSS v4 |

---

## Database Schema

### 1. `follows` — Twitter-style follow (asymmetric)
```sql
create table follows (
  id uuid default gen_random_uuid() primary key,
  follower_id uuid references profiles(id) on delete cascade not null,
  following_id uuid references profiles(id) on delete cascade not null,
  created_at timestamptz default now(),
  unique(follower_id, following_id),
  check (follower_id <> following_id)
);

alter table follows enable row level security;

-- Anyone logged in can see follows (needed to check if you follow someone)
create policy "Follows are viewable by authenticated users" on follows
  for select to authenticated using (true);

create policy "Users can follow others" on follows
  for insert to authenticated with check (auth.uid() = follower_id);

create policy "Users can unfollow" on follows
  for delete to authenticated using (auth.uid() = follower_id);

create index idx_follows_follower on follows(follower_id);
create index idx_follows_following on follows(following_id);
```

### 2. `posts`
```sql
create table posts (
  id uuid default gen_random_uuid() primary key,
  author_id uuid references profiles(id) on delete cascade not null,
  title text not null,
  content text not null,           -- TipTap HTML output
  cover_image_url text,            -- Supabase Storage public URL
  slug text unique not null,       -- generated from title + timestamp
  published boolean default true,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table posts enable row level security;

-- Visible to: the author OR users who follow the author
create policy "Posts visible to followers and author" on posts
  for select to authenticated using (
    auth.uid() = author_id
    or exists (
      select 1 from follows
      where follower_id = auth.uid()
      and following_id = author_id
    )
  );

create policy "Users can create posts" on posts
  for insert to authenticated with check (auth.uid() = author_id);

create policy "Authors can update their posts" on posts
  for update to authenticated using (auth.uid() = author_id);

create policy "Authors and admins can delete posts" on posts
  for delete to authenticated using (
    auth.uid() = author_id
    or exists (
      select 1 from profiles where id = auth.uid() and role = 'admin'
    )
  );

create index idx_posts_author on posts(author_id);
create index idx_posts_created_at on posts(created_at desc);
```

### 3. `comments`
```sql
create table comments (
  id uuid default gen_random_uuid() primary key,
  post_id uuid references posts(id) on delete cascade not null,
  author_id uuid references profiles(id) on delete cascade not null,
  content text not null,
  created_at timestamptz default now()
);

alter table comments enable row level security;

-- Only users who can see the post can see its comments
create policy "Comments visible to post viewers" on comments
  for select to authenticated using (
    exists (
      select 1 from posts
      where posts.id = post_id
      and (
        posts.author_id = auth.uid()
        or exists (
          select 1 from follows
          where follower_id = auth.uid()
          and following_id = posts.author_id
        )
      )
    )
  );

create policy "Users can comment on visible posts" on comments
  for insert to authenticated with check (auth.uid() = author_id);

create policy "Authors and admins can delete comments" on comments
  for delete to authenticated using (
    auth.uid() = author_id
    or exists (
      select 1 from profiles where id = auth.uid() and role = 'admin'
    )
  );

create index idx_comments_post on comments(post_id);
```

### 4. `likes`
```sql
create table likes (
  id uuid default gen_random_uuid() primary key,
  post_id uuid references posts(id) on delete cascade not null,
  user_id uuid references profiles(id) on delete cascade not null,
  created_at timestamptz default now(),
  unique(post_id, user_id)
);

alter table likes enable row level security;

create policy "Likes visible to post viewers" on likes
  for select to authenticated using (
    exists (
      select 1 from posts
      where posts.id = post_id
      and (
        posts.author_id = auth.uid()
        or exists (
          select 1 from follows
          where follower_id = auth.uid()
          and following_id = posts.author_id
        )
      )
    )
  );

create policy "Users can like visible posts" on likes
  for insert to authenticated with check (auth.uid() = user_id);

create policy "Users can unlike" on likes
  for delete to authenticated using (auth.uid() = user_id);
```

### 5. View — `posts_with_counts`
```sql
create view posts_with_counts as
  select
    p.*,
    pr.display_name as author_name,
    count(distinct l.id)::int  as like_count,
    count(distinct c.id)::int  as comment_count
  from posts p
  left join profiles pr on pr.id = p.author_id
  left join likes l      on l.post_id = p.id
  left join comments c   on c.post_id = p.id
  group by p.id, pr.display_name;
```

### Supabase Storage
- Bucket name: `post-images`
- Visibility: **public** (images are readable by URL, no auth needed to view)
- Max file size: 5 MB
- Allowed MIME types: `image/jpeg`, `image/png`, `image/webp`, `image/gif`
- RLS: only authenticated users can upload/delete their own files
  ```sql
  -- Storage policy: users upload to their own folder (user_id/filename)
  -- Supabase dashboard > Storage > post-images > Policies
  -- INSERT: bucket_id = 'post-images' and auth.uid()::text = (storage.foldername(name))[1]
  -- DELETE: same
  ```

---

## API Routes

### Follow
| Method | Route | Description | Auth |
|--------|-------|-------------|------|
| GET | `/api/blog/users/[id]/follow` | Check if current user follows this user | Required |
| POST | `/api/blog/users/[id]/follow` | Toggle follow/unfollow | Required |
| GET | `/api/blog/users/[id]/followers` | List followers of a user | Required |
| GET | `/api/blog/users/[id]/following` | List who a user follows | Required |

### Posts
| Method | Route | Description | Auth |
|--------|-------|-------------|------|
| GET | `/api/blog/posts` | Feed — posts from followed users + own (`?page=1&limit=10`) | Required |
| POST | `/api/blog/posts` | Create post | Required |
| GET | `/api/blog/posts/[id]` | Get single post | Required (must be follower) |
| PATCH | `/api/blog/posts/[id]` | Update post | Author only |
| DELETE | `/api/blog/posts/[id]` | Delete post | Author / Admin |

### Comments
| Method | Route | Description | Auth |
|--------|-------|-------------|------|
| GET | `/api/blog/posts/[id]/comments` | Get comments | Required (must be follower) |
| POST | `/api/blog/posts/[id]/comments` | Add comment | Required |
| DELETE | `/api/blog/comments/[id]` | Delete comment | Author / Admin |

### Likes
| Method | Route | Description | Auth |
|--------|-------|-------------|------|
| POST | `/api/blog/posts/[id]/like` | Toggle like | Required |

---

## Frontend Structure

### Pages
```
app/
  blog/
    page.tsx                  ← feed (posts from followed users + own)
    new/
      page.tsx                ← create post (ProtectedRoute)
    [id]/
      page.tsx                ← single post + comments
      edit/
        page.tsx              ← edit post (ProtectedRoute, author only)
  users/
    [id]/
      page.tsx                ← user profile: bio, follow button, their posts
```

### Components
```
components/
  blog/
    PostCard.tsx              ← preview card (title, author, date, counts)
    PostList.tsx              ← feed grid of PostCards
    PostForm.tsx              ← create/edit form (title + TipTap + image)
    TipTapEditor.tsx          ← rich text editor with toolbar
    ImageUpload.tsx           ← upload to Supabase Storage
    PostDetail.tsx            ← render TipTap HTML output safely
    LikeButton.tsx            ← toggle like with optimistic update
    ShareButton.tsx           ← copy post URL to clipboard
    CommentSection.tsx        ← comment list + add comment form
    CommentItem.tsx           ← single comment
    FollowButton.tsx          ← follow/unfollow toggle
    UserCard.tsx              ← small user preview (avatar, name, follow button)
```

### Hooks
```
hooks/
  usePosts.ts                 ← feed (posts from followed users)
  usePost.ts                  ← single post by id
  useCreatePost.ts            ← create post mutation
  useUpdatePost.ts            ← update post mutation
  useDeletePost.ts            ← delete post mutation
  useComments.ts              ← comments for a post
  useAddComment.ts            ← add comment mutation
  useDeleteComment.ts         ← delete comment mutation
  useLike.ts                  ← toggle like (optimistic update)
  useFollow.ts                ← toggle follow/unfollow (optimistic update)
  useFollowers.ts             ← list of followers for a user
  useFollowing.ts             ← list of following for a user
  useUserPosts.ts             ← posts by a specific user (for profile page)
```

---

## Implementation Steps

### Phase 1 — Database (Supabase Dashboard)
- [ ] 1.1 Create `follows` table + RLS policies
- [ ] 1.2 Create `posts` table + RLS policies
- [ ] 1.3 Create `comments` table + RLS policies
- [ ] 1.4 Create `likes` table + RLS policies
- [ ] 1.5 Create `posts_with_counts` view
- [ ] 1.6 Create `post-images` storage bucket (public, 5 MB limit)
- [ ] 1.7 Add storage RLS policies (authenticated upload to own folder)

### Phase 2 — Install TipTap
- [ ] 2.1 `npm install @tiptap/react @tiptap/pm @tiptap/starter-kit @tiptap/extension-image @tiptap/extension-link`

### Phase 3 — API Routes
- [ ] 3.1 `app/api/blog/users/[id]/follow/route.ts` — GET check + POST toggle
- [ ] 3.2 `app/api/blog/users/[id]/followers/route.ts` — GET list
- [ ] 3.3 `app/api/blog/users/[id]/following/route.ts` — GET list
- [ ] 3.4 `app/api/blog/posts/route.ts` — GET feed + POST create
- [ ] 3.5 `app/api/blog/posts/[id]/route.ts` — GET + PATCH + DELETE
- [ ] 3.6 `app/api/blog/posts/[id]/comments/route.ts` — GET + POST
- [ ] 3.7 `app/api/blog/comments/[id]/route.ts` — DELETE
- [ ] 3.8 `app/api/blog/posts/[id]/like/route.ts` — POST toggle

### Phase 4 — Hooks
- [ ] 4.1 `useFollow`, `useFollowers`, `useFollowing`
- [ ] 4.2 `usePosts` (feed), `usePost`, `useUserPosts`
- [ ] 4.3 `useCreatePost`, `useUpdatePost`, `useDeletePost`
- [ ] 4.4 `useComments`, `useAddComment`, `useDeleteComment`
- [ ] 4.5 `useLike` (optimistic update)

### Phase 5 — Components
- [ ] 5.1 `TipTapEditor.tsx` — toolbar: bold, italic, headings, lists, link
- [ ] 5.2 `ImageUpload.tsx` — upload to Supabase bucket, return public URL
- [ ] 5.3 `PostForm.tsx` — title + TipTap + image upload
- [ ] 5.4 `PostDetail.tsx` — render HTML safely with `dangerouslySetInnerHTML`
- [ ] 5.5 `LikeButton.tsx` — optimistic toggle
- [ ] 5.6 `ShareButton.tsx` — copy URL + "Copied!" toast
- [ ] 5.7 `CommentItem.tsx` + `CommentSection.tsx`
- [ ] 5.8 `PostCard.tsx` + `PostList.tsx`
- [ ] 5.9 `FollowButton.tsx` — optimistic toggle
- [ ] 5.10 `UserCard.tsx` — name + follow button

### Phase 6 — Pages
- [ ] 6.1 `app/blog/page.tsx` — feed (requires auth)
- [ ] 6.2 `app/blog/new/page.tsx` — create post (ProtectedRoute)
- [ ] 6.3 `app/blog/[id]/page.tsx` — single post view
- [ ] 6.4 `app/blog/[id]/edit/page.tsx` — edit post (ProtectedRoute)
- [ ] 6.5 `app/users/[id]/page.tsx` — user profile + follow button + their posts

### Phase 7 — Navigation
- [ ] 7.1 Add "Blog" link to `components/Navbar.tsx`

---

## Tests (`tests/blog/`)

### Follow API
- [ ] GET follow status returns `{ following: false }` when not following
- [ ] POST follow toggles to `{ following: true }`
- [ ] POST follow again toggles back to `{ following: false }` (unfollow)
- [ ] Cannot follow yourself (returns 400)
- [ ] POST follow without auth returns 401
- [ ] GET followers list returns correct users
- [ ] GET following list returns correct users

### Posts API
- [ ] GET feed without auth returns 401
- [ ] GET feed returns only posts from followed users + own posts
- [ ] POST create without auth returns 401
- [ ] POST create with missing title returns 400
- [ ] POST create with valid data returns 201 + post object
- [ ] GET single post by non-follower returns 403
- [ ] GET single post by follower returns post with counts
- [ ] PATCH by non-author returns 403
- [ ] PATCH by author updates post
- [ ] DELETE by author deletes post
- [ ] DELETE by admin deletes any post

### Comments API
- [ ] GET comments without auth returns 401
- [ ] POST comment without auth returns 401
- [ ] POST comment with empty content returns 400
- [ ] POST comment creates and returns comment
- [ ] DELETE comment by non-author returns 403
- [ ] DELETE comment by author succeeds

### Likes API
- [ ] POST like without auth returns 401
- [ ] POST like returns `{ liked: true, like_count: N }`
- [ ] POST like again returns `{ liked: false, like_count: N-1 }` (toggle)

### Component Tests
- [ ] `FollowButton` shows "Follow" when not following, "Following" when following
- [ ] `FollowButton` triggers optimistic update on click
- [ ] `LikeButton` shows filled/empty icon based on liked state
- [ ] `LikeButton` optimistically updates count
- [ ] `ShareButton` copies URL and shows "Copied!" feedback
- [ ] `PostForm` disables submit when title or content is empty
- [ ] `CommentSection` shows "Login to comment" when unauthenticated
- [ ] `PostCard` renders title, author, date, like count, comment count
- [ ] `PostList` shows empty state when no posts / not following anyone

---

## Key Logic Notes

### Feed Query (posts route GET)
```sql
-- Return posts where author is followed by current user OR is the current user
select * from posts_with_counts
where author_id = $current_user_id
   or author_id in (
     select following_id from follows where follower_id = $current_user_id
   )
order by created_at desc
limit $limit offset $offset;
```

### Slug Generation
```ts
function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    + "-" + Date.now();
}
// "My First Post" → "my-first-post-1712345678901"
```

### Image Upload Flow
1. User picks image in `ImageUpload.tsx`
2. Client uploads via `supabase.storage.from("post-images").upload(`${userId}/${filename}`, file)`
3. Client gets public URL via `.getPublicUrl(path)`
4. URL stored in `posts.cover_image_url`
> No server route needed — Supabase JS client handles it directly from the browser.

### Optimistic Like Update
```ts
// In useLike — instantly flip the UI, revert on error
onMutate: async ({ postId }) => {
  await queryClient.cancelQueries({ queryKey: ["post", postId] });
  const prev = queryClient.getQueryData(["post", postId]);
  queryClient.setQueryData(["post", postId], (old) => ({
    ...old,
    liked: !old.liked,
    like_count: old.liked ? old.like_count - 1 : old.like_count + 1,
  }));
  return { prev };
},
onError: (_, { postId }, ctx) => {
  queryClient.setQueryData(["post", postId], ctx?.prev);
},
```

### Optimistic Follow Update (same pattern)
```ts
// In useFollow — same optimistic pattern as useLike
```

---

## Key Decisions
| Decision | Choice | Reason |
|----------|--------|--------|
| Follow model | Asymmetric (Twitter-style) | Simpler, no friend request flow |
| Post visibility | Followers + author only | Privacy by follow |
| Rich text | TipTap HTML output | Easy to render, widely supported |
| Image storage | Supabase bucket (public) | Free, same platform |
| Like/follow toggle | Single POST endpoint each | Simpler than separate POST/DELETE |
| Slug uniqueness | title + `Date.now()` suffix | No extra DB round-trip |
| Share | Copy URL to clipboard | No external API |
| Auth pattern | Reuse existing `requireAuth` | Consistent with codebase |
