/**
 * Posts API Integration Tests
 * Run: node tests/blog/posts-api-test.js
 * Requires: dev server running (npm run dev)
 */

const BASE_URL = "http://localhost:3000";
const SUPABASE_URL = "https://eamozesrfwowbdegrfdl.supabase.co";
const SUPABASE_ANON_KEY = "sb_publishable_oClZjSnjYK-n6NRBbgNjMg_3QVn7I4b";

const USER1_EMAIL = "user@user.com";       // regular user (post author)
const USER1_PASSWORD = "user@123";
const USER2_EMAIL = "admin@admin.com";     // admin
const USER2_PASSWORD = "admin@123";
const USER3_EMAIL = "user2@user.com";      // regular user (non-author, non-admin)
const USER3_PASSWORD = "user2@123";

const state = {
  user1_token: "",
  user1_id: "",
  user2_token: "",
  user2_id: "",
  user3_token: "",
  user3_id: "",
  post_id: "",
  post2_id: "",
};

// TipTap JSON document format
const TIPTAP_DOC = (text) => ({
  type: "doc",
  content: [{ type: "paragraph", content: [{ type: "text", text }] }],
});

let passed = 0;
let failed = 0;
const failures = [];

// ── Helpers ──────────────────────────────────────────────

async function request(url, options = {}) {
  const res = await fetch(url, options);
  let body = null;
  try { body = await res.json(); } catch {}
  return { status: res.status, body };
}

function assert(condition, msg) {
  if (!condition) throw new Error(msg);
}

async function test(name, fn) {
  try {
    await fn();
    passed++;
    console.log(`  \x1b[32m[PASS]\x1b[0m ${name}`);
  } catch (err) {
    failed++;
    const msg = `${name} — ${err.message}`;
    failures.push(msg);
    console.log(`  \x1b[31m[FAIL]\x1b[0m ${msg}`);
  }
}

function section(name) {
  console.log(`\n\x1b[36m── ${name} ──\x1b[0m`);
}

