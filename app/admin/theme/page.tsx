"use client";

import { useState, useEffect } from "react";
import {
  useAdminTheme,
  useUpdateThemeVar,
  useAddTheme,
  useDeleteTheme,
  ThemeRow,
} from "@/hooks/admin/useAdminTheme";
import { useTheme } from "@/components/ThemeProvider";
import Button from "@/components/Button";

const GROUP_ORDER = ["brand", "semantic", "scrollbar"];
const GROUP_LABELS: Record<string, string> = {
  brand: "Brand Colors",
  semantic: "Semantic / UI",
  scrollbar: "Scrollbar",
};

// ── Color Row ──────────────────────────────────────────────────
function ColorRow({ row, onSave, saving }: {
  row: ThemeRow;
  onSave: (variable: string, theme: string, value: string) => void;
  saving: boolean;
}) {
  const [value, setValue] = useState(row.value);
  const [saved, setSaved] = useState(false);
  const dirty = value !== row.value;

  function handleSave() {
    onSave(row.variable, row.theme, value);
    setSaved(true);
    setTimeout(() => setSaved(false), 1500);
  }

  return (
    <div className="flex items-center gap-3 py-2 border-b border-border last:border-0">
      {/* Color swatch + picker */}
      <div className="relative shrink-0">
        <div
          className="h-8 w-8 rounded-md border border-border cursor-pointer"
          style={{ background: value }}
        />
        <input
          type="color"
          value={value.startsWith("#") && value.length === 7 ? value : "#000000"}
          onChange={(e) => setValue(e.target.value)}
          className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
          title="Pick color"
        />
      </div>

      {/* Label + variable */}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-foreground truncate">{row.label || row.variable}</p>
        <p className="text-xs text-muted-foreground truncate">{row.variable}</p>
      </div>

      {/* Hex input */}
      <input
        type="text"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        className="w-28 rounded-md border border-border bg-background px-2 py-1 text-xs font-mono text-foreground"
        spellCheck={false}
      />

      {/* Save */}
      <Button
        size="sm"
        variant={saved ? "success" : dirty ? "primary" : "ghost"}
        onClick={handleSave}
        disabled={saving || !dirty}
      >
        {saved ? "Saved" : "Save"}
      </Button>
    </div>
  );
}

// ── Confirm Delete Dialog ─────────────────────────────────────
function ConfirmDeleteDialog({ theme, onConfirm, onClose }: {
  theme: string;
  onConfirm: () => void;
  onClose: () => void;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="w-80 rounded-2xl border border-border bg-card p-6 space-y-4 shadow-xl">
        <h2 className="text-lg font-bold text-foreground">Delete Theme</h2>
        <p className="text-sm text-muted-foreground">
          Are you sure you want to delete <span className="font-semibold text-foreground">&quot;{theme}&quot;</span>? This cannot be undone.
        </p>
        <div className="flex gap-2">
          <Button size="md" variant="danger" onClick={onConfirm}>Delete</Button>
          <Button size="md" variant="secondary" onClick={onClose}>Cancel</Button>
        </div>
      </div>
    </div>
  );
}

