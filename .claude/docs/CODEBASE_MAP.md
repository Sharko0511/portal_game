# CODEBASE_MAP.md — game-portal
> Auto-generated: 2026-04-13 | Stack: Next.js 16 · React 19 · TypeScript · Supabase · TipTap · TanStack Query

---

## 1. PROJECT STACK

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 16.1.6 (App Router, Server + Client components) |
| UI | React 19.2.3, Tailwind CSS 4, Radix UI, Lucide icons |
| Rich Text | TipTap 3.20.1 (image, link, align, underline, placeholder) |
| Auth & DB | Supabase v2 (PostgreSQL + Auth + Realtime) |
| Server State | TanStack React Query v5 |
| Global State | React Context (Auth, Theme) + in-memory cache (i18n) |
| i18n | Custom DB-backed translations with 2-min client cache |
| Testing | Vitest 4 + Testing Library |
| Tooling | ESLint 9, PostCSS 4, Supabase CLI |

---

## 2. DIRECTORY TREE

```
game-portal/
├── app/                          # Next.js App Router
│   ├── layout.tsx               # Root layout — QueryProvider, AuthProvider, ThemeProvider
│   ├── globals.css              # Tailwind base styles
│   ├── [lng]/                   # Dynamic language segment (e.g. /en, /vi)
│   │   ├── layout.tsx           # Language layout + TranslationSeed
│   │   ├── page.tsx             # Home (HeroSection + FeaturesSection + maintenance check)
│   │   ├── login/page.tsx       # Login form → signIn()
│   │   ├── register/page.tsx    # Register form → signUp()
│   │   ├── profile/page.tsx     # User profile: scores, Telegram link [PROTECTED]
│   │   ├── blog/
│   │   │   ├── page.tsx         # Feed: own + followed posts [PROTECTED]
│   │   │   ├── new/page.tsx     # Create post [PROTECTED]
│   │   │   ├── [id]/page.tsx    # View post: likes, comments, follow
│   │   │   └── [id]/edit/page.tsx  # Edit post (owner/admin)
│   │   ├── games/
│   │   │   ├── page.tsx         # Games hub grid
│   │   │   ├── snake/page.tsx   # Snake game
│   │   │   ├── pong/page.tsx    # Pong game
│   │   │   └── breakout/page.tsx # Breakout game
│   │   ├── leaderboard/page.tsx # Top scores across games
│   │   ├── baohay/page.tsx      # Báo hay news feed
│   │   ├── tags/page.tsx        # Tag browser
│   │   ├── tags/[tag]/page.tsx  # Posts filtered by tag
│   │   ├── users/[id]/page.tsx  # Public user profile
│   │   └── admin/               # Admin dashboard [ADMIN ONLY]
│   │       ├── page.tsx         # Dashboard stats
│   │       ├── users/page.tsx   # User CRUD + ban/role
│   │       ├── posts/page.tsx   # Post management + visibility
│   │       ├── games/page.tsx   # Game config editor
│   │       ├── scores/page.tsx  # Leaderboard admin (reset/delete)
│   │       ├── config/page.tsx  # Site config (maintenance mode, etc)
│   │       ├── theme/page.tsx   # Theme variable editor
│   │       └── translations/page.tsx # i18n pivot table editor
│   └── api/                     # REST API routes
│       ├── blog/                # Blog API (see §5 for full table)
│       ├── admin/               # Admin-only API
│       ├── games/config/        # Public game list
│       ├── i18n/[lng]/[ns]/    # Translation fetch
│       ├── i18n/languages/      # Available languages
│       ├── theme/               # Theme CSS
│       ├── site/status/         # Maintenance mode check
│       ├── telegram/link/       # Telegram account link
│       └── telegram/webhook/    # Telegram bot webhook
├── components/                  # React components (see §4)
│   ├── AuthProvider.tsx         # Auth context: user, profile, signIn/Out/Up
│   ├── ProtectedRoute.tsx       # Auth guard (redirect to /login if unauth)
│   ├── AdminRoute.tsx           # Admin guard (redirect to home if not admin)
│   ├── QueryProvider.tsx        # React Query + devtools
│   ├── ThemeProvider.tsx        # light/dark/custom theme context
│   ├── TranslationSeed.tsx      # Seed i18n cache before hydration
│   ├── Navbar.tsx               # Top nav with search, lang picker, user menu
│   ├── Footer.tsx               # Footer with links + language selector
│   ├── UserMenu.tsx             # Logged-in user dropdown
│   ├── SettingsDropdown.tsx     # Language + theme quick selector
│   ├── Button.tsx               # Custom button (size/variant/color)
│   ├── MaintenancePage.tsx      # Maintenance mode display
│   ├── ui/                      # Radix UI primitives
│   ├── homepage/                # HeroSection, FeaturesSection, FeatureBlock
│   └── blog/                    # Blog: PostForm, PostCard, PostList, BlockEditor,
│                                #  TipTapEditor, CommentSection, LikeButton,
│                                #  FollowButton, ShareButton, UserCard, etc.
│       └── feed/                # FeedLeftSidebar, FeedRightSidebar, UserSearchPanel
├── hooks/                       # Custom React hooks (see §6)
│   ├── useAuth.ts               # Access AuthContext
│   ├── useLng.ts                # Current language from route params
│   ├── useClientTranslation.ts  # Client i18n with 2-min cache
│   ├── useSaveScore.ts          # Save game score mutation
│   ├── useLeaderboard.ts        # Top scores query
│   ├── useProfileScores.ts      # User's scores query
│   ├── useUpdateProfile.ts      # Update display_name mutation
│   ├── useGamesConfig.ts        # Games list/config query
│   ├── useSiteStatus.ts         # Maintenance mode query
│   ├── admin/                   # Admin hooks: useAdminUsers, Posts, Games,
│   │                            #  Scores, Config, Theme, Translations, Stats
│   └── blog/                    # Blog hooks: usePost, usePosts, useComments,
│                                #  useLike, useFollow, useUserSearch, etc.
├── lib/                         # Server utilities
│   ├── auth.ts                  # getUser(), requireAuth(), requireAdmin()
│   ├── supabase.ts              # Client Supabase instances
│   ├── supabase-server.ts       # Server Supabase (admin key)
│   ├── admin-fetch.ts           # Authenticated fetch with auto-logout on 401
│   ├── i18n.ts                  # Server-side translation (queries DB)
│   ├── theme.ts                 # Build CSS from theme_config table
│   ├── telegram.ts              # Send Telegram messages via bot API
│   ├── utils.ts                 # cn() — Tailwind classname merge
│   └── query-client.ts          # React Query client factory
├── middleware.ts                # Language detection + routing
├── supabase/                    # DB migrations + seed
├── package.json
├── next.config.mjs
├── tailwind.config.ts
└── tsconfig.json
```

