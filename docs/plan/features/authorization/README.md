# Feature: Authorization System

## Feature ID
`authorization`

## Priority
HIGH - Core feature, blocks all other user-facing features

## Status: ⬜ Not Started

---

## Description
Implement a complete authentication and authorization system with two roles (**admin**, **user**) using Supabase Auth. Users register with email/password, get a profile with a role, and access features based on their role. Admins can manage users, scores, game configs, and site settings.

---

## User Stories

### US-01: User Registration
> As a visitor, I want to register with my email, password, and display name so I can save my game scores.

**Acceptance Criteria:**
- Form fields: email, password, confirm password, display name
- Password minimum 6 characters
- Display name minimum 2 characters, maximum 30 characters
- Email must be unique (Supabase handles this)
- On success: auto-login, redirect to home page
- On failure: show specific error message (email taken, weak password, etc.)
- A `profiles` row is auto-created via database trigger

### US-02: User Login
> As a registered user, I want to login with my email and password so I can access my account.

**Acceptance Criteria:**
- Form fields: email, password
- On success: redirect to home page, navbar shows display name
- On failure: show "Invalid email or password" (no specifics for security)
- Banned users see "Your account has been suspended" message
- Session persists across browser refresh (Supabase handles via localStorage)

### US-03: User Logout
> As a logged-in user, I want to logout so I can end my session.

**Acceptance Criteria:**
- Logout button in navbar user menu dropdown
- On logout: clear session, redirect to home page
- Navbar reverts to showing Login/Register links

### US-04: Profile Management
> As a logged-in user, I want to view and edit my profile so I can update my display name.

**Acceptance Criteria:**
- Profile page shows: display name, email (read-only), role (read-only), member since date
- Can edit display name (same validation as registration)
- Shows personal score history table (game, score, date)
- Save button with success/error feedback

### US-05: Role-based Access
> As the system, I want to restrict access based on user roles so admins have elevated privileges.

**Acceptance Criteria:**
- **Visitor** (not logged in): can view home, leaderboard, login, register
- **User** (logged in, role=user): can play games, save scores, view/edit profile
- **Admin** (logged in, role=admin): all user permissions + admin dashboard, user management, score management, game config, site config
- **Banned user**: can login but cannot play games or save scores, sees banned message
- Attempting to access unauthorized routes shows 403 or redirects

### US-06: Admin - User Management
> As an admin, I want to view all users, ban/unban them, and change roles so I can moderate the platform.

**Acceptance Criteria:**
- Table view: display name, email, role, banned status, join date, score count
- Search/filter by name or email
- Ban toggle: immediately prevents user from saving scores
- Role dropdown: switch between 'user' and 'admin'
- Delete user: confirmation dialog, removes user + their scores
- Cannot ban/delete own account

### US-07: Admin - Score Management
> As an admin, I want to view and manage all scores so I can remove cheated/invalid scores.

**Acceptance Criteria:**
- Table view: player name, game, score, date
- Filter by game
- Sort by score, date
- Delete individual score with confirmation
- Reset all scores for a specific game with confirmation
- Show total count per filter

### US-08: Admin - Game Configuration
> As an admin, I want to enable/disable games and adjust difficulty so I can control the game catalog.

**Acceptance Criteria:**
- Card view per game: name, icon, enabled toggle
- Config editor per game with fields:
  - Snake: `speed` (ms interval), `grid_size`
  - Pong: `ai_speed`, `ball_speed`, `win_score`
  - Breakout: `ball_speed`, `lives`, `brick_rows`
- Disabled games hidden from home page and return 404 if accessed via URL
- Changes take effect immediately (no restart needed)

### US-09: Admin - Site Configuration
> As an admin, I want to configure site-wide settings so I can control the platform behavior.

**Acceptance Criteria:**
- Settings:
  - `site_title` (string): displayed in navbar
  - `maintenance_mode` (boolean): shows maintenance page to non-admins
  - `registration_enabled` (boolean): hides register page when false
- Form with save button and success feedback

### US-10: Admin - Dashboard
> As an admin, I want to see platform statistics so I can monitor activity.

**Acceptance Criteria:**
- Stat cards: total users, total scores, games played today
- Most popular game (by score count)
- Top 5 players (by total score across all games)
- Recent scores table (last 10)

---

## Technical Dependencies
- Supabase Auth (email/password provider)
- Supabase Postgres (profiles, game_config, site_config tables)
- Supabase RLS (row-level security policies)
- Next.js App Router (route handlers for admin APIs)
- React Context (auth state management)

## Files Affected
```
lib/
├── supabase.js              (update: add server client)
├── supabase-server.js        (new: server-side client with service role)
├── auth.js                   (new: auth helper functions)

app/
├── layout.js                 (update: wrap with AuthProvider, update navbar)
├── login/page.js             (new)
├── register/page.js          (new)
├── profile/page.js           (new)
├── admin/
│   ├── layout.js             (new: admin sidebar layout)
│   ├── page.js               (new: dashboard)
│   ├── users/page.js         (new)
│   ├── scores/page.js        (new)
│   ├── games/page.js         (new)
│   └── config/page.js        (new)
├── games/snake/page.js       (update: require auth, use game_config)
├── games/pong/page.js        (update: require auth, use game_config)
├── games/breakout/page.js    (update: require auth, use game_config)

components/
├── AuthProvider.js            (new)
├── UserMenu.js                (new)
├── ProtectedRoute.js          (new)
├── AdminRoute.js              (new)

api/
├── admin/
│   ├── users/route.js         (new)
│   ├── users/[id]/ban/route.js    (new)
│   ├── users/[id]/role/route.js   (new)
│   ├── users/[id]/route.js        (new)
│   ├── scores/route.js            (new)
│   ├── scores/[id]/route.js       (new)
│   ├── scores/reset/route.js      (new)
│   ├── games/route.js             (new)
│   ├── games/[id]/route.js        (new)
│   ├── config/route.js            (new)
│   └── stats/route.js             (new)

supabase/
├── migrations/
│   └── YYYYMMDD_authorization.sql (new)
```

---

## Implementation Steps

| Step | Phase | Status | Doc |
|------|-------|--------|-----|
| 1 | Backend: Models, Schema & SQL Migration | ⬜ Not Started | [step-1-backend.md](./step-1-backend.md) |
| 2 | API: Route Handlers & Middleware | ⬜ Not Started | [step-2-api.md](./step-2-api.md) |
| 3 | API Testing: Postman Collections | ⬜ Not Started | [step-3-api-testing.md](./step-3-api-testing.md) |
| 4 | Frontend: Pages, Components & Integration | ⬜ Not Started | [step-4-frontend.md](./step-4-frontend.md) |
| 5 | Frontend Testing: Manual & E2E | ⬜ Not Started | [step-5-frontend-testing.md](./step-5-frontend-testing.md) |

---

## Status Legend
- ⬜ Not Started
- 🟡 In Progress
- ✅ Completed
- ❌ Blocked

## Changelog
| Date | Change | Author |
|------|--------|--------|
| 2026-02-05 | Initial plan created | - |
