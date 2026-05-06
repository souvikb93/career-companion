import { JobStatus, STATUS_LABEL } from "@/lib/jobs-data";
import { cn } from "@/lib/utils";

const STYLES: Record<JobStatus, string> = {
  saved: "bg-transparent text-ink border border-line",
  applied: "bg-status-applied text-primary-foreground",
  assignment: "bg-status-active text-primary-foreground",
  interviewing: "bg-status-active text-primary-foreground",
  assessment: "bg-status-assessment text-primary-foreground",
  offer: "bg-status-offer text-primary-foreground",
  accepted: "bg-status-offer text-primary-foreground",
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
      {STATUS_LABEL[status]}
    </span>
  );
}
