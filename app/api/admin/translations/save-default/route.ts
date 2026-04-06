import { NextRequest, NextResponse } from "next/server";
import { requireAdmin, AuthResult, AuthError } from "@/lib/auth";
import { getSupabaseAdmin } from "@/lib/supabase-server";

// ── POST /api/admin/translations/save-default ──────────────────────
// Overwrite the 'saved' snapshot with current translation values.
// Only works for EN or VI. Scope can be a single key, namespace, or full language.
//
// Body: {
//   language: string    -- "en" | "vi"
//   namespace?: string  -- optional: limit scope to one namespace
//   key?: string        -- optional: limit scope to one key (requires namespace)
// }
export async function POST(request: NextRequest): Promise<NextResponse> {
  const auth: AuthResult | AuthError = await requireAdmin(request);
  if (auth.error) return auth.error;

  const body: {
    language?: string;
    namespace?: string;
    key?: string;
  } = await request.json();

  const { language, namespace, key } = body;

  if (!language || !["en", "vi"].includes(language)) {
    return NextResponse.json(
      { error: { code: "BAD_REQUEST", message: "language must be 'en' or 'vi'" } },
      { status: 400 }
    );
  }

  const supabase = getSupabaseAdmin();

  // Fetch current translation values for the requested scope
  let query = supabase
    .from("translations")
    .select("language, namespace, key, value")
    .eq("language", language);

  if (namespace) query = query.eq("namespace", namespace);
  if (key && namespace) query = query.eq("key", key);

  const { data: current, error: fetchError } = await query;

  if (fetchError) {
    return NextResponse.json(
      { error: { code: "INTERNAL_ERROR", message: fetchError.message } },
      { status: 500 }
    );
  }

  if (!current?.length) {
    return NextResponse.json(
      { error: { code: "NOT_FOUND", message: "No translations found for the given scope" } },
      { status: 404 }
    );
  }

  // Upsert current values into the 'saved' snapshot
  const rows = current.map((r) => ({
    snapshot: "saved",
    language: r.language,
    namespace: r.namespace,
    key: r.key,
    value: r.value,
    saved_at: new Date().toISOString(),
  }));

  const { error: upsertError } = await supabase
    .from("translation_defaults")
    .upsert(rows, { onConflict: "snapshot,language,namespace,key" });

  if (upsertError) {
    return NextResponse.json(
      { error: { code: "INTERNAL_ERROR", message: upsertError.message } },
      { status: 500 }
    );
  }

  return NextResponse.json({ data: { saved: rows.length } });
}
