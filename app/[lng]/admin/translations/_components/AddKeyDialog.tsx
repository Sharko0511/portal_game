"use client";

import { useState } from "react";
import Button from "@/components/Button";
import { PROTECTED_LANGS } from "./constants";

interface AddKeyDialogProps {
  namespaces: string[];
  languages: string[];
  onAdd: (namespace: string, key: string, values: Record<string, string>) => void;
  onClose: () => void;
}

export default function AddKeyDialog({ namespaces, languages, onAdd, onClose }: AddKeyDialogProps) {
  const [namespace, setNamespace] = useState(namespaces[0] ?? "common");
  const [key, setKey] = useState("");
  const [values, setValues] = useState<Record<string, string>>({});

  const allLangs = [...new Set([...PROTECTED_LANGS, ...languages])];
  const canSubmit = key.trim().length > 0 && !!values["en"]?.trim();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="w-96 max-h-[80vh] overflow-y-auto rounded-2xl border border-border bg-card p-6 space-y-4 shadow-xl">
        <h2 className="text-lg font-bold text-foreground">Add Translation Key</h2>

        <div className="space-y-3">
          <div>
            <label className="mb-1 block text-xs font-medium text-muted-foreground">Namespace</label>
            <select
              value={namespace}
              onChange={(e) => setNamespace(e.target.value)}
              className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground"
            >
              {namespaces.map((ns) => (
                <option key={ns} value={ns}>{ns}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="mb-1 block text-xs font-medium text-muted-foreground">Key</label>
            <input
              autoFocus
              type="text"
              value={key}
              onChange={(e) => setKey(e.target.value)}
              placeholder="e.g. button.submit"
              className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground"
            />
          </div>

          {allLangs.map((lang) => (
            <div key={lang}>
              <label className="mb-1 flex items-center gap-1 text-xs font-medium text-muted-foreground">
                {lang.toUpperCase()}
                {lang === "en" && <span className="text-red-500">*</span>}
              </label>
              <input
                type="text"
                value={values[lang] ?? ""}
                onChange={(e) => setValues((v) => ({ ...v, [lang]: e.target.value }))}
                placeholder={`${lang.toUpperCase()} translation`}
                className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground"
              />
            </div>
          ))}
        </div>

        <div className="flex gap-2">
          <Button
            size="md"
            onClick={() => canSubmit && onAdd(namespace, key.trim(), values)}
            disabled={!canSubmit}
          >
            Add Key
          </Button>
          <Button size="md" variant="secondary" onClick={onClose}>Cancel</Button>
        </div>
      </div>
    </div>
  );
}
