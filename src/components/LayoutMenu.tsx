import { LayoutTemplate, Check } from "lucide-react";
import { useT } from "@/lib/i18n";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export type LayoutVariant = "classic" | "modern" | "compact";

export function LayoutMenu({
  value,
  onChange,
}: {
  value: LayoutVariant;
  onChange: (v: LayoutVariant) => void;
}) {
  const { t } = useT();
  const OPTIONS: { value: LayoutVariant; label: string; description: string }[] = [
    { value: "classic", label: t("layouts.classic"), description: t("layouts.classicDesc") },
    { value: "modern", label: t("layouts.modern"), description: t("layouts.modernDesc") },
    { value: "compact", label: t("layouts.compact"), description: t("layouts.compactDesc") },
  ];
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button type="button" className="btn-ghost">
          <LayoutTemplate className="h-4 w-4" /> {t("common.layout")}
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        {OPTIONS.map((opt) => (
          <DropdownMenuItem
            key={opt.value}
            onClick={() => onChange(opt.value)}
            className="flex items-start gap-2 cursor-pointer"
          >
            <Check
              className={
                "h-4 w-4 mt-0.5 " + (value === opt.value ? "opacity-100 text-brand" : "opacity-0")
              }
            />
            <div className="flex-1">
              <div className="text-[13px] font-medium text-ink">{opt.label}</div>
              <div className="text-[12px] text-ink-muted">{opt.description}</div>
            </div>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export function loadLayout(key: string, fallback: LayoutVariant = "classic"): LayoutVariant {
  if (typeof window === "undefined") return fallback;
  const v = window.localStorage.getItem(key);
  return v === "classic" || v === "modern" || v === "compact" ? v : fallback;
}
