# Article Feature — Implementation Plan

## Overview

Extend the blog system into a rich article platform with:
- Dedicated **Báo hay** (good reads) and **Audio chat** pages
- Redesigned **blog detail** page
- New post metadata fields (CEFR level, audio, tags, stats, feedback)
- **Public access** for admin-authored posts (no login required)
- Content body stays as the **block editor** (mixed text + image blocks)

---

## 1. JSON Structure — Blog Post

```jsonc
{
  // ── existing ──────────────────────────────────────────
  "id": "uuid",
  "slug": "the-late-70s-veteran-1746000000000",
  "author_id": "uuid",
  "author_name": "Linh Bui",
  "title": "The late-70s veteran who rides motorbike 1,300 km…",
  "cover_image_url": "https://…",          // header thumbnail
  "content": {                             // block editor (unchanged)
    "type": "blocks",
    "blocks": [
      { "id": "abc", "type": "text",  "content": { "type": "doc", "content": […] } },
      { "id": "def", "type": "image", "url": "https://…", "caption": "…" }
    ]
  },
  "published": true,
  "created_at": "2025-05-02T00:00:00Z",
  "updated_at": "2025-05-02T00:00:00Z",
  "like_count": 0,
  "comment_count": 0,

  // ── new fields ────────────────────────────────────────
  "category": "baohay",                   // "blog" | "baohay" | "audiochat"
  "level": "B1",                          // "A1"|"A2"|"B1"|"B2"|"C1"|"C2" | null
  "audio_url": "https://…",               // nullable — powers the audio player
  "cover_image_caption": "Veteran Tran Van Thanh with his belongings…",
  "reading_time": 10,                     // minutes
  "tags": ["case studies", "localization", "culture"],
  "word_count": 35000,
  "event_encounters": 51,
  "cards_count": 371,
  "feedback_intro": "MercTrans is happy to have received positive feedback…",
  "player_feedback": [                    // jsonb array
    { "content": "From start to finish, I was thrilled…" },
    { "content": "Very close translation, clearly represents the plot…" }
  ]
}
```

---

## 2. Database Migration (`20260317000000_post_article_fields.sql`)

### 2a. New columns on `posts`

| Column | Type | Default | Constraint |
|---|---|---|---|
| `category` | text | `'blog'` | `IN ('blog','baohay','audiochat')` |
| `level` | text | NULL | `IN ('A1','A2','B1','B2','C1','C2')` |
| `audio_url` | text | NULL | — |
| `cover_image_caption` | text | NULL | — |
| `reading_time` | integer | 0 | — |
| `tags` | text[] | `'{}'` | — |
| `word_count` | integer | 0 | — |
| `event_encounters` | integer | 0 | — |
| `cards_count` | integer | 0 | — |
| `feedback_intro` | text | NULL | — |
| `player_feedback` | jsonb | `'[]'` | — |

### 2b. Indexes

```sql
create index idx_posts_category on posts(category);
create index idx_posts_level    on posts(level);
```

### 2c. Rebuild `posts_with_counts` view

Add `author_role` to the view so the API can distinguish admin posts.

```sql
drop view if exists posts_with_counts;
create view posts_with_counts as
  select p.*, pr.display_name as author_name, pr.role as author_role,
         count(distinct l.id)::int as like_count,
         count(distinct c.id)::int as comment_count
  from posts p
  left join profiles pr on pr.id = p.author_id
  left join likes l on l.post_id = p.id
  left join comments c on c.post_id = p.id
  group by p.id, pr.display_name, pr.role;
```

### 2d. RLS — public read for admin posts

```sql
create policy "Admin posts are publicly readable"
  on posts for select to anon
  using (
    exists (select 1 from profiles where id = posts.author_id and role = 'admin')
    and published = true
  );
```

---

## 3. Backend API changes

### 3a. `POST /api/blog/posts` — create
Accept new fields in body: `category`, `level`, `audio_url`, `cover_image_caption`, `reading_time`, `tags`, `word_count`, `event_encounters`, `cards_count`, `feedback_intro`, `player_feedback`.
Persist them to the `posts` insert.

### 3b. `PATCH /api/blog/posts/[id]` — update
Accept the same new fields and include them in the `updates` object.

### 3c. `GET /api/blog/posts/[id]` — single post
**Public access change**: skip `requireAuth` if the post's `author_role === 'admin'` and `published === true`. Otherwise keep existing auth + follow check.

Implementation order:
1. Try to load post (using admin client — bypasses RLS).
2. If `post.author_role === 'admin' && post.published` → return immediately (no auth needed).
3. Else run `requireAuth`; check author or follower as before.

### 3d. `GET /api/blog/posts` — feed
No change for the personal feed.
Add two new **public** routes:

| Route | Auth | Description |
|---|---|---|
| `GET /api/blog/baohay` | none | Published admin posts where `category = 'baohay'`, ordered by `created_at desc` |
| `GET /api/blog/audiochat` | none | Published admin posts where `category = 'audiochat'`, ordered by `created_at desc` |

Both routes return posts grouped by level for the frontend.

---

## 4. Type updates (`hooks/blog/usePost.ts`)

Extend the `Post` interface with all new fields.
Add `author_role` field.
Add hooks `useBaohay()` and `useAudiochat()` that call the new public routes.

---

## 5. PostForm changes (`components/blog/PostForm.tsx`)

Admin-only fields (shown only when `profile.role === 'admin'`):

