import { useState } from "react";
import { Plus } from "lucide-react";

interface AddJobModalProps {
  open: boolean;
  onClose: () => void;
}

export function AddJobModal({ open, onClose }: AddJobModalProps) {
  const [url, setUrl] = useState("");
  if (!open) return null;
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
        <label className="field-label" htmlFor="job-url">LinkedIn URL</label>
        <input
          id="job-url"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="Paste LinkedIn job URL"
          className="input-base"
        />
        <p className="text-[12px] text-ink-muted mt-2">
          We'll pull in the job details automatically.
        </p>
        <div className="mt-6 flex gap-3">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 h-12 rounded-full border border-ink-2 text-ink text-[12px] font-bold uppercase tracking-[0.08em] transition-colors duration-180 hover:bg-surface-2"
          >
            Cancel
          </button>
          <button
            type="button"
            className="flex-1 h-12 rounded-full bg-brand text-primary-foreground text-[12px] font-bold uppercase tracking-[0.08em] transition-opacity duration-180 hover:opacity-90 inline-flex items-center justify-center gap-2"
          >
            <Plus className="h-4 w-4" /> Fetch Job
          </button>
        </div>
      </div>
    </div>
  );
}
