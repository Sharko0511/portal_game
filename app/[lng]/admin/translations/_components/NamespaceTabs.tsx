import { NAMESPACE_INFO } from "./constants";

interface NamespaceTabsProps {
  namespaces: string[];
  active: string;
  onChange: (ns: string) => void;
}

export default function NamespaceTabs({ namespaces, active, onChange }: NamespaceTabsProps) {
  return (
    <div className="flex flex-wrap gap-1.5">
      <button
        onClick={() => onChange("__all__")}
        className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
          active === "__all__"
            ? "bg-brand-lime-bright text-foreground"
            : "bg-muted text-muted-foreground hover:text-foreground"
        }`}
      >
        All
      </button>
      {namespaces.map((ns) => {
        const info = NAMESPACE_INFO[ns];
        return (
          <button
            key={ns}
            onClick={() => onChange(ns)}
            className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
              active === ns
                ? "bg-brand-lime-bright text-foreground"
                : "bg-muted text-muted-foreground hover:text-foreground"
            }`}
            title={info ? `${info.area} · ${info.pages}` : ns}
          >
            {ns}
          </button>
        );
      })}
    </div>
  );
}
