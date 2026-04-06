import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase-server";

// GET /api/i18n/languages
// Returns the distinct language codes available in the translations table.
export async function GET(): Promise<NextResponse> {
  const supabase = getSupabaseAdmin();

  const { data, error } = await supabase
    .from("translations")
    .select("language")
    .order("language");

  if (error) {
    return NextResponse.json(
      { error: { code: "INTERNAL_ERROR", message: error.message } },
      { status: 500 }
    );
  }

  const languages = [...new Set((data ?? []).map((r) => r.language as string))];

  return NextResponse.json(
    { data: languages },
    {
      headers: {
        "Cache-Control": "public, s-maxage=300, stale-while-revalidate=60",
      },
    }
  );
}
