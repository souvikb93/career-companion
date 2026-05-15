import { useT } from "@/lib/i18n";
import { cn } from "@/lib/utils";

export function LanguageToggle() {
  const { lang, setLang } = useT();
  const opts: { value: "de" | "en"; label: string }[] = [
    { value: "de", label: "DE" },
    { value: "en", label: "EN" },
  ];
  return (
    <div
      role="group"
      aria-label="Language"
      className="inline-flex items-center rounded-full border border-line bg-surface-2 p-0.5"
    >
      {opts.map((o) => {
        const active = lang === o.value;
        return (
          <button
            key={o.value}
            type="button"
            onClick={() => setLang(o.value)}
            aria-pressed={active}
            className={cn(
              "h-8 px-3 rounded-full text-[12px] font-semibold transition-colors duration-200",
              active ? "bg-ink text-white nav-item-active" : "text-ink-muted hover:text-ink",
            )}
          >
            {o.label}
          </button>
        );
      })}
    </div>
  );
}
