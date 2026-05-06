import { useState } from "react";
import { X, ChevronDown } from "lucide-react";
import { ExportFormat } from "@/lib/exporters";

interface Props {
  open: boolean;
  onClose: () => void;
  title?: string;
  defaultName?: string;
  onSave: (name: string, format: ExportFormat) => void;
}

const FORMATS: { f: ExportFormat; label: string }[] = [
  { f: "pdf", label: "PDF (.pdf)" },
  { f: "docx", label: "Word (.docx)" },
  { f: "txt", label: "Plain text (.txt)" },
];

export function SaveModal({ open, onClose, title = "Save", defaultName = "", onSave }: Props) {
  const [name, setName] = useState(defaultName);
  const [format, setFormat] = useState<ExportFormat>("pdf");

  if (!open) return null;
  return (
    <>
      <div className="fixed inset-0 z-50 bg-ink/40 animate-panel-in" onClick={onClose} />
      <div className="fixed inset-0 z-50 grid place-items-center p-4 pointer-events-none">
        <div className="relative pointer-events-auto w-full max-w-md rounded-3xl bg-popover border border-line p-6 shadow-2xl">
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="absolute top-4 right-4 h-9 w-9 grid place-items-center rounded-full text-ink-muted hover:text-ink hover:bg-surface-2 transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
          <h3 className="text-[20px] font-semibold text-ink mb-5 pr-10">{title}</h3>

          <label className="field-label" htmlFor="save-name">File name</label>
          <input
            id="save-name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Resume — Linear Senior PD"
            className="input-base mb-5"
            autoFocus
          />

          <label className="field-label" htmlFor="save-format">Format</label>
          <div className="relative mb-6">
            <select
              id="save-format"
              value={format}
              onChange={(e) => setFormat(e.target.value as ExportFormat)}
              className="input-base appearance-none pr-10 cursor-pointer"
            >
              {FORMATS.map(({ f, label }) => (
                <option key={f} value={f}>{label}</option>
              ))}
            </select>
            <ChevronDown className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-ink-muted" />
          </div>

          <div className="flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="btn-ghost flex-1 justify-center"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={() => { onSave(name.trim() || "Untitled", format); onClose(); }}
              className="btn-primary flex-1 justify-center"
            >
              Save
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
