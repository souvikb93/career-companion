import { Minus, Plus, ChevronDown } from "lucide-react";
import { useEffect, useRef, useState } from "react";

interface Props { zoom: number; onChange: (z: number) => void; min?: number; max?: number; step?: number; floating?: boolean }

const PRESETS = [0.5, 0.75, 1, 1.25, 1.5, 2];

export function ZoomControls({ zoom, onChange, min = 0.5, max = 2, step = 0.1, floating = false }: Props) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const dec = () => onChange(Math.max(min, Math.round((zoom - step) * 100) / 100));
  const inc = () => onChange(Math.min(max, Math.round((zoom + step) * 100) / 100));

  useEffect(() => {
    const onDoc = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, []);

  return (
    <div
      ref={ref}
      className={
        "inline-flex items-center gap-1 rounded-full border border-line bg-popover p-1 " +
        (floating ? "shadow-lg" : "")
      }
    >
      <button type="button" onClick={dec} aria-label="Zoom out"
        className="h-7 w-7 rounded-full grid place-items-center text-ink hover:bg-surface-2 transition-colors duration-200">
        <Minus className="h-3.5 w-3.5" />
      </button>
      <div className="relative">
        <button
          type="button"
          onClick={() => setOpen((o) => !o)}
          className="px-2 h-7 inline-flex items-center gap-1 text-[12px] tabular-nums text-ink min-w-[64px] justify-center rounded-full hover:bg-surface-2 transition-colors duration-200"
        >
          {Math.round(zoom * 100)}%
          <ChevronDown className="h-3 w-3 text-ink-muted" />
        </button>
        {open && (
          <div className="absolute left-1/2 -translate-x-1/2 mt-2 z-30 w-28 rounded-2xl border border-line bg-popover p-1 shadow-lg">
            {PRESETS.map((p) => (
              <button
                key={p}
                type="button"
                onClick={() => { onChange(p); setOpen(false); }}
                className="w-full text-left px-3 py-1.5 rounded-xl text-[12px] text-ink hover:bg-surface-2 transition-colors duration-150"
              >
                {Math.round(p * 100)}%
              </button>
            ))}
          </div>
        )}
      </div>
      <button type="button" onClick={inc} aria-label="Zoom in"
        className="h-7 w-7 rounded-full grid place-items-center text-ink hover:bg-surface-2 transition-colors duration-200">
        <Plus className="h-3.5 w-3.5" />
      </button>
    </div>
  );
}