---

## 3. ROUTES TABLE

| Route | File | Auth | Purpose |
|-------|------|------|---------|
| `/[lng]` | `app/[lng]/page.tsx` | — | Home: hero + features + maintenance check |
| `/[lng]/login` | `login/page.tsx` | redirect if authed | Login form |
| `/[lng]/register` | `register/page.tsx` | — | Signup form |
| `/[lng]/profile` | `profile/page.tsx` | PROTECTED | User profile, scores, Telegram link |
| `/[lng]/blog` | `blog/page.tsx` | PROTECTED | Feed: own + followed posts |
| `/[lng]/blog/new` | `blog/new/page.tsx` | PROTECTED | Create post |
| `/[lng]/blog/[id]` | `blog/[id]/page.tsx` | — | View post: likes, comments, follow |
| `/[lng]/blog/[id]/edit` | `blog/[id]/edit/page.tsx` | OWNER/ADMIN | Edit post |
| `/[lng]/games` | `games/page.tsx` | — | Games hub grid |
| `/[lng]/games/snake` | `games/snake/page.tsx` | — | Snake game |
| `/[lng]/games/pong` | `games/pong/page.tsx` | — | Pong game |
| `/[lng]/games/breakout` | `games/breakout/page.tsx` | — | Breakout game |
| `/[lng]/leaderboard` | `leaderboard/page.tsx` | — | Top scores |
| `/[lng]/baohay` | `baohay/page.tsx` | — | News feed |
| `/[lng]/tags` | `tags/page.tsx` | — | Tag browser |
| `/[lng]/tags/[tag]` | `tags/[tag]/page.tsx` | — | Posts by tag |
| `/[lng]/users/[id]` | `users/[id]/page.tsx` | — | Public user profile |
| `/[lng]/admin` | `admin/page.tsx` | ADMIN | Dashboard stats |
| `/[lng]/admin/users` | `admin/users/page.tsx` | ADMIN | User CRUD + ban/role |
| `/[lng]/admin/posts` | `admin/posts/page.tsx` | ADMIN | Post management + visibility |
| `/[lng]/admin/games` | `admin/games/page.tsx` | ADMIN | Game config editor |
| `/[lng]/admin/scores` | `admin/scores/page.tsx` | ADMIN | Leaderboard admin |
| `/[lng]/admin/config` | `admin/config/page.tsx` | ADMIN | Site config (maintenance, etc) |
| `/[lng]/admin/theme` | `admin/theme/page.tsx` | ADMIN | Theme variable editor |
| `/[lng]/admin/translations` | `admin/translations/page.tsx` | ADMIN | i18n pivot table |

