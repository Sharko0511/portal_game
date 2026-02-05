# Step 5 - Frontend Testing: Manual & E2E

## Status: ⬜ Not Started
## Depends on: Step 4 (Frontend)
## Relates to: All User Stories

---

## Overview
Manually test every user story and scenario in the browser. Document results, capture screenshots for evidence, and sign off each test case.

---

## 5.1 Test Environment Setup

**Prerequisites before testing:**
- [ ] Dev server running (`npm run dev`)
- [ ] Supabase project accessible
- [ ] All migrations applied
- [ ] At least 2 test accounts (1 admin, 1 user)
- [ ] Clear browser cache / use incognito

**Test accounts:**

| Account | Email | Password | Role |
|---------|-------|----------|------|
| Admin | admin@test.com | testpass123 | admin |
| User A | usera@test.com | testpass123 | user |
| User B | userb@test.com | testpass123 | user |

---

## 5.2 Test Cases

### TC-01: Registration Flow (US-01)

| # | Step | Action | Expected Result | Status | Notes |
|---|------|--------|-----------------|--------|-------|
| 1.1 | Navigate | Go to `/register` | Register form displayed | ⬜ | |
| 1.2 | Empty submit | Click Register with empty fields | Validation errors shown for all fields | ⬜ | |
| 1.3 | Short display name | Enter 1-char display name | Error: "Display name must be 2-30 characters" | ⬜ | |
| 1.4 | Short password | Enter 5-char password | Error: "Password must be at least 6 characters" | ⬜ | |
| 1.5 | Mismatched passwords | Enter different password/confirm | Error: "Passwords do not match" | ⬜ | |
| 1.6 | Invalid email | Enter "notanemail" | Error: "Please enter a valid email" | ⬜ | |
| 1.7 | Valid registration | Fill all valid fields, submit | Redirect to home, navbar shows display name | ⬜ | |
| 1.8 | Duplicate email | Try registering same email again | Error: "Email already registered" | ⬜ | |
| 1.9 | Profile created | Check Supabase dashboard | profiles table has new row with correct display_name, role='user' | ⬜ | |

---

### TC-02: Login Flow (US-02)

| # | Step | Action | Expected Result | Status | Notes |
|---|------|--------|-----------------|--------|-------|
| 2.1 | Navigate | Go to `/login` | Login form displayed | ⬜ | |
| 2.2 | Empty submit | Click Login with empty fields | Validation errors | ⬜ | |
| 2.3 | Wrong password | Enter valid email, wrong password | Error: "Invalid email or password" | ⬜ | |
| 2.4 | Wrong email | Enter non-existent email | Error: "Invalid email or password" | ⬜ | |
| 2.5 | Valid login | Enter correct credentials | Redirect to home, navbar shows name | ⬜ | |
| 2.6 | Session persistence | Refresh page after login | Still logged in | ⬜ | |
| 2.7 | Already logged in | Navigate to `/login` while logged in | Redirect to home | ⬜ | |

---

### TC-03: Logout Flow (US-03)

| # | Step | Action | Expected Result | Status | Notes |
|---|------|--------|-----------------|--------|-------|
| 3.1 | Open menu | Click on user name in navbar | Dropdown shows Profile + Logout | ⬜ | |
| 3.2 | Logout | Click Logout | Redirect to home, nav shows Login/Register | ⬜ | |
| 3.3 | Session cleared | Refresh page after logout | Still logged out | ⬜ | |
| 3.4 | Protected route | Go to `/profile` after logout | Redirect to `/login` | ⬜ | |

---

### TC-04: Profile Management (US-04)

| # | Step | Action | Expected Result | Status | Notes |
|---|------|--------|-----------------|--------|-------|
| 4.1 | Navigate | Go to `/profile` | Profile info displayed (name, email, role, date) | ⬜ | |
| 4.2 | Edit name | Change display name, save | Success message, navbar updates | ⬜ | |
| 4.3 | Invalid name | Set name to 1 char, save | Validation error | ⬜ | |
| 4.4 | Score history | Check score table | Shows scores with game, score, date | ⬜ | |
| 4.5 | No scores | New user with no scores | Shows "No scores yet" message | ⬜ | |

---

### TC-05: Role-based Navigation (US-05)

