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
const STORAGE_KEY = "jobs_v3";

export function JobsProvider({ children }: { children: ReactNode }) {
  const [jobs, setJobsState] = useState<Job[]>(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) return JSON.parse(raw);
    } catch {/* noop */}
    return SAMPLE_JOBS;
  });
  const [targetJobId, setTargetJobId] = useState<string | null>(null);

  useEffect(() => {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(jobs)); } catch {/* noop */}
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
