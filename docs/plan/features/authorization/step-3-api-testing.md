# Step 3 - API Testing: Postman Collections

## Status: ⬜ Not Started
## Depends on: Step 2 (API)
## Relates to: All User Stories

---

## Overview
Create Postman collections with chained requests to test every API endpoint. Use environment variables to pass tokens and IDs between requests. Export the collection JSON to the repo for version control.

---

## 3.1 Postman Environment

### File: `tests/postman/game-portal.postman_environment.json`

| Variable | Initial Value | Description |
|----------|--------------|-------------|
| `base_url` | `http://localhost:3000` | App base URL |
| `supabase_url` | `https://eamozesrfwowbdegrfdl.supabase.co` | Supabase project URL |
| `supabase_anon_key` | (from .env.local) | Public anon key |
| `admin_email` | `admin@test.com` | Pre-registered admin email |
| `admin_password` | `testpass123` | Admin password |
| `user_email` | `user@test.com` | Test user email |
| `user_password` | `testpass123` | Test user password |
| `user_token` | (auto-set) | JWT after user login |
| `admin_token` | (auto-set) | JWT after admin login |
| `test_user_id` | (auto-set) | Created user's profile ID |
| `test_score_id` | (auto-set) | Created score's ID |
| `test_score_id_2` | (auto-set) | Second score ID |

---

## 3.2 Collections

### Collection 1: Auth Flow
**File:** `tests/postman/01-auth-flow.postman_collection.json`

| # | Name | Method | URL | Body | Tests (assertions) | Sets Variable |
|---|------|--------|-----|------|---------------------|---------------|
| 1 | Register test user | POST | `{{supabase_url}}/auth/v1/signup` | `{ "email": "{{user_email}}", "password": "{{user_password}}", "data": { "display_name": "TestUser" } }` | Status 200, has `user.id`, has `access_token` | `test_user_id`, `user_token` |
| 2 | Verify profile auto-created | GET | `{{supabase_url}}/rest/v1/profiles?id=eq.{{test_user_id}}` | — | Status 200, array length 1, `display_name` = "TestUser", `role` = "user", `is_banned` = false | — |
| 3 | Login as test user | POST | `{{supabase_url}}/auth/v1/token?grant_type=password` | `{ "email": "{{user_email}}", "password": "{{user_password}}" }` | Status 200, has `access_token` | `user_token` |
| 4 | Login with wrong password | POST | `{{supabase_url}}/auth/v1/token?grant_type=password` | `{ "email": "{{user_email}}", "password": "wrongpass" }` | Status 400 | — |
| 5 | Register admin user | POST | `{{supabase_url}}/auth/v1/signup` | `{ "email": "{{admin_email}}", "password": "{{admin_password}}", "data": { "display_name": "Admin" } }` | Status 200 | `admin_token` |
| 6 | Set admin role (via SQL or service key) | PATCH | `{{supabase_url}}/rest/v1/profiles?id=eq.{{admin_user_id}}` | `{ "role": "admin" }` | Status 200 | — |
| 7 | Login as admin | POST | `{{supabase_url}}/auth/v1/token?grant_type=password` | `{ "email": "{{admin_email}}", "password": "{{admin_password}}" }` | Status 200 | `admin_token` |

**Pre-request script (all requests):**
```javascript
// Set common headers
pm.request.headers.add({ key: "apikey", value: pm.environment.get("supabase_anon_key") });
pm.request.headers.add({ key: "Content-Type", value: "application/json" });
```

---

### Collection 2: User Actions
**File:** `tests/postman/02-user-actions.postman_collection.json`

**Pre-request:** Attach `user_token` as Bearer token.

| # | Name | Method | URL | Body | Tests | Sets Variable |
|---|------|--------|-----|------|-------|---------------|
| 1 | Get own profile | GET | `{{supabase_url}}/rest/v1/profiles?id=eq.{{test_user_id}}&select=*` | — | Status 200, has display_name | — |
| 2 | Update display name | PATCH | `{{supabase_url}}/rest/v1/profiles?id=eq.{{test_user_id}}` | `{ "display_name": "UpdatedName" }` | Status 200 | — |
| 3 | Verify name updated | GET | `{{supabase_url}}/rest/v1/profiles?id=eq.{{test_user_id}}&select=display_name` | — | `display_name` = "UpdatedName" | — |
| 4 | Save score (snake) | POST | `{{supabase_url}}/rest/v1/scores` | `{ "user_id": "{{test_user_id}}", "player_name": "UpdatedName", "score": 150, "game": "snake" }` | Status 201 | `test_score_id` |
| 5 | Save score (pong) | POST | `{{supabase_url}}/rest/v1/scores` | `{ "user_id": "{{test_user_id}}", "player_name": "UpdatedName", "score": 5, "game": "pong" }` | Status 201 | `test_score_id_2` |
| 6 | Get own scores | GET | `{{supabase_url}}/rest/v1/scores?user_id=eq.{{test_user_id}}&select=*` | — | Status 200, array length >= 2 | — |
| 7 | User cannot change own role | PATCH | `{{supabase_url}}/rest/v1/profiles?id=eq.{{test_user_id}}` | `{ "role": "admin" }` | Status 200 but role unchanged (RLS allows update, API layer restricts) | — |
| 8 | User cannot delete others' scores | DELETE | `{{supabase_url}}/rest/v1/scores?id=eq.{{test_score_id}}` | — | Status 204 but 0 rows affected (RLS blocks) | — |

