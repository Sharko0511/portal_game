import { NextRequest, NextResponse } from "next/server";
import { requireAdmin, AuthResult, AuthError } from "@/lib/auth";
import { getSupabaseAdmin } from "@/lib/supabase-server";


export async function GET(request: NextRequest): Promise<NextResponse> {
  const auth: AuthResult | AuthError = await requireAdmin(request);
  if (auth.error) return auth.error;

  const supabase = getSupabaseAdmin();

  const { data, error } = await supabase
    .from("theme_config")
    .select("*")
    .order("theme")
    .order("group_name")
    .order("variable");

  if (error) {
    return NextResponse.json(
      { error: { code: "INTERNAL_ERROR", message: error.message } },
      { status: 500 }
    );
  }

  return NextResponse.json({ data });
}

// Update a single variable's value
export async function PATCH(request: NextRequest): Promise<NextResponse> {
  const auth: AuthResult | AuthError = await requireAdmin(request);
  if (auth.error) return auth.error;

  const body: { variable?: string; theme?: string; value?: string } = await request.json();
  const { variable, theme, value } = body;

  if (!variable || !theme || value === undefined) {
    return NextResponse.json(
      { error: { code: "BAD_REQUEST", message: "variable, theme, and value are required" } },
      { status: 400 }
    );
  }

  const supabase = getSupabaseAdmin();

  const { data, error } = await supabase
    .from("theme_config")
    .update({ value, updated_at: new Date().toISOString() })
    .eq("variable", variable)
    .eq("theme", theme)
    .select("*")
    .single();

  if (error) {
    return NextResponse.json(
      { error: { code: "INTERNAL_ERROR", message: error.message } },
      { status: 500 }
    );
  }

  return NextResponse.json({ data });
}

// Add a new theme by copying all variables from a source theme
export async function POST(request: NextRequest): Promise<NextResponse> {
  const auth: AuthResult | AuthError = await requireAdmin(request);
  if (auth.error) return auth.error;

  const body: { name?: string; copyFrom?: string } = await request.json();
  const { name, copyFrom = "light" } = body;

  if (!name?.trim()) {
    return NextResponse.json(
      { error: { code: "BAD_REQUEST", message: "name is required" } },
      { status: 400 }
    );
  }

  const themeName = name.trim().toLowerCase().replace(/\s+/g, "-");

  const supabase = getSupabaseAdmin();

  // Check theme doesn't already exist
  const { data: existing } = await supabase
    .from("theme_config")
    .select("theme")
    .eq("theme", themeName)
    .limit(1);

  if (existing?.length) {
    return NextResponse.json(
      { error: { code: "CONFLICT", message: `Theme '${themeName}' already exists` } },
      { status: 409 }
    );
  }

  // Copy all rows from source theme
  const { data: source, error: srcError } = await supabase
    .from("theme_config")
    .select("variable, value, label, group_name, description")
    .eq("theme", copyFrom);

  if (srcError || !source?.length) {
    return NextResponse.json(
      { error: { code: "NOT_FOUND", message: `Source theme '${copyFrom}' not found` } },
      { status: 404 }
    );
  }

  const rows = source.map((r) => ({ ...r, theme: themeName }));

  const { error: insertError } = await supabase
    .from("theme_config")
    .insert(rows);

  if (insertError) {
    return NextResponse.json(
      { error: { code: "INTERNAL_ERROR", message: insertError.message } },
      { status: 500 }
    );
  }

  return NextResponse.json({ data: { theme: themeName, variables: rows.length } }, { status: 201 });
}

// Delete an entire theme
export async function DELETE(request: NextRequest): Promise<NextResponse> {
  const auth: AuthResult | AuthError = await requireAdmin(request);
  if (auth.error) return auth.error;

  const { searchParams } = new URL(request.url);
  const theme = searchParams.get("theme");

  if (!theme) {
    return NextResponse.json(
      { error: { code: "BAD_REQUEST", message: "theme query param is required" } },
      { status: 400 }
    );
  }

  if (theme === "light" || theme === "dark") {
    return NextResponse.json(
      { error: { code: "FORBIDDEN", message: "Cannot delete the built-in light or dark themes" } },
      { status: 403 }
    );
  }

  const supabase = getSupabaseAdmin();

  const { error } = await supabase
    .from("theme_config")
    .delete()
    .eq("theme", theme);

  if (error) {
    return NextResponse.json(
      { error: { code: "INTERNAL_ERROR", message: error.message } },
      { status: 500 }
    );
  }

  return NextResponse.json({ data: { deleted: theme } });
}
