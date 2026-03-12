import { NextRequest, NextResponse } from "next/server";
import { requireAuth, AuthResult, AuthError } from "@/lib/auth";
import { getSupabaseAdmin } from "@/lib/supabase-server";

type Params = { params: Promise<{ id: string }> };

async function canViewPost(userId: string, postId: string): Promise<boolean> {
  const supabase = getSupabaseAdmin();

  const { data: post } = await supabase
    .from("posts")
    .select("author_id")
    .eq("id", postId)
    .single();

  if (!post) return false;
  if (post.author_id === userId) return true;

  const { data: follow } = await supabase
    .from("follows")
    .select("id")
    .eq("follower_id", userId)
    .eq("following_id", post.author_id)
    .maybeSingle();

  return !!follow;
}

export async function POST(
  request: NextRequest,
  { params }: Params
): Promise<NextResponse> {
  const auth: AuthResult | AuthError = await requireAuth(request);
  if (auth.error) return auth.error;

  const { id: postId } = await params;
  const supabase = getSupabaseAdmin();

  // Verify post exists and is visible to the user
  if (!(await canViewPost(auth.user.id, postId))) {
    return NextResponse.json(
      { error: { code: "FORBIDDEN", message: "You must follow this user to like their posts" } },
      { status: 403 }
    );
  }

  // Check existing like
  const { data: existing } = await supabase
    .from("likes")
    .select("id")
    .eq("post_id", postId)
    .eq("user_id", auth.user.id)
    .maybeSingle();

  if (existing) {
    // Unlike
    await supabase.from("likes").delete().eq("id", existing.id);
    return NextResponse.json({ data: { liked: false } });
  }

  // Like
  const { error } = await supabase
    .from("likes")
    .insert({ post_id: postId, user_id: auth.user.id });

  if (error) {
    return NextResponse.json(
      { error: { code: "INTERNAL_ERROR", message: error.message } },
      { status: 500 }
    );
  }

  return NextResponse.json({ data: { liked: true } }, { status: 201 });
}

export async function GET(
  request: NextRequest,
  { params }: Params
): Promise<NextResponse> {
  const auth: AuthResult | AuthError = await requireAuth(request);
  if (auth.error) return auth.error;

  const { id: postId } = await params;
  const supabase = getSupabaseAdmin();

  const { data, error } = await supabase
    .from("likes")
    .select("id")
    .eq("post_id", postId)
    .eq("user_id", auth.user.id)
    .maybeSingle();

  if (error) {
    return NextResponse.json(
      { error: { code: "INTERNAL_ERROR", message: error.message } },
      { status: 500 }
    );
  }

  return NextResponse.json({ data: { liked: !!data } });
}
