import { NextRequest, NextResponse } from "next/server";
import { requireAdmin, AuthResult, AuthError } from "@/lib/auth";
import { getSupabaseAdmin } from "@/lib/supabase-server";

// ── POST /api/admin/translations/revert ────────────────────────────
// Restore EN or VI values from a chosen snapshot milestone.
//
// Body: {
//   snapshot: "v1" | "saved"   -- which milestone to restore from
//   language: string           -- "en" | "vi"
//   namespace?: string         -- optional: limit to one namespace
//   key?: string               -- optional: limit to one key (requires namespace)
// }
export async function POST(request: NextRequest): Promise<NextResponse> {
  const auth: AuthResult | AuthError = await requireAdmin(request);
  if (auth.error) return auth.error;

  const body: {
    snapshot?: string;
    language?: string;
    namespace?: string;
    key?: string;
  } = await request.json();

  const { snapshot, language, namespace, key } = body;

  if (!snapshot || !["v1", "saved"].includes(snapshot)) {
    return NextResponse.json(
      { error: { code: "BAD_REQUEST", message: "snapshot must be 'v1' or 'saved'" } },
      { status: 400 }
    );
  }

  if (!language) {
    return NextResponse.json(
      { error: { code: "BAD_REQUEST", message: "language is required" } },
      { status: 400 }
    );
  }

  const supabase = getSupabaseAdmin();

  // Fetch matching rows from defaults
  let defaultsQuery = supabase
    .from("translation_defaults")
    .select("language, namespace, key, value")
    .eq("snapshot", snapshot)
    .eq("language", language);

  if (namespace) defaultsQuery = defaultsQuery.eq("namespace", namespace);
  if (key && namespace) defaultsQuery = defaultsQuery.eq("key", key);

  const { data: defaults, error: fetchError } = await defaultsQuery;

  if (fetchError) {
    return NextResponse.json(
      { error: { code: "INTERNAL_ERROR", message: fetchError.message } },
      { status: 500 }
    );
  }

  if (!defaults?.length) {
    return NextResponse.json(
      {
        error: {
          code: "NOT_FOUND",
          message: `No '${snapshot}' defaults found for the given scope`,
        },
      },
      { status: 404 }
    );
  }

  // Upsert all matched defaults back into translations
  const rows = defaults.map((d) => ({
    language: d.language,
    namespace: d.namespace,
    key: d.key,
    value: d.value,
  }));

  const { error: upsertError } = await supabase
    .from("translations")
    .upsert(rows, { onConflict: "language,namespace,key" });

  if (upsertError) {
    return NextResponse.json(
      { error: { code: "INTERNAL_ERROR", message: upsertError.message } },
      { status: 500 }
    );
  }

  return NextResponse.json({ data: { reverted: rows.length, snapshot } });
}
