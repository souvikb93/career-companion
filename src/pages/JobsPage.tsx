import { useMemo, useState, useCallback, useRef, useEffect } from "react";
import { Search, Plus, ChevronRight } from "lucide-react";
import {
  JobStatus,
  STATUS_DOT_CLASS,
  STATUS_VIEW,
  PIPELINE_VIEWS,
  PipelineView,
} from "@/lib/jobs-data";
import { useJobs } from "@/lib/jobs-store";
import { useT } from "@/lib/i18n";
import type { Job } from "@/lib/jobs-data";
import { JobDetailPanel } from "@/components/jobs/JobDetailPanel";
import { AddJobModal } from "@/components/jobs/AddJobModal";
import { BackgroundGradientAnimation } from "@/components/BackgroundGradientAnimation";
import { cn } from "@/lib/utils";

function StatusDot({ status }: { status: JobStatus }) {
  const { t } = useT();
  return (
    <span className="inline-flex items-center gap-2 text-[13px] text-ink whitespace-nowrap">
      <span className={cn("h-2 w-2 rounded-full shrink-0", STATUS_DOT_CLASS[status])} />
      {t(`status.${status}`)}
    </span>
  );
}

function formatDate(iso: string, locale: string) {
  const [year, month, day] = iso.split("-").map(Number);
  const d = year && month && day ? new Date(year, month - 1, day) : new Date(iso);
  return d.toLocaleDateString(locale, { month: "short", day: "numeric" });
}

