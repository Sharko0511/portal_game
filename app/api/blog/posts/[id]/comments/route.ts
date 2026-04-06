import { NextRequest, NextResponse } from "next/server";
import { requireAuth, getUser, AuthResult, AuthError } from "@/lib/auth";
import { getSupabaseAdmin } from "@/lib/supabase-server";

type Params = { params: Promise<{ id: string }> };

type PostRow = { author_id: string; visibility: string };

async function getPost(postId: string): Promise<PostRow | null> {
  const supabase = getSupabaseAdmin();
  const { data } = await supabase
    .from("posts")
    .select("author_id, visibility")
    .eq("id", postId)
    .single();
  return data as PostRow | null;
}

async function canViewPost(userId: string, post: PostRow): Promise<boolean> {
  if (post.author_id === userId) return true;
  const supabase = getSupabaseAdmin();
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
  const { id: postId } = await params;
  const supabase = getSupabaseAdmin();

  const post = await getPost(postId);
  if (!post) {
    return NextResponse.json({ error: { code: "NOT_FOUND", message: "Post not found" } }, { status: 404 });
  }

  // Public posts: anyone can read comments
  if (post.visibility !== "public") {
    const auth = await getUser(request);
    if (!auth) {
      return NextResponse.json(
        { error: { code: "UNAUTHORIZED", message: "You must be logged in to perform this action" } },
        { status: 401 }
      );
    }
    if (!(await canViewPost(auth.user.id, post))) {
      return NextResponse.json(
        { error: { code: "FORBIDDEN", message: "You must follow this user to view their posts" } },
        { status: 403 }
      );
    }
  }

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

  const post = await getPost(postId);
  if (!post) {
    return NextResponse.json({ error: { code: "NOT_FOUND", message: "Post not found" } }, { status: 404 });
  }

  // Author can always comment; public posts allow any logged-in user; share posts require follow
  const isAuthor = post.author_id === auth.user.id;
  if (!isAuthor && post.visibility !== "public" && !(await canViewPost(auth.user.id, post))) {
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
