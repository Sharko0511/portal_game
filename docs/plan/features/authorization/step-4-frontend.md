# Step 4 - Frontend: Pages, Components & Integration

## Status: ⬜ Not Started
## Depends on: Step 2 (API), Step 3 (Testing verified)
## Relates to: All User Stories

---

## Overview
Build all frontend pages and components for auth, user profile, and admin dashboard. Uses React Context for auth state, client-side Supabase for auth actions, and API routes for admin operations.

---

## 4.1 Auth Context & Provider

### File: `components/AuthProvider.js`

**Purpose:** Wrap the entire app, provide auth state to all components.

**Context value:**
```javascript
{
  user: Object | null,        // Supabase auth user
  profile: Object | null,     // { id, display_name, email, role, is_banned }
  loading: boolean,           // true while checking session
  signIn: (email, password) => Promise,
  signUp: (email, password, displayName) => Promise,
  signOut: () => Promise,
  refreshProfile: () => Promise  // re-fetch profile after update
}
```

**Initialization flow:**
1. On mount → `supabase.auth.getSession()` → set user
2. Subscribe to `supabase.auth.onAuthStateChange()` → update user on login/logout
3. When user changes → fetch profile from `profiles` table → set profile
4. Set `loading = false` after initial check

**File: `hooks/useAuth.js`**
```javascript
export function useAuth() {
  return useContext(AuthContext);
}
```

---

## 4.2 Route Protection Components

### File: `components/ProtectedRoute.js`

**Behavior:**
- If `loading` → show spinner
- If `!user` → redirect to `/login`
- If `profile.is_banned` → show banned message with logout button
- Otherwise → render children

**Used on:** `/games/*`, `/profile`

---

### File: `components/AdminRoute.js`

**Behavior:**
- Extends ProtectedRoute
- If `profile.role !== 'admin'` → redirect to `/`
- Otherwise → render children

**Used on:** `/admin/*`

---

## 4.3 Pages

### Login Page — `/login/page.js`

**Layout:**
```
┌──────────────────────────────┐
│         Game Portal          │
│                              │
│  ┌────────────────────────┐  │
│  │      Login             │  │
│  │                        │  │
│  │  Email:    [________]  │  │
│  │  Password: [________]  │  │
│  │                        │  │
│  │  [      Login       ]  │  │
│  │                        │  │
│  │  Don't have account?   │  │
│  │  Register here         │  │
│  │                        │  │
│  │  {error message}       │  │
│  └────────────────────────┘  │
└──────────────────────────────┘
```

**State:** `email`, `password`, `error`, `loading`

**Logic:**
1. On submit → `supabase.auth.signInWithPassword({ email, password })`
2. Success → `router.push('/')`
3. Error → set error message
4. If already logged in → redirect to home
5. Check `registration_enabled` from site_config → hide/show register link

---

### Register Page — `/register/page.js`

**Layout:**
```
┌──────────────────────────────┐
│         Game Portal          │
│                              │
│  ┌────────────────────────┐  │
│  │      Register          │  │
│  │                        │  │
│  │  Display Name: [____]  │  │
│  │  Email:        [____]  │  │
│  │  Password:     [____]  │  │
│  │  Confirm:      [____]  │  │
│  │                        │  │
│  │  [    Register      ]  │  │
│  │                        │  │
│  │  Already have account? │  │
│  │  Login here            │  │
│  │                        │  │
│  │  {error message}       │  │
│  └────────────────────────┘  │
└──────────────────────────────┘
```

**State:** `displayName`, `email`, `password`, `confirmPassword`, `error`, `loading`

**Validation (client-side):**
- Display name: 2-30 characters
- Email: valid email format
- Password: minimum 6 characters
- Confirm password: must match password

**Logic:**
1. Validate inputs
2. `supabase.auth.signUp({ email, password, options: { data: { display_name } } })`
3. Success → auto-login → redirect to home
4. Error → show error
5. If `registration_enabled` is false → show "Registration is currently disabled"

---

### Profile Page — `/profile/page.js`

