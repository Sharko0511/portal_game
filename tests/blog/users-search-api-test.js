/**
 * User Search API Integration Tests
 * Run: node tests/blog/users-search-api-test.js
 * Requires: dev server running (npm run dev)
 */

const BASE_URL = "http://localhost:3000";
const SUPABASE_URL = "https://eamozesrfwowbdegrfdl.supabase.co";
const SUPABASE_ANON_KEY = "sb_publishable_oClZjSnjYK-n6NRBbgNjMg_3QVn7I4b";

const USER1_EMAIL = "user@user.com";
const USER1_PASSWORD = "user@123";
const USER2_EMAIL = "admin@admin.com";
const USER2_PASSWORD = "admin@123";

const state = {
  user1_token: "",
  user1_id: "",
  user2_id: "",
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
  console.log("\n\x1b[1m🔍 User Search API Integration Tests\x1b[0m");
  console.log(`   Base URL: ${BASE_URL}\n`);

  // ─── 1. Setup ────────────────────────────────────────

  section("1. Setup — Login");

  await test("1.1 Login as user1 (user@user.com)", async () => {
    const { status, body } = await supabaseLogin(USER1_EMAIL, USER1_PASSWORD);
    assert(status === 200, `expected 200, got ${status}`);
    state.user1_token = body.access_token;
    state.user1_id = body.user.id;
    console.log(`       user1_id: ${state.user1_id}`);
  });

  await test("1.2 Login as user2 (admin@admin.com) — to get user2_id", async () => {
    const { status, body } = await supabaseLogin(USER2_EMAIL, USER2_PASSWORD);
    assert(status === 200, `expected 200, got ${status}`);
    state.user2_id = body.user.id;
    console.log(`       user2_id: ${state.user2_id}`);
  });

  // ─── 2. Auth guard ───────────────────────────────────

  section("2. Auth Guard");

  await test("2.1 No token → 401", async () => {
    const { status, body } = await api("GET", "/api/blog/users/search?q=admin");
    assert(status === 401, `expected 401, got ${status}`);
    assert(body?.error?.code === "UNAUTHORIZED", `code: ${body?.error?.code}`);
  });

  // ─── 3. Query validation ──────────────────────────────

  section("3. Query Validation");

  await test("3.1 Empty q → returns empty array (not error)", async () => {
    const { status, body } = await api("GET", "/api/blog/users/search?q=", {
      token: state.user1_token,
    });
    assert(status === 200, `expected 200, got ${status}`);
    assert(Array.isArray(body.data), "data not array");
    assert(body.data.length === 0, `expected [], got ${body.data.length} results`);
  });

  await test("3.2 q with 1 character → returns empty array", async () => {
    const { status, body } = await api("GET", "/api/blog/users/search?q=a", {
      token: state.user1_token,
    });
    assert(status === 200, `expected 200, got ${status}`);
    assert(Array.isArray(body.data), "data not array");
    assert(body.data.length === 0, `expected [], got ${body.data.length} results`);
  });

  // ─── 4. Search by display_name ───────────────────────

  section("4. Search by display_name");

  await test("4.1 Search 'admin' → returns results with id + display_name", async () => {
    const { status, body } = await api("GET", "/api/blog/users/search?q=admin", {
      token: state.user1_token,
    });
    assert(status === 200, `expected 200, got ${status}`);
    assert(Array.isArray(body.data), "data not array");
    assert(body.data.length > 0, "expected at least 1 result");
    const first = body.data[0];
    assert(typeof first.id === "string", "result missing id");
    assert(typeof first.display_name === "string", "result missing display_name");
  });

  await test("4.2 Search is case-insensitive (uppercase 'ADMIN')", async () => {
    const { status, body } = await api("GET", "/api/blog/users/search?q=ADMIN", {
      token: state.user1_token,
    });
    assert(status === 200, `expected 200, got ${status}`);
    assert(body.data.length > 0, "expected results for uppercase query");
  });

  await test("4.3 Search with no match → returns empty array", async () => {
    const { status, body } = await api("GET", "/api/blog/users/search?q=zzznomatch999", {
      token: state.user1_token,
    });
    assert(status === 200, `expected 200, got ${status}`);
    assert(Array.isArray(body.data), "data not array");
    assert(body.data.length === 0, `expected 0 results, got ${body.data.length}`);
  });

  // ─── 5. Self-exclusion ───────────────────────────────

  section("5. Self-exclusion");

  await test("5.1 Current user does NOT appear in own search results", async () => {
    // user1 display_name is "User" — search for it
    const { status, body } = await api("GET", "/api/blog/users/search?q=user", {
      token: state.user1_token,
    });
    assert(status === 200, `expected 200, got ${status}`);
    const ids = body.data.map((u) => u.id);
    assert(!ids.includes(state.user1_id), "current user should NOT appear in results");
  });

  // ─── 6. Search by UUID ───────────────────────────────

  section("6. Search by UUID");

  await test("6.1 Search by exact user2 UUID → returns that user", async () => {
    const { status, body } = await api(
      "GET",
      `/api/blog/users/search?q=${state.user2_id}`,
      { token: state.user1_token }
    );
    assert(status === 200, `expected 200, got ${status}`);
    assert(Array.isArray(body.data), "data not array");
    const found = body.data.find((u) => u.id === state.user2_id);
    assert(found !== undefined, `user2 (${state.user2_id}) not found in results`);
  });

  // ─── 7. Limit ────────────────────────────────────────

  section("7. Limit param");

  await test("7.1 limit=1 → returns at most 1 result", async () => {
    const { status, body } = await api("GET", "/api/blog/users/search?q=user&limit=1", {
      token: state.user1_token,
    });
    assert(status === 200, `expected 200, got ${status}`);
    assert(body.data.length <= 1, `expected <= 1 result, got ${body.data.length}`);
  });

  // ─── Summary ─────────────────────────────────────────

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
