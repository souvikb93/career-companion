import { useEffect, useRef, useState } from "react";
import { Plus, Loader2, X, AlertCircle } from "lucide-react";
import { useJobs } from "@/lib/jobs-store";
import { scrapeJobFromUrl, parseJobFromText } from "@/lib/groq";
import type { Job } from "@/lib/jobs-data";
import { useToast } from "@/hooks/use-toast";
import { useT } from "@/lib/i18n";
import { cn } from "@/lib/utils";

interface AddJobModalProps {
  open: boolean;
  onClose: () => void;
  onJobAdded?: (job: Job) => void;
}

type Stage = "input" | "loading" | "review";

interface JobDraft {
  company: string;
  role: string;
  location: string;
  salary: string;
  description: string;
  link: string;
}

const EMPTY_DRAFT: JobDraft = {
  company: "", role: "", location: "", salary: "", description: "", link: "",
};

function isUrl(input: string): boolean {
  const s = input.trim();
  if (s.includes("\n") || s.includes(" ")) return false;
  try {
    new URL(/^https?:\/\//i.test(s) ? s : `https://${s}`);
    return /\.[a-z]{2,}/i.test(s);
  } catch {
    return false;
  }
}

export function AddJobModal({ open, onClose, onJobAdded }: AddJobModalProps) {
  const { t } = useT();
  const { addJob } = useJobs();
  const { toast } = useToast();

  const justFocused = useRef(false);

  useEffect(() => {
    if (!open) return;
    const onFocus = () => {
      justFocused.current = true;
      setTimeout(() => { justFocused.current = false; }, 300);
    };
    window.addEventListener("focus", onFocus);
    return () => window.removeEventListener("focus", onFocus);
  }, [open]);

  const [stage, setStage] = useState<Stage>("input");
  const [input, setInput] = useState("");
  const [inputError, setInputError] = useState(false);
  const [fetchFailed, setFetchFailed] = useState(false);
  const [draft, setDraft] = useState<JobDraft>(EMPTY_DRAFT);
  const [aiMissed, setAiMissed] = useState<Set<keyof JobDraft>>(new Set());
  const [fieldErrors, setFieldErrors] = useState<Set<keyof JobDraft>>(new Set());

  if (!open) return null;

  const close = () => {
    setStage("input");
    setInput("");
    setInputError(false);
    setFetchFailed(false);
    setDraft(EMPTY_DRAFT);
    setAiMissed(new Set());
    setFieldErrors(new Set());
    onClose();
  };

  const goManual = () => {
    setDraft({ ...EMPTY_DRAFT, link: isUrl(input.trim()) ? input.trim() : "" });
    setAiMissed(new Set());
    setFieldErrors(new Set());
    setFetchFailed(false);
    setStage("review");
  };

  const analyse = async () => {
    const raw = input.trim();
    if (!raw) { setInputError(true); return; }
    setInputError(false);
    setFetchFailed(false);
    setStage("loading");

    try {
      let result: JobDraft;

      if (isUrl(raw)) {
        const normalized = /^https?:\/\//i.test(raw) ? raw : `https://${raw}`;
        try {
          const data = await scrapeJobFromUrl(normalized);
          result = {
            company: data.company || "",
            role: data.role || "",
            location: data.location || "",
            salary: data.salary || "",
            description: data.description || "",
            link: data.link || normalized,
          };
        } catch {
          // URL fetch failed — stay in input stage, show inline error
          setFetchFailed(true);
          setStage("input");
          return;
        }
      } else {
        const parsed = await parseJobFromText(raw);
        result = {
          company: parsed.company || "",
          role: parsed.role || "",
          location: parsed.location || "",
          salary: parsed.salary || "",
          description: parsed.description || "",
          link: "",
        };
      }

      const missed = new Set<keyof JobDraft>();
      (Object.keys(result) as (keyof JobDraft)[]).forEach((k) => {
        if (!result[k]) missed.add(k);
      });

      setDraft(result);
      setAiMissed(missed);
      setFieldErrors(new Set());
      setStage("review");
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Failed to read job details";
      toast({ title: t("addJob.cantRead"), description: msg, variant: "destructive" });
      setStage("input");
    }
  };

  const save = () => {
    const errors = new Set<keyof JobDraft>();
    if (!draft.company.trim()) errors.add("company");
    if (!draft.role.trim()) errors.add("role");

    if (errors.size > 0) {
      setFieldErrors(errors);
      return;
    }

    const job: Job = {
      id: crypto.randomUUID(),
      company: draft.company.trim(),
      role: draft.role.trim(),
      location: draft.location.trim(),
      salary: draft.salary.trim(),
      description: draft.description.trim(),
      notes: "",
      status: "saved",
      link: draft.link.trim(),
      dateAdded: new Date().toISOString().slice(0, 10),
    };
    addJob(job);
    onJobAdded?.(job);
    close();
  };

  const field = (k: keyof JobDraft) => ({
    value: draft[k],
    onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      setDraft((d) => ({ ...d, [k]: e.target.value }));
      if (fieldErrors.has(k) && e.target.value.trim()) {
        setFieldErrors((prev) => { const n = new Set(prev); n.delete(k); return n; });
      }
    },
    className: cn(
      "input-base",
      fieldErrors.has(k) && "!border-red-500 focus:!border-red-500"
    ),
  });

  const ph = (k: keyof JobDraft, fallback: string) =>
    aiMissed.has(k) && !draft[k] ? "Unknown" : fallback;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
      <div
        className="absolute inset-0 modal-backdrop animate-panel-in"
        onClick={() => { if (!justFocused.current) close(); }}
      />
      <div className="relative w-full max-w-[500px] glass-modal p-5 sm:p-8 max-h-[90dvh] overflow-y-auto overscroll-contain scroll-smooth animate-modal-in">
        <button
          type="button"
          onClick={close}
          className="absolute top-4 right-4 h-9 w-9 grid place-items-center rounded-full text-ink-muted hover:text-ink hover:bg-surface-2 transition-colors"
        >
          <X className="h-4 w-4" />
        </button>

        {/* ── INPUT ── */}
        {stage === "input" && (
          <>
            <h2 className="text-[22px] font-semibold text-ink mb-1">
              {fetchFailed ? t("addJob.fetchFailed") : t("addJob.title")}
            </h2>
            <p className="text-[13px] text-ink-muted mb-5">
              {fetchFailed ? t("addJob.fetchFailedSubtitle") : t("addJob.subtitle")}
            </p>

            <textarea
              autoFocus
              rows={6}
              value={input}
              onChange={(e) => {
                setInput(e.target.value);
                if (inputError) setInputError(false);
                if (fetchFailed) setFetchFailed(false);
              }}
              placeholder={t("addJob.urlPlaceholder")}
              className={cn(
                "textarea-base",
                inputError ? "border-red-400 focus:border-red-400" : ""
              )}
            />

            {inputError && (
              <p className="text-[12px] text-red-500 mt-1.5">{t("addJob.emptyError")}</p>
            )}

            {!fetchFailed && (
              <div className="flex gap-2 mt-3 p-3 rounded-xl bg-surface-2 border border-line">
                <AlertCircle className="h-4 w-4 text-ink-muted shrink-0 mt-0.5" />
                <p className="text-[12px] text-ink-muted leading-relaxed">
                  {t("addJob.blockedNote")}
                </p>
              </div>
            )}

            <div className="mt-6 flex gap-3">
              <button type="button" onClick={goManual} className="btn-ghost flex-1 justify-center">
                {t("addJob.enterManually")}
              </button>
              <button type="button" onClick={analyse} className="btn-primary flex-1 justify-center">
                <Plus className="h-4 w-4" />
                {t("addJob.analyse")}
              </button>
            </div>
          </>
        )}

        {/* ── LOADING ── */}
        {stage === "loading" && (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <div className="h-14 w-14 rounded-2xl bg-surface-2 grid place-items-center mb-6">
              <Loader2 className="h-6 w-6 text-brand animate-spin" />
            </div>
            <h2 className="text-[18px] font-semibold text-ink mb-1">{t("addJob.analysing")}</h2>
            <p className="text-[13px] text-ink-muted">{t("addJob.analysingDesc")}</p>
          </div>
        )}

        {/* ── REVIEW ── */}
        {stage === "review" && (
          <>
            <h2 className="text-[22px] font-semibold text-ink mb-1">{t("addJob.reviewTitle")}</h2>
            <p className="text-[13px] text-ink-muted mb-5">
              {aiMissed.size > 0 ? t("addJob.reviewSomeMissed") : t("addJob.reviewAllGood")}
            </p>

            <div className="space-y-3">
              <FieldRow label={t("addJob.company")} required error={fieldErrors.has("company")}>
                <input placeholder={ph("company", "e.g. Acme GmbH")} {...field("company")} />
                {fieldErrors.has("company") && (
                  <p className="text-[11px] text-red-500 mt-1">{t("addJob.fieldRequired")}</p>
                )}
              </FieldRow>

              <FieldRow label={t("addJob.role")} required error={fieldErrors.has("role")}>
                <input placeholder={ph("role", "e.g. Product Designer")} {...field("role")} />
                {fieldErrors.has("role") && (
                  <p className="text-[11px] text-red-500 mt-1">{t("addJob.fieldRequired")}</p>
                )}
              </FieldRow>

              <div className="grid grid-cols-2 gap-3">
                <FieldRow label={t("addJob.location")}>
                  <input placeholder={ph("location", "Berlin / Remote")} {...field("location")} />
                </FieldRow>
                <FieldRow label={t("addJob.salary")}>
                  <input placeholder={ph("salary", "€60k–80k")} {...field("salary")} />
                </FieldRow>
              </div>

              <FieldRow label={t("addJob.link")}>
                <input placeholder={ph("link", "https://…")} {...field("link")} />
              </FieldRow>
            </div>

            <div className="mt-6 flex gap-3">
              <button type="button" onClick={() => setStage("input")} className="btn-ghost flex-1 justify-center">
                {t("addJob.back")}
              </button>
              <button type="button" onClick={save} className="btn-primary flex-1 justify-center">
                <Plus className="h-4 w-4" />
                {t("addJob.addJob")}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

function FieldRow({
  label, required, error, children,
}: {
  label: string;
  required?: boolean;
  error?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div>
      <div className="flex items-center gap-1 mb-1">
        <label className={cn("field-label !mb-0", error && "text-red-500")}>{label}</label>
        {required && <span className="text-[13px] font-semibold text-brand leading-none -mt-0.5">*</span>}
      </div>
      {children}
    </div>
  );
}
