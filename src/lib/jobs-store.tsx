import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { Job, SAMPLE_JOBS } from "./jobs-data";

interface Ctx {
  jobs: Job[];
  setJobs: (j: Job[]) => void;
  addJob: (j: Job) => void;
  updateJob: (j: Job) => void;
  getJob: (id: string) => Job | undefined;
  targetJobId: string | null;
  setTargetJobId: (id: string | null) => void;
}

const JobsContext = createContext<Ctx | null>(null);
const STORAGE_KEY = "jobs_v6";
const DATA_VERSION_KEY = `${STORAGE_KEY}_data_version`;
const CURRENT_DATA_VERSION = "shared-jobs-2026-05-06";

const LEGACY_DEMO_COMPANIES = new Set(["Linear", "Vercel", "Notion", "Figma", "Stripe", "Anthropic", "Arc"]);

function readInitialJobs() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    const version = localStorage.getItem(DATA_VERSION_KEY);

    if (raw && version === CURRENT_DATA_VERSION) return JSON.parse(raw) as Job[];

    if (raw) {
      const parsed = JSON.parse(raw) as Job[];
      const hasLegacyDemoRows = Array.isArray(parsed) && parsed.some((job) => LEGACY_DEMO_COMPANIES.has(job.company));
      if (!hasLegacyDemoRows && version === CURRENT_DATA_VERSION) return parsed;
    }

    localStorage.setItem(STORAGE_KEY, JSON.stringify(SAMPLE_JOBS));
    localStorage.setItem(DATA_VERSION_KEY, CURRENT_DATA_VERSION);
  } catch {/* noop */}

  return SAMPLE_JOBS;
}

export function JobsProvider({ children }: { children: ReactNode }) {
  const [jobs, setJobsState] = useState<Job[]>(readInitialJobs);
  const [targetJobId, setTargetJobId] = useState<string | null>(null);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(jobs));
      localStorage.setItem(DATA_VERSION_KEY, CURRENT_DATA_VERSION);
    } catch {/* noop */}
  }, [jobs]);

  const setJobs = (j: Job[]) => setJobsState(j);
  const addJob = (j: Job) => setJobsState((prev) => [j, ...prev]);
  const updateJob = (j: Job) =>
    setJobsState((prev) => prev.map((x) => (x.id === j.id ? j : x)));
  const getJob = (id: string) => jobs.find((j) => j.id === id);

  return (
    <JobsContext.Provider value={{ jobs, setJobs, addJob, updateJob, getJob, targetJobId, setTargetJobId }}>
      {children}
    </JobsContext.Provider>
  );
}

export function useJobs() {
  const ctx = useContext(JobsContext);
  if (!ctx) throw new Error("useJobs must be used within JobsProvider");
  return ctx;
}