| # | Step | Action | Expected Result | Status | Notes |
|---|------|--------|-----------------|--------|-------|
| 5.1 | Visitor nav | View nav when logged out | Shows: Home, Leaderboard, Login, Register | ⬜ | |
| 5.2 | User nav | Login as user, check nav | Shows: Home, Leaderboard, UserMenu (no Admin) | ⬜ | |
| 5.3 | Admin nav | Login as admin, check nav | Shows: Home, Leaderboard, Admin, UserMenu | ⬜ | |
| 5.4 | User → admin URL | Login as user, go to `/admin` | Redirect to home | ⬜ | |
| 5.5 | Visitor → game | Logged out, go to `/games/snake` | Redirect to `/login` | ⬜ | |
| 5.6 | Visitor → profile | Logged out, go to `/profile` | Redirect to `/login` | ⬜ | |

---

### TC-06: Game Play with Auth (US-01, US-05)

| # | Step | Action | Expected Result | Status | Notes |
|---|------|--------|-----------------|--------|-------|
| 6.1 | Play snake | Login, go to `/games/snake`, play | Game works normally | ⬜ | |
| 6.2 | Save score | Die in snake, click Save Score | Score saved with user_id and display_name (no prompt) | ⬜ | |
| 6.3 | Score on leaderboard | Go to leaderboard | Score shows with display name | ⬜ | |
| 6.4 | Play pong | Go to `/games/pong`, play | Game works, mouse control | ⬜ | |
| 6.5 | Play breakout | Go to `/games/breakout`, play | Game works, mouse control | ⬜ | |
| 6.6 | Disabled game | Admin disables snake, user visits `/games/snake` | Shows "Game currently unavailable" | ⬜ | |
| 6.7 | Disabled game home | Admin disables snake, check home | Snake card not visible | ⬜ | |

---

### TC-07: Banned User (US-05)

| # | Step | Action | Expected Result | Status | Notes |
|---|------|--------|-----------------|--------|-------|
| 7.1 | Ban user | Admin bans User A | User A profile shows is_banned=true | ⬜ | |
| 7.2 | Banned login | User A logs in | Can login but sees banned message | ⬜ | |
| 7.3 | Banned game access | User A tries `/games/snake` | Shows "Account suspended" message | ⬜ | |
| 7.4 | Unban user | Admin unbans User A | User A can play games again | ⬜ | |

---

### TC-08: Admin User Management (US-06)

| # | Step | Action | Expected Result | Status | Notes |
|---|------|--------|-----------------|--------|-------|
| 8.1 | View users | Go to `/admin/users` | Table with all users | ⬜ | |
| 8.2 | Search | Type in search box | Table filters by name/email | ⬜ | |
| 8.3 | Ban user | Toggle ban on User A | Immediate update, checkbox checked | ⬜ | |
| 8.4 | Unban user | Toggle ban off User A | Checkbox unchecked | ⬜ | |
| 8.5 | Change role | Change User A to admin | Dropdown updates | ⬜ | |
| 8.6 | Revert role | Change User A back to user | Dropdown updates | ⬜ | |
| 8.7 | Delete user | Click delete on User B, confirm | User B removed from table | ⬜ | |
| 8.8 | Self-protection | Try to ban/delete own account | Controls disabled for own row | ⬜ | |

---

### TC-09: Admin Score Management (US-07)

| # | Step | Action | Expected Result | Status | Notes |
|---|------|--------|-----------------|--------|-------|
| 9.1 | View scores | Go to `/admin/scores` | Table with all scores | ⬜ | |
| 9.2 | Filter by game | Select "Snake" filter | Only snake scores shown | ⬜ | |
| 9.3 | Delete score | Click delete on a score, confirm | Score removed from table | ⬜ | |
| 9.4 | Reset leaderboard | Click Reset, select Snake, confirm | All snake scores deleted | ⬜ | |
| 9.5 | Verify reset | Check leaderboard page | No snake scores | ⬜ | |

---

### TC-10: Admin Game Config (US-08)

