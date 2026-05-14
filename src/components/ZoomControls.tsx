import { Minus, Plus } from "lucide-react";
import { useT } from "@/lib/i18n";

interface Props { zoom: number; onChange: (z: number) => void; min?: number; max?: number; step?: number; floating?: boolean }

export function ZoomControls({ zoom, onChange, min = 0.4, max = 2, step = 0.1, floating = false }: Props) {
  const { t } = useT();
  const dec = () => onChange(Math.max(min, Math.round((zoom - step) * 100) / 100));
  const inc = () => onChange(Math.min(max, Math.round((zoom + step) * 100) / 100));
  return (
    <div
      className={
        "inline-flex items-center gap-0.5 rounded-full border border-white/50 bg-white/40 backdrop-blur-md p-0.5 " +
        (floating ? "shadow-md" : "")
      }
    >
      <button type="button" onClick={dec} aria-label={t("common.zoomOut")}
        className="h-6 w-6 rounded-full grid place-items-center text-ink-muted hover:text-ink hover:bg-surface-2 active:scale-95 transition-all duration-150">
        <Minus className="h-3 w-3" />
      </button>
      <span className="text-[11px] font-medium text-ink tabular-nums w-8 text-center select-none">
        {Math.round(zoom * 100)}%
      </span>
      <button type="button" onClick={inc} aria-label={t("common.zoomIn")}
        className="h-6 w-6 rounded-full grid place-items-center text-ink-muted hover:text-ink hover:bg-surface-2 active:scale-95 transition-all duration-150">
        <Plus className="h-3 w-3" />
      </button>
    </div>
  );
}
