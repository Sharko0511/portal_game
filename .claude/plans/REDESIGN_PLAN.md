# Game Portal — Redesign & i18n Implementation Plan

## Overview

This document outlines the full implementation plan for:
1. Migrating to a new design (based on The Good Learning)
2. Adding DB-driven internationalization (EN/VI)
3. Making blog the primary feature, games secondary
4. Adding an admin translation management dashboard

---

## Phase 1 — DB-driven i18n Infrastructure

### Goal
Store all UI translations in Supabase. The app fetches them at runtime. Admins can edit them live via the dashboard.

### Step 1.1 — DB Migration

Create the `translations` table:

```sql
create table translations (
  id          uuid primary key default gen_random_uuid(),
  language    text not null,
  namespace   text not null,
  key         text not null,
  value       text not null,
  updated_at  timestamptz default now(),
  unique(language, namespace, key)
);

alter table translations enable row level security;

-- Public read (app needs to fetch translations without auth)
create policy "Translations are publicly readable"
  on translations for select
  using (true);

-- Only admins can modify
create policy "Admins can manage translations"
  on translations for all to authenticated
  using (
    exists (
      select 1 from profiles
      where id = auth.uid() and role = 'admin'
    )
  );

create index idx_translations_lookup on translations(language, namespace);
```

**Test cases:**
- [ ] Anonymous user can SELECT from translations
- [ ] Anonymous user cannot INSERT/UPDATE/DELETE
- [ ] Admin user can INSERT, UPDATE, DELETE
- [ ] Regular user cannot INSERT/UPDATE/DELETE
- [ ] Unique constraint prevents duplicate (language, namespace, key)

---

### Step 1.2 — Seed Data (initial translations)

Create a seed script `scripts/seed-translations.ts` that inserts default EN and VI translations.

**Namespaces:**
| Namespace | Used in |
|---|---|
| `common` | Navbar, shared UI |
| `homepage` | Hero section |
| `homepage_features` | Feature blocks |
| `footer` | Footer |
| `blog` | Blog pages |
| `profile` | Profile page |
| `auth` | Login, register |
| `admin` | Admin dashboard |
| `games` | Games section |

**Test cases:**
- [ ] Seed script runs without errors
- [ ] All namespaces exist for both `en` and `vi`
- [ ] `en` and `vi` have the same set of keys per namespace
- [ ] No duplicate keys after seeding

---

### Step 1.3 — API Route: Fetch Translations

**Route:** `GET /api/i18n/[lng]/[ns]`

- Returns all key-value pairs for a given language + namespace
- Public endpoint (no auth required)
- Returns `{ data: { key: value, ... } }`

**Test cases:**
- [ ] `GET /api/i18n/en/common` returns English common translations
- [ ] `GET /api/i18n/vi/common` returns Vietnamese common translations
- [ ] `GET /api/i18n/en/nonexistent` returns `{ data: {} }` (empty, no 500)
- [ ] `GET /api/i18n/xx/common` (unsupported language) returns `{ data: {} }`
- [ ] Response is flat key-value: `{ "navigation.home": "Home" }`

---

### Step 1.4 — `useClientTranslation` Hook

Replace JSON file imports with API fetch.

```ts
// hooks/useClientTranslation.ts
// Fetches from /api/i18n/[lng]/[ns]
// Caches result in module-level Map to avoid re-fetching
// Falls back to key string if translation missing
```

**Behavior:**
- On mount, fetches translations for `(lng, ns)` pair
- Caches per `(lng, ns)` so navigating back doesn't re-fetch
- `t("navigation.home")` supports dot-notation for nested keys
- Returns `key` as fallback if translation not found

**Test cases:**
- [ ] `t("navigation.home")` returns correct string for `en`
- [ ] `t("navigation.home")` returns correct string for `vi`
- [ ] Switching language re-fetches with new `lng`
- [ ] If API fails, returns the key as fallback (no crash)
- [ ] Same namespace only fetched once per language (cache works)
- [ ] `isLoading` is `true` during fetch, `false` after

---

### Step 1.5 — Server-side `getTranslation`

For server components and API routes:

```ts
// lib/i18n.ts
export async function getTranslation(lng: string, ns: string)
// Queries Supabase directly (no HTTP round-trip)
```

**Test cases:**
- [ ] Returns correct translations for valid `(lng, ns)`
- [ ] Returns empty object for unknown namespace (no error)

---

## Phase 2 — Route Restructure

### Goal
Wrap all pages under `app/[lng]/` so URLs become `/en/blog`, `/vi/profile` etc.

### Step 2.1 — Middleware

`middleware.ts` — detects user language from:
1. Cookie `i18next`
2. `Accept-Language` header
3. Fallback to `en`