| # | Step | Action | Expected Result | Status | Notes |
|---|------|--------|-----------------|--------|-------|
| 10.1 | View configs | Go to `/admin/games` | Cards for snake, pong, breakout | ⬜ | |
| 10.2 | Disable game | Toggle snake off | Snake card shows disabled | ⬜ | |
| 10.3 | Verify disabled | Check home page | Snake not visible | ⬜ | |
| 10.4 | Re-enable | Toggle snake on | Snake visible on home again | ⬜ | |
| 10.5 | Edit speed | Change snake speed to 80ms | Save success | ⬜ | |
| 10.6 | Verify config | Play snake | Snake moves faster | ⬜ | |
| 10.7 | Reset config | Change snake speed back to 120ms | Save success | ⬜ | |

---

### TC-11: Admin Site Config (US-09)

| # | Step | Action | Expected Result | Status | Notes |
|---|------|--------|-----------------|--------|-------|
| 11.1 | View config | Go to `/admin/config` | Shows site_title, maintenance_mode, registration_enabled | ⬜ | |
| 11.2 | Maintenance on | Enable maintenance mode | Save success | ⬜ | |
| 11.3 | User sees maintenance | Login as user (new tab) | Maintenance page shown | ⬜ | |
| 11.4 | Admin unaffected | Admin can still navigate normally | All admin pages work | ⬜ | |
| 11.5 | Maintenance off | Disable maintenance mode | Site works normally for users | ⬜ | |
| 11.6 | Disable registration | Set registration_enabled = false | Register link hidden, `/register` shows disabled message | ⬜ | |
| 11.7 | Enable registration | Set registration_enabled = true | Register link visible again | ⬜ | |

---

### TC-12: Admin Dashboard (US-10)

| # | Step | Action | Expected Result | Status | Notes |
|---|------|--------|-----------------|--------|-------|
| 12.1 | View dashboard | Go to `/admin` | Stat cards + tables displayed | ⬜ | |
| 12.2 | User count | Check total users card | Matches actual user count | ⬜ | |
| 12.3 | Score count | Check total scores card | Matches actual score count | ⬜ | |
| 12.4 | Popular game | Check most popular game | Correct game shown | ⬜ | |
| 12.5 | Top players | Check top 5 players list | Correct ranking | ⬜ | |
| 12.6 | Recent scores | Check recent scores table | Shows latest 10 | ⬜ | |

---

## 5.3 Browser Compatibility

| Browser | Version | TC-01 | TC-02 | TC-06 | TC-08 | Status |
|---------|---------|-------|-------|-------|-------|--------|
| Chrome | latest | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ |
| Firefox | latest | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ |
| Edge | latest | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ |

---

## 5.4 Sign-off

| Area | Tester | Date | Status |
|------|--------|------|--------|
| Auth Flow (TC-01 to TC-03) | | | ⬜ |
| Profile (TC-04) | | | ⬜ |
| Role-based Access (TC-05) | | | ⬜ |
| Game Play (TC-06) | | | ⬜ |
| Banned User (TC-07) | | | ⬜ |
| Admin User Mgmt (TC-08) | | | ⬜ |
| Admin Score Mgmt (TC-09) | | | ⬜ |
| Admin Game Config (TC-10) | | | ⬜ |
| Admin Site Config (TC-11) | | | ⬜ |
| Admin Dashboard (TC-12) | | | ⬜ |
| Browser Compat | | | ⬜ |

---

## Tasks

| # | Task | Status | Notes |
|---|------|--------|-------|
| 1 | Set up test accounts (admin + 2 users) | ⬜ | |
| 2 | Execute TC-01: Registration | ⬜ | 9 steps |
| 3 | Execute TC-02: Login | ⬜ | 7 steps |
| 4 | Execute TC-03: Logout | ⬜ | 4 steps |
| 5 | Execute TC-04: Profile | ⬜ | 5 steps |
| 6 | Execute TC-05: Navigation | ⬜ | 6 steps |
| 7 | Execute TC-06: Game Play | ⬜ | 7 steps |
| 8 | Execute TC-07: Banned User | ⬜ | 4 steps |
| 9 | Execute TC-08: Admin Users | ⬜ | 8 steps |
| 10 | Execute TC-09: Admin Scores | ⬜ | 5 steps |
| 11 | Execute TC-10: Admin Game Config | ⬜ | 7 steps |
| 12 | Execute TC-11: Admin Site Config | ⬜ | 7 steps |
| 13 | Execute TC-12: Admin Dashboard | ⬜ | 6 steps |
| 14 | Cross-browser testing | ⬜ | Chrome, Firefox, Edge |
| 15 | Final sign-off | ⬜ | All areas passed |
