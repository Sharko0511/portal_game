import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { adminFetch, adminFetchJson } from "@/lib/admin-fetch";

export interface TranslationRow {
  id: string;
  language: string;
  namespace: string;
  key: string;
  value: string;
  updated_at: string;
}

export interface TranslationsResponse {
  data: TranslationRow[];
  languages: string[];
  namespaces: string[];
}

// Pivot flat rows into { [namespace][key][language] } for easy table rendering
export type PivotedTranslations = {
  [namespace: string]: {
    [key: string]: {
      [language: string]: { id: string; value: string; updated_at: string };
    };
  };
};

export function pivotTranslations(rows: TranslationRow[]): PivotedTranslations {
  const pivot: PivotedTranslations = {};
  for (const row of rows) {
    if (!pivot[row.namespace]) pivot[row.namespace] = {};
    if (!pivot[row.namespace][row.key]) pivot[row.namespace][row.key] = {};
    pivot[row.namespace][row.key][row.language] = {
      id: row.id,
      value: row.value,
      updated_at: row.updated_at,
    };
  }
  return pivot;
}

export function useAdminTranslations() {
  return useQuery<TranslationsResponse>({
    queryKey: ["admin", "translations"],
    queryFn: () => adminFetchJson<TranslationsResponse>("/api/admin/translations"),
  });
}

// Update or create a single cell value
export function useUpdateTranslation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: {
      language: string;
      namespace: string;
      key: string;
      value: string;
    }) => {
      const res = await adminFetch("/api/admin/translations", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error?.message ?? "Failed to save");
      }
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["admin", "translations"] }),
  });
}

// Create a new key across multiple languages
export function useCreateTranslationKey() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: {
      namespace: string;
      key: string;
      values: Record<string, string>;
    }) => {
      const res = await adminFetch("/api/admin/translations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error?.message ?? "Failed to create key");
      }
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["admin", "translations"] }),
  });
}

// Delete a key across all languages
export function useDeleteTranslationKey() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: { namespace: string; key: string }) => {
      const res = await adminFetch(
        `/api/admin/translations?namespace=${encodeURIComponent(payload.namespace)}&key=${encodeURIComponent(payload.key)}`,
        { method: "DELETE" }
      );
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error?.message ?? "Failed to delete key");
      }
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["admin", "translations"] }),
  });
}

// Add a new language — creates empty rows for all existing keys
export function useAddLanguage() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (language: string) => {
      const res = await adminFetch("/api/admin/translations/add-language", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ language }),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error?.message ?? "Failed to add language");
      }
      return res.json();
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["admin", "translations"] }),
  });
}

// Delete an entire custom language (blocked for en/vi in API)
export function useDeleteLanguage() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (language: string) => {
      const res = await adminFetch(
        `/api/admin/translations?language=${encodeURIComponent(language)}`,
        { method: "DELETE" }
      );
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error?.message ?? "Failed to delete language");
      }
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["admin", "translations"] }),
  });
}

// Revert to a snapshot milestone ('v1' or 'saved')
export function useRevertTranslations() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: {
      snapshot: "v1" | "saved";
      language: string;
      namespace?: string;
      key?: string;
    }) => {
      const res = await adminFetch("/api/admin/translations/revert", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error?.message ?? "Failed to revert");
      }
      return res.json();
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["admin", "translations"] }),
  });
}

// Save current values as the 'saved' snapshot
export function useSaveDefault() {
  return useMutation({
    mutationFn: async (payload: {
      language: string;
      namespace?: string;
      key?: string;
    }) => {
      const res = await adminFetch("/api/admin/translations/save-default", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error?.message ?? "Failed to save default");
      }
      return res.json();
    },
  });
}
