import { useState } from "react";
import { X } from "lucide-react";
import { useT } from "@/lib/i18n";

interface Props {
  open: boolean;
  onClose: () => void;
  title?: string;
  defaultName?: string;
  onSave: (name: string) => void;
}

export function SaveModal({ open, onClose, title, defaultName = "", onSave }: Props) {
  const { t } = useT();
  const [name, setName] = useState(defaultName);

  if (!open) return null;
  return (
    <>
      <div className="fixed inset-0 z-50 bg-ink/30 backdrop-blur-sm animate-panel-in" onClick={onClose} />
      <div className="fixed inset-0 z-50 grid place-items-center p-4 pointer-events-none">
        <div className="relative pointer-events-auto w-full max-w-md glass-modal p-6">
          <button
            type="button"
            onClick={onClose}
            aria-label={t("common.close")}
            className="absolute top-4 right-4 h-9 w-9 grid place-items-center rounded-full text-ink-muted hover:text-ink hover:bg-surface-2 transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
          <h3 className="text-[20px] font-semibold text-ink mb-5 pr-10">{title ?? t("common.save")}</h3>

          <label className="field-label" htmlFor="save-name">{t("common.filename")}</label>
          <input
            id="save-name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                onSave(name.trim() || t("common.untitled"));
                onClose();
              }
            }}
            className="input-base mb-6"
            autoFocus
          />

          <div className="flex gap-3">
            <button type="button" onClick={onClose} className="btn-ghost flex-1 justify-center">
              {t("common.cancel")}
            </button>
            <button
              type="button"
              onClick={() => { onSave(name.trim() || t("common.untitled")); onClose(); }}
              className="btn-primary flex-1 justify-center"
            >
              {t("common.save")}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
