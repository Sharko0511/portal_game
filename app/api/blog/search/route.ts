import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase-server";

// Public search endpoint — no auth required.
// Only searches posts with visibility = 'public'.
//
// Query params:
//   q        — text search on title (case-insensitive contains)
//   level    — filter by CEFR level: A1 | A2 | B1 | B2 | C1 | C2
//   tag      — filter posts that contain this tag
//   category — filter by category: baohay | blog | audiochat (backwards-compat alias for audio_url IS NOT NULL)
//   limit    — max results (default 50, max 100)
//   offset   — pagination offset (default 0)

const VALID_LEVELS = ["A1", "A2", "B1", "B2", "C1", "C2"] as const;
const VALID_CATEGORIES = ["blog", "baohay", "audiochat"] as const;

export async function GET(request: NextRequest): Promise<NextResponse> {
  const { searchParams } = new URL(request.url);

  const q = searchParams.get("q")?.trim() ?? "";
  const level = searchParams.get("level");
  const tag = searchParams.get("tag");
  const category = searchParams.get("category");
  const limit = Math.min(parseInt(searchParams.get("limit") ?? "50"), 100);
  const offset = parseInt(searchParams.get("offset") ?? "0");

  // Validate optional enum params
  if (level && !VALID_LEVELS.includes(level as typeof VALID_LEVELS[number])) {
    return NextResponse.json(
      { error: { code: "BAD_REQUEST", message: `level must be one of: ${VALID_LEVELS.join(", ")}` } },
      { status: 400 }
    );
  }
  if (category && !VALID_CATEGORIES.includes(category as typeof VALID_CATEGORIES[number])) {
    return NextResponse.json(
      { error: { code: "BAD_REQUEST", message: `category must be one of: ${VALID_CATEGORIES.join(", ")}` } },
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
  if (category === "audiochat") {
    // Backwards-compatible: ?category=audiochat now means "has audio"
    query = query.not("audio_url", "is", null);
  } else if (category) {
    query = query.eq("category", category);
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
