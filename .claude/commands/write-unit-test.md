# /write-unit-test

Generate a complete unit test file for the given feature or file.

## How to use
```
/write-unit-test <target>
```
Examples:
- `/write-unit-test app/api/blog/posts/route.ts`
- `/write-unit-test components/blog/LikeButton.tsx`
- `/write-unit-test hooks/useLike.ts`

---

## Instructions

When this command is run, read the target file first, then generate a full test file following the rules below based on whether the target is an **API route**, **component**, or **hook**.

Always cover every case listed. Never skip fail cases or edge cases.

---

## Rule 1 — API Route Tests

**File location:** `tests/<feature-path>/<route-name>.test.ts`
**Framework:** Vitest + `node:test`-compatible mocks (or Jest — match what's in `package.json`)

### Required setup for every API test file
```ts
// 1. Mock Supabase
vi.mock("@/lib/supabase-server", () => ({ getSupabaseAdmin: vi.fn() }));
vi.mock("@/lib/supabase", () => ({ getSupabase: vi.fn() }));

// 2. Helper: build a NextRequest with auth token
function makeRequest(method: string, body?: object, token?: string): NextRequest {
  const req = new NextRequest("http://localhost/api/...", {
    method,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  return req;
}

// 3. Mock user tokens
const VALID_TOKEN   = "valid-token";
const INVALID_TOKEN = "invalid-token";
const ADMIN_TOKEN   = "admin-token";
```

### Required test cases for every API route

#### Authentication
- [ ] No `Authorization` header → `401 UNAUTHORIZED`
- [ ] Invalid / expired token → `401 UNAUTHORIZED`
- [ ] Valid token but banned user → `403 FORBIDDEN`

#### Input validation
- [ ] Missing required field (e.g. no `title`) → `400 BAD_REQUEST` with field name in error message
- [ ] Empty string for required field → `400 BAD_REQUEST`
- [ ] Wrong type (e.g. number where string expected) → `400 BAD_REQUEST`
- [ ] Extra unknown fields → ignored, still `200`/`201`

#### Success cases
- [ ] Valid input + valid auth → correct status code (`200` GET, `201` POST)
- [ ] Response body matches expected shape exactly (list all fields)
- [ ] Side effects happen (e.g. DB row created, cache invalidated)

#### Permission cases
- [ ] Non-owner tries to update/delete → `403 FORBIDDEN`
- [ ] Owner updates/deletes own resource → `200`
- [ ] Admin can update/delete any resource → `200`

#### Not found
- [ ] Resource with unknown id → `404 NOT_FOUND`

#### Database error simulation
- [ ] Supabase returns error → `500 INTERNAL_ERROR`

### Response shape contract
Every test must assert:
```ts
expect(response.status).toBe(expectedStatus);
const body = await response.json();
expect(body).toMatchObject({ /* exact expected shape */ });
// For errors:
expect(body.error.code).toBe("UNAUTHORIZED"); // or BAD_REQUEST, FORBIDDEN, etc.
expect(body.error.message).toBeDefined();
```

### Example — POST `/api/blog/posts`
```ts
describe("POST /api/blog/posts", () => {
  // --- Auth ---
  it("returns 401 when no token provided", async () => { ... });
  it("returns 401 when token is invalid", async () => { ... });

  // --- Validation ---
  it("returns 400 when title is missing", async () => { ... });
  it("returns 400 when title is empty string", async () => { ... });
  it("returns 400 when content is missing", async () => { ... });

  // --- Success ---
  it("returns 201 with created post when input is valid", async () => {
    // Input:  { title: "Hello", content: "<p>Hi</p>" }
    // Token:  VALID_TOKEN
    // Expect: { data: { id, title, content, author_id, slug, created_at } }
  });

  // --- DB error ---
  it("returns 500 when supabase insert fails", async () => { ... });
});
```

---

## Rule 2 — React Component Tests

**File location:** `tests/components/<ComponentName>.test.tsx`
**Framework:** Vitest + React Testing Library (`@testing-library/react`)

### Required setup
```tsx
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

function wrapper({ children }: { children: React.ReactNode }) {
  const qc = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return <QueryClientProvider client={qc}>{children}</QueryClientProvider>;
}
```

### Required test cases for every component

#### Render / display
- [ ] Renders without crashing (smoke test)
- [ ] Displays correct text/values from props
- [ ] Shows loading state when data is fetching
- [ ] Shows error state when query fails
- [ ] Shows empty state when data is empty array

#### User interaction
- [ ] Click handler fires with correct arguments
- [ ] Form submit with valid data calls mutation
- [ ] Form submit with empty/invalid data does NOT call mutation
- [ ] Disabled state prevents interaction

#### Auth-aware components
- [ ] Shows action (like/comment/follow) when user is logged in
- [ ] Shows "Login to ..." prompt when user is NOT logged in

#### Optimistic update (for Like, Follow buttons)
- [ ] UI updates immediately on click (before API responds)
- [ ] UI reverts if mutation fails

#### Conditional rendering
- [ ] Edit/Delete buttons only visible to the owner
- [ ] Admin sees delete on all items

### Props contract — document in test file header
```ts
/**
 * Component: LikeButton
 * Props:
 *   postId: string         — required
 *   liked: boolean         — required
 *   likeCount: number      — required
 *   disabled?: boolean     — optional
 * Behavior:
 *   - Shows like_count
 *   - On click: calls useLike mutation with postId
 *   - Optimistic: flips liked + count immediately
 *   - Reverts on error
 */
```

### Example — `LikeButton`
```tsx
describe("LikeButton", () => {
  it("renders like count", () => {
    render(<LikeButton postId="1" liked={false} likeCount={5} />, { wrapper });
    expect(screen.getByText("5")).toBeInTheDocument();
  });

  it("shows filled icon when liked=true", () => { ... });
  it("shows empty icon when liked=false", () => { ... });

  it("calls like mutation on click", async () => {
    // mock useLike
    // click button
    // assert mutate called with postId
  });

  it("optimistically increments count on click", async () => { ... });
  it("reverts count if mutation errors", async () => { ... });
  it("shows login prompt when user is not authenticated", () => { ... });
  it("does nothing when disabled=true", () => { ... });
});
```

---

## Rule 3 — Hook Tests

**File location:** `tests/hooks/<hookName>.test.ts`
**Framework:** Vitest + `@testing-library/react-hooks` (or `renderHook` from RTL)

### Required setup
```ts
import { renderHook, act, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
// Mock fetch or supabase
vi.mock("@/lib/supabase", () => ({ getSupabase: vi.fn() }));
```

### Required test cases for every hook

#### Query hooks (`useQuery`)
- [ ] Returns `isLoading: true` on initial call
- [ ] Returns correct data on success
- [ ] Returns `isError: true` on fetch failure
- [ ] Returns empty array / null when data is empty
- [ ] Re-fetches when queryKey changes

#### Mutation hooks (`useMutation`)
- [ ] `isPending` is true while mutation is in flight
- [ ] Calls the correct API endpoint with correct body
- [ ] Invalidates correct query keys on success
- [ ] Sets error state on failure
- [ ] Does not mutate if required params are missing

### Example — `useLike`
```ts
describe("useLike", () => {
  it("initially not pending", () => { ... });

  it("calls POST /api/blog/posts/:id/like with auth token", async () => {
    // Input:  { postId: "abc-123" }
    // Expect: fetch called with correct URL + method + Authorization header
  });

  it("invalidates ['post', postId] query on success", async () => { ... });
  it("sets isError on API failure", async () => { ... });

  it("optimistic update: flips liked before API responds", async () => {
    // Expect cache updated immediately
  });

  it("reverts optimistic update on API failure", async () => {
    // Expect cache restored to previous value
  });
});
```

---

## Required Packages (add to devDependencies if missing)
```bash
npm install -D vitest @vitejs/plugin-react jsdom \
  @testing-library/react @testing-library/jest-dom \
  @testing-library/user-event @testing-library/react-hooks
```

## `vitest.config.ts` (project root)
```ts
import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig({
  plugins: [react()],
  test: {
    environment: "jsdom",
    globals: true,
    setupFiles: ["./tests/setup.ts"],
  },
  resolve: {
    alias: { "@": path.resolve(__dirname, ".") },
  },
});
```

## `tests/setup.ts`
```ts
import "@testing-library/jest-dom";
```

---

## Checklist before submitting a test file
- [ ] Every exported function/handler in the target file has at least one test
- [ ] All success paths covered
- [ ] All fail paths covered (auth, validation, not found, db error)
- [ ] All permission levels tested (unauthenticated, user, admin)
- [ ] Response shape fully asserted (not just status code)
- [ ] No `any` types in test code
- [ ] Tests are independent — no shared mutable state between `it()` blocks
- [ ] Mocks are reset in `beforeEach` / `afterEach`
