import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase-server";

export async function GET(request: NextRequest): Promise<NextResponse> {
  const { searchParams } = new URL(request.url);
  const limitPerCategory = Math.min(
    parseInt(searchParams.get("limitPerCategory") ?? "6", 10),
    24
  );

  const supabase = getSupabaseAdmin();

  const { data: categories, error: categoriesError } = await supabase
    .from("categories")
    .select("id, slug, name, description, is_hot, is_active, sort_order")
    .eq("is_active", true)
    .eq("is_hot", true)
    .order("sort_order", { ascending: true })
    .order("name", { ascending: true });

  if (categoriesError) {
    return NextResponse.json(
      { error: { code: "INTERNAL_ERROR", message: categoriesError.message } },
      { status: 500 }
    );
  }

  const rows = categories ?? [];

  const categoryResults = await Promise.all(
    rows.map(async (category) => {
      const { data: mappingRows, error: mappingError } = await supabase
        .from("post_categories")
        .select("post_id")
        .eq("category_id", category.id)
        .limit(200);

      if (mappingError) {
        return {
          ...category,
          posts: [],
          _error: mappingError.message,
        };
      }

      const postIds = (mappingRows ?? []).map((r) => r.post_id);

      const mappedPostsPromise = postIds.length
        ? supabase
          .from("posts_with_counts")
          .select("*")
          .in("id", postIds)
          .eq("visibility", "public")
          .order("created_at", { ascending: false })
          .limit(limitPerCategory)
        : Promise.resolve({ data: [], error: null } as const);

      const legacyPostsPromise = supabase
        .from("posts_with_counts")
        .select("*")
        .eq("category", category.slug)
        .eq("visibility", "public")
        .order("created_at", { ascending: false })
        .limit(limitPerCategory);

      const [mappedPostsRes, legacyPostsRes] = await Promise.all([
        mappedPostsPromise,
        legacyPostsPromise,
      ]);

      const mappedError = mappedPostsRes.error;
      const legacyError = legacyPostsRes.error;

      if (mappedError && legacyError) {
        return {
          ...category,
          posts: [],
          _error: `${mappedError.message} | ${legacyError.message}`,
        };
      }

      const mergedById = new Map<string, Record<string, unknown>>();

      for (const post of mappedPostsRes.data ?? []) {
        const p = post as Record<string, unknown>;
        if (typeof p.id === "string") mergedById.set(p.id, p);
      }
      for (const post of legacyPostsRes.data ?? []) {
        const p = post as Record<string, unknown>;
        if (typeof p.id === "string") mergedById.set(p.id, p);
      }

      const mergedPosts = [...mergedById.values()]
        .sort((a, b) => {
          const aDate = new Date(String(a.created_at ?? 0)).getTime();
          const bDate = new Date(String(b.created_at ?? 0)).getTime();
          return bDate - aDate;
        })
        .slice(0, limitPerCategory);

      return {
        ...category,
        posts: mergedPosts,
      };
    })
  );

  return NextResponse.json({ data: categoryResults });
}
