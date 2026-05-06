import { X, FileText, Trash2 } from "lucide-react";
import { SavedCV } from "@/lib/saved-cvs";

interface Props<T> {
  open: boolean;
  onClose: () => void;
  list: SavedCV<T>[];
  onLoad: (item: SavedCV<T>) => void;
  onDelete: (id: string) => void;
  onSaveCurrent: (name: string) => void;
  defaultName?: string;
}

export function SavedCVsPanel<T>({ open, onClose, list, onLoad, onDelete, onSaveCurrent, defaultName }: Props<T>) {
  if (!open) return null;
  return (
    <>
      <div className="fixed inset-0 z-40 bg-ink/20 animate-panel-in" onClick={onClose} />
      <aside className="fixed top-0 right-0 z-50 h-screen w-full max-w-[440px] bg-popover border-l border-line overflow-y-auto animate-slide-in-right">
        <div className="p-8">
          <div className="flex items-start justify-between gap-4 mb-6">
            <div>
              <h2 className="text-[24px] font-semibold text-ink leading-tight">Saved CVs</h2>
              <p className="text-[13px] text-ink-muted mt-1">Save the current CV or load a previous version.</p>
            </div>
            <button
              type="button"
              onClick={onClose}
              aria-label="Close"
              className="h-9 w-9 rounded-full grid place-items-center border border-line text-ink hover:bg-surface-2 transition-colors duration-200"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          <SaveCurrentForm defaultName={defaultName} onSave={onSaveCurrent} />

          <div className="mt-6">
            <p className="eyebrow mb-3">Your library ({list.length})</p>
            {list.length === 0 ? (
              <div className="card-surface p-6 text-center">
                <p className="text-[14px] text-ink-muted">No saved CVs yet.</p>
              </div>
            ) : (
              <ul className="space-y-2">
                {list.map((item) => (
                  <li key={item.id} className="card-surface p-4 flex items-start gap-3">
                    <div className="h-10 w-10 shrink-0 rounded-2xl bg-surface-2 border border-line grid place-items-center">
                      <FileText className="h-4 w-4 text-ink-muted" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[14px] font-semibold text-ink truncate">{item.name}</p>
                      <p className="text-[12px] text-ink-muted mt-0.5">
                        {new Date(item.savedAt).toLocaleString(undefined, { dateStyle: "medium", timeStyle: "short" })}
                      </p>
                      <div className="mt-3 flex gap-2">
                        <button
                          type="button"
                          onClick={() => onLoad(item)}
                          className="h-8 px-3 rounded-full bg-brand text-primary-foreground text-[11px] font-bold uppercase tracking-[0.08em] transition-opacity duration-200 hover:opacity-90"
                        >
                          Load
                        </button>
                        <button
                          type="button"
                          onClick={() => onDelete(item.id)}
                          aria-label="Delete"
                          className="h-8 w-8 rounded-full grid place-items-center text-ink-muted hover:text-ink hover:bg-surface-2 transition-colors duration-200"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </aside>
    </>
  );
}

import { useState } from "react";
function SaveCurrentForm({ defaultName, onSave }: { defaultName?: string; onSave: (name: string) => void }) {
  const [name, setName] = useState(defaultName || "");
  return (
    <div className="card-surface p-4">
      <label className="field-label" htmlFor="cv-name">Save current CV</label>
      <input
        id="cv-name"
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="e.g. CV for Linear · Senior PD"
        className="input-base"
      />
      <button
        type="button"
        onClick={() => { onSave(name); setName(""); }}
        className="mt-3 w-full h-11 rounded-full bg-brand text-primary-foreground text-[12px] font-bold uppercase tracking-[0.08em] transition-opacity duration-200 hover:opacity-90"
      >
        Save CV
      </button>
    </div>
  );
}
