/**
 * Likes API Integration Tests
 * Run: node tests/blog/likes-api-test.js
 * Requires: dev server running (npm run dev)
 */

const BASE_URL = "http://localhost:3000";
const SUPABASE_URL = "https://eamozesrfwowbdegrfdl.supabase.co";
const SUPABASE_ANON_KEY = "sb_publishable_oClZjSnjYK-n6NRBbgNjMg_3QVn7I4b";

const USER1_EMAIL = "user@user.com";       // regular user (post author)
const USER1_PASSWORD = "useruser";
const USER2_EMAIL = "admin@admin.com";     // admin (follower)
const USER2_PASSWORD = "admin@123";
const USER3_EMAIL = "user2@user.com";      // regular user (non-follower)
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
  console.log("\n\x1b[1m❤️  Likes API Integration Tests\x1b[0m");
  console.log(`   Base URL: ${BASE_URL}\n`);

  // ─── 1. Setup ───────────────────────────────────────

  section("1. Setup — Login & create post");

  await test("1.1 Login as user1 (post author)", async () => {
    const { status, body } = await supabaseLogin(USER1_EMAIL, USER1_PASSWORD);
    assert(status === 200, `expected 200, got ${status}`);
    state.user1_token = body.access_token;
    state.user1_id = body.user.id;
    console.log(`       user1_id: ${state.user1_id}`);
  });

  await test("1.2 Login as user2 (admin / follower)", async () => {
    const { status, body } = await supabaseLogin(USER2_EMAIL, USER2_PASSWORD);
    assert(status === 200, `expected 200, got ${status}`);
    state.user2_token = body.access_token;
    state.user2_id = body.user.id;
    console.log(`       user2_id: ${state.user2_id}`);
  });

  await test("1.3 Login as user3 (non-follower)", async () => {
    const { status, body } = await supabaseLogin(USER3_EMAIL, USER3_PASSWORD);
    assert(status === 200, `expected 200, got ${status}`);
    state.user3_token = body.access_token;
    state.user3_id = body.user.id;
    console.log(`       user3_id: ${state.user3_id}`);
  });

  await test("1.4 user1 creates a post", async () => {
    const { status, body } = await api("POST", "/api/blog/posts", {
      token: state.user1_token,
      body: { title: "Post for like tests", content: TIPTAP_DOC("Like me") },
    });
    assert(status === 201, `expected 201, got ${status}`);
    state.post_id = body.data.id;
    console.log(`       post_id: ${state.post_id}`);
  });

  await test("1.5 user2 follows user1", async () => {
    const { status } = await api("POST", `/api/blog/users/${state.user1_id}/follow`, {
      token: state.user2_token,
    });
    assert(status === 201, `expected 201, got ${status}`);
  });

  // ─── 2. GET Like Status ─────────────────────────────

  section("2. GET /api/blog/posts/[id]/like — Status");

  await test("2.1 No token → 401", async () => {
    const { status, body } = await api("GET", `/api/blog/posts/${state.post_id}/like`);
    assert(status === 401, `expected 401, got ${status}`);
    assert(body.error.code === "UNAUTHORIZED", `code: ${body.error.code}`);
  });

  await test("2.2 Author (user1) — not liked initially", async () => {
    const { status, body } = await api("GET", `/api/blog/posts/${state.post_id}/like`, {
      token: state.user1_token,
    });
    assert(status === 200, `expected 200, got ${status}`);
    assert(body.data.liked === false, `expected false, got ${body.data.liked}`);
  });

  await test("2.3 Follower (user2) — not liked initially", async () => {
    const { status, body } = await api("GET", `/api/blog/posts/${state.post_id}/like`, {
      token: state.user2_token,
    });
    assert(status === 200, `expected 200, got ${status}`);
    assert(body.data.liked === false, `expected false, got ${body.data.liked}`);
  });

  // ─── 3. POST Like Toggle ────────────────────────────

  section("3. POST /api/blog/posts/[id]/like — Toggle");

  await test("3.1 No token → 401", async () => {
    const { status, body } = await api("POST", `/api/blog/posts/${state.post_id}/like`);
    assert(status === 401, `expected 401, got ${status}`);
    assert(body.error.code === "UNAUTHORIZED", `code: ${body.error.code}`);
  });

  await test("3.2 Non-follower (user3) cannot like → 403", async () => {
    const { status, body } = await api("POST", `/api/blog/posts/${state.post_id}/like`, {
      token: state.user3_token,
    });
    assert(status === 403, `expected 403, got ${status}`);
    assert(body.error.code === "FORBIDDEN", `code: ${body.error.code}`);
  });

  await test("3.3 Author (user1) likes own post → 201, liked: true", async () => {
    const { status, body } = await api("POST", `/api/blog/posts/${state.post_id}/like`, {
      token: state.user1_token,
    });
    assert(status === 201, `expected 201, got ${status}`);
    assert(body.data.liked === true, `expected true, got ${body.data.liked}`);
  });

  await test("3.4 GET status now returns liked: true for user1", async () => {
    const { status, body } = await api("GET", `/api/blog/posts/${state.post_id}/like`, {
      token: state.user1_token,
    });
    assert(status === 200, `expected 200, got ${status}`);
    assert(body.data.liked === true, `expected true, got ${body.data.liked}`);
  });

  await test("3.5 Follower (user2) likes post → 201, liked: true", async () => {
    const { status, body } = await api("POST", `/api/blog/posts/${state.post_id}/like`, {
      token: state.user2_token,
    });
    assert(status === 201, `expected 201, got ${status}`);
    assert(body.data.liked === true, `expected true, got ${body.data.liked}`);
  });

  await test("3.6 Post feed shows like_count: 2", async () => {
    const { status, body } = await api("GET", `/api/blog/posts/${state.post_id}`, {
      token: state.user1_token,
    });
    assert(status === 200, `expected 200, got ${status}`);
    assert(body.data.like_count === 2, `expected 2, got ${body.data.like_count}`);
  });

  await test("3.7 user1 unlikes post → 200, liked: false", async () => {
    const { status, body } = await api("POST", `/api/blog/posts/${state.post_id}/like`, {
      token: state.user1_token,
    });
    assert(status === 200, `expected 200, got ${status}`);
    assert(body.data.liked === false, `expected false, got ${body.data.liked}`);
  });

  await test("3.8 GET status now returns liked: false for user1", async () => {
    const { status, body } = await api("GET", `/api/blog/posts/${state.post_id}/like`, {
      token: state.user1_token,
    });
    assert(status === 200, `expected 200, got ${status}`);
    assert(body.data.liked === false, `expected false, got ${body.data.liked}`);
  });

  await test("3.9 Post feed shows like_count: 1 after user1 unliked", async () => {
    const { status, body } = await api("GET", `/api/blog/posts/${state.post_id}`, {
      token: state.user1_token,
    });
    assert(status === 200, `expected 200, got ${status}`);
    assert(body.data.like_count === 1, `expected 1, got ${body.data.like_count}`);
  });

  await test("3.10 Like non-existent post → 403 (not found = not visible)", async () => {
    const { status } = await api("POST", "/api/blog/posts/00000000-0000-0000-0000-000000000000/like", {
      token: state.user1_token,
    });
    assert(status === 403, `expected 403, got ${status}`);
  });

  // ─── 4. Cleanup ─────────────────────────────────────

  section("4. Cleanup");

  await test("4.1 user2 unlikes post", async () => {
    const { status, body } = await api("POST", `/api/blog/posts/${state.post_id}/like`, {
      token: state.user2_token,
    });
    assert(status === 200, `expected 200, got ${status}`);
    assert(body.data.liked === false, "should be unliked");
  });

  await test("4.2 Delete test post", async () => {
    const { status } = await api("DELETE", `/api/blog/posts/${state.post_id}`, {
      token: state.user1_token,
    });
    assert(status === 200, `expected 200, got ${status}`);
  });

  await test("4.3 user2 unfollows user1", async () => {
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
