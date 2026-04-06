# Plan: Feed Page Redesign (Facebook-style 3-column layout)

**Feature:** Redesign trang Feed thành layout 3 cột kiểu Facebook  
**Route:** `/[lng]/blog`  
**Branch:** `feat/change_design`

---

## Mục tiêu

Biến trang Feed hiện tại (1 cột đơn giản) thành layout 3 cột:

- **Left sidebar:** Danh sách Following + Followers + ô search user để follow
- **Center:** Luồng bài viết chính (1 cột, giữ nguyên logic)
- **Right sidebar:** Highlight posts — Most Popular & Most Recent (public posts)

---

## Layout tổng thể

```
┌──────────────────────────────────────────────────────────────┐
│  Left 260px         │   Center flex        │  Right 260px    │
│  ─────────────────  │  ─────────────────   │  ────────────   │
│  🔍 Search user...  │  Your Feed      [+]  │  🔥 Popular     │
│  ─────────────────  │  ─────────────────   │   • Post A      │
│  Following (3)      │  [PostCard]          │   • Post B      │
│   • Alice      [✓]  │  [PostCard]          │  ────────────   │
│   • Bob        [✓]  │  [PostCard]          │  🆕 Recent      │
│  ─────────────────  │  ...                 │   • Post C      │
│  Followers (5)      │                      │   • Post D      │
│   • Carol      [+]  │                      │                  │
└──────────────────────────────────────────────────────────────┘
Mobile (< lg): sidebars ẩn, chỉ hiện center
```

---

## Các bước thực hiện

### Step 1 — Backend
> Chi tiết: [step1-backend.md](step1-backend.md)

Tạo 2 API mới:
- `GET /api/blog/users/search?q=` — tìm kiếm user để follow
- `GET /api/blog/posts/highlights` — popular posts + recent posts cho right sidebar

### Step 2 — Frontend
> Chi tiết: [step2-frontend.md](step2-frontend.md)

- 2 hooks mới: `useUserSearch`, `useHighlightPosts`
- 4 components mới trong `components/blog/feed/`
- Sửa nhỏ `PostList` (thêm prop `singleColumn`)
- Sửa layout `app/[lng]/blog/page.tsx`

### Step 3 — Test & QA
> Chi tiết: [step3-test.md](step3-test.md)

- Test API thủ công
- Test layout các breakpoint
- Test các flow: search user, follow/unfollow, highlight posts

---

## Files sẽ thay đổi

| File | Hành động |
|------|-----------|
| `app/api/blog/users/search/route.ts` | Tạo mới |
| `app/api/blog/posts/highlights/route.ts` | Tạo mới |
| `hooks/blog/useUserSearch.ts` | Tạo mới |
| `hooks/blog/useHighlightPosts.ts` | Tạo mới |
| `components/blog/feed/UserSearchPanel.tsx` | Tạo mới |
| `components/blog/feed/FeedSidebarUserList.tsx` | Tạo mới |
| `components/blog/feed/FeedLeftSidebar.tsx` | Tạo mới |
| `components/blog/feed/FeedRightSidebar.tsx` | Tạo mới |
| `components/blog/PostList.tsx` | Sửa nhỏ |
| `app/[lng]/blog/page.tsx` | Sửa layout |

---

## Không thay đổi

- Logic auth / `ProtectedRoute`
- Component `PostCard` (giữ nguyên)
- Component `FollowButton` (tái sử dụng)
- API feed hiện tại `/api/blog/posts` (giữ nguyên)
- Visibility rules (private / share / public)
- Database schema (không migration)