---

## 4. COMPONENTS

| Component | File | Purpose |
|-----------|------|---------|
| `AuthProvider` | `components/AuthProvider.tsx` | Auth context: user, profile, signIn/signOut/signUp, 3h session timeout |
| `ProtectedRoute` | `components/ProtectedRoute.tsx` | Redirect to /login if unauth; show banned message if banned |
| `AdminRoute` | `components/AdminRoute.tsx` | ProtectedRoute + admin role check |
| `QueryProvider` | `components/QueryProvider.tsx` | React Query + devtools |
| `ThemeProvider` | `components/ThemeProvider.tsx` | light/dark/custom theme context + localStorage |
| `TranslationSeed` | `components/TranslationSeed.tsx` | Seed i18n cache before hydration |
| `Navbar` | `components/Navbar.tsx` | Top nav: logo, search, lang picker, user menu, mobile hamburger |
| `Footer` | `components/Footer.tsx` | Footer with links + language selector |
| `UserMenu` | `components/UserMenu.tsx` | Logged-in dropdown (profile, settings, logout) |
| `SettingsDropdown` | `components/SettingsDropdown.tsx` | Language + theme quick selector |
| `Button` | `components/Button.tsx` | Custom button (size/variant: primary, danger, outline, ghost…) |
| `MaintenancePage` | `components/MaintenancePage.tsx` | Maintenance mode display |
| `HeroSection` | `components/homepage/HeroSection.tsx` | Landing hero with CTA |
| `FeaturesSection` | `components/homepage/FeaturesSection.tsx` | Feature grid (games, blog, leaderboard) |
| `FeatureBlock` | `components/homepage/FeatureBlock.tsx` | Single feature card |
| `PostForm` | `components/blog/PostForm.tsx` | Create/edit post: title, content (BlockEditor), cover, visibility, tags |
| `PostCard` | `components/blog/PostCard.tsx` | Post card (featured/compact layout) |
| `PostList` | `components/blog/PostList.tsx` | Grid/list of PostCards with loading + empty states |
| `BlockEditor` | `components/blog/BlockEditor.tsx` | Custom block editor (TipTap blocks + image blocks) |
| `TipTapEditor` | `components/blog/TipTapEditor.tsx` | Rich text toolbar wrapper |
| `ImageUpload` | `components/blog/ImageUpload.tsx` | Image upload widget |
| `CommentSection` | `components/blog/CommentSection.tsx` | Comments thread + reply form |
| `CommentItem` | `components/blog/CommentItem.tsx` | Single comment |
| `LikeButton` | `components/blog/LikeButton.tsx` | Like toggle with count |
| `FollowButton` | `components/blog/FollowButton.tsx` | Follow/unfollow toggle |
| `ShareButton` | `components/blog/ShareButton.tsx` | Share post (copy link) |
| `UserCard` | `components/blog/UserCard.tsx` | User mini card: avatar, name, bio, follow button |
| `LoginDialog` | `components/blog/LoginDialog.tsx` | Prompt login modal before action |
| `ArticleListByLevel` | `components/blog/ArticleListByLevel.tsx` | Filter posts by CEFR level (A1–C2) |
| `FeedLeftSidebar` | `components/blog/feed/FeedLeftSidebar.tsx` | Feed left nav: trending, search |
| `FeedRightSidebar` | `components/blog/feed/FeedRightSidebar.tsx` | Feed right: suggestions, stats |
| `FeedSidebarUserList` | `components/blog/feed/FeedSidebarUserList.tsx` | User list widget |
| `UserSearchPanel` | `components/blog/feed/UserSearchPanel.tsx` | User search with autocomplete |

