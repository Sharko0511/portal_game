# Step 2 - API: Route Handlers & Middleware

## Status: ✅ Completed
## Depends on: Step 1 (Backend)
## Relates to: US-05, US-06, US-07, US-08, US-09, US-10

---

## Overview
Create Next.js API Route Handlers for admin operations and server-side auth helpers. Client-side auth (login/register/logout) uses Supabase JS directly — no custom API needed.

---

## 2.1 Supabase Server Client

### File: `lib/supabase-server.js`
Server-side Supabase client using the **service role key** for admin operations that bypass RLS.

```javascript
import { createClient } from "@supabase/supabase-js";

export function getSupabaseAdmin() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SECRET_KEY
  );
}
```

**Important:** This client has full database access. Only use in API routes, never expose to the browser.

### File: `lib/supabase.js` (update existing)
Add method to create authenticated client from request headers.

```javascript
export function getSupabaseWithAuth(accessToken) {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    { global: { headers: { Authorization: `Bearer ${accessToken}` } } }
  );
}
```

---

## 2.2 Auth Middleware

### File: `lib/auth.js`

**`getUser(request)`** — Extract and verify the user from the Authorization header.

```
Input:  NextRequest
Output: { user, profile } | null

Steps:
1. Read `Authorization` header → extract Bearer token
2. Call supabase.auth.getUser(token) → get user object
3. Query profiles table for user.id → get role, is_banned
4. Return { user, profile } or null if invalid
```

**`requireAuth(request)`** — Middleware wrapper. Returns 401 if no valid session.

```
Input:  NextRequest
Output: { user, profile } or NextResponse(401)
```

**`requireAdmin(request)`** — Middleware wrapper. Returns 401/403 if not admin.

```
Input:  NextRequest
Output: { user, profile } or NextResponse(401/403)

Steps:
1. Call requireAuth(request)
2. Check profile.role === 'admin'
3. Return 403 if not admin
```

---

## 2.3 API Route Definitions

### Admin - User Management

#### `GET /api/admin/users`
List all users with profiles.

```
Auth:     requireAdmin
Query:    ?search=<string>&role=<user|admin>&banned=<true|false>&page=<number>&limit=<number>
Response: {
  data: [{ id, display_name, email, role, is_banned, created_at, score_count }],
  total: number,
  page: number,
  limit: number
}
```

**Implementation details:**
- Use service role client to query `profiles` table
- Join with `scores` to get `count(scores.id) as score_count`
- Apply search filter on `display_name` or `email` using `ilike`
- Pagination via `.range(offset, offset + limit - 1)`

---

#### `PATCH /api/admin/users/[id]/ban`
Toggle user ban status.

```
Auth:     requireAdmin
Body:     { is_banned: boolean }
Response: { id, display_name, is_banned }

Validation:
- Cannot ban yourself (compare id with auth.uid())
- Target user must exist
```

---

#### `PATCH /api/admin/users/[id]/role`
Change user role.

```
Auth:     requireAdmin
Body:     { role: "user" | "admin" }
Response: { id, display_name, role }

Validation:
- Cannot change own role
- role must be 'user' or 'admin'
- Target user must exist
```

---

#### `DELETE /api/admin/users/[id]`
Delete a user and all their data.

```
Auth:     requireAdmin
Response: { success: true }

Validation:
- Cannot delete yourself
- Target user must exist

Implementation:
- Delete from auth.users using admin client (cascade deletes profile + scores)
```

---

### Admin - Score Management

#### `GET /api/admin/scores`
List scores with filters.

```
Auth:     requireAdmin
Query:    ?game=<string>&player=<string>&sort=<score|created_at>&order=<asc|desc>&page=<number>&limit=<number>
Response: {
  data: [{ id, player_name, game, score, created_at, user_id, user_email }],
  total: number
}
```

---

#### `DELETE /api/admin/scores/[id]`
Delete a specific score.

```
Auth:     requireAdmin
Response: { success: true }

Validation:
- Score must exist
```

---

#### `POST /api/admin/scores/reset`
Delete all scores for a specific game.

```
Auth:     requireAdmin
Body:     { game: "snake" | "pong" | "breakout" }
Response: { success: true, deleted_count: number }

Validation:
- game must be a valid game id
```

---

### Admin - Game Config

#### `GET /api/admin/games`
List all game configurations.

```
Auth:     requireAdmin
Response: { data: [{ id, display_name, icon, enabled, config, updated_at }] }
```

---

#### `PATCH /api/admin/games/[id]`
Update a game's configuration.

```
Auth:     requireAdmin
Body:     { enabled?: boolean, config?: object }
Response: { id, display_name, enabled, config, updated_at }

Validation:
- Game id must exist in game_config table
- If config provided, validate it has expected keys for that game
- Sets updated_by to current admin user id
```

---

### Admin - Site Config

#### `GET /api/admin/config`
Get all site configuration.

