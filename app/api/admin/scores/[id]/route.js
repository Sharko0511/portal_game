import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";
import { getSupabaseAdmin } from "@/lib/supabase-server";

export async function DELETE(request, { params }) {
  const auth = await requireAdmin(request);
  if (auth.error) return auth.error;

  const { id } = await params;
  const supabase = getSupabaseAdmin();

  const { error } = await supabase
    .from("scores")
    .delete()
    .eq("id", parseInt(id));

  if (error) {
    return NextResponse.json(
      { error: { code: "NOT_FOUND", message: "Score not found" } },
      { status: 404 }
    );
  }

  return NextResponse.json({ success: true });
}
