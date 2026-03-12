import { NextRequest, NextResponse } from "next/server";
import { requireAuth, AuthResult, AuthError } from "@/lib/auth";
import { getSupabaseAdmin } from "@/lib/supabase-server";

type Params = { params: Promise<{ id: string }> };

export async function DELETE(
  request: NextRequest,
  { params }: Params
): Promise<NextResponse> {
  const auth: AuthResult | AuthError = await requireAuth(request);
  if (auth.error) return auth.error;

  const { id } = await params;
  const supabase = getSupabaseAdmin();

  const { data: comment } = await supabase
    .from("comments")
    .select("author_id")
    .eq("id", id)
    .single();

  if (!comment) {
    return NextResponse.json(
      { error: { code: "NOT_FOUND", message: "Comment not found" } },
      { status: 404 }
    );
  }

  const isAuthor = comment.author_id === auth.user.id;
  const isAdmin = auth.profile.role === "admin";

  if (!isAuthor && !isAdmin) {
    return NextResponse.json(
      { error: { code: "FORBIDDEN", message: "Only the comment author or admin can delete this comment" } },
      { status: 403 }
    );
  }

  const { error } = await supabase.from("comments").delete().eq("id", id);

  if (error) {
    return NextResponse.json(
      { error: { code: "INTERNAL_ERROR", message: error.message } },
      { status: 500 }
    );
  }

  return NextResponse.json({ success: true });
}
