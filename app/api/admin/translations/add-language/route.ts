import { NextRequest, NextResponse } from "next/server";
import { requireAdmin, AuthResult, AuthError } from "@/lib/auth";
import { getSupabaseAdmin } from "@/lib/supabase-server";

const PROTECTED_LANGUAGES = ["en", "vi"];

// POST /api/admin/translations/add-language
// Body: { language: string }
// Creates empty rows for the new language across all existing (namespace, key) pairs.
export async function POST(request: NextRequest): Promise<NextResponse> {
  const auth: AuthResult | AuthError = await requireAdmin(request);
  if (auth.error) return auth.error;

  const body: { language?: string } = await request.json();
  const language = body.language?.trim().toLowerCase();

  if (!language) {
    return NextResponse.json(
      { error: { code: "BAD_REQUEST", message: "language is required" } },
      { status: 400 }
    );
  }

  if (PROTECTED_LANGUAGES.includes(language)) {
    return NextResponse.json(
      { error: { code: "CONFLICT", message: `Language '${language}' already exists as a built-in language` } },
      { status: 409 }
    );
  }

  const supabase = getSupabaseAdmin();

  // Check language doesn't already exist
  const { data: existing } = await supabase
    .from("translations")
    .select("id")
    .eq("language", language)
    .limit(1);

  if (existing?.length) {
    return NextResponse.json(
      { error: { code: "CONFLICT", message: `Language '${language}' already exists` } },
      { status: 409 }
    );
  }

  // Get all distinct (namespace, key) pairs from existing translations
  const { data: pairs, error: pairsError } = await supabase
    .from("translations")
    .select("namespace, key")
    .eq("language", "en"); // use EN as source of truth for all keys

  if (pairsError) {
    return NextResponse.json(
      { error: { code: "INTERNAL_ERROR", message: pairsError.message } },
      { status: 500 }
    );
  }

  if (!pairs?.length) {
    return NextResponse.json(
      { error: { code: "NOT_FOUND", message: "No existing translation keys found" } },
      { status: 404 }
    );
  }

  // Create empty rows for the new language
  const rows = pairs.map((p) => ({
    language,
    namespace: p.namespace,
    key: p.key,
    value: "",
  }));

  const { error: insertError } = await supabase
    .from("translations")
    .insert(rows);

  if (insertError) {
    return NextResponse.json(
      { error: { code: "INTERNAL_ERROR", message: insertError.message } },
      { status: 500 }
    );
  }

  return NextResponse.json({ data: { language, created: rows.length } }, { status: 201 });
}
