# Translation CMS — Feature Plan & Progress

> Branch: `feat/change_design`
> Date: 2026-03-23
> Status: 🚧 In Progress

---

## Goal

Admin UI to manage all i18n translation strings stored in the `translations` Supabase table.

---

## Feature Checklist

### Core Behaviour
- [x] Plan & tracking file created (this file)
- [ ] `translation_defaults` table to snapshot EN/VI seed values (for revert)
- [ ] CRUD API at `/api/admin/translations`
- [ ] Revert API at `/api/admin/translations/revert`
- [ ] React Query hook `useAdminTranslations`
- [ ] CMS page at `app/[lng]/admin/translations/page.tsx`
- [ ] Admin sidebar nav link added

### Language Rules
- EN (`en`) and VI (`vi`) are **protected** — cannot be deleted as a language
- Any custom language (e.g. `fr`, `ja`) can be added and deleted
- All languages can have their text edited at any time
- EN/VI values can be **reverted** to either of two saved milestones (see below)

### Revert Milestones (2 versions)
| Snapshot | Who sets it | Mutable? | Description |
|----------|-------------|----------|-------------|
| `v1`     | Code migration only | ❌ Frozen forever | Original seed values — can only change via a new migration |
| `saved`  | Admin via "Save as default" button | ✅ Admin can overwrite | Admin-curated snapshot; overwritten whenever admin clicks "Save as default" |

When reverting, admin sees a dialog:
- **Revert to v1** — restore the original hardcoded values
- **Revert to saved** — restore the admin's last saved snapshot (if one exists)

Revert scope options: single key, entire namespace, or entire language.

### UI Features
- Namespace tabs (All · common · homepage · blog · blog_post · profile · auth · footer · games · admin · audiochat)
- Search / filter by key name
- Table view: Key | EN | VI | [extra languages…] | **Page** | **Preview** | Actions
- Inline editing of any cell (click → textarea → Save/Esc)
- Revert ↺ button per EN/VI cell (restores from defaults table)
- Delete 🗑 button per row (removes key across all languages)
- Add Key button → dialog (namespace, key, EN value required, VI value required, extra languages optional)
- Add Language button → dialog (language code) — creates column; admin fills cells
- Delete language × header button (only for non-EN/VI languages)

### Page Column
Maps namespace → where it renders on the site:

| Namespace         | Page(s)                         | Area            |
|-------------------|---------------------------------|-----------------|
| common            | All pages                       | Navigation bar  |
| homepage          | / (Home)                        | Hero section    |
| homepage_features | / (Home)                        | Features section|
| footer            | All pages                       | Footer          |
| blog              | /blog                           | Blog listing    |
| blog_post         | /blog/[slug]                    | Blog post       |
| profile           | /profile                        | User profile    |
| auth              | /login · /register              | Auth forms      |
| admin             | /admin/*                        | Admin panel     |
| games             | /games                          | Games page      |
| audiochat         | /audiochat                      | Audio chat      |

### Mini Preview (best-effort)
Small inline CSS sketch (~220×90px) showing where the text appears on the page.
Opens in a modal. Implemented for common, homepage, blog, footer, auth, profile namespaces.

---

## Files

| File | Status | Description |
|------|--------|-------------|
| `TRANSLATION_CMS_PLAN.md` | ✅ Done | This file |
| `supabase/migrations/20260323000001_translation_defaults.sql` | ✅ Done | Defaults table + v1 snapshot from current EN/VI data |
| `app/api/admin/translations/route.ts` | ✅ Done | GET / POST / PATCH / DELETE |
| `app/api/admin/translations/revert/route.ts` | ✅ Done | POST revert to v1 or saved snapshot |
| `app/api/admin/translations/save-default/route.ts` | ✅ Done | POST save current values as saved snapshot |
| `hooks/admin/useAdminTranslations.ts` | ✅ Done | React Query hooks (all mutations) |
| `app/[lng]/admin/translations/page.tsx` | ✅ Done | Main CMS page with table, preview, revert |
| `app/[lng]/admin/layout.tsx` | ✅ Done | Added 🌐 Translations nav link |
| `app/admin/layout.tsx` | ✅ Done | Added 🌐 Translations nav link |

---

## API Design

### GET /api/admin/translations
Returns all translations (optionally filtered by `?namespace=X`).
```json
{
  "data": [{ "id": "...", "language": "en", "namespace": "common", "key": "navigation.home", "value": "Home", "updated_at": "..." }],
  "languages": ["en", "vi"],
  "namespaces": ["common", "homepage", ...]
}
```

### POST /api/admin/translations
Create a new key across multiple languages.
```json
{ "namespace": "blog", "key": "new.key", "values": { "en": "Hello", "vi": "Xin chào" } }
```

### PATCH /api/admin/translations
Update a single cell value.
```json
{ "language": "en", "namespace": "blog", "key": "title", "value": "New Value" }
```

### DELETE /api/admin/translations
- Delete a key across all languages: `?namespace=blog&key=title`
- Delete a language: `?language=fr` (blocked for en/vi)

### POST /api/admin/translations/revert
Revert EN or VI values to a chosen milestone.
```json
{ "snapshot": "v1",    "language": "en", "namespace": "blog", "key": "title" }  // single key
{ "snapshot": "saved", "language": "en", "namespace": "blog" }                  // whole namespace
{ "snapshot": "v1",    "language": "en" }                                       // all keys for language
```

### POST /api/admin/translations/save-default
Save current translation values as the `saved` snapshot.
```json
{ "language": "en", "namespace": "blog" }  // save namespace
{ "language": "en" }                       // save all for language
```

---

## Implementation Steps (in order)

1. **Migration** — create `translation_defaults`, snapshot current EN/VI values
2. **API** — CRUD route + revert route
3. **Hook** — React Query with pivoted data shape
4. **Page** — UI following color CMS pattern
5. **Nav** — update both admin layouts

---

## Progress Log

- 2026-03-23 — Plan file created, codebase explored
- 2026-03-23 — All files implemented. Migration, 3 API routes, hook, CMS page, nav links done.
  - Revert system updated: 2 milestones (v1 frozen + saved snapshot admin can overwrite)
  - Mini preview sketches for: nav, hero, footer, auth, profile, blog namespaces
  - Page column shows which route each namespace renders on
