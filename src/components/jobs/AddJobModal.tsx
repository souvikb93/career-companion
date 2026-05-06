import { useState } from "react";
import { Plus, Loader2 } from "lucide-react";
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
  const { addJob } = useJobs();
  const { toast } = useToast();

  if (!open) return null;

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
      setUrl("");
      onClose();
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Failed to fetch job";
      toast({ title: "Couldn't fetch job", description: msg, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 grid place-items-center bg-ink/30 px-4 animate-panel-in"
      onClick={onClose}
    >
      <div
        className="w-full max-w-[500px] bg-popover border border-line rounded-[28px] p-8"
        onClick={(e) => e.stopPropagation()}
      >
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
            onClick={onClose}
            disabled={loading}
            className="flex-1 h-12 rounded-full border border-ink-2 text-ink text-[12px] font-bold uppercase tracking-[0.08em] transition-colors duration-200 hover:bg-surface-2 disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={fetchJob}
            disabled={loading || !url.trim()}
            className="flex-1 h-12 rounded-full bg-brand text-primary-foreground text-[12px] font-bold uppercase tracking-[0.08em] transition-all duration-200 ease-out hover:opacity-95 hover:-translate-y-0.5 hover:shadow-md active:translate-y-0 active:shadow-none inline-flex items-center justify-center gap-2 disabled:opacity-60"
          >
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
            {loading ? "Fetching…" : "Fetch Job"}
          </button>
        </div>
      </div>
    </div>
  );
}
