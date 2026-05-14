import { X, FileText, Trash2 } from "lucide-react";
import { SavedCV } from "@/lib/saved-cvs";
import { useT } from "@/lib/i18n";

interface Props<T> {
  open: boolean;
  onClose: () => void;
  title?: string;
  list: SavedCV<T>[];
  onLoad: (item: SavedCV<T>) => void;
  onDelete: (id: string) => void;
  newItemId?: string;
}

export function SavedCVsPanel<T>({ open, onClose, title, list, onLoad, onDelete, newItemId }: Props<T>) {
  const { t } = useT();
  if (!open) return null;
  return (
    <>
      <div className="fixed inset-0 z-40 bg-ink/20 backdrop-blur-sm animate-panel-in" onClick={onClose} />
      <aside className="fixed top-0 right-0 z-50 h-screen w-full max-w-[440px] bg-white/70 backdrop-blur-2xl border-l border-white/50 overflow-y-auto animate-slide-in-right">
        <div className="p-8">
          <div className="flex items-start justify-between gap-4 mb-6">
            <div>
              <h2 className="text-[24px] font-semibold text-ink leading-tight">{title ?? t("common.library")}</h2>
              <p className="text-[13px] text-ink-muted mt-1">{t("common.openPrev")}</p>
            </div>
            <button
              type="button"
              onClick={onClose}
              aria-label={t("common.close")}
              className="h-9 w-9 grid place-items-center rounded-full text-ink-muted hover:text-ink hover:bg-surface-2 transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          <p className="eyebrow mb-3">{t("common.saved", { n: list.length })}</p>
          {list.length === 0 ? (
            <div className={`card-surface p-6 text-center ${newItemId === undefined ? "" : "animate-library-item-in"}`}>
              <p className="text-[14px] text-ink-muted">{t("common.nothingSaved")}</p>
            </div>
          ) : (
            <ul className="space-y-2">
              {list.map((item) => (
                <li
                  key={item.id}
                  className={`card-surface p-4 flex items-start gap-3 ${item.id === newItemId ? "animate-library-item-in" : ""}`}
                >
                  <div className="h-10 w-10 shrink-0 rounded-2xl bg-surface-2 border border-line grid place-items-center">
                    <FileText className="h-4 w-4 text-ink-muted" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[14px] font-semibold text-ink truncate">{item.name}</p>
                    <p className="text-[12px] text-ink-muted mt-0.5">
                      {new Date(item.savedAt).toLocaleString(undefined, { dateStyle: "medium", timeStyle: "short" })}
                    </p>
                    <div className="mt-3 flex gap-2">
                      <button type="button" onClick={() => onLoad(item)} className="btn-tertiary">
                        {t("common.open")}
                      </button>
                      <button
                        type="button"
                        onClick={() => onDelete(item.id)}
                        aria-label={t("common.delete")}
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
      </aside>
    </>
  );
}
