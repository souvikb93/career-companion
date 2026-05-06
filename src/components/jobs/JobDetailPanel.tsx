import { Job, JobStatus, STATUS_ORDER, STATUS_LABEL } from "@/lib/jobs-data";
import { StatusBadge } from "./StatusBadge";
import { X, ExternalLink, FileText, Mail } from "lucide-react";

interface Props {
  job: Job | null;
  onClose: () => void;
  onUpdate: (job: Job) => void;
}

export function JobDetailPanel({ job, onClose, onUpdate }: Props) {
  if (!job) return null;
  return (
    <>
      <div
        className="fixed inset-0 z-40 bg-ink/20 animate-panel-in"
        onClick={onClose}
      />
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
              className="h-9 w-9 rounded-full grid place-items-center border border-line text-ink hover:bg-surface-2 transition-colors duration-180"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          <div className="mb-6">
            <StatusBadge status={job.status} />
          </div>

          {job.link && (
            <a
              href={job.link}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1.5 text-[13px] text-brand font-semibold mb-6 hover:opacity-80 transition-opacity duration-180"
            >
              View original posting <ExternalLink className="h-3.5 w-3.5" />
            </a>
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
              <select
                value={job.status}
                onChange={(e) => onUpdate({ ...job, status: e.target.value as JobStatus })}
                className="input-base appearance-none cursor-pointer"
              >
                {STATUS_ORDER.map((s) => (
                  <option key={s} value={s}>{STATUS_LABEL[s]}</option>
                ))}
              </select>
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
              className="flex-1 h-12 rounded-full border border-ink-2 text-ink text-[12px] font-bold uppercase tracking-[0.08em] transition-colors duration-180 hover:bg-surface-2 inline-flex items-center justify-center gap-2"
            >
              <FileText className="h-4 w-4" /> Custom CV
            </button>
            <button
              type="button"
              className="flex-1 h-12 rounded-full bg-brand text-primary-foreground text-[12px] font-bold uppercase tracking-[0.08em] transition-opacity duration-180 hover:opacity-90 inline-flex items-center justify-center gap-2"
            >
              <Mail className="h-4 w-4" /> Cover Letter
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}
