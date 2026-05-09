import { NextRequest, NextResponse } from "next/server";
import { requireAdmin, AuthResult, AuthError } from "@/lib/auth";
import { getSupabaseAdmin } from "@/lib/supabase-server";

type CreateCategoryBody = {
  slug?: string;
  name?: string;
  description?: string | null;
  is_hot?: boolean;
  is_active?: boolean;
  sort_order?: number;
};

function normalizeSlug(input: string): string {
  return input
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

export async function GET(request: NextRequest): Promise<NextResponse> {
  const auth: AuthResult | AuthError = await requireAdmin(request);
  if (auth.error) return auth.error;

  const supabase = getSupabaseAdmin();
  const { searchParams } = new URL(request.url);
  const includeInactive = searchParams.get("includeInactive") === "true";
  const q = (searchParams.get("q") ?? "").trim();
  const limitParam = Number.parseInt(searchParams.get("limit") ?? "20", 10);
  const limit = Number.isNaN(limitParam) ? 20 : Math.min(Math.max(limitParam, 1), 50);

  let query = supabase
    .from("categories")
    .select("id, slug, name, description, is_hot, is_active, sort_order, created_at, updated_at")
    .order("sort_order", { ascending: true })
    .order("name", { ascending: true })
    .limit(limit);

  if (!includeInactive) {
    query = query.eq("is_active", true);
  }

  if (q) {
    const escaped = q.replace(/[,%]/g, "");
    query = query.or(`name.ilike.%${escaped}%,slug.ilike.%${escaped}%`);
  }

  const { data, error } = await query;

  if (error) {
    return NextResponse.json(
      { error: { code: "INTERNAL_ERROR", message: error.message } },
      { status: 500 }
    );
  }

  return NextResponse.json({ data: data ?? [] });
}

export async function POST(request: NextRequest): Promise<NextResponse> {
  const auth: AuthResult | AuthError = await requireAdmin(request);
  if (auth.error) return auth.error;

  let body: CreateCategoryBody;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { error: { code: "BAD_REQUEST", message: "Invalid JSON body" } },
      { status: 400 }
    );
  }

  const name = body.name?.trim();
  const slugInput = body.slug?.trim() || name || "";
  const slug = normalizeSlug(slugInput);

  if (!name) {
    return NextResponse.json(
      { error: { code: "BAD_REQUEST", message: "name is required" } },
      { status: 400 }
    );
  }

  if (!slug) {
    return NextResponse.json(
      { error: { code: "BAD_REQUEST", message: "slug is required" } },
      { status: 400 }
    );
  }

  const supabase = getSupabaseAdmin();

  const { data, error } = await supabase
    .from("categories")
    .insert({
      slug,
      name,
      description: body.description ?? null,
      is_hot: body.is_hot ?? false,
      is_active: body.is_active ?? true,
      sort_order: body.sort_order ?? 0,
    })
    .select("id, slug, name, description, is_hot, is_active, sort_order, created_at, updated_at")
    .single();

  if (error) {
    const status = error.code === "23505" ? 409 : 500;
    const message = error.code === "23505" ? "Category slug already exists" : error.message;
    return NextResponse.json(
      { error: { code: status === 409 ? "CONFLICT" : "INTERNAL_ERROR", message } },
      { status }
    );
  }

  return NextResponse.json({ data }, { status: 201 });
}
