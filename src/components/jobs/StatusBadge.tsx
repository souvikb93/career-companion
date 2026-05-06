import { JobStatus } from "@/lib/jobs-data";
import { cn } from "@/lib/utils";

const STYLES: Record<JobStatus, string> = {
  applied: "bg-ink-2 text-primary-foreground",
  interviewing: "bg-brand text-primary-foreground",
  offer: "bg-success text-primary-foreground",
  rejected: "bg-chip-grey text-chip-grey-fg",
  saved: "bg-transparent text-ink border border-line",
};

const LABEL: Record<JobStatus, string> = {
  applied: "Applied",
  interviewing: "Interviewing",
  offer: "Offer",
  rejected: "Rejected",
  saved: "Saved",
};

export function StatusBadge({ status, className }: { status: JobStatus; className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-3 py-1.5 text-[11px] font-bold uppercase tracking-[0.08em] whitespace-nowrap",
        STYLES[status],
        className,
      )}
    >
      {LABEL[status]}
    </span>
  );
}
