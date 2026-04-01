import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase-server";

// Public endpoint — no auth required.
// Returns all published admin-authored posts (blog + baohay),
// ordered newest first. Audio is an optional field on any post.
export async function GET(_request: NextRequest): Promise<NextResponse> {
  const supabase = getSupabaseAdmin();

  const { data, error } = await supabase
    .from("posts_with_counts")
    .select("*")
    .in("category", ["blog", "baohay"])
    .eq("visibility", "public")
    .order("created_at", { ascending: false });

  if (error) {
    return NextResponse.json(
      { error: { code: "INTERNAL_ERROR", message: error.message } },
      { status: 500 }
    );
  }

  return NextResponse.json({ data: data ?? [] });
}