**Protection:** ProtectedRoute

**Layout:**
```
┌──────────────────────────────────────────┐
│  ← Back              Profile             │
│                                          │
│  ┌──────────────────────────────┐        │
│  │  Display Name: [TestUser  ]  │        │
│  │  Email:        test@test.com │        │
│  │  Role:         user          │        │
│  │  Member since: 2026-02-05    │        │
│  │                              │        │
│  │  [    Save Changes    ]      │        │
│  └──────────────────────────────┘        │
│                                          │
│  ┌──────────────────────────────┐        │
│  │  My Scores                   │        │
│  │                              │        │
│  │  # │ Game   │ Score │ Date   │        │
│  │  1 │ Snake  │  150  │ 02/05  │        │
│  │  2 │ Pong   │    5  │ 02/05  │        │
│  └──────────────────────────────┘        │
└──────────────────────────────────────────┘
```

**Data fetching:**
1. Profile from AuthContext
2. Scores from `supabase.from('scores').select('*').eq('user_id', user.id).order('created_at', { ascending: false })`

---

### Admin Dashboard — `/admin/page.js`

**Protection:** AdminRoute

**Layout:**
```
┌──────────────────────────────────────────────────────┐
│  Admin Dashboard                                     │
│                                                      │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌────────┐  │
│  │ 42       │ │ 1,250    │ │ 85       │ │ Snake  │  │
│  │ Users    │ │ Scores   │ │ Today    │ │ Popular│  │
│  └──────────┘ └──────────┘ └──────────┘ └────────┘  │
│                                                      │
│  ┌───────────────────┐ ┌──────────────────────────┐  │
│  │ Top 5 Players     │ │ Recent Scores            │  │
│  │                   │ │                          │  │
│  │ 1. John  - 5400   │ │ TestUser Snake 150 now   │  │
│  │ 2. Jane  - 4200   │ │ Admin    Pong    5 2m    │  │
│  │ 3. Bob   - 3100   │ │ ...                      │  │
│  └───────────────────┘ └──────────────────────────┘  │
└──────────────────────────────────────────────────────┘
```

**Data:** Fetch from `GET /api/admin/stats`

---

### Admin Users — `/admin/users/page.js`

**Protection:** AdminRoute

**Layout:**
```
┌──────────────────────────────────────────────────────────────────┐
│  Users Management                    Search: [___________]       │
│                                                                  │
│  ┌───────────────────────────────────────────────────────────┐   │
│  │ Name      │ Email          │ Role     │ Banned │ Actions  │   │
│  │ TestUser  │ test@test.com  │ [user ▾] │ [  ]   │ [Delete] │   │
│  │ Admin     │ admin@test.com │ admin    │ —      │ —        │   │
│  └───────────────────────────────────────────────────────────┘   │
└──────────────────────────────────────────────────────────────────┘
```

**Features:**
- Search input filters by name/email (debounced, 300ms)
- Role dropdown → calls `PATCH /api/admin/users/:id/role`
- Ban checkbox → calls `PATCH /api/admin/users/:id/ban`
- Delete button → confirmation dialog → `DELETE /api/admin/users/:id`
- Own row: role dropdown disabled, no ban/delete options
- Pagination at bottom if > 20 users

---

### Admin Scores — `/admin/scores/page.js`

**Protection:** AdminRoute

**Layout:**
```
┌──────────────────────────────────────────────────────────────────┐
│  Score Management                                                │
│                                                                  │
│  Filter: [All Games ▾]           [Reset Leaderboard]             │
│                                                                  │
│  ┌───────────────────────────────────────────────────────────┐   │
│  │ Player   │ Game   │ Score │ Date       │ Actions          │   │
│  │ TestUser │ Snake  │  150  │ 2026-02-05 │ [Delete]         │   │
│  │ Admin    │ Pong   │    5  │ 2026-02-05 │ [Delete]         │   │
│  └───────────────────────────────────────────────────────────┘   │
│                                                                  │
│  Showing 2 scores                          [< 1 2 3 >]          │
└──────────────────────────────────────────────────────────────────┘
```

