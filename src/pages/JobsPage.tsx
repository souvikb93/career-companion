import { useMemo, useState } from "react";
import { Search, Plus, ChevronRight } from "lucide-react";
import { Job, JobStatus, SAMPLE_JOBS, STATUS_ORDER, STATUS_LABEL } from "@/lib/jobs-data";
import { JobDetailPanel } from "@/components/jobs/JobDetailPanel";
import { AddJobModal } from "@/components/jobs/AddJobModal";
import { cn } from "@/lib/utils";

const STATUS_DOT: Record<JobStatus, string> = {
  saved: "bg-ink-muted",
  applied: "bg-ink-2",
  interviewing: "bg-brand",
  offer: "bg-success",
  rejected: "bg-chip-grey-fg",
};

function StatusDot({ status }: { status: JobStatus }) {
  return (
    <span className="inline-flex items-center gap-2 text-[13px] text-ink whitespace-nowrap">
      <span className={cn("h-2 w-2 rounded-full shrink-0", STATUS_DOT[status])} />
      {STATUS_LABEL[status]}
    </span>
  );
}

function formatDate(iso: string) {
  const d = new Date(iso);
  return d.toLocaleDateString(undefined, { month: "short", day: "numeric" });
}

type Filter = "all" | JobStatus;

export default function JobsPage() {
  const [jobs, setJobs] = useState<Job[]>(SAMPLE_JOBS);
  const [filter, setFilter] = useState<Filter>("all");
  const [query, setQuery] = useState("");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [addOpen, setAddOpen] = useState(false);

  const counts = useMemo(() => {
    const c: Record<Filter, number> = {
      all: jobs.length,
      saved: 0, applied: 0, interviewing: 0, offer: 0, rejected: 0,
    };
    jobs.forEach((j) => { c[j.status]++; });
    return c;
  }, [jobs]);

  const filtered = useMemo(() => {
    return jobs.filter((j) => {
      if (filter !== "all" && j.status !== filter) return false;
      if (!query.trim()) return true;
      const q = query.toLowerCase();
      return j.company.toLowerCase().includes(q) || j.role.toLowerCase().includes(q);
    });
  }, [jobs, filter, query]);

  const selected = jobs.find((j) => j.id === selectedId) ?? null;
  const filters: Filter[] = ["all", ...STATUS_ORDER];
  const titleMap: Record<Filter, string> = {
    all: "All jobs",
    saved: "Saved", applied: "Applied", interviewing: "Interviewing", offer: "Offer", rejected: "Rejected",
  };

  return (
    <div className="w-full" style={{ minHeight: "calc(100vh - 64px)" }}>
      <main className="w-full min-w-0 p-8">
        <div className="flex flex-wrap items-end justify-between gap-4 mb-6">
          <div>
            <h1 className="text-[32px] font-semibold text-ink leading-tight">{titleMap[filter]}</h1>
            <p className="text-[14px] text-ink-muted mt-1">{filtered.length} jobs</p>
          </div>
          <div className="flex items-center gap-3 w-full sm:w-auto">
            <div className="relative flex-1 sm:w-[320px]">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-ink-muted" />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search by company or role"
                className="input-base pl-10"
              />
            </div>
            <button
              type="button"
              onClick={() => setAddOpen(true)}
              className="hidden sm:inline-flex h-12 px-5 rounded-full bg-brand text-primary-foreground text-[12px] font-bold uppercase tracking-[0.08em] items-center justify-center gap-2 transition-opacity duration-180 hover:opacity-90 whitespace-nowrap"
            >
              <Plus className="h-4 w-4" /> Add Job
            </button>
          </div>
        </div>

        {/* Horizontal filter tabs */}
        <div className="flex flex-wrap items-center gap-2 mb-6 border-b border-line pb-3">
          {filters.map((f) => {
            const active = filter === f;
            return (
              <button
                key={f}
                type="button"
                onClick={() => setFilter(f)}
                className={cn(
                  "h-10 px-4 rounded-full border text-[13px] font-medium inline-flex items-center gap-2 transition-colors duration-180",
                  active
                    ? "border-brand text-brand bg-transparent"
                    : "border-line text-ink hover:bg-surface-hover",
                )}
              >
                <span>{f === "all" ? "All" : STATUS_LABEL[f]}</span>
                <span className={cn("text-[12px]", active ? "text-brand" : "text-ink-muted")}>
                  {counts[f]}
                </span>
              </button>
            );
          })}
        </div>

        <div className="card-surface overflow-hidden">
          <div className="hidden lg:grid grid-cols-[1.6fr_1.5fr_1.2fr_1fr_1fr_1.4fr_0.9fr] gap-4 px-5 py-3 bg-surface border-b border-line">
            {["Company", "Role", "Location", "Salary", "Status", "Description", "Notes"].map((h) => (
              <p key={h} className="eyebrow">{h}</p>
            ))}
          </div>

          {filtered.length === 0 ? (
            <EmptyState onAdd={() => setAddOpen(true)} />
          ) : (
            <ul className="divide-y divide-line">
              {filtered.map((job) => (
                <li
                  key={job.id}
                  onClick={() => setSelectedId(job.id)}
                  className="grid grid-cols-1 lg:grid-cols-[1.6fr_1.5fr_1.2fr_1fr_1fr_1.4fr_0.9fr] gap-4 px-5 py-4 lg:py-3 lg:h-16 items-center cursor-pointer transition-colors duration-180 hover:bg-surface-hover"
                >
                  <div className="text-[15px] font-semibold text-ink truncate">{job.company}</div>
                  <div className="text-[15px] text-ink truncate">{job.role}</div>
                  <div className="text-[13px] text-ink-muted truncate">{job.location}</div>
                  <div className="text-[13px] text-ink-muted truncate">
                    {job.salary || <span className="opacity-60">Not specified</span>}
                  </div>
                  <div><StatusBadge status={job.status} /></div>
                  <div className="text-[13px] text-ink-muted truncate flex items-center gap-1.5">
                    <span className="truncate">{job.description.slice(0, 70)}…</span>
                    <span className="text-brand font-semibold inline-flex items-center gap-0.5 shrink-0">
                      View <ExternalLink className="h-3 w-3" />
                    </span>
                  </div>
                  <input
                    onClick={(e) => e.stopPropagation()}
                    value={job.notes ?? ""}
                    onChange={(e) =>
                      setJobs((prev) => prev.map((j) => (j.id === job.id ? { ...j, notes: e.target.value } : j)))
                    }
                    placeholder="Add note..."
                    className="bg-transparent text-[13px] text-ink-muted placeholder:text-ink-muted/60 outline-none border-0 focus:text-ink"
                  />
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Mobile add button */}
        <div className="md:hidden fixed bottom-6 right-6">
          <button
            type="button"
            onClick={() => setAddOpen(true)}
            className="h-14 w-14 rounded-full bg-brand text-primary-foreground grid place-items-center"
            aria-label="Add job"
          >
            <Plus className="h-6 w-6" />
          </button>
        </div>
      </main>

      <JobDetailPanel
        job={selected}
        onClose={() => setSelectedId(null)}
        onUpdate={(u) => setJobs((prev) => prev.map((j) => (j.id === u.id ? u : j)))}
      />
      <AddJobModal open={addOpen} onClose={() => setAddOpen(false)} />
    </div>
  );
}

function EmptyState({ onAdd }: { onAdd: () => void }) {
  return (
    <div className="py-20 px-6 text-center">
      <div className="mx-auto h-14 w-14 rounded-2xl bg-surface-2 border border-line grid place-items-center mb-5">
        <Plus className="h-6 w-6 text-ink-muted" />
      </div>
      <h2 className="text-[28px] font-semibold text-ink">No jobs yet</h2>
      <p className="text-[15px] text-ink-muted mt-2">
        Add your first job to start tracking your applications.
      </p>
      <button
        type="button"
        onClick={onAdd}
        className="mt-6 inline-flex items-center gap-2 h-12 px-6 rounded-full bg-brand text-primary-foreground text-[12px] font-bold uppercase tracking-[0.08em] transition-opacity duration-180 hover:opacity-90"
      >
        <Plus className="h-4 w-4" /> Add Job
      </button>
    </div>
  );
}
