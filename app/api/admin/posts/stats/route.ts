import { NextRequest, NextResponse } from "next/server";
import { requireAdmin, AuthResult, AuthError } from "@/lib/auth";
import { getSupabaseAdmin } from "@/lib/supabase-server";

export async function GET(request: NextRequest): Promise<NextResponse> {
  const auth: AuthResult | AuthError = await requireAdmin(request);
  if (auth.error) return auth.error;

  const { searchParams } = new URL(request.url);
  const search = searchParams.get("search") || "";
  const level = searchParams.get("level") || "all";
  const category = searchParams.get("category") || "all";

  const supabase = getSupabaseAdmin();

  // Build base query conditions
  let query = supabase.from("posts").select("id, visibility", { count: "exact", head: true });
  if (search) query = query.ilike("title", `%${search}%`);
  if (level !== "all") query = query.eq("level", level);
  if (category !== "all") query = query.eq("category", category);

  const { count: totalCount, error: totalError } = await query;

  if (totalError) {
    return NextResponse.json(
      { error: { code: "INTERNAL_ERROR", message: totalError.message } },
      { status: 500 }
    );
  }

  // Get counts by visibility
  const visibilities = ["public", "share", "private"] as const;
  const counts: Record<string, number> = {};

  for (const vis of visibilities) {
    let visQuery = supabase.from("posts").select("id", { count: "exact", head: true });
    if (search) visQuery = visQuery.ilike("title", `%${search}%`);
    if (level !== "all") visQuery = visQuery.eq("level", level);
    if (category !== "all") visQuery = visQuery.eq("category", category);
    visQuery = visQuery.eq("visibility", vis);

    const { count, error } = await visQuery;
    if (error) {
      return NextResponse.json(
        { error: { code: "INTERNAL_ERROR", message: error.message } },
        { status: 500 }
      );
    }
    counts[vis] = count ?? 0;
  }

  return NextResponse.json({
    total: totalCount ?? 0,
    public: counts["public"] ?? 0,
    share: counts["share"] ?? 0,
    private: counts["private"] ?? 0,
  });
}