**Features:**
- Game filter dropdown
- Delete individual score → confirmation
- Reset Leaderboard button → select game → confirmation → `POST /api/admin/scores/reset`
- Sortable columns (score, date)
- Pagination

---

### Admin Game Config — `/admin/games/page.js`

**Protection:** AdminRoute

**Layout:**
```
┌──────────────────────────────────────────────────────────────────┐
│  Game Configuration                                              │
│                                                                  │
│  ┌─────────────────────────────────┐                             │
│  │ 🐍 Snake              [ON/OFF] │                             │
│  │                                 │                             │
│  │  Speed (ms):     [120    ]      │                             │
│  │  Grid Size:      [20     ]      │                             │
│  │  Score per Food:  [10     ]      │                             │
│  │                                 │                             │
│  │  [  Save Changes  ]             │                             │
│  └─────────────────────────────────┘                             │
│                                                                  │
│  ┌─────────────────────────────────┐                             │
│  │ 🏓 Pong               [ON/OFF] │                             │
│  │  ... config fields ...          │                             │
│  └─────────────────────────────────┘                             │
│                                                                  │
│  ┌─────────────────────────────────┐                             │
│  │ 🧱 Breakout            [ON/OFF] │                             │
│  │  ... config fields ...          │                             │
│  └─────────────────────────────────┘                             │
└──────────────────────────────────────────────────────────────────┘
```

**Features:**
- Enable/disable toggle per game → `PATCH /api/admin/games/:id`
- Config fields rendered based on game type (known field names)
- Save per game card
- Success/error toast feedback

**Config field mappings:**
```
snake:    speed (number), grid_size (number), score_per_food (number)
pong:     ball_speed (number), ai_speed (number), win_score (number)
breakout: ball_speed (number), lives (number), brick_rows (number), brick_cols (number)
```

---

### Admin Site Config — `/admin/config/page.js`

**Protection:** AdminRoute

**Layout:**
```
┌──────────────────────────────────────────────────┐
│  Site Configuration                              │
│                                                  │
│  Site Title:             [Game Portal    ]       │
│  Maintenance Mode:       [OFF / ON]              │
│  Registration Enabled:   [ON / OFF]              │
│                                                  │
│  [  Save Changes  ]                              │
│                                                  │
│  {success/error message}                         │
└──────────────────────────────────────────────────┘
```

---

### Admin Layout — `/admin/layout.js`

Wraps all admin pages with a sidebar navigation.

```
┌────────────────────────────────────────────────────────┐
│ Game Portal                    Home  Leaderboard  Admin│
├──────────┬─────────────────────────────────────────────┤
│ Admin    │                                             │
│          │  {children - admin page content}             │
│ Dashboard│                                             │
│ Users    │                                             │
│ Scores   │                                             │
│ Games    │                                             │
│ Config   │                                             │
│          │                                             │
└──────────┴─────────────────────────────────────────────┘
```

**Sidebar links:**
- Dashboard → `/admin`
- Users → `/admin/users`
- Scores → `/admin/scores`
- Games → `/admin/games`
- Config → `/admin/config`

Active link highlighted based on current pathname.

---

## 4.4 Navbar Updates — `app/layout.js`

Current nav links: Home, Leaderboard

**Updated nav (right side):**

When logged out:
```
Home | Leaderboard | Login | Register
```

When logged in (user):
```
Home | Leaderboard | [UserMenu dropdown]
```

When logged in (admin):
```
Home | Leaderboard | Admin | [UserMenu dropdown]
```

### UserMenu Component — `components/UserMenu.js`

**Dropdown content:**
```
┌──────────────┐
│ DisplayName  │
│ role: user   │
├──────────────┤
│ Profile      │
│ Logout       │
└──────────────┘
```

---

## 4.5 Game Page Updates

### Changes to all game pages (`snake`, `pong`, `breakout`):

