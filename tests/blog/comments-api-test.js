/**
 * Comments API Integration Tests
 * Run: node tests/blog/comments-api-test.js
 * Requires: dev server running (npm run dev)
 */

const BASE_URL = "http://localhost:3000";
const SUPABASE_URL = "https://eamozesrfwowbdegrfdl.supabase.co";
const SUPABASE_ANON_KEY = "sb_publishable_oClZjSnjYK-n6NRBbgNjMg_3QVn7I4b";

const USER1_EMAIL = "user@user.com";       // regular user (post author)
const USER1_PASSWORD = "useruser";
const USER2_EMAIL = "admin@admin.com";     // admin
const USER2_PASSWORD = "admin@123";
const USER3_EMAIL = "user2@user.com";      // regular user (non-author, non-admin)
const USER3_PASSWORD = "user2user2";

const TIPTAP_DOC = (text) => ({
  type: "doc",
  content: [{ type: "paragraph", content: [{ type: "text", text }] }],
});

const state = {
  user1_token: "",
  user1_id: "",
  user2_token: "",
  user2_id: "",
  user3_token: "",
  user3_id: "",
  post_id: "",
  comment_id: "",       // comment by user1
  comment2_id: "",      // comment by user2 (for admin-delete test)
};

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
  console.log("\n\x1b[1m💬 Comments API Integration Tests\x1b[0m");
  console.log(`   Base URL: ${BASE_URL}\n`);

  // ─── 1. Setup ───────────────────────────────────────

  section("1. Setup — Login & create post");

  await test("1.1 Login as user1", async () => {
    const { status, body } = await supabaseLogin(USER1_EMAIL, USER1_PASSWORD);
    assert(status === 200, `expected 200, got ${status}`);
    state.user1_token = body.access_token;
    state.user1_id = body.user.id;
    console.log(`       user1_id: ${state.user1_id}`);
  });

  await test("1.2 Login as user2 (admin)", async () => {
    const { status, body } = await supabaseLogin(USER2_EMAIL, USER2_PASSWORD);
    assert(status === 200, `expected 200, got ${status}`);
    state.user2_token = body.access_token;
    state.user2_id = body.user.id;
    console.log(`       user2_id: ${state.user2_id}`);
  });

  await test("1.3 Login as user3 (regular, non-author)", async () => {
    const { status, body } = await supabaseLogin(USER3_EMAIL, USER3_PASSWORD);
    assert(status === 200, `expected 200, got ${status}`);
    state.user3_token = body.access_token;
    state.user3_id = body.user.id;
    console.log(`       user3_id: ${state.user3_id}`);
  });

  await test("1.4 user1 creates a post", async () => {
    const { status, body } = await api("POST", "/api/blog/posts", {
      token: state.user1_token,
      body: { title: "Post for comment tests", content: TIPTAP_DOC("Hello") },
    });
    assert(status === 201, `expected 201, got ${status}`);
    state.post_id = body.data.id;
    console.log(`       post_id: ${state.post_id}`);
  });

  await test("1.5 user2 follows user1 (needed to comment)", async () => {
    const { status } = await api("POST", `/api/blog/users/${state.user1_id}/follow`, {
      token: state.user2_token,
    });
    assert(status === 201, `expected 201, got ${status}`);
  });

  // ─── 2. GET Comments ────────────────────────────────

  section("2. GET /api/blog/posts/[id]/comments");

  await test("2.1 No token → 401", async () => {
    const { status, body } = await api("GET", `/api/blog/posts/${state.post_id}/comments`);
    assert(status === 401, `expected 401, got ${status}`);
    assert(body.error.code === "UNAUTHORIZED", `code: ${body.error.code}`);
  });

  await test("2.2 Author (user1) gets empty comments list", async () => {
    const { status, body } = await api("GET", `/api/blog/posts/${state.post_id}/comments`, {
      token: state.user1_token,
    });
    assert(status === 200, `expected 200, got ${status}`);
    assert(Array.isArray(body.data), "data not array");
    assert(body.data.length === 0, `expected 0, got ${body.data.length}`);
  });

  await test("2.3 Non-follower (user3) cannot get comments → 403", async () => {
    // user3 does not follow user1, so they cannot see user1's post or its comments
    const { status, body } = await api("GET", `/api/blog/posts/${state.post_id}/comments`, {
      token: state.user3_token,
    });
    assert(status === 403, `expected 403, got ${status}`);
    assert(body.error.code === "FORBIDDEN", `code: ${body.error.code}`);
  });

  await test("2.4 Non-follower (user3) cannot POST comment → 403", async () => {
    const { status, body } = await api("POST", `/api/blog/posts/${state.post_id}/comments`, {
      token: state.user3_token,
      body: { content: "sneaky comment" },
    });
    assert(status === 403, `expected 403, got ${status}`);
    assert(body.error.code === "FORBIDDEN", `code: ${body.error.code}`);
  });

  // ─── 3. POST Comment ────────────────────────────────

  section("3. POST /api/blog/posts/[id]/comments");

  await test("3.1 No token → 401", async () => {
    const { status } = await api("POST", `/api/blog/posts/${state.post_id}/comments`, {
      body: { content: "Nice post!" },
    });
    assert(status === 401, `expected 401, got ${status}`);
  });

  await test("3.2 Empty content → 400", async () => {
    const { status, body } = await api("POST", `/api/blog/posts/${state.post_id}/comments`, {
      token: state.user1_token,
      body: { content: "   " },
    });
    assert(status === 400, `expected 400, got ${status}`);
    assert(body.error.code === "BAD_REQUEST", `code: ${body.error.code}`);
  });

  await test("3.3 Missing content → 400", async () => {
    const { status, body } = await api("POST", `/api/blog/posts/${state.post_id}/comments`, {
      token: state.user1_token,
      body: {},
    });
    assert(status === 400, `expected 400, got ${status}`);
    assert(body.error.code === "BAD_REQUEST", `code: ${body.error.code}`);
  });

  await test("3.4 Author (user1) adds comment → 201", async () => {
    const { status, body } = await api("POST", `/api/blog/posts/${state.post_id}/comments`, {
      token: state.user1_token,
      body: { content: "My own comment" },
    });
    assert(status === 201, `expected 201, got ${status}`);
    assert(body.data.id, "missing comment id");
    assert(body.data.content === "My own comment", "wrong content");
    assert(body.data.author_id === state.user1_id, "wrong author");
    assert(body.data.profiles?.display_name, "missing display_name");
    state.comment_id = body.data.id;
    console.log(`       comment_id: ${state.comment_id}`);
  });

  await test("3.5 Follower (user2) adds comment → 201", async () => {
    const { status, body } = await api("POST", `/api/blog/posts/${state.post_id}/comments`, {
      token: state.user2_token,
      body: { content: "Great post!" },
    });
    assert(status === 201, `expected 201, got ${status}`);
    assert(body.data.author_id === state.user2_id, "wrong author");
    state.comment2_id = body.data.id;
    console.log(`       comment2_id: ${state.comment2_id}`);
  });

  await test("3.6 GET comments now returns 2 comments in order", async () => {
    const { status, body } = await api("GET", `/api/blog/posts/${state.post_id}/comments`, {
      token: state.user1_token,
    });
    assert(status === 200, `expected 200, got ${status}`);
    assert(body.data.length === 2, `expected 2, got ${body.data.length}`);
    assert(body.data[0].id === state.comment_id, "wrong order (first)");
    assert(body.data[1].id === state.comment2_id, "wrong order (second)");
  });

  // ─── 4. DELETE Comment ──────────────────────────────

  section("4. DELETE /api/blog/comments/[id]");

  await test("4.1 No token → 401", async () => {
    const { status } = await api("DELETE", `/api/blog/comments/${state.comment_id}`);
    assert(status === 401, `expected 401, got ${status}`);
  });

  await test("4.2 Non-author (user1) cannot delete user2's comment → 403", async () => {
    // user1 is not admin and not the author of comment2
    const { status, body } = await api("DELETE", `/api/blog/comments/${state.comment2_id}`, {
      token: state.user1_token,
    });
    assert(status === 403, `expected 403, got ${status}`);
    assert(body.error.code === "FORBIDDEN", `code: ${body.error.code}`);
  });

  await test("4.3 Author (user1) can delete own comment → 200", async () => {
    const { status, body } = await api("DELETE", `/api/blog/comments/${state.comment_id}`, {
      token: state.user1_token,
    });
    assert(status === 200, `expected 200, got ${status}`);
    assert(body.success === true, "success not true");
  });

  await test("4.4 Admin (user2) can delete any comment → 200", async () => {
    const { status, body } = await api("DELETE", `/api/blog/comments/${state.comment2_id}`, {
      token: state.user2_token,
    });
    assert(status === 200, `expected 200, got ${status}`);
    assert(body.success === true, "success not true");
  });

  await test("4.5 DELETE non-existent comment → 404", async () => {
    const { status, body } = await api("DELETE", "/api/blog/comments/00000000-0000-0000-0000-000000000000", {
      token: state.user1_token,
    });
    assert(status === 404, `expected 404, got ${status}`);
    assert(body.error.code === "NOT_FOUND", `code: ${body.error.code}`);
  });

  await test("4.6 GET comments now returns 0 after all deleted", async () => {
    const { status, body } = await api("GET", `/api/blog/posts/${state.post_id}/comments`, {
      token: state.user1_token,
    });
    assert(status === 200, `expected 200, got ${status}`);
    assert(body.data.length === 0, `expected 0, got ${body.data.length}`);
  });

  // ─── 5. Cleanup ─────────────────────────────────────

  section("5. Cleanup");

  await test("5.1 Delete test post", async () => {
    const { status } = await api("DELETE", `/api/blog/posts/${state.post_id}`, {
      token: state.user1_token,
    });
    assert(status === 200, `expected 200, got ${status}`);
  });

  await test("5.2 user2 unfollows user1", async () => {
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
