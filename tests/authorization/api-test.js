/**
 * Game Portal API Auto Test
 * Run: node tests/api-test.js
 * Requires: dev server running (npm run dev)
 */

const BASE_URL = "http://localhost:3000";
const SUPABASE_URL = "https://eamozesrfwowbdegrfdl.supabase.co";
const SUPABASE_ANON_KEY = "sb_publishable_oClZjSnjYK-n6NRBbgNjMg_3QVn7I4b";

const ADMIN_EMAIL = "admin@admin.com";
const ADMIN_PASSWORD = "admin@123";
const USER_EMAIL = "user@user.com";
const USER_PASSWORD = "user@123";

// State shared between tests
const state = {
  admin_token: "",
  user_token: "",
  admin_user_id: "",
  test_user_id: "",
  test_score_id: "",
};

let passed = 0;
let failed = 0;
const failures = [];

// ── Helpers ──────────────────────────────────────────────

async function request(url, options = {}) {
  const res = await fetch(url, options);
  let body = null;
  try {
    body = await res.json();
  } catch {}
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

// ── Supabase auth helper ─────────────────────────────────

async function supabaseLogin(email, password) {
  return request(`${SUPABASE_URL}/auth/v1/token?grant_type=password`, {
    method: "POST",
    headers: {
      apikey: SUPABASE_ANON_KEY,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ email, password }),
  });
}

async function supabaseGet(path, token) {
  return request(`${SUPABASE_URL}/rest/v1/${path}`, {
    headers: {
      apikey: SUPABASE_ANON_KEY,
      Authorization: `Bearer ${token}`,
    },
  });
}

