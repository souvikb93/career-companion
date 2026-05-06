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

// Tailwind tokens defined in index.css / tailwind.config.ts
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

export const SAMPLE_JOBS: Job[] = [
  {
    id: "1",
    company: "Google",
    role: "UX Designer",
    location: "Berlin, Germany",
    salary: "€75,000 – €95,000",
    status: "applied",
    description: "Design intuitive experiences across Google's consumer products used by billions.",
    notes: "",
    link: "https://careers.google.com",
    dateAdded: "2026-05-01",
  },
  {
    id: "2",
    company: "Zalando",
    role: "Senior Product Designer",
    location: "Berlin, Germany",
    salary: "€70,000 – €90,000",
    status: "interviewing",
    description: "Shape the next generation of fashion e-commerce across web and mobile.",
    notes: "",
    link: "https://jobs.zalando.com",
    dateAdded: "2026-05-02",
  },
  {
    id: "3",
    company: "Spotify",
    role: "Product Designer",
    location: "Stockholm, Sweden",
    salary: "€65,000 – €85,000",
    status: "saved",
    description: "Craft audio and music experiences for hundreds of millions of listeners worldwide.",
    notes: "",
    link: "https://lifeatspotify.com",
    dateAdded: "2026-05-03",
  },
  {
    id: "4",
    company: "Amazon",
    role: "UX Designer",
    location: "Munich, Germany",
    salary: "€80,000 – €100,000",
    status: "rejected",
    description: "Design tools and experiences powering Amazon's retail and devices ecosystem.",
    notes: "",
    link: "https://amazon.jobs",
    dateAdded: "2026-04-28",
  },
  {
    id: "5",
    company: "N26",
    role: "UX/UI Designer",
    location: "Berlin, Germany",
    salary: "€60,000 – €80,000",
    status: "applied",
    description: "Design the mobile banking experience for millions of customers across Europe.",
    notes: "",
    link: "https://n26.com/en/careers",
    dateAdded: "2026-05-04",
  },
  {
    id: "6",
    company: "Delivery Hero",
    role: "Product Designer",
    location: "Berlin, Germany",
    salary: "€65,000 – €85,000",
    status: "offer",
    description: "Build the consumer experience powering food delivery in 70+ countries.",
    notes: "",
    link: "https://careers.deliveryhero.com",
    dateAdded: "2026-05-05",
  },
  {
    id: "7",
    company: "SAP",
    role: "UX Designer",
    location: "Walldorf, Germany",
    salary: "€70,000 – €90,000",
    status: "applied",
    description: "Design enterprise software workflows used by Fortune 500 customers worldwide.",
    notes: "",
    link: "https://jobs.sap.com",
    dateAdded: "2026-04-30",
  },
  {
    id: "8",
    company: "Meta",
    role: "Product Designer",
    location: "London, UK",
    salary: "€90,000 – €120,000",
    status: "saved",
    description: "Shape social experiences across Facebook, Instagram, and WhatsApp.",
    notes: "",
    link: "https://metacareers.com",
    dateAdded: "2026-05-02",
  },
  {
    id: "9",
    company: "Adidas",
    role: "UX Designer",
    location: "Herzogenaurach, Germany",
    salary: "€60,000 – €75,000",
    status: "interviewing",
    description: "Design digital experiences for Adidas' athletes and consumers globally.",
    notes: "",
    link: "https://careers.adidas-group.com",
    dateAdded: "2026-05-03",
  },
  {
    id: "10",
    company: "Booking.com",
    role: "Product Designer",
    location: "Amsterdam, Netherlands",
    salary: "€75,000 – €95,000",
    status: "applied",
    description: "Design the world's largest travel booking experience across web and mobile.",
    notes: "",
    link: "https://careers.booking.com",
    dateAdded: "2026-05-01",
  },
  {
    id: "11",
    company: "Miro",
    role: "Senior UX Designer",
    location: "Berlin, Germany",
    salary: "€70,000 – €95,000",
    status: "saved",
    description: "Build the visual collaboration platform used by 60M+ users worldwide.",
    notes: "",
    link: "https://miro.com/careers",
    dateAdded: "2026-05-04",
  },
  {
    id: "12",
    company: "Siemens",
    role: "UX Designer",
    location: "Berlin, Germany",
    salary: "€65,000 – €85,000",
    status: "rejected",
    description: "Design industrial software experiences powering Siemens' digital transformation.",
    notes: "",
    link: "https://jobs.siemens.com",
    dateAdded: "2026-04-27",
  },
];

