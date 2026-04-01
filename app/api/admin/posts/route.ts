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
  const limit = parseInt(searchParams.get("limit") || "10");
  const offset = (page - 1) * limit;

  const supabase = getSupabaseAdmin();

  // ── Count query on posts table (no GROUP BY, fast) ──────────
  let countQuery = supabase
    .from("posts")
    .select("id", { count: "exact", head: true });

  if (search) countQuery = countQuery.ilike("title", `%${search}%`);
  if (visibility !== "all") countQuery = countQuery.eq("visibility", visibility);
  if (level !== "all") countQuery = countQuery.eq("level", level);
  if (category !== "all") countQuery = countQuery.eq("category", category);

  const { count, error: countError } = await countQuery;

  if (countError) {
    return NextResponse.json(
      { error: { code: "INTERNAL_ERROR", message: countError.message } },
      { status: 500 }
    );
  }

  // ── Data query on view (includes like/comment counts) ───────
  let dataQuery = supabase
    .from("posts_with_counts")
    .select(
      "id, title, slug, author_id, author_name, author_role, visibility, category, level, tags, reading_time, word_count, cover_image_url, like_count, comment_count, created_at, updated_at"
    );

  if (search) dataQuery = dataQuery.ilike("title", `%${search}%`);
  if (visibility !== "all") dataQuery = dataQuery.eq("visibility", visibility);
  if (level !== "all") dataQuery = dataQuery.eq("level", level);
  if (category !== "all") dataQuery = dataQuery.eq("category", category);

  if (sort === "oldest") {
    dataQuery = dataQuery.order("created_at", { ascending: true });
  } else if (sort === "most_liked") {
    dataQuery = dataQuery.order("like_count", { ascending: false });
  } else {
    dataQuery = dataQuery.order("created_at", { ascending: false });
  }

  const { data, error: dataError } = await dataQuery.range(offset, offset + limit - 1);

  if (dataError) {
    return NextResponse.json(
      { error: { code: "INTERNAL_ERROR", message: dataError.message } },
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
