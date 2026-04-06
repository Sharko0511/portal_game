# Step 3 — Test & QA

> Thuộc plan: [main.md](main.md)

---

## 3.1 Test API (integration tests)

Dev server phải đang chạy (`npm run dev`).

### Chạy test

```bash
# Test API user search
node tests/blog/users-search-api-test.js

# Test API highlight posts
node tests/blog/highlights-api-test.js
```

### `tests/blog/users-search-api-test.js` — covers:
| Test | Mô tả |
|------|-------|
| 2.1 | No token → 401 |
| 3.1 | Empty q → `[]` |
| 3.2 | q có 1 ký tự → `[]` |
| 4.1 | Search 'admin' → trả về `{ id, display_name }` |
| 4.2 | Case-insensitive (ADMIN = admin) |
| 4.3 | Không có match → `[]` |
| 5.1 | Current user không xuất hiện trong kết quả |
| 6.1 | Search bằng UUID chính xác → tìm được user |
| 7.1 | `limit=1` → tối đa 1 kết quả |

### `tests/blog/highlights-api-test.js` — covers:
| Test | Mô tả |
|------|-------|
| 1.1–1.3 | Response shape có `popular[]` và `recent[]` |
| 2.1–2.2 | Mỗi array tối đa 5 items |
| 3.1–3.2 | Mỗi post có đủ fields: `id, title, like_count, comment_count, author_name, created_at` |
| 4.1 | `popular` sorted by `like_count DESC` |
| 4.2 | `recent` sorted by `created_at DESC` |
| 6.1 | Không cần Authorization header (public endpoint) |

---

## 3.2 Test Layout (Visual)

### Desktop (>= 1024px / lg breakpoint)

- [ ] Left sidebar hiển thị (260px)
- [ ] Right sidebar hiển thị (260px)
- [ ] Center chiếm phần còn lại
- [ ] Cả 2 sidebar sticky khi scroll
- [ ] Không bị overflow ngang

### Tablet (768px – 1023px)

- [ ] Left sidebar ẩn
- [ ] Right sidebar ẩn
- [ ] Center chiếm full width

### Mobile (< 768px)

- [ ] Chỉ hiện center feed
- [ ] PostList 1 cột (không 2 cột)
- [ ] Header "Your Feed" + nút New Post vẫn đúng

---

## 3.3 Test Left Sidebar — Following / Followers

**Chuẩn bị:** User A follow User B trước.

- [ ] Đăng nhập User A → vào `/[lng]/blog`
- [ ] Left sidebar hiện "Following" với User B trong danh sách
- [ ] Click tên User B → chuyển đến `/[lng]/users/{id}` đúng
- [ ] Nút FollowButton trong sidebar: hiện "Following" (đã follow)
- [ ] Click "Following" (unfollow) → User B biến khỏi danh sách Following
- [ ] Danh sách "Followers": hiện đúng những ai follow User A

**Edge case:**
- [ ] User chưa follow ai → "Following" section hiện trống (không crash)
- [ ] User không có follower → "Followers" section hiện trống

---

## 3.4 Test User Search

- [ ] Click vào ô search → focus, placeholder "Search people..."
- [ ] Gõ 1 ký tự → không có kết quả (debounce + min length)
- [ ] Gõ 2+ ký tự → sau 300ms hiện dropdown kết quả
- [ ] Kết quả có nút Follow / Following đúng trạng thái
- [ ] Click Follow từ search result → toggle follow thành công
- [ ] Click ngoài dropdown → dropdown đóng
- [ ] Xóa hết text → dropdown đóng / ẩn

**Edge case:**
- [ ] Gõ tên không tồn tại → dropdown hiện "No users found" (hoặc trống)
- [ ] Không hiện bản thân trong kết quả
- [ ] Gõ nhanh liên tục → chỉ gọi API sau khi ngừng 300ms (debounce hoạt động)

---

## 3.5 Test Right Sidebar — Highlight Posts

- [ ] "Most Popular" hiện 5 bài public, sort đúng (bài nhiều like nhất ở trên)
- [ ] "Most Recent" hiện 5 bài public, sort đúng (bài mới nhất ở trên)
- [ ] Click vào post → navigate đúng `/blog/{id}`
- [ ] Thumbnail hiển thị (hoặc fallback chữ cái đầu nếu không có ảnh)

**Edge case:**
- [ ] Chưa có bài public nào → section hiện trống (không crash)
- [ ] Có < 5 bài public → hiện đúng số bài có, không crash

---

## 3.6 Test Integration: Follow → Feed update

- [ ] User A follow User B từ left sidebar
- [ ] PostList center tự refresh (hoặc sau F5) hiện bài của User B
- [ ] User A unfollow User B → bài của User B biến khỏi feed

*(Cơ chế: `useToggleFollow` đã `invalidateQueries(['posts'])` sau khi toggle)*

---

## Checklist tổng

- [ ] Tất cả API test pass (3.1)
- [ ] Layout đúng trên 3 breakpoint (3.2)
- [ ] Following/Followers sidebar hoạt động (3.3)
- [ ] User search hoạt động (3.4)
- [ ] Highlight posts đúng (3.5)
- [ ] Follow từ sidebar → feed cập nhật (3.6)
