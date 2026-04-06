"use client";

import { useState, useRef, useEffect } from "react";
import { Check, X } from "lucide-react";

interface EditableCellProps {
  language: string;
  namespace: string;
  keyPath: string;
  value: string;
  placeholder?: string;
  missing: boolean;
  saving: boolean;
  activeCell: string | null;
  onActivate: (id: string | null) => void;
  onSave: (language: string, namespace: string, key: string, value: string) => void;
}

export default function EditableCell({
  language,
  namespace,
  keyPath,
  value,
  placeholder,
  missing,
  saving,
  activeCell,
  onActivate,
  onSave,
}: EditableCellProps) {
  const cellId = `${language}:${namespace}:${keyPath}`;
  const editing = activeCell === cellId;

  const [draft, setDraft] = useState(value);
  const [saved, setSaved] = useState(false);
  const textareaRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (editing) textareaRef.current?.focus();
  }, [editing]);

  function handleSave() {
    if (draft === value) { onActivate(null); return; }
    onSave(language, namespace, keyPath, draft);
    setSaved(true);
    onActivate(null);
    setTimeout(() => setSaved(false), 1500);
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Escape") { setDraft(value); onActivate(null); }
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSave(); }
  }

  const displayContent = missing ? (
    <span className="italic text-muted-foreground/50 text-xs">— missing —</span>
  ) : value === "" && placeholder ? (
    <span className="text-xs italic text-muted-foreground/50 leading-snug wrap-break-word">{placeholder}</span>
  ) : (
    <span className={`text-xs leading-snug wrap-break-word ${saved ? "text-green-600" : "text-foreground"}`}>
      {value || "\u00A0"}
    </span>
  );

  return (
    <div
      className={`relative rounded border px-2 py-1.5 transition-colors
        ${editing ? "border-brand-primary/60" : "border-transparent hover:border-border cursor-pointer"}
        ${saved ? "bg-green-50 dark:bg-green-950/20" : ""}`}
      onClick={!editing ? () => { setDraft(value); onActivate(cellId); } : undefined}
    >
      {/* Always-present display text keeps the cell size stable */}
      <div className={editing ? "invisible" : "visible"}>
        {displayContent}
      </div>

      {/* Input overlays exactly on top when editing */}
      {editing && (
        <>
          <input
            ref={textareaRef}
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            className="absolute inset-0 w-full rounded bg-background py-1.5 pl-2 pr-14 text-xs text-foreground outline-none placeholder:text-muted-foreground/40 placeholder:italic"
          />
          <div className="absolute right-1 top-1/2 -translate-y-1/2 flex items-center gap-1 z-10">
            <button
              onClick={handleSave}
              disabled={saving}
              className="rounded p-1 text-green-600 hover:bg-green-100 dark:hover:bg-green-950/40 disabled:opacity-40 transition-colors"
              title="Save (Enter)"
            >
              <Check className="h-3.5 w-3.5" />
            </button>
            <button
              onClick={() => { setDraft(value); onActivate(null); }}
              className="rounded p-1 text-muted-foreground hover:bg-muted transition-colors"
              title="Cancel (Escape)"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
        </>
      )}
    </div>
  );
}