| Field | UI Control |
|---|---|
| `category` | Select: Blog / Báo hay / Audio chat |
| `level` | Select: A1–C2 or blank |
| `audio_url` | Text input |
| `cover_image_caption` | Text input (below existing cover image upload) |
| `reading_time` | Number input (minutes) |
| `tags` | Tag input (comma-separated chips) |
| `word_count` | Number input |
| `event_encounters` | Number input |
| `cards_count` | Number input |
| `feedback_intro` | Textarea |
| `player_feedback` | Dynamic list — add/remove quote cards |

Regular users only see: title, cover image, content blocks, published toggle.

---

## 6. Blog detail page redesign (`app/[lng]/blog/[id]/page.tsx`)

Layout (matches design):

```
[Breadcrumb] Trang chủ > Báo hay

[Title]          ← large
[Date]

[Audio player]   ← visible only if audio_url is set
                   "Limiting your screentime? Listen instead."

[Cover image]    ← with caption below

[Level badge]    ← e.g. "B1 - Intermediate" (orange pill)

[Body content]   ← BlocksRenderer (text + image blocks)

[Stats row]      ← word_count | event_encounters | cards_count
                   (only if any stat > 0)

[Player Feedback] ← only if player_feedback.length > 0
  feedback_intro paragraph
  quote cards

[Tags]           ← tag pills

[Author block]   ← avatar + name + bio + FollowButton

[Spread the words] ← share icons (copy link, LinkedIn, Facebook)

Right sidebar (desktop only):
  "Bài viết phổ biến" ← 3 latest posts from same category
```

**Auth change**: remove `<ProtectedRoute>` wrapper. The page fetches the post;
if the API returns 403, show a "login to continue" prompt instead of redirecting.

---

## 7. Báo hay page (`app/[lng]/baohay/page.tsx`)

- No auth required
- Fetches from `GET /api/blog/baohay`
- Hero section: top 2 posts (first is "featured" with star + dark bg, second with image right)
- Below hero: posts grouped by level (B1, B2, C1, …)
  - Each group header: "B1 - Intermediate" + "more on this topic ↗" link
  - Posts in group: row with thumbnail | read time + date | title (divider between)

---

## 8. Audio chat page (`app/[lng]/audiochat/page.tsx`)

- No auth required
- Fetches from `GET /api/blog/audiochat`
- Hero: dark background with headphone/audio image + tagline "Cải thiện khả năng nghe qua audio."
- Below hero: same grouped-by-level layout as Báo hay

---

## 9. Test cases

### 9a. Migration / DB
| # | Test | Expected |
|---|---|---|
| 1 | Existing posts after migration | `category='blog'`, all new columns have defaults, `published` unchanged |
| 2 | Insert post with `category='baohay'`, `level='B1'` | Row saved, readable via view |
| 3 | `anon` select on admin post (`published=true`) | Returns row |
| 4 | `anon` select on user post | Returns nothing (RLS blocks) |
| 5 | `anon` select on admin post (`published=false`) | Returns nothing |

### 9b. API — POST /api/blog/posts
| # | Test | Expected |
|---|---|---|
| 1 | Admin creates post with all new fields | 201, all fields stored |
| 2 | User creates post with `category='baohay'` | 201 (users can set category) |
| 3 | Create with invalid `level='X9'` | 400 validation error |
| 4 | Create with `player_feedback` not an array | 400 |

### 9c. API — GET /api/blog/posts/[id]
| # | Test | Expected |
|---|---|---|
| 1 | No auth header + admin post published | 200 with post |
| 2 | No auth header + admin post draft | 401 |
| 3 | No auth header + user post | 401 |
| 4 | Auth + not following user post author | 403 |
| 5 | Auth + following user post author | 200 |

### 9d. API — GET /api/blog/baohay and /api/blog/audiochat
| # | Test | Expected |
|---|---|---|
| 1 | No auth | 200, returns published admin posts for that category |
| 2 | Posts from non-admin authors in `category='baohay'` | NOT returned |
| 3 | Admin draft post | NOT returned |

### 9e. PostForm (admin)
| # | Test | Expected |
|---|---|---|
| 1 | Admin sees all new fields | ✓ |
| 2 | Regular user does not see admin fields | ✓ |
| 3 | Submit with tags as chips | Tags array sent correctly |
| 4 | Add/remove player_feedback entries | Dynamic list works |

### 9f. Blog detail page
| # | Test | Expected |
|---|---|---|
| 1 | Open admin post URL while logged out | Page loads, content visible |
| 2 | Open user post URL while logged out | Shows "login to continue" |
| 3 | Audio player shown when `audio_url` set | ✓ |
| 4 | Stats row hidden when all stats are 0 | ✓ |
| 5 | Feedback section hidden when `player_feedback` is empty | ✓ |
| 6 | Popular posts sidebar shows 3 posts from same category | ✓ |

### 9g. Báo hay / AudioChat pages
| # | Test | Expected |
|---|---|---|
| 1 | Page loads without login | 200 |
| 2 | Hero shows top 2 posts | ✓ |
| 3 | Posts grouped by level, sorted by created_at desc | ✓ |
| 4 | "more on this topic ↗" links to filtered level page | ✓ (future) |
| 5 | No posts in a level → that level group hidden | ✓ |

---

## Implementation order

1. `supabase/migrations/20260317000000_post_article_fields.sql`
2. `app/api/blog/posts/route.ts` (POST body)
3. `app/api/blog/posts/[id]/route.ts` (GET public + PATCH body)
4. `app/api/blog/baohay/route.ts` (new public route)
5. `app/api/blog/audiochat/route.ts` (new public route)
6. `hooks/blog/usePost.ts` (Post type + new hooks)
7. `components/blog/PostForm.tsx` (new fields)
8. `app/[lng]/blog/[id]/page.tsx` (redesign)
9. `app/[lng]/baohay/page.tsx` (new)
10. `app/[lng]/audiochat/page.tsx` (new)