---

## 5. API ROUTES

### Blog API (`/api/blog/`)

| Method | Route | Auth | Purpose |
|--------|-------|------|---------|
| GET | `/api/blog/posts` | AUTH | Feed: own + followed posts (paginated) |
| POST | `/api/blog/posts` | AUTH | Create post |
| GET | `/api/blog/posts/[id]` | OPTIONAL | View post (visibility check) |
| PATCH | `/api/blog/posts/[id]` | OWNER/ADMIN | Update post |
| DELETE | `/api/blog/posts/[id]` | OWNER/ADMIN | Delete post |
| GET | `/api/blog/posts/[id]/comments` | OPTIONAL | Fetch comments |
| POST | `/api/blog/posts/[id]/comments` | AUTH | Add comment |
| DELETE | `/api/blog/comments/[id]` | OWNER | Delete comment |
| GET | `/api/blog/posts/[id]/like` | AUTH | Check like status |
| POST | `/api/blog/posts/[id]/like` | AUTH | Toggle like |
| GET | `/api/blog/posts/highlights` | — | Featured posts |
| GET | `/api/blog/search` | — | Full-text search (level/tag/category filters) |
| GET | `/api/blog/audiochat` | — | Audio chat posts |
| GET | `/api/blog/baohay` | — | Báo hay news posts |
| GET | `/api/blog/users/[id]/follow` | AUTH | Check follow status |
| POST | `/api/blog/users/[id]/follow` | AUTH | Toggle follow |
| GET | `/api/blog/users/[id]/followers` | AUTH | Followers list |
| GET | `/api/blog/users/[id]/following` | AUTH | Following list |
| GET | `/api/blog/users/search` | AUTH | Search users |

### Admin API (`/api/admin/`)

| Method | Route | Purpose |
|--------|-------|---------|
| GET/DELETE/PATCH | `/api/admin/users` + `[id]` + `[id]/ban` + `[id]/role` | User management |
| GET/POST/PATCH | `/api/admin/posts` + `[id]/visibility` | Post management |
| GET/PATCH | `/api/admin/games` + `[id]` | Game config |
| GET/POST/PATCH/DELETE | `/api/admin/scores` + `[id]` + `reset` | Score management |
| GET/PATCH | `/api/admin/config` | Site config |
| GET/PATCH/POST/DELETE | `/api/admin/theme` | Theme variables |
| GET/PATCH/POST | `/api/admin/translations` + `add-language` + `save-default` + `revert` | i18n |
| GET | `/api/admin/stats` | Dashboard statistics |

