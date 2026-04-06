import { NextRequest, NextResponse } from "next/server";
import { requireAuth, AuthResult, AuthError } from "@/lib/auth";
import { getSupabaseAdmin } from "@/lib/supabase-server";

const UUID_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export async function GET(request: NextRequest): Promise<NextResponse> {
  const auth: AuthResult | AuthError = await requireAuth(request);
  if (auth.error) return auth.error;

  const { searchParams } = new URL(request.url);
  const q = searchParams.get("q")?.trim() ?? "";
  const limit = Math.min(parseInt(searchParams.get("limit") ?? "10"), 20);

  if (q.length < 2) {
    return NextResponse.json({ data: [] });
  }

  const supabase = getSupabaseAdmin();

  let query = supabase
    .from("profiles")
    .select("id, display_name")
    .neq("id", auth.user.id)
    .limit(limit);

  if (UUID_REGEX.test(q)) {
    query = query.or(`display_name.ilike.%${q}%,id.eq.${q}`);
  } else {
    query = query.ilike("display_name", `%${q}%`);
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
