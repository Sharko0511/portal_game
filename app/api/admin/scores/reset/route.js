import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";
import { getSupabaseAdmin } from "@/lib/supabase-server";

const VALID_GAMES = ["snake", "pong", "breakout"];

export async function POST(request) {
  const auth = await requireAdmin(request);
  if (auth.error) return auth.error;

  const body = await request.json();
  const { game } = body;

  if (!VALID_GAMES.includes(game)) {
    return NextResponse.json(
      { error: { code: "BAD_REQUEST", message: `game must be one of: ${VALID_GAMES.join(", ")}` } },
      { status: 400 }
    );
  }

  const supabase = getSupabaseAdmin();

  // Count before delete
  const { count } = await supabase
    .from("scores")
    .select("*", { count: "exact", head: true })
    .eq("game", game);

  const { error } = await supabase
    .from("scores")
    .delete()
    .eq("game", game);

  if (error) {
    return NextResponse.json(
      { error: { code: "INTERNAL_ERROR", message: error.message } },
      { status: 500 }
    );
  }

  return NextResponse.json({ success: true, deleted_count: count || 0 });
}