### Public API

| Method | Route | Purpose |
|--------|-------|---------|
| GET | `/api/games/config` | Enabled games list |
| GET | `/api/i18n/[lng]/[ns]` | Translations for language + namespace |
| GET | `/api/i18n/languages` | Available languages |
| GET | `/api/theme` | Theme CSS (CSS variables) |
| GET | `/api/site/status` | Maintenance mode + site config |
| POST | `/api/telegram/link` | Link Telegram account (AUTH) |
| POST | `/api/telegram/webhook` | Telegram bot webhook |
| POST | `/api/seed-translations` | Initialize default translations |

---

## 6. HOOKS

| Hook | File | Returns |
|------|------|---------|
| `useAuth()` | `hooks/useAuth.ts` | `{ user, profile, signIn, signUp, signOut, refreshProfile, loading }` |
| `useLng()` | `hooks/useLng.ts` | `string` — current language code from route params |
| `useClientTranslation(lng, ns)` | `hooks/useClientTranslation.ts` | `{ t(key) }` — i18n with 2-min cache |
| `useSaveScore()` | `hooks/useSaveScore.ts` | Mutation to save game score |
| `useLeaderboard(game?)` | `hooks/useLeaderboard.ts` | Top 20 `LeaderboardScore[]` |
| `useProfileScores(userId)` | `hooks/useProfileScores.ts` | `ProfileScore[]` |
| `useUpdateProfile()` | `hooks/useUpdateProfile.ts` | Mutation to update display_name |
| `useGamesConfig()` | `hooks/useGamesConfig.ts` | `GameConfig[]` |
| `useGameConfig(id)` | `hooks/useGamesConfig.ts` | Single `GameConfig` |
| `useSiteStatus()` | `hooks/useSiteStatus.ts` | `{ maintenance_mode, ... }` |
| `useAdminUsers()` | `hooks/admin/useAdminUsers.ts` | `AdminUser[]` + CRUD mutations |
| `useAdminPosts()` | `hooks/admin/useAdminPosts.ts` | `AdminPost[]` + visibility/delete |
| `useAdminGames()` | `hooks/admin/useAdminGames.ts` | `AdminGameConfig[]` + update |
| `useAdminScores()` | `hooks/admin/useAdminScores.ts` | `AdminScore[]` + delete/reset |
| `useAdminConfig()` | `hooks/admin/useAdminConfig.ts` | `SiteConfig[]` + update |
| `useAdminTheme()` | `hooks/admin/useAdminTheme.ts` | `ThemeRow[]` + CRUD |
| `useAdminTranslations()` | `hooks/admin/useAdminTranslations.ts` | `PivotedTranslations` + update/add-lang |
| `useAdminStats()` | `hooks/admin/useAdminStats.ts` | Dashboard stats object |
| `usePost(id)` | `hooks/blog/usePost.ts` | Single post + update/baohay/audiochat/search |
| `usePosts(params)` | `hooks/blog/usePosts.ts` | Feed `Post[]` paginated |
| `useUserPosts(userId)` | `hooks/blog/useUserPosts.ts` | User's posts |
| `useHighlightPosts()` | `hooks/blog/useHighlightPosts.ts` | Featured posts |
| `useComments(postId)` | `hooks/blog/useComments.ts` | `Comment[]` + add/delete mutations |
| `useLikeStatus(postId)` | `hooks/blog/useLike.ts` | `{ liked, count }` |
| `useToggleLike(postId)` | `hooks/blog/useLike.ts` | Mutation (optimistic update) |
| `useFollowStatus(userId)` | `hooks/blog/useFollow.ts` | `{ following }` |
| `useToggleFollow(userId)` | `hooks/blog/useFollow.ts` | Mutation |
| `useFollowers(userId)` | `hooks/blog/useFollow.ts` | `FollowProfile[]` |
| `useFollowing(userId)` | `hooks/blog/useFollow.ts` | `FollowProfile[]` |
| `useUserSearch(query)` | `hooks/blog/useUserSearch.ts` | `FollowProfile[]` |

