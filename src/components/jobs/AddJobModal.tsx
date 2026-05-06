import { useState } from "react";
import { Plus, Loader2, X } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useJobs } from "@/lib/jobs-store";
import { Job } from "@/lib/jobs-data";
import { useToast } from "@/hooks/use-toast";

interface AddJobModalProps {
  open: boolean;
  onClose: () => void;
}

export function AddJobModal({ open, onClose }: AddJobModalProps) {
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [mode, setMode] = useState<"url" | "manual">("url");
  const [manual, setManual] = useState({
    company: "",
    role: "",
    location: "",
    salary: "",
    link: "",
  });
  const { addJob } = useJobs();
  const { toast } = useToast();

  if (!open) return null;

  const close = () => {
    setUrl("");
    setManual({ company: "", role: "", location: "", salary: "", link: "" });
    setMode("url");
    onClose();
  };

  const fetchJob = async () => {
    const raw = url.trim();
    if (!raw) return;
    const normalized = /^https?:\/\//i.test(raw) ? raw : `https://${raw}`;
    try {
      new URL(normalized);
    } catch {
      toast({ title: "Invalid URL", description: "Please paste a valid job posting URL.", variant: "destructive" });
      return;
    }
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("scrape-job", {
        body: { url: normalized },
      });
      if (error) throw error;
      if ((data as { error?: string })?.error) throw new Error((data as { error: string }).error);

      const job: Job = {
        id: crypto.randomUUID(),
        company: data.company || "Unknown company",
        role: data.role || "Unknown role",
        location: data.location || "",
        salary: data.salary || "",
        description: data.description || "",
        notes: "",
        status: "saved",
        link: data.link || url.trim(),
        dateAdded: new Date().toISOString().slice(0, 10),
      };
      addJob(job);
      toast({ title: "Job added", description: `${job.company} — ${job.role}` });
      close();
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Failed to fetch job";
      toast({ title: "Couldn't fetch job", description: msg, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const saveManual = () => {
    if (!manual.company.trim() || !manual.role.trim()) {
      toast({ title: "Missing details", description: "Company and role are required.", variant: "destructive" });
      return;
    }
    const job: Job = {
      id: crypto.randomUUID(),
      company: manual.company.trim(),
      role: manual.role.trim(),
      location: manual.location.trim(),
      salary: manual.salary.trim(),
      description: "",
      notes: "",
      status: "saved",
      link: manual.link.trim(),
      dateAdded: new Date().toISOString().slice(0, 10),
    };
    addJob(job);
    toast({ title: "Job added", description: `${job.company} — ${job.role}` });
    close();
  };

  return (
    <div
      className="fixed inset-0 z-50 grid place-items-center bg-ink/30 px-4 animate-panel-in"
      onClick={close}
    >
      <div
        className="relative w-full max-w-[500px] bg-popover border border-line rounded-[28px] p-8"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          onClick={close}
          aria-label="Close"
          className="absolute top-4 right-4 h-9 w-9 grid place-items-center rounded-full text-ink-muted hover:text-ink hover:bg-surface-2 transition-colors"
        >
          <X className="h-4 w-4" />
        </button>

        {mode === "url" ? (
          <>
            <h2 className="text-2xl font-semibold text-ink mb-6">Add a job</h2>
            <label className="field-label" htmlFor="job-url">Job posting URL</label>
            <input
              id="job-url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="Paste any job URL (LinkedIn, Stepstone, company site...)"
              className="input-base"
              disabled={loading}
            />
            <p className="text-[12px] text-ink-muted mt-2">
              We'll fetch the page and pull in the job details automatically.
            </p>
            <div className="mt-6 flex gap-3">
              <button
                type="button"
                onClick={() => setMode("manual")}
                disabled={loading}
                className="flex-1 h-12 rounded-full border border-ink-2 text-ink text-[12px] font-bold uppercase tracking-[0.08em] transition-colors duration-200 ease-out hover:bg-surface-2 disabled:opacity-50"
              >
                Enter Manually
              </button>
              <button
                type="button"
                onClick={fetchJob}
                disabled={loading || !url.trim()}
                className="flex-1 h-12 rounded-full bg-brand text-primary-foreground text-[12px] font-bold uppercase tracking-[0.08em] transition-opacity duration-200 ease-out hover:opacity-95 inline-flex items-center justify-center gap-2 disabled:opacity-60"
              >
                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
                {loading ? "Fetching…" : "Fetch Job"}
              </button>
            </div>
          </>
        ) : (
          <>
            <h2 className="text-2xl font-semibold text-ink mb-6">Enter job details</h2>
            <div className="space-y-4">
              <div>
                <label className="field-label" htmlFor="m-company">Company</label>
                <input id="m-company" value={manual.company} onChange={(e) => setManual({ ...manual, company: e.target.value })} className="input-base" placeholder="e.g. Google" />
              </div>
              <div>
                <label className="field-label" htmlFor="m-role">Role</label>
                <input id="m-role" value={manual.role} onChange={(e) => setManual({ ...manual, role: e.target.value })} className="input-base" placeholder="e.g. UX Designer" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="field-label" htmlFor="m-location">Location</label>
                  <input id="m-location" value={manual.location} onChange={(e) => setManual({ ...manual, location: e.target.value })} className="input-base" placeholder="Berlin, Germany" />
                </div>
                <div>
                  <label className="field-label" htmlFor="m-salary">Salary</label>
                  <input id="m-salary" value={manual.salary} onChange={(e) => setManual({ ...manual, salary: e.target.value })} className="input-base" placeholder="€70,000 – €90,000" />
                </div>
              </div>
              <div>
                <label className="field-label" htmlFor="m-link">Link (optional)</label>
                <input id="m-link" value={manual.link} onChange={(e) => setManual({ ...manual, link: e.target.value })} className="input-base" placeholder="https://..." />
              </div>
            </div>
            <div className="mt-6 flex gap-3">
              <button
                type="button"
                onClick={() => setMode("url")}
                className="flex-1 h-12 rounded-full border border-ink-2 text-ink text-[12px] font-bold uppercase tracking-[0.08em] transition-colors duration-200 ease-out hover:bg-surface-2"
              >
                Back
              </button>
              <button
                type="button"
                onClick={saveManual}
                disabled={!manual.company.trim() || !manual.role.trim()}
                className="flex-1 h-12 rounded-full bg-brand text-primary-foreground text-[12px] font-bold uppercase tracking-[0.08em] transition-opacity duration-200 ease-out hover:opacity-95 inline-flex items-center justify-center gap-2 disabled:opacity-60"
              >
                <Plus className="h-4 w-4" />
                Add Job
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
