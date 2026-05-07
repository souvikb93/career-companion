import { useEffect, useRef, useState } from "react";
import { Send, Loader2, Sparkles, Save, FolderOpen, Check } from "lucide-react";
import { useJobs } from "@/lib/jobs-store";
import { ZoomControls } from "@/components/ZoomControls";
import { ExportMenu } from "@/components/ExportMenu";
import { SavedCVsPanel } from "@/components/SavedCVsPanel";
import { SaveModal } from "@/components/SaveModal";
import { LayoutMenu, LayoutVariant, loadLayout } from "@/components/LayoutMenu";
import { useSavedCVs } from "@/lib/saved-cvs";
import { exportAs, ExportFormat } from "@/lib/exporters";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useT } from "@/lib/i18n";

interface Message { role: "user" | "assistant" | "step"; content: string; done?: boolean }

interface LetterDoc { letter: string; jobLabel?: string }

const KEY = "saved_letters_v1";

const DEFAULT_LETTER = `__DEFAULT_TEMPLATE__`;

const LOREM = "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.";

type TFn = (path: string, vars?: Record<string, string | number>) => string;

function letterFor(t: TFn, lang: "de" | "en", jobCompany: string, jobRole: string, jobDesc: string) {
  const today = new Date().toLocaleDateString(lang === "de" ? "de-DE" : "en-US", { year: "numeric", month: "long", day: "numeric" });
  const firstSentence = jobDesc ? jobDesc.split(".")[0] + "." : "";
  return `${today}

${t("letter.tmpl_hiringTeam")}
${jobCompany}

${t("letter.tmpl_dear")}

${t("letter.tmpl_intro", { role: jobRole, company: jobCompany, firstSentence })}

${t("letter.tmpl_body")}

${t("letter.tmpl_close")}

${t("letter.tmpl_signature")}`;
}

const wait = (ms: number) => new Promise((r) => setTimeout(r, ms));

