import { useEffect, useRef, useState } from "react";
import { Send, Loader2, Sparkles } from "lucide-react";
import { useJobs } from "@/lib/jobs-store";
import { ZoomControls } from "@/components/ZoomControls";
import { ExportMenu } from "@/components/ExportMenu";
import { exportAs, ExportFormat } from "@/lib/exporters";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface Message { role: "user" | "assistant"; content: string }

const DEFAULT_LETTER = `Dear Hiring Team,

I'm writing to express my interest in the role at your company. I'd welcome the chance to talk about how I can contribute.

Sincerely,
Jordan Doe`;

function letterFor(jobCompany: string, jobRole: string, jobDesc: string) {
  const today = new Date().toLocaleDateString(undefined, { year: "numeric", month: "long", day: "numeric" });
  return `${today}

Hiring Team
${jobCompany}

Dear Hiring Team,

I'm writing to express my interest in the ${jobRole} role at ${jobCompany}. ${jobDesc ? jobDesc.split(".")[0] + "." : ""} I'd love to contribute to your next chapter.

Over the past six years I've shipped consumer and B2B products end-to-end — from research and prototyping to design systems and launch.

I'd welcome the chance to talk about how I can help.

Sincerely,
Jordan Doe`;
}

export default function CoverLetterPage() {
  const { getJob, targetJobId, setTargetJobId } = useJobs();
  const { toast } = useToast();
  const targetJob = targetJobId ? getJob(targetJobId) : null;

  const [messages, setMessages] = useState<Message[]>([
    { role: "assistant", content: targetJob
      ? `Hi — I drafted a cover letter for ${targetJob.company} (${targetJob.role}) on the right. Want me to refine the tone, add specifics, or shorten it?`
      : "Hi — I drafted a starter cover letter on the right. Tell me what to refine, or paste a job below to tailor it." },
  ]);
  const [draft, setDraft] = useState("");
  const [letter, setLetter] = useState(
    targetJob ? letterFor(targetJob.company, targetJob.role, targetJob.description) : DEFAULT_LETTER,
  );
  const [zoom, setZoom] = useState(1);
  const [jobUrl, setJobUrl] = useState("");
  const [fetching, setFetching] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Clear target after consuming
  useEffect(() => {
    if (targetJobId) setTargetJobId(null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages]);

  const send = () => {
    const text = draft.trim();
    if (!text) return;
    setDraft("");
    setMessages((m) => [...m, { role: "user", content: text }]);
    setTimeout(() => {
      setMessages((m) => [...m, { role: "assistant", content: `Updated the letter with: "${text}". Take a look on the right.` }]);
      setLetter((prev) => prev + `\n\n[Edit reflecting: ${text}]`);
    }, 600);
  };

  const handleExport = (format: ExportFormat) => {
    const filename = targetJob ? `cover-letter-${targetJob.company}` : "cover-letter";
    exportAs(format, "Cover Letter", letter, filename);
  };

  const fetchFromUrl = async () => {
    if (!jobUrl.trim()) return;
    setFetching(true);
    try {
      const { data, error } = await supabase.functions.invoke("scrape-job", { body: { url: jobUrl.trim() } });
      if (error) throw error;
      if ((data as { error?: string })?.error) throw new Error((data as { error: string }).error);
      setLetter(letterFor(data.company || "the company", data.role || "this role", data.description || ""));
      setMessages((m) => [...m, { role: "assistant", content: `Drafted a letter for ${data.company} — ${data.role}.` }]);
      setJobUrl("");
      toast({ title: "Letter drafted", description: `Tailored for ${data.company}` });
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Failed";
      toast({ title: "Couldn't fetch job", description: msg, variant: "destructive" });
    } finally {
      setFetching(false);
    }
  };

  return (
    <div className="w-full">
      <div className="px-8 py-5 flex items-center justify-between border-b border-line bg-surface flex-wrap gap-3">
        <div>
          <h1 className="text-[24px] font-semibold text-ink">Cover Letter Builder</h1>
          <p className="text-[13px] text-ink-muted mt-0.5">
            {targetJob ? `For: ${targetJob.company} — ${targetJob.role}` : "Chat with AI to generate a customized cover letter."}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <ZoomControls zoom={zoom} onChange={setZoom} />
          <ExportMenu onExport={handleExport} />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2" style={{ minHeight: "calc(100vh - 64px - 81px)" }}>
        {/* Chat */}
        <section className="bg-surface border-r border-line p-8 flex flex-col" style={{ maxHeight: "calc(100vh - 64px - 81px)" }}>
          <div className="mb-4 card-surface p-4">
            <p className="eyebrow mb-2">Tailor to a job</p>
            <div className="flex gap-2">
              <input
                value={jobUrl}
                onChange={(e) => setJobUrl(e.target.value)}
                placeholder="Paste a job posting URL"
                className="input-base flex-1"
                disabled={fetching}
              />
              <button
                type="button"
                onClick={fetchFromUrl}
                disabled={fetching || !jobUrl.trim()}
                className="h-11 px-4 rounded-full bg-brand text-primary-foreground text-[12px] font-bold uppercase tracking-[0.08em] inline-flex items-center gap-2 transition-opacity duration-200 hover:opacity-90 disabled:opacity-60"
              >
                {fetching ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
                {fetching ? "…" : "Add Job"}
              </button>
            </div>
          </div>

          <div ref={scrollRef} className="flex-1 overflow-y-auto pr-1 space-y-3">
            {messages.map((m, i) => (
              <div key={i} className={m.role === "user" ? "flex justify-end" : "flex justify-start"}>
                <div className={m.role === "user"
                  ? "max-w-[80%] rounded-2xl px-4 py-3 text-[14px] bg-brand text-primary-foreground"
                  : "max-w-[80%] rounded-2xl px-4 py-3 text-[14px] bg-surface-2 text-ink"}>
                  {m.content}
                </div>
              </div>
            ))}
          </div>

          <div className="pt-5 mt-5 border-t border-line">
            <div className="flex gap-2">
              <input
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter") send(); }}
                placeholder="Ask for a change..."
                className="input-base flex-1"
              />
              <button
                type="button"
                onClick={send}
                aria-label="Send"
                className="h-11 w-11 rounded-full bg-brand text-primary-foreground grid place-items-center transition-opacity duration-200 hover:opacity-90"
              >
                <Send className="h-4 w-4" />
              </button>
            </div>
            <p className="text-[12px] text-ink-muted mt-2">Try: "Make it more formal" or "Add more about leadership"</p>
          </div>
        </section>

        {/* Preview */}
        <section className="bg-popover p-10 overflow-auto" style={{ maxHeight: "calc(100vh - 64px - 81px)" }}>
          <div style={{ transform: `scale(${zoom})`, transformOrigin: "top left", width: `${100 / zoom}%` }}>
            <article className="max-w-[640px] mx-auto w-full">
              <pre className="whitespace-pre-wrap font-sans text-[14px] text-ink leading-relaxed">{letter}</pre>
            </article>
          </div>
        </section>
      </div>
    </div>
  );
}