---

## 7. LIB / UTILITIES

| Function | File | Purpose |
|----------|------|---------|
| `getUser(req)` | `lib/auth.ts` | Extract + validate user from Bearer token |
| `requireAuth(req)` | `lib/auth.ts` | `getUser` + return 401 if missing |
| `requireAdmin(req)` | `lib/auth.ts` | `requireAuth` + check `role === "admin"` (403 if not) |
| `getSupabase()` | `lib/supabase.ts` | Client Supabase (anon key) |
| `getSupabaseWithAuth(token)` | `lib/supabase.ts` | Client Supabase (with user token) |
| `getSupabaseAdmin()` | `lib/supabase-server.ts` | Server Supabase (service role key) |
| `getAdminToken()` | `lib/admin-fetch.ts` | Get auth token from session |
| `adminFetch(url, opts)` | `lib/admin-fetch.ts` | fetch() with Bearer header, auto-logout on 401 |
| `adminFetchJson<T>()` | `lib/admin-fetch.ts` | `adminFetch` + JSON parse |
| `getTranslation(lng, ns, key)` | `lib/i18n.ts` | Server-side DB translation lookup |
| `fetchThemeCss()` | `lib/theme.ts` | Build CSS string from `theme_config` table |
| `sendTelegramMessage(chatId, text)` | `lib/telegram.ts` | Send message via Telegram Bot API |
| `cn(...classes)` | `lib/utils.ts` | Tailwind classname merge (clsx + tailwind-merge) |
| `getQueryClient()` | `lib/query-client.ts` | React Query client factory |

---

## 8. KEY TYPES / INTERFACES

| Type | File | Shape |
|------|------|-------|
| `Profile` | `lib/auth.ts` | `{ id, email, display_name, role, is_banned, avatar_url, … }` |
| `AuthResult` | `lib/auth.ts` | `{ user: User, profile: Profile }` |
| `AuthContextType` | `components/AuthProvider.tsx` | `{ user, profile, loading, signIn, signUp, signOut, refreshProfile }` |
| `Post` | `hooks/blog/usePost.ts` | `{ id, title, content, visibility, category, level, tags, author, … }` |
| `PostVisibility` | `hooks/blog/usePost.ts` | `"public" \| "private" \| "shared"` |
| `PostCategory` | `hooks/blog/usePost.ts` | `"article" \| "audiochat" \| "baohay" \| …` |
| `PostLevel` | `hooks/blog/usePost.ts` | `"A1" \| "A2" \| "B1" \| "B2" \| "C1" \| "C2" \| null` |
| `Comment` | `hooks/blog/useComments.ts` | `{ id, content, author, post_id, created_at }` |
| `FollowProfile` | `hooks/blog/useFollow.ts` | `{ id, display_name, avatar_url }` |
| `LeaderboardScore` | `hooks/useLeaderboard.ts` | `{ user_id, display_name, game, score, created_at }` |
| `GameConfig` | `hooks/useGamesConfig.ts` | `{ id, name, slug, enabled, config }` |
| `SiteConfig` | `hooks/admin/useAdminConfig.ts` | `{ key, value }` |
| `ThemeRow` | `hooks/admin/useAdminTheme.ts` | `{ id, name, variable, value, theme }` |
| `AdminUser` | `hooks/admin/useAdminUsers.ts` | `{ id, email, display_name, role, is_banned, … }` |
| `TranslationRow` | `hooks/admin/useAdminTranslations.ts` | `{ id, key, namespace, [lang]: value, … }` |
| `PostFormValues` | `components/blog/PostForm.tsx` | Form submit payload: title, content, visibility, tags, level, … |

---

## 9. FUNCTION CALL GRAPH

