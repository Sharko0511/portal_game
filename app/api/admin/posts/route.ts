import { NextRequest, NextResponse } from "next/server";
import { requireAdmin, AuthResult, AuthError } from "@/lib/auth";
import { getSupabaseAdmin } from "@/lib/supabase-server";

export async function GET(request: NextRequest): Promise<NextResponse> {
  const auth: AuthResult | AuthError = await requireAdmin(request);
  if (auth.error) return auth.error;

  const { searchParams } = new URL(request.url);
  const search = searchParams.get("search") || "";
  const visibility = searchParams.get("visibility") || "all";
  const level = searchParams.get("level") || "all";
  const category = searchParams.get("category") || "all";
  const sort = searchParams.get("sort") || "newest";
  const page = parseInt(searchParams.get("page") || "1");
  const limit = parseInt(searchParams.get("limit") || "20");
  const offset = (page - 1) * limit;

  const supabase = getSupabaseAdmin();

  let query = supabase
    .from("posts_with_counts")
    .select(
      "id, title, slug, author_id, author_name, author_role, visibility, category, level, tags, reading_time, word_count, cover_image_url, like_count, comment_count, created_at, updated_at",
      { count: "exact" }
    );

  if (search) {
    query = query.ilike("title", `%${search}%`);
  }
  if (visibility !== "all") {
    query = query.eq("visibility", visibility);
  }
  if (level !== "all") {
    query = query.eq("level", level);
  }
  if (category !== "all") {
    query = query.eq("category", category);
  }

  if (sort === "oldest") {
    query = query.order("created_at", { ascending: true });
  } else if (sort === "most_liked") {
    query = query.order("like_count", { ascending: false });
  } else {
    query = query.order("created_at", { ascending: false });
  }

  const { data, count, error } = await query.range(offset, offset + limit - 1);

  if (error) {
    return NextResponse.json(
      { error: { code: "INTERNAL_ERROR", message: error.message } },
      { status: 500 }
    );
  }

  return NextResponse.json({
    data: data ?? [],
    total: count ?? 0,
    page,
    totalPages: Math.ceil((count ?? 0) / limit),
  });
}
