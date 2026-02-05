# Game Portal - Master Plan

## Overview
A game portal built with Next.js, Tailwind CSS, and Supabase, featuring classic canvas games with user accounts, leaderboards, and admin controls.

---

## Features

| # | Feature | Status | Folder |
|---|---------|--------|--------|
| 1 | Authorization (Auth + Roles + Admin) | ⬜ Not Started | [features/authorization/](./features/authorization/) |

---

## How to Add a New Feature

Create a folder under `docs/plan/features/<feature-name>/` with these files:

```
features/<feature-name>/
├── README.md                    ← Feature overview, user stories, acceptance criteria, files affected
├── step-1-backend.md            ← Tables, schema, SQL migration, RLS policies, seed data
├── step-2-api.md                ← API endpoints, middleware, request/response specs, file structure
├── step-3-api-testing.md        ← Postman environment, collections, chain scripts, negative tests
├── step-4-frontend.md           ← Pages, components, layouts, wireframes, state management
└── step-5-frontend-testing.md   ← Test cases per user story, browser compat, sign-off checklist
```

Each file must include:
- **Status** at the top
- **Depends on** (which steps must be completed first)
- **Detailed specs** (schemas, endpoint contracts, wireframes, test steps)
- **Task checklist** at the bottom with individual progress tracking

---

## Tech Stack
- **Framework**: Next.js (App Router)
- **Styling**: Tailwind CSS
- **Database**: Supabase Postgres
- **Auth**: Supabase Auth
- **Games**: Vanilla JS + Canvas API
- **API Testing**: Postman
- **CLI**: Supabase CLI (migrations)

---

## Status Legend
- ⬜ Not Started
- 🟡 In Progress
- ✅ Completed
- ❌ Blocked
