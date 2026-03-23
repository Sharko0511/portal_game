"use client";

import { useState } from "react";
import Button from "@/components/Button";

interface AddLanguageDialogProps {
  existingLanguages: string[];
  onAdd: (code: string) => void;
  onClose: () => void;
}

export default function AddLanguageDialog({
  existingLanguages,
  onAdd,
  onClose,
}: AddLanguageDialogProps) {
  const [code, setCode] = useState("");
  const invalid = existingLanguages.includes(code.trim().toLowerCase());

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="w-72 rounded-2xl border border-border bg-card p-6 space-y-4 shadow-xl">
        <h2 className="text-lg font-bold text-foreground">Add Language</h2>
        <p className="text-xs text-muted-foreground">
          Enter a language code (e.g. <code>fr</code>, <code>ja</code>, <code>ko</code>).
          You&apos;ll fill in the translations after adding.
        </p>

        <div>
          <label className="mb-1 block text-xs font-medium text-muted-foreground">Language code</label>
          <input
            autoFocus
            type="text"
            value={code}
            onChange={(e) => setCode(e.target.value.toLowerCase().slice(0, 5))}
            placeholder="e.g. fr"
            className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground"
          />
          {invalid && <p className="mt-1 text-xs text-red-500">Language already exists</p>}
        </div>

        <div className="flex gap-2">
          <Button
            size="md"
            onClick={() => code.trim() && !invalid && onAdd(code.trim())}
            disabled={!code.trim() || invalid}
          >
            Add
          </Button>
          <Button size="md" variant="secondary" onClick={onClose}>Cancel</Button>
        </div>
      </div>
    </div>
  );
}
