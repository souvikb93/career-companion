import { JobStatus } from "@/lib/jobs-data";
import { useT } from "@/lib/i18n";
import { cn } from "@/lib/utils";

const STYLES: Record<JobStatus, string> = {
  saved: "bg-transparent text-ink border border-line",
  applied: "bg-status-applied text-primary-foreground",
  assignment: "bg-amber-400 text-white",
  interviewing: "bg-amber-600 text-white",
  offer: "bg-status-offer text-primary-foreground",
  rejected: "bg-ink-muted text-primary-foreground",
};

export function StatusBadge({ status, className }: { status: JobStatus; className?: string }) {
  const { t } = useT();
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-3 py-1.5 text-[11px] font-bold uppercase tracking-[0.08em] whitespace-nowrap",
        STYLES[status],
        className,
      )}
    >
      {t(`status.${status}`)}
    </span>
  );
}
