import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase-server";

const HIGHLIGHT_FIELDS = [
  "id",
  "title",
  "cover_image_url",
  "like_count",
  "comment_count",
  "author_name",
  "author_id",
  "created_at",
  "slug",
] as const;

const SELECT = HIGHLIGHT_FIELDS.join(", ");

export async function GET(): Promise<NextResponse> {
  const supabase = getSupabaseAdmin();

  const [popularResult, recentResult] = await Promise.all([
    supabase
      .from("posts_with_counts")
      .select(SELECT)
      .eq("visibility", "public")
      .order("like_count", { ascending: false })
      .order("comment_count", { ascending: false })
      .limit(5),

    supabase
      .from("posts_with_counts")
      .select(SELECT)
      .eq("visibility", "public")
      .order("created_at", { ascending: false })
      .limit(5),
  ]);

  if (popularResult.error) {
    return NextResponse.json(
      { error: { code: "INTERNAL_ERROR", message: popularResult.error.message } },
      { status: 500 }
    );
  }

  if (recentResult.error) {
    return NextResponse.json(
      { error: { code: "INTERNAL_ERROR", message: recentResult.error.message } },
      { status: 500 }
    );
  }

  return NextResponse.json({
    data: {
      popular: popularResult.data ?? [],
      recent: recentResult.data ?? [],
    },
  });
}
