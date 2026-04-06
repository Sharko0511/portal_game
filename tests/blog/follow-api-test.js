/**
 * Follow API Integration Tests
 * Run: node tests/blog/follow-api-test.js
 * Requires: dev server running (npm run dev)
 */

const BASE_URL = "http://localhost:3000";
const SUPABASE_URL = "https://eamozesrfwowbdegrfdl.supabase.co";
const SUPABASE_ANON_KEY = "sb_publishable_oClZjSnjYK-n6NRBbgNjMg_3QVn7I4b";

// Uses the two existing test users
const USER1_EMAIL = "user@user.com";
const USER1_PASSWORD = "user@123";
const USER2_EMAIL = "admin@admin.com";
const USER2_PASSWORD = "admin@123";

const state = {
  user1_token: "",
  user1_id: "",
  user2_token: "",
  user2_id: "",
};

let passed = 0;
let failed = 0;
const failures = [];

// ── Helpers ──────────────────────────────────────────────

async function request(url, options = {}) {
  const res = await fetch(url, options);
  let body = null;
  try { body = await res.json(); } catch { }
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
  console.log("\n\x1b[1m📝 Follow API Integration Tests\x1b[0m");
  console.log(`   Base URL: ${BASE_URL}\n`);

  // ─── 1. Login ───────────────────────────────────────

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

  // ─── 1.3 Ensure clean state (user1 NOT following user2) ──

  await test("1.3 Ensure user1 is NOT following user2 before tests", async () => {
    const { status, body } = await api("GET", `/api/blog/users/${state.user2_id}/follow`, {
      token: state.user1_token,
    });
    assert(status === 200, `expected 200, got ${status}`);
    if (body.data.following === true) {
      // Already following — unfollow to reset
      await api("POST", `/api/blog/users/${state.user2_id}/follow`, {
        token: state.user1_token,
      });
    }
  });

  // ─── 2. Follow Status ──────────────────────────────

  section("2. GET /api/blog/users/[id]/follow — Status");

  await test("2.1 No token → 401", async () => {
    const { status, body } = await api("GET", `/api/blog/users/${state.user2_id}/follow`);
    assert(status === 401, `expected 401, got ${status}`);
    assert(body.error.code === "UNAUTHORIZED", `code: ${body.error.code}`);
  });

  await test("2.2 user1 is NOT following user2 initially", async () => {
    const { status, body } = await api("GET", `/api/blog/users/${state.user2_id}/follow`, {
      token: state.user1_token,
    });
    assert(status === 200, `expected 200, got ${status}`);
    assert(body.data.following === false, `expected false, got ${body.data.following}`);
  });

  // ─── 3. Follow Toggle ─────────────────────────────

  section("3. POST /api/blog/users/[id]/follow — Toggle");

  await test("3.1 No token → 401", async () => {
    const { status, body } = await api("POST", `/api/blog/users/${state.user2_id}/follow`);
    assert(status === 401, `expected 401, got ${status}`);
    assert(body.error.code === "UNAUTHORIZED", `code: ${body.error.code}`);
  });

  await test("3.2 user1 follows user2 → 201, following: true", async () => {
    const { status, body } = await api("POST", `/api/blog/users/${state.user2_id}/follow`, {
      token: state.user1_token,
    });
    assert(status === 201, `expected 201, got ${status}`);
    assert(body.data.following === true, `expected true, got ${body.data.following}`);
  });

  await test("3.3 Status now returns following: true", async () => {
    const { status, body } = await api("GET", `/api/blog/users/${state.user2_id}/follow`, {
      token: state.user1_token,
    });
    assert(status === 200, `expected 200, got ${status}`);
    assert(body.data.following === true, `expected true, got ${body.data.following}`);
  });

  await test("3.4 user1 unfollows user2 → 200, following: false", async () => {
    const { status, body } = await api("POST", `/api/blog/users/${state.user2_id}/follow`, {
      token: state.user1_token,
    });
    assert(status === 200, `expected 200, got ${status}`);
    assert(body.data.following === false, `expected false, got ${body.data.following}`);
  });

  await test("3.5 Status now returns following: false again", async () => {
    const { status, body } = await api("GET", `/api/blog/users/${state.user2_id}/follow`, {
      token: state.user1_token,
    });
    assert(status === 200, `expected 200, got ${status}`);
    assert(body.data.following === false, `expected false, got ${body.data.following}`);
  });

  await test("3.6 Cannot follow yourself → 400", async () => {
    const { status, body } = await api("POST", `/api/blog/users/${state.user1_id}/follow`, {
      token: state.user1_token,
    });
    assert(status === 400, `expected 400, got ${status}`);
    assert(body.error.code === "BAD_REQUEST", `code: ${body.error.code}`);
  });

  // ─── 4. Followers / Following ──────────────────────

  section("4. Followers & Following Lists");

  // Follow first so there's data to verify
  await test("4.1 user1 follows user2 (setup for list tests)", async () => {
    const { status, body } = await api("POST", `/api/blog/users/${state.user2_id}/follow`, {
      token: state.user1_token,
    });
    assert(status === 201, `expected 201, got ${status}`);
    assert(body.data.following === true, "should be following");
  });

  await test("4.2 No token → GET followers → 401", async () => {
    const { status } = await api("GET", `/api/blog/users/${state.user2_id}/followers`);
    assert(status === 401, `expected 401, got ${status}`);
  });

  await test("4.3 GET user2 followers → includes user1", async () => {
    const { status, body } = await api("GET", `/api/blog/users/${state.user2_id}/followers`, {
      token: state.user1_token,
    });
    assert(status === 200, `expected 200, got ${status}`);
    assert(Array.isArray(body.data), "data not array");
    const ids = body.data.map((r) => r.follower_id);
    assert(ids.includes(state.user1_id), "user1 not in followers list");
  });

  await test("4.4 No token → GET following → 401", async () => {
    const { status } = await api("GET", `/api/blog/users/${state.user1_id}/following`);
    assert(status === 401, `expected 401, got ${status}`);
  });

  await test("4.5 GET user1 following → includes user2", async () => {
    const { status, body } = await api("GET", `/api/blog/users/${state.user1_id}/following`, {
      token: state.user1_token,
    });
    assert(status === 200, `expected 200, got ${status}`);
    assert(Array.isArray(body.data), "data not array");
    const ids = body.data.map((r) => r.following_id);
    assert(ids.includes(state.user2_id), "user2 not in following list");
  });

  // ─── 5. Cleanup ────────────────────────────────────

  section("5. Cleanup");

  await test("5.1 user1 unfollows user2 (cleanup)", async () => {
    const { status, body } = await api("POST", `/api/blog/users/${state.user2_id}/follow`, {
      token: state.user1_token,
    });
    assert(status === 200, `expected 200, got ${status}`);
    assert(body.data.following === false, "cleanup: should be unfollowed");
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
