import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";
import { getSupabaseAdmin } from "@/lib/supabase-server";

export async function PATCH(request, { params }) {
  const auth = await requireAdmin(request);
  if (auth.error) return auth.error;

  const { id } = await params;
  const body = await request.json();

  const supabase = getSupabaseAdmin();

  // Check game exists
  const { data: existing } = await supabase
    .from("game_config")
    .select("id")
    .eq("id", id)
    .single();

  if (!existing) {
    return NextResponse.json(
      { error: { code: "NOT_FOUND", message: "Game not found" } },
      { status: 404 }
    );
  }

  const updates = { updated_by: auth.profile.id };
  if (typeof body.enabled === "boolean") {
    updates.enabled = body.enabled;
  }
  if (body.config && typeof body.config === "object") {
    updates.config = body.config;
  }

  const { data, error } = await supabase
    .from("game_config")
    .update(updates)
    .eq("id", id)
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
