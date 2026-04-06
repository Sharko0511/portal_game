import { NextRequest, NextResponse } from "next/server";
import { requireAuth, getUser, AuthResult, AuthError } from "@/lib/auth";
import { getSupabaseAdmin } from "@/lib/supabase-server";

type Params = { params: Promise<{ id: string }> };
type Visibility = "private" | "share" | "public";

export async function GET(
  request: NextRequest,
  { params }: Params
): Promise<NextResponse> {
  const { id } = await params;
  const supabase = getSupabaseAdmin();

  const { data: post, error } = await supabase
    .from("posts_with_counts")
    .select("*")
    .eq("id", id)
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

export async function PATCH(
  request: NextRequest,
  { params }: Params
): Promise<NextResponse> {
  const auth: AuthResult | AuthError = await requireAuth(request);
  if (auth.error) return auth.error;

  const { id } = await params;
  const supabase = getSupabaseAdmin();

  const { data: post } = await supabase
    .from("posts")
    .select("author_id, visibility")
    .eq("id", id)
    .single();

  if (!post) {
    return NextResponse.json(
      { error: { code: "NOT_FOUND", message: "Post not found" } },
      { status: 404 }
    );
  }

  const isAuthor = post.author_id === auth.user.id;
  const isAdmin = auth.profile.role === "admin";

  // Only author or admin can edit
  if (!isAuthor && !isAdmin) {
    return NextResponse.json(
      { error: { code: "FORBIDDEN", message: "Only the author can edit this post" } },
      { status: 403 }
    );
  }

  let body: {
    title?: string;
    content?: Record<string, unknown>;
    cover_image_url?: string;
    cover_image_caption?: string;
    visibility?: Visibility;
    category?: string;
    level?: string | null;
    audio_url?: string | null;
    reading_time?: number;
    tags?: string[];
    word_count?: number;
    event_encounters?: number;
    cards_count?: number;
    feedback_intro?: string | null;
    player_feedback?: { content: string }[];
  };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { error: { code: "BAD_REQUEST", message: "Invalid JSON body" } },
      { status: 400 }
    );
  }

  // Validate visibility transition
  if (body.visibility !== undefined) {
    const from = post.visibility as Visibility;
    const to = body.visibility;

    if (isAdmin && isAuthor) {
      // Admin on own post: any transition allowed
    } else if (isAdmin && !isAuthor) {
      // Admin on others' post: only share ↔ public
      if (!((from === "share" && to === "public") || (from === "public" && to === "share"))) {
        return NextResponse.json(
          { error: { code: "FORBIDDEN", message: "Admin can only promote share→public or demote public→share on others' posts" } },
          { status: 403 }
        );
      }
    } else {
      // Owner (non-admin): only private ↔ share
      if (!((from === "private" && to === "share") || (from === "share" && to === "private"))) {
        return NextResponse.json(
          { error: { code: "FORBIDDEN", message: "You can only toggle between private and share" } },
          { status: 403 }
        );
      }
    }
  }

  const updates: Record<string, unknown> = { updated_at: new Date().toISOString() };
  if (body.title !== undefined) updates.title = body.title;
  if (body.content !== undefined) updates.content = body.content;
  if (body.cover_image_url !== undefined) updates.cover_image_url = body.cover_image_url;
  if (body.cover_image_caption !== undefined) updates.cover_image_caption = body.cover_image_caption;
  if (body.visibility !== undefined) updates.visibility = body.visibility;
  if (body.category !== undefined) updates.category = body.category;
  if (body.level !== undefined) updates.level = body.level;
  if (body.audio_url !== undefined) updates.audio_url = body.audio_url;
  if (body.reading_time !== undefined) updates.reading_time = body.reading_time;
  if (body.tags !== undefined) updates.tags = body.tags;
  if (body.word_count !== undefined) updates.word_count = body.word_count;
  if (body.event_encounters !== undefined) updates.event_encounters = body.event_encounters;
  if (body.cards_count !== undefined) updates.cards_count = body.cards_count;
  if (body.feedback_intro !== undefined) updates.feedback_intro = body.feedback_intro;
  if (body.player_feedback !== undefined) updates.player_feedback = body.player_feedback;

  const { data, error } = await supabase
    .from("posts")
    .update(updates)
    .eq("id", id)
    .select()
    .single();

  if (error) {
    return NextResponse.json(
      { error: { code: "INTERNAL_ERROR", message: error.message } },
      { status: 500 }
    );
  }

  return NextResponse.json({ data });
}

export async function DELETE(
  request: NextRequest,
  { params }: Params
): Promise<NextResponse> {
  const auth: AuthResult | AuthError = await requireAuth(request);
  if (auth.error) return auth.error;

  const { id } = await params;
  const supabase = getSupabaseAdmin();

  const { data: post } = await supabase
    .from("posts")
    .select("author_id")
    .eq("id", id)
    .single();

  if (!post) {
    return NextResponse.json(
      { error: { code: "NOT_FOUND", message: "Post not found" } },
      { status: 404 }
    );
  }

  const isAuthor = post.author_id === auth.user.id;
  const isAdmin = auth.profile.role === "admin";

  if (!isAuthor && !isAdmin) {
    return NextResponse.json(
      { error: { code: "FORBIDDEN", message: "Only the author or admin can delete this post" } },
      { status: 403 }
    );
  }

  const { error } = await supabase.from("posts").delete().eq("id", id);

  if (error) {
    return NextResponse.json(
      { error: { code: "INTERNAL_ERROR", message: error.message } },
      { status: 500 }
    );
  }

  return NextResponse.json({ success: true });
}
