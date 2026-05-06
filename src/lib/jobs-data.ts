export type JobStatus = "saved" | "applied" | "interviewing" | "offer" | "rejected";

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

export const STATUS_ORDER: JobStatus[] = ["saved", "applied", "interviewing", "offer", "rejected"];

export const STATUS_LABEL: Record<JobStatus, string> = {
  saved: "Saved",
  applied: "Applied",
  interviewing: "Interviewing",
  offer: "Offer",
  rejected: "Rejected",
};

export const SAMPLE_JOBS: Job[] = [
  {
    id: "1",
    company: "Linear",
    role: "Senior Product Designer",
    location: "Remote · EU",
    salary: "€95k – €120k",
    status: "interviewing",
    description:
      "We're looking for a senior product designer to shape the next generation of issue tracking. You'll work directly with the founders on core product surfaces, design systems, and craft.",
    notes: "Recruiter call Mon, portfolio review next week.",
    link: "https://linear.app/careers",
    dateAdded: "2026-04-28",
  },
  {
    id: "2",
    company: "Vercel",
    role: "Product Engineer",
    location: "San Francisco, CA",
    salary: "$180k – $240k",
    status: "applied",
    description:
      "Build the platform powering the modern web. We need engineers who care equally about UI craft and infra reliability.",
    notes: "",
    link: "https://vercel.com/careers",
    dateAdded: "2026-05-01",
  },
  {
    id: "3",
    company: "Notion",
    role: "Design Engineer",
    location: "New York, NY",
    salary: "",
    status: "saved",
    description:
      "Design Engineers at Notion sit between design and engineering, prototyping and shipping new surfaces of the product.",
    notes: "Wait for referral from Maya.",
    link: "https://notion.so/careers",
    dateAdded: "2026-05-03",
  },
  {
    id: "4",
    company: "Figma",
    role: "Brand Designer",
    location: "Remote",
    salary: "$140k – $180k",
    status: "offer",
    description: "Lead brand creative across campaigns, events, and the Figma identity system.",
    notes: "Offer received — negotiating equity.",
    link: "https://figma.com/careers",
    dateAdded: "2026-04-15",
  },
  {
    id: "5",
    company: "Stripe",
    role: "Frontend Engineer",
    location: "Dublin, IE",
    salary: "€85k – €110k",
    status: "rejected",
    description: "Work on the merchant dashboard powering millions of businesses.",
    notes: "Rejected after final round — try again in 6 months.",
    link: "https://stripe.com/jobs",
    dateAdded: "2026-03-30",
  },
  {
    id: "6",
    company: "Anthropic",
    role: "Product Designer, Claude",
    location: "Remote · US",
    salary: "$200k – $260k",
    status: "applied",
    description:
      "Design the experience of working with Claude across consumer and developer surfaces. Shape how millions of people collaborate with AI.",
    notes: "",
    link: "https://anthropic.com/careers",
    dateAdded: "2026-05-05",
  },
  {
    id: "7",
    company: "Arc",
    role: "iOS Engineer",
    location: "New York, NY",
    salary: "$170k – $220k",
    status: "saved",
    description: "Build a browser people love, on iOS.",
    notes: "",
    link: "https://arc.net/careers",
    dateAdded: "2026-05-04",
  },
];
