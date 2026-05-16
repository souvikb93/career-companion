import { useState, useEffect } from "react";
import { X, ExternalLink, Lightbulb, ChevronDown } from "lucide-react";
import { useT } from "@/lib/i18n";
import { exportAs, ExportFormat } from "@/lib/exporters";
import { cn } from "@/lib/utils";

interface Props {
  open: boolean;
  onClose: () => void;
  title: string;
  defaultName: string;
  documentType: "resume" | "letter";
  onExport: (format: ExportFormat, filename: string) => { title: string; body: string };
}

const EXPORT_FORMATS: { value: ExportFormat; label: string }[] = [
  { value: "pdf", label: "PDF (.pdf)" },
  { value: "docx", label: "Word (.docx)" },
  { value: "jpg", label: "JPEG (.jpg)" },
];

function sanitizeFilename(name: string): string {
  return (
    name
      .replace(/[<>:"/\\|?*]/g, "")
      .replace(/\s+/g, " ")
      .trim() || "Resume"
  );
}

export function DownloadModal({
  open,
  onClose,
  title,
  defaultName,
  documentType,
  onExport,
}: Props) {
  const { t } = useT();
  const [filename, setFilename] = useState(defaultName);
  const [format, setFormat] = useState<ExportFormat>(() => {
    const saved = sessionStorage.getItem("tracka_last_export_format");
    return (saved as ExportFormat) || "pdf";
  });
  const [isExporting, setIsExporting] = useState(false);
  // Tip: visible for first 2 opens, then hidden permanently (localStorage)
  const [showTip, setShowTip] = useState(false);
  const [shineIcon, setShineIcon] = useState(false);

  useEffect(() => {
    setFilename(defaultName);
  }, [defaultName]);

  useEffect(() => {
    sessionStorage.setItem("tracka_last_export_format", format);
  }, [format]);

  useEffect(() => {
    if (!open) return;
    const count = parseInt(localStorage.getItem("tracka_download_tip_opens") || "0", 10);
    const visible = count < 2;
    setShowTip(visible);
    setShineIcon(visible && count === 0);
    if (visible) {
      localStorage.setItem("tracka_download_tip_opens", String(count + 1));
    }
  }, [open]);

  const handleExport = async () => {
    const cleanFilename = sanitizeFilename(filename);
    setIsExporting(true);
    try {
      const { title: docTitle, body } = onExport(format, cleanFilename);
      await exportAs(format, docTitle, body, cleanFilename);
      onClose();
    } catch (error) {
      console.error("Export failed:", error);
    } finally {
      setIsExporting(false);
    }
  };

  if (!open) return null;

  const placeholder =
    documentType === "resume"
      ? t("resume.defaultSaveName")
      : t("letter.defaultSaveName");

  const tipExample =
    documentType === "resume"
      ? t("resume.downloadExample")
      : t("letter.downloadExample");

  return (
    <>
      <div className="fixed inset-0 z-50 modal-backdrop animate-panel-in" onClick={onClose} />
      <div className="fixed inset-0 z-50 grid place-items-center p-4 pointer-events-none">
        <div className="relative pointer-events-auto w-full max-w-md glass-modal p-6 animate-modal-in">

          {/* Close */}
          <button
            type="button"
            onClick={onClose}
            disabled={isExporting}
            aria-label={t("common.close")}
            className="absolute top-4 right-4 h-9 w-9 grid place-items-center rounded-full text-ink-muted hover:text-ink hover:bg-surface-2 transition-colors disabled:opacity-50"
          >
            <X className="h-4 w-4" />
          </button>

          {/* Title */}
          <h3 className="text-[20px] font-semibold text-ink mb-5 pr-10">{title}</h3>

          {/* Filename */}
          <div className="mb-5">
            <label className="field-label" htmlFor="download-filename">
              {t("common.filename")}
            </label>
            <input
              id="download-filename"
              type="text"
              value={filename}
              onChange={(e) => setFilename(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !isExporting) handleExport();
              }}
              placeholder={placeholder}
              disabled={isExporting}
              className="input-base"
              autoFocus
            />

            {/* Recruiter-friendly tip — visible for first 2 opens only */}
            {showTip && (
              <div className="mt-2.5 rounded-xl bg-surface-2/50 border border-line/50 px-3.5 py-3">
                <div className="flex items-start gap-2">
                  <Lightbulb
                    className={cn(
                      "h-3.5 w-3.5 shrink-0 mt-[1px] text-ink dark:text-yellow-400",
                      shineIcon && "animate-tip-icon-shine"
                    )}
                  />
                  <div className="min-w-0">
                    <p className="text-[11.5px] text-ink-muted leading-snug">
                      {t("common.downloadTip")}
                    </p>
                    <p className="text-[11px] font-mono text-ink-muted/70 truncate mt-1">
                      {tipExample}
                    </p>
                    <a
                      href="https://www.indeed.com/career-advice/resumes-cover-letters/name-resume-and-cover-letter-files"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-[11px] text-brand hover:underline underline-offset-2 mt-1"
                    >
                      {t("common.downloadLearnMore")}
                      <ExternalLink className="h-2.5 w-2.5 shrink-0" />
                    </a>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Format — custom chevron for consistent alignment */}
          <div className="mb-6">
            <label className="field-label" htmlFor="download-format">
              {t("common.format")}
            </label>
            <div className="relative">
              <select
                id="download-format"
                value={format}
                onChange={(e) => setFormat(e.target.value as ExportFormat)}
                disabled={isExporting}
                className="input-base appearance-none pr-10 cursor-pointer"
              >
                {EXPORT_FORMATS.map((f) => (
                  <option key={f.value} value={f.value}>
                    {f.label}
                  </option>
                ))}
              </select>
              <ChevronDown className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-ink-muted" />
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3">
            <button
              type="button"
              onClick={onClose}
              disabled={isExporting}
              className="btn-ghost flex-1 justify-center disabled:opacity-50"
            >
              {t("common.cancel")}
            </button>
            <button
              type="button"
              onClick={handleExport}
              disabled={isExporting}
              className="btn-primary flex-1 justify-center disabled:opacity-60 flex items-center justify-center gap-2"
            >
              {isExporting ? (
                <>
                  <span className="h-4 w-4 rounded-full border-2 border-white border-t-transparent animate-spin" />
                  {t("common.exporting")}
                </>
              ) : (
                t("common.download")
              )}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