export default function CoverLetterPage() {
  const { getJob, targetJobId, setTargetJobId } = useJobs();
  const { toast } = useToast();
  const { t, lang } = useT();
  const targetJob = targetJobId ? getJob(targetJobId) : null;

  const [messages, setMessages] = useState<Message[]>([]);
  const [draft, setDraft] = useState("");
  const [letter, setLetter] = useState(
    targetJob ? letterFor(t, lang, targetJob.company, targetJob.role, targetJob.description) : DEFAULT_LETTER,
  );
  const [zoom, setZoom] = useState(0.6);
  const [jobUrl, setJobUrl] = useState("");
  const [fetching, setFetching] = useState(false);
  const [showTailor, setShowTailor] = useState(true);
  const [hoverPreview, setHoverPreview] = useState(false);
  const [savedOpen, setSavedOpen] = useState(false);
  const [saveOpen, setSaveOpen] = useState(false);
  const [layout, setLayoutState] = useState<LayoutVariant>(() => loadLayout("letter_layout"));
  const setLayout = (v: LayoutVariant) => {
    setLayoutState(v);
    try { window.localStorage.setItem("letter_layout", v); } catch { /* ignore */ }
  };
  const { list: savedLetters, save: saveLetter, remove: removeLetter } = useSavedCVs<LetterDoc>("saved_letters_v2", () => {
    const daysAgo = (n: number) => new Date(Date.now() - n * 86400000).toISOString();
    const lbl = t("letter.defaultSaveName");
    const seeds: Array<{ company: string; role: string; desc: string; days: number }> = [
      { company: "Zalando", role: "Senior Product Designer", desc: "Shape the future of European fashion commerce across web and mobile", days: 2 },
      { company: "Delivery Hero", role: "Product Engineer", desc: "Build delightful ordering experiences for millions of customers", days: 4 },
      { company: "N26", role: "Product Designer", desc: "Design money tools that feel calm, clear, and trustworthy", days: 6 },
      { company: "FlixBus", role: "Brand Designer", desc: "Bring the FlixBus brand to life across every passenger touchpoint", days: 8 },
      { company: "Bolt", role: "Frontend Engineer", desc: "Ship polished, accessible frontends for our rider and driver apps", days: 9 },
      { company: "GetYourGuide", role: "Senior Engineer", desc: "Help travellers discover and book unforgettable experiences", days: 11 },
    ];
    return seeds.map((s, i) => ({
      id: `demo-letter-${i + 1}`,
      name: `${lbl} — ${s.company}, ${s.role}`,
      savedAt: daysAgo(s.days),
      data: { letter: letterFor(t, lang, s.company, s.role, s.desc), jobLabel: `${s.company} — ${s.role}` },
    }));
  });
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => { void KEY; }, []);

  useEffect(() => {
    if (targetJob) {
      setMessages([{ role: "assistant", content: t("letter.draftedFor", { company: targetJob.company, role: targetJob.role }) }]);
      setShowTailor(false);
    }
    if (targetJobId) setTargetJobId(null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages]);

  const pushStep = async (label: string) => {
    setMessages((m) => [...m, { role: "step", content: label, done: false }]);
    await wait(700);
    setMessages((m) => m.map((x, i) => (i === m.length - 1 ? { ...x, done: true } : x)));
  };

  const handleExport = (format: ExportFormat) => {
    const filename = targetJob ? `cover-letter-${targetJob.company}` : "cover-letter";
    exportAs(format, "Cover Letter", letter, filename);
  };

  const send = async () => {
    const text = draft.trim();
    if (!text) return;
    setDraft("");
    setShowTailor(false);
    setMessages((m) => [...m, { role: "user", content: text }]);

    await pushStep(t("letter.analyzing"));
    await pushStep(t("letter.matching"));
    await pushStep(t("letter.generating"));

    setMessages((m) => [...m, { role: "assistant", content: t("letter.updatedWith", { text }) }]);
    setLetter((prev) => prev + `\n\n[Edit reflecting: ${text}]`);
  };

  const fetchFromUrl = async () => {
    if (!jobUrl.trim()) return;
    setFetching(true);
    setShowTailor(false);
    setMessages((m) => [...m, { role: "user", content: t("letter.tailorTo", { url: jobUrl.trim() }) }]);
    try {
      await pushStep(t("letter.connecting"));
      await pushStep(t("letter.extracting"));
      const { data, error } = await supabase.functions.invoke("scrape-job", { body: { url: jobUrl.trim() } });
      if (error) throw error;
      if ((data as { error?: string })?.error) throw new Error((data as { error: string }).error);
      await pushStep(t("letter.matchingSkills"));
      await pushStep(t("letter.generatingDraft"));
      setLetter(letterFor(data.company || "the company", data.role || "this role", data.description || ""));
      setMessages((m) => [...m, { role: "assistant", content: t("letter.draftedShort", { company: data.company, role: data.role }) }]);
      setJobUrl("");
      toast({ title: t("letter.drafted"), description: t("letter.tailoredFor", { company: data.company }) });
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Failed";
      setMessages((m) => [...m, { role: "assistant", content: t("letter.cantFetchMsg", { msg }) }]);
      toast({ title: t("letter.cantFetch"), description: msg, variant: "destructive" });
      setShowTailor(true);
    } finally {
      setFetching(false);
    }
  };

  return (
    <div className="w-full">
      <div className="px-8 py-5 flex items-center justify-between border-b border-line bg-surface flex-wrap gap-3">
        <div>
          <h1 className="text-[24px] font-semibold text-ink">{t("letter.pageTitle")}</h1>
          {targetJob && (
            <p className="text-[13px] text-ink-muted mt-0.5">{t("letter.forJob", { label: `${targetJob.company} — ${targetJob.role}` })}</p>
          )}
        </div>
        <div className="flex items-center gap-3">
          <button type="button" onClick={() => setSaveOpen(true)} className="btn-ghost">
            <Save className="h-4 w-4" /> {t("common.save")}
          </button>
          <LayoutMenu value={layout} onChange={setLayout} />
          <button type="button" onClick={() => setSavedOpen(true)} className="btn-ghost">
            <FolderOpen className="h-4 w-4" /> {t("common.library")}
          </button>
          <ExportMenu onExport={handleExport} />
        </div>
      </div>

      <SavedCVsPanel
        open={savedOpen}
        onClose={() => setSavedOpen(false)}
        title={t("letter.libraryTitle")}
        list={savedLetters}
        onLoad={(item) => {
          setLetter(item.data.letter);
          setSavedOpen(false);
          toast({ title: t("letter.loaded"), description: item.name });
        }}
        onDelete={(id) => removeLetter(id)}
      />

      <SaveModal
        open={saveOpen}
        onClose={() => setSaveOpen(false)}
        title={t("letter.saveTitle")}
        defaultName={targetJob ? `${t("letter.defaultSaveName")} — ${targetJob.company}` : t("letter.defaultSaveName")}
        onSave={(name, format) => {
          const item = saveLetter(name, { letter, jobLabel: targetJob?.company });
          handleExport(format);
          toast({ title: t("letter.saved"), description: `${item.name} · ${format.toUpperCase()}` });
        }}
      />

      <div className="grid grid-cols-1 lg:grid-cols-2" style={{ minHeight: "calc(100vh - 64px - 81px)" }}>
        {/* Chat */}
        <section className="bg-surface border-r border-line p-8 flex flex-col" style={{ maxHeight: "calc(100vh - 64px - 81px)" }}>
          <div className="mb-6">
            <h2 className="text-[22px] font-semibold text-ink leading-snug">
              {t("letter.greetingTitle")}
            </h2>
            <p className="text-[15px] text-ink-muted mt-1">{t("letter.greetingBody")}</p>
          </div>

          {showTailor && (
            <div className="mb-4 card-surface p-4">
              <p className="eyebrow mb-2">{t("letter.tailorToJob")}</p>
              <div className="flex gap-2">
                <input
                  value={jobUrl}
                  onChange={(e) => setJobUrl(e.target.value)}
                  placeholder={t("letter.pasteUrl")}
                  className="input-base flex-1"
                  disabled={fetching}
                />
                <button
                  type="button"
                  onClick={fetchFromUrl}
                  disabled={fetching || !jobUrl.trim()}
                  className="btn-primary"
                >
                  {fetching ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
                  {fetching ? "…" : t("letter.tailor")}
                </button>
              </div>
            </div>
          )}

          <div ref={scrollRef} className="flex-1 overflow-y-auto pr-1 space-y-3">
            {messages.map((m, i) => {
              if (m.role === "step") {
                return (
                  <div key={i} className="flex justify-start">
                    <div className="inline-flex items-center gap-2 rounded-full bg-surface-2 px-3 py-1.5 text-[12px] text-ink-muted">
                      {m.done
                        ? <Check className="h-3.5 w-3.5 text-success" />
                        : <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                      {m.content}
                    </div>
                  </div>
                );
              }
              return (
                <div key={i} className={m.role === "user" ? "flex justify-end" : "flex justify-start"}>
                  <div className={m.role === "user"
                    ? "max-w-[80%] rounded-2xl px-4 py-3 text-[14px] bg-brand text-primary-foreground"
                    : "max-w-[80%] rounded-2xl px-4 py-3 text-[14px] bg-surface-2 text-ink"}>
                    {m.content}
                  </div>
                </div>
              );
            })}
          </div>

          <div className="pt-5 mt-5 border-t border-line">
            <div className="flex gap-2">
              <input
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter") send(); }}
                placeholder={t("letter.askChange")}
                className="input-base flex-1"
              />
              <button
                type="button"
                onClick={send}
                aria-label={t("common.send")}
                className="h-11 w-11 rounded-full bg-ink text-white grid place-items-center transition-colors duration-200 ease-out hover:bg-brand active:bg-brand"
              >
                <Send className="h-4 w-4" />
              </button>
            </div>
          </div>
        </section>

        {/* Preview */}
        <div
          className="relative"
          style={{ maxHeight: "calc(100vh - 64px - 81px)" }}
          onMouseEnter={() => setHoverPreview(true)}
          onMouseLeave={() => setHoverPreview(false)}
        >
          <section
            className="bg-transparent px-6 pt-6 pb-24 overflow-auto h-full flex justify-center"
            style={{ maxHeight: "calc(100vh - 64px - 81px)" }}
          >
            <div
              style={{ width: `${794 * zoom}px`, height: `${1123 * zoom}px` }}
            >
              <article
                className="bg-white text-ink shadow-2xl origin-top-left relative overflow-hidden"
                style={{
                  width: "794px",
                  minHeight: "1123px",
                  padding: layout === "compact" ? "40px" : "64px",
                  transform: `scale(${zoom})`,
                }}
              >
                {layout === "modern" && (
                  <div className="absolute left-0 top-0 bottom-0 w-3 bg-brand" />
                )}
                <div style={{ paddingLeft: layout === "modern" ? "32px" : undefined }}>
                {letter === DEFAULT_LETTER ? (
                  <div className={"font-sans text-ink " + (layout === "compact" ? "text-[13px] leading-snug space-y-4" : "text-[14px] leading-relaxed space-y-6")}>
                    <div className="flex justify-between gap-8">
                      <div className="space-y-1 text-ink-muted">
                        <div>{t("letter.ph_companyName")}</div>
                        <div>{t("letter.ph_companyStreet")}</div>
                        <div>{t("letter.ph_companyCity")}</div>
                      </div>
                      <div className="space-y-1 text-right text-ink-muted">
                        <div>{t("letter.ph_yourName")}</div>
                        <div>{t("letter.ph_yourStreet")}</div>
                        <div>{t("letter.ph_yourCity")}</div>
                        <div>{t("letter.ph_yourEmail")}</div>
                        <div>{t("letter.ph_yourPhone")}</div>
                      </div>
                    </div>
                    <div className="text-ink-muted">{t("letter.ph_date")}</div>
                    <div className="text-ink-muted">{t("letter.ph_subject")}</div>
                    <div>{t("letter.ph_dear")}</div>
                    <p>{LOREM}</p>
                    <p>{LOREM}</p>
                    <div>
                      <div>{t("letter.ph_sincerely")}</div>
                      <div className="text-ink-muted">{t("letter.ph_yourName")}</div>
                    </div>
                  </div>
                ) : (
                  <pre className={"whitespace-pre-wrap font-sans text-ink " + (layout === "compact" ? "text-[13px] leading-snug" : "text-[14px] leading-relaxed")}>{letter}</pre>
                )}
                </div>
              </article>
            </div>
          </section>

          <div
            className={
              "absolute bottom-8 right-6 z-10 transition-all duration-200 " +
              (hoverPreview ? "opacity-100 translate-y-0" : "opacity-0 translate-y-1 pointer-events-none")
            }
          >
            <ZoomControls zoom={zoom} onChange={setZoom} floating />
          </div>
        </div>
      </div>
    </div>
  );
}
