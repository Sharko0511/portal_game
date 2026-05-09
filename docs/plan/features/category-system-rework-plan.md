# Category System Rework Plan

## 1. Objective

Build a flexible category system for articles with these requirements:

- Homepage/category section loads posts by hot categories.
- Admin can create/edit category and mark category as hot.
- One post can belong to multiple categories.
- Keep current blog features stable during migration.

## 2. Current State (Audit Summary)

Current implementation is fixed single-category:

- `posts.category` stores one value only.
- Allowed values are hardcoded (`blog`, `baohay`) in API and UI.
- Many screens use category as a route segment assumption.
- No category management module for admin.
- No hot-category metadata in DB.

## 3. Target Architecture

### 3.1 Data model

Create normalized category model:

- `categories`
  - `id uuid pk`
  - `slug text unique not null`
  - `name text not null`
  - `description text null`
  - `is_hot boolean not null default false`
  - `is_active boolean not null default true`
  - `sort_order int not null default 0`
  - `created_at timestamptz not null default now()`
  - `updated_at timestamptz not null default now()`

- `post_categories`
  - `post_id uuid not null references posts(id) on delete cascade`
  - `category_id uuid not null references categories(id) on delete cascade`
  - `created_at timestamptz not null default now()`
  - `primary key (post_id, category_id)`

Optional compatibility field:

- `posts.primary_category_id uuid null references categories(id)`

### 3.2 Query behavior

- Post detail returns `categories: Category[]`.
- Search/filter by categories uses join (`post_categories`).
- Hot section reads categories where `is_hot = true`, then loads posts per category.

### 3.3 Route strategy

Avoid using raw category value as top-level route for dynamic admin-defined categories.

Recommended:

- Category listing route: `/{lng}/c/{categorySlug}`
- Keep existing pages `/{lng}/blog` and `/{lng}/baohay` temporarily as aliases.

## 4. Phased Rollout Plan

## Phase 0 - Preparation

- Freeze category-related feature changes.
- Add feature flag `CATEGORY_V2_ENABLED`.
- Add integration test checklist for feed/search/admin/new-post/detail pages.

Deliverables:

- Feature flag wiring.
- Baseline test checklist.

## Phase 1 - Database Migration (Non-breaking)

### 1. Add new tables

- Create `categories` and `post_categories`.
- Add indexes:
  - `idx_categories_hot_active (is_hot, is_active, sort_order)`
  - `idx_post_categories_category (category_id)`
  - `idx_post_categories_post (post_id)`

### 2. Seed initial categories

- Seed `blog`, `baohay` into `categories`.
- Mark hot categories by current business rules.

### 3. Backfill mapping

- For every existing post, map old `posts.category` to `post_categories` row.
- Set `posts.primary_category_id` (if using compatibility field).

### 4. Keep old column for compatibility

- Do not remove `posts.category` in this phase.
- Continue reads/writes from old field until APIs are switched.

Deliverables:

- Migration SQL files.
- Backfill script and verification queries.

## Phase 2 - API v2 (Dual-read, Dual-write)

### 1. Category admin APIs

- `GET /api/admin/categories`
- `POST /api/admin/categories`
- `PATCH /api/admin/categories/[id]`
- `DELETE /api/admin/categories/[id]` (soft-disable preferred via `is_active=false`)
- `PATCH /api/admin/categories/[id]/hot`

### 2. Post APIs

- `POST /api/blog/posts`
  - Accept `categoryIds: string[]`.
  - For compatibility, still accept old `category` and map to one categoryId.
- `PATCH /api/blog/posts/[id]`
  - Update category mapping in `post_categories`.
- `GET /api/blog/posts/by-slug/[slug]`
  - Return categories array.

### 3. Search APIs

- Update search endpoint to support:
  - `category=slug` (single)
  - `categories=slug1,slug2` (multi)
  - filtering mode (`any`/`all`) if needed.

### 4. Home/hot APIs

- New endpoint for hot category sections:
  - `GET /api/site/hot-categories-with-posts?limitPerCategory=...`

Deliverables:

- All APIs available in compatibility mode.
- Contract docs for frontend.

## Phase 3 - Frontend Refactor

### 1. Type updates

- Replace `PostCategory = "blog" | "baohay"` with:
  - `Category { id, slug, name, is_hot, ... }`
  - `Post.categories: Category[]`

### 2. Admin post form

- Replace single select category with multi-select categories.
- Load options from category API.
- Add default selection rules (at least 1 category).

### 3. Admin category management UI

- Category list table with:
  - name, slug, active/hot status, sort order.
- Create/edit dialog.
- Quick toggle for hot/active.

### 4. Homepage and listing sections

- Replace hardcoded category blocks with hot category data.
- Render per-category section using dynamic labels.

### 5. Post detail/breadcrumb

- Breadcrumb uses primary category or first category.
- Category badges show multiple categories.

Deliverables:

- UI working with API v2 while old pages still functional.

## Phase 4 - Route and Compatibility Cleanup

### 1. Stable routes

- Introduce dynamic category route `/{lng}/c/[slug]`.
- Keep `/{lng}/baohay` and `/{lng}/blog` as aliases/redirects.

### 2. Remove legacy assumptions

- Remove hardcoded category options in admin and filters.
- Remove API branches that assume only two values.

### 3. Optional DB cleanup

- Drop `posts.category` after all code paths migrated.
- Keep `primary_category_id` if useful for ordering and breadcrumb.

Deliverables:

- Legacy cleanup PR.
- Final migration SQL.

## 5. Impact Matrix

## High impact

- DB schema (`posts.category` model changes).
- APIs filtering by `eq("category", ...)`.
- Admin form and validation.

## Medium impact

- Detail page breadcrumb that uses `/${lng}/${post.category}`.
- Category labels and icon mapping.
- Search/filter query params.

## Low impact

- Like/comment/follow systems (category-agnostic).
- Slug and SEO metadata flow (mostly unchanged).

## 6. Risk and Mitigation

- Risk: Breaking existing pages during migration.
  - Mitigation: dual-read/dual-write phases + feature flag.

- Risk: Data mismatch between legacy column and join table.
  - Mitigation: one-time backfill + reconciliation script + temporary sync.

- Risk: Unknown route behavior for custom categories.
  - Mitigation: introduce explicit `/{lng}/c/[slug]` route before opening admin category create.

## 7. Testing Plan

### 7.1 Data tests

- Backfill completeness:
  - every post has at least one row in `post_categories`.
- No duplicate links in join table.
- Hot category query returns only active categories.

### 7.2 API tests

- Create post with one category and multiple categories.
- Edit post category assignments.
- Search by one and many categories.
- Admin hot toggle and category CRUD.

### 7.3 UI tests

- Admin can create category and mark hot.
- New post form supports multi-select.
- Home hot sections render correctly.
- Existing `/blog` and `/baohay` still work in compatibility phase.

## 8. Suggested PR Breakdown

1. PR-1: DB tables + seed + backfill + compatibility tests.
2. PR-2: Admin category APIs + public hot-category API.
3. PR-3: Post/search API dual-write and dual-read.
4. PR-4: Admin category UI + post form multi-select.
5. PR-5: Home/list/detail UI refactor to new category model.
6. PR-6: Route aliases + cleanup legacy category column.

## 9. Definition of Done

- Admin can fully manage categories and hot flags.
- Post supports many categories.
- Homepage sections are data-driven by hot categories.
- Existing content still accessible without broken links.
- Legacy hardcoded category assumptions removed.