### Client-side (Page → Component → Hook → API)

```
# Home
app/[lng]/page.tsx
  → useSiteStatus()                    → GET /api/site/status
  → useClientTranslation(lng, 'home')  → GET /api/i18n/[lng]/home
  → HeroSection
  → FeaturesSection → FeatureBlock[]

# Blog feed
app/[lng]/blog/page.tsx
  → ProtectedRoute (auth check)
  → usePosts(params)                   → GET /api/blog/posts
  → PostList → PostCard[]
  → FeedLeftSidebar
  → FeedRightSidebar

# View post
app/[lng]/blog/[id]/page.tsx
  → usePost(id)                        → GET /api/blog/posts/[id]
  → LikeButton
      → useLikeStatus(id)              → GET /api/blog/posts/[id]/like
      → useToggleLike(id)              → POST /api/blog/posts/[id]/like
  → FollowButton
      → useFollowStatus(uid)           → GET /api/blog/users/[uid]/follow
      → useToggleFollow(uid)           → POST /api/blog/users/[uid]/follow
  → CommentSection
      → useComments(id)               → GET /api/blog/posts/[id]/comments
      → useAddComment()               → POST /api/blog/posts/[id]/comments
      → useDeleteComment()            → DELETE /api/blog/comments/[cid]
  → UserCard → FollowButton (same hooks above)

# Create / Edit post
app/[lng]/blog/new/page.tsx
  → ProtectedRoute
  → PostForm
      → BlockEditor → TipTapEditor
      → ImageUpload
      → useCreatePost()               → POST /api/blog/posts

app/[lng]/blog/[id]/edit/page.tsx
  → PostForm (edit mode)
      → useUpdatePost()               → PATCH /api/blog/posts/[id]

# Games
app/[lng]/games/page.tsx
  → useGamesConfig()                   → GET /api/games/config
  → (game cards grid)

app/[lng]/games/snake|pong|breakout/page.tsx
  → useGameConfig(id)                  → GET /api/games/config
  → useSaveScore()                     → POST to Supabase directly

# Leaderboard
app/[lng]/leaderboard/page.tsx
  → useLeaderboard(game?)              → Supabase query

# Profile
app/[lng]/profile/page.tsx
  → ProtectedRoute
  → useAuth()                          → AuthContext
  → useProfileScores(userId)           → Supabase query
  → useUpdateProfile()                 → Supabase mutation

# Admin pages (all: → AdminRoute → useAdmin*() → adminFetch → /api/admin/*)
app/[lng]/admin/users/page.tsx
  → AdminRoute → useAdminUsers()       → GET /api/admin/users
               → useToggleBan()        → PATCH /api/admin/users/[id]/ban
               → useChangeRole()       → PATCH /api/admin/users/[id]/role
               → useDeleteUser()       → DELETE /api/admin/users/[id]

app/[lng]/admin/posts/page.tsx
  → AdminRoute → useAdminPosts()       → GET /api/admin/posts
               → useAdminChangeVisibility() → PATCH /api/admin/posts/[id]/visibility
               → useAdminDeletePost()  → DELETE /api/admin/posts/[id]

# Navbar (present everywhere)
Navbar.tsx
  → useAuth()                          → AuthContext
  → useLng()                           → route params
  → useClientTranslation()
  → SettingsDropdown → useTheme()      → ThemeContext
  → UserMenu → useAuth()
```

### Server-side (API Route → lib → Supabase)

