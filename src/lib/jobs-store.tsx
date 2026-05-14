import { createContext, useContext, useEffect, useMemo, useState, useCallback, ReactNode } from "react";
import { Job, localizeJob } from "./jobs-data";
import { useT } from "./i18n";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";

interface Ctx {
  jobs: Job[];
  jobsLoading: boolean;
  setJobs: (j: Job[]) => void;
  addJob: (j: Job) => void;
  updateJob: (j: Job) => void;
  removeJob: (id: string) => void;
  getJob: (id: string) => Job | undefined;
  targetJobId: string | null;
  setTargetJobId: (id: string | null) => void;
}

const JobsContext = createContext<Ctx | null>(null);

const CACHE_KEY = "jobs_v7";

function readCache(): Job[] {
  try {
    const raw = localStorage.getItem(CACHE_KEY);
    if (raw !== null) return JSON.parse(raw) as Job[];
  } catch {/* noop */}
  return [];
}

function writeCache(jobs: Job[]) {
  try { localStorage.setItem(CACHE_KEY, JSON.stringify(jobs)); } catch {/* noop */}
}

/** Clear the local jobs cache. Called on logout / account deletion. */
export function clearJobsStorage() {
  try { localStorage.removeItem(CACHE_KEY); } catch {/* noop */}
}

/**
 * Try to load jobs from Supabase profiles.jobs column.
 * Returns null if the column doesn't exist or the query fails for any reason.
 */
async function fetchJobsFromSupabase(userId: string): Promise<Job[] | null> {
  try {
    const { data, error } = await supabase
      .from("profiles")
      .select("jobs")
      .eq("id", userId)
      .maybeSingle();
    if (error || !data) return null;
    const jobs = data.jobs;
    return Array.isArray(jobs) ? (jobs as Job[]) : null;
  } catch {
    return null;
  }
}

/**
 * Try to persist jobs to Supabase. Fails silently if column doesn't exist.
 */
function saveJobsToSupabase(userId: string, jobs: Job[]) {
  try {
    supabase
      .from("profiles")
      .update({ jobs } as Record<string, unknown>)
      .eq("id", userId)
      .then(() => {}, () => {});
  } catch {/* noop */}
}

export function JobsProvider({ children }: { children: ReactNode }) {
  const { user, loading: authLoading } = useAuth();
  const { lang } = useT();

  const [jobs, setJobsState] = useState<Job[]>(readCache);
  const [jobsLoading, setJobsLoading] = useState(true);
  const [targetJobId, setTargetJobId] = useState<string | null>(null);

  const userId = user?.id;

  // ── Sync from Supabase whenever the logged-in user changes ──────────────
  useEffect(() => {
    if (authLoading) return;

    if (!userId) {
      clearJobsStorage();
      setJobsState([]);
      setJobsLoading(false);
      return;
    }

    let cancelled = false;
    setJobsLoading(true);

    fetchJobsFromSupabase(userId).then((remote) => {
      if (cancelled) return;
      if (remote !== null) {
        setJobsState(remote);
        writeCache(remote);
      }
      // If remote is null (column missing or error), keep cached/current state
      setJobsLoading(false);
    });

    return () => { cancelled = true; };
  }, [userId, authLoading]);

  // ── Persist helpers ──────────────────────────────────────────────────────
  const persist = useCallback((updated: Job[]) => {
    writeCache(updated);
    if (userId) saveJobsToSupabase(userId, updated);
  }, [userId]);

  const setJobs = useCallback((j: Job[]) => {
    setJobsState(j);
    persist(j);
  }, [persist]);

  const addJob = useCallback((j: Job) => {
    setJobsState((prev) => {
      const updated = [j, ...prev];
      persist(updated);
      return updated;
    });
  }, [persist]);

  const updateJob = useCallback((j: Job) => {
    setJobsState((prev) => {
      const updated = prev.map((x) =>
        x.id === j.id
          ? { ...j, locationI18n: x.locationI18n, descriptionI18n: x.descriptionI18n }
          : x
      );
      persist(updated);
      return updated;
    });
  }, [persist]);

  const removeJob = useCallback((id: string) => {
    setJobsState((prev) => {
      const updated = prev.filter((x) => x.id !== id);
      persist(updated);
      return updated;
    });
  }, [persist]);

  // ── Localisation ─────────────────────────────────────────────────────────
  const localized = useMemo(() => jobs.map((j) => localizeJob(j, lang)), [jobs, lang]);
  const getJob = useCallback((id: string) => localized.find((j) => j.id === id), [localized]);

  return (
    <JobsContext.Provider
      value={{ jobs: localized, jobsLoading, setJobs, addJob, updateJob, removeJob, getJob, targetJobId, setTargetJobId }}
    >
      {children}
    </JobsContext.Provider>
  );
}

export function useJobs() {
  const ctx = useContext(JobsContext);
  if (!ctx) throw new Error("useJobs must be used within JobsProvider");
  return ctx;
}
