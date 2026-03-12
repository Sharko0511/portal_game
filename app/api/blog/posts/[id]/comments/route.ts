import { NextRequest, NextResponse } from "next/server";
import { requireAuth, AuthResult, AuthError } from "@/lib/auth";
import { getSupabaseAdmin } from "@/lib/supabase-server";

type Params = { params: Promise<{ id: string }> };

/** Check if the requesting user can see a post (is author or follows author). */
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

export async function GET(
  request: NextRequest,
  { params }: Params
): Promise<NextResponse> {
  const auth: AuthResult | AuthError = await requireAuth(request);
  if (auth.error) return auth.error;

  const { id: postId } = await params;

  if (!(await canViewPost(auth.user.id, postId))) {
    return NextResponse.json(
      { error: { code: "FORBIDDEN", message: "You must follow this user to view their posts" } },
      { status: 403 }
    );
  }

  const supabase = getSupabaseAdmin();

  const { data, error } = await supabase
    .from("comments")
    .select("id, content, created_at, author_id, profiles!comments_author_id_fkey(id, display_name)")
    .eq("post_id", postId)
    .order("created_at", { ascending: true });

  if (error) {
    return NextResponse.json(
      { error: { code: "INTERNAL_ERROR", message: error.message } },
      { status: 500 }
    );
  }

  return NextResponse.json({ data });
}

export async function POST(
  request: NextRequest,
  { params }: Params
): Promise<NextResponse> {
  const auth: AuthResult | AuthError = await requireAuth(request);
  if (auth.error) return auth.error;

  const { id: postId } = await params;

  if (!(await canViewPost(auth.user.id, postId))) {
    return NextResponse.json(
      { error: { code: "FORBIDDEN", message: "You must follow this user to comment on their posts" } },
      { status: 403 }
    );
  }

  let body: { content?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { error: { code: "BAD_REQUEST", message: "Invalid JSON body" } },
      { status: 400 }
    );
  }

  if (!body.content?.trim()) {
    return NextResponse.json(
      { error: { code: "BAD_REQUEST", message: "content is required" } },
      { status: 400 }
    );
  }

  const supabase = getSupabaseAdmin();

  const { data, error } = await supabase
    .from("comments")
    .insert({ post_id: postId, author_id: auth.user.id, content: body.content.trim() })
    .select("id, content, created_at, author_id, profiles!comments_author_id_fkey(id, display_name)")
    .single();

  if (error) {
    return NextResponse.json(
      { error: { code: "INTERNAL_ERROR", message: error.message } },
      { status: 500 }
    );
  }

  return NextResponse.json({ data }, { status: 201 });
}
