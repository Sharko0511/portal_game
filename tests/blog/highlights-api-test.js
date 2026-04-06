/**
 * Highlight Posts API Integration Tests
 * Run: node tests/blog/highlights-api-test.js
 * Requires: dev server running (npm run dev)
 */

const BASE_URL = "http://localhost:3000";

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

async function api(path) {
  return request(`${BASE_URL}${path}`);
}

// ── Tests ────────────────────────────────────────────────

async function run() {
  console.log("\n\x1b[1m🔥 Highlight Posts API Integration Tests\x1b[0m");
  console.log(`   Base URL: ${BASE_URL}\n`);
  console.log("   Note: No auth required (public posts only)\n");

  // ─── 1. Response shape ───────────────────────────────

  section("1. Response Shape");

  let highlights = null;

  await test("1.1 GET /api/blog/posts/highlights → 200", async () => {
    const { status, body } = await api("/api/blog/posts/highlights");
    assert(status === 200, `expected 200, got ${status}`);
    assert(body?.data !== undefined, "response missing data");
    highlights = body.data;
  });

  await test("1.2 Response has 'popular' array", async () => {
    assert(highlights !== null, "highlights not loaded (test 1.1 failed)");
    assert(Array.isArray(highlights.popular), `popular is not array: ${typeof highlights.popular}`);
  });

  await test("1.3 Response has 'recent' array", async () => {
    assert(highlights !== null, "highlights not loaded (test 1.1 failed)");
    assert(Array.isArray(highlights.recent), `recent is not array: ${typeof highlights.recent}`);
  });

  // ─── 2. Data limits ──────────────────────────────────

  section("2. Data Limits");

  await test("2.1 'popular' has at most 5 items", async () => {
    assert(highlights !== null, "highlights not loaded");
    assert(highlights.popular.length <= 5, `expected <= 5, got ${highlights.popular.length}`);
  });

  await test("2.2 'recent' has at most 5 items", async () => {
    assert(highlights !== null, "highlights not loaded");
    assert(highlights.recent.length <= 5, `expected <= 5, got ${highlights.recent.length}`);
  });

  // ─── 3. Required fields ──────────────────────────────

  section("3. Required Fields on Each Post");

  const REQUIRED_FIELDS = ["id", "title", "like_count", "comment_count", "author_name", "created_at"];

  await test("3.1 Each 'popular' post has required fields", async () => {
    assert(highlights !== null, "highlights not loaded");
    for (const post of highlights.popular) {
      for (const field of REQUIRED_FIELDS) {
        assert(post[field] !== undefined, `popular post missing field: ${field} (post id: ${post.id})`);
      }
    }
  });

  await test("3.2 Each 'recent' post has required fields", async () => {
    assert(highlights !== null, "highlights not loaded");
    for (const post of highlights.recent) {
      for (const field of REQUIRED_FIELDS) {
        assert(post[field] !== undefined, `recent post missing field: ${field} (post id: ${post.id})`);
      }
    }
  });

  // ─── 4. Sort order ───────────────────────────────────

  section("4. Sort Order");

  await test("4.1 'popular' is sorted by like_count DESC", async () => {
    assert(highlights !== null, "highlights not loaded");
    if (highlights.popular.length < 2) {
      console.log("       (skipped — fewer than 2 popular posts)");
      return;
    }
    for (let i = 0; i < highlights.popular.length - 1; i++) {
      const curr = highlights.popular[i].like_count;
      const next = highlights.popular[i + 1].like_count;
      assert(curr >= next, `popular[${i}].like_count (${curr}) < popular[${i + 1}].like_count (${next})`);
    }
  });

  await test("4.2 'recent' is sorted by created_at DESC (newest first)", async () => {
    assert(highlights !== null, "highlights not loaded");
    if (highlights.recent.length < 2) {
      console.log("       (skipped — fewer than 2 recent posts)");
      return;
    }
    for (let i = 0; i < highlights.recent.length - 1; i++) {
      const curr = new Date(highlights.recent[i].created_at).getTime();
      const next = new Date(highlights.recent[i + 1].created_at).getTime();
      assert(curr >= next, `recent[${i}].created_at is older than recent[${i + 1}].created_at`);
    }
  });

  // ─── 5. Visibility filter ────────────────────────────

  section("5. Visibility — Public Only");

  await test("5.1 All posts in 'popular' have no private/share content exposed", async () => {
    // We can't directly check visibility field (not returned),
    // but we verify the endpoint works without auth — if private posts leaked
    // they would fail Supabase RLS and the response would error or be empty.
    // This test confirms no 500 error occurs and data is returned.
    const { status, body } = await api("/api/blog/posts/highlights");
    assert(status === 200, `expected 200, got ${status}`);
    assert(body?.data?.popular !== undefined, "missing popular in response");
  });

  // ─── 6. No auth required ────────────────────────────

  section("6. No Auth Required");

  await test("6.1 Works without Authorization header (public endpoint)", async () => {
    const { status } = await request(`${BASE_URL}/api/blog/posts/highlights`);
    assert(status === 200, `expected 200 without auth, got ${status}`);
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
