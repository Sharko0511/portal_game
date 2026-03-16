import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase-server";

// Public endpoint — no auth required.
// Returns published admin-authored posts with category = 'audiochat',
// ordered newest first.
export async function GET(_request: NextRequest): Promise<NextResponse> {
  const supabase = getSupabaseAdmin();

  const { data, error } = await supabase
    .from("posts_with_counts")
    .select("*")
    .eq("category", "audiochat")
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
