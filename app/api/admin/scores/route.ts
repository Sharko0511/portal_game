import { NextRequest, NextResponse } from "next/server";
import { requireAdmin, AuthResult, AuthError } from "@/lib/auth";
import { getSupabaseAdmin } from "@/lib/supabase-server";

export async function GET(request: NextRequest): Promise<NextResponse> {
  const auth: AuthResult | AuthError = await requireAdmin(request);
  if (auth.error) return auth.error;

  const { searchParams } = new URL(request.url);
  const game = searchParams.get("game");
  const player = searchParams.get("player");
  const sort = searchParams.get("sort") || "created_at";
  const order = searchParams.get("order") || "desc";
  const page = parseInt(searchParams.get("page") || "1");
  const limit = parseInt(searchParams.get("limit") || "20");
  const offset = (page - 1) * limit;

  const supabase = getSupabaseAdmin();

  let query = supabase
    .from("scores")
    .select("*", { count: "exact" });

  if (game) {
    query = query.eq("game", game);
  }
  if (player) {
    query = query.ilike("player_name", `%${player}%`);
  }

  const ascending = order === "asc";
  const { data, count, error } = await query
    .order(sort, { ascending })
    .range(offset, offset + limit - 1);

  if (error) {
    return NextResponse.json(
      { error: { code: "INTERNAL_ERROR", message: error.message } },
      { status: 500 }
    );
  }

  return NextResponse.json({ data, total: count, page, limit });
}
