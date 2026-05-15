import { useState } from "react";
import { Job, JobStatus, STATUS_ORDER, STATUS_DOT_CLASS } from "@/lib/jobs-data";
import { useT } from "@/lib/i18n";
import { useNavigate } from "react-router-dom";
import { useJobs } from "@/lib/jobs-store";
import {
  X, ExternalLink, FileText, Mail, ChevronDown, Trash2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { DeadlinePicker } from "./DeadlinePicker";

interface Props {
  job: Job | null;
  onClose: () => void;
  onUpdate: (job: Job) => void;
  onDelete: (id: string) => void;
}


export function JobDetailPanel({ job, onClose, onUpdate, onDelete }: Props) {
  const navigate = useNavigate();
  const { setTargetJobId } = useJobs();
  const { t } = useT();
  const [confirmDelete, setConfirmDelete] = useState(false);

  if (!job) return null;

  const goTo = (path: "/cv" | "/cover-letter") => {
    setTargetJobId(job.id);
    onClose();
    navigate(path);
  };

  const field = (key: keyof Job, value: string | boolean) =>
    onUpdate({ ...job, [key]: value });

  return (
    <>
      {/* Panel scrim */}
      <div
        className="fixed inset-0 z-40 modal-backdrop animate-panel-in"
        onClick={onClose}
      />

      {/* Panel */}
      <aside className="fixed top-0 right-0 z-50 h-screen w-full max-w-[440px] backdrop-blur-2xl overflow-y-auto overscroll-contain scroll-smooth animate-slide-in-right side-panel">
        <div className="p-5 sm:p-8">

          {/* Header — role + company editable */}
          <div className="flex items-start justify-between gap-4 mb-6">
            <div className="min-w-0 flex-1 space-y-1">
              <input
                value={job.role}
                onChange={(e) => field("role", e.target.value)}
                className="w-full bg-transparent text-[24px] font-semibold text-ink leading-tight placeholder:text-ink/30 focus:outline-none border-b border-transparent focus:border-line transition-colors duration-150"
                placeholder="Job title"
              />
              <input
                value={job.company}
                onChange={(e) => field("company", e.target.value)}
                className="w-full bg-transparent text-[15px] font-medium text-ink-muted placeholder:text-ink/25 focus:outline-none border-b border-transparent focus:border-line transition-colors duration-150"
                placeholder="Company"
              />
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

          {/* All editable fields */}
          <div className="space-y-5">

            {/* Status — Radix Select with frosted glass */}
            <div>
              <label id="label-status" className="field-label">{t("jobDetail.status")}</label>
              <Select
                value={job.status}
                onValueChange={(v) => field("status", v as JobStatus)}
              >
                <SelectTrigger aria-labelledby="label-status" className="focus:ring-0 focus:ring-offset-0 gap-2.5">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent
                  className="z-[55] overflow-hidden rounded-2xl border border-white/60 p-1 bg-white/60 backdrop-blur-xl shadow-lg glass-popover"
                  position="popper"
                  sideOffset={6}
                >
                  {STATUS_ORDER.map((s) => (
                    <SelectItem
                      key={s}
                      value={s}
                      className={cn(
                        "rounded-xl text-[14px] text-ink cursor-pointer py-2.5 pl-9 pr-3",
                        "focus:bg-black/[0.05] focus:text-ink data-[state=checked]:font-medium",
                      )}
                    >
                      <span className="flex items-center gap-2">
                        <span className={cn("h-2 w-2 rounded-full shrink-0", STATUS_DOT_CLASS[s])} />
                        {t(`status.${s}`)}
                      </span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Deadline — date picker popover */}
            <div>
              <label id="label-deadline" className="field-label">{t("jobDetail.deadline")}</label>
              <DeadlinePicker
                value={job.deadline ?? ""}
                onChange={(v) => field("deadline", v)}
                placeholder={t("jobDetail.deadlinePlaceholder")}
                aria-labelledby="label-deadline"
              />

              {/* Notify checkbox */}
              <label className="mt-3 flex items-center gap-2.5 cursor-pointer select-none group">
                <button
                  type="button"
                  role="checkbox"
                  aria-checked={job.notifyDeadline ?? false}
                  onClick={() => field("notifyDeadline", !(job.notifyDeadline ?? false))}
                  className={cn(
                    "shrink-0 h-4 w-4 rounded border-2 transition-colors grid place-items-center",
                    (job.notifyDeadline ?? false)
                      ? "bg-brand border-brand"
                      : "bg-transparent border-line group-hover:border-ink-muted"
                  )}
                >
                  {(job.notifyDeadline ?? false) && (
                    <svg className="h-2.5 w-2.5 text-white" viewBox="0 0 12 12" fill="none">
                      <path d="M2 6l3 3 5-5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  )}
                </button>
                <span className="text-[13px] text-ink-muted group-hover:text-ink transition-colors duration-150">
                  {t("jobDetail.notifyDeadline")}
                </span>
              </label>
            </div>

            {/* Location */}
            <div>
              <label htmlFor="field-location" className="field-label">{t("jobDetail.location")}</label>
              <input
                id="field-location"
                value={job.location ?? ""}
                onChange={(e) => field("location", e.target.value)}
                placeholder="e.g. Berlin, Germany"
                className="input-base"
              />
            </div>

            {/* Job URL */}
            <div>
              <label htmlFor="field-link" className="field-label">{t("jobDetail.jobUrl")}</label>
              <div className="relative">
                <input
                  id="field-link"
                  value={job.link ?? ""}
                  onChange={(e) => field("link", e.target.value)}
                  placeholder="https://..."
                  className="input-base pr-10"
                  type="url"
                />
                {job.link && (
                  <a
                    href={job.link}
                    target="_blank"
                    rel="noreferrer"
                    aria-label={t("jobDetail.viewOriginal")}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-brand hover:opacity-70 transition-opacity duration-150"
                  >
                    <ExternalLink className="h-4 w-4" />
                  </a>
                )}
              </div>
            </div>

            {/* Description */}
            <div>
              <label htmlFor="field-description" className="field-label">{t("jobDetail.description")}</label>
              <textarea
                id="field-description"
                value={job.description ?? ""}
                onChange={(e) => field("description", e.target.value)}
                rows={6}
                placeholder="Paste the job description here…"
                className="textarea-base"
              />
            </div>

            {/* Salary */}
            <div>
              <label htmlFor="field-salary" className="field-label">{t("jobDetail.salary")}</label>
              <input
                id="field-salary"
                value={job.salary ?? ""}
                onChange={(e) => field("salary", e.target.value)}
                placeholder={t("jobDetail.salaryPlaceholder")}
                className="input-base"
              />
            </div>

            {/* Notes */}
            <div>
              <label htmlFor="field-notes" className="field-label">{t("jobDetail.notes")}</label>
              <textarea
                id="field-notes"
                value={job.notes ?? ""}
                onChange={(e) => field("notes", e.target.value)}
                rows={4}
                placeholder={t("jobDetail.notesPlaceholder")}
                className="textarea-base"
              />
            </div>
          </div>

          {/* Primary CTAs */}
          <div className="mt-8 flex gap-3">
            <button type="button" onClick={() => goTo("/cv")} className="btn-ghost flex-1 justify-center">
              <FileText className="h-4 w-4" /> {t("jobDetail.customCv")}
            </button>
            <button type="button" onClick={() => goTo("/cover-letter")} className="btn-primary flex-1 justify-center">
              <Mail className="h-4 w-4" /> {t("jobDetail.coverLetter")}
            </button>
          </div>

          {/* Delete trigger */}
          <div className="mt-6 pt-5 border-t border-line">
            <button
              type="button"
              onClick={() => setConfirmDelete(true)}
              className="btn-danger-tertiary"
            >
              <Trash2 className="h-4 w-4" />
              Delete job
            </button>
          </div>

        </div>
      </aside>

      {/* Delete confirmation modal — sibling to panel, stacks above at z-[60] */}
      {confirmDelete && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center px-4">
          <div className="absolute inset-0 modal-backdrop" onClick={() => setConfirmDelete(false)} />
          <div className="relative glass-modal w-full max-w-[360px] p-6 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex flex-col items-center text-center gap-4">
              <div className="h-12 w-12 rounded-full bg-red-50 grid place-items-center">
                <Trash2 className="h-5 w-5 text-red-500" />
              </div>
              <div>
                <p className="modal-heading">Delete job?</p>
                <p className="modal-body">
                  <span className="font-medium text-ink">{job.role}</span>
                  {job.company ? ` at ${job.company}` : ""} will be permanently removed.
                </p>
              </div>
              <div className="flex gap-3 w-full pt-1">
                <button type="button" onClick={() => setConfirmDelete(false)} className="btn-ghost flex-1 justify-center">
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => onDelete(job.id)}
                  className="btn-danger-primary flex-1 justify-center"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
