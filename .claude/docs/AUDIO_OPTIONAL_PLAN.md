# Plan: Audio as Optional Field on Blog

## Goal

Remove the `audiochat` category. Audio is now just an optional `audio_url` field on any post
(including `blog` and `baohay`). The `/audiochat` page becomes a filtered view of posts that
have audio attached, regardless of category.

---

## Current State

- `category` enum: `'blog' | 'baohay' | 'audiochat'`
- Separate API route `/api/blog/audiochat` — returns only `category = 'audiochat'`
- `audio_url` field exists on all posts but is only used when `category = 'audiochat'`
- PostForm admin section shows audio URL input only for audiochat category
- `/audiochat` page fetches from dedicated endpoint

---

## Target State

- `category` enum: `'blog' | 'baohay'` (audiochat removed)
- `audio_url` is a standalone optional field — any blog or baohay post can have it
- `/api/blog/audiochat` returns posts where `audio_url IS NOT NULL` (any category)
- `/audiochat` page remains but shows audio-enabled posts from all categories
- PostForm shows audio URL input for all categories (not gated on audiochat)
- AudioPlayer renders on any post that has `audio_url`, regardless of category

---

## Step-by-Step Implementation

### Step 1 — Database Migration

**File:** `supabase/migrations/20260401000000_audio_optional_on_blog.sql`

```sql
-- 1. Add new enum without 'audiochat'
CREATE TYPE post_category_new AS ENUM ('blog', 'baohay');

-- 2. Migrate existing audiochat posts to 'blog'
UPDATE posts SET category = 'blog' WHERE category = 'audiochat';

-- 3. Swap enum type
ALTER TABLE posts
  ALTER COLUMN category TYPE post_category_new
  USING category::text::post_category_new;

-- 4. Drop old enum and rename new one
DROP TYPE post_category;
ALTER TYPE post_category_new RENAME TO post_category;

-- 5. Rebuild posts_with_counts view (it references category)
--    (copy existing view definition, no structural change needed)
```

**Note:** All existing audiochat posts keep their `audio_url` and become `category = 'blog'`.
Their audio players still render because `audio_url` is still populated.

---

### Step 2 — Update TypeScript Types

**File:** `hooks/blog/usePost.ts`

```diff
- export type PostCategory = "blog" | "baohay" | "audiochat";
+ export type PostCategory = "blog" | "baohay";
```

---

### Step 3 — Update API: `/api/blog/audiochat`

**File:** `app/api/blog/audiochat/route.ts`

Change the query filter from `category = 'audiochat'` to `audio_url IS NOT NULL`:

```diff
- .eq("category", "audiochat")
+ .not("audio_url", "is", null)
```

No route rename needed — the URL stays `/api/blog/audiochat` as a semantic "posts with audio"
endpoint.

---

### Step 4 — Update API: `/api/blog/posts` (create & update)

**File:** `app/api/blog/posts/route.ts`  
**File:** `app/api/blog/posts/[id]/route.ts`

- Remove any validation that rejects `audio_url` on non-audiochat posts
- Remove any logic that auto-sets `category = 'audiochat'` based on `audio_url`
- Accept `audio_url` as a standalone optional field for any category

---

### Step 5 — Update API: `/api/blog/search`

**File:** `app/api/blog/search/route.ts`

```diff
- if (category) query = query.eq("category", category);
+ if (category && category !== "audiochat") query = query.eq("category", category);
+ if (category === "audiochat") query = query.not("audio_url", "is", null);
```

This keeps backwards compatibility if any existing links use `?category=audiochat`.

---

### Step 6 — Update PostForm (Admin Section)

**File:** `components/blog/PostForm.tsx`

- Remove the `audiochat` option from the category dropdown
- Move the audio URL input out of the audiochat-gated block — show it for all categories
- Audio URL field should be visible whenever the user is admin, regardless of category

```diff
- {category === "audiochat" && (
-   <input ... audio_url ... />
- )}
+ <input ... audio_url ... />   {/* always visible to admin */}
```

---

### Step 7 — Update AudioPlayer Render Condition

