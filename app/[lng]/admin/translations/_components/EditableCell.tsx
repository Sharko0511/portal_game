"use client";

import { useState, useRef, useEffect } from "react";
import Button from "@/components/Button";

interface EditableCellProps {
  language: string;
  namespace: string;
  keyPath: string;
  value: string;
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
  const textareaRef = useRef<HTMLTextAreaElement>(null);

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

  if (editing) {
    return (
      <div className="flex flex-col gap-1 py-1">
        <textarea
          ref={textareaRef}
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={handleKeyDown}
          rows={2}
          className="w-full rounded-md border border-border bg-background px-2 py-1 text-xs text-foreground resize-none"
        />
        <div className="flex gap-1">
          <Button size="sm" onClick={handleSave} disabled={saving}>Save</Button>
          <Button size="sm" variant="ghost" onClick={() => { setDraft(value); onActivate(null); }}>✕</Button>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`cursor-pointer rounded px-2 py-1.5 border border-transparent hover:border-border transition-colors ${saved ? "bg-green-50 dark:bg-green-950/20" : ""}`}
      onClick={() => { setDraft(value); onActivate(cellId); }}
      title="Click to edit"
    >
      {missing ? (
        <span className="italic text-muted-foreground/50 text-xs">— missing —</span>
      ) : (
        <span className={`text-xs text-foreground leading-snug break-words ${saved ? "text-green-600" : ""}`}>
          {value}
        </span>
      )}
    </div>
  );
}
