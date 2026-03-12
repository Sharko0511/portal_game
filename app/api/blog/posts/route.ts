import { NextRequest, NextResponse } from "next/server";
import { requireAuth, AuthResult, AuthError } from "@/lib/auth";
import { getSupabaseAdmin } from "@/lib/supabase-server";

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

export async function POST(request: NextRequest): Promise<NextResponse> {
  const auth: AuthResult | AuthError = await requireAuth(request);
  if (auth.error) return auth.error;

  let body: { title?: string; content?: Record<string, unknown>; cover_image_url?: string; published?: boolean };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { error: { code: "BAD_REQUEST", message: "Invalid JSON body" } },
      { status: 400 }
    );
  }

  const { title, content, cover_image_url, published = true } = body;

  if (!title?.trim()) {
    return NextResponse.json(
      { error: { code: "BAD_REQUEST", message: "title is required" } },
      { status: 400 }
    );
  }
  if (!content || typeof content !== "object" || content.type !== "doc") {
    return NextResponse.json(
      { error: { code: "BAD_REQUEST", message: "content must be a TipTap JSON document" } },
      { status: 400 }
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
      slug: slugify(title),
      published,
    })
    .select()
    .single();

  if (error) {
    return NextResponse.json(
      { error: { code: "INTERNAL_ERROR", message: error.message } },
      { status: 500 }
    );
  }

  return NextResponse.json({ data }, { status: 201 });
}
