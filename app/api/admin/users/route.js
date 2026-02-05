import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";
import { getSupabaseAdmin } from "@/lib/supabase-server";

export async function GET(request) {
  const auth = await requireAdmin(request);
  if (auth.error) return auth.error;

  const { searchParams } = new URL(request.url);
  const search = searchParams.get("search") || "";
  const role = searchParams.get("role");
  const banned = searchParams.get("banned");
  const page = parseInt(searchParams.get("page") || "1");
  const limit = parseInt(searchParams.get("limit") || "20");
  const offset = (page - 1) * limit;

  const supabase = getSupabaseAdmin();

  let query = supabase
    .from("profiles")
    .select("*", { count: "exact" });

  if (search) {
    query = query.or(`display_name.ilike.%${search}%,email.ilike.%${search}%`);
  }
  if (role) {
    query = query.eq("role", role);
  }
  if (banned === "true") {
    query = query.eq("is_banned", true);
  } else if (banned === "false") {
    query = query.eq("is_banned", false);
  }

  const { data: profiles, count, error } = await query
    .order("created_at", { ascending: false })
    .range(offset, offset + limit - 1);

  if (error) {
    return NextResponse.json(
      { error: { code: "INTERNAL_ERROR", message: error.message } },
      { status: 500 }
    );
  }

  // Get score counts per user
  const scoreCounts = {};
  for (const p of profiles) {
    const { count: c } = await supabase
      .from("scores")
      .select("*", { count: "exact", head: true })
      .eq("user_id", p.id);
    scoreCounts[p.id] = c || 0;
  }

  const data = profiles.map((p) => ({
    ...p,
    score_count: scoreCounts[p.id] || 0,
  }));

  return NextResponse.json({ data, total: count, page, limit });
}
