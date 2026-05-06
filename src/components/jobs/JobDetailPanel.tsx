import { Job, JobStatus, STATUS_ORDER, STATUS_LABEL } from "@/lib/jobs-data";
import { useJobs } from "@/lib/jobs-store";
import { useNavigate } from "react-router-dom";
import { X, ExternalLink, FileText, Mail, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

import { STATUS_DOT_CLASS } from "@/lib/jobs-data";

interface Props {
  job: Job | null;
  onClose: () => void;
  onUpdate: (job: Job) => void;
}

export function JobDetailPanel({ job, onClose, onUpdate }: Props) {
  const navigate = useNavigate();
  const { setTargetJobId } = useJobs();
  if (!job) return null;

  const goTo = (path: "/cv" | "/cover-letter") => {
    setTargetJobId(job.id);
    onClose();
    navigate(path);
  };

  return (
    <>
      <div className="fixed inset-0 z-40 bg-ink/20 animate-panel-in" onClick={onClose} />
      <aside className="fixed top-0 right-0 z-50 h-screen w-full max-w-[440px] bg-popover border-l border-line overflow-y-auto animate-slide-in-right">
        <div className="p-8">
          <div className="flex items-start justify-between gap-4 mb-6">
            <div>
              <h2 className="text-[28px] font-semibold text-ink leading-tight">{job.role}</h2>
              <p className="text-[16px] text-ink-muted mt-1">{job.company} · {job.location}</p>
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

          <div className="mb-6 inline-flex items-center gap-2 text-[13px] text-ink">
            <span className={cn("h-2 w-2 rounded-full", STATUS_DOT_CLASS[job.status])} />
            {STATUS_LABEL[job.status]}
          </div>

          {job.link && (
            <div>
              <a
                href={job.link}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 text-[13px] text-brand font-semibold mb-6 hover:opacity-80 transition-opacity duration-200"
              >
                View original posting <ExternalLink className="h-3.5 w-3.5" />
              </a>
            </div>
          )}

          <div className="card-surface p-5 mb-5">
            <p className="eyebrow mb-3">Description</p>
            <p className="text-[14px] text-ink-muted leading-relaxed whitespace-pre-line">
              {job.description}
            </p>
          </div>

          <div className="space-y-5">
            <div>
              <label className="field-label">Status</label>
              <div className="relative">
                <select
                  value={job.status}
                  onChange={(e) => onUpdate({ ...job, status: e.target.value as JobStatus })}
                  className="input-base appearance-none cursor-pointer pr-10"
                >
                  {STATUS_ORDER.map((s) => (
                    <option key={s} value={s}>{STATUS_LABEL[s]}</option>
                  ))}
                </select>
                <ChevronDown className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-ink-muted" />
              </div>
            </div>

            <div>
              <label className="field-label">Salary</label>
              <input
                value={job.salary ?? ""}
                onChange={(e) => onUpdate({ ...job, salary: e.target.value })}
                placeholder="e.g. €80k – €100k"
                className="input-base"
              />
            </div>

            <div>
              <label className="field-label">Notes</label>
              <textarea
                value={job.notes ?? ""}
                onChange={(e) => onUpdate({ ...job, notes: e.target.value })}
                rows={5}
                placeholder="Add notes about this role..."
                className="textarea-base"
              />
            </div>
          </div>

          <div className="mt-8 flex gap-3">
            <button
              type="button"
              onClick={() => goTo("/cv")}
              className="flex-1 h-12 rounded-full border border-ink-2 text-ink text-[12px] font-bold uppercase tracking-[0.08em] transition-colors duration-200 hover:bg-surface-2 inline-flex items-center justify-center gap-2"
            >
              <FileText className="h-4 w-4" /> Custom CV
            </button>
            <button
              type="button"
              onClick={() => goTo("/cover-letter")}
              className="flex-1 h-12 rounded-full bg-brand text-primary-foreground text-[12px] font-bold uppercase tracking-[0.08em] transition-opacity duration-200 hover:opacity-90 inline-flex items-center justify-center gap-2"
            >
              <Mail className="h-4 w-4" /> Cover Letter
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}
