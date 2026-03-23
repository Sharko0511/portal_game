"use client";

import { useState } from "react";
import {
  useAdminTranslations,
  useUpdateTranslation,
  useDeleteLanguage,
  useRevertTranslations,
  useSaveDefault,
  pivotTranslations,
} from "@/hooks/admin/useAdminTranslations";
import Button from "@/components/Button";
import NamespaceTabs from "./_components/NamespaceTabs";
import LanguageBar from "./_components/LanguageBar";
import TranslationTable from "./_components/TranslationTable";
import RevertDialog from "./_components/RevertDialog";
import AddLanguageDialog from "./_components/AddLanguageDialog";
import ConfirmDialog from "./_components/ConfirmDialog";

export default function AdminTranslationsPage() {
  const { data, isLoading } = useAdminTranslations();
  const updateTranslation = useUpdateTranslation();
  const deleteLang = useDeleteLanguage();
  const revert = useRevertTranslations();
  const saveDefault = useSaveDefault();

  const [activeNamespace, setActiveNamespace] = useState("__all__");
  const [search, setSearch] = useState("");
  const [error, setError] = useState("");
  const [activeCell, setActiveCell] = useState<string | null>(null);
  const [showAddLang, setShowAddLang] = useState(false);
  const [deleteLangConfirm, setDeleteLangConfirm] = useState<string | null>(null);
  const [revertLang, setRevertLang] = useState<string | null>(null);

  const rows = data?.data ?? [];
  const languages = data?.languages ?? [];
  const namespaces = data?.namespaces ?? [];
  const pivot = pivotTranslations(rows);

  const displayedNamespaces =
    activeNamespace === "__all__" ? namespaces : namespaces.filter((ns) => ns === activeNamespace);

  const filteredPivot: typeof pivot = {};
  for (const ns of displayedNamespaces) {
    if (!pivot[ns]) continue;
    const keys = Object.keys(pivot[ns]).filter((k) =>
      search ? k.toLowerCase().includes(search.toLowerCase()) : true
    );
    if (keys.length) {
      filteredPivot[ns] = {};
      for (const k of keys) filteredPivot[ns][k] = pivot[ns][k];
    }
  }

  async function handleSave(lang: string, ns: string, key: string, value: string) {
    setError("");
    try {
      await updateTranslation.mutateAsync({ language: lang, namespace: ns, key, value });
    } catch {
      setError("Failed to save translation");
    }
  }

  async function handleDeleteLanguage(lang: string) {
    setError("");
    try {
      await deleteLang.mutateAsync(lang);
      setDeleteLangConfirm(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to delete language");
    }
  }

  async function handleRevertConfirm(snapshot: "v1" | "saved") {
    if (!revertLang) return;
    setError("");
    try {
      await revert.mutateAsync({ snapshot, language: revertLang });
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to revert");
    } finally {
      setRevertLang(null);
    }
  }

  async function handleSaveDefault(lang: string) {
    setError("");
    try {
      await saveDefault.mutateAsync({ language: lang });
    } catch {
      setError("Failed to save default");
    }
  }

  if (isLoading) return <p className="text-muted-foreground text-sm">Loading translations…</p>;

  const totalKeys = Object.values(filteredPivot).reduce(
    (sum, ns) => sum + Object.keys(ns).length,
    0
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <h1 className="text-2xl font-bold text-foreground">Translation Management</h1>
        <Button size="md" variant="secondary" onClick={() => setShowAddLang(true)}>+ Language</Button>
      </div>

      {error && (
        <p className="rounded-lg border border-red-200 bg-red-50 dark:bg-red-950/20 px-4 py-2 text-sm text-red-600">
          {error}
        </p>
      )}

      <input
        type="text"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder="Search keys…"
        className="w-full max-w-sm rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground"
      />

      <NamespaceTabs
        namespaces={namespaces}
        active={activeNamespace}
        onChange={setActiveNamespace}
      />

      <LanguageBar
        languages={languages}
        onRevert={setRevertLang}
        onSaveDefault={handleSaveDefault}
        onDeleteLanguage={setDeleteLangConfirm}
      />

      {Object.keys(filteredPivot).length === 0 ? (
        <p className="text-muted-foreground text-sm py-8 text-center">No translations found.</p>
      ) : (
        <div className="space-y-6">
          {Object.entries(filteredPivot).map(([ns, keys]) => (
            <TranslationTable
              key={ns}
              namespace={ns}
              keys={keys}
              languages={languages}
              saving={updateTranslation.isPending}
              activeCell={activeCell}
              onActivate={setActiveCell}
              onSave={handleSave}
            />
          ))}
        </div>
      )}

      <p className="text-xs text-muted-foreground">
        {totalKeys} key{totalKeys !== 1 ? "s" : ""} shown
      </p>

      {showAddLang && (
        <AddLanguageDialog
          existingLanguages={languages}
          onAdd={(code) => { void code; setShowAddLang(false); }}
          onClose={() => setShowAddLang(false)}
        />
      )}

      {deleteLangConfirm && (
        <ConfirmDialog
          title="Delete Language"
          message={`Delete all "${deleteLangConfirm.toUpperCase()}" translations? This cannot be undone.`}
          confirmLabel="Delete Language"
          onConfirm={() => handleDeleteLanguage(deleteLangConfirm)}
          onClose={() => setDeleteLangConfirm(null)}
        />
      )}

      {revertLang && (
        <RevertDialog
          language={revertLang}
          hasSaved={true}
          onRevert={handleRevertConfirm}
          onClose={() => setRevertLang(null)}
        />
      )}
    </div>
  );
}
