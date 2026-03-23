import { NextRequest, NextResponse } from "next/server";
import { requireAdmin, AuthResult, AuthError } from "@/lib/auth";
import { getSupabaseAdmin } from "@/lib/supabase-server";

const PROTECTED_LANGUAGES = ["en", "vi"];

// ── GET /api/admin/translations ────────────────────────────────────
export async function GET(request: NextRequest): Promise<NextResponse> {
  const auth: AuthResult | AuthError = await requireAdmin(request);
  if (auth.error) return auth.error;

  const { searchParams } = new URL(request.url);
  const namespace = searchParams.get("namespace");

  const supabase = getSupabaseAdmin();

  let query = supabase
    .from("translations")
    .select("id, language, namespace, key, value, updated_at")
    .order("namespace")
    .order("key")
    .order("language");

  if (namespace) query = query.eq("namespace", namespace);

  const { data, error } = await query;

  if (error) {
    return NextResponse.json(
      { error: { code: "INTERNAL_ERROR", message: error.message } },
      { status: 500 }
    );
  }

  const languages = [...new Set(data?.map((r) => r.language) ?? [])].sort();
  const namespaces = [...new Set(data?.map((r) => r.namespace) ?? [])].sort();

  return NextResponse.json({ data, languages, namespaces });
}

// ── POST /api/admin/translations ───────────────────────────────────
// Create a new key across multiple languages
// Body: { namespace, key, values: { [lang]: string } }
export async function POST(request: NextRequest): Promise<NextResponse> {
  const auth: AuthResult | AuthError = await requireAdmin(request);
  if (auth.error) return auth.error;

  const body: { namespace?: string; key?: string; values?: Record<string, string> } =
    await request.json();
  const { namespace, key, values } = body;

  if (!namespace?.trim() || !key?.trim() || !values || Object.keys(values).length === 0) {
    return NextResponse.json(
      { error: { code: "BAD_REQUEST", message: "namespace, key, and values are required" } },
      { status: 400 }
    );
  }

  const supabase = getSupabaseAdmin();

  const { data: existing } = await supabase
    .from("translations")
    .select("id")
    .eq("namespace", namespace)
    .eq("key", key)
    .limit(1);

  if (existing?.length) {
    return NextResponse.json(
      { error: { code: "CONFLICT", message: `Key '${namespace}.${key}' already exists` } },
      { status: 409 }
    );
  }

  const rows = Object.entries(values)
    .filter(([, v]) => v !== undefined)
    .map(([language, value]) => ({
      language,
      namespace: namespace.trim(),
      key: key.trim(),
      value,
    }));

  const { data, error } = await supabase
    .from("translations")
    .insert(rows)
    .select("id, language, namespace, key, value, updated_at");

  if (error) {
    return NextResponse.json(
      { error: { code: "INTERNAL_ERROR", message: error.message } },
      { status: 500 }
    );
  }

  return NextResponse.json({ data }, { status: 201 });
}

// ── PATCH /api/admin/translations ──────────────────────────────────
// Update (or create) a single cell value
// Body: { language, namespace, key, value }
export async function PATCH(request: NextRequest): Promise<NextResponse> {
  const auth: AuthResult | AuthError = await requireAdmin(request);
  if (auth.error) return auth.error;

  const body: { language?: string; namespace?: string; key?: string; value?: string } =
    await request.json();
  const { language, namespace, key, value } = body;

  if (!language || !namespace || !key || value === undefined) {
    return NextResponse.json(
      { error: { code: "BAD_REQUEST", message: "language, namespace, key, and value are required" } },
      { status: 400 }
    );
  }

  const supabase = getSupabaseAdmin();

  const { data, error } = await supabase
    .from("translations")
    .upsert(
      { language, namespace, key, value },
      { onConflict: "language,namespace,key" }
    )
    .select("id, language, namespace, key, value, updated_at")
    .single();

  if (error) {
    return NextResponse.json(
      { error: { code: "INTERNAL_ERROR", message: error.message } },
      { status: 500 }
    );
  }

  return NextResponse.json({ data });
}

// ── DELETE /api/admin/translations ─────────────────────────────────
// ?namespace=X&key=Y  → delete key across ALL languages
// ?language=fr        → delete entire language (blocked for en/vi)
export async function DELETE(request: NextRequest): Promise<NextResponse> {
  const auth: AuthResult | AuthError = await requireAdmin(request);
  if (auth.error) return auth.error;

  const { searchParams } = new URL(request.url);
  const namespace = searchParams.get("namespace");
  const key = searchParams.get("key");
  const language = searchParams.get("language");

  const supabase = getSupabaseAdmin();

  if (language) {
    if (PROTECTED_LANGUAGES.includes(language)) {
      return NextResponse.json(
        { error: { code: "FORBIDDEN", message: `Cannot delete built-in language '${language}'` } },
        { status: 403 }
      );
    }

    const { error, count } = await supabase
      .from("translations")
      .delete({ count: "exact" })
      .eq("language", language);

    if (error) {
      return NextResponse.json(
        { error: { code: "INTERNAL_ERROR", message: error.message } },
        { status: 500 }
      );
    }

    return NextResponse.json({ data: { deleted: count ?? 0 } });
  }

  if (namespace && key) {
    const { error, count } = await supabase
      .from("translations")
      .delete({ count: "exact" })
      .eq("namespace", namespace)
      .eq("key", key);

    if (error) {
      return NextResponse.json(
        { error: { code: "INTERNAL_ERROR", message: error.message } },
        { status: 500 }
      );
    }

    return NextResponse.json({ data: { deleted: count ?? 0 } });
  }

  return NextResponse.json(
    {
      error: {
        code: "BAD_REQUEST",
        message: "Provide ?namespace&key to delete a key, or ?language to delete a language",
      },
    },
    { status: 400 }
  );
}
