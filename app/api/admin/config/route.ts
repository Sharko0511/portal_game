import { NextRequest, NextResponse } from "next/server";
import { requireAdmin, AuthResult, AuthError } from "@/lib/auth";
import { getSupabaseAdmin } from "@/lib/supabase-server";

export async function GET(request: NextRequest): Promise<NextResponse> {
  const auth: AuthResult | AuthError = await requireAdmin(request);
  if (auth.error) return auth.error;

  const supabase = getSupabaseAdmin();

  const { data, error } = await supabase
    .from("site_config")
    .select("*")
    .order("key");

  if (error) {
    return NextResponse.json(
      { error: { code: "INTERNAL_ERROR", message: error.message } },
      { status: 500 }
    );
  }

  return NextResponse.json({ data });
}

export async function PATCH(request: NextRequest): Promise<NextResponse> {
  const auth: AuthResult | AuthError = await requireAdmin(request);
  if (auth.error) return auth.error;

  const body: { key?: string; value?: unknown } = await request.json();
  const { key, value } = body;

  if (!key) {
    return NextResponse.json(
      { error: { code: "BAD_REQUEST", message: "key is required" } },
      { status: 400 }
    );
  }

  const supabase = getSupabaseAdmin();

  // Check key exists
  const { data: existing } = await supabase
    .from("site_config")
    .select("key")
    .eq("key", key)
    .single();

  if (!existing) {
    return NextResponse.json(
      { error: { code: "NOT_FOUND", message: `Config key '${key}' not found` } },
      { status: 404 }
    );
  }

  const { data, error } = await supabase
    .from("site_config")
    .update({ value })
    .eq("key", key)
    .select("*")
    .single();

  if (error) {
    return NextResponse.json(
      { error: { code: "INTERNAL_ERROR", message: error.message } },
      { status: 500 }
    );
  }

  return NextResponse.json(data);
}