---

### Collection 3: Admin - User Management
**File:** `tests/postman/03-admin-users.postman_collection.json`

**Pre-request:** Attach `admin_token` as Bearer token.

| # | Name | Method | URL | Body | Tests |
|---|------|--------|-----|------|-------|
| 1 | List all users | GET | `{{base_url}}/api/admin/users` | — | Status 200, `data` is array, length >= 2 |
| 2 | Search user by name | GET | `{{base_url}}/api/admin/users?search=Updated` | — | Status 200, results contain "UpdatedName" |
| 3 | Ban test user | PATCH | `{{base_url}}/api/admin/users/{{test_user_id}}/ban` | `{ "is_banned": true }` | Status 200, `is_banned` = true |
| 4 | Banned user cannot save score | POST | `{{supabase_url}}/rest/v1/scores` (with user_token) | `{ "user_id": "...", "player_name": "...", "score": 100, "game": "snake" }` | Status 403 or RLS violation |
| 5 | Unban test user | PATCH | `{{base_url}}/api/admin/users/{{test_user_id}}/ban` | `{ "is_banned": false }` | Status 200, `is_banned` = false |
| 6 | Change role to admin | PATCH | `{{base_url}}/api/admin/users/{{test_user_id}}/role` | `{ "role": "admin" }` | Status 200, `role` = "admin" |
| 7 | Revert role to user | PATCH | `{{base_url}}/api/admin/users/{{test_user_id}}/role` | `{ "role": "user" }` | Status 200, `role` = "user" |
| 8 | Cannot ban self | PATCH | `{{base_url}}/api/admin/users/{{admin_user_id}}/ban` | `{ "is_banned": true }` | Status 409 |
| 9 | Cannot change own role | PATCH | `{{base_url}}/api/admin/users/{{admin_user_id}}/role` | `{ "role": "user" }` | Status 409 |

---

### Collection 4: Admin - Score Management
**File:** `tests/postman/04-admin-scores.postman_collection.json`

**Pre-request:** Attach `admin_token` as Bearer token.

| # | Name | Method | URL | Body | Tests |
|---|------|--------|-----|------|-------|
| 1 | List all scores | GET | `{{base_url}}/api/admin/scores` | — | Status 200, `data` is array |
| 2 | Filter by game | GET | `{{base_url}}/api/admin/scores?game=snake` | — | All results have `game` = "snake" |
| 3 | Delete specific score | DELETE | `{{base_url}}/api/admin/scores/{{test_score_id}}` | — | Status 200 |
| 4 | Verify score deleted | GET | `{{base_url}}/api/admin/scores?game=snake` | — | Does not contain deleted score ID |
| 5 | Add scores for reset test | POST | (direct supabase insert × 3 snake scores) | — | Status 201 |
| 6 | Reset snake leaderboard | POST | `{{base_url}}/api/admin/scores/reset` | `{ "game": "snake" }` | Status 200, `deleted_count` >= 3 |
| 7 | Verify reset worked | GET | `{{base_url}}/api/admin/scores?game=snake` | — | Empty array |
| 8 | Invalid game reset | POST | `{{base_url}}/api/admin/scores/reset` | `{ "game": "invalid" }` | Status 400 |

---

### Collection 5: Admin - Config
**File:** `tests/postman/05-admin-config.postman_collection.json`

**Pre-request:** Attach `admin_token` as Bearer token.

