import { Job, JobStatus, STATUS_ORDER } from "@/lib/jobs-data";
import { useJobs } from "@/lib/jobs-store";
import { useT } from "@/lib/i18n";
import { useNavigate } from "react-router-dom";
import { X, ExternalLink, FileText, Mail, ChevronDown, MapPin, Calendar, DollarSign } from "lucide-react";
import { cn } from "@/lib/utils";
import { STATUS_DOT_CLASS } from "@/lib/jobs-data";

interface Props {
  job: Job | null;
  onClose: () => void;
  onUpdate: (job: Job) => void;
}

function formatDate(iso: string, locale: string) {
  const [year, month, day] = iso.split("-").map(Number);
  const d = year && month && day ? new Date(year, month - 1, day) : new Date(iso);
  return d.toLocaleDateString(locale, { month: "long", day: "numeric", year: "numeric" });
}

export function JobDetailPanel({ job, onClose, onUpdate }: Props) {
  const navigate = useNavigate();
  const { setTargetJobId } = useJobs();
  const { t, lang } = useT();
  const dateLocale = lang === "de" ? "de-DE" : "en-US";

  if (!job) return null;

  const goTo = (path: "/cv" | "/cover-letter") => {
    setTargetJobId(job.id);
    onClose();
    navigate(path);
  };

  return (
    <>
      <div className="fixed inset-0 z-40 bg-ink/20 backdrop-blur-sm animate-panel-in" onClick={onClose} />
      <aside className="fixed top-0 right-0 z-50 h-screen w-full max-w-[440px] bg-white/70 backdrop-blur-2xl border-l border-white/50 overflow-y-auto animate-slide-in-right">
        <div className="p-8">
          {/* Header */}
          <div className="flex items-start justify-between gap-4 mb-6">
            <div className="min-w-0 flex-1">
              <h2 className="text-[26px] font-semibold text-ink leading-tight truncate">{job.role}</h2>
              <p className="text-[16px] text-ink-muted mt-1 font-medium">{job.company}</p>
            </div>
            <button
              type="button"
              onClick={onClose}
              aria-label={t("common.close")}
              className="shrink-0 h-9 w-9 rounded-full grid place-items-center text-ink-muted hover:text-ink hover:bg-surface-2 transition-colors duration-200"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          {/* Meta chips row */}
          <div className="flex flex-wrap gap-2 mb-6">
            <span className={cn(
              "inline-flex items-center gap-1.5 h-7 px-3 rounded-full text-[12px] font-medium border",
              "bg-white/60 border-white/60 text-ink"
            )}>
              <span className={cn("h-1.5 w-1.5 rounded-full shrink-0", STATUS_DOT_CLASS[job.status])} />
              {t(`status.${job.status}`)}
            </span>

            {job.location && (
              <span className="inline-flex items-center gap-1.5 h-7 px-3 rounded-full text-[12px] text-ink-muted bg-white/60 border border-white/60">
                <MapPin className="h-3 w-3 shrink-0" />
                {job.location}
              </span>
            )}

            <span className="inline-flex items-center gap-1.5 h-7 px-3 rounded-full text-[12px] text-ink-muted bg-white/60 border border-white/60">
              <Calendar className="h-3 w-3 shrink-0" />
              {formatDate(job.dateAdded, dateLocale)}
            </span>

            {job.salary && (
              <span className="inline-flex items-center gap-1.5 h-7 px-3 rounded-full text-[12px] text-ink-muted bg-white/60 border border-white/60">
                <DollarSign className="h-3 w-3 shrink-0" />
                {job.salary}
              </span>
            )}
          </div>

          {/* Job URL */}
          {job.link && (
            <a
              href={job.link}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1.5 text-[13px] text-brand font-semibold mb-6 hover:opacity-80 transition-opacity duration-200"
            >
              {t("jobDetail.viewOriginal")} <ExternalLink className="h-3.5 w-3.5" />
            </a>
          )}

          {/* Description */}
          {job.description && (
            <div className="glass-card p-5 mb-5">
              <p className="eyebrow mb-3">{t("jobDetail.description")}</p>
              <p className="text-[14px] text-ink-muted leading-relaxed whitespace-pre-line">
                {job.description}
              </p>
            </div>
          )}

          {/* Editable fields */}
          <div className="space-y-5">
            <div>
              <label className="field-label">{t("jobDetail.status")}</label>
              <div className="relative">
                <select
                  value={job.status}
                  onChange={(e) => onUpdate({ ...job, status: e.target.value as JobStatus })}
                  className="input-base appearance-none cursor-pointer pr-10"
                >
                  {STATUS_ORDER.map((s) => (
                    <option key={s} value={s}>{t(`status.${s}`)}</option>
                  ))}
                </select>
                <ChevronDown className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-ink-muted" />
              </div>
            </div>

            <div>
              <label className="field-label">{t("jobDetail.salary")}</label>
              <input
                value={job.salary ?? ""}
                onChange={(e) => onUpdate({ ...job, salary: e.target.value })}
                placeholder={t("jobDetail.salaryPlaceholder")}
                className="input-base"
              />
            </div>

            <div>
              <label className="field-label">{t("jobDetail.notes")}</label>
              <textarea
                value={job.notes ?? ""}
                onChange={(e) => onUpdate({ ...job, notes: e.target.value })}
                rows={5}
                placeholder={t("jobDetail.notesPlaceholder")}
                className="textarea-base"
              />
            </div>
          </div>

          {/* Action buttons */}
          <div className="mt-8 flex gap-3">
            <button
              type="button"
              onClick={() => goTo("/cv")}
              className="flex-1 h-12 rounded-full bg-surface-2 border border-line text-ink text-[12px] font-bold uppercase tracking-[0.08em] transition-colors duration-200 ease-out hover:bg-surface-hover inline-flex items-center justify-center gap-2"
            >
              <FileText className="h-4 w-4" /> {t("jobDetail.customCv")}
            </button>
            <button
              type="button"
              onClick={() => goTo("/cover-letter")}
              className="flex-1 h-12 rounded-full bg-ink text-white text-[12px] font-bold uppercase tracking-[0.08em] transition-colors duration-200 ease-out hover:bg-brand active:bg-brand inline-flex items-center justify-center gap-2"
            >
              <Mail className="h-4 w-4" /> {t("jobDetail.coverLetter")}
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}
