import { NextRequest, NextResponse } from "next/server";
import { requireAuth, AuthResult, AuthError } from "@/lib/auth";
import { getSupabaseAdmin } from "@/lib/supabase-server";
import { sendTelegramMessage } from "@/lib/telegram";

function slugify(title: string): string {
  return (
    title
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "") +
    "-" +
    Date.now()
  );
}

export async function GET(request: NextRequest): Promise<NextResponse> {
  const auth: AuthResult | AuthError = await requireAuth(request);
  if (auth.error) return auth.error;

  const { searchParams } = new URL(request.url);
  const authorId = searchParams.get("author");
  const limit = Math.min(parseInt(searchParams.get("limit") ?? "20"), 100);
  const offset = parseInt(searchParams.get("offset") ?? "0");

  const supabase = getSupabaseAdmin();

  // Build the author IDs to show: own posts + followed users' posts
  const { data: following } = await supabase
    .from("follows")
    .select("following_id")
    .eq("follower_id", auth.user.id);

  const visibleAuthorIds = [
    auth.user.id,
    ...(following?.map((f: { following_id: string }) => f.following_id) ?? []),
  ];

  let query = supabase
    .from("posts_with_counts")
    .select("*")
    .order("created_at", { ascending: false })
    .range(offset, offset + limit - 1);

  if (authorId) {
    // Profile page: show a specific author's posts if viewer can see them
    if (!visibleAuthorIds.includes(authorId)) {
      return NextResponse.json({ data: [] });
    }
    query = query.eq("author_id", authorId);
  } else {
    // Feed: own + followed
    query = query.in("author_id", visibleAuthorIds);
  }

  const { data, error } = await query;

  if (error) {
    return NextResponse.json(
      { error: { code: "INTERNAL_ERROR", message: error.message } },
      { status: 500 }
    );
  }

  return NextResponse.json({ data });
}

const VALID_CATEGORIES = ["blog", "baohay", "audiochat"] as const;
const VALID_LEVELS = ["A1", "A2", "B1", "B2", "C1", "C2"] as const;

const VALID_VISIBILITIES = ["private", "share", "public"] as const;
type Visibility = typeof VALID_VISIBILITIES[number];

type PostBody = {
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

export async function POST(request: NextRequest): Promise<NextResponse> {
  const auth: AuthResult | AuthError = await requireAuth(request);
  if (auth.error) return auth.error;

  let body: PostBody;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { error: { code: "BAD_REQUEST", message: "Invalid JSON body" } },
      { status: 400 }
    );
  }

  const {
    title, content, cover_image_url, cover_image_caption,
    visibility = "private", category = "blog", level = null,
    audio_url = null, reading_time = 0, tags = [],
    word_count = 0, event_encounters = 0, cards_count = 0,
    feedback_intro = null, player_feedback = [],
  } = body;

  const isAdmin = auth.profile.role === "admin";

  if (!title?.trim()) {
    return NextResponse.json(
      { error: { code: "BAD_REQUEST", message: "title is required" } },
      { status: 400 }
    );
  }
  if (!content || typeof content !== "object" ||
      (content.type !== "doc" && content.type !== "blocks")) {
    return NextResponse.json(
      { error: { code: "BAD_REQUEST", message: "content must be a TipTap document or block array" } },
      { status: 400 }
    );
  }
  if (!VALID_CATEGORIES.includes(category as typeof VALID_CATEGORIES[number])) {
    return NextResponse.json(
      { error: { code: "BAD_REQUEST", message: `category must be one of: ${VALID_CATEGORIES.join(", ")}` } },
      { status: 400 }
    );
  }
  if (level !== null && level !== undefined && !VALID_LEVELS.includes(level as typeof VALID_LEVELS[number])) {
    return NextResponse.json(
      { error: { code: "BAD_REQUEST", message: `level must be one of: ${VALID_LEVELS.join(", ")}` } },
      { status: 400 }
    );
  }
  if (!Array.isArray(player_feedback) || player_feedback.some((f) => typeof f?.content !== "string")) {
    return NextResponse.json(
      { error: { code: "BAD_REQUEST", message: "player_feedback must be an array of {content: string}" } },
      { status: 400 }
    );
  }
  if (!VALID_VISIBILITIES.includes(visibility)) {
    return NextResponse.json(
      { error: { code: "BAD_REQUEST", message: "visibility must be private, share, or public" } },
      { status: 400 }
    );
  }
  // Only admin can create a public post
  if (visibility === "public" && !isAdmin) {
    return NextResponse.json(
      { error: { code: "FORBIDDEN", message: "Only admins can publish public posts" } },
      { status: 403 }
    );
  }

  const supabase = getSupabaseAdmin();

  const { data, error } = await supabase
    .from("posts")
    .insert({
      author_id: auth.user.id,
      title: title.trim(),
      content,
      cover_image_url: cover_image_url ?? null,
      cover_image_caption: cover_image_caption ?? null,
      slug: slugify(title),
      visibility,
      category,
      level: level ?? null,
      audio_url,
      reading_time,
      tags,
      word_count,
      event_encounters,
      cards_count,
      feedback_intro,
      player_feedback,
    })
    .select()
    .single();

  if (error) {
    return NextResponse.json(
      { error: { code: "INTERNAL_ERROR", message: error.message } },
      { status: 500 }
    );
  }

  // Notify followers when post becomes visible to them (share or public)
  if (visibility === "share" || visibility === "public") {
    notifyFollowers(supabase, auth.user.id, auth.profile.display_name, data.title, data.id).catch(
      (err) => console.error("Telegram notify error:", err)
    );
  }

  return NextResponse.json({ data }, { status: 201 });
}

async function notifyFollowers(
  supabase: ReturnType<typeof getSupabaseAdmin>,
  authorId: string,
  authorName: string,
  postTitle: string,
  postId: string
): Promise<void> {
  const { data: followers } = await supabase
    .from("follows")
    .select("profiles!follows_follower_id_fkey(telegram_chat_id)")
    .eq("following_id", authorId);

  if (!followers?.length) return;

  const appUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    ? process.env.NEXT_PUBLIC_APP_URL ?? ""
    : "";

  const message =
    `📝 <b>${authorName}</b> published a new post!\n\n` +
    `<b>${postTitle}</b>\n` +
    (appUrl ? `\n${appUrl}/blog/${postId}` : "");

  const sends = followers
    .map((f) => {
      const profile = f.profiles as unknown as { telegram_chat_id: number | null } | null;
      return profile?.telegram_chat_id ?? null;
    })
    .filter((id): id is number => id !== null)
    .map((chatId) => sendTelegramMessage(chatId, message));

  await Promise.allSettled(sends);
}
