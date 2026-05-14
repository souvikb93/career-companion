import { useState } from "react";
import { format } from "date-fns";
import { Job, JobStatus, STATUS_ORDER, STATUS_DOT_CLASS } from "@/lib/jobs-data";
import { useT } from "@/lib/i18n";
import { useNavigate } from "react-router-dom";
import { useJobs } from "@/lib/jobs-store";
import {
  X, ExternalLink, FileText, Mail, ChevronDown, Trash2, CalendarDays,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";

interface Props {
  job: Job | null;
  onClose: () => void;
  onUpdate: (job: Job) => void;
  onDelete: (id: string) => void;
}

function parseLocalDate(iso: string): Date {
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(y, m - 1, d);
}

export function JobDetailPanel({ job, onClose, onUpdate, onDelete }: Props) {
  const navigate = useNavigate();
  const { setTargetJobId } = useJobs();
  const { t } = useT();
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [calendarOpen, setCalendarOpen] = useState(false);

  if (!job) return null;

  const goTo = (path: "/cv" | "/cover-letter") => {
    setTargetJobId(job.id);
    onClose();
    navigate(path);
  };

  const field = (key: keyof Job, value: string | boolean) =>
    onUpdate({ ...job, [key]: value });

  const selectedDate = job.deadline ? parseLocalDate(job.deadline) : undefined;
  const deadlineLabel = selectedDate
    ? format(selectedDate, "d MMM yyyy")
    : t("jobDetail.deadlinePlaceholder");

  return (
    <>
      {/* Panel scrim */}
      <div
        className="fixed inset-0 z-40 bg-ink/20 backdrop-blur-sm animate-panel-in"
        onClick={onClose}
      />

      {/* Panel */}
      <aside className="fixed top-0 right-0 z-50 h-screen w-full max-w-[440px] bg-white/70 backdrop-blur-2xl border-l border-white/50 overflow-y-auto animate-slide-in-right">
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
              <label className="field-label">{t("jobDetail.status")}</label>
              <Select
                value={job.status}
                onValueChange={(v) => field("status", v as JobStatus)}
              >
                <SelectTrigger
                  className={cn(
                    "w-full bg-transparent border border-line rounded-2xl h-11 px-4 text-[14px] text-ink",
                    "flex items-center gap-2.5 outline-none cursor-pointer",
                    "transition-[border-color,background-color] duration-200 ease-out",
                    "hover:bg-surface-hover focus:border-brand focus:ring-0 focus:ring-offset-0",
                  )}
                >
                  <SelectValue />
                </SelectTrigger>
                <SelectContent
                  className="z-[55] overflow-hidden rounded-2xl border border-white/60 p-1 bg-white/60 backdrop-blur-xl shadow-lg"
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
              <label className="field-label">{t("jobDetail.deadline")}</label>
              <Popover open={calendarOpen} onOpenChange={setCalendarOpen}>
                <PopoverTrigger asChild>
                  <button
                    type="button"
                    className={cn(
                      "w-full bg-transparent border border-line rounded-2xl h-11 px-4 text-[14px]",
                      "flex items-center justify-between gap-2 cursor-pointer",
                      "transition-[border-color,background-color] duration-200 ease-out outline-none",
                      "hover:bg-surface-hover focus:border-brand",
                      selectedDate ? "text-ink" : "text-ink-muted/60",
                    )}
                  >
                    <span>{deadlineLabel}</span>
                    <CalendarDays className="h-4 w-4 text-ink-muted shrink-0" />
                  </button>
                </PopoverTrigger>
                <PopoverContent
                  align="end"
                  sideOffset={8}
                  className="z-[55] w-auto p-0 border border-white/60 bg-white/70 backdrop-blur-2xl rounded-2xl shadow-lg"
                >
                  <Calendar
                    mode="single"
                    selected={selectedDate}
                    onSelect={(date) => {
                      field("deadline", date ? format(date, "yyyy-MM-dd") : "");
                      setCalendarOpen(false);
                    }}
                    initialFocus
                    classNames={{
                      months: "p-3",
                      caption_label: "text-[14px] font-semibold text-ink",
                      nav_button: cn(
                        "h-7 w-7 bg-transparent p-0 rounded-full border-0",
                        "hover:bg-black/[0.06] opacity-70 hover:opacity-100 transition-opacity",
                      ),
                      head_cell: "text-ink-muted w-9 font-medium text-[11px] uppercase tracking-wide",
                      cell: "h-9 w-9 text-center text-sm p-0 relative",
                      day: cn(
                        "h-9 w-9 p-0 text-[13px] font-normal rounded-full",
                        "hover:bg-black/[0.06] aria-selected:opacity-100 transition-colors",
                      ),
                      day_selected: "!bg-brand !text-white hover:!bg-brand hover:!text-white focus:!bg-brand focus:!text-white",
                      day_today: "ring-1 ring-brand/60 text-brand font-semibold",
                      day_outside: "text-ink-muted opacity-40",
                      day_disabled: "text-ink-muted opacity-30",
                    }}
                  />
                </PopoverContent>
              </Popover>

              {/* Notify checkbox */}
              <label className="mt-3 flex items-center gap-2.5 cursor-pointer select-none group">
                <input
                  type="checkbox"
                  checked={job.notifyDeadline ?? false}
                  onChange={(e) => field("notifyDeadline", e.target.checked)}
                  className="h-4 w-4 rounded border-line accent-brand cursor-pointer"
                />
                <span className="text-[13px] text-ink-muted group-hover:text-ink transition-colors duration-150">
                  {t("jobDetail.notifyDeadline")}
                </span>
              </label>
            </div>

            {/* Location */}
            <div>
              <label className="field-label">{t("jobDetail.location")}</label>
              <input
                value={job.location ?? ""}
                onChange={(e) => field("location", e.target.value)}
                placeholder="e.g. Berlin, Germany"
                className="input-base"
              />
            </div>

            {/* Job URL */}
            <div>
              <label className="field-label">{t("jobDetail.jobUrl")}</label>
              <div className="relative">
                <input
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
              <label className="field-label">{t("jobDetail.description")}</label>
              <textarea
                value={job.description ?? ""}
                onChange={(e) => field("description", e.target.value)}
                rows={6}
                placeholder="Paste the job description here…"
                className="textarea-base"
              />
            </div>

            {/* Salary */}
            <div>
              <label className="field-label">{t("jobDetail.salary")}</label>
              <input
                value={job.salary ?? ""}
                onChange={(e) => field("salary", e.target.value)}
                placeholder={t("jobDetail.salaryPlaceholder")}
                className="input-base"
              />
            </div>

            {/* Notes */}
            <div>
              <label className="field-label">{t("jobDetail.notes")}</label>
              <textarea
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

          {/* Delete trigger */}
          <div className="mt-6 pt-5 border-t border-line">
            <button
              type="button"
              onClick={() => setConfirmDelete(true)}
              className="inline-flex items-center gap-2 text-[13px] font-medium text-red-500 hover:text-red-600 transition-colors duration-150 cursor-pointer"
            >
              <Trash2 className="h-4 w-4" />
              Delete job
            </button>
          </div>

        </div>
      </aside>

      {/* Delete confirmation modal — sibling to panel, stacks above at z-[60] */}
      {confirmDelete && (
        <div className="fixed inset-0 z-[60] grid place-items-center px-4 bg-ink/30 backdrop-blur-sm">
          <div className="glass-modal w-full max-w-[360px] p-6 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex flex-col items-center text-center gap-4">
              <div className="h-12 w-12 rounded-full bg-red-50 grid place-items-center">
                <Trash2 className="h-5 w-5 text-red-500" />
              </div>
              <div>
                <p className="text-[17px] font-semibold text-ink mb-1">Delete job?</p>
                <p className="text-[14px] text-ink-muted leading-relaxed">
                  <span className="font-medium text-ink">{job.role}</span>
                  {job.company ? ` at ${job.company}` : ""} will be permanently removed.
                </p>
              </div>
              <div className="flex gap-3 w-full pt-1">
                <button
                  type="button"
                  onClick={() => setConfirmDelete(false)}
                  className="flex-1 h-11 rounded-full bg-surface-2 border border-line text-ink text-[13px] font-semibold hover:bg-surface-hover transition-colors duration-150 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => onDelete(job.id)}
                  className="flex-1 h-11 rounded-full bg-red-500 text-white text-[13px] font-semibold hover:bg-red-600 transition-colors duration-150 cursor-pointer"
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
