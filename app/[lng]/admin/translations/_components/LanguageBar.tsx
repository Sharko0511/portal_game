import { PROTECTED_LANGS } from "./constants";

interface LanguageBarProps {
  languages: string[];
  onRevert: (lang: string) => void;
  onSaveDefault: (lang: string) => void;
  onDeleteLanguage: (lang: string) => void;
}

export default function LanguageBar({
  languages,
  onRevert,
  onSaveDefault,
  onDeleteLanguage,
}: LanguageBarProps) {
  return (
    <div className="flex items-center gap-3 text-xs text-muted-foreground flex-wrap">
      <span>Languages:</span>
      {languages.map((lang) => {
        const isProtected = PROTECTED_LANGS.includes(lang);
        return (
          <div key={lang} className="flex items-center gap-1">
            <span
              className={`rounded px-2 py-0.5 font-medium ${
                isProtected
                  ? "bg-muted text-foreground"
                  : "bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300"
              }`}
            >
              {lang.toUpperCase()}
              {isProtected && " 🔒"}
            </span>

            {isProtected && (
              <>
                <button
                  onClick={() => onRevert(lang)}
                  className="flex items-center justify-center w-8 h-8 rounded-md text-base text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                  title={`Revert all ${lang.toUpperCase()} translations`}
                >
                  ↺
                </button>
                <button
                  onClick={() => onSaveDefault(lang)}
                  className="flex items-center justify-center w-8 h-8 rounded-md text-base text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                  title={`Save current ${lang.toUpperCase()} as default snapshot`}
                >
                  💾
                </button>
              </>
            )}

            {!isProtected && (
              <button
                onClick={() => onDeleteLanguage(lang)}
                className="flex items-center justify-center w-8 h-8 rounded-md text-base text-muted-foreground hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 transition-colors"
                title={`Delete language ${lang}`}
              >
                ✕
              </button>
            )}
          </div>
        );
      })}
    </div>
  );
}
