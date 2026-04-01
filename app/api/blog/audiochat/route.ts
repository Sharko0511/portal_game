import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase-server";

// Public endpoint — no auth required.
// Returns published posts that have an audio_url (any category),
// ordered newest first.
export async function GET(_request: NextRequest): Promise<NextResponse> {
  const supabase = getSupabaseAdmin();

  const { data, error } = await supabase
    .from("posts_with_counts")
    .select("*")
    .not("audio_url", "is", null)
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
