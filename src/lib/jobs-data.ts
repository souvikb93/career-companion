import type { Lang } from "./translations";

export type JobStatus =
  | "saved"
  | "applied"
  | "assignment"
  | "interviewing"
  | "offer"
  | "rejected";

export type PipelineView = "all" | "saved" | "in-progress" | "completed";

export interface LocalizedString { de: string; en: string }

export interface Job {
  id: string;
  company: string;
  role: string;
  location: string;
  salary?: string;
  status: JobStatus;
  description: string;
  notes?: string;
  link?: string;
  dateAdded: string;
  deadline?: string;
  notifyDeadline?: boolean;
  locationI18n?: LocalizedString;
  descriptionI18n?: LocalizedString;
}

export const STATUS_ORDER: JobStatus[] = [
  "saved",
  "applied",
  "assignment",
  "interviewing",
  "offer",
  "rejected",
];

export const STATUS_LABEL: Record<JobStatus, string> = {
  saved: "Saved",
  applied: "Applied",
  assignment: "Assignment",
  interviewing: "Interviewing",
  offer: "Offer",
  rejected: "Rejected",
};

export const STATUS_DOT_CLASS: Record<JobStatus, string> = {
  saved: "bg-status-saved",
  applied: "bg-status-applied",
  assignment: "bg-amber-400",
  interviewing: "bg-amber-600",
  offer: "bg-status-offer",
  rejected: "bg-ink-muted",
};

export const PIPELINE_VIEWS: { id: PipelineView; label: string }[] = [
  { id: "all", label: "All Jobs" },
  { id: "saved", label: "Saved" },
  { id: "in-progress", label: "In Progress" },
  { id: "completed", label: "Completed" },
];

export const STATUS_VIEW: Record<JobStatus, Exclude<PipelineView, "all">> = {
  saved: "saved",
  applied: "in-progress",
  assignment: "in-progress",
  interviewing: "in-progress",
  offer: "completed",
  rejected: "completed",
};

export function localizeJob(job: Job, lang: Lang): Job {
  if (!job.locationI18n && !job.descriptionI18n) return job;
  return {
    ...job,
    location: job.locationI18n ? job.locationI18n[lang] : job.location,
    description: job.descriptionI18n ? job.descriptionI18n[lang] : job.description,
  };
}
