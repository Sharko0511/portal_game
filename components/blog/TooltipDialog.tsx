"use client";

import { useState, useEffect, useRef } from "react";

interface TooltipDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (text: string) => void;
  initialValue?: string;
}

export function TooltipDialog({
  isOpen,
  onClose,
  onConfirm,
  initialValue = "",
}: TooltipDialogProps) {
  const [value, setValue] = useState(initialValue);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setValue(initialValue);
  }, [initialValue]);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      // Focus input when dialog opens
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (value.trim()) {
      onConfirm(value.trim());
      setValue("");
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Escape") {
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 z-50 animate-in fade-in duration-150"
        onClick={onClose}
      />

      {/* Dialog */}
      <div className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-full max-w-md animate-in fade-in zoom-in-95 duration-150">
        <div className="bg-background border border-border rounded-lg shadow-xl overflow-hidden">
          {/* Header */}
          <div className="px-6 py-4 border-b border-border bg-muted/30">
            <h2 className="text-lg font-semibold text-foreground">
              Add Tooltip
            </h2>
            <p className="text-sm text-muted-foreground mt-1">
              Enter explanation text that will appear when hovering over the
              selected text
            </p>
          </div>

          {/* Content */}
          <form onSubmit={handleSubmit}>
            <div className="px-6 py-5">
              <input
                ref={inputRef}
                type="text"
                value={value}
                onChange={(e) => setValue(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Type your explanation here..."
                className="w-full px-4 py-2.5 bg-background border border-input rounded-md text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-shadow"
              />
            </div>

            {/* Footer */}
            <div className="px-6 py-4 bg-muted/20 border-t border-border flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-sm font-medium text-foreground hover:bg-muted rounded-md transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={!value.trim()}
                className="px-4 py-2 text-sm font-medium bg-primary text-primary-foreground hover:bg-primary/90 rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Add Tooltip
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
}
