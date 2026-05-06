import { useState } from "react";
import { X } from "lucide-react";
import { ExportFormat } from "@/lib/exporters";

interface Props {
  open: boolean;
  onClose: () => void;
  title?: string;
  defaultName?: string;
  onSave: (name: string, format: ExportFormat) => void;
}

const FORMATS: { f: ExportFormat; label: string }[] = [
  { f: "pdf", label: "PDF" },
  { f: "docx", label: "DOC" },
  { f: "txt", label: "TXT" },
];

export function SaveModal({ open, onClose, title = "Save", defaultName = "", onSave }: Props) {
  const [name, setName] = useState(defaultName);
  const [format, setFormat] = useState<ExportFormat>("pdf");

  if (!open) return null;
  return (
    <>
      <div className="fixed inset-0 z-50 bg-ink/40 animate-panel-in" onClick={onClose} />
      <div className="fixed inset-0 z-50 grid place-items-center p-4 pointer-events-none">
        <div className="pointer-events-auto w-full max-w-md rounded-3xl bg-popover border border-line p-6 shadow-2xl">
          <div className="flex items-start justify-between mb-5">
            <h3 className="text-[20px] font-semibold text-ink">{title}</h3>
            <button
              type="button"
              onClick={onClose}
              aria-label="Close"
              className="h-9 w-9 rounded-full grid place-items-center border border-line text-ink hover:bg-surface-2 transition-colors duration-200"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          <label className="field-label" htmlFor="save-name">Name</label>
          <input
            id="save-name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Resume — Linear Senior PD"
            className="input-base mb-5"
            autoFocus
          />

          <p className="field-label">Format</p>
          <div className="grid grid-cols-3 gap-2 mb-6">
            {FORMATS.map(({ f, label }) => {
              const active = format === f;
              return (
                <button
                  key={f}
                  type="button"
                  onClick={() => setFormat(f)}
                  className={
                    "h-11 rounded-full border text-[13px] font-semibold transition-colors duration-180 " +
                    (active ? "border-brand text-brand bg-brand/5" : "border-line text-ink hover:bg-surface-2")
                  }
                >
                  {label}
                </button>
              );
            })}
          </div>

          <div className="flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 h-11 rounded-full border border-line text-ink text-[12px] font-bold uppercase tracking-[0.08em] transition-colors duration-200 hover:bg-surface-2"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={() => { onSave(name.trim() || "Untitled", format); onClose(); }}
              className="flex-1 h-11 rounded-full bg-brand text-primary-foreground text-[12px] font-bold uppercase tracking-[0.08em] transition-opacity duration-200 hover:opacity-90"
            >
              Save
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