1. **Wrap with ProtectedRoute** — require login to play
2. **Fetch game_config** — get enabled status and config from `GET /api/games/config`
3. **Check enabled** — if game disabled, show "This game is currently unavailable"
4. **Use config values** — replace hardcoded constants (speed, lives, etc.) with config values
5. **Update saveScore** — use `user.id` as `user_id`, use `profile.display_name` as `player_name` (no more prompt)

**Before (current):**
```javascript
async function saveScore() {
  const name = prompt("Enter your name:");
  await supabase.from("scores").insert({ player_name: name, score, game: "snake" });
}
```

**After:**
```javascript
async function saveScore() {
  const { user, profile } = useAuth();
  await supabase.from("scores").insert({
    user_id: user.id,
    player_name: profile.display_name,
    score,
    game: "snake"
  });
}
```

---

## 4.6 Home Page Updates

1. Fetch game list from `GET /api/games/config` instead of static `lib/games.js`
2. Only show enabled games
3. Respect `maintenance_mode` — show maintenance page for non-admins
4. Show login prompt if not authenticated ("Login to play and save your scores!")

---

## 4.7 Maintenance Page — `components/MaintenancePage.js`

Shown when `maintenance_mode` = true and user is not admin.

```
┌──────────────────────────────────────┐
│                                      │
│           🔧                         │
│                                      │
│    We're currently under             │
│    maintenance.                      │
│                                      │
│    Please check back later.          │
│                                      │
└──────────────────────────────────────┘
```

---

## 4.8 File Structure

```
components/
├── AuthProvider.js
├── UserMenu.js
├── ProtectedRoute.js
├── AdminRoute.js
├── MaintenancePage.js

hooks/
├── useAuth.js

app/
├── layout.js                    (update: AuthProvider, nav)
├── page.js                      (update: dynamic games, maintenance)
├── login/
│   └── page.js                  (new)
├── register/
│   └── page.js                  (new)
├── profile/
│   └── page.js                  (new)
├── admin/
│   ├── layout.js                (new: sidebar)
│   ├── page.js                  (new: dashboard)
│   ├── users/
│   │   └── page.js              (new)
│   ├── scores/
│   │   └── page.js              (new)
│   ├── games/
│   │   └── page.js              (new)
│   └── config/
│       └── page.js              (new)
├── games/
│   ├── snake/page.js            (update)
│   ├── pong/page.js             (update)
│   └── breakout/page.js         (update)
```

---

## Tasks

| # | Task | Status | Notes |
|---|------|--------|-------|
| 1 | Create `AuthProvider` + `useAuth` hook | ⬜ | Context + session listener |
| 2 | Create `ProtectedRoute` component | ⬜ | Redirect + banned check |
| 3 | Create `AdminRoute` component | ⬜ | Role check |
| 4 | Create `UserMenu` dropdown component | ⬜ | Profile link + logout |
| 5 | Build Login page | ⬜ | Form + validation + error |
| 6 | Build Register page | ⬜ | Form + validation + error |
| 7 | Build Profile page | ⬜ | Edit name + score history |
| 8 | Update `layout.js` with AuthProvider + dynamic nav | ⬜ | |
| 9 | Create Admin layout with sidebar | ⬜ | |
| 10 | Build Admin Dashboard page | ⬜ | Stat cards + tables |
| 11 | Build Admin Users page | ⬜ | Table + search + actions |
| 12 | Build Admin Scores page | ⬜ | Table + filter + delete/reset |
| 13 | Build Admin Game Config page | ⬜ | Cards + toggle + config edit |
| 14 | Build Admin Site Config page | ⬜ | Form + toggle controls |
| 15 | Create `MaintenancePage` component | ⬜ | |
| 16 | Update Home page (dynamic games + maintenance) | ⬜ | |
| 17 | Update Snake game (auth + config) | ⬜ | |
| 18 | Update Pong game (auth + config) | ⬜ | |
| 19 | Update Breakout game (auth + config) | ⬜ | |
| 20 | Remove static `lib/games.js` (replaced by DB) | ⬜ | |
