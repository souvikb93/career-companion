import type { Lang } from "./translations";

export type JobStatus =
  | "saved"
  | "applied"
  | "assignment"
  | "interviewing"
  | "assessment"
  | "offer"
  | "accepted"
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
  locationI18n?: LocalizedString;
  descriptionI18n?: LocalizedString;
}

export const STATUS_ORDER: JobStatus[] = [
  "saved",
  "applied",
  "assignment",
  "interviewing",
  "assessment",
  "offer",
  "accepted",
  "rejected",
];

export const STATUS_LABEL: Record<JobStatus, string> = {
  saved: "Saved",
  applied: "Applied",
  assignment: "Assignment",
  interviewing: "Interviewing",
  assessment: "Assessment",
  offer: "Offer",
  accepted: "Accepted",
  rejected: "Rejected",
};

export const STATUS_DOT_CLASS: Record<JobStatus, string> = {
  saved: "bg-status-saved",
  applied: "bg-status-applied",
  assignment: "bg-status-active",
  interviewing: "bg-status-active",
  assessment: "bg-status-assessment",
  offer: "bg-status-offer",
  accepted: "bg-status-offer",
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
  assessment: "completed",
  offer: "completed",
  accepted: "completed",
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
