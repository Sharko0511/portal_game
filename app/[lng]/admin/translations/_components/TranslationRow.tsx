import { NAMESPACE_INFO } from "./constants";
import EditableCell from "./EditableCell";

interface TranslationRowProps {
  namespace: string;
  keyPath: string;
  langValues: Record<string, { id: string; value: string; updated_at: string }>;
  allLanguages: string[];
  saving: boolean;
  activeCell: string | null;
  onActivate: (id: string | null) => void;
  onSave: (lang: string, ns: string, key: string, value: string) => void;
}

export default function TranslationRow({
  namespace,
  keyPath,
  langValues,
  allLanguages,
  saving,
  activeCell,
  onActivate,
  onSave,
}: TranslationRowProps) {
  const info = NAMESPACE_INFO[namespace];

  return (
    <tr className="border-b border-border hover:bg-muted/10 transition-colors">
      <td className="py-2 px-3 align-top">
        <div className="text-xs font-mono text-foreground">{keyPath}</div>
      </td>

      {allLanguages.map((lang) => {
        const cell = langValues[lang];
        return (
          <td key={lang} className="py-1 px-1 align-top min-w-35 max-w-55">
            <EditableCell
              language={lang}
              namespace={namespace}
              keyPath={keyPath}
              value={cell?.value ?? ""}
              placeholder={langValues["en"]?.value || keyPath}
              missing={!cell}
              saving={saving}
              activeCell={activeCell}
              onActivate={onActivate}
              onSave={onSave}
            />
          </td>
        );
      })}

      <td className="py-2 px-3 align-top whitespace-nowrap">
        <div className="text-xs text-muted-foreground">{info?.pages ?? namespace}</div>
        <div className="text-[10px] text-muted-foreground/60">{info?.area}</div>
      </td>
    </tr>
  );
}