Redirects `/blog` → `/en/blog` automatically.
API routes (`/api/*`) are excluded from language redirect.

**Test cases:**
- [ ] `/` redirects to `/en/` (or `/vi/` if browser is Vietnamese)
- [ ] `/blog` redirects to `/en/blog`
- [ ] `/api/blog/posts` is NOT redirected (no lang prefix)
- [ ] Setting cookie `i18next=vi` makes `/` redirect to `/vi/`
- [ ] Already on `/en/blog` — no redirect loop

---

### Step 2.2 — Move Pages

| Before | After |
|---|---|
| `app/page.tsx` | `app/[lng]/page.tsx` |
| `app/blog/page.tsx` | `app/[lng]/blog/page.tsx` |
| `app/blog/[id]/page.tsx` | `app/[lng]/blog/[id]/page.tsx` |
| `app/blog/new/page.tsx` | `app/[lng]/blog/new/page.tsx` |
| `app/blog/[id]/edit/page.tsx` | `app/[lng]/blog/[id]/edit/page.tsx` |
| `app/profile/page.tsx` | `app/[lng]/profile/page.tsx` |
| `app/login/page.tsx` | `app/[lng]/login/page.tsx` |
| `app/register/page.tsx` | `app/[lng]/register/page.tsx` |
| `app/leaderboard/page.tsx` | `app/[lng]/leaderboard/page.tsx` |
| `app/users/[id]/page.tsx` | `app/[lng]/users/[id]/page.tsx` |
| `app/games/*/page.tsx` | `app/[lng]/games/*/page.tsx` |
| `app/admin/*/page.tsx` | `app/[lng]/admin/*/page.tsx` |

API routes stay as-is under `app/api/`.

**Test cases:**
- [ ] `/en/blog` loads the blog page
- [ ] `/vi/blog` loads the blog page in Vietnamese
- [ ] `/en/blog/[id]` loads a post
- [ ] `/en/profile` loads profile (protected)
- [ ] `/en/login` loads login page
- [ ] All internal `Link href` values use `/${lng}/...` pattern
- [ ] `useParams()` correctly extracts `lng` in each page

---

### Step 2.3 — Layout

`app/[lng]/layout.tsx` — wraps all pages with:
- `Navbar` (with language switcher)
- `Footer`
- Passes `lng` down via props/context

**Test cases:**
- [ ] Navbar renders on all `[lng]` pages
- [ ] Footer renders on all `[lng]` pages
- [ ] Language switcher changes `lng` in URL and updates cookie

---

## Phase 3 — New Design

### Goal
Apply The Good Learning design system. Make blog the primary feature.

**Color palette:**
```
Lime green:   #a4c639  (primary CTA, hero bg)
Dark green:   #317F5F  (buttons, accents)
Deep green:   #1b5e20  (footer bg)
Dark text:    #262626
Light gray:   #8C9199
```

---

### Step 3.1 — Tailwind Config

Add custom colors to `tailwind.config`:
```js
colors: {
  green: '#317F5F',
  'green-light': '#a4c639',
  'green-deep': '#1b5e20',
}
```

**Test cases:**
- [ ] `bg-green-light` applies `#a4c639`
- [ ] `text-green` applies `#317F5F`
- [ ] `bg-green-deep` applies `#1b5e20`

---

### Step 3.2 — Navbar Component

Replace current navbar with new design.

**Features:**
- Logo: "Game Portal." with green dot
- Nav links: **Blog** (primary), Games (secondary), Leaderboard
- Search bar (desktop only)
- Language switcher (EN / VI toggle)
- Auth: Login button or user dropdown
- Mobile: hamburger menu

**Test cases:**
- [ ] Logo links to `/${lng}/`
- [ ] Blog link is visually prominent (first/bold)
- [ ] Games link is present but visually secondary
- [ ] Language switcher switches between `/en/` and `/vi/`
- [ ] Mobile menu opens/closes on hamburger click
- [ ] Auth dropdown shows user display name when logged in
- [ ] Logout works from dropdown
- [ ] Active link is highlighted

---

### Step 3.3 — Hero Section (Homepage)

Lime green background, big bold title, image right, CTA button.

**Content:**
- Title: translatable via `homepage.hero.title`
- Description: translatable via `homepage.hero.description`
- CTA button: links to `/[lng]/blog`
- Image: right side on desktop, above description on mobile

**Test cases:**
- [ ] Hero renders with lime green background
- [ ] Title and description render in correct language
- [ ] CTA button navigates to blog page
- [ ] Responsive: image stacks on mobile
- [ ] Translation loads correctly for both EN and VI

