import { NextRequest, NextResponse } from "next/server";
import { requireAuth, AuthResult, AuthError } from "@/lib/auth";
import { getSupabaseAdmin } from "@/lib/supabase-server";

type Params = { params: Promise<{ slug: string }> };

export async function GET(
  request: NextRequest,
  { params }: Params
): Promise<NextResponse> {
  const { slug } = await params;
  const supabase = getSupabaseAdmin();

  const { data: post, error } = await supabase
    .from("posts_with_counts")
    .select("*")
    .eq("slug", slug)
    .single();

  if (error || !post) {
    return NextResponse.json(
      { error: { code: "NOT_FOUND", message: "Post not found" } },
      { status: 404 }
    );
  }

  // Public posts: no login required
  if (post.visibility === "public") {
    return NextResponse.json({ data: post });
  }

  // Share + private: require authentication
  const auth: AuthResult | AuthError = await requireAuth(request);
  if (!auth.error && auth.profile.role === "admin") {
    return NextResponse.json({ data: post });
  }
  if (auth.error) return auth.error;

  const isAuthor = post.author_id === auth.user.id;

  // Private: owner only
  if (post.visibility === "private") {
    if (!isAuthor) {
      return NextResponse.json(
        { error: { code: "FORBIDDEN", message: "This post is private" } },
        { status: 403 }
      );
    }
    return NextResponse.json({ data: post });
  }

  // Share: author or follower
  if (!isAuthor) {
    const { data: follow } = await supabase
      .from("follows")
      .select("id")
      .eq("follower_id", auth.user.id)
      .eq("following_id", post.author_id)
      .maybeSingle();

    if (!follow) {
      return NextResponse.json(
        { error: { code: "FORBIDDEN", message: "You must follow this user to view their posts" } },
        { status: 403 }
      );
    }
  }

  return NextResponse.json({ data: post });
}
