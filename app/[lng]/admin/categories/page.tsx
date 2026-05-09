"use client";

import { FormEvent, useState } from "react";
import Button from "@/components/Button";
import ConfirmDialog from "@/components/ui/confirm-dialog";
import {
  AdminCategory,
  useAdminCategories,
  useCreateAdminCategory,
  useDeleteAdminCategory,
  useToggleAdminCategoryHot,
  useUpdateAdminCategory,
} from "@/hooks/admin/useAdminCategories";

type CategoryForm = {
  name: string;
  slug: string;
  description: string;
  sort_order: number;
};

const EMPTY_FORM: CategoryForm = {
  name: "",
  slug: "",
  description: "",
  sort_order: 0,
};

function toEditForm(category: AdminCategory): CategoryForm {
  return {
    name: category.name,
    slug: category.slug,
    description: category.description ?? "",
    sort_order: category.sort_order,
  };
}

export default function AdminCategoriesPage() {
  const [includeInactive, setIncludeInactive] = useState(false);
  const [createForm, setCreateForm] = useState<CategoryForm>(EMPTY_FORM);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<CategoryForm>(EMPTY_FORM);
  const [deleteTarget, setDeleteTarget] = useState<AdminCategory | null>(null);

  const categoriesQuery = useAdminCategories(includeInactive);
  const createCategory = useCreateAdminCategory();
  const updateCategory = useUpdateAdminCategory();
  const deleteCategory = useDeleteAdminCategory();
  const toggleHotCategory = useToggleAdminCategoryHot();

  const categories = categoriesQuery.data ?? [];
  const busy =
    createCategory.isPending ||
    updateCategory.isPending ||
    deleteCategory.isPending ||
    toggleHotCategory.isPending;

  const counts = {
    total: categories.length,
    active: categories.filter((c) => c.is_active).length,
    hot: categories.filter((c) => c.is_hot).length,
  };

  async function handleCreate(e: FormEvent) {
    e.preventDefault();
    await createCategory.mutateAsync({
      name: createForm.name,
      slug: createForm.slug || undefined,
      description: createForm.description || null,
      sort_order: createForm.sort_order,
    });
    setCreateForm(EMPTY_FORM);
  }

  function startEdit(category: AdminCategory) {
    setEditingId(category.id);
    setEditForm(toEditForm(category));
  }

  async function handleSaveEdit(id: string) {
    await updateCategory.mutateAsync({
      id,
      name: editForm.name,
      slug: editForm.slug,
      description: editForm.description || null,
      sort_order: editForm.sort_order,
    });
    setEditingId(null);
    setEditForm(EMPTY_FORM);
  }

  function handleDelete(category: AdminCategory) {
    setDeleteTarget(category);
  }

  async function handleDeleteConfirm() {
    if (!deleteTarget) return;
    await deleteCategory.mutateAsync(deleteTarget.id);
    setDeleteTarget(null);
  }

  const errorMessage =
    (categoriesQuery.error as Error | null)?.message ||
    (createCategory.error as Error | null)?.message ||
    (updateCategory.error as Error | null)?.message ||
    (deleteCategory.error as Error | null)?.message ||
    (toggleHotCategory.error as Error | null)?.message ||
    "";

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Categories</h1>
          <p className="text-sm text-muted-foreground">
            Manage post categories, hot flags, and active status.
          </p>
        </div>
        <label className="flex items-center gap-2 text-sm text-muted-foreground">
          <input
            type="checkbox"
            checked={includeInactive}
            onChange={(e) => setIncludeInactive(e.target.checked)}
          />
          Show inactive
        </label>
      </div>

      <div className="flex flex-wrap gap-2 text-sm">
        <span className="rounded-full bg-gray-100 px-3 py-1">
          Total: {counts.total}
        </span>
        <span className="rounded-full bg-green-100 px-3 py-1 text-green-800">
          Active: {counts.active}
        </span>
        <span className="rounded-full bg-amber-100 px-3 py-1 text-amber-800">
          Hot: {counts.hot}
        </span>
      </div>

      <form
        onSubmit={handleCreate}
        className="grid gap-3 rounded-2xl border border-border bg-card p-4 md:grid-cols-5"
      >
        <input
          value={createForm.name}
          onChange={(e) =>
            setCreateForm((p) => ({ ...p, name: e.target.value }))
          }
          placeholder="Name"
          className="rounded-lg border border-border bg-white px-3 py-2 text-sm"
          required
        />
        <input
          value={createForm.slug}
          onChange={(e) =>
            setCreateForm((p) => ({ ...p, slug: e.target.value }))
          }
          placeholder="Slug (optional)"
          className="rounded-lg border border-border bg-white px-3 py-2 text-sm"
        />
        <input
          value={createForm.description}
          onChange={(e) =>
            setCreateForm((p) => ({ ...p, description: e.target.value }))
          }
          placeholder="Description"
          className="rounded-lg border border-border bg-white px-3 py-2 text-sm"
        />
        <input
          type="number"
          value={createForm.sort_order}
          onChange={(e) =>
            setCreateForm((p) => ({
              ...p,
              sort_order: Number(e.target.value) || 0,
            }))
          }
          placeholder="Sort"
          className="rounded-lg border border-border bg-white px-3 py-2 text-sm"
        />
        <Button type="submit" disabled={createCategory.isPending}>
          {createCategory.isPending ? "Creating..." : "Create"}
        </Button>
      </form>

      {errorMessage && (
        <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-600">
          {errorMessage}
        </p>
      )}

      {categoriesQuery.isLoading ? (
        <p className="text-sm text-muted-foreground">Loading categories...</p>
      ) : (
        <div className="overflow-hidden rounded-2xl border border-border bg-card">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-left text-muted-foreground">
              <tr>
                <th className="px-4 py-3">Name</th>
                <th className="px-4 py-3">Slug</th>
                <th className="px-4 py-3">Sort</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {categories.map((category) => {
                const isEditing = editingId === category.id;
                return (
                  <tr key={category.id} className="border-t border-border/50">
                    <td className="px-4 py-3">
                      {isEditing ? (
                        <input
                          value={editForm.name}
                          onChange={(e) =>
                            setEditForm((p) => ({ ...p, name: e.target.value }))
                          }
                          className="w-full rounded border border-border px-2 py-1"
                        />
                      ) : (
                        <div>
                          <p className="font-medium text-foreground">
                            {category.name}
                          </p>
                          {category.description && (
                            <p className="text-xs text-muted-foreground">
                              {category.description}
                            </p>
                          )}
                        </div>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      {isEditing ? (
                        <input
                          value={editForm.slug}
                          onChange={(e) =>
                            setEditForm((p) => ({ ...p, slug: e.target.value }))
                          }
                          className="w-full rounded border border-border px-2 py-1"
                        />
                      ) : (
                        <span className="font-mono text-xs">
                          {category.slug}
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      {isEditing ? (
                        <input
                          type="number"
                          value={editForm.sort_order}
                          onChange={(e) =>
                            setEditForm((p) => ({
                              ...p,
                              sort_order: Number(e.target.value) || 0,
                            }))
                          }
                          className="w-20 rounded border border-border px-2 py-1"
                        />
                      ) : (
                        category.sort_order
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex gap-2">
                        <button
                          type="button"
                          disabled={busy}
                          onClick={() =>
                            toggleHotCategory.mutate({
                              id: category.id,
                              is_hot: !category.is_hot,
                            })
                          }
                          className={`rounded-full border px-2 py-1 text-xs ${category.is_hot ? "border-amber-300 bg-amber-100 text-amber-800" : "border-border"}`}
                        >
                          {category.is_hot ? "Hot" : "Not hot"}
                        </button>
                        <button
                          type="button"
                          disabled={busy}
                          onClick={() =>
                            updateCategory.mutate({
                              id: category.id,
                              is_active: !category.is_active,
                            })
                          }
                          className={`rounded-full border px-2 py-1 text-xs ${category.is_active ? "border-green-300 bg-green-100 text-green-800" : "border-gray-300 bg-gray-100 text-gray-600"}`}
                        >
                          {category.is_active ? "Active" : "Inactive"}
                        </button>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex gap-2">
                        {isEditing ? (
                          <>
                            <Button
                              size="sm"
                              onClick={() => handleSaveEdit(category.id)}
                            >
                              Save
                            </Button>
                            <Button
                              size="sm"
                              variant="secondary"
                              onClick={() => setEditingId(null)}
                            >
                              Cancel
                            </Button>
                          </>
                        ) : (
                          <>
                            <Button
                              size="sm"
                              variant="secondary"
                              onClick={() => startEdit(category)}
                            >
                              Edit
                            </Button>
                            <Button
                              size="sm"
                              variant="danger-ghost"
                              onClick={() => handleDelete(category)}
                            >
                              Delete
                            </Button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {deleteTarget && (
        <ConfirmDialog
          title="Delete Category"
          message={`Delete category '${deleteTarget.name}'?`}
          confirmLabel="Delete Category"
          loading={deleteCategory.isPending}
          onConfirm={handleDeleteConfirm}
          onClose={() => setDeleteTarget(null)}
        />
      )}
    </div>
  );
}
