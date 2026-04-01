# Plan: Admin Posts Management

**Feature:** Màn quản lý bài viết trong Admin Dashboard  
**Route:** `/admin/posts`  
**Branch:** `feat/change_design` (current)

---

## Mục tiêu

Tạo trang quản lý bài viết kiểu diễn đàn cho admin:
- Hiển thị toàn bộ bài viết của mọi user dưới dạng danh sách card
- Mỗi card chứa đầy đủ thông tin: tác giả, tiêu đề, level, tags, visibility, stats
- Admin đổi visibility bài viết bất kỳ (private → share → public và ngược lại)
- Admin xóa bài viết của bất kỳ user nào
- Admin thêm bài viết (link đến `/blog/new`)
- Admin chỉ được sửa bài viết **do chính mình tạo** (link đến `/blog/[id]/edit`)

---

## Tech Stack Context

- Next.js 16 App Router, React 19, TypeScript
- Tailwind CSS 4 + Lucide React icons
- React Query (TanStack v5) cho data fetching
- Supabase PostgreSQL, view `posts_with_counts`
- Pattern: `hooks/admin/useAdminXxx.ts` → `app/admin/xxx/page.tsx`
- Auth: `adminFetch()` từ `lib/admin-fetch.ts` tự động gắn Bearer token

---

## Steps

### Step 1 — API: GET /api/admin/posts

**File:** `app/api/admin/posts/route.ts`

Endpoint trả về danh sách **tất cả** bài viết (không giới hạn theo author) với pagination & filter.

```
GET /api/admin/posts
  ?page=1
  &limit=20
  &search=   (search title)
  &visibility=  (private | share | public | all)
  &level=       (A1 | A2 | B1 | B2 | C1 | C2 | all)
  &category=    (blog | baohay | all)
  &sort=        (newest | oldest | most_liked)
```

Query từ view `posts_with_counts` JOIN `profiles`:
```sql
SELECT
  p.id, p.title, p.slug, p.author_id,
  pr.display_name AS author_name, pr.role AS author_role,
  p.visibility, p.category, p.level, p.tags,
  p.reading_time, p.word_count, p.cover_image_url,
  p.created_at, p.updated_at,
  p.like_count, p.comment_count
FROM posts_with_counts p
JOIN profiles pr ON pr.id = p.author_id
WHERE [filters]
ORDER BY [sort]
LIMIT [limit] OFFSET [offset]
```

Response:
```json
{
  "data": [...],
  "total": 123,
  "page": 1,
  "totalPages": 7
}
```

Yêu cầu: Bearer token + profile.role === 'admin' (dùng `requireAdmin()` từ `lib/auth.ts`)

---

### Step 2 — API: PATCH /api/admin/posts/[id]/visibility

**File:** `app/api/admin/posts/[id]/visibility/route.ts`

Cho phép admin đổi visibility của bất kỳ bài nào.

```
PATCH /api/admin/posts/:id/visibility
Body: { "visibility": "public" | "share" | "private" }
```

Logic:
1. `requireAdmin()` - kiểm tra quyền
2. Validate visibility value
3. `UPDATE posts SET visibility = $1, updated_at = now() WHERE id = $2`
4. Return updated post

---

### Step 3 — Hook: useAdminPosts

**File:** `hooks/admin/useAdminPosts.ts`

```typescript
// Queries
useAdminPosts(params)       // GET /api/admin/posts với filters & pagination
useAdminPostsStats()        // counts by visibility (optional, dùng cho header stats)

// Mutations
useAdminChangeVisibility()  // PATCH /api/admin/posts/[id]/visibility
useAdminDeletePost()        // DELETE /api/blog/posts/[id] (endpoint đã có, admin có quyền)
```

Pattern giống `hooks/admin/useAdminUsers.ts`:
- Dùng `adminFetch()` cho mọi request
- `invalidateQueries(['admin-posts'])` sau mutations

---

### Step 4 — Admin Posts Page

**File:** `app/admin/posts/page.tsx`

#### 4a. Header

```
[📝 Posts]                            [+ New Post →]
  123 total  |  45 public  |  67 private  |  11 share
```

- Title + stats summary row
- "New Post" button → `href="/blog/new"` (existing)

#### 4b. Toolbar (Filters)

```
[ 🔍 Search title... ]  [Visibility ▼]  [Level ▼]  [Category ▼]  [Sort ▼]
```

Filters:
- **Search**: input text, debounce 300ms
- **Visibility**: All / 🌍 Public / 🔗 Share / 🔒 Private
- **Level**: All / A1 / A2 / B1 / B2 / C1 / C2
- **Category**: All / Blog / Baohay
- **Sort**: Newest / Oldest / Most Liked

#### 4c. Post List (Forum-style rows)

Mỗi bài viết = 1 card row có cấu trúc:

