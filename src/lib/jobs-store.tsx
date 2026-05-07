import { createContext, useContext, useEffect, useMemo, useState, ReactNode } from "react";
import { Job, buildSampleJobs, localizeJob } from "./jobs-data";
import { useT } from "./i18n";

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
const STORAGE_KEY = "jobs_v7";
const DATA_VERSION_KEY = `${STORAGE_KEY}_data_version`;
const CURRENT_DATA_VERSION = "shared-jobs-2026-05-07";

function readInitialJobs(): Job[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    const version = localStorage.getItem(DATA_VERSION_KEY);
    if (raw && version === CURRENT_DATA_VERSION) return JSON.parse(raw) as Job[];
    const seed = buildSampleJobs("de");
    localStorage.setItem(STORAGE_KEY, JSON.stringify(seed));
    localStorage.setItem(DATA_VERSION_KEY, CURRENT_DATA_VERSION);
    return seed;
  } catch {
    return buildSampleJobs("de");
  }
}

export function JobsProvider({ children }: { children: ReactNode }) {
  const { lang } = useT();
  const [jobs, setJobsState] = useState<Job[]>(readInitialJobs);
  const [targetJobId, setTargetJobId] = useState<string | null>(null);

  // Re-localize seeded jobs whenever language changes.
  const localized = useMemo(() => jobs.map((j) => localizeJob(j, lang)), [jobs, lang]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(jobs));
      localStorage.setItem(DATA_VERSION_KEY, CURRENT_DATA_VERSION);
    } catch {/* noop */}
  }, [jobs]);

  const setJobs = (j: Job[]) => setJobsState(j);
  const addJob = (j: Job) => setJobsState((prev) => [j, ...prev]);
  const updateJob = (j: Job) =>
    setJobsState((prev) => prev.map((x) => (x.id === j.id ? { ...j, locationI18n: x.locationI18n, descriptionI18n: x.descriptionI18n } : x)));
  const getJob = (id: string) => localized.find((j) => j.id === id);

  return (
    <JobsContext.Provider value={{ jobs: localized, setJobs, addJob, updateJob, getJob, targetJobId, setTargetJobId }}>
      {children}
    </JobsContext.Provider>
  );
}

export function useJobs() {
  const ctx = useContext(JobsContext);
  if (!ctx) throw new Error("useJobs must be used within JobsProvider");
  return ctx;
}
