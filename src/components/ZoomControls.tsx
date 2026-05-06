import { Minus, Plus } from "lucide-react";

interface Props { zoom: number; onChange: (z: number) => void; min?: number; max?: number; step?: number }

export function ZoomControls({ zoom, onChange, min = 0.5, max = 2, step = 0.1 }: Props) {
  const dec = () => onChange(Math.max(min, Math.round((zoom - step) * 100) / 100));
  const inc = () => onChange(Math.min(max, Math.round((zoom + step) * 100) / 100));
  return (
    <div className="inline-flex items-center gap-1 rounded-full border border-line bg-popover p-1">
      <button type="button" onClick={dec} aria-label="Zoom out"
        className="h-7 w-7 rounded-full grid place-items-center text-ink hover:bg-surface-2 transition-colors duration-200">
        <Minus className="h-3.5 w-3.5" />
      </button>
      <span className="px-2 text-[12px] tabular-nums text-ink-muted min-w-[40px] text-center">{Math.round(zoom * 100)}%</span>
      <button type="button" onClick={inc} aria-label="Zoom in"
        className="h-7 w-7 rounded-full grid place-items-center text-ink hover:bg-surface-2 transition-colors duration-200">
        <Plus className="h-3.5 w-3.5" />
      </button>
    </div>
  );
}
