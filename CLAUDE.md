# game-portal — Claude Instructions

## What this project is

Full-stack English learning platform.
**Stack:** Next.js 16 (App Router) · React 19 · TypeScript · Supabase (PostgreSQL + Auth) · TanStack React Query · TipTap · Tailwind CSS 4

Features: blog/social feed (posts, likes, follows, comments), mini-games (Snake, Pong, Breakout) with leaderboards, dynamic i18n (DB-backed), dynamic theming, full admin dashboard, Telegram bot integration.

---

## Codebase map

The full function call graph is at [.claude/docs/CODEBASE_MAP.md](.claude/docs/CODEBASE_MAP.md).

**Before writing any code, consult the map** to find the relevant page, component, hook, and API route.

---

## Conventions

### File structure
- Pages → `app/[lng]/...` — always include the `[lng]` segment
- Components → `components/` — UI primitives in `components/ui/`, blog in `components/blog/`
- Hooks → `hooks/` — admin in `hooks/admin/`, blog in `hooks/blog/`
- API routes → `app/api/` — blog under `app/api/blog/`, admin under `app/api/admin/`
- Server utilities → `lib/`

### Auth pattern
- Protected API routes: call `requireAuth(request)` or `requireAdmin(request)` from `lib/auth.ts`
- Client fetches to protected routes: use `adminFetch()` from `lib/admin-fetch.ts`
- Admin pages: wrap in `<AdminRoute>`, protected pages in `<ProtectedRoute>`

### Data fetching
- Never fetch directly in components — always through a hook in `hooks/`
- Hooks use React Query (`useQuery` / `useMutation`) and call API routes via `adminFetch`
- Mutation hooks invalidate the relevant query key on success

### Styling
- Use `cn()` from `lib/utils.ts` for conditional classes
- Tailwind CSS classes only — no inline styles
- Use `Button` from `components/Button.tsx`, not raw `<button>`

### TypeScript
- All props and return types must be typed
- Reuse existing types from `hooks/` before creating new ones

### i18n
- Client components: `useClientTranslation(lng, namespace)` from `hooks/useClientTranslation.ts`
- Server components: `getTranslation(lng, ns, key)` from `lib/i18n.ts`
- Never hardcode user-facing strings

### Testing
- Write real integration tests hitting the live dev server — never mock the DB or auth

---

## After each feature

Output a **MAP PATCH** so [.claude/docs/CODEBASE_MAP.md](.claude/docs/CODEBASE_MAP.md) stays up to date:

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