async function supabasePost(path, data, token) {
  return request(`${SUPABASE_URL}/rest/v1/${path}`, {
    method: "POST",
    headers: {
      apikey: SUPABASE_ANON_KEY,
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
      Prefer: "return=representation",
    },
    body: JSON.stringify(data),
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
  console.log("\n\x1b[1m🎮 Game Portal API Tests\x1b[0m");
  console.log(`   Base URL: ${BASE_URL}`);
  console.log(`   Supabase: ${SUPABASE_URL}\n`);

  // ─── 1. Auth Flow ───────────────────────────────────

  section("1. Auth Flow");

  await test("1.1 Login as Admin", async () => {
    const { status, body } = await supabaseLogin(ADMIN_EMAIL, ADMIN_PASSWORD);
    assert(status === 200, `expected 200, got ${status}`);
    assert(body.access_token, "no access_token");
    state.admin_token = body.access_token;
    state.admin_user_id = body.user.id;
  });

  await test("1.2 Login as User", async () => {
    const { status, body } = await supabaseLogin(USER_EMAIL, USER_PASSWORD);
    assert(status === 200, `expected 200, got ${status}`);
    assert(body.access_token, "no access_token");
    state.user_token = body.access_token;
    state.test_user_id = body.user.id;
  });

  await test("1.3 Login with wrong password → 400", async () => {
    const { status } = await supabaseLogin(ADMIN_EMAIL, "wrongpassword");
    assert(status === 400, `expected 400, got ${status}`);
  });

  await test("1.4 Verify admin profile has role=admin", async () => {
    const { status, body } = await supabaseGet(
      `profiles?id=eq.${state.admin_user_id}&select=*`,
      state.admin_token
    );
    assert(status === 200, `expected 200, got ${status}`);
    assert(body.length === 1, "expected 1 profile");
    assert(body[0].role === "admin", `expected admin, got ${body[0].role}`);
  });

  await test("1.5 Verify user profile has role=user", async () => {
    const { status, body } = await supabaseGet(
      `profiles?id=eq.${state.test_user_id}&select=*`,
      state.user_token
    );
    assert(status === 200, `expected 200, got ${status}`);
    assert(body[0].role === "user", `expected user, got ${body[0].role}`);
  });

  // ─── 2. Permission Tests ───────────────────────────

  section("2. Permission Tests (Negative)");

  await test("2.1 No token → admin/users → 401", async () => {
    const { status, body } = await api("GET", "/api/admin/users");
    assert(status === 401, `expected 401, got ${status}`);
    assert(body.error.code === "UNAUTHORIZED", `code: ${body.error.code}`);
  });

  await test("2.2 User token → admin/users → 403", async () => {
    const { status, body } = await api("GET", "/api/admin/users", {
      token: state.user_token,
    });
    assert(status === 403, `expected 403, got ${status}`);
    assert(body.error.code === "FORBIDDEN", `code: ${body.error.code}`);
  });

  await test("2.3 User token → admin/scores → 403", async () => {
    const { status } = await api("GET", "/api/admin/scores", {
      token: state.user_token,
    });
    assert(status === 403, `expected 403, got ${status}`);
  });

  await test("2.4 User token → admin/config → 403", async () => {
    const { status } = await api("GET", "/api/admin/config", {
      token: state.user_token,
    });
    assert(status === 403, `expected 403, got ${status}`);
  });

  await test("2.5 User token → admin/games → 403", async () => {
    const { status } = await api("GET", "/api/admin/games", {
      token: state.user_token,
    });
    assert(status === 403, `expected 403, got ${status}`);
  });

  await test("2.6 User token → admin/stats → 403", async () => {
    const { status } = await api("GET", "/api/admin/stats", {
      token: state.user_token,
    });
    assert(status === 403, `expected 403, got ${status}`);
  });

  await test("2.7 No token → admin/config PATCH → 401", async () => {
    const { status } = await api("PATCH", "/api/admin/config", {
      body: { key: "site_title", value: "hacked" },
    });
    assert(status === 401, `expected 401, got ${status}`);
  });

  // ─── 3. Admin - User Management ────────────────────

  section("3. Admin - User Management");

  await test("3.1 List all users", async () => {
    const { status, body } = await api("GET", "/api/admin/users", {
      token: state.admin_token,
    });
    assert(status === 200, `expected 200, got ${status}`);
    assert(Array.isArray(body.data), "data not an array");
    assert(body.data.length >= 2, `expected >= 2, got ${body.data.length}`);
    assert(typeof body.total === "number", "no total count");
  });

  await test("3.2 Search users by name", async () => {
    const { status, body } = await api(
      "GET",
      "/api/admin/users?search=Admin",
      { token: state.admin_token }
    );
    assert(status === 200, `expected 200, got ${status}`);
    assert(body.data.length >= 1, "no results");
    const names = body.data.map((u) => u.display_name.toLowerCase());
    assert(names.some((n) => n.includes("admin")), "search didn't match");
  });

  await test("3.3 Filter by role=admin", async () => {
    const { status, body } = await api(
      "GET",
      "/api/admin/users?role=admin",
      { token: state.admin_token }
    );
    assert(status === 200, `expected 200, got ${status}`);
    body.data.forEach((u) =>
      assert(u.role === "admin", `expected admin, got ${u.role}`)
    );
  });

  await test("3.4 Ban test user", async () => {
    const { status, body } = await api(
      "PATCH",
      `/api/admin/users/${state.test_user_id}/ban`,
      { token: state.admin_token, body: { is_banned: true } }
    );
    assert(status === 200, `expected 200, got ${status}`);
    assert(body.is_banned === true, "not banned");
  });

  await test("3.5 Unban test user", async () => {
    const { status, body } = await api(
      "PATCH",
      `/api/admin/users/${state.test_user_id}/ban`,
      { token: state.admin_token, body: { is_banned: false } }
    );
    assert(status === 200, `expected 200, got ${status}`);
    assert(body.is_banned === false, "still banned");
  });

  await test("3.6 Change user role to admin", async () => {
    const { status, body } = await api(
      "PATCH",
      `/api/admin/users/${state.test_user_id}/role`,
      { token: state.admin_token, body: { role: "admin" } }
    );
    assert(status === 200, `expected 200, got ${status}`);
    assert(body.role === "admin", `expected admin, got ${body.role}`);
  });

  await test("3.7 Revert user role to user", async () => {
    const { status, body } = await api(
      "PATCH",
      `/api/admin/users/${state.test_user_id}/role`,
      { token: state.admin_token, body: { role: "user" } }
    );
    assert(status === 200, `expected 200, got ${status}`);
    assert(body.role === "user", `expected user, got ${body.role}`);
  });

  await test("3.8 Cannot ban self → 409", async () => {
    const { status, body } = await api(
      "PATCH",
      `/api/admin/users/${state.admin_user_id}/ban`,
      { token: state.admin_token, body: { is_banned: true } }
    );
    assert(status === 409, `expected 409, got ${status}`);
    assert(body.error.code === "CONFLICT", `code: ${body.error.code}`);
  });

  await test("3.9 Cannot change own role → 409", async () => {
    const { status } = await api(
      "PATCH",
      `/api/admin/users/${state.admin_user_id}/role`,
      { token: state.admin_token, body: { role: "user" } }
    );
    assert(status === 409, `expected 409, got ${status}`);
  });

  await test("3.10 Invalid role value → 400", async () => {
    const { status } = await api(
      "PATCH",
      `/api/admin/users/${state.test_user_id}/role`,
      { token: state.admin_token, body: { role: "superadmin" } }
    );
    assert(status === 400, `expected 400, got ${status}`);
  });

  // ─── 4. Score Management ───────────────────────────

  section("4. Admin - Score Management");

  await test("4.1 User inserts score (snake)", async () => {
    const { status, body } = await supabasePost(
      "scores",
      {
        user_id: state.test_user_id,
        player_name: "User",
        score: 200,
        game: "snake",
      },
      state.user_token
    );
    assert(status === 201, `expected 201, got ${status} — ${JSON.stringify(body)}`);
    state.test_score_id = body[0].id;
  });

  await test("4.2 User inserts score (pong)", async () => {
    const { status } = await supabasePost(
      "scores",
      {
        user_id: state.test_user_id,
        player_name: "User",
        score: 5,
        game: "pong",
      },
      state.user_token
    );
    assert(status === 201, `expected 201, got ${status}`);
  });

  await test("4.3 Admin lists all scores", async () => {
    const { status, body } = await api("GET", "/api/admin/scores", {
      token: state.admin_token,
    });
    assert(status === 200, `expected 200, got ${status}`);
    assert(Array.isArray(body.data), "data not array");
    assert(body.data.length >= 2, `expected >= 2, got ${body.data.length}`);
  });

  await test("4.4 Filter scores by game=snake", async () => {
    const { status, body } = await api(
      "GET",
      "/api/admin/scores?game=snake",
      { token: state.admin_token }
    );
    assert(status === 200, `expected 200, got ${status}`);
    body.data.forEach((s) =>
      assert(s.game === "snake", `expected snake, got ${s.game}`)
    );
  });

  await test("4.5 Delete specific score", async () => {
    const { status, body } = await api(
      "DELETE",
      `/api/admin/scores/${state.test_score_id}`,
      { token: state.admin_token }
    );
    assert(status === 200, `expected 200, got ${status}`);
    assert(body.success === true, "not successful");
  });

  await test("4.6 Reset pong leaderboard", async () => {
    const { status, body } = await api(
      "POST",
      "/api/admin/scores/reset",
      { token: state.admin_token, body: { game: "pong" } }
    );
    assert(status === 200, `expected 200, got ${status}`);
    assert(body.success === true, "not successful");
  });

  await test("4.7 Verify pong scores empty", async () => {
    const { status, body } = await api(
      "GET",
      "/api/admin/scores?game=pong",
      { token: state.admin_token }
    );
    assert(status === 200, `expected 200, got ${status}`);
    assert(body.data.length === 0, `expected 0, got ${body.data.length}`);
  });

  await test("4.8 Invalid game reset → 400", async () => {
    const { status } = await api("POST", "/api/admin/scores/reset", {
      token: state.admin_token,
      body: { game: "invalid_game" },
    });
    assert(status === 400, `expected 400, got ${status}`);
  });

  // ─── 5. Game Config ────────────────────────────────

  section("5. Admin - Game Config");

  await test("5.1 Get all game configs", async () => {
    const { status, body } = await api("GET", "/api/admin/games", {
      token: state.admin_token,
    });
    assert(status === 200, `expected 200, got ${status}`);
    assert(body.data.length === 3, `expected 3, got ${body.data.length}`);
    const ids = body.data.map((g) => g.id);
    assert(ids.includes("snake"), "missing snake");
    assert(ids.includes("pong"), "missing pong");
    assert(ids.includes("breakout"), "missing breakout");
  });

  await test("5.2 Disable snake", async () => {
    const { status, body } = await api(
      "PATCH",
      "/api/admin/games/snake",
      { token: state.admin_token, body: { enabled: false } }
    );
    assert(status === 200, `expected 200, got ${status}`);
    assert(body.enabled === false, "not disabled");
  });

  await test("5.3 Verify snake hidden from public API", async () => {
    const { status, body } = await api("GET", "/api/games/config");
    assert(status === 200, `expected 200, got ${status}`);
    const ids = body.data.map((g) => g.id);
    assert(!ids.includes("snake"), "snake still visible");
    assert(ids.includes("pong"), "pong missing");
    assert(ids.includes("breakout"), "breakout missing");
  });

  await test("5.4 Re-enable snake", async () => {
    const { status, body } = await api(
      "PATCH",
      "/api/admin/games/snake",
      { token: state.admin_token, body: { enabled: true } }
    );
    assert(status === 200, `expected 200, got ${status}`);
    assert(body.enabled === true, "not enabled");
  });

  await test("5.5 Update snake speed to 80ms", async () => {
    const { status, body } = await api(
      "PATCH",
      "/api/admin/games/snake",
      {
        token: state.admin_token,
        body: {
          config: { speed: 80, grid_size: 20, growth_per_food: 1, score_per_food: 10 },
        },
      }
    );
    assert(status === 200, `expected 200, got ${status}`);
    assert(body.config.speed === 80, `expected 80, got ${body.config.speed}`);
  });

  await test("5.6 Reset snake config to defaults", async () => {
    const { status, body } = await api(
      "PATCH",
      "/api/admin/games/snake",
      {
        token: state.admin_token,
        body: {
          config: { speed: 120, grid_size: 20, growth_per_food: 1, score_per_food: 10 },
        },
      }
    );
    assert(status === 200, `expected 200, got ${status}`);
    assert(body.config.speed === 120, `expected 120, got ${body.config.speed}`);
  });

  await test("5.7 Invalid game PATCH → 404", async () => {
    const { status } = await api(
      "PATCH",
      "/api/admin/games/nonexistent",
      { token: state.admin_token, body: { enabled: false } }
    );
    assert(status === 404, `expected 404, got ${status}`);
  });

  // ─── 6. Site Config ────────────────────────────────

  section("6. Admin - Site Config");

  await test("6.1 Get site config", async () => {
    const { status, body } = await api("GET", "/api/admin/config", {
      token: state.admin_token,
    });
    assert(status === 200, `expected 200, got ${status}`);
    assert(body.data.length === 3, `expected 3, got ${body.data.length}`);
    const keys = body.data.map((c) => c.key);
    assert(keys.includes("site_title"), "missing site_title");
    assert(keys.includes("maintenance_mode"), "missing maintenance_mode");
    assert(keys.includes("registration_enabled"), "missing registration_enabled");
  });

  await test("6.2 Enable maintenance mode", async () => {
    const { status, body } = await api("PATCH", "/api/admin/config", {
      token: state.admin_token,
      body: { key: "maintenance_mode", value: true },
    });
    assert(status === 200, `expected 200, got ${status}`);
    assert(body.value === true, "not enabled");
  });

  await test("6.3 Disable maintenance mode", async () => {
    const { status, body } = await api("PATCH", "/api/admin/config", {
      token: state.admin_token,
      body: { key: "maintenance_mode", value: false },
    });
    assert(status === 200, `expected 200, got ${status}`);
    assert(body.value === false, "not disabled");
  });

  await test("6.4 Update site title", async () => {
    const { status, body } = await api("PATCH", "/api/admin/config", {
      token: state.admin_token,
      body: { key: "site_title", value: "My Game Portal" },
    });
    assert(status === 200, `expected 200, got ${status}`);
    assert(body.value === "My Game Portal", `got: ${body.value}`);
  });

  await test("6.5 Reset site title", async () => {
    const { status } = await api("PATCH", "/api/admin/config", {
      token: state.admin_token,
      body: { key: "site_title", value: "Game Portal" },
    });
    assert(status === 200, `expected 200, got ${status}`);
  });

  await test("6.6 Invalid config key → 404", async () => {
    const { status } = await api("PATCH", "/api/admin/config", {
      token: state.admin_token,
      body: { key: "nonexistent_key", value: "test" },
    });
    assert(status === 404, `expected 404, got ${status}`);
  });

  // ─── 7. Dashboard Stats ────────────────────────────

  section("7. Admin - Dashboard Stats");

  await test("7.1 Get dashboard stats", async () => {
    const { status, body } = await api("GET", "/api/admin/stats", {
      token: state.admin_token,
    });
    assert(status === 200, `expected 200, got ${status}`);
    assert(typeof body.total_users === "number", "missing total_users");
    assert(typeof body.total_scores === "number", "missing total_scores");
    assert(typeof body.scores_today === "number", "missing scores_today");
    assert(body.total_users >= 2, `expected >= 2 users, got ${body.total_users}`);
    assert(Array.isArray(body.top_players), "top_players not array");
    assert(Array.isArray(body.recent_scores), "recent_scores not array");
  });

  // ─── 8. Public API ─────────────────────────────────

  section("8. Public - Games Config");

  await test("8.1 Get enabled games (no auth)", async () => {
    const { status, body } = await api("GET", "/api/games/config");
    assert(status === 200, `expected 200, got ${status}`);
    assert(Array.isArray(body.data), "data not array");
    assert(body.data.length >= 1, "no games");
    body.data.forEach((g) => {
      assert(g.id, "missing id");
      assert(g.display_name, "missing display_name");
      assert(g.config, "missing config");
    });
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
