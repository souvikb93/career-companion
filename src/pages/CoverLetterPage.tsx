import { useEffect, useRef, useState } from "react";
import { Send, Loader2, Save, FolderOpen, Pencil, Check, FilePlus, X, SlidersHorizontal, Download, MoreHorizontal, Minus, Plus } from "lucide-react";
import { DocumentStyle, DocTheme, DocSize, DocDensity, DocPage, loadDocStyle, saveDocStyle, DOC_THEMES_META, DOC_SIZES_META, DOC_DENSITIES_META, DOC_PAGE_META, systemPageMode, useDocPageSync } from "@/lib/document-theme";
import { CustomizePanel } from "@/components/CustomizePanel";
import { cn } from "@/lib/utils";
import { MobileActionsMenu } from "@/components/MobileActionsMenu";
import { SegmentedControl } from "@/components/SegmentedControl";
import { useJobs } from "@/lib/jobs-store";
import { SavedCVsPanel } from "@/components/SavedCVsPanel";
import { SaveModal } from "@/components/SaveModal";
import { DownloadModal } from "@/components/DownloadModal";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "@/components/ui/material-ui-dropdown-menu";
import { useSavedLetters } from "@/lib/saved-items";
import { ExportFormat } from "@/lib/exporters";
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
  const articleRef = useRef<HTMLElement>(null);
  const firstEditRef = useRef<HTMLTextAreaElement>(null);

  const enterEditMode = () => {
    setLetterEditing(true);
    // Focus the first editable field after the DOM switches to edit view
    setTimeout(() => firstEditRef.current?.focus(), 50);
  };

  const exitEditMode = () => {
    setLetterEditing(false);
  };

  const patchLetter = (patch: Partial<LetterContent>) =>
    setLetter((prev) => prev ? { ...prev, ...patch } : prev);
  const [mobileTab, setMobileTab] = useState<"chat" | "preview">("chat");
  const [savedOpen, setSavedOpen] = useState(false);
  const [saveOpen, setSaveOpen] = useState(false);
  const [downloadOpen, setDownloadOpen] = useState(false);
  const [downloadData, setDownloadData] = useState<{ letter: LetterContent; name: string } | null>(null);
  const [newLetterId, setNewLetterId] = useState<string | undefined>(undefined);
  const [showNewModal, setShowNewModal] = useState(false);
  const [docStyle, setDocStyle] = useState<DocumentStyle>(() => {
    const stored = loadDocStyle();
    const hasStoredPage = (() => {
      try { const raw = localStorage.getItem("tracka_doc_style"); return raw ? "page" in JSON.parse(raw) : false; } catch { return false; }
    })();
    return hasStoredPage ? stored : { ...stored, page: systemPageMode() };
  });
  const [customizeOpen, setCustomizeOpen] = useState(false);

  const handleDocStyleChange = (style: DocumentStyle) => {
    setDocStyle(style);
    saveDocStyle(style);
  };

  useDocPageSync((page) => {
    setDocStyle((prev) => {
      const next = { ...prev, page };
      saveDocStyle(next);
      return next;
    });
  });

  const buildLetterFilename = (senderName?: string): string => {
    const suffix = t("letter.downloadSuffix");
    const name = (senderName || profile.fullName || "").trim();
    return name ? name.replace(/\s+/g, "_") + "_" + suffix : suffix;
  };

  const handleDownloadCurrentLetter = () => {
    if (!letter) {
      toast({ title: t("letter.downloadPlaceholderToast"), description: t("letter.downloadPlaceholderToastDesc") });
      return;
    }
    setDownloadData({ letter, name: buildLetterFilename(letter.senderName) });
    setDownloadOpen(true);
  };

  const handleExportLetter = (format: ExportFormat, filename: string) => {
    if (!downloadData) return { title: "", body: "" };
    const body = downloadData.letter ? letterContentToText(downloadData.letter) : "";
    return { title: "Cover Letter", body };
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

  const handleDownloadLetter = (doc: LetterDoc, name: string) => {
    if (!doc.letter) return;
    setDownloadData({ letter: doc.letter, name: buildLetterFilename(doc.letter.senderName) });
    setDownloadOpen(true);
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
    <div className="w-full flex flex-col h-[calc(100dvh-64px)] lg:h-[calc(100vh-64px)] lg:overflow-hidden">
      {/* Mobile header */}
      <div className="lg:hidden shrink-0 px-4 py-4 flex items-center justify-between glass-bar">
        <div className="min-w-0 flex-1">
          <h1 className="heading-1">{t("letter.pageTitle")}</h1>
          {targetJob && (
            <p className="text-[13px] text-ink-muted mt-0.5 truncate">{targetJob.company} — {targetJob.role}</p>
          )}
        </div>
        <MobileActionsMenu
          onNew={handleNew}
          onSave={() => setSaveOpen(true)}
          onLibrary={() => setSavedOpen(true)}
          onCustomize={() => setCustomizeOpen(true)}
          onDownload={() => handleDownloadCurrentLetter()}
          zoom={zoom}
          onZoom={setZoom}
        />
      </div>

      {/* Mobile segmented control */}
      <div className="lg:hidden shrink-0 px-4 py-3 glass-bar">
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
                            <button key={chip} type="button" onClick={() => send(chip)} className="chip-suggestion">{chip}</button>
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
                <button type="button" onClick={send} disabled={generating} aria-label={t("common.send")} className="h-11 w-11 shrink-0 rounded-full btn-icon-primary shadow-sm shadow-ink/10">
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
                className="document-canvas bg-white text-ink font-sans shadow-xl origin-top-left relative overflow-hidden letter-page"
                data-doc-theme={docStyle.theme}
                data-doc-size={docStyle.size}
                data-doc-density={docStyle.density}
                data-doc-page={docStyle.page}
                style={{ width: "794px", minHeight: "1123px", transform: `scale(${zoom})` }}
              >
                {letter === null ? (
                  <>
                    <div className="letter-head-row"><div className="letter-recipient"><div className="letter-recipient-name">{t("letter.ph_companyName")}</div><div className="letter-meta">{t("letter.ph_companyStreet")}</div><div className="letter-meta">{t("letter.ph_companyCity")}</div></div><div className="letter-sender-block"><div className="letter-sender-name">{profile.fullName || t("letter.ph_yourName")}</div><div className="letter-meta">{profile.email || t("letter.ph_yourEmail")}</div><div className="letter-meta">{profile.phone || t("letter.ph_yourPhone")}</div><div className="letter-meta">{profile.location || t("letter.ph_yourCity")}</div></div></div>
                    <div className="letter-date">{t("letter.ph_date")}</div>
                    <div className="letter-subject">{t("letter.ph_subject")}</div>
                    <div className="letter-salutation">{t("letter.ph_dear")}</div>
                    <p className="letter-body">{LOREM}</p><p className="letter-body">{LOREM}</p><p className="letter-body">{LOREM}</p>
                    <div className="letter-signoff">{t("letter.ph_sincerely")}</div>
                    <div className="letter-signature">{profile.fullName || t("letter.ph_yourName")}</div>
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
              </article>
            </div>
          </div>
        )}
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
        onDownload={(item) => handleDownloadLetter(item.data, item.name)}
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

      {/* Download Modal */}
      <DownloadModal
        open={downloadOpen}
        onClose={() => {
          setDownloadOpen(false);
          setDownloadData(null);
        }}
        title={t("letter.downloadTitle")}
        defaultName={downloadData?.name || letter?.companyName || t("letter.defaultSaveName")}
        documentType="letter"
        onExport={handleExportLetter}
      />

      {/* ── Desktop 3-column layout ── */}
      <div
        className="hidden lg:grid lg:h-[calc(100vh-64px)]"
        style={{
          gridTemplateColumns: customizeOpen ? "1fr 1.5fr 280px" : "1fr 1fr 0px",
          transition: "grid-template-columns 320ms cubic-bezier(0.22, 1, 0.36, 1)",
        }}
      >

        {/* ── Chat column ─── */}
        <div className="glass-editor flex flex-col h-[calc(100vh-64px)] border-r glass-rule">
          {/* Desktop fixed header — title + actions */}
          <div className="shrink-0 px-8 pt-8 pb-6 border-b glass-rule">
            <h1 className="heading-1 mb-6">{t("letter.pageTitle")}</h1>
            {targetJob && (
              <p className="text-[13px] text-ink-muted -mt-4 mb-6">{t("letter.forJob", { label: `${targetJob.company} — ${targetJob.role}` })}</p>
            )}
            <div className="flex items-center gap-2">
              <button type="button" onClick={handleNew} className="btn-ghost">
                <FilePlus className="h-4 w-4" /> {t("common.newDoc")}
              </button>
              <button type="button" onClick={() => setSaveOpen(true)} className="btn-ghost">
                <Save className="h-4 w-4" /> {t("common.save")}
              </button>
              {!customizeOpen && (
                <button
                  type="button"
                  onClick={() => setCustomizeOpen(true)}
                  className="btn-ghost"
                >
                  <SlidersHorizontal className="h-4 w-4" /> Design
                </button>
              )}
              <LetterMoreMenu
                customizeOpen={customizeOpen}
                onDesign={() => setCustomizeOpen((v) => !v)}
                onDownload={() => handleDownloadCurrentLetter()}
                onLibrary={() => setSavedOpen(true)}
                zoom={zoom}
                onZoom={setZoom}
              />
            </div>
          </div>

          {/* Scrollable chat section */}
          <section className="flex-1 min-h-0 flex flex-col">
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
                            className="chip-suggestion"
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
                disabled={generating}
                aria-label={t("common.send")}
                className="h-11 w-11 shrink-0 rounded-full btn-icon-primary shadow-sm shadow-ink/10"
              >
                {generating
                  ? <Loader2 className="h-4 w-4 animate-spin" />
                  : <Send className="h-4 w-4" />}
              </button>
            </div>
          </div>
        </section>
        </div>

        {/* ── Preview panel ───────────────────────────────── */}
        <div className="relative lg:h-[calc(100vh-64px)] overflow-hidden">

          {/* ── Done / Edit badge ── */}
          {letter && (
            <button
              type="button"
              onClick={() => letterEditing ? exitEditMode() : enterEditMode()}
              className={cn(
                "absolute top-5 right-6 z-10 flex items-center gap-1.5 h-7 px-3 rounded-full text-[12px] font-medium",
                letterEditing
                  ? "bg-brand text-white cursor-pointer shadow-sm"
                  : hoverPreview
                    ? "glass-float-badge cursor-pointer"
                    : "opacity-0 pointer-events-none",
              )}
              onMouseEnter={() => setHoverPreview(true)}
            >
              {letterEditing
                ? <><Check className="h-3 w-3" /> Done</>
                : <><Pencil className="h-3 w-3" /> Edit</>
              }
            </button>
          )}

          {/* ── VIEW mode — scaled read-only preview ── */}
          {!letterEditing && (
            <section
              className="bg-transparent px-6 pt-6 pb-24 overflow-auto h-full flex justify-center"
              onMouseEnter={() => setHoverPreview(true)}
              onMouseLeave={() => setHoverPreview(false)}
            >
              <div
                className={cn(
                  "transition-[box-shadow] duration-200 rounded-sm",
                  hoverPreview && letter ? "shadow-[0_0_0_1px_hsl(var(--brand)/0.25)] cursor-text" : "",
                )}
                style={{ width: `${794 * zoom}px`, height: `${1123 * zoom}px` }}
                onClick={() => letter && enterEditMode()}
                title={letter ? "Click to edit" : undefined}
              >
                <article
                  ref={articleRef}
                  className="document-canvas bg-white text-ink font-sans shadow-2xl origin-top-left relative overflow-hidden select-none pointer-events-none letter-page"
                  data-doc-theme={docStyle.theme}
                  data-doc-size={docStyle.size}
                  data-doc-density={docStyle.density}
                  data-doc-page={docStyle.page}
                  style={{ width: "794px", minHeight: "1123px", transform: `scale(${zoom})` }}
                >
                  {letter === null ? (
                    <>
                      <div className="letter-head-row"><div className="letter-recipient"><div className="letter-recipient-name">{t("letter.ph_companyName")}</div><div className="letter-meta">{t("letter.ph_companyStreet")}</div><div className="letter-meta">{t("letter.ph_companyCity")}</div></div><div className="letter-sender-block"><div className="letter-sender-name">{profile.fullName || t("letter.ph_yourName")}</div><div className="letter-meta">{profile.email || t("letter.ph_yourEmail")}</div><div className="letter-meta">{profile.phone || t("letter.ph_yourPhone")}</div><div className="letter-meta">{profile.location || t("letter.ph_yourCity")}</div></div></div>
                      <div className="letter-date">{t("letter.ph_date")}</div>
                      <div className="letter-subject">{t("letter.ph_subject")}</div>
                      <div className="letter-salutation">{t("letter.ph_dear")}</div>
                      <p className="letter-body">{LOREM}</p><p className="letter-body">{LOREM}</p><p className="letter-body">{LOREM}</p>
                      <div className="letter-signoff">{t("letter.ph_sincerely")}</div>
                      <div className="letter-signature">{profile.fullName || t("letter.ph_yourName")}</div>
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
                </article>
              </div>
            </section>
          )}

          {/* ── EDIT mode — full-size editable letter form ── */}
          {letterEditing && letter && (
            <section className="overflow-auto h-full px-6 pt-6 pb-24">
              <div className="document-canvas bg-white rounded-2xl shadow-2xl mx-auto font-sans text-ink"
                data-doc-theme={docStyle.theme}
                data-doc-size={docStyle.size}
                data-doc-density={docStyle.density}
                data-doc-page={docStyle.page}
                style={{ maxWidth: "680px", padding: "56px 56px 72px" }}
              >
                {/* Header: recipient + sender */}
                <div className="flex justify-between gap-8 mb-8">
                  <div className="space-y-1 flex-1 min-w-0">
                    <p className="text-[10px] font-medium text-ink-muted uppercase tracking-wide mb-1.5">Recipient</p>
                    <input
                      className="letter-edit-field w-full letter-recipient-name"
                      value={letter.companyName}
                      onChange={(e) => patchLetter({ companyName: e.target.value })}
                      placeholder="Company name"
                    />
                    {letter.companyAddress.map((line, i) => (
                      <input
                        key={i}
                        className="letter-edit-field w-full letter-meta"
                        value={line}
                        onChange={(e) => {
                          const addr = [...letter.companyAddress];
                          addr[i] = e.target.value;
                          patchLetter({ companyAddress: addr });
                        }}
                        placeholder={`Address line ${i + 1}`}
                      />
                    ))}
                  </div>
                  <div className="space-y-1 text-right flex-1 min-w-0">
                    <p className="text-[10px] font-medium text-ink-muted uppercase tracking-wide mb-1.5">Sender</p>
                    <input
                      ref={firstEditRef}
                      className="letter-edit-field w-full letter-sender-name text-right"
                      value={letter.senderName}
                      onChange={(e) => patchLetter({ senderName: e.target.value })}
                      placeholder="Your name"
                    />
                    <input
                      className="letter-edit-field w-full letter-meta text-right"
                      value={letter.senderEmail}
                      onChange={(e) => patchLetter({ senderEmail: e.target.value })}
                      placeholder="Email"
                    />
                    <input
                      className="letter-edit-field w-full letter-meta text-right"
                      value={letter.senderPhone}
                      onChange={(e) => patchLetter({ senderPhone: e.target.value })}
                      placeholder="Phone"
                    />
                    {letter.senderAddress.map((line, i) => (
                      <input
                        key={i}
                        className="letter-edit-field w-full letter-meta text-right"
                        value={line}
                        onChange={(e) => {
                          const addr = [...letter.senderAddress];
                          addr[i] = e.target.value;
                          patchLetter({ senderAddress: addr });
                        }}
                        placeholder={`Address line ${i + 1}`}
                      />
                    ))}
                  </div>
                </div>

                {/* Date */}
                <input
                  className="letter-edit-field letter-date mb-6"
                  value={letter.date}
                  onChange={(e) => patchLetter({ date: e.target.value })}
                  placeholder="Date"
                />

                {/* Subject */}
                <input
                  className="letter-edit-field w-full letter-subject mb-7"
                  value={letter.subject}
                  onChange={(e) => patchLetter({ subject: e.target.value })}
                  placeholder="Subject line"
                />

                {/* Salutation */}
                <input
                  className="letter-edit-field w-full letter-salutation mb-5"
                  value={letter.salutation}
                  onChange={(e) => patchLetter({ salutation: e.target.value })}
                  placeholder="Dear …,"
                />

                {/* Body paragraphs */}
                <textarea
                  className="letter-edit-field w-full letter-body resize-none"
                  rows={12}
                  value={letter.body.join("\n\n")}
                  onChange={(e) => patchLetter({ body: e.target.value.split(/\n{2,}/) })}
                  placeholder="Letter body…"
                  style={{ lineHeight: "1.7" }}
                />

                {/* Signoff */}
                <input
                  className="letter-edit-field letter-signoff mt-7"
                  value={letter.signoff}
                  onChange={(e) => patchLetter({ signoff: e.target.value })}
                  placeholder="Sincerely,"
                />

                {/* Signature */}
                <input
                  className="letter-edit-field letter-signature mt-10"
                  value={letter.senderName}
                  onChange={(e) => patchLetter({ senderName: e.target.value })}
                  placeholder="Your name"
                />
              </div>
            </section>
          )}
        </div>

        {/* ── Design panel — 3rd grid column, desktop only ── */}
        <div className={cn(
          "hidden lg:flex lg:flex-col h-[calc(100vh-64px)] overflow-hidden glass-editor",
          customizeOpen && "border-l glass-rule"
        )}>
          {/* Panel header with close button */}
          <div className={cn(
            "shrink-0 flex items-center justify-between px-6 pt-5 pb-4 border-b glass-rule transition-opacity duration-150",
            customizeOpen ? "opacity-100" : "opacity-0 pointer-events-none"
          )}>
            <p className="text-[15px] font-semibold text-ink">{t("design.panelTitle")}</p>
            <button
              type="button"
              onClick={() => setCustomizeOpen(false)}
              aria-label="Close design panel"
              className="h-8 w-8 rounded-full grid place-items-center text-ink-muted hover:text-ink hover:bg-surface-2 transition-colors duration-150"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
          <div
            className={cn(
              "flex-1 overflow-y-auto scrollbar-minimal transition-opacity duration-150",
              customizeOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
            )}
          >
            <DesignPanelContent style={docStyle} onChange={handleDocStyleChange} />
          </div>
        </div>

      </div>
    </div>

    {/* Unsaved-changes modal */}
    {showNewModal && (
      <div className="fixed inset-0 z-[70] flex items-center justify-center px-4">
        <div className="absolute inset-0 modal-backdrop" onClick={() => setShowNewModal(false)} />
        <div className="relative glass-modal w-full max-w-[380px] p-6 animate-in fade-in zoom-in-95 duration-200">
          <button
            type="button"
            onClick={() => setShowNewModal(false)}
            aria-label={t("common.close")}
            className="absolute top-4 right-4 h-8 w-8 rounded-full grid place-items-center text-ink-muted hover:text-ink hover:bg-black/[0.06] transition-colors duration-150"
          >
            <X className="h-4 w-4" />
          </button>
          <h3 className="modal-heading pr-8">{t("common.unsavedTitle")}</h3>
          <p className="modal-body">{t("common.unsavedBody")}</p>
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
    {/* Mobile only — fixed overlay */}
    <div className="lg:hidden">
      <CustomizePanel
        open={customizeOpen}
        onClose={() => setCustomizeOpen(false)}
        style={docStyle}
        onChange={handleDocStyleChange}
      />
    </div>
    </>
  );
}

interface LetterMoreMenuProps {
  customizeOpen: boolean;
  onDesign: () => void;
  onDownload: () => void;
  onLibrary: () => void;
  zoom: number;
  onZoom: (z: number) => void;
}

function LetterMoreMenu({ customizeOpen, onDesign, onDownload, onLibrary, zoom, onZoom }: LetterMoreMenuProps) {
  const { t } = useT();
  const [open, setOpen] = useState(false);
  const step = 0.1;
  const dec = () => onZoom(Math.max(0.3, Math.round((zoom - step) * 100) / 100));
  const inc = () => onZoom(Math.min(2.5, Math.round((zoom + step) * 100) / 100));
  const fit = () => onZoom(0.6);

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger className="btn-ghost">
        <MoreHorizontal className="h-4 w-4" /> More
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-56">
        {customizeOpen && (
          <>
            <DropdownMenuItem onSelect={() => { onDesign(); setOpen(false); }}>
              <SlidersHorizontal className="h-4 w-4 text-ink-muted" />
              Design
            </DropdownMenuItem>
            <DropdownMenuSeparator />
          </>
        )}
        <DropdownMenuItem onSelect={() => { onDownload(); setOpen(false); }}>
          <Download className="h-4 w-4 text-ink-muted" />
          {t("common.download")}
        </DropdownMenuItem>
        <DropdownMenuItem onSelect={() => { onLibrary(); setOpen(false); }}>
          <FolderOpen className="h-4 w-4 text-ink-muted" />
          {t("common.library")}
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        {/* Zoom row — plain div, does not close the dropdown on click */}
        <div className="px-2 py-2">
          <p className="text-[11px] font-semibold text-ink-muted uppercase tracking-wide px-1 mb-2">
            Zoom
          </p>
          <div className="flex items-center gap-1 rounded-xl bg-surface-2 p-1">
            <button
              type="button"
              onClick={dec}
              aria-label={t("common.zoomOut")}
              className="h-7 w-7 rounded-lg grid place-items-center text-ink-muted hover:text-ink hover:bg-black/[0.06] transition-colors duration-150"
            >
              <Minus className="h-3 w-3" />
            </button>
            <span className="flex-1 text-center text-[12px] font-medium text-ink tabular-nums select-none">
              {Math.round(zoom * 100)}%
            </span>
            <button
              type="button"
              onClick={inc}
              aria-label={t("common.zoomIn")}
              className="h-7 w-7 rounded-lg grid place-items-center text-ink-muted hover:text-ink hover:bg-black/[0.06] transition-colors duration-150"
            >
              <Plus className="h-3 w-3" />
            </button>
            <div className="w-px h-4 bg-line" />
            <button
              type="button"
              onClick={fit}
              className="px-2 h-7 rounded-lg text-[11px] font-medium text-ink-muted hover:text-ink hover:bg-black/[0.06] transition-colors duration-150"
            >
              Fit
            </button>
          </div>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

function DesignPanelContent({ style, onChange }: { style: DocumentStyle; onChange: (s: DocumentStyle) => void }) {
  const { t } = useT();
  const set = <K extends keyof DocumentStyle>(key: K, val: DocumentStyle[K]) =>
    onChange({ ...style, [key]: val });

  const THEME_LABELS: Record<DocTheme, { name: string; desc: string }> = {
    classic:   { name: t("design.classic"),   desc: t("design.classicDesc") },
    editorial: { name: t("design.editorial"), desc: t("design.editorialDesc") },
    modern:    { name: t("design.modern"),    desc: t("design.modernDesc") },
    minimal:   { name: t("design.minimal"),   desc: t("design.minimalDesc") },
  };

  const SIZE_LABELS: Record<string, string> = {
    s: t("design.sizeS"),
    m: t("design.sizeM"),
    l: t("design.sizeL"),
  };

  const DENSITY_LABELS: Record<string, string> = {
    compact: t("design.compact"),
    normal:  t("design.normal"),
    relaxed: t("design.relaxed"),
  };

  return (
    <div className="p-6 space-y-8">

      {/* Theme */}
      <div>
        <p className="text-[11px] font-semibold text-ink-muted uppercase tracking-wide mb-3">{t("design.theme")}</p>
        <div className="grid grid-cols-2 gap-2">
          {DOC_THEMES_META.map((th) => {
            const active = style.theme === th.id;
            const { name, desc } = THEME_LABELS[th.id];
            return (
              <button
                key={th.id}
                type="button"
                onClick={() => set("theme", th.id as DocTheme)}
                className={cn(
                  "p-3 rounded-2xl border text-left transition-all duration-180 tile-surface",
                  active
                    ? "border-brand text-brand"
                    : "border-transparent text-ink hover:border-brand/25"
                )}
              >
                <div
                  className="text-[18px] leading-tight mb-1.5"
                  style={{ fontFamily: th.fontPreview, color: "inherit" }}
                >
                  Aa
                </div>
                <p className="text-[12px] font-semibold">{name}</p>
                <p className={cn("text-[12px]", active ? "text-brand" : "text-ink-muted")}>{desc}</p>
              </button>
            );
          })}
        </div>
      </div>

      {/* Size */}
      <div>
        <p className="text-[11px] font-semibold text-ink-muted uppercase tracking-wide mb-3">{t("design.size")}</p>
        <div className="flex gap-2">
          {DOC_SIZES_META.map((s) => {
            const active = style.size === s.id;
            return (
              <button
                key={s.id}
                type="button"
                onClick={() => set("size", s.id as DocSize)}
                className={cn(
                  "flex-1 h-10 rounded-xl border text-[13px] font-medium transition-all duration-180 tile-surface",
                  active
                    ? "border-brand text-brand"
                    : "border-transparent text-ink-muted hover:border-brand/25 hover:text-ink"
                )}
              >
                {SIZE_LABELS[s.id]}
              </button>
            );
          })}
        </div>
      </div>

      {/* Density */}
      <div>
        <p className="text-[11px] font-semibold text-ink-muted uppercase tracking-wide mb-3">{t("design.density")}</p>
        <div className="flex gap-2">
          {DOC_DENSITIES_META.map((d) => {
            const active = style.density === d.id;
            return (
              <button
                key={d.id}
                type="button"
                onClick={() => set("density", d.id as DocDensity)}
                className={cn(
                  "flex-1 h-10 rounded-xl border text-[13px] font-medium transition-all duration-180 tile-surface",
                  active
                    ? "border-brand text-brand"
                    : "border-transparent text-ink-muted hover:border-brand/25 hover:text-ink"
                )}
              >
                {DENSITY_LABELS[d.id]}
              </button>
            );
          })}
        </div>
      </div>

      {/* Page Mode */}
      <div>
        <p className="text-[11px] font-semibold text-ink-muted uppercase tracking-wide mb-3">{t("design.pageMode")}</p>
        <div className="grid grid-cols-2 gap-2">
          {DOC_PAGE_META.map((pg) => {
            const active = style.page === pg.id;
            const isLight = pg.id === "light";
            return (
              <button
                key={pg.id}
                type="button"
                onClick={() => set("page", pg.id as DocPage)}
                className={cn(
                  "flex flex-col items-center justify-center h-[76px] rounded-2xl border-2 transition-all duration-180",
                  isLight ? "bg-white" : "bg-[#1c1a18]",
                  active
                    ? "border-brand"
                    : isLight ? "border-black/[0.08] hover:border-black/20" : "border-white/[0.08] hover:border-white/20"
                )}
              >
                <span
                  className="text-[22px] font-semibold leading-none tracking-tight"
                  style={{ color: isLight ? "#1a1818" : "#f0ebe4" }}
                >
                  Tt
                </span>
              </button>
            );
          })}
        </div>
      </div>

    </div>
  );
}