// ── Add Theme Dialog ───────────────────────────────────────────
function AddThemeDialog({ themes, onAdd, onClose }: {
  themes: string[];
  onAdd: (name: string, copyFrom: string) => void;
  onClose: () => void;
}) {
  const [name, setName] = useState("");
  const [copyFrom, setCopyFrom] = useState(themes[0] ?? "light");

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="w-80 rounded-2xl border border-border bg-card p-6 space-y-4 shadow-xl">
        <h2 className="text-lg font-bold text-foreground">Add Theme</h2>

        <div className="space-y-3">
          <div>
            <label className="mb-1 block text-xs font-medium text-muted-foreground">Theme Name</label>
            <input
              autoFocus
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. ocean, forest…"
              className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground"
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-muted-foreground">Copy colors from</label>
            <select
              value={copyFrom}
              onChange={(e) => setCopyFrom(e.target.value)}
              className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground"
            >
              {themes.map((t) => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="flex gap-2">
          <Button
            size="md"
            onClick={() => name.trim() && onAdd(name.trim(), copyFrom)}
            disabled={!name.trim()}
          >
            Add
          </Button>
          <Button size="md" variant="secondary" onClick={onClose}>Cancel</Button>
        </div>
      </div>
    </div>
  );
}

// ── Collapsible Group ─────────────────────────────────────────
function ColorGroup({ group, rows, onSave, saving }: {
  group: string;
  rows: ThemeRow[];
  onSave: (variable: string, theme: string, value: string) => void;
  saving: boolean;
}) {
  const [open, setOpen] = useState(false);

  return (
    <div className="rounded-2xl border border-border bg-card overflow-hidden">
      <button
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center justify-between px-4 py-3 text-left hover:bg-card-hover transition-colors"
      >
        <h2 className="text-sm font-semibold uppercase tracking-widest text-muted-foreground">
          {GROUP_LABELS[group] ?? group}
        </h2>
        <span className={`text-muted-foreground transition-transform duration-200 ${open ? "rotate-180" : ""}`}>
          ▾
        </span>
      </button>
      {open && (
        <div className="px-4 pb-2">
          {rows.map((row) => (
            <ColorRow
              key={`${row.theme}-${row.variable}`}
              row={row}
              onSave={onSave}
              saving={saving}
            />
          ))}
        </div>
      )}
    </div>
  );
}

// ── Main Page ──────────────────────────────────────────────────
export default function AdminThemePage() {
  const { data: rows, isLoading } = useAdminTheme();
  const updateVar = useUpdateThemeVar();
  const addTheme = useAddTheme();
  const deleteTheme = useDeleteTheme();
  const { theme: currentTheme } = useTheme();

  const [activeTheme, setActiveTheme] = useState<string>(
    currentTheme === "system" ? "light" : currentTheme
  );
  const [showAdd, setShowAdd] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);
  const [error, setError] = useState("");

  // All unique theme names
  const themes = [...new Set(rows?.map((r) => r.theme) ?? [])].sort();

  // Once data loads, ensure activeTheme exists in the list
  useEffect(() => {
    if (!themes.length) return;
    if (!themes.includes(activeTheme)) {
      const preferred = currentTheme !== "system" && themes.includes(currentTheme)
        ? currentTheme
        : themes[0];
      setActiveTheme(preferred);
    }
  }, [themes.join(",")]); // eslint-disable-line react-hooks/exhaustive-deps

  // Rows for the active theme, grouped
  const activeRows = rows?.filter((r) => r.theme === activeTheme) ?? [];
  const grouped = GROUP_ORDER.reduce<Record<string, ThemeRow[]>>((acc, g) => {
    const items = activeRows.filter((r) => r.group_name === g);
    if (items.length) acc[g] = items;
    return acc;
  }, {});

  async function handleSave(variable: string, theme: string, value: string) {
    setError("");
    try {
      await updateVar.mutateAsync({ variable, theme, value });
    } catch {
      setError("Failed to save color");
    }
  }

  async function handleAdd(name: string, copyFrom: string) {
    setError("");
    try {
      await addTheme.mutateAsync({ name, copyFrom });
      setShowAdd(false);
      setActiveTheme(name.toLowerCase().replace(/\s+/g, "-"));
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to add theme");
    }
  }

  async function handleDelete(theme: string) {
    setError("");
    try {
      await deleteTheme.mutateAsync(theme);
      setActiveTheme("light");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to delete theme");
    } finally {
      setConfirmDelete(null);
    }
  }

  if (isLoading) return <p className="text-muted-foreground text-sm">Loading themes…</p>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-foreground">Theme Configuration</h1>
        <Button size="md" onClick={() => setShowAdd(true)}>+ Add Theme</Button>
      </div>

      {error && (
        <p className="rounded-lg border border-red-200 bg-red-50 px-4 py-2 text-sm text-red-600">{error}</p>
      )}

      {/* Theme tabs */}
      <div className="flex flex-wrap gap-2">
        {themes.map((t) => (
          <div key={t} className="flex items-center gap-1">
            <button
              onClick={() => setActiveTheme(t)}
              className={`rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
                activeTheme === t
                  ? "bg-brand-lime-bright text-foreground"
                  : "bg-muted text-muted-foreground hover:text-foreground"
              }`}
            >
              {t}
            </button>
            {t !== "light" && t !== "dark" && (
              <button
                onClick={() => setConfirmDelete(t)}
                className="rounded-full p-1 text-xs text-muted-foreground hover:text-red-500 transition-colors"
                title={`Delete theme "${t}"`}
              >
                ✕
              </button>
            )}
          </div>
        ))}
      </div>

      {/* Color groups */}
      <div className="space-y-4">
        {Object.entries(grouped).map(([group, groupRows]) => (
          <ColorGroup
            key={`${activeTheme}-${group}`}
            group={group}
            rows={groupRows}
            onSave={handleSave}
            saving={updateVar.isPending}
          />
        ))}
      </div>

      {showAdd && (
        <AddThemeDialog
          themes={themes}
          onAdd={handleAdd}
          onClose={() => setShowAdd(false)}
        />
      )}

      {confirmDelete && (
        <ConfirmDeleteDialog
          theme={confirmDelete}
          onConfirm={() => handleDelete(confirmDelete)}
          onClose={() => setConfirmDelete(null)}
        />
      )}
    </div>
  );
}
