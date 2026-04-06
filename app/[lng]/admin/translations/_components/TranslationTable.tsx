"use client";

import { useState } from "react";
import { NAMESPACE_INFO, PROTECTED_LANGS } from "./constants";
import TranslationRow from "./TranslationRow";
import { PivotedTranslations } from "@/hooks/admin/useAdminTranslations";

interface TranslationTableProps {
  namespace: string;
  keys: PivotedTranslations[string];
  languages: string[];
  saving: boolean;
  activeCell: string | null;
  onActivate: (id: string | null) => void;
  onSave: (lang: string, ns: string, key: string, value: string) => void;
}

export default function TranslationTable({
  namespace,
  keys,
  languages,
  saving,
  activeCell,
  onActivate,
  onSave,
}: TranslationTableProps) {
  const info = NAMESPACE_INFO[namespace];
  const [open, setOpen] = useState(true);

  return (
    <div className="rounded-2xl border border-border bg-card overflow-hidden">
      <button
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center justify-between px-4 py-3 border-b border-border bg-muted/20 hover:bg-muted/30 transition-colors text-left"
      >
        <div className="flex items-center gap-3">
          <span className={`text-muted-foreground transition-transform duration-200 text-xs ${open ? "rotate-180" : ""}`}>
            ▾
          </span>
          <span className="text-sm font-semibold uppercase tracking-widest text-muted-foreground">
            {namespace}
          </span>
          <span className="text-xs text-muted-foreground">
            {info?.area} · <span className="font-mono text-[11px]">{info?.pages}</span>
          </span>
        </div>
        <span className="text-xs text-muted-foreground">{Object.keys(keys).length} keys</span>
      </button>

      {open && (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left py-2 px-3 text-xs font-medium text-muted-foreground w-48">Key</th>
                {languages.map((lang) => (
                  <th key={lang} className="text-left py-2 px-1 text-xs font-medium text-muted-foreground min-w-35">
                    {lang.toUpperCase()}
                    {PROTECTED_LANGS.includes(lang) && " 🔒"}
                  </th>
                ))}
                <th className="text-left py-2 px-3 text-xs font-medium text-muted-foreground w-36">Page</th>
              </tr>
            </thead>
            <tbody>
              {Object.entries(keys).map(([keyPath, langValues]) => (
                <TranslationRow
                  key={keyPath}
                  namespace={namespace}
                  keyPath={keyPath}
                  langValues={langValues}
                  allLanguages={languages}
                  saving={saving}
                  activeCell={activeCell}
                  onActivate={onActivate}
                  onSave={onSave}
                />
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
