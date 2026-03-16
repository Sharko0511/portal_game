import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase-server";

// This endpoint is called by Telegram when a user messages the bot.
// Register it with: https://api.telegram.org/bot<TOKEN>/setWebhook?url=<YOUR_URL>/api/telegram/webhook

export async function POST(request: NextRequest): Promise<NextResponse> {
  let body: {
    message?: {
      chat?: { id?: number };
      text?: string;
    };
  };

  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ ok: false }, { status: 400 });
  }

  const chatId = body.message?.chat?.id;
  const text = body.message?.text ?? "";

  // Telegram sends "/start <token>" when the user clicks the deep link
  if (!chatId || !text.startsWith("/start ")) {
    return NextResponse.json({ ok: true });
  }

  const token = text.replace("/start ", "").trim();
  if (!token) return NextResponse.json({ ok: true });

  const supabase = getSupabaseAdmin();

  // Look up the token
  const { data: linkToken, error: lookupError } = await supabase
    .from("telegram_link_tokens")
    .select("user_id, expires_at")
    .eq("token", token)
    .single();

  if (lookupError || !linkToken) {
    return NextResponse.json({ ok: true }); // silently ignore invalid/expired tokens
  }

  // Check expiry
  if (new Date(linkToken.expires_at) < new Date()) {
    await supabase.from("telegram_link_tokens").delete().eq("token", token);
    return NextResponse.json({ ok: true });
  }

  // Save chat_id to the user's profile
  await supabase
    .from("profiles")
    .update({ telegram_chat_id: chatId })
    .eq("id", linkToken.user_id);

  // Clean up the used token
  await supabase.from("telegram_link_tokens").delete().eq("token", token);

  return NextResponse.json({ ok: true });
}
