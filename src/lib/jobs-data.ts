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
    company: "Zalando",
    role: "Senior Product Designer",
    location: "Berlin, DE",
    salary: "€85k – €105k",
    status: "interviewing",
    description:
      "Shape the next generation of fashion e-commerce. You'll work on core product surfaces used by 50M+ customers across Europe.",
    notes: "Onsite round next Thursday in Berlin.",
    link: "https://jobs.zalando.com",
    dateAdded: "2026-04-28",
  },
  {
    id: "2",
    company: "Delivery Hero",
    role: "Product Engineer",
    location: "Berlin, DE",
    salary: "€80k – €100k",
    status: "applied",
    description:
      "Build the platform powering food delivery in 70+ countries. Work across logistics, payments, and consumer surfaces.",
    notes: "",
    link: "https://careers.deliveryhero.com",
    dateAdded: "2026-05-01",
  },
  {
    id: "3",
    company: "Personio",
    role: "Design Engineer",
    location: "Munich, DE",
    salary: "€75k – €95k",
    status: "saved",
    description:
      "Design Engineers at Personio prototype and ship new HR product surfaces used by 10,000+ SMBs across Europe.",
    notes: "Wait for referral from Lukas.",
    link: "https://personio.com/careers",
    dateAdded: "2026-05-03",
  },
  {
    id: "4",
    company: "FlixBus",
    role: "Brand Designer",
    location: "Munich, DE",
    salary: "€65k – €85k",
    status: "offer",
    description: "Lead brand creative across campaigns, partnerships, and the FlixBus identity system.",
    notes: "Offer received — negotiating equity.",
    link: "https://flix.com/jobs",
    dateAdded: "2026-04-15",
  },
  {
    id: "5",
    company: "Bolt",
    role: "Frontend Engineer",
    location: "Berlin, DE",
    salary: "€75k – €95k",
    status: "assignment",
    description: "Work on the rider dashboard powering millions of trips across Europe and Africa.",
    notes: "Take-home assignment due Friday.",
    link: "https://bolt.eu/careers",
    dateAdded: "2026-03-30",
  },
  {
    id: "6",
    company: "N26",
    role: "Product Designer, Banking",
    location: "Berlin, DE",
    salary: "€80k – €100k",
    status: "applied",
    description:
      "Design the mobile banking experience for 8M+ customers across Europe. Shape the future of digital finance.",
    notes: "",
    link: "https://n26.com/en/careers",
    dateAdded: "2026-05-05",
  },
  {
    id: "7",
    company: "Trade Republic",
    role: "iOS Engineer",
    location: "Berlin, DE",
    salary: "€85k – €110k",
    status: "saved",
    description: "Build the broker app democratising investing across Europe.",
    notes: "",
    link: "https://traderepublic.com/careers",
    dateAdded: "2026-05-04",
  },
  {
    id: "8",
    company: "About You",
    role: "Staff Product Designer",
    location: "Hamburg, DE",
    salary: "€95k – €120k",
    status: "assessment",
    description: "Lead design for personalised shopping across web and mobile.",
    notes: "Final portfolio presentation booked.",
    link: "https://corporate.aboutyou.com/careers",
    dateAdded: "2026-04-10",
  },
  {
    id: "9",
    company: "GetYourGuide",
    role: "Senior Engineer",
    location: "Berlin, DE",
    salary: "€90k – €115k",
    status: "accepted",
    description: "Build the marketplace powering travel experiences worldwide.",
    notes: "Signed offer — start June 1.",
    link: "https://careers.getyourguide.com",
    dateAdded: "2026-03-20",
  },
  {
    id: "10",
    company: "SAP",
    role: "UX Researcher",
    location: "Walldorf, DE",
    salary: "€75k – €95k",
    status: "applied",
    description: "Research enterprise software workflows used by Fortune 500 customers.",
    notes: "",
    link: "https://jobs.sap.com",
    dateAdded: "2026-04-22",
  },
  {
    id: "11",
    company: "HelloFresh",
    role: "Product Manager",
    location: "Berlin, DE",
    salary: "€85k – €110k",
    status: "interviewing",
    description: "Own the recipe discovery experience for millions of weekly subscribers.",
    notes: "Second round with Head of Product.",
    link: "https://hellofresh.com/careers",
    dateAdded: "2026-04-25",
  },
  {
    id: "12",
    company: "Celonis",
    role: "Senior Frontend Engineer",
    location: "Munich, DE",
    salary: "€95k – €120k",
    status: "saved",
    description: "Build process mining tools that transform how enterprises operate.",
    notes: "",
    link: "https://celonis.com/careers",
    dateAdded: "2026-05-02",
  },
  {
    id: "13",
    company: "Wayfair",
    role: "Product Designer",
    location: "Berlin, DE",
    salary: "€75k – €95k",
    status: "offer",
    description: "Design the home goods shopping experience for European customers.",
    notes: "Offer in hand, deciding by Friday.",
    link: "https://wayfair.com/careers",
    dateAdded: "2026-04-08",
  },
];

