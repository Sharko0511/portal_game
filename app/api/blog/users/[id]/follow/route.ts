import { NextRequest, NextResponse } from "next/server";
import { requireAuth, AuthResult, AuthError } from "@/lib/auth";
import { getSupabaseAdmin } from "@/lib/supabase-server";

type Params = { params: Promise<{ id: string }> };

export async function GET(
  request: NextRequest,
  { params }: Params
): Promise<NextResponse> {
  const auth: AuthResult | AuthError = await requireAuth(request);
  if (auth.error) return auth.error;

  const { id } = await params;
  const supabase = getSupabaseAdmin();

  const { data, error } = await supabase
    .from("follows")
    .select("id")
    .eq("follower_id", auth.user.id)
    .eq("following_id", id)
    .maybeSingle();

  if (error) {
    return NextResponse.json(
      { error: { code: "INTERNAL_ERROR", message: error.message } },
      { status: 500 }
    );
  }

  return NextResponse.json({ data: { following: !!data } });
}

export async function POST(
  request: NextRequest,
  { params }: Params
): Promise<NextResponse> {
  const auth: AuthResult | AuthError = await requireAuth(request);
  if (auth.error) return auth.error;

  const { id } = await params;

  if (auth.user.id === id) {
    return NextResponse.json(
      { error: { code: "BAD_REQUEST", message: "Cannot follow yourself" } },
      { status: 400 }
    );
  }

  const supabase = getSupabaseAdmin();

  const { data: existing } = await supabase
    .from("follows")
    .select("id")
    .eq("follower_id", auth.user.id)
    .eq("following_id", id)
    .maybeSingle();

  if (existing) {
    await supabase
      .from("follows")
      .delete()
      .eq("follower_id", auth.user.id)
      .eq("following_id", id);

    return NextResponse.json({ data: { following: false } });
  }

  const { error } = await supabase
    .from("follows")
    .insert({ follower_id: auth.user.id, following_id: id });

  if (error) {
    return NextResponse.json(
      { error: { code: "INTERNAL_ERROR", message: error.message } },
      { status: 500 }
    );
  }

  return NextResponse.json({ data: { following: true } }, { status: 201 });
}
