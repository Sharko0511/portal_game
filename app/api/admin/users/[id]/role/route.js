import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";
import { getSupabaseAdmin } from "@/lib/supabase-server";

export async function PATCH(request, { params }) {
  const auth = await requireAdmin(request);
  if (auth.error) return auth.error;

  const { id } = await params;

  if (id === auth.profile.id) {
    return NextResponse.json(
      { error: { code: "CONFLICT", message: "Cannot change your own role" } },
      { status: 409 }
    );
  }

  const body = await request.json();
  const { role } = body;

  if (!["user", "admin"].includes(role)) {
    return NextResponse.json(
      { error: { code: "BAD_REQUEST", message: "role must be 'user' or 'admin'" } },
      { status: 400 }
    );
  }

  const supabase = getSupabaseAdmin();

  const { data, error } = await supabase
    .from("profiles")
    .update({ role })
    .eq("id", id)
    .select("id, display_name, role")
    .single();

  if (error) {
    return NextResponse.json(
      { error: { code: "NOT_FOUND", message: "User not found" } },
      { status: 404 }
    );
  }

  return NextResponse.json(data);
}
