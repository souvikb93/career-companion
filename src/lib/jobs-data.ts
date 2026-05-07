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
  // Optional bilingual variants for seeded sample data
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

interface SeedJob {
  id: string;
  company: string;
  role: string;
  location: LocalizedString;
  salary?: string;
  status: JobStatus;
  description: LocalizedString;
  link?: string;
  dateAdded: string;
}

const SEED: SeedJob[] = [
  {
    id: "1", company: "Google", role: "UX Designer",
    location: { en: "Berlin, Germany", de: "Berlin, Deutschland" },
    salary: "€75,000 – €95,000", status: "applied",
    description: {
      en: "Design intuitive experiences across Google's consumer products used by billions.",
      de: "Gestalten Sie intuitive Erlebnisse für Googles Consumer-Produkte mit Milliarden Nutzern.",
    },
    link: "https://careers.google.com", dateAdded: "2026-05-01",
  },
  {
    id: "2", company: "Zalando", role: "Senior Product Designer",
    location: { en: "Berlin, Germany", de: "Berlin, Deutschland" },
    salary: "€70,000 – €90,000", status: "interviewing",
    description: {
      en: "Shape the next generation of fashion e-commerce across web and mobile.",
      de: "Gestalten Sie die nächste Generation des Mode-E-Commerce für Web und Mobile.",
    },
    link: "https://jobs.zalando.com", dateAdded: "2026-05-02",
  },
  {
    id: "3", company: "Spotify", role: "Product Designer",
    location: { en: "Stockholm, Sweden", de: "Stockholm, Schweden" },
    salary: "€65,000 – €85,000", status: "saved",
    description: {
      en: "Craft audio and music experiences for hundreds of millions of listeners worldwide.",
      de: "Entwickeln Sie Audio- und Musik-Erlebnisse für hunderte Millionen Hörer weltweit.",
    },
    link: "https://lifeatspotify.com", dateAdded: "2026-05-03",
  },
  {
    id: "4", company: "Amazon", role: "UX Designer",
    location: { en: "Munich, Germany", de: "München, Deutschland" },
    salary: "€80,000 – €100,000", status: "rejected",
    description: {
      en: "Design tools and experiences powering Amazon's retail and devices ecosystem.",
      de: "Gestalten Sie Tools und Erlebnisse für Amazons Retail- und Geräte-Ökosystem.",
    },
    link: "https://amazon.jobs", dateAdded: "2026-04-28",
  },
  {
    id: "5", company: "N26", role: "UX/UI Designer",
    location: { en: "Berlin, Germany", de: "Berlin, Deutschland" },
    salary: "€60,000 – €80,000", status: "applied",
    description: {
      en: "Design the mobile banking experience for millions of customers across Europe.",
      de: "Gestalten Sie das Mobile-Banking-Erlebnis für Millionen Kunden in Europa.",
    },
    link: "https://n26.com/en/careers", dateAdded: "2026-05-04",
  },
  {
    id: "6", company: "Delivery Hero", role: "Product Designer",
    location: { en: "Berlin, Germany", de: "Berlin, Deutschland" },
    salary: "€65,000 – €85,000", status: "offer",
    description: {
      en: "Build the consumer experience powering food delivery in 70+ countries.",
      de: "Entwickeln Sie das Kundenerlebnis für Food-Delivery in über 70 Ländern.",
    },
    link: "https://careers.deliveryhero.com", dateAdded: "2026-05-05",
  },
  {
    id: "7", company: "SAP", role: "UX Designer",
    location: { en: "Walldorf, Germany", de: "Walldorf, Deutschland" },
    salary: "€70,000 – €90,000", status: "applied",
    description: {
      en: "Design enterprise software workflows used by Fortune 500 customers worldwide.",
      de: "Gestalten Sie Enterprise-Software-Workflows für Fortune-500-Kunden weltweit.",
    },
    link: "https://jobs.sap.com", dateAdded: "2026-04-30",
  },
  {
    id: "8", company: "Meta", role: "Product Designer",
    location: { en: "London, UK", de: "London, Vereinigtes Königreich" },
    salary: "€90,000 – €120,000", status: "saved",
    description: {
      en: "Shape social experiences across Facebook, Instagram, and WhatsApp.",
      de: "Gestalten Sie soziale Erlebnisse über Facebook, Instagram und WhatsApp hinweg.",
    },
    link: "https://metacareers.com", dateAdded: "2026-05-02",
  },
  {
    id: "9", company: "Adidas", role: "UX Designer",
    location: { en: "Herzogenaurach, Germany", de: "Herzogenaurach, Deutschland" },
    salary: "€60,000 – €75,000", status: "interviewing",
    description: {
      en: "Design digital experiences for Adidas' athletes and consumers globally.",
      de: "Gestalten Sie digitale Erlebnisse für Adidas-Athleten und -Kunden weltweit.",
    },
    link: "https://careers.adidas-group.com", dateAdded: "2026-05-03",
  },
  {
    id: "10", company: "Booking.com", role: "Product Designer",
    location: { en: "Amsterdam, Netherlands", de: "Amsterdam, Niederlande" },
    salary: "€75,000 – €95,000", status: "applied",
    description: {
      en: "Design the world's largest travel booking experience across web and mobile.",
      de: "Gestalten Sie die weltweit größte Reisebuchungs-Plattform für Web und Mobile.",
    },
    link: "https://careers.booking.com", dateAdded: "2026-05-01",
  },
  {
    id: "11", company: "Miro", role: "Senior UX Designer",
    location: { en: "Berlin, Germany", de: "Berlin, Deutschland" },
    salary: "€70,000 – €95,000", status: "saved",
    description: {
      en: "Build the visual collaboration platform used by 60M+ users worldwide.",
      de: "Entwickeln Sie die visuelle Kollaborationsplattform mit über 60 Mio. Nutzern weltweit.",
    },
    link: "https://miro.com/careers", dateAdded: "2026-05-04",
  },
  {
    id: "12", company: "Siemens", role: "UX Designer",
    location: { en: "Berlin, Germany", de: "Berlin, Deutschland" },
    salary: "€65,000 – €85,000", status: "rejected",
    description: {
      en: "Design industrial software experiences powering Siemens' digital transformation.",
      de: "Gestalten Sie Industrie-Software-Erlebnisse für Siemens' digitale Transformation.",
    },
    link: "https://jobs.siemens.com", dateAdded: "2026-04-27",
  },
];

export function buildSampleJobs(lang: Lang): Job[] {
  return SEED.map((s) => ({
    id: s.id,
    company: s.company,
    role: s.role,
    location: s.location[lang],
    salary: s.salary,
    status: s.status,
    description: s.description[lang],
    notes: "",
    link: s.link,
    dateAdded: s.dateAdded,
    locationI18n: s.location,
    descriptionI18n: s.description,
  }));
}

export function localizeJob(job: Job, lang: Lang): Job {
  if (!job.locationI18n && !job.descriptionI18n) return job;
  return {
    ...job,
    location: job.locationI18n ? job.locationI18n[lang] : job.location,
    description: job.descriptionI18n ? job.descriptionI18n[lang] : job.description,
  };
}

// Backwards-compat default export
export const SAMPLE_JOBS: Job[] = buildSampleJobs("de");