**File:** `app/[lng]/blog/[id]/page.tsx`

AudioPlayer already renders based on `post.audio_url` — verify no check for
`post.category === 'audiochat'` is gating it. If so, remove that condition.

```diff
- {post.category === "audiochat" && post.audio_url && <AudioPlayer ... />}
+ {post.audio_url && <AudioPlayer ... />}
```

---

### Step 8 — Update `/audiochat` Page

**File:** `app/[lng]/audiochat/page.tsx`

No structural change needed. The page already calls `/api/blog/audiochat` — after Step 3 that
endpoint returns any post with audio. The page title/description can be updated to reflect
it's "posts with audio" rather than a specific category.

---

### Step 9 — Update ArticleListByLevel (if needed)

**File:** `components/blog/ArticleListByLevel.tsx`

If it filters or labels posts by `category === 'audiochat'`, update to use
`audio_url !== null` as the condition instead.

---

### Step 10 — Clean Up Any Remaining References

Search and remove/update:
- Any hardcoded `"audiochat"` string in category comparisons
- Any UI labels/icons that display "Audio Chat" as a category badge
- Translation keys for audiochat category label (`en.json`, `vi.json`)

---

## Test Cases

### Backend / API

| # | Test | Expected |
|---|------|----------|
| B1 | `POST /api/blog/posts` with `category: "blog"` and `audio_url: "https://..."` | 201, post saved with audio_url |
| B2 | `POST /api/blog/posts` with `category: "baohay"` and `audio_url: "https://..."` | 201, post saved with audio_url |
| B3 | `POST /api/blog/posts` with `category: "audiochat"` | 400 or validation error (category no longer valid) |
| B4 | `GET /api/blog/audiochat` | Returns only posts where `audio_url IS NOT NULL`, any category |
| B5 | `GET /api/blog/audiochat` — post with `audio_url: null` | NOT included in response |
| B6 | `GET /api/blog/audiochat` — baohay post with audio | Included in response |
| B7 | `PATCH /api/blog/posts/[id]` adding `audio_url` to existing blog post | Updates successfully |
| B8 | `PATCH /api/blog/posts/[id]` setting `audio_url: null` | Removes audio, post no longer in audiochat feed |
| B9 | `GET /api/blog/search?category=audiochat` | Returns posts with `audio_url IS NOT NULL` |
| B10 | `GET /api/blog/posts/[id]` — blog post with audio | Returns `audio_url` field populated |

### Database

| # | Test | Expected |
|---|------|----------|
| D1 | Migration runs on fresh DB | No errors, `post_category` enum has exactly `blog`, `baohay` |
| D2 | Existing audiochat posts after migration | `category = 'blog'`, `audio_url` preserved |
| D3 | Insert post with `category = 'audiochat'` after migration | Postgres error (invalid enum value) |
| D4 | `posts_with_counts` view still works | Returns all posts with like/comment counts |

### Frontend / Components

| # | Test | Expected |
|---|------|----------|
| F1 | PostForm category dropdown | Shows only `blog` and `baohay`, no `audiochat` |
| F2 | PostForm (admin) for blog category | Audio URL input is visible |
| F3 | PostForm (admin) for baohay category | Audio URL input is visible |
| F4 | Blog post detail page — post with `audio_url` | AudioPlayer renders above cover image |
| F5 | Blog post detail page — post without `audio_url` | AudioPlayer does NOT render |
| F6 | `/audiochat` page | Shows baohay + blog posts that have audio |
| F7 | `/audiochat` page | Does NOT show posts without `audio_url` |
| F8 | Edit existing audiochat post (now blog) | Form loads with category `blog`, audio URL pre-filled |

---

## Migration Risk & Notes

- **Data loss risk: none** — `audio_url` values are preserved; only category label changes
- **Breaking change:** Any client passing `category: "audiochat"` in POST/PATCH will get an error — acceptable since this is an internal app
- **Rollback:** Keep the old migration file; a reverse migration can add `audiochat` back to the enum and re-classify posts where `audio_url IS NOT NULL`
- Run migration on dev DB first, verify posts_with_counts view still works, then apply to prod
