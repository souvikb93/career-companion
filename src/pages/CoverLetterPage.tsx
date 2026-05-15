import { useEffect, useRef, useState } from "react";
import { Send, Loader2, Save, FolderOpen, Pencil, Check, FilePlus, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { MobileActionsMenu } from "@/components/MobileActionsMenu";
import { SegmentedControl } from "@/components/SegmentedControl";
import { useJobs } from "@/lib/jobs-store";
import { ZoomControls } from "@/components/ZoomControls";
import { ExportMenu } from "@/components/ExportMenu";
import { SavedCVsPanel } from "@/components/SavedCVsPanel";
import { SaveModal } from "@/components/SaveModal";
import { LayoutMenu, LayoutVariant, loadLayout } from "@/components/LayoutMenu";
import { useSavedLetters } from "@/lib/saved-items";
import { exportAs, ExportFormat } from "@/lib/exporters";
import { generateCoverLetter, editCoverLetter, scrapeJobFromUrl, lookupCompanyAddress, letterContentToText, type LetterContent } from "@/lib/groq";
import { useProfile } from "@/lib/profile-store";
import { useToast } from "@/hooks/use-toast";
import { useT } from "@/lib/i18n";
import { loadFromStorage, saveToStorage } from "@/lib/storage";
import { isUrl } from "@/lib/utils";

interface Message { role: "user" | "assistant"; content: string; chips?: string[] }
interface LetterDoc { letter: LetterContent | null; jobLabel?: string }
type GenPhase = "idle" | "askEmphasis" | "askTone";

// Versioned key — old v1 had greetings embedded in messages; v2 stores only conversation
const LETTER_DRAFT_KEY = "tracka_letter_draft";
const LETTER_MSGS_KEY = "tracka_letter_msgs_v2";

const LOREM = "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.";

const BLOCKED_PLATFORMS = ["linkedin.com", "indeed.com", "glassdoor.com", "stepstone.de", "stepstone.com", "xing.com"];
const isBlockedPlatform = (url: string) => BLOCKED_PLATFORMS.some((p) => url.toLowerCase().includes(p));

const EMPHASIS_CHIPS: Record<"en" | "de", string[]> = {
  en: ["Technical skills", "Leadership experience", "Creative work", "Industry expertise", "Passion for the company"],
  de: ["Technische Fähigkeiten", "Führungserfahrung", "Kreative Arbeit", "Branchenexpertise", "Begeisterung für das Unternehmen"],
};
const TONE_CHIPS: Record<"en" | "de", string[]> = {
  en: ["Professional", "Warm & Friendly", "Confident", "Concise"],
  de: ["Professionell", "Herzlich", "Selbstbewusst", "Prägnant"],
};

type TFn = (path: string, vars?: Record<string, string | number>) => string;
// "hidden" → "typing1" → "msg1" → "typing2" → "msg2"
type IntroPhase = "hidden" | "typing1" | "msg1" | "typing2" | "msg2";

function seedLetter(t: TFn, lang: "de" | "en", jobCompany: string, jobRole: string): LetterContent {
  const today = new Date().toLocaleDateString(lang === "de" ? "de-DE" : "en-US", { year: "numeric", month: "long", day: "numeric" });
  return {
    companyName: jobCompany,
    companyAddress: [],
    senderName: t("letter.tmpl_signature"),
    senderAddress: [],
    senderEmail: "",
    senderPhone: "",
    date: today,
    subject: `Application for ${jobRole}`,
    salutation: t("letter.tmpl_dear"),
    body: [
      t("letter.tmpl_intro", { role: jobRole, company: jobCompany, firstSentence: "" }),
      t("letter.tmpl_body"),
      t("letter.tmpl_close"),
    ],
    signoff: "Sincerely,",
  };
}

function TypingIndicator() {
  return (
    <div className="flex justify-start">
      <div className="rounded-2xl px-4 py-3.5 bg-surface-2 flex items-center gap-[5px]">
        <span className="w-[7px] h-[7px] rounded-full bg-ink-muted animate-typing-dot [animation-delay:0ms]" />
        <span className="w-[7px] h-[7px] rounded-full bg-ink-muted animate-typing-dot [animation-delay:160ms]" />
        <span className="w-[7px] h-[7px] rounded-full bg-ink-muted animate-typing-dot [animation-delay:320ms]" />
      </div>
    </div>
  );
}

export default function CoverLetterPage() {
  const { getJob, targetJobId, setTargetJobId } = useJobs();
  const { profile } = useProfile();
  const { toast } = useToast();
  const { t, lang } = useT();
  const targetJob = targetJobId ? getJob(targetJobId) : null;

  const cvForLetter = () => ({
    fullName: profile.fullName || "",
    title: profile.title || "",
    email: profile.email || "",
    phone: profile.phone || "",
    location: profile.location || "",
    linkedin: profile.linkedin || "",
    summary: profile.summary || "",
    experiences: profile.experiences || [],
    skills: profile.skills || [],
    customInstructions: profile.customInstructions || "",
  });

  // Conversation messages (greetings live separately via introPhase)
  const [messages, setMessages] = useState<Message[]>(
    () => loadFromStorage<Message[]>(LETTER_MSGS_KEY) ?? []
  );
  const [draft, setDraft] = useState("");
  const [letter, setLetter] = useState<LetterContent | null>(
    () => loadFromStorage<LetterContent>(LETTER_DRAFT_KEY) ??
      (targetJob ? seedLetter(t, lang, targetJob.company, targetJob.role) : null)
  );
  const [generating, setGenerating] = useState(false);
  const [introPhase, setIntroPhase] = useState<IntroPhase>("hidden");

  useEffect(() => { saveToStorage(LETTER_DRAFT_KEY, letter); }, [letter]);
  useEffect(() => { saveToStorage(LETTER_MSGS_KEY, messages); }, [messages]);

  const [zoom, setZoom] = useState<number>(() =>
    typeof window !== "undefined" && window.innerWidth < 1024
      ? Math.max(0.35, (window.innerWidth - 40) / 794)
      : 0.6
  );
  const [hoverPreview, setHoverPreview] = useState(false);
  const [letterEditing, setLetterEditing] = useState(false);

  const patchLetter = (patch: Partial<LetterContent>) =>
    setLetter((prev) => prev ? { ...prev, ...patch } : prev);
  const [mobileTab, setMobileTab] = useState<"chat" | "preview">("chat");
  const [savedOpen, setSavedOpen] = useState(false);
  const [saveOpen, setSaveOpen] = useState(false);
  const [newLetterId, setNewLetterId] = useState<string | undefined>(undefined);
  const [showNewModal, setShowNewModal] = useState(false);
  const [layout, setLayoutState] = useState<LayoutVariant>(() => loadLayout("letter_layout"));
  const setLayout = (v: LayoutVariant) => {
    setLayoutState(v);
    try { window.localStorage.setItem("letter_layout", v); } catch { /* ignore */ }
  };

  const { list: savedLetters, save: saveLetter, remove: removeLetter } = useSavedLetters<LetterDoc>();
  const [genPhase, setGenPhase] = useState<GenPhase>("idle");

  const scrollRef = useRef<HTMLDivElement>(null);
  const desktopScrollRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const introTimers = useRef<ReturnType<typeof setTimeout>[]>([]);
  const didMount = useRef(false);

  const runIntro = () => {
    introTimers.current.forEach(clearTimeout);
    setIntroPhase("hidden");
    introTimers.current = [
      setTimeout(() => setIntroPhase("typing1"), 200),
      setTimeout(() => setIntroPhase("msg1"),    900),
      setTimeout(() => setIntroPhase("typing2"), 1350),
      setTimeout(() => setIntroPhase("msg2"),    2350),
    ];
  };

  // Mount: play intro on first visit, skip animation on return visits
  useEffect(() => {
    if (messages.length === 0) {
      runIntro();
    } else {
      setIntroPhase("msg2");
    }
    didMount.current = true;
    return () => introTimers.current.forEach(clearTimeout);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Lang change: re-animate greetings only if no conversation yet
  useEffect(() => {
    if (!didMount.current) return;
    if (messages.length === 0) runIntro();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lang]);

  // Auto-generate when launched from a job card
  useEffect(() => {
    if (targetJob) {
      setMessages([{ role: "assistant", content: t("letter.draftedFor", { company: targetJob.company, role: targetJob.role }) }]);
      (async () => {
        const address = (targetJob.company ? await lookupCompanyAddress(targetJob.company) : "") || targetJob.location || "";
        try {
          const aiLetter = await generateCoverLetter(
            cvForLetter(),
            targetJob.description,
            targetJob.company,
            targetJob.role,
            address,
          );
          setLetter(aiLetter);
        } catch { /* ignore */ }
      })();
    }
    if (targetJobId) setTargetJobId(null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
    desktopScrollRef.current?.scrollTo({ top: desktopScrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, introPhase, generating]);

  const adjustTextareaHeight = () => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = Math.min(el.scrollHeight, 160) + "px";
  };

  const resetTextarea = () => {
    if (textareaRef.current) textareaRef.current.style.height = "auto";
  };

  const handleExport = (format: ExportFormat) => {
    const filename = targetJob ? `cover-letter-${targetJob.company}` : "cover-letter";
    exportAs(format, "Cover Letter", letter ? letterContentToText(letter) : "", filename);
  };

  const hasLetterContent = () => letter !== null || messages.length > 0;

  const handleNew = () => {
    if (!hasLetterContent()) return;
    setShowNewModal(true);
  };

  const doReset = () => {
    setLetter(null);
    setMessages([]);
    try {
      window.localStorage.removeItem(LETTER_DRAFT_KEY);
      window.localStorage.removeItem(LETTER_MSGS_KEY);
    } catch { /* ignore */ }
    setShowNewModal(false);
  };

  const send = async (overrideText?: string) => {
    const text = (overrideText ?? draft).trim();
    if (!text || generating) return;
    if (!overrideText) {
      setDraft("");
      resetTextarea();
    }
    setMessages((m) => [...m, { role: "user", content: text }]);
    setGenerating(true);
    const emphasisChips = EMPHASIS_CHIPS[lang];
    const toneChips = TONE_CHIPS[lang];

    try {
      if (genPhase === "askEmphasis") {
        const updated = await editCoverLetter(letter!, `Please adjust the letter to especially emphasize: ${text}.`);
        setLetter(updated);
        setMessages((m) => [
          ...m,
          { role: "assistant", content: t("letter.emphasisAck") },
          { role: "assistant", content: t("letter.askTone"), chips: toneChips },
        ]);
        setGenPhase("askTone");
      } else if (genPhase === "askTone") {
        const updated = await editCoverLetter(letter!, `Please adjust the tone of the letter to be: ${text}.`);
        setLetter(updated);
        setMessages((m) => [...m, { role: "assistant", content: t("letter.toneAck") }]);
        setGenPhase("idle");
      } else if (isUrl(text)) {
        if (isBlockedPlatform(text)) {
          try {
            const data = await scrapeJobFromUrl(text);
            const description = data.description || "";
            const company = data.company || "";
            const role = data.role || "";
            const addr = data.companyAddress || (company ? await lookupCompanyAddress(company) : "") || data.location || "";
            const aiLetter = await generateCoverLetter(cvForLetter(), description, company || "the company", role || "this role", addr);
            setLetter(aiLetter);
            setMessages((m) => [
              ...m,
              { role: "assistant", content: t("letter.draftedShort", { company, role }) },
              { role: "assistant", content: t("letter.askEmphasis"), chips: emphasisChips },
            ]);
            setGenPhase("askEmphasis");
          } catch {
            setMessages((m) => [...m, { role: "assistant", content: t("letter.blockedPlatformMsg") }]);
          }
        } else {
          const data = await scrapeJobFromUrl(text);
          const description = data.description || "";
          const company = data.company || "";
          const role = data.role || "";
          const addr = data.companyAddress || (company ? await lookupCompanyAddress(company) : "") || data.location || "";
          const aiLetter = await generateCoverLetter(cvForLetter(), description, company || "the company", role || "this role", addr);
          setLetter(aiLetter);
          setMessages((m) => [
            ...m,
            { role: "assistant", content: t("letter.draftedShort", { company, role }) },
            { role: "assistant", content: t("letter.askEmphasis"), chips: emphasisChips },
          ]);
          setGenPhase("askEmphasis");
          toast({ title: t("letter.drafted"), description: t("letter.tailoredFor", { company }) });
        }
      } else if (!letter) {
        const companyMatch = text.match(/(?:for|at|with|@|from)\s+([A-Z][A-Za-z0-9&\s.]{1,30}?)(?:\s+as\b|\s+for\b|\s*[,.]|$)/i)
          || text.match(/^([A-Z][A-Za-z0-9&]{2,})/);
        const company = companyMatch?.[1]?.trim() || "";
        const roleMatch = text.match(/(?:as|for\s+(?:a\s+|an\s+)?)([A-Za-z][A-Za-z\s]{3,30}?)(?:\s+at\b|\s+in\b|\s*[,.]|$)/i);
        const role = roleMatch?.[1]?.trim() || "";
        const address = company ? await lookupCompanyAddress(company) : "";
        const aiLetter = await generateCoverLetter(cvForLetter(), text, company || "the company", role || "this role", address);
        setLetter(aiLetter);
        setMessages((m) => [
          ...m,
          {
            role: "assistant",
            content: company
              ? t("letter.draftedShort", { company, role: role || "this role" })
              : t("letter.draftedFor", { company: "the company", role: "this role" }),
          },
          { role: "assistant", content: t("letter.askEmphasis"), chips: emphasisChips },
        ]);
        setGenPhase("askEmphasis");
      } else {
        const updated = await editCoverLetter(letter, text);
        setLetter(updated);
        setMessages((m) => [...m, { role: "assistant", content: t("letter.updatedWith", { text }) }]);
      }
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Failed";
      setMessages((m) => [...m, { role: "assistant", content: t("letter.cantFetchMsg", { msg }) }]);
    } finally {
      setGenerating(false);
    }
  };

  return (
    <>
    <div className="w-full flex flex-col h-[calc(100dvh-64px)] lg:h-auto lg:block">
      {/* Mobile header */}
      <div className="lg:hidden shrink-0 px-4 py-4 flex items-center justify-between border-b border-white/50 bg-white/30 backdrop-blur-md glass-card">
        <div className="min-w-0 flex-1">
          <h1 className="heading-1">{t("letter.pageTitle")}</h1>
          {targetJob && (
            <p className="text-[13px] text-ink-muted mt-0.5 truncate">{targetJob.company} — {targetJob.role}</p>
          )}
        </div>
        <MobileActionsMenu
          onNew={handleNew}
          onSave={() => setSaveOpen(true)}
          layout={layout}
          onLayoutChange={setLayout}
          onExport={handleExport}
          onLibrary={() => setSavedOpen(true)}
        />
      </div>

      {/* Mobile segmented control */}
      <div className="lg:hidden shrink-0 px-4 py-3 bg-white/30 backdrop-blur-md glass-card border-b border-white/50">
        <SegmentedControl
          options={[
            { value: "chat", label: t("letter.tabChat") },
            { value: "preview", label: t("letter.tabPreview") },
          ]}
          value={mobileTab}
          onChange={setMobileTab}
        />
      </div>

      {/* ── Mobile content area — full remaining height, keyboard-aware ── */}
      <div className="lg:hidden flex-1 min-h-0">
        {/* Chat tab */}
        {mobileTab === "chat" && (
          <div className="h-full flex flex-col bg-white/20 backdrop-blur-md glass-editor">
            <div ref={scrollRef} className="flex-1 min-h-0 overflow-y-auto overscroll-contain px-4 pt-4 pb-2 space-y-5">
              {introPhase === "typing1" && <TypingIndicator />}
              {(introPhase === "msg1" || introPhase === "typing2" || introPhase === "msg2") && (
                <div className={`flex justify-start ${introPhase === "msg1" ? "animate-msg-in" : ""}`}>
                  <div className="max-w-[80%] rounded-2xl px-4 py-3 text-[14px] bg-surface-2 text-ink">{t("letter.greetingMsg1")}</div>
                </div>
              )}
              {introPhase === "typing2" && <TypingIndicator />}
              {introPhase === "msg2" && (
                <div className="flex justify-start animate-msg-in">
                  <div className="max-w-[80%] rounded-2xl px-4 py-3 text-[14px] bg-surface-2 text-ink">{t("letter.greetingMsg2")}</div>
                </div>
              )}
              {(() => {
                const lastChipIdx = messages.reduce((acc, m, i) => m.chips?.length ? i : acc, -1);
                return messages.map((m, i) => (
                  <div key={i} className={m.role === "user" ? "flex justify-end" : "flex justify-start"}>
                    <div className={m.role === "user" ? "max-w-[80%] rounded-2xl px-4 py-3 text-[14px] bg-brand text-primary-foreground" : "max-w-[80%] rounded-2xl px-4 py-3 text-[14px] bg-surface-2 text-ink"}>
                      {m.content.split("\n").map((line, li) => <span key={li}>{li > 0 && <br />}{line}</span>)}
                      {m.chips && i === lastChipIdx && genPhase !== "idle" && !generating && (
                        <div className="flex flex-wrap gap-2 mt-3">
                          {m.chips.map((chip) => (
                            <button key={chip} type="button" onClick={() => send(chip)} className="h-8 px-3 rounded-full border border-ink/20 bg-white/60 text-[13px] text-ink hover:bg-white hover:border-ink/40 transition-colors">{chip}</button>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                ));
              })()}
              {generating && <TypingIndicator />}
            </div>
            {/* Sticky input — stays above keyboard when it opens */}
            <div className="shrink-0 px-4 pt-3 border-t border-line pb-safe">
              <div className="flex gap-2 items-end">
                <textarea
                  ref={textareaRef}
                  value={draft}
                  onChange={(e) => { setDraft(e.target.value); adjustTextareaHeight(); }}
                  onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(); } }}
                  placeholder={letter ? t("letter.askChange") : t("letter.inputPlaceholder")}
                  rows={1}
                  disabled={generating}
                  className="chat-input flex-1"
                  style={{ touchAction: "manipulation" }}
                />
                <button type="button" onClick={send} disabled={generating || !draft.trim()} aria-label={t("common.send")} className="h-11 w-11 shrink-0 rounded-full bg-ink text-white active-fill grid place-items-center transition-colors duration-200 ease-out hover:bg-brand active:bg-brand disabled:opacity-40 disabled:cursor-not-allowed">
                  {generating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Preview tab */}
        {mobileTab === "preview" && (
          <div className="h-full overflow-y-auto overscroll-contain flex justify-center px-4 pt-6 pb-8 bg-white/10">
            <div style={{ width: `${794 * zoom}px`, height: `${1123 * zoom}px` }}>
              <article
                className={"document-canvas bg-white text-ink font-sans shadow-xl origin-top-left relative overflow-hidden " + (layout === "compact" ? "letter-page-compact" : "letter-page")}
                style={{ width: "794px", minHeight: "1123px", transform: `scale(${zoom})` }}
              >
                {layout === "modern" && <div className="absolute left-0 top-0 bottom-0 w-3 bg-brand" />}
                <div style={{ paddingLeft: layout === "modern" ? "20px" : undefined }}>
                  {letter === null ? (
                    <>
                      <div className="letter-head-row"><div className="letter-recipient"><div className="letter-recipient-name">{t("letter.ph_companyName")}</div><div className="letter-meta">{t("letter.ph_companyStreet")}</div><div className="letter-meta">{t("letter.ph_companyCity")}</div></div><div className="letter-sender-block"><div className="letter-sender-name">{t("letter.ph_yourName")}</div><div className="letter-meta">{t("letter.ph_yourEmail")}</div><div className="letter-meta">{t("letter.ph_yourPhone")}</div><div className="letter-meta">{t("letter.ph_yourCity")}</div></div></div>
                      <div className="letter-date">{t("letter.ph_date")}</div>
                      <div className="letter-subject">{t("letter.ph_subject")}</div>
                      <div className="letter-salutation">{t("letter.ph_dear")}</div>
                      <p className="letter-body">{LOREM}</p><p className="letter-body">{LOREM}</p><p className="letter-body">{LOREM}</p>
                      <div className="letter-signoff">{t("letter.ph_sincerely")}</div>
                      <div className="letter-signature">{t("letter.ph_yourName")}</div>
                    </>
                  ) : (
                    <>
                      <div className="letter-head-row">
                        <div className="letter-recipient">
                          {letter.companyName && <div className="letter-recipient-name">{letter.companyName}</div>}
                          {letter.companyAddress.filter(Boolean).map((line, i) => <div key={i} className="letter-meta">{line}</div>)}
                        </div>
                        <div className="letter-sender-block">
                          {letter.senderName && <div className="letter-sender-name">{letter.senderName}</div>}
                          {letter.senderEmail && <div className="letter-meta">{letter.senderEmail}</div>}
                          {letter.senderPhone && <div className="letter-meta">{letter.senderPhone}</div>}
                          {letter.senderAddress.filter(Boolean).map((line, i) => <div key={i} className="letter-meta">{line}</div>)}
                        </div>
                      </div>
                      {letter.date && <div className="letter-date">{letter.date}</div>}
                      {letter.subject && <div className="letter-subject">{letter.subject}</div>}
                      {letter.salutation && <div className="letter-salutation">{letter.salutation}</div>}
                      {letter.body.filter(Boolean).map((p, i) => <p key={i} className="letter-body">{p}</p>)}
                      {letter.signoff && <div className="letter-signoff">{letter.signoff}</div>}
                      {letter.senderName && <div className="letter-signature">{letter.senderName}</div>}
                    </>
                  )}
                </div>
              </article>
            </div>
          </div>
        )}
      </div>

      {/* Desktop header */}
      <div className="hidden lg:flex px-8 py-5 items-center justify-between border-b border-white/50 flex-wrap gap-3 bg-white/30 backdrop-blur-md glass-card">
        <div>
          <h1 className="heading-1">{t("letter.pageTitle")}</h1>
          {targetJob && (
            <p className="text-[13px] text-ink-muted mt-0.5">{t("letter.forJob", { label: `${targetJob.company} — ${targetJob.role}` })}</p>
          )}
        </div>
        <div className="flex items-center gap-3">
          <button type="button" onClick={handleNew} className="btn-ghost">
            <FilePlus className="h-4 w-4" /> {t("common.newDoc")}
          </button>
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
        onClose={() => { setSavedOpen(false); setNewLetterId(undefined); }}
        title={t("letter.libraryTitle")}
        newItemId={newLetterId}
        list={savedLetters}
        onLoad={(item) => {
          const raw = item.data.letter as unknown;
          if (raw && typeof raw === "object") {
            setLetter(raw as LetterContent);
          } else if (typeof raw === "string") {
            setLetter({
              companyName: "",
              companyAddress: [],
              senderName: profile.fullName || "",
              senderAddress: [],
              senderEmail: profile.email || "",
              senderPhone: profile.phone || "",
              date: "",
              subject: "",
              salutation: "",
              body: (raw as string).split(/\n{2,}/),
              signoff: "",
            });
          } else {
            setLetter(null);
          }
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
        onSave={async (name) => {
          try {
            const item = await saveLetter(name, { letter, jobLabel: targetJob?.company });
            setNewLetterId(item.id);
            setSavedOpen(true);
          } catch {
            toast({ title: t("letter.cantFetch"), variant: "destructive" });
          }
        }}
      />

      <div className="hidden lg:grid lg:grid-cols-2 lg:min-h-[calc(100vh-64px-81px)]">

        {/* ── Chat panel ─────────────────────────────────── */}
        <section className="border-r border-white/50 flex flex-col bg-white/20 backdrop-blur-md glass-editor lg:max-h-[calc(100vh-64px-81px)]">
          {/* Messages */}
          <div ref={desktopScrollRef} className="flex-1 overflow-y-auto px-6 pt-6 pb-4 space-y-5">

            {/* Greeting intro sequence — always from t(), never stored */}
            {introPhase === "typing1" && <TypingIndicator />}

            {(introPhase === "msg1" || introPhase === "typing2" || introPhase === "msg2") && (
              <div className={`flex justify-start ${introPhase === "msg1" ? "animate-msg-in" : ""}`}>
                <div className="max-w-[80%] rounded-2xl px-4 py-3 text-[14px] bg-surface-2 text-ink">
                  {t("letter.greetingMsg1")}
                </div>
              </div>
            )}

            {introPhase === "typing2" && <TypingIndicator />}

            {introPhase === "msg2" && (
              <div className="flex justify-start animate-msg-in">
                <div className="max-w-[80%] rounded-2xl px-4 py-3 text-[14px] bg-surface-2 text-ink">
                  {t("letter.greetingMsg2")}
                </div>
              </div>
            )}

            {/* Conversation */}
            {(() => {
              const lastChipIdx = messages.reduce((acc, m, i) => m.chips?.length ? i : acc, -1);
              return messages.map((m, i) => (
                <div key={i} className={m.role === "user" ? "flex justify-end" : "flex justify-start"}>
                  <div className={
                    m.role === "user"
                      ? "max-w-[80%] rounded-2xl px-4 py-3 text-[14px] bg-brand text-primary-foreground"
                      : "max-w-[80%] rounded-2xl px-4 py-3 text-[14px] bg-surface-2 text-ink"
                  }>
                    {m.content.split("\n").map((line, li) => (
                      <span key={li}>{li > 0 && <br />}{line}</span>
                    ))}
                    {m.chips && i === lastChipIdx && genPhase !== "idle" && !generating && (
                      <div className="flex flex-wrap gap-2 mt-3">
                        {m.chips.map((chip) => (
                          <button
                            key={chip}
                            type="button"
                            onClick={() => send(chip)}
                            className="h-8 px-3 rounded-full border border-ink/20 bg-white/60 text-[13px] text-ink hover:bg-white hover:border-ink/40 transition-colors"
                          >
                            {chip}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ));
            })()}

            {/* Typing indicator while generating */}
            {generating && <TypingIndicator />}
          </div>

          {/* Input */}
          <div className="px-6 pb-6 pt-3 border-t border-line">
            <div className="flex gap-2 items-end">
              <textarea
                ref={textareaRef}
                value={draft}
                onChange={(e) => { setDraft(e.target.value); adjustTextareaHeight(); }}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    send();
                  }
                }}
                placeholder={letter ? t("letter.askChange") : t("letter.inputPlaceholder")}
                rows={1}
                disabled={generating}
                className="chat-input flex-1"
              />
              <button
                type="button"
                onClick={send}
                disabled={generating || !draft.trim()}
                aria-label={t("common.send")}
                className="h-11 w-11 shrink-0 rounded-full bg-ink text-white active-fill grid place-items-center transition-colors duration-200 ease-out hover:bg-brand active:bg-brand disabled:opacity-40 disabled:cursor-not-allowed"
              >
                {generating
                  ? <Loader2 className="h-4 w-4 animate-spin" />
                  : <Send className="h-4 w-4" />}
              </button>
            </div>
          </div>
        </section>

        {/* ── Preview panel ───────────────────────────────── */}
        <div
          className="relative lg:max-h-[calc(100vh-64px-81px)]"
          onMouseEnter={() => setHoverPreview(true)}
          onMouseLeave={() => setHoverPreview(false)}
        >
          {/* Edit affordance badge */}
          {letter && (
            <button
              type="button"
              onClick={() => (document.activeElement as HTMLElement)?.blur()}
              className={cn(
                "absolute top-5 right-6 z-10 flex items-center gap-1.5 h-7 px-3 rounded-full text-[12px] font-medium transition-all duration-200 cursor-default",
                letterEditing
                  ? "bg-brand text-white opacity-100 cursor-pointer"
                  : hoverPreview
                    ? "bg-white/80 backdrop-blur-sm border border-white/50 text-ink-muted opacity-100"
                    : "opacity-0 pointer-events-none",
              )}
            >
              {letterEditing
                ? <><Check className="h-3 w-3" /> Done</>
                : <><Pencil className="h-3 w-3" /> Edit</>
              }
            </button>
          )}

          <section
            className="bg-transparent px-6 pt-6 pb-24 overflow-auto h-full flex justify-center lg:max-h-[calc(100vh-64px-81px)]"
          >
            <div
              className={cn(
                "transition-[box-shadow] duration-200 rounded-sm",
                letterEditing
                  ? "shadow-[0_0_0_2px_hsl(var(--brand)/0.5)]"
                  : hoverPreview && letter
                    ? "shadow-[0_0_0_1px_hsl(var(--brand)/0.25)]"
                    : "",
              )}
              style={{ width: `${794 * zoom}px`, height: `${1123 * zoom}px` }}
            >
              <article
                className={cn(
                  "document-canvas bg-white text-ink font-sans shadow-2xl origin-top-left relative overflow-hidden outline-none",
                  layout === "compact" ? "letter-page-compact" : "letter-page",
                )}
                style={{ width: "794px", minHeight: "1123px", transform: `scale(${zoom})` }}
                onFocus={() => letter && setLetterEditing(true)}
                onBlur={(e) => {
                  if (!e.currentTarget.contains(e.relatedTarget as Node)) {
                    setLetterEditing(false);
                  }
                }}
              >
                {layout === "modern" && (
                  <div className="absolute left-0 top-0 bottom-0 w-3 bg-brand" />
                )}
                <div style={{ paddingLeft: layout === "modern" ? "20px" : undefined }}>
                  {letter === null ? (
                    <>
                      <div className="letter-head-row">
                        <div className="letter-recipient">
                          <div className="letter-recipient-name">{t("letter.ph_companyName")}</div>
                          <div className="letter-meta">{t("letter.ph_companyStreet")}</div>
                          <div className="letter-meta">{t("letter.ph_companyCity")}</div>
                        </div>
                        <div className="letter-sender-block">
                          <div className="letter-sender-name">{t("letter.ph_yourName")}</div>
                          <div className="letter-meta">{t("letter.ph_yourEmail")}</div>
                          <div className="letter-meta">{t("letter.ph_yourPhone")}</div>
                          <div className="letter-meta">{t("letter.ph_yourCity")}</div>
                        </div>
                      </div>
                      <div className="letter-date">{t("letter.ph_date")}</div>
                      <div className="letter-subject">{t("letter.ph_subject")}</div>
                      <div className="letter-salutation">{t("letter.ph_dear")}</div>
                      <p className="letter-body">{LOREM}</p>
                      <p className="letter-body">{LOREM}</p>
                      <p className="letter-body">{LOREM}</p>
                      <div className="letter-signoff">{t("letter.ph_sincerely")}</div>
                      <div className="letter-signature">{t("letter.ph_yourName")}</div>
                    </>
                  ) : (
                    <>
                      <div className="letter-head-row">
                        <div className="letter-recipient">
                          {letter.companyName && (
                            <div
                              className="letter-recipient-name outline-none"
                              contentEditable suppressContentEditableWarning
                              onBlur={(e) => patchLetter({ companyName: e.currentTarget.innerText })}
                            >{letter.companyName}</div>
                          )}
                          {letter.companyAddress.filter(Boolean).map((line, i) => (
                            <div
                              key={i}
                              className="letter-meta outline-none"
                              contentEditable suppressContentEditableWarning
                              onBlur={(e) => {
                                const addr = [...letter.companyAddress];
                                addr[i] = e.currentTarget.innerText;
                                patchLetter({ companyAddress: addr });
                              }}
                            >{line}</div>
                          ))}
                        </div>
                        <div className="letter-sender-block">
                          {letter.senderName && (
                            <div
                              className="letter-sender-name outline-none"
                              contentEditable suppressContentEditableWarning
                              onBlur={(e) => patchLetter({ senderName: e.currentTarget.innerText })}
                            >{letter.senderName}</div>
                          )}
                          {letter.senderEmail && (
                            <div
                              className="letter-meta outline-none"
                              contentEditable suppressContentEditableWarning
                              onBlur={(e) => patchLetter({ senderEmail: e.currentTarget.innerText })}
                            >{letter.senderEmail}</div>
                          )}
                          {letter.senderPhone && (
                            <div
                              className="letter-meta outline-none"
                              contentEditable suppressContentEditableWarning
                              onBlur={(e) => patchLetter({ senderPhone: e.currentTarget.innerText })}
                            >{letter.senderPhone}</div>
                          )}
                          {letter.senderAddress.filter(Boolean).map((line, i) => (
                            <div
                              key={i}
                              className="letter-meta outline-none"
                              contentEditable suppressContentEditableWarning
                              onBlur={(e) => {
                                const addr = [...letter.senderAddress];
                                addr[i] = e.currentTarget.innerText;
                                patchLetter({ senderAddress: addr });
                              }}
                            >{line}</div>
                          ))}
                        </div>
                      </div>
                      {letter.date && (
                        <div
                          className="letter-date outline-none"
                          contentEditable suppressContentEditableWarning
                          onBlur={(e) => patchLetter({ date: e.currentTarget.innerText })}
                        >{letter.date}</div>
                      )}
                      {letter.subject && (
                        <div
                          className="letter-subject outline-none"
                          contentEditable suppressContentEditableWarning
                          onBlur={(e) => patchLetter({ subject: e.currentTarget.innerText })}
                        >{letter.subject}</div>
                      )}
                      {letter.salutation && (
                        <div
                          className="letter-salutation outline-none"
                          contentEditable suppressContentEditableWarning
                          onBlur={(e) => patchLetter({ salutation: e.currentTarget.innerText })}
                        >{letter.salutation}</div>
                      )}
                      {letter.body.filter(Boolean).map((p, i) => (
                        <p
                          key={i}
                          className="letter-body outline-none"
                          contentEditable suppressContentEditableWarning
                          onBlur={(e) => {
                            const body = [...letter.body];
                            body[i] = e.currentTarget.innerText;
                            patchLetter({ body });
                          }}
                        >{p}</p>
                      ))}
                      {letter.signoff && (
                        <div
                          className="letter-signoff outline-none"
                          contentEditable suppressContentEditableWarning
                          onBlur={(e) => patchLetter({ signoff: e.currentTarget.innerText })}
                        >{letter.signoff}</div>
                      )}
                      {letter.senderName && (
                        <div
                          className="letter-signature outline-none"
                          contentEditable suppressContentEditableWarning
                          onBlur={(e) => patchLetter({ senderName: e.currentTarget.innerText })}
                        >{letter.senderName}</div>
                      )}
                    </>
                  )}
                </div>
              </article>
            </div>
          </section>

          <div
            className={
              "hidden lg:block absolute bottom-8 right-6 z-10 transition-all duration-200 " +
              (hoverPreview ? "opacity-100 translate-y-0" : "opacity-0 translate-y-1 pointer-events-none")
            }
          >
            <ZoomControls zoom={zoom} onChange={setZoom} floating />
          </div>
        </div>
      </div>
    </div>

    {/* Unsaved-changes modal */}
    {showNewModal && (
      <div className="fixed inset-0 z-[70] flex items-center justify-center px-4">
        <div className="absolute inset-0 bg-ink/40 backdrop-blur-sm" onClick={() => setShowNewModal(false)} />
        <div className="relative glass-modal w-full max-w-[380px] p-6 animate-in fade-in zoom-in-95 duration-200">
          <button
            type="button"
            onClick={() => setShowNewModal(false)}
            aria-label={t("common.close")}
            className="absolute top-4 right-4 h-8 w-8 rounded-full grid place-items-center text-ink-muted hover:text-ink hover:bg-black/[0.06] transition-colors duration-150"
          >
            <X className="h-4 w-4" />
          </button>
          <h3 className="text-[17px] font-semibold text-ink mb-1 pr-8">{t("common.unsavedTitle")}</h3>
          <p className="text-[14px] text-ink-muted leading-relaxed mb-5">{t("common.unsavedBody")}</p>
          <div className="flex gap-3">
            <button
              type="button"
              onClick={doReset}
              className="btn-ghost flex-1 justify-center"
            >
              {t("common.discardAndNew")}
            </button>
            <button
              type="button"
              onClick={() => { setShowNewModal(false); setSaveOpen(true); }}
              className="btn-primary flex-1 justify-center"
            >
              {t("common.saveAndNew")}
            </button>
          </div>
        </div>
      </div>
    )}
    </>
  );
}
