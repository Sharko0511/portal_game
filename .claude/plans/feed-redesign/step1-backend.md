# Step 1 — Backend

> Thuộc plan: [main.md](main.md)

---

## 1.1 API: User Search

**File mới:** `app/api/blog/users/search/route.ts`

### Mục đích
Cho phép user đang đăng nhập tìm kiếm user khác theo tên hoặc id để follow từ left sidebar.

### Endpoint
```
GET /api/blog/users/search?q={query}&limit=10
```

### Query params
| Param | Type | Mặc định | Mô tả |
|-------|------|-----------|-------|
| `q` | string | — | Tìm theo `display_name` (ilike) hoặc `id` (exact, nếu là UUID) |
| `limit` | number | `10` | Tối đa 20 |

### Auth
- **Bắt buộc đăng nhập** — dùng `createServerClient` lấy session
- Chưa đăng nhập → `401 UNAUTHORIZED`
- `q` rỗng hoặc < 2 ký tự → trả về `{ data: [] }` (không search mù)

### Logic xử lý
```
1. Tạo supabase server client, lấy session
2. Parse q, limit từ searchParams
3. Nếu q.length < 2 → return { data: [] }
4. Kiểm tra q có dạng UUID → nếu có, thêm filter eq('id', q)
5. Query bảng `profiles`:
   SELECT id, display_name
   WHERE display_name ILIKE '%q%'
   (OR id = q nếu là UUID)
   AND id != currentUserId      ← loại bỏ bản thân
   LIMIT limit
6. Return { data: [...] }
```

### Response
```json
{
  "data": [
    { "id": "uuid-abc", "display_name": "Alice" },
    { "id": "uuid-def", "display_name": "Alice Nguyen" }
  ]
}
```

### Errors
| Tình huống | Status | Code |
|-----------|--------|------|
| Chưa đăng nhập | 401 | `UNAUTHORIZED` |
| DB error | 500 | `INTERNAL_ERROR` |

---

## 1.2 API: Highlight Posts

**File mới:** `app/api/blog/posts/highlights/route.ts`

### Mục đích
Cung cấp dữ liệu cho right sidebar: top bài được like nhiều + bài viết mới nhất (chỉ public).

### Endpoint
```
GET /api/blog/posts/highlights
```

### Auth
- **Không cần đăng nhập** — chỉ trả về `visibility = 'public'`
- Dùng `getSupabaseAdmin()` (giống `app/api/blog/search/route.ts`)

### Logic xử lý
```
1. Chạy 2 query song song với Promise.all:

   Query A — Popular:
     FROM posts_with_counts
     WHERE visibility = 'public'
     ORDER BY like_count DESC, comment_count DESC
     LIMIT 5
     SELECT id, title, cover_image_url, like_count, comment_count,
            author_name, author_id, created_at, slug

   Query B — Recent:
     FROM posts_with_counts
     WHERE visibility = 'public'
     ORDER BY created_at DESC
     LIMIT 5
     SELECT (same columns)

2. Return { data: { popular: [...], recent: [...] } }
```

### Response
```json
{
  "data": {
    "popular": [
      {
        "id": "uuid",
        "title": "Cinema in the AI era",
        "cover_image_url": "https://...",
        "like_count": 42,
        "comment_count": 7,
        "author_name": "Admin",
        "author_id": "uuid-admin",
        "created_at": "2026-03-29T10:00:00Z",
        "slug": "cinema-in-the-ai-era"
      }
    ],
    "recent": [ ... ]
  }
}
```

### Errors
| Tình huống | Status | Code |
|-----------|--------|------|
| Một trong 2 query lỗi | 500 | `INTERNAL_ERROR` |

---

## Lưu ý chung

- Không cần migration DB — chỉ query từ view `posts_with_counts` và bảng `profiles` đã có
- Không dùng `adminFetch` ở server — dùng trực tiếp `supabase` client
- Pattern tham khảo: `app/api/blog/search/route.ts` (cùng cách query `posts_with_counts`)

---

## Checklist

- [ ] Tạo `app/api/blog/users/search/route.ts`
- [ ] Tạo `app/api/blog/posts/highlights/route.ts`
- [ ] Test thủ công (xem [step3-test.md](step3-test.md) — phần 3.1)
