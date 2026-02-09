import { NextRequest, NextResponse } from "next/server";
import { requireAdmin, AuthResult, AuthError } from "@/lib/auth";
import { getSupabaseAdmin } from "@/lib/supabase-server";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse> {
  const auth: AuthResult | AuthError = await requireAdmin(request);
  if (auth.error) return auth.error;

  const { id } = await params;

  if (id === auth.profile.id) {
    return NextResponse.json(
      { error: { code: "CONFLICT", message: "Cannot ban your own account" } },
      { status: 409 }
    );
  }

  const body: { is_banned?: unknown } = await request.json();
  const { is_banned } = body;

  if (typeof is_banned !== "boolean") {
    return NextResponse.json(
      { error: { code: "BAD_REQUEST", message: "is_banned must be a boolean" } },
      { status: 400 }
    );
  }

  const supabase = getSupabaseAdmin();

  const { data, error } = await supabase
    .from("profiles")
    .update({ is_banned })
    .eq("id", id)
    .select("id, display_name, is_banned")
    .single();

  if (error) {
    return NextResponse.json(
      { error: { code: "NOT_FOUND", message: "User not found" } },
      { status: 404 }
    );
  }

  return NextResponse.json(data);
}
