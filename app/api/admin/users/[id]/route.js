import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";
import { getSupabaseAdmin } from "@/lib/supabase-server";

export async function DELETE(request, { params }) {
  const auth = await requireAdmin(request);
  if (auth.error) return auth.error;

  const { id } = await params;

  if (id === auth.profile.id) {
    return NextResponse.json(
      { error: { code: "CONFLICT", message: "Cannot delete your own account" } },
      { status: 409 }
    );
  }

  const supabase = getSupabaseAdmin();

  // Check user exists
  const { data: target } = await supabase
    .from("profiles")
    .select("id")
    .eq("id", id)
    .single();

  if (!target) {
    return NextResponse.json(
      { error: { code: "NOT_FOUND", message: "User not found" } },
      { status: 404 }
    );
  }

  // Delete from auth.users (cascades to profiles + scores)
  const { error } = await supabase.auth.admin.deleteUser(id);

  if (error) {
    return NextResponse.json(
      { error: { code: "INTERNAL_ERROR", message: error.message } },
      { status: 500 }
    );
  }

  return NextResponse.json({ success: true });
}
