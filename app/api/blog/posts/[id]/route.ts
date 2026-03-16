import { NextRequest, NextResponse } from "next/server";
import { requireAuth, AuthResult, AuthError } from "@/lib/auth";
import { getSupabaseAdmin } from "@/lib/supabase-server";

type Params = { params: Promise<{ id: string }> };

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

  // Admin-authored published posts are publicly readable (no login required)
  if (post.author_role === "admin" && post.published) {
    return NextResponse.json({ data: post });
  }

  // All other posts require authentication + author-or-follower check
  const auth: AuthResult | AuthError = await requireAuth(request);
  if (auth.error) return auth.error;

  const isAuthor = post.author_id === auth.user.id;
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
    .select("author_id")
    .eq("id", id)
    .single();

  if (!post) {
    return NextResponse.json(
      { error: { code: "NOT_FOUND", message: "Post not found" } },
      { status: 404 }
    );
  }

  if (post.author_id !== auth.user.id) {
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
    published?: boolean;
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

  const updates: Record<string, unknown> = { updated_at: new Date().toISOString() };
  if (body.title !== undefined) updates.title = body.title;
  if (body.content !== undefined) updates.content = body.content;
  if (body.cover_image_url !== undefined) updates.cover_image_url = body.cover_image_url;
  if (body.cover_image_caption !== undefined) updates.cover_image_caption = body.cover_image_caption;
  if (body.published !== undefined) updates.published = body.published;
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
