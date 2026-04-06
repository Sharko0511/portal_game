# Step 2 — Frontend

> Thuộc plan: [main.md](main.md)

---

## 2.1 Hooks

### `hooks/blog/useUserSearch.ts` *(mới)*

```ts
// Debounced 300ms, chỉ gọi khi query >= 2 ký tự
export function useUserSearch(query: string): {
  results: { id: string; display_name: string }[];
  isLoading: boolean;
}
```

- Dùng `useQuery` với `queryKey: ['user-search', debouncedQuery]`
- Gọi `adminFetch('/api/blog/users/search?q={query}&limit=10')`
- `enabled: debouncedQuery.length >= 2`
- Debounce bằng `useState` + `useEffect` với timeout 300ms

---

### `hooks/blog/useHighlightPosts.ts` *(mới)*

```ts
export function useHighlightPosts(): {
  popular: HighlightPost[];
  recent: HighlightPost[];
  isLoading: boolean;
}

interface HighlightPost {
  id: string;
  title: string;
  cover_image_url: string | null;
  like_count: number;
  comment_count: number;
  author_name: string;
  author_id: string;
  created_at: string;
}
```

- Dùng `useQuery` với `queryKey: ['highlight-posts']`
- `staleTime: 5 * 60 * 1000` (5 phút — dữ liệu không cần real-time)
- Gọi `fetch('/api/blog/posts/highlights')` (không cần auth)

---

## 2.2 Components mới

Tất cả đặt trong thư mục `components/blog/feed/`

---

### `UserSearchPanel.tsx`

**Chức năng:** Ô tìm kiếm user + dropdown kết quả có nút Follow

**Props:** không có (tự quản lý state nội bộ)

**UI:**
```
┌────────────────────────────────┐
│ 🔍  Search people...           │
└────────────────────────────────┘
     ↓ (khi đang gõ)
┌────────────────────────────────┐
│  Alice                  [+Follow] │
│  Alice Nguyen           [Following]│
└────────────────────────────────┘
```

**Behavior:**
- Input gõ → debounce 300ms → gọi `useUserSearch`
- Hiện spinner khi loading
- Mỗi kết quả dùng component `FollowButton` có sẵn tại `components/blog/FollowButton.tsx`
- Click ngoài → đóng dropdown (dùng `useRef` + `useEffect` để detect outside click)
- Khi query rỗng → không show dropdown

---

### `FeedSidebarUserList.tsx`

**Chức năng:** Hiển thị danh sách Following hoặc Followers

**Props:**
```ts
interface Props {
  title: string;           // "Following" | "Followers"
  users: FollowProfile[];  // { id, display_name }
  loading: boolean;
  currentUserId: string;
}
```

**UI:**
```
Following (3)
  ┌─────────────────────────┐
  │ [A] Alice          [✓] │
  │ [B] Bob            [✓] │
  │ [C] Carol          [✓] │
  │         Show more       │
  └─────────────────────────┘
```

**Behavior:**
- Avatar: chữ cái đầu của `display_name`, background màu ngẫu nhiên nhưng ổn định (hash từ id)
- Hiện tối đa 5 user, có nút "Show more / Show less" toggle
- Click vào tên user → navigate tới `/[lng]/users/[id]`
- Mỗi user có `FollowButton` (follow / unfollow ngay từ sidebar)
- Loading state: 3 skeleton rows

---

### `FeedLeftSidebar.tsx`

**Chức năng:** Ghép `UserSearchPanel` + 2 `FeedSidebarUserList`

**Props:** không có (lấy data từ hooks nội bộ)

**Data flow:**
```
useAuth() → currentUserId
useFollowing(currentUserId) → following list
useFollowers(currentUserId) → followers list
```

**Layout:**
```
components/
  UserSearchPanel        ← search + follow
  ─────────────────
  FeedSidebarUserList    ← Following
  ─────────────────
  FeedSidebarUserList    ← Followers
```

**Sticky:** `sticky top-20 max-h-[calc(100vh-5rem)] overflow-y-auto`

---

### `FeedRightSidebar.tsx`

**Chức năng:** Hiển thị popular và recent public posts

**Props:** không có

**UI:**
```
🔥 Most Popular
  ┌──────────────────────────────┐
  │ [img] Post title here...  42♥ │
  │ [img] Another post title  18♥ │
  └──────────────────────────────┘

🆕 Most Recent
  ┌──────────────────────────────┐
  │ [img] Recent post one     2♥  │
  │ [img] Recent post two     0♥  │
  └──────────────────────────────┘
```

**Behavior:**
- Mỗi post: thumbnail 40×40 (rounded) + title 2 dòng clamp + like count
- Click → navigate `/blog/[id]`
- Loading state: skeleton rows
- Dùng `useHighlightPosts()`

**Sticky:** giống left sidebar

---

## 2.3 Sửa `components/blog/PostList.tsx`

Thêm prop `singleColumn?: boolean` (default `false` để không break existing usage).

Khi `singleColumn = true`: không dùng `grid-cols-2` cho compact posts — stack thành 1 cột.

```tsx
// Trước (hiện tại):
<div className="grid grid-cols-1 gap-4 sm:grid-cols-2">

// Sau (khi singleColumn = true):
<div className={cn("grid grid-cols-1 gap-4", !singleColumn && "sm:grid-cols-2")}>
```

---

## 2.4 Sửa `app/[lng]/blog/page.tsx`

Thay layout hiện tại thành 3 cột:

```tsx
// Trước:
<div className="mx-auto max-w-6xl px-6 py-8">
  {/* breadcrumb + header */}
  <PostList ... />
</div>

// Sau:
<div className="mx-auto max-w-7xl px-4 py-8">
  {/* breadcrumb + header "Your Feed" + New Post button — vẫn full width */}
  
  <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-[260px_1fr_260px]">
    
    <aside className="hidden lg:block">
      <FeedLeftSidebar />
    </aside>
    
    <main className="min-w-0">
      <PostList
        posts={postsQuery.data ?? []}
        loading={postsQuery.isLoading}
        emptyMessage="No posts yet. Follow people or write your first post!"
        singleColumn
      />
    </main>
    
    <aside className="hidden lg:block">
      <FeedRightSidebar />
    </aside>
    
  </div>
</div>
```

---

## Checklist

- [ ] `hooks/blog/useUserSearch.ts`
- [ ] `hooks/blog/useHighlightPosts.ts`
- [ ] `components/blog/feed/UserSearchPanel.tsx`
- [ ] `components/blog/feed/FeedSidebarUserList.tsx`
- [ ] `components/blog/feed/FeedLeftSidebar.tsx`
- [ ] `components/blog/feed/FeedRightSidebar.tsx`
- [ ] Sửa `components/blog/PostList.tsx` — thêm prop `singleColumn`
- [ ] Sửa `app/[lng]/blog/page.tsx` — layout 3 cột