---

### Step 3.4 — Features Section (Homepage)

Two feature blocks: **Blog** and **Games**.

| Block | Title key | Link |
|---|---|---|
| Blog | `homepage_features.blog.title` | `/${lng}/blog` |
| Games | `homepage_features.games.title` | `/${lng}/games` |

Blog block is visually larger/more prominent than Games.

**Test cases:**
- [ ] Two feature blocks render
- [ ] Blog block appears first and is larger
- [ ] Both buttons navigate to correct pages
- [ ] Text renders in correct language

---

### Step 3.5 — Footer Component

Dark green background, brand name, about text, nav links, social icons.

**Test cases:**
- [ ] Footer renders on all pages
- [ ] Nav links use correct `/${lng}/` prefix
- [ ] Copyright text renders

---

### Step 3.6 — Blog Page Redesign

Blog becomes the main content page. Layout matches The Good Learning news page:
- Posts grouped or filtered by category/level (if applicable)
- Post card: cover image, title, author, date, read more
- Sidebar or filter panel

**Test cases:**
- [ ] Blog page loads and shows posts
- [ ] Post cards show cover image, title, author, date
- [ ] "New Post" button visible for logged-in users
- [ ] Posts are translated labels (e.g. "Read more" in VI = "Xem thêm")

---

## Phase 4 — Admin Translation Dashboard

### Goal
Admins can view and edit all translations live without touching code or redeploying.

### Step 4.1 — Admin Translations Page

Route: `app/[lng]/admin/translations/page.tsx`

**UI:**
- Language selector: EN | VI tabs
- Namespace selector: dropdown or tab (common, homepage, blog, etc.)
- Table: `key` column (read-only) | `value` column (editable input)
- Save button per row (or auto-save on blur)
- Search/filter keys

**Test cases:**
- [ ] Page only accessible to admins (redirects others)
- [ ] Language tabs switch between EN and VI translations
- [ ] Namespace dropdown filters the table
- [ ] All keys for selected namespace are shown
- [ ] Editing a value and saving updates Supabase
- [ ] After save, the live site reflects the new translation (no redeploy needed)
- [ ] Search filters keys in real time
- [ ] Empty/blank value is rejected (validation)

---

### Step 4.2 — API: Update Translation

**Route:** `PUT /api/admin/i18n`

Body: `{ language, namespace, key, value }`

- Requires admin auth
- Upserts the translation in Supabase

**Test cases:**
- [ ] Admin can update a translation successfully
- [ ] Non-admin gets 403
- [ ] Unauthenticated gets 401
- [ ] Missing required fields returns 400
- [ ] Empty `value` returns 400
- [ ] Updated value is immediately returned by `GET /api/i18n/[lng]/[ns]`

---

### Step 4.3 — Translation Cache Invalidation

When admin updates a translation, the client cache should refresh.

- Client cache is module-level `Map<string, Record>`
- On update, the cached entry for `(lng, ns)` is deleted
- Next call to `useClientTranslation` re-fetches

**Test cases:**
- [ ] After admin saves a change, refreshing the page shows new translation
- [ ] Other users see updated translation after their next page load

---

## Phase 5 — Games as Sub-feature

### Changes
- Games removed from main nav (moved to sub-menu or secondary nav item)
- Homepage features section: Games block is smaller than Blog block
- Leaderboard stays in nav but at lower priority

**Test cases:**
- [ ] Games are still accessible via `/[lng]/games/...`
- [ ] Games do not appear as primary nav item
- [ ] Leaderboard is accessible

---

## Implementation Order

```
Phase 1.1  DB migration (translations table)
Phase 1.2  Seed script (initial EN + VI data)
Phase 1.3  GET /api/i18n/[lng]/[ns] route
Phase 1.4  useClientTranslation hook
Phase 1.5  Server-side getTranslation
Phase 2.1  Middleware
Phase 2.2  Move pages to [lng] routes
Phase 2.3  [lng] layout with Navbar + Footer
Phase 3.1  Tailwind colors
Phase 3.2  Navbar component
Phase 3.3  Hero section
Phase 3.4  Features section
Phase 3.5  Footer component
Phase 3.6  Blog page redesign
Phase 4.1  Admin translations page
Phase 4.2  PUT /api/admin/i18n
Phase 4.3  Cache invalidation
Phase 5    Games as sub-feature
```

---

## Notes

- API routes (`/api/*`) are never wrapped in `[lng]` — language is irrelevant for backend
- The `telegram_chat_id` linking flow works the same after restructure
- Existing Supabase auth and RLS policies are unchanged
- All existing blog, follow, like, comment features carry over unchanged
- Mobile-first responsive design throughout
