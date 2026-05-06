import { useMemo, useState } from "react";
import { Search, Plus, ChevronRight } from "lucide-react";
import {
  JobStatus,
  STATUS_LABEL,
  STATUS_DOT_CLASS,
  STATUS_VIEW,
  PIPELINE_VIEWS,
  PipelineView,
} from "@/lib/jobs-data";
import { useJobs } from "@/lib/jobs-store";
import { JobDetailPanel } from "@/components/jobs/JobDetailPanel";
import { AddJobModal } from "@/components/jobs/AddJobModal";
import { cn } from "@/lib/utils";

function StatusDot({ status }: { status: JobStatus }) {
  return (
    <span className="inline-flex items-center gap-2 text-[13px] text-ink whitespace-nowrap">
      <span className={cn("h-2 w-2 rounded-full shrink-0", STATUS_DOT_CLASS[status])} />
      {STATUS_LABEL[status]}
    </span>
  );
}

function formatDate(iso: string) {
  const [year, month, day] = iso.split("-").map(Number);
  const d = year && month && day ? new Date(year, month - 1, day) : new Date(iso);
  return d.toLocaleDateString(undefined, { month: "short", day: "numeric" });
}

export default function JobsPage() {
  const { jobs, updateJob } = useJobs();
  const [view, setView] = useState<PipelineView>("all");
  const [query, setQuery] = useState("");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [addOpen, setAddOpen] = useState(false);

  const counts = useMemo(() => {
    const c: Record<PipelineView, number> = {
      all: jobs.length,
      saved: 0,
      "in-progress": 0,
      completed: 0,
    };
    jobs.forEach((j) => {
      c[STATUS_VIEW[j.status]]++;
    });
    return c;
  }, [jobs]);

  const filtered = useMemo(() => {
    return jobs.filter((j) => {
      if (view !== "all" && STATUS_VIEW[j.status] !== view) return false;
      if (!query.trim()) return true;
      const q = query.toLowerCase();
      return j.company.toLowerCase().includes(q) || j.role.toLowerCase().includes(q);
    });
  }, [jobs, view, query]);

  const selected = jobs.find((j) => j.id === selectedId) ?? null;

  return (
    <div className="w-full" style={{ minHeight: "calc(100vh - 64px)" }}>
      <main className="w-full min-w-0 p-8">
        {/* Single toolbar row: pipeline view chips + search + add */}
        <div className="flex flex-wrap items-center gap-3 mb-6">
          <div className="flex flex-wrap items-center gap-2 flex-1 min-w-0">
            {PIPELINE_VIEWS.map((v) => {
              const active = view === v.id;
              return (
                <button
                  key={v.id}
                  type="button"
                  onClick={() => setView(v.id)}
                  className={cn(
                    "h-10 px-4 rounded-full border text-[13px] font-medium inline-flex items-center gap-2 transition-colors duration-180",
                    active
                      ? "border-brand text-brand bg-transparent"
                      : "border-line text-ink hover:bg-surface-hover",
                  )}
                >
                  <span>{v.label}</span>
                  <span className={cn("text-[12px]", active ? "text-brand" : "text-ink-muted")}>
                    {counts[v.id]}
                  </span>
                </button>
              );
            })}
          </div>
          <div className="relative w-full sm:w-[260px]">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-ink-muted" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search company or role"
              className="input-base pl-10"
            />
          </div>
          <button
            type="button"
            onClick={() => setAddOpen(true)}
            aria-label="Add job"
            className="hidden sm:grid place-items-center h-12 w-12 rounded-full bg-ink text-white transition-colors duration-200 ease-out hover:bg-brand active:bg-brand"
          >
            <Plus className="h-5 w-5" />
          </button>
        </div>

        <div className="card-surface overflow-hidden">
          <div className="hidden lg:grid grid-cols-[1.4fr_1.6fr_1.2fr_1fr_140px_110px_24px] gap-4 px-5 py-3 bg-surface border-b border-line">
            {["Company", "Role", "Location", "Salary", "Status", "Date added", ""].map((h, i) => (
              <p key={i} className="eyebrow">{h}</p>
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
                  className="group grid grid-cols-1 lg:grid-cols-[1.4fr_1.6fr_1.2fr_1fr_140px_110px_24px] gap-4 px-5 py-4 lg:py-3 lg:h-14 items-center cursor-pointer transition-colors duration-180 hover:bg-surface-hover"
                >
                  <div className="text-[15px] font-semibold text-ink truncate">{job.company}</div>
                  <div className="text-[14px] text-ink truncate">{job.role}</div>
                  <div className="text-[13px] text-ink-muted truncate">{job.location}</div>
                  <div className="text-[13px] text-ink-muted truncate">
                    {job.salary || <span className="opacity-60">—</span>}
                  </div>
                  <div><StatusDot status={job.status} /></div>
                  <div className="text-[13px] text-ink-muted truncate">{formatDate(job.dateAdded)}</div>
                  <div className="hidden lg:flex justify-end text-ink-muted opacity-0 group-hover:opacity-100 transition-opacity duration-180">
                    <ChevronRight className="h-4 w-4" />
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="sm:hidden fixed bottom-6 right-6">
          <button
            type="button"
            onClick={() => setAddOpen(true)}
            className="h-14 w-14 rounded-full bg-ink text-white grid place-items-center shadow-lg transition-colors duration-200 ease-out hover:bg-brand active:bg-brand"
            aria-label="Add job"
          >
            <Plus className="h-6 w-6" />
          </button>
        </div>
      </main>

      <JobDetailPanel
        job={selected}
        onClose={() => setSelectedId(null)}
        onUpdate={updateJob}
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
      <h2 className="text-[28px] font-semibold text-ink">No jobs here</h2>
      <p className="text-[15px] text-ink-muted mt-2">
        Add a job to start tracking your applications.
      </p>
      <button
        type="button"
        onClick={onAdd}
        className="btn-primary mt-6 h-12 px-6"
      >
        <Plus className="h-4 w-4" /> Add Job
      </button>
    </div>
  );
}