```
Auth:     requireAdmin
Response: { data: [{ key, value, description, updated_at }] }
```

---

#### `PATCH /api/admin/config`
Update site configuration values.

```
Auth:     requireAdmin
Body:     { key: string, value: any }
Response: { key, value, updated_at }

Validation:
- key must exist in site_config table
- value type must match expected type for that key
```

---

### Admin - Dashboard Stats

#### `GET /api/admin/stats`
Get platform statistics for admin dashboard.

```
Auth:     requireAdmin
Response: {
  total_users: number,
  total_scores: number,
  scores_today: number,
  most_popular_game: { game: string, count: number },
  top_players: [{ display_name: string, total_score: number }],
  recent_scores: [{ player_name, game, score, created_at }]
}
```

**Implementation:**
- `total_users`: count from profiles
- `total_scores`: count from scores
- `scores_today`: count from scores where `created_at >= today midnight`
- `most_popular_game`: group by game, order by count desc, limit 1
- `top_players`: join scores + profiles, group by user_id, sum(score), limit 5
- `recent_scores`: order by created_at desc, limit 10

---

### Public - Game Config (for frontend)

#### `GET /api/games/config`
Get enabled games with their config (public, no auth needed).

```
Auth:     none
Response: { data: [{ id, display_name, description, icon, config }] }

Filter: only where enabled = true
```

---

## 2.4 Error Response Format

All API errors follow a consistent format:

```json
{
  "error": {
    "code": "UNAUTHORIZED",
    "message": "You must be logged in to perform this action"
  }
}
```

| HTTP Status | Code | When |
|-------------|------|------|
| 400 | `BAD_REQUEST` | Invalid body, missing fields |
| 401 | `UNAUTHORIZED` | No token or expired token |
| 403 | `FORBIDDEN` | Not admin, or banned |
| 404 | `NOT_FOUND` | Resource doesn't exist |
| 409 | `CONFLICT` | Cannot perform on self |
| 500 | `INTERNAL_ERROR` | Server error |

---

## 2.5 File Structure

```
app/api/
├── admin/
│   ├── users/
│   │   ├── route.js                    GET /api/admin/users
│   │   └── [id]/
│   │       ├── route.js                DELETE /api/admin/users/:id
│   │       ├── ban/
│   │       │   └── route.js            PATCH /api/admin/users/:id/ban
│   │       └── role/
│   │           └── route.js            PATCH /api/admin/users/:id/role
│   ├── scores/
│   │   ├── route.js                    GET /api/admin/scores
│   │   ├── [id]/
│   │   │   └── route.js                DELETE /api/admin/scores/:id
│   │   └── reset/
│   │       └── route.js                POST /api/admin/scores/reset
│   ├── games/
│   │   ├── route.js                    GET /api/admin/games
│   │   └── [id]/
│   │       └── route.js                PATCH /api/admin/games/:id
│   ├── config/
│   │   └── route.js                    GET, PATCH /api/admin/config
│   └── stats/
│       └── route.js                    GET /api/admin/stats
└── games/
    └── config/
        └── route.js                    GET /api/games/config (public)
```

---

## Tasks

| # | Task | Status | Notes |
|---|------|--------|-------|
| 1 | Create `lib/supabase-server.js` | ⬜ | Service role client |
| 2 | Update `lib/supabase.js` with `getSupabaseWithAuth()` | ⬜ | |
| 3 | Create `lib/auth.js` with `getUser`, `requireAuth`, `requireAdmin` | ⬜ | |
| 4 | Implement `GET /api/admin/users` | ⬜ | With search, filter, pagination |
| 5 | Implement `PATCH /api/admin/users/[id]/ban` | ⬜ | Self-check validation |
| 6 | Implement `PATCH /api/admin/users/[id]/role` | ⬜ | Self-check validation |
| 7 | Implement `DELETE /api/admin/users/[id]` | ⬜ | Cascade delete via auth |
| 8 | Implement `GET /api/admin/scores` | ⬜ | With filters + pagination |
| 9 | Implement `DELETE /api/admin/scores/[id]` | ⬜ | |
| 10 | Implement `POST /api/admin/scores/reset` | ⬜ | Game validation |
| 11 | Implement `GET /api/admin/games` | ⬜ | |
| 12 | Implement `PATCH /api/admin/games/[id]` | ⬜ | Config validation |
| 13 | Implement `GET /api/admin/config` | ⬜ | |
| 14 | Implement `PATCH /api/admin/config` | ⬜ | Key/type validation |
| 15 | Implement `GET /api/admin/stats` | ⬜ | All dashboard queries |
| 16 | Implement `GET /api/games/config` (public) | ⬜ | Enabled games only |
| 17 | Add consistent error handling to all routes | ⬜ | |
| 18 | Add `.env.local` entry for `SUPABASE_SECRET_KEY` | ⬜ | Already have it |
