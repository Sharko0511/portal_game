# Project Instructions — game-portal

## What this project is

**game-portal** is a full-stack English learning platform.
Stack: **Next.js 16 (App Router) · React 19 · TypeScript · Supabase (PostgreSQL + Auth) · TanStack React Query · TipTap · Tailwind CSS 4**

Features: blog/social feed (posts, likes, follows, comments), mini-games (Snake, Pong, Breakout) with leaderboards, dynamic i18n (DB-backed), dynamic theming, full admin dashboard, Telegram bot integration.

---

## How to use the knowledge files

`CODEBASE_MAP.md` in this project's knowledge contains the **complete function call graph** of the repo.

**Before writing any code:**
1. Consult the map to find the relevant page, component, hook, and API route
2. Follow existing patterns exactly (hooks call `adminFetch` → API route → `requireAuth`/`requireAdmin` → `getSupabaseAdmin`)
3. If a file isn't in the map, ask the user to provide it

---

## Conventions to follow always

### File structure
- Pages live in `app/[lng]/...` — always include the `[lng]` dynamic segment
- Components in `components/` — UI primitives in `components/ui/`, blog in `components/blog/`
- Hooks in `hooks/` — admin hooks in `hooks/admin/`, blog hooks in `hooks/blog/`
- API routes in `app/api/` — blog API under `app/api/blog/`, admin under `app/api/admin/`
- Server utilities in `lib/`

### Auth pattern
- All protected API routes call `requireAuth(request)` or `requireAdmin(request)` from `lib/auth.ts`
- All client fetches to protected routes use `adminFetch()` from `lib/admin-fetch.ts`
- Admin pages wrap content in `<AdminRoute>`, protected pages in `<ProtectedRoute>`

### Data fetching
- Never fetch directly in components — always go through a hook in `hooks/`
- Hooks use React Query (`useQuery` / `useMutation`) and call API routes via `adminFetch`
- Mutation hooks invalidate the relevant query key on success

### Styling
- Use `cn()` from `lib/utils.ts` for conditional classes
- Use Tailwind CSS classes only — no inline styles
- Use existing `Button` component from `components/Button.tsx` (not raw `<button>`)

### TypeScript
- All props and return types must be typed
- Reuse existing types from `hooks/` before creating new ones

### i18n
- Use `useClientTranslation(lng, namespace)` in client components
- Use `getTranslation(lng, ns, key)` from `lib/i18n.ts` in server components
- Never hardcode user-facing strings — all text goes through the translation system

---

## After each feature

Output a **MAP PATCH** in this format so `CODEBASE_MAP.md` can be updated:

```
## MAP PATCH — [feature name] — [date]

### New routes
- METHOD /api/path → lib helper → supabase table

### New components
- components/path/Name.tsx — ComponentName — brief purpose

### New hooks
- hooks/path/useName.ts — useName() → METHOD /api/path

### New types
- hooks/path/useName.ts — TypeName: { field: type, … }

### Updated call graph
app/[lng]/page.tsx → useHook() → Component
```