| # | Name | Method | URL | Body | Tests |
|---|------|--------|-----|------|-------|
| 1 | Get game configs | GET | `{{base_url}}/api/admin/games` | — | Status 200, has snake, pong, breakout |
| 2 | Disable snake | PATCH | `{{base_url}}/api/admin/games/snake` | `{ "enabled": false }` | Status 200, `enabled` = false |
| 3 | Verify snake hidden (public) | GET | `{{base_url}}/api/games/config` | — | Does not contain snake |
| 4 | Re-enable snake | PATCH | `{{base_url}}/api/admin/games/snake` | `{ "enabled": true }` | Status 200 |
| 5 | Update snake speed | PATCH | `{{base_url}}/api/admin/games/snake` | `{ "config": { "speed": 80 } }` | Status 200, config.speed = 80 |
| 6 | Reset snake config | PATCH | `{{base_url}}/api/admin/games/snake` | `{ "config": { "speed": 120, "grid_size": 20, "growth_per_food": 1, "score_per_food": 10 } }` | Status 200 |
| 7 | Get site config | GET | `{{base_url}}/api/admin/config` | — | Has site_title, maintenance_mode, registration_enabled |
| 8 | Enable maintenance mode | PATCH | `{{base_url}}/api/admin/config` | `{ "key": "maintenance_mode", "value": true }` | Status 200 |
| 9 | Disable maintenance mode | PATCH | `{{base_url}}/api/admin/config` | `{ "key": "maintenance_mode", "value": false }` | Status 200 |
| 10 | Invalid config key | PATCH | `{{base_url}}/api/admin/config` | `{ "key": "nonexistent", "value": "x" }` | Status 404 |

---

### Collection 6: Permission Tests (Negative Cases)
**File:** `tests/postman/06-permission-tests.postman_collection.json`

| # | Name | Token | Method | URL | Expected |
|---|------|-------|--------|-----|----------|
| 1 | No token → admin users | none | GET | `{{base_url}}/api/admin/users` | 401 |
| 2 | No token → admin scores | none | GET | `{{base_url}}/api/admin/scores` | 401 |
| 3 | No token → admin config | none | GET | `{{base_url}}/api/admin/config` | 401 |
| 4 | User token → admin users | user_token | GET | `{{base_url}}/api/admin/users` | 403 |
| 5 | User token → ban user | user_token | PATCH | `{{base_url}}/api/admin/users/.../ban` | 403 |
| 6 | User token → delete score | user_token | DELETE | `{{base_url}}/api/admin/scores/...` | 403 |
| 7 | User token → update game config | user_token | PATCH | `{{base_url}}/api/admin/games/snake` | 403 |
| 8 | User token → update site config | user_token | PATCH | `{{base_url}}/api/admin/config` | 403 |
| 9 | User token → admin stats | user_token | GET | `{{base_url}}/api/admin/stats` | 403 |
| 10 | Expired token → admin users | expired | GET | `{{base_url}}/api/admin/users` | 401 |

---

### Collection 7: Dashboard Stats
**File:** `tests/postman/07-admin-stats.postman_collection.json`

**Pre-request:** Attach `admin_token` as Bearer token.

| # | Name | Method | URL | Tests |
|---|------|--------|-----|-------|
| 1 | Get dashboard stats | GET | `{{base_url}}/api/admin/stats` | Status 200, has `total_users`, `total_scores`, `scores_today`, `most_popular_game`, `top_players`, `recent_scores` |
| 2 | Verify total_users | — | — | `total_users` >= 2 |
| 3 | Verify top_players structure | — | — | Array, each has `display_name` and `total_score` |
| 4 | Verify recent_scores structure | — | — | Array, each has `player_name`, `game`, `score`, `created_at` |

---

## 3.3 Running Order

Execute collections in order (1 → 7). Each collection depends on state created by the previous one:

```
1. Auth Flow        → creates users, sets tokens
2. User Actions     → creates scores, tests user permissions
3. Admin Users      → tests ban/role/search using created users
4. Admin Scores     → tests delete/reset using created scores
5. Admin Config     → tests game/site config endpoints
6. Permission Tests → verifies auth boundaries
7. Dashboard Stats  → verifies aggregation queries
```

---

## 3.4 Cleanup Collection (Optional)
**File:** `tests/postman/99-cleanup.postman_collection.json`

| # | Name | Description |
|---|------|-------------|
| 1 | Delete test user | Remove test user via admin API |
| 2 | Reset all test scores | Clean up any remaining test data |
| 3 | Reset configs to defaults | Restore game/site configs |

---

## Tasks

| # | Task | Status | Notes |
|---|------|--------|-------|
| 1 | Create Postman environment JSON | ⬜ | |
| 2 | Build Collection 1: Auth Flow | ⬜ | 7 requests |
| 3 | Build Collection 2: User Actions | ⬜ | 8 requests |
| 4 | Build Collection 3: Admin Users | ⬜ | 9 requests |
| 5 | Build Collection 4: Admin Scores | ⬜ | 8 requests |
| 6 | Build Collection 5: Admin Config | ⬜ | 10 requests |
| 7 | Build Collection 6: Permission Tests | ⬜ | 10 requests |
| 8 | Build Collection 7: Dashboard Stats | ⬜ | 4 requests |
| 9 | Build Cleanup collection | ⬜ | |
| 10 | Run full chain, all requests pass | ⬜ | |
| 11 | Export all collections to `tests/postman/` | ⬜ | |
| 12 | Document how to import/run in README | ⬜ | |
