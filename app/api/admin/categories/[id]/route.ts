import { NextRequest, NextResponse } from "next/server";
import { requireAdmin, AuthResult, AuthError } from "@/lib/auth";
import { getSupabaseAdmin } from "@/lib/supabase-server";

type Params = { params: Promise<{ id: string }> };

type UpdateCategoryBody = {
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

export async function PATCH(
  request: NextRequest,
  { params }: Params
): Promise<NextResponse> {
  const auth: AuthResult | AuthError = await requireAdmin(request);
  if (auth.error) return auth.error;

  const { id } = await params;

  let body: UpdateCategoryBody;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { error: { code: "BAD_REQUEST", message: "Invalid JSON body" } },
      { status: 400 }
    );
  }

  const updates: Record<string, unknown> = { updated_at: new Date().toISOString() };
  if (body.slug !== undefined) updates.slug = normalizeSlug(body.slug);
  if (body.name !== undefined) updates.name = body.name.trim();
  if (body.description !== undefined) updates.description = body.description;
  if (body.is_hot !== undefined) updates.is_hot = body.is_hot;
  if (body.is_active !== undefined) updates.is_active = body.is_active;
  if (body.sort_order !== undefined) updates.sort_order = body.sort_order;

  if (Object.keys(updates).length === 1) {
    return NextResponse.json(
      { error: { code: "BAD_REQUEST", message: "No fields to update" } },
      { status: 400 }
    );
  }

  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from("categories")
    .update(updates)
    .eq("id", id)
    .select("id, slug, name, description, is_hot, is_active, sort_order, created_at, updated_at")
    .single();

  if (error) {
    if (error.code === "PGRST116") {
      return NextResponse.json(
        { error: { code: "NOT_FOUND", message: "Category not found" } },
        { status: 404 }
      );
    }
    const status = error.code === "23505" ? 409 : 500;
    const message = error.code === "23505" ? "Category slug already exists" : error.message;
    return NextResponse.json(
      { error: { code: status === 409 ? "CONFLICT" : "INTERNAL_ERROR", message } },
      { status }
    );
  }

  return NextResponse.json({ data });
}

export async function DELETE(
  request: NextRequest,
  { params }: Params
): Promise<NextResponse> {
  const auth: AuthResult | AuthError = await requireAdmin(request);
  if (auth.error) return auth.error;

  const { id } = await params;
  const supabase = getSupabaseAdmin();

  const { count, error: countError } = await supabase
    .from("post_categories")
    .select("post_id", { head: true, count: "exact" })
    .eq("category_id", id);

  if (countError) {
    return NextResponse.json(
      { error: { code: "INTERNAL_ERROR", message: countError.message } },
      { status: 500 }
    );
  }

  // Soft delete when category is already referenced by posts
  if ((count ?? 0) > 0) {
    const { data, error } = await supabase
      .from("categories")
      .update({ is_active: false, is_hot: false, updated_at: new Date().toISOString() })
      .eq("id", id)
      .select("id, slug, name, description, is_hot, is_active, sort_order, created_at, updated_at")
      .single();

    if (error) {
      return NextResponse.json(
        { error: { code: "INTERNAL_ERROR", message: error.message } },
        { status: 500 }
      );
    }

    return NextResponse.json({ data, mode: "soft-delete" });
  }

  const { error } = await supabase.from("categories").delete().eq("id", id);

  if (error) {
    return NextResponse.json(
      { error: { code: "INTERNAL_ERROR", message: error.message } },
      { status: 500 }
    );
  }

  return NextResponse.json({ success: true, mode: "hard-delete" });
}
