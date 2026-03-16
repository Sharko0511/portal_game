import { NextRequest, NextResponse } from "next/server";
import { requireAuth, AuthResult, AuthError } from "@/lib/auth";
import { getSupabaseAdmin } from "@/lib/supabase-server";
import { randomBytes } from "crypto";

// POST /api/telegram/link — generate a one-time token and return the bot deep link
export async function POST(request: NextRequest): Promise<NextResponse> {
  const auth: AuthResult | AuthError = await requireAuth(request);
  if (auth.error) return auth.error;

  const supabase = getSupabaseAdmin();
  const token = randomBytes(16).toString("hex");

  const { error } = await supabase.from("telegram_link_tokens").insert({
    token,
    user_id: auth.user.id,
  });

  if (error) {
    return NextResponse.json(
      { error: { code: "INTERNAL_ERROR", message: error.message } },
      { status: 500 }
    );
  }

  const botUsername = process.env.TELEGRAM_BOT_USERNAME;
  const deepLink = `tg://resolve?domain=${botUsername}&start=${token}`;

  return NextResponse.json({ data: { deep_link: deepLink, token } });
}

// DELETE /api/telegram/link — unlink telegram account
export async function DELETE(request: NextRequest): Promise<NextResponse> {
  const auth: AuthResult | AuthError = await requireAuth(request);
  if (auth.error) return auth.error;

  const supabase = getSupabaseAdmin();

  const { error } = await supabase
    .from("profiles")
    .update({ telegram_chat_id: null })
    .eq("id", auth.user.id);

  if (error) {
    return NextResponse.json(
      { error: { code: "INTERNAL_ERROR", message: error.message } },
      { status: 500 }
    );
  }

  return NextResponse.json({ data: { unlinked: true } });
}