export default function JobsPage() {
  const { jobs, updateJob, removeJob } = useJobs();
  const { t, lang } = useT();
  const dateLocale = lang === "de" ? "de-DE" : "en-US";
  const [view, setView] = useState<PipelineView>("all");
  const [query, setQuery] = useState("");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [addOpen, setAddOpen] = useState(false);
  const openDelayRef = useRef<ReturnType<typeof setTimeout>>();

  const handleJobAdded = useCallback((job: Job) => {
    if (openDelayRef.current) clearTimeout(openDelayRef.current);
    openDelayRef.current = setTimeout(() => setSelectedId(job.id), 320);
  }, []);

  useEffect(() => () => { if (openDelayRef.current) clearTimeout(openDelayRef.current); }, []);


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
    <div className="relative w-full" style={{ minHeight: "calc(100vh - 64px)" }}>
      <BackgroundGradientAnimation
        interactive={false}
        containerClassName="absolute inset-0 -z-10"
      />

      <main className="relative w-full min-w-0 p-4 sm:p-8">
        {/* Single toolbar row: pipeline view chips + search + add */}
        <div className="flex flex-wrap items-center gap-3 mb-6">
          <div className="flex flex-nowrap lg:flex-wrap items-center gap-2 flex-1 min-w-0 overflow-x-auto scrollbar-hide">
            {PIPELINE_VIEWS.map((v) => {
              const active = view === v.id;
              return (
                <button
                  key={v.id}
                  type="button"
                  onClick={() => setView(v.id)}
                  className={cn(
                    "h-10 px-4 rounded-full border text-[13px] font-medium inline-flex items-center gap-2 transition-all duration-180 backdrop-blur-md shrink-0",
                    active
                      ? "border-brand text-brand bg-white/40 glass-chip-active"
                      : "border-white/40 text-ink bg-white/30 hover:bg-white/50 glass-chip",
                  )}
                >
                  <span>{t(`pipeline.${v.id}`)}</span>
                  <span className={cn("text-[12px]", active ? "text-brand" : "text-ink-muted")}>
                    {counts[v.id]}
                  </span>
                </button>
              );
            })}
          </div>
          <div className="relative w-full sm:w-[260px]">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-ink-muted z-10" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={t("tracker.searchPlaceholder")}
              className="glass-input pl-10 pr-4 h-11"
            />
          </div>
          <button
            type="button"
            onClick={() => setAddOpen(true)}
            aria-label={t("tracker.addJob")}
            className="hidden sm:grid place-items-center h-12 w-12 rounded-xl bg-ink text-white active-fill transition-colors duration-200 ease-out hover:bg-brand active:bg-brand shadow-lg shadow-ink/10"
          >
            <Plus className="h-5 w-5" />
          </button>
        </div>

        <div className="bg-white/40 backdrop-blur-2xl border border-white/50 rounded-2xl overflow-hidden shadow-xl shadow-ink/5 glass-card">
          {filtered.length > 0 && (
            <div className="hidden lg:grid grid-cols-[1.4fr_1.6fr_1.2fr_1fr_140px_110px_24px] gap-4 px-5 py-3 border-b border-white/40">
              {[t("tracker.colCompany"), t("tracker.colRole"), t("tracker.colLocation"), t("tracker.colSalary"), t("tracker.colStatus"), t("tracker.colDate"), ""].map((h, i) => (
                <p key={i} className="eyebrow whitespace-nowrap">{h}</p>
              ))}
            </div>
          )}

          {filtered.length === 0 ? (
            <EmptyState totalJobs={jobs.length} onAdd={() => setAddOpen(true)} />
          ) : (
            <ul className="divide-y divide-white/40">
              {filtered.map((job) => (
                <li
                  key={job.id}
                  onClick={() => setSelectedId(job.id)}
                  className="group cursor-pointer transition-colors duration-180 hover:bg-white/30 px-4 sm:px-5"
                >
                  {/* Mobile card layout */}
                  <div className="lg:hidden py-3.5 flex items-center justify-between gap-3">
                    <div className="min-w-0 flex-1">
                      <div className="text-[15px] font-semibold text-ink truncate">{job.company}</div>
                      <div className="text-[13px] text-ink-muted truncate mt-0.5">{job.role}</div>
                    </div>
                    <div className="shrink-0 flex items-center gap-2">
                      <StatusDot status={job.status} />
                      <ChevronRight className="h-4 w-4 text-ink-muted" />
                    </div>
                  </div>
                  {/* Desktop table layout */}
                  <div className="hidden lg:grid grid-cols-[1.4fr_1.6fr_1.2fr_1fr_140px_110px_24px] gap-4 py-3 h-14 items-center">
                    <div className="text-[15px] font-semibold text-ink truncate">{job.company}</div>
                    <div className="text-[14px] text-ink truncate">{job.role}</div>
                    <div className="text-[13px] text-ink-muted truncate">{job.location}</div>
                    <div className="text-[13px] text-ink-muted truncate">
                      {job.salary || <span className="opacity-60">—</span>}
                    </div>
                    <div><StatusDot status={job.status} /></div>
                    <div className="text-[13px] text-ink-muted truncate">{formatDate(job.dateAdded, dateLocale)}</div>
                    <div className="flex justify-end text-ink-muted opacity-0 group-hover:opacity-100 transition-opacity duration-180">
                      <ChevronRight className="h-4 w-4" />
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="sm:hidden fixed right-5" style={{ bottom: "max(20px, env(safe-area-inset-bottom, 20px))" }}>
          <button
            type="button"
            onClick={() => setAddOpen(true)}
            className="h-14 w-14 rounded-xl bg-ink text-white active-fill grid place-items-center shadow-lg transition-colors duration-200 ease-out hover:bg-brand active:bg-brand"
            aria-label={t("tracker.addJob")}
          >
            <Plus className="h-6 w-6" />
          </button>
        </div>
      </main>

      <JobDetailPanel
        job={selected}
        onClose={() => setSelectedId(null)}
        onUpdate={updateJob}
        onDelete={(id) => { removeJob(id); setSelectedId(null); }}
      />
      <AddJobModal open={addOpen} onClose={() => setAddOpen(false)} onJobAdded={handleJobAdded} />
    </div>
  );
}

function EmptyState({ totalJobs, onAdd }: { totalJobs: number; onAdd: () => void }) {
  const { t } = useT();
  const isFirstTime = totalJobs === 0;

  return (
    <div className="py-24 px-6 text-center">
      <h2 className="display-1">
        {isFirstTime ? t("tracker.emptyTitle") : t("tracker.stageEmptyTitle")}
      </h2>
      <p className="text-[16px] text-ink-muted mt-4 max-w-md mx-auto">
        {isFirstTime ? t("tracker.emptyBody") : t("tracker.stageEmptyBody")}
      </p>
      {isFirstTime && (
        <button type="button" onClick={onAdd} className="btn-primary mt-8 h-12 px-6">
          <Plus className="h-4 w-4" /> {t("tracker.emptyCta")}
        </button>
      )}
    </div>
  );
}
