import { LayoutTemplate, Check } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export type LayoutVariant = "classic" | "modern" | "compact";

const OPTIONS: { value: LayoutVariant; label: string; description: string }[] = [
  { value: "classic", label: "Classic", description: "Centered, single column" },
  { value: "modern", label: "Modern", description: "Two-column with sidebar" },
  { value: "compact", label: "Compact", description: "Denser, more on a page" },
];

export function LayoutMenu({
  value,
  onChange,
}: {
  value: LayoutVariant;
  onChange: (v: LayoutVariant) => void;
}) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button type="button" className="btn-ghost">
          <LayoutTemplate className="h-4 w-4" /> Layout
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

export function useLayoutVariant(storageKey: string, initial: LayoutVariant = "classic") {
  if (typeof window === "undefined") return [initial, () => {}] as const;
  return null as never;
}
