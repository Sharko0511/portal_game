import { getSupabaseAdmin } from "@/lib/supabase-server";

type SupabaseAdmin = ReturnType<typeof getSupabaseAdmin>;

export type CategoryRow = {
  id: string;
  slug: string;
  name: string;
  is_active: boolean;
  is_hot: boolean;
  sort_order: number;
};

export function uniqueCategoryIds(ids: string[]): string[] {
  return Array.from(new Set(ids.map((id) => id.trim()).filter(Boolean)));
}

export async function getActiveCategoriesByIds(
  supabase: SupabaseAdmin,
  ids: string[]
): Promise<CategoryRow[]> {
  if (!ids.length) return [];

  const { data, error } = await supabase
    .from("categories")
    .select("id, slug, name, is_active, is_hot, sort_order")
    .in("id", ids)
    .eq("is_active", true);

  if (error) throw new Error(error.message);
  return (data ?? []) as CategoryRow[];
}

export async function getCategoryBySlug(
  supabase: SupabaseAdmin,
  slug: string
): Promise<CategoryRow | null> {
  const { data, error } = await supabase
    .from("categories")
    .select("id, slug, name, is_active, is_hot, sort_order")
    .eq("slug", slug)
    .eq("is_active", true)
    .maybeSingle();

  if (error) throw new Error(error.message);
  return (data as CategoryRow | null) ?? null;
}

export async function replacePostCategoryMappings(
  supabase: SupabaseAdmin,
  postId: string,
  categoryIds: string[]
): Promise<void> {
  const { error: deleteError } = await supabase
    .from("post_categories")
    .delete()
    .eq("post_id", postId);

  if (deleteError) throw new Error(deleteError.message);

  if (!categoryIds.length) return;

  const rows = categoryIds.map((categoryId) => ({
    post_id: postId,
    category_id: categoryId,
  }));

  const { error: insertError } = await supabase.from("post_categories").insert(rows);
  if (insertError) throw new Error(insertError.message);
}

export async function addPostCategoryMapping(
  supabase: SupabaseAdmin,
  postId: string,
  categoryId: string
): Promise<void> {
  const { error } = await supabase
    .from("post_categories")
    .upsert(
      { post_id: postId, category_id: categoryId },
      { onConflict: "post_id,category_id", ignoreDuplicates: true }
    );

  if (error) throw new Error(error.message);
}