```
# Standard auth check
/api/blog/posts [POST]
  → requireAuth(req)                   → Supabase.auth.getUser(token)
  → getSupabaseAdmin()
  → supabase.from("posts").insert(...)
  → notifyFollowers()  → sendTelegramMessage()

# Admin auth check
/api/admin/* [any]
  → requireAdmin(req)                  → requireAuth() + profile.role === "admin"
  → getSupabaseAdmin()
  → supabase.from("...").select/insert/update/delete

# Post visibility check
/api/blog/posts/[id] [GET]
  → getSupabaseAdmin()
  → fetch post
  → if visibility === "private": requireAuth() + check owner
  → if visibility === "shared": check share token

# i18n
/api/i18n/[lng]/[ns] [GET]
  → getSupabaseAdmin()
  → supabase.from("translations").select(...)

# Theme
/api/theme [GET]
  → fetchThemeCss()
  → getSupabaseAdmin()
  → supabase.from("theme_config").select(...)
  → build CSS string of variables
```

---

## 10. STATE MANAGEMENT

```
┌─────────────────────────────────────────────────────────────┐
│  React Context                                               │
│  ┌─────────────────────┐   ┌────────────────────────────┐  │
│  │  AuthContext         │   │  ThemeProviderContext       │  │
│  │  (AuthProvider)      │   │  (ThemeProvider)            │  │
│  │  - user              │   │  - theme: light|dark|custom │  │
│  │  - profile           │   │  - setTheme()               │  │
│  │  - signIn/Out/Up     │   │  - persisted to localStorage│  │
│  │  - 3h session check  │   └────────────────────────────┘  │
│  └─────────────────────┘                                     │
│                                                             │
│  In-memory Cache (module-level)                             │
│  ┌─────────────────────────────┐                            │
│  │  Translation Cache           │                            │
│  │  (useClientTranslation)      │                            │
│  │  - map: (lng+ns) → {t,time} │                            │
│  │  - 2-min TTL                │                            │
│  └─────────────────────────────┘                            │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│  TanStack React Query (server state)                         │
│  - Posts, comments, likes, follows, leaderboard             │
│  - Admin: users, posts, games, scores, config, theme, i18n  │
│  - Query invalidation on mutations                           │
│  - Optimistic updates: likes, follows                        │
└─────────────────────────────────────────────────────────────┘
```

---

## 11. AUTH FLOW

```
SIGN UP
  RegisterPage
  → useAuth().signUp(email, password, displayName)
  → Supabase.auth.signUp()  →  email confirmation sent
  → User confirms  →  Supabase trigger creates profiles row
  → User redirected to login

SIGN IN
  LoginPage
  → useAuth().signIn(email, password)
  → Supabase.auth.signInWithPassword()
  → AuthProvider.onAuthStateChange fires
  → fetch profile from profiles table
  → localStorage["session_login_time"] = Date.now()
  → redirect to home

API AUTH (every protected endpoint)
  client: adminFetch() adds Authorization: Bearer <token>
  server: requireAuth(req)  →  Supabase.auth.getUser(token)
        → returns { user, profile } or NextResponse 401

SESSION EXPIRY
  AuthProvider 1-min interval:
    if (Date.now() - session_login_time > 3h) → handleSessionExpired()
  OR: onAuthStateChange fires TOKEN_REFRESH_FAILED
    → signOut() + clear localStorage + redirect /login?expired=1

ADMIN CHECK
  requireAdmin(req):
    requireAuth()  →  check profile.role === "admin"
    → 403 Forbidden if not admin

  Client: AdminRoute → AdminCheck component
    → if profile.role !== "admin" → redirect to /[lng]

BAN ENFORCEMENT
  ProtectedRoute checks profile.is_banned
  → shows "Account Banned" if true
```

---

## 12. MAP PATCH FORMAT

When a feature is added or modified, output a patch like this so the map can be updated:

```
## MAP PATCH — [feature name] — [date]

### New routes
- GET /api/foo → lib/auth.ts:requireAuth → supabase.from("foo")

### New components
- components/blog/FooBar.tsx — FooBar — brief purpose

### New hooks
- hooks/blog/useFoo.ts — useFoo() → GET /api/foo

### New types
- hooks/blog/useFoo.ts — Foo: { id, name, ... }

### Updated call graph
app/[lng]/foo/page.tsx → useFoo() → FooBar
```
