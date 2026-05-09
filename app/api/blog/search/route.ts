import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase-server";

// Public search endpoint — no auth required.
// Only searches posts with visibility = 'public'.
//
// Query params:
//   q        — text search on title (case-insensitive contains)
//   level    — filter by CEFR level: A1 | A2 | B1 | B2 | C1 | C2
//   tag      — filter posts that contain this tag
//   category — single category slug (or audiochat alias)
//   categories — comma-separated category slugs
//   categoriesMode — any | all (default any)
//   limit    — max results (default 50, max 100)
//   offset   — pagination offset (default 0)

const VALID_LEVELS = ["A1", "A2", "B1", "B2", "C1", "C2"] as const;

export async function GET(request: NextRequest): Promise<NextResponse> {
  const { searchParams } = new URL(request.url);

  const q = searchParams.get("q")?.trim() ?? "";
  const level = searchParams.get("level");
  const tag = searchParams.get("tag");
  const category = searchParams.get("category");
  const categories = searchParams.get("categories");
  const categoriesMode = (searchParams.get("categoriesMode") ?? "any").toLowerCase();
  const limit = Math.min(parseInt(searchParams.get("limit") ?? "50"), 100);
  const offset = parseInt(searchParams.get("offset") ?? "0");
  const categorySlugs = Array.from(
    new Set(
      (categories ? categories.split(",") : [])
        .map((slug) => slug.trim().toLowerCase())
        .filter(Boolean)
    )
  );

  if (category && category !== "audiochat") {
    categorySlugs.push(category.trim().toLowerCase());
  }

  // Validate optional enum params
  if (level && !VALID_LEVELS.includes(level as typeof VALID_LEVELS[number])) {
    return NextResponse.json(
      { error: { code: "BAD_REQUEST", message: `level must be one of: ${VALID_LEVELS.join(", ")}` } },
      { status: 400 }
    );
  }
  if (!["any", "all"].includes(categoriesMode)) {
    return NextResponse.json(
      { error: { code: "BAD_REQUEST", message: "categoriesMode must be one of: any, all" } },
      { status: 400 }
    );
  }

  const supabase = getSupabaseAdmin();

  let query = supabase
    .from("posts_with_counts")
    .select("*")
    .eq("visibility", "public")
    .order("created_at", { ascending: false })
    .range(offset, offset + limit - 1);

  if (q) {
    query = query.ilike("title", `%${q}%`);
  }
  if (level) {
    query = query.eq("level", level);
  }
  if (tag) {
    query = query.contains("tags", [tag]);
  }

  if (categorySlugs.length > 0) {
    const { data: categoryRows, error: categoryError } = await supabase
      .from("categories")
      .select("id, slug")
      .in("slug", categorySlugs)
      .eq("is_active", true);

    if (categoryError) {
      return NextResponse.json(
        { error: { code: "INTERNAL_ERROR", message: categoryError.message } },
        { status: 500 }
      );
    }

    if ((categoryRows ?? []).length !== categorySlugs.length) {
      return NextResponse.json(
        { error: { code: "BAD_REQUEST", message: "One or more categories are invalid or inactive" } },
        { status: 400 }
      );
    }

    const categoryIds = (categoryRows ?? []).map((row) => row.id);
    let matchedPostIds: string[] = [];

    if (categoriesMode === "all") {
      let intersection: Set<string> | null = null;

      for (const categoryId of categoryIds) {
        const { data: mappingRows, error: mappingError } = await supabase
          .from("post_categories")
          .select("post_id")
          .eq("category_id", categoryId);

        if (mappingError) {
          return NextResponse.json(
            { error: { code: "INTERNAL_ERROR", message: mappingError.message } },
            { status: 500 }
          );
        }

        const ids = new Set<string>(
          (mappingRows ?? []).map((row) => String(row.post_id))
        );
        intersection =
          intersection === null
            ? ids
            : new Set([...intersection].filter((id: string) => ids.has(id)));
      }

      matchedPostIds = intersection ? [...intersection] : [];
    } else {
      const { data: mappingRows, error: mappingError } = await supabase
        .from("post_categories")
        .select("post_id")
        .in("category_id", categoryIds);

      if (mappingError) {
        return NextResponse.json(
          { error: { code: "INTERNAL_ERROR", message: mappingError.message } },
          { status: 500 }
        );
      }

      matchedPostIds = Array.from(
        new Set((mappingRows ?? []).map((row) => String(row.post_id)))
      );
    }

    if (matchedPostIds.length === 0) {
      return NextResponse.json({ data: [] });
    }

    query = query.in("id", matchedPostIds);
  }

  if (category === "audiochat") {
    // Backwards-compatible: ?category=audiochat now means "has audio"
    query = query.not("audio_url", "is", null);
  }

  const { data, error } = await query;

  if (error) {
    return NextResponse.json(
      { error: { code: "INTERNAL_ERROR", message: error.message } },
      { status: 500 }
    );
  }

  return NextResponse.json({ data: data ?? [] });
}