async function supabaseLogin(email, password) {
  return request(`${SUPABASE_URL}/auth/v1/token?grant_type=password`, {
    method: "POST",
    headers: { apikey: SUPABASE_ANON_KEY, "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
}

async function api(method, path, options = {}) {
  const headers = {};
  if (options.token) headers["Authorization"] = `Bearer ${options.token}`;
  if (options.body) headers["Content-Type"] = "application/json";
  return request(`${BASE_URL}${path}`, {
    method,
    headers,
    body: options.body ? JSON.stringify(options.body) : undefined,
  });
}

// ── Tests ────────────────────────────────────────────────

async function run() {
  console.log("\n\x1b[1m📝 Posts API Integration Tests\x1b[0m");
  console.log(`   Base URL: ${BASE_URL}\n`);

  // ─── 1. Setup ───────────────────────────────────────

  section("1. Setup — Login");

  await test("1.1 Login as user1 (user@user.com)", async () => {
    const { status, body } = await supabaseLogin(USER1_EMAIL, USER1_PASSWORD);
    assert(status === 200, `expected 200, got ${status}`);
    state.user1_token = body.access_token;
    state.user1_id = body.user.id;
    console.log(`       user1_id: ${state.user1_id}`);
  });

  await test("1.2 Login as user2 (admin@admin.com)", async () => {
    const { status, body } = await supabaseLogin(USER2_EMAIL, USER2_PASSWORD);
    assert(status === 200, `expected 200, got ${status}`);
    state.user2_token = body.access_token;
    state.user2_id = body.user.id;
    console.log(`       user2_id: ${state.user2_id}`);
  });

  await test("1.3 Login as user3 (user2@user.com)", async () => {
    const { status, body } = await supabaseLogin(USER3_EMAIL, USER3_PASSWORD);
    assert(status === 200, `expected 200, got ${status}`);
    state.user3_token = body.access_token;
    state.user3_id = body.user.id;
    console.log(`       user3_id: ${state.user3_id}`);
  });

  // ─── 2. Create Post ─────────────────────────────────

  section("2. POST /api/blog/posts — Create");

  await test("2.1 No token → 401", async () => {
    const { status, body } = await api("POST", "/api/blog/posts", {
      body: { title: "Test", content: "Content" },
    });
    assert(status === 401, `expected 401, got ${status}`);
    assert(body.error.code === "UNAUTHORIZED", `code: ${body.error.code}`);
  });

  await test("2.2 Missing title → 400", async () => {
    const { status, body } = await api("POST", "/api/blog/posts", {
      token: state.user1_token,
      body: { content: TIPTAP_DOC("Content only") },
    });
    assert(status === 400, `expected 400, got ${status}`);
    assert(body.error.code === "BAD_REQUEST", `code: ${body.error.code}`);
  });

  await test("2.3 Missing content → 400", async () => {
    const { status, body } = await api("POST", "/api/blog/posts", {
      token: state.user1_token,
      body: { title: "Title only" },
    });
    assert(status === 400, `expected 400, got ${status}`);
    assert(body.error.code === "BAD_REQUEST", `code: ${body.error.code}`);
  });

  await test("2.3b Invalid content (not TipTap JSON) → 400", async () => {
    const { status, body } = await api("POST", "/api/blog/posts", {
      token: state.user1_token,
      body: { title: "Title", content: "<p>raw html string</p>" },
    });
    assert(status === 400, `expected 400, got ${status}`);
    assert(body.error.code === "BAD_REQUEST", `code: ${body.error.code}`);
  });

  await test("2.4 user1 creates a post → 201", async () => {
    const { status, body } = await api("POST", "/api/blog/posts", {
      token: state.user1_token,
      body: { title: "Test Post by User1", content: TIPTAP_DOC("Hello world") },
    });
    assert(status === 201, `expected 201, got ${status}`);
    assert(body.data.id, "missing post id");
    assert(body.data.author_id === state.user1_id, "wrong author");
    assert(body.data.slug, "missing slug");
    state.post_id = body.data.id;
    console.log(`       post_id: ${state.post_id}`);
  });

  // ─── 3. Get Single Post ─────────────────────────────

  section("3. GET /api/blog/posts/[id] — Single Post");

  await test("3.1 No token → 401", async () => {
    const { status } = await api("GET", `/api/blog/posts/${state.post_id}`);
    assert(status === 401, `expected 401, got ${status}`);
  });

  await test("3.2 Author (user1) can read own post → 200", async () => {
    const { status, body } = await api("GET", `/api/blog/posts/${state.post_id}`, {
      token: state.user1_token,
    });
    assert(status === 200, `expected 200, got ${status}`);
    assert(body.data.id === state.post_id, "wrong post");
    assert(typeof body.data.like_count === "number", "missing like_count");
    assert(typeof body.data.comment_count === "number", "missing comment_count");
  });

  await test("3.3 Non-follower regular user (user3) cannot read user1 post → 403", async () => {
    const { status, body } = await api("GET", `/api/blog/posts/${state.post_id}`, {
      token: state.user3_token,
    });
    assert(status === 403, `expected 403, got ${status}`);
    assert(body.error.code === "FORBIDDEN", `code: ${body.error.code}`);
  });

  await test("3.4 Non-existent post → 404", async () => {
    const { status, body } = await api("GET", "/api/blog/posts/00000000-0000-0000-0000-000000000000", {
      token: state.user1_token,
    });
    assert(status === 404, `expected 404, got ${status}`);
    assert(body.error.code === "NOT_FOUND", `code: ${body.error.code}`);
  });

  // user2 follows user1 so subsequent tests work
  await test("3.5 user2 follows user1 (setup)", async () => {
    const { status } = await api("POST", `/api/blog/users/${state.user1_id}/follow`, {
      token: state.user2_token,
    });
    assert(status === 201, `expected 201, got ${status}`);
  });

  await test("3.6 Follower (user2) can now read user1 post → 200", async () => {
    const { status, body } = await api("GET", `/api/blog/posts/${state.post_id}`, {
      token: state.user2_token,
    });
    assert(status === 200, `expected 200, got ${status}`);
    assert(body.data.id === state.post_id, "wrong post");
  });

  // ─── 4. Feed ────────────────────────────────────────

  section("4. GET /api/blog/posts — Feed");

  await test("4.1 No token → 401", async () => {
    const { status } = await api("GET", "/api/blog/posts");
    assert(status === 401, `expected 401, got ${status}`);
  });

  await test("4.2 user1 feed includes own post", async () => {
    const { status, body } = await api("GET", "/api/blog/posts", {
      token: state.user1_token,
    });
    assert(status === 200, `expected 200, got ${status}`);
    assert(Array.isArray(body.data), "data not array");
    const ids = body.data.map((p) => p.id);
    assert(ids.includes(state.post_id), "own post not in feed");
  });

  await test("4.3 user2 feed includes user1 post (following)", async () => {
    const { status, body } = await api("GET", "/api/blog/posts", {
      token: state.user2_token,
    });
    assert(status === 200, `expected 200, got ${status}`);
    const ids = body.data.map((p) => p.id);
    assert(ids.includes(state.post_id), "followed user's post not in feed");
  });

  await test("4.4 ?author filter returns only that author's posts", async () => {
    const { status, body } = await api(`GET`, `/api/blog/posts?author=${state.user1_id}`, {
      token: state.user2_token,
    });
    assert(status === 200, `expected 200, got ${status}`);
    body.data.forEach((p) =>
      assert(p.author_id === state.user1_id, `unexpected author ${p.author_id}`)
    );
  });

  await test("4.5 ?author filter returns empty for non-followed user", async () => {
    // user1 is not following user2, so user1 cannot see user2's authored posts
    // (user2 has no posts anyway, but the visibility check should return [])
    const { status, body } = await api(`GET`, `/api/blog/posts?author=${state.user2_id}`, {
      token: state.user1_token,
    });
    assert(status === 200, `expected 200, got ${status}`);
    assert(body.data.length === 0, `expected 0, got ${body.data.length}`);
  });

  // ─── 5. Update Post ─────────────────────────────────

  section("5. PATCH /api/blog/posts/[id] — Update");

  await test("5.1 No token → 401", async () => {
    const { status } = await api("PATCH", `/api/blog/posts/${state.post_id}`, {
      body: { title: "New title" },
    });
    assert(status === 401, `expected 401, got ${status}`);
  });

  await test("5.2 Non-author regular user (user3) cannot update → 403", async () => {
    const { status, body } = await api("PATCH", `/api/blog/posts/${state.post_id}`, {
      token: state.user3_token,
      body: { title: "Hijacked title" },
    });
    assert(status === 403, `expected 403, got ${status}`);
    assert(body.error.code === "FORBIDDEN", `code: ${body.error.code}`);
  });

  await test("5.3 Author (user1) can update → 200", async () => {
    const updatedContent = TIPTAP_DOC("Updated content");
    const { status, body } = await api("PATCH", `/api/blog/posts/${state.post_id}`, {
      token: state.user1_token,
      body: { title: "Updated Title", content: updatedContent },
    });
    assert(status === 200, `expected 200, got ${status}`);
    assert(body.data.title === "Updated Title", `title: ${body.data.title}`);
    assert(body.data.content?.type === "doc", "content.type not 'doc'");
  });

  await test("5.4 PATCH non-existent post → 404", async () => {
    const { status, body } = await api("PATCH", "/api/blog/posts/00000000-0000-0000-0000-000000000000", {
      token: state.user1_token,
      body: { title: "Ghost" },
    });
    assert(status === 404, `expected 404, got ${status}`);
    assert(body.error.code === "NOT_FOUND", `code: ${body.error.code}`);
  });

  // ─── 6. Delete Post ─────────────────────────────────

  section("6. DELETE /api/blog/posts/[id] — Delete");

  // Create a second post for the delete-by-admin test
  await test("6.1 user1 creates second post (for admin delete test)", async () => {
    const { status, body } = await api("POST", "/api/blog/posts", {
      token: state.user1_token,
      body: { title: "Post to delete by admin", content: TIPTAP_DOC("Bye") },
    });
    assert(status === 201, `expected 201, got ${status}`);
    state.post2_id = body.data.id;
  });

  await test("6.2 No token → 401", async () => {
    const { status } = await api("DELETE", `/api/blog/posts/${state.post_id}`);
    assert(status === 401, `expected 401, got ${status}`);
  });

  await test("6.3 Non-author regular user (user3) cannot delete → 403", async () => {
    const { status, body } = await api("DELETE", `/api/blog/posts/${state.post_id}`, {
      token: state.user3_token,
    });
    assert(status === 403, `expected 403, got ${status}`);
    assert(body.error.code === "FORBIDDEN", `code: ${body.error.code}`);
  });

  await test("6.4 Author (user1) can delete own post → 200", async () => {
    const { status, body } = await api("DELETE", `/api/blog/posts/${state.post_id}`, {
      token: state.user1_token,
    });
    assert(status === 200, `expected 200, got ${status}`);
    assert(body.success === true, "success not true");
  });

  await test("6.5 Deleted post returns 404", async () => {
    const { status } = await api("GET", `/api/blog/posts/${state.post_id}`, {
      token: state.user1_token,
    });
    assert(status === 404, `expected 404, got ${status}`);
  });

  await test("6.6 Admin (user2) can delete any post → 200", async () => {
    const { status, body } = await api("DELETE", `/api/blog/posts/${state.post2_id}`, {
      token: state.user2_token,
    });
    assert(status === 200, `expected 200, got ${status}`);
    assert(body.success === true, "success not true");
  });

  await test("6.7 DELETE non-existent post → 404", async () => {
    const { status, body } = await api("DELETE", "/api/blog/posts/00000000-0000-0000-0000-000000000000", {
      token: state.user1_token,
    });
    assert(status === 404, `expected 404, got ${status}`);
    assert(body.error.code === "NOT_FOUND", `code: ${body.error.code}`);
  });

  // ─── 7. Cleanup ─────────────────────────────────────

  section("7. Cleanup");

  await test("7.1 user2 unfollows user1", async () => {
    const { status, body } = await api("POST", `/api/blog/users/${state.user1_id}/follow`, {
      token: state.user2_token,
    });
    assert(status === 200, `expected 200, got ${status}`);
    assert(body.data.following === false, "should be unfollowed");
  });

  // ─── Summary ───────────────────────────────────────

  console.log(`\n${"─".repeat(50)}`);
  console.log(
    `\x1b[1m   Total: ${passed + failed}  |  ` +
    `\x1b[32mPassed: ${passed}\x1b[0m  |  ` +
    `\x1b[${failed > 0 ? "31" : "32"}mFailed: ${failed}\x1b[0m`
  );
  if (failures.length > 0) {
    console.log(`\n\x1b[31m   Failures:\x1b[0m`);
    failures.forEach((f) => console.log(`   • ${f}`));
  }
  console.log();

  process.exit(failed > 0 ? 1 : 0);
}

run().catch((err) => {
  console.error("\n\x1b[31mFatal error:\x1b[0m", err.message);
  process.exit(1);
});
