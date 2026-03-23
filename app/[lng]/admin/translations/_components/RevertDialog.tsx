import Button from "@/components/Button";

interface RevertDialogProps {
  language: string;
  hasSaved: boolean;
  onRevert: (snapshot: "v1" | "saved") => void;
  onClose: () => void;
}

export default function RevertDialog({ language, hasSaved, onRevert, onClose }: RevertDialogProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="w-80 rounded-2xl border border-border bg-card p-6 space-y-4 shadow-xl">
        <h2 className="text-lg font-bold text-foreground">Revert {language.toUpperCase()}</h2>
        <p className="text-sm text-muted-foreground">
          Restore{" "}
          <span className="font-semibold text-foreground">
            all {language.toUpperCase()} translations
          </span>{" "}
          to which milestone?
        </p>

        <div className="space-y-2">
          <button
            onClick={() => onRevert("v1")}
            className="w-full text-left rounded-xl border border-border bg-background hover:bg-muted/30 px-4 py-3 transition-colors"
          >
            <div className="flex items-center gap-2">
              <span className="text-lg">🔒</span>
              <div>
                <p className="text-sm font-semibold text-foreground">Original (v1)</p>
                <p className="text-xs text-muted-foreground">
                  The first hardcoded seed values — only changes through code
                </p>
              </div>
            </div>
          </button>

          <button
            onClick={() => onRevert("saved")}
            disabled={!hasSaved}
            className="w-full text-left rounded-xl border border-border bg-background hover:bg-muted/30 px-4 py-3 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <div className="flex items-center gap-2">
              <span className="text-lg">💾</span>
              <div>
                <p className="text-sm font-semibold text-foreground">Last saved default</p>
                <p className="text-xs text-muted-foreground">
                  {hasSaved ? "Admin's last saved snapshot" : "No saved snapshot yet"}
                </p>
              </div>
            </div>
          </button>
        </div>

        <Button size="md" variant="secondary" onClick={onClose} className="w-full">
          Cancel
        </Button>
      </div>
    </div>
  );
}
