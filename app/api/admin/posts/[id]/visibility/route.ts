import { NextRequest, NextResponse } from "next/server";
import { requireAdmin, AuthResult, AuthError } from "@/lib/auth";
import { getSupabaseAdmin } from "@/lib/supabase-server";

const VALID_VISIBILITY = ["private", "share", "public"] as const;
type Visibility = (typeof VALID_VISIBILITY)[number];

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse> {
  const auth: AuthResult | AuthError = await requireAdmin(request);
  if (auth.error) return auth.error;

  const { id } = await params;
  const body = await request.json();
  const visibility: Visibility = body.visibility;

  if (!VALID_VISIBILITY.includes(visibility)) {
    return NextResponse.json(
      { error: { code: "INVALID_INPUT", message: "visibility must be private, share, or public" } },
      { status: 400 }
    );
  }

  const supabase = getSupabaseAdmin();

  const { data, error } = await supabase
    .from("posts")
    .update({ visibility, updated_at: new Date().toISOString() })
    .eq("id", id)
    .select("id, visibility")
    .single();

  if (error) {
    return NextResponse.json(
      { error: { code: "INTERNAL_ERROR", message: error.message } },
      { status: 500 }
    );
  }

  if (!data) {
    return NextResponse.json(
      { error: { code: "NOT_FOUND", message: "Post not found" } },
      { status: 404 }
    );
  }

  return NextResponse.json(data);
}
