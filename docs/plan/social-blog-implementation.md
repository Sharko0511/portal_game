# Social Blog — Implementation Breakdown

Each step follows TDD: **write unit test first → implement → verify**.
DB steps have no unit test (run SQL directly in Supabase dashboard).

---

## Steps

| # | Piece | Deliverables | Has Test |
|---|-------|-------------|----------|
| 1 | **DB Migration** | SQL for `follows`, `posts`, `comments`, `likes` tables, `posts_with_counts` view, `post-images` storage bucket | No |
| 2 | **Follow API** | `POST /api/blog/users/[id]/follow` (toggle), `GET /api/blog/users/[id]/follow` (status), `GET followers`, `GET following` | Yes |
| 3 | **Posts API** | `GET/POST /api/blog/posts`, `GET/PATCH/DELETE /api/blog/posts/[id]` | Yes |
| 4 | **Comments API** | `GET/POST /api/blog/posts/[id]/comments`, `DELETE /api/blog/comments/[id]` | Yes |
| 5 | **Likes API** | `POST /api/blog/posts/[id]/like` (toggle) | Yes |
| 6 | **TipTap Editor** | `TipTapEditor.tsx`, `ImageUpload.tsx` | Yes |
| 7 | **Post Form + Pages** | `PostForm.tsx`, `app/blog/new/page.tsx`, `app/blog/[id]/edit/page.tsx` | Yes |
| 8 | **Post Feed** | `PostCard.tsx`, `PostList.tsx`, `usePosts.ts`, `usePost.ts`, `app/blog/page.tsx` | Yes |
| 9 | **Like Button** | `LikeButton.tsx`, `useLike.ts` | Yes |
| 10 | **Follow Button** | `FollowButton.tsx`, `useFollow.ts`, `useFollowers.ts`, `useFollowing.ts` | Yes |
| 11 | **Comments UI** | `CommentSection.tsx`, `CommentItem.tsx`, `useComments.ts`, `useAddComment.ts`, `useDeleteComment.ts` | Yes |
| 12 | **Share Button** | `ShareButton.tsx` | Yes |
| 13 | **User Profile Page** | `app/users/[id]/page.tsx`, `UserCard.tsx`, `useUserPosts.ts` | Yes |
| 14 | **Navbar** | Add "Blog" link to `components/Navbar.tsx` | No |

---

## Progress

- [x] Step 1 — DB Migration
- [x] Step 2 — Follow API
- [x] Step 3 — Posts API
- [x] Step 4 — Comments API
- [x] Step 5 — Likes API
- [ ] Step 6 — TipTap Editor
- [ ] Step 7 — Post Form + Pages
- [ ] Step 8 — Post Feed
- [ ] Step 9 — Like Button
- [ ] Step 10 — Follow Button
- [ ] Step 11 — Comments UI
- [ ] Step 12 — Share Button
- [ ] Step 13 — User Profile Page
- [ ] Step 14 — Navbar

---

## Test File Locations

```
tests/
  blog/
    api/
      follow.test.ts
      posts.test.ts
      comments.test.ts
      likes.test.ts
    components/
      TipTapEditor.test.tsx
      ImageUpload.test.tsx
      PostForm.test.tsx
      PostCard.test.tsx
      PostList.test.tsx
      LikeButton.test.tsx
      FollowButton.test.tsx
      CommentSection.test.tsx
      CommentItem.test.tsx
      ShareButton.test.tsx
      UserCard.test.tsx
    hooks/
      usePosts.test.ts
      usePost.test.ts
      useLike.test.ts
      useFollow.test.ts
      useComments.test.ts
```

---

## Rule: Definition of Done (per step)
1. Unit test file written
2. All test cases defined (success + fail + edge)
3. Implementation written
4. All tests pass (`npm test`)
5. Progress checkbox above updated
