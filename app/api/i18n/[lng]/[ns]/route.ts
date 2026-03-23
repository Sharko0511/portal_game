import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase-server";

type Params = { params: Promise<{ lng: string; ns: string }> };

export async function GET(
  _request: NextRequest,
  { params }: Params
): Promise<NextResponse> {
  const { lng, ns } = await params;

  const supabase = getSupabaseAdmin();

  const { data, error } = await supabase
    .from("translations")
    .select("key, value")
    .eq("language", lng)
    .eq("namespace", ns);

  if (error) {
    return NextResponse.json(
      { error: { code: "INTERNAL_ERROR", message: error.message } },
      { status: 500 }
    );
  }

  let rows = data ?? [];

  // If no rows found (deleted or unknown language), fall back to EN
  if (rows.length === 0 && lng !== "en") {
    const { data: fallback } = await supabase
      .from("translations")
      .select("key, value")
      .eq("language", "en")
      .eq("namespace", ns);
    rows = fallback ?? [];
  }

  const result: Record<string, string> = {};
  for (const row of rows) {
    result[row.key] = row.value;
  }

  return NextResponse.json(
    { data: result },
    {
      headers: {
        // Cache for 5 minutes on CDN, allow stale for 1 minute while revalidating
        "Cache-Control": "public, s-maxage=300, stale-while-revalidate=60",
      },
    }
  );
}
