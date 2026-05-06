import { useEffect, useRef, useState } from "react";
import { Download, ChevronDown } from "lucide-react";
import { ExportFormat } from "@/lib/exporters";

interface Props { onExport: (format: ExportFormat) => void }

export function ExportMenu({ onExport }: Props) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onDoc = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, []);

  const pick = (f: ExportFormat) => { setOpen(false); onExport(f); };

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="inline-flex items-center gap-2 h-11 px-5 rounded-full border border-ink-2 text-ink text-[12px] font-bold uppercase tracking-[0.08em] transition-colors duration-200 hover:bg-surface-2"
      >
        <Download className="h-4 w-4" /> Export <ChevronDown className="h-3.5 w-3.5" />
      </button>
      {open && (
        <div className="absolute right-0 top-12 z-20 w-44 rounded-2xl border border-line bg-popover p-1 shadow-lg">
          {([
            { f: "pdf" as const, label: "PDF (.pdf)" },
            { f: "docx" as const, label: "Word (.docx)" },
            { f: "txt" as const, label: "Plain text (.txt)" },
          ]).map((o) => (
            <button
              key={o.f}
              type="button"
              onClick={() => pick(o.f)}
              className="w-full text-left px-3 py-2 rounded-xl text-[13px] text-ink hover:bg-surface-2 transition-colors duration-200"
            >
              {o.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