```
┌─────────────────────────────────────────────────────────────────┐
│ [thumbnail] │ [main content]                    │ [status+actions]│
│  64x64px   │                                   │                  │
│  cover img │  📖 TITLE (bold, large)  [CATEGORY]│  [Visibility    │
│  hoặc      │  👤 Author Name  •  📅 12 Mar 2025 │   badge+toggle] │
│  gradient  │  ┌─────────────────────────────┐  │                  │
│  placeholder│  │ 🎯 B2 │ #grammar │ #reading │  │  [👁 View]      │
│            │  └─────────────────────────────┘  │  [✏️ Edit*]     │
│            │  ⏱ 5 min  📝 1,200 words  ❤️ 12  💬 3  │  [🗑 Delete]    │
└─────────────────────────────────────────────────────────────────┘
```

Chi tiết từng phần:

**Thumbnail (trái, 64×64):**
- Nếu có `cover_image_url`: `<img>` với `object-cover rounded-lg`
- Nếu không: gradient placeholder dựa theo category/level (màu khác nhau cho A1/A2/B1...)
- Hiển thị category icon lớn (📖 hoặc 📰) ở giữa placeholder

**Main content (giữa):**
- **Row 1:** Title (font-semibold text-base) + category badge (Blog / Báo Hay)
- **Row 2:** Avatar initials circle + author display_name + dot + date relative ("2 days ago")
- **Row 3:** Level badge có màu theo CEFR (A1=xanh lá, A2=xanh lá đậm, B1=vàng, B2=cam, C1=đỏ cam, C2=đỏ đậm) + tags (hiển thị tối đa 3, còn lại "+N more")
- **Row 4:** Stats icons — ⏱ reading_time min | 📝 word_count words | ❤️ like_count | 💬 comment_count

**Status + Actions (phải):**
- **Visibility badge** với dropdown toggle:
  - 🌍 Public (green badge)
  - 🔗 Share (blue badge)  
  - 🔒 Private (gray badge)
  - Click badge → dropdown chọn visibility khác → gọi mutation
- **Action buttons:**
  - `👁 View` → `href="/blog/[slug]"` (opens in new tab)
  - `✏️ Edit` → `href="/blog/[id]/edit"` — **CHỈ HIỆN nếu** `post.author_id === adminProfile.id`
  - `🗑 Delete` → confirm dialog → xóa bài

#### 4d. Pagination

```
← Prev   [1] [2] [3] ... [12]   Next →
         Showing 1-20 of 123 posts
```

- Hiển thị max 5 page buttons
- Dùng cùng pattern với `/admin/users`

#### 4e. Empty & Loading states

- Loading: skeleton rows (3-5 rows với shimmer effect)
- Empty (no results): illustration + "No posts found" message
- Empty after filter: "No posts match your filters" + "Clear filters" button

---

### Step 5 — Sidebar Nav

**File:** `app/admin/layout.tsx`

Thêm nav item vào `navItems` array:

```typescript
{ href: "/admin/posts", label: "Posts", icon: "📝" }
```

Đặt sau "Users" (thứ 3 trong danh sách).

---

## File Summary

| File | Action | Notes |
|------|--------|-------|
| `app/api/admin/posts/route.ts` | CREATE | GET all posts with filters |
| `app/api/admin/posts/[id]/visibility/route.ts` | CREATE | PATCH visibility |
| `hooks/admin/useAdminPosts.ts` | CREATE | React Query hooks |
| `app/admin/posts/page.tsx` | CREATE | Main UI page |
| `app/admin/layout.tsx` | EDIT | Add Posts nav item |

**Không cần** tạo component riêng ban đầu — viết inline trong page.tsx, tách component sau nếu cần.

---

## Visibility Logic

| State | Icon | Badge color | Ai thấy bài? |
|-------|------|-------------|--------------|
| `private` | 🔒 | gray | Chỉ tác giả |
| `share` | 🔗 | blue | Người có link trực tiếp |
| `public` | 🌍 | green | Tất cả mọi người |

Cycle nhanh: Private → Share → Public → Private (click badge để cycle)  
Hoặc dropdown để chọn chính xác.

---

## Level Color Mapping

```typescript
const LEVEL_COLORS = {
  A1: "bg-emerald-100 text-emerald-700",
  A2: "bg-green-100 text-green-700",
  B1: "bg-yellow-100 text-yellow-700",
  B2: "bg-orange-100 text-orange-700",
  C1: "bg-red-100 text-red-700",
  C2: "bg-rose-100 text-rose-800",
};
```

---

## Edit Permission Rule

```typescript
const canEdit = post.author_id === profile?.id; // chỉ bài của chính admin
```

Admin CÓ THỂ: xem, đổi visibility, xóa bất kỳ bài nào.  
Admin CHỈ ĐƯỢC SỬA bài do chính mình tạo.

---

## Notes

- Dùng `lib/admin-fetch.ts` → `adminFetch()` cho mọi API call trong hooks
- Endpoint DELETE đã có tại `DELETE /api/blog/posts/[id]` với quyền admin — **tái sử dụng, không tạo mới**
- `posts_with_counts` view đã join like/comment count — dùng thẳng
- Không cần thêm migration database (không có field mới)
- i18n: không cần dịch cho admin pages (giữ tiếng Anh)
