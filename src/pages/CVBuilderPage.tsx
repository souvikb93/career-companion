import { useEffect, useRef, useState } from "react";
import { Plus, X, FolderOpen, Save, FilePlus, SlidersHorizontal, Download, MoreHorizontal, Minus } from "lucide-react";
import { DocumentStyle, DocTheme, DocSize, DocDensity, DocPage, loadDocStyle, saveDocStyle, DOC_THEMES_META, DOC_SIZES_META, DOC_DENSITIES_META, DOC_PAGE_META, systemPageMode, useDocPageSync } from "@/lib/document-theme";
import { CustomizePanel } from "@/components/CustomizePanel";
import { cn } from "@/lib/utils";
import { MobileActionsMenu } from "@/components/MobileActionsMenu";
import { SegmentedControl } from "@/components/SegmentedControl";
import { useJobs } from "@/lib/jobs-store";
import { SavedCVsPanel } from "@/components/SavedCVsPanel";
import { SaveModal } from "@/components/SaveModal";
import { DownloadModal } from "@/components/DownloadModal";
import { useSavedResumes } from "@/lib/saved-items";
import { ExportFormat } from "@/lib/exporters";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "@/components/ui/material-ui-dropdown-menu";
import { exportTextAsPDF } from "@/lib/exporters";
import { supabase } from "@/integrations/supabase/client";
import { tailorResume, scrapeJobFromUrl } from "@/lib/groq";
import { useProfile } from "@/lib/profile-store";
import { useToast } from "@/hooks/use-toast";
import { useT } from "@/lib/i18n";
import { loadFromStorage, saveToStorage } from "@/lib/storage";
import { isUrl } from "@/lib/utils";
import BuildFromJobCard from "@/components/BuildFromJobCard";

interface Experience { id: string; title: string; company: string; start: string; end: string; description: string }
interface Education { id: string; school: string; degree: string; field: string; date: string }

interface CV {
  fullName: string;
  title: string;
  email: string;
  phone: string;
  linkedin: string;
  location: string;
  summary: string;
  experiences: Experience[];
  education: Education[];
  skills: string[];
}

type TFn = (path: string, vars?: Record<string, string | number>) => string;

function makeInitial(t: TFn): CV {
  return {
    fullName: t("resume.sample.yourName"),
    title: t("resume.sample.professionalTitle"),
    email: t("resume.sample.email"),
    phone: t("resume.sample.phone"),
    linkedin: t("resume.sample.linkedin"),
    location: t("resume.sample.address"),
    summary: t("resume.sample.summary"),
    experiences: [
      {
        id: "e1",
        title: t("resume.sample.jobTitle1"),
        company: t("resume.sample.companyName"),
        start: t("resume.sample.dateRange"),
        end: t("resume.sample.present"),
        description: t("resume.sample.expDescription"),
      },
      {
        id: "e2",
        title: t("resume.sample.jobTitle2"),
        company: t("resume.sample.companyName"),
        start: t("resume.sample.dateRange"),
        end: t("resume.sample.dateRange"),
        description: t("resume.sample.expDescription"),
      },
    ],
    education: [
      {
        id: "ed1",
        school: t("resume.sample.university"),
        degree: t("resume.sample.degree"),
        field: t("resume.sample.field"),
        date: t("resume.sample.gradYear"),
      },
    ],
    skills: [
      t("resume.sample.skill1"),
      t("resume.sample.skill2"),
      t("resume.sample.skill3"),
    ],
  };
}

const uid = () => Math.random().toString(36).slice(2, 9);

const CV_DRAFT_KEY = "tracka_cv_draft";
const CV_JD_KEY = "tracka_cv_jd";


export default function CVBuilderPage() {
  const { toast } = useToast();
  const { t, lang } = useT();
  const { profile, loading: profileLoading } = useProfile();
  const initial = makeInitial(t);
  const [cv, setCv] = useState<CV>(() => loadFromStorage<CV>(CV_DRAFT_KEY) ?? makeInitial(t));
  const prevDefaultRef = useRef<CV>(initial);
  const profileApplied = useRef(false);
  const hasDraft = useRef(!!loadFromStorage(CV_DRAFT_KEY));

  // Persist cv to localStorage on every change
  useEffect(() => { saveToStorage(CV_DRAFT_KEY, cv); }, [cv]);

  // Auto-fill from profile only if user has no saved draft yet
  useEffect(() => {
    if (profileLoading || profileApplied.current) return;
    profileApplied.current = true;
    if (!profile.fullName && !profile.email) return;
    // Replace a field only when it is blank or still holds the untouched placeholder.
    // If the user has actually typed something, leave it alone.
    const def = makeInitial(t);
    const fill = (cur: string, profileVal: string, placeholder: string) =>
      (!cur || cur === placeholder) ? (profileVal || cur) : cur;
    setCv((prev) => ({
      ...prev,
      fullName:  fill(prev.fullName,  profile.fullName,  def.fullName),
      title:     fill(prev.title,     profile.title,     def.title),
      email:     fill(prev.email,     profile.email,     def.email),
      phone:     fill(prev.phone,     profile.phone,     def.phone),
      location:  fill(prev.location,  profile.location,  def.location),
      linkedin:  fill(prev.linkedin,  profile.linkedin,  def.linkedin),
      summary: hasDraft.current ? prev.summary : (profile.summary || prev.summary),
      experiences: hasDraft.current ? prev.experiences : (profile.experiences.length ? profile.experiences : prev.experiences),
      education: hasDraft.current ? prev.education : (profile.education.length ? profile.education : prev.education),
      skills: hasDraft.current ? prev.skills : (profile.skills.length ? profile.skills : prev.skills),
    }));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [profileLoading]);

  // When language changes, replace any fields that still match the previous-language default.
  useEffect(() => {
    const prev = prevDefaultRef.current;
    const next = makeInitial(t);
    setCv((cur) => {
      const c = cur as unknown as Record<string, unknown>;
      const p = prev as unknown as Record<string, unknown>;
      const n = next as unknown as Record<string, unknown>;
      const swap = (k: string) => (c[k] === p[k] ? n[k] : c[k]);
      return {
        fullName: swap("fullName") as string,
        title: swap("title") as string,
        email: swap("email") as string,
        phone: swap("phone") as string,
        linkedin: swap("linkedin") as string,
        location: swap("location") as string,
        summary: swap("summary") as string,
        experiences: cur.experiences.map((e, i) => {
          const pe = prev.experiences[i]; const ne = next.experiences[i];
          if (!pe || !ne) return e;
          return {
            id: e.id,
            title: e.title === pe.title ? ne.title : e.title,
            company: e.company === pe.company ? ne.company : e.company,
            start: e.start === pe.start ? ne.start : e.start,
            end: e.end === pe.end ? ne.end : e.end,
            description: e.description === pe.description ? ne.description : e.description,
          };
        }),
        education: cur.education.map((ed, i) => {
          const pe = prev.education[i]; const ne = next.education[i];
          if (!pe || !ne) return ed;
          return {
            id: ed.id,
            school: ed.school === pe.school ? ne.school : ed.school,
            degree: ed.degree === pe.degree ? ne.degree : ed.degree,
            field: ed.field === pe.field ? ne.field : ed.field,
            date: ed.date === pe.date ? ne.date : ed.date,
          };
        }),
        skills: cur.skills.map((s) => {
          const idx = prev.skills.indexOf(s);
          return idx >= 0 && next.skills[idx] ? next.skills[idx] : s;
        }),
      };
    });
    prevDefaultRef.current = next;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lang]);

  const [skillDraft, setSkillDraft] = useState("");
  const [zoom, setZoom] = useState<number>(() =>
    typeof window !== "undefined" && window.innerWidth < 1024
      ? Math.max(0.35, (window.innerWidth - 40) / 794)
      : 0.6
  );
  const [building, setBuilding] = useState(false);
  const [savedOpen, setSavedOpen] = useState(false);
  const [saveOpen, setSaveOpen] = useState(false);
  const [downloadOpen, setDownloadOpen] = useState(false);
  const [downloadData, setDownloadData] = useState<{ cv: CV; name: string } | null>(null);
  const [newCvId, setNewCvId] = useState<string | undefined>(undefined);
  const [mobileTab, setMobileTab] = useState<"editor" | "preview">("preview");
  const [showNewModal, setShowNewModal] = useState(false);
  const [docStyle, setDocStyle] = useState<DocumentStyle>(() => {
    const stored = loadDocStyle();
    // If no page preference was ever saved, default to system colour scheme
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
  const { getJob, targetJobId, setTargetJobId } = useJobs();
  const { list: savedCVs, save: saveCV, remove: removeCV } = useSavedResumes<CV>();
  const targetJob = targetJobId ? getJob(targetJobId) : null;

  useEffect(() => {
    if (targetJobId) setTargetJobId(null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const update = <K extends keyof CV>(k: K, v: CV[K]) => setCv((p) => ({ ...p, [k]: v }));

  const isCvDefault = () => JSON.stringify(cv) === JSON.stringify(makeInitial(t));

  const handleNew = () => {
    if (isCvDefault()) return;
    setShowNewModal(true);
  };

  const doReset = () => {
    setCv(makeInitial(t));
    try { window.localStorage.removeItem(CV_DRAFT_KEY); } catch { /* ignore */ }
    setShowNewModal(false);
  };

  const buildResumeFilename = (fullName?: string): string => {
    const suffix = t("resume.downloadSuffix");
    const name = fullName?.trim();
    return name ? name.replace(/\s+/g, "_") + "_" + suffix : suffix;
  };

  const handleDownloadCV = (data?: CV, name?: string) => {
    const targetCv = data || cv;
    setDownloadData({ cv: targetCv, name: buildResumeFilename(targetCv.fullName) });
    setDownloadOpen(true);
  };

  const handleExportCV = (format: ExportFormat, filename: string) => {
    if (!downloadData) return { title: "", body: "" };
    const body = renderCvAsText(downloadData.cv, t);
    const docTitle = downloadData.cv.fullName || downloadData.name;
    return { title: docTitle, body };
  };

  const buildFromJD = async (input: string) => {
    setBuilding(true);
    try {
      let jd = input;
      if (isUrl(input)) {
        const data = await scrapeJobFromUrl(input);
        jd = `${data.role} at ${data.company}\n\n${data.description}`;
      }
      const result = await tailorResume(cv, jd);
      setCv((prev) => ({
        ...prev,
        summary: result.summary || prev.summary,
        skills: result.skills?.length ? result.skills : prev.skills,
        experiences: prev.experiences.map((exp) => {
          const match = result.experiences?.find(
            (r) => r.title.toLowerCase() === exp.title.toLowerCase(),
          );
          return match ? { ...exp, description: match.description } : exp;
        }),
      }));
      toast({ title: t("resume.tailored"), description: t("resume.tailoredDesc") });
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Failed";
      toast({ title: t("resume.cantBuild"), description: msg, variant: "destructive" });
    } finally {
      setBuilding(false);
    }
  };

  return (
    <>
    <div className="w-full flex flex-col h-[calc(100dvh-64px)] lg:h-[calc(100vh-64px)] lg:overflow-hidden">
      {/* Mobile header */}
      <div className="lg:hidden shrink-0 px-4 py-4 flex items-center justify-between glass-bar">
        <h1 className="heading-1">{t("resume.pageTitle")}</h1>
        <MobileActionsMenu
          onNew={handleNew}
          onSave={() => setSaveOpen(true)}
          onLibrary={() => setSavedOpen(true)}
          onCustomize={() => setCustomizeOpen(true)}
          onDownload={handleDownloadCV}
          zoom={zoom}
          onZoom={setZoom}
        />
      </div>

      {/* Mobile segmented control */}
      <div className="lg:hidden shrink-0 px-4 py-3 glass-bar">
        <SegmentedControl
          options={[
            { value: "editor", label: t("resume.tabEditor") },
            { value: "preview", label: t("resume.tabPreview") },
          ]}
          value={mobileTab}
          onChange={setMobileTab}
        />
      </div>

      <SavedCVsPanel
        open={savedOpen}
        onClose={() => { setSavedOpen(false); setNewCvId(undefined); }}
        title={t("resume.libraryTitle")}
        list={savedCVs}
        newItemId={newCvId}
        onLoad={(item) => {
          setCv(item.data);
          setSavedOpen(false);
          toast({ title: t("resume.loaded"), description: item.name });
        }}
        onDelete={(id) => removeCV(id)}
        onDownload={(item) => handleDownloadCV(item.data, item.name || t("resume.defaultSaveName"))}
      />

      <SaveModal
        open={saveOpen}
        onClose={() => setSaveOpen(false)}
        title={t("resume.saveTitle")}
        defaultName={targetJob ? `${t("resume.defaultSaveName")} — ${targetJob.company}` : t("resume.defaultSaveName")}
        onSave={async (name) => {
          try {
            const item = await saveCV(name, cv);
            setNewCvId(item.id);
            setSavedOpen(true);
          } catch {
            toast({ title: t("resume.cantBuild"), variant: "destructive" });
          }
        }}
      />

      <div
        className="flex-1 min-h-0 flex flex-col lg:grid lg:h-[calc(100vh-64px)]"
        style={{
          gridTemplateColumns: customizeOpen ? "1fr 1.5fr 280px" : "1fr 1fr 0px",
          transition: "grid-template-columns 320ms cubic-bezier(0.22, 1, 0.36, 1)",
        }}
      >
        {/* Editor column — single glass-editor surface */}
        <div
          className={cn(
            "glass-editor lg:flex lg:flex-col lg:h-[calc(100vh-64px)] lg:overflow-hidden lg:border-r glass-rule",
            mobileTab !== "editor" ? "hidden lg:flex" : "flex flex-col flex-1 min-h-0"
          )}
        >
          {/* Desktop fixed header — title + actions */}
          <div className="hidden lg:block shrink-0 px-8 pt-8 pb-6 border-b glass-rule">
            <h1 className="heading-1 mb-6">{t("resume.pageTitle")}</h1>
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
              <CvMoreMenu
                customizeOpen={customizeOpen}
                onDesign={() => setCustomizeOpen((v) => !v)}
                onDownload={handleDownloadCV}
                onLibrary={() => setSavedOpen(true)}
                zoom={zoom}
                onZoom={setZoom}
              />
            </div>
          </div>

          {/* Scrollable editor content */}
          <section className="flex-1 min-h-0 overflow-y-auto overscroll-contain scrollbar-minimal p-4 lg:p-8">
          <BuildFromJobCard
            storageKey={CV_JD_KEY}
            loading={building}
            onGenerate={buildFromJD}
            initialValue={targetJob ? `${targetJob.role} at ${targetJob.company}` : undefined}
          />

          <h2 className="text-[20px] font-semibold text-ink mb-6 mt-6">{t("resume.editYour")}</h2>

          <Card title={t("resume.personal")}>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Field label={t("resume.fullName")}>
                <input className="input-base" value={cv.fullName} onChange={(e) => update("fullName", e.target.value)} />
              </Field>
              <Field label={t("resume.email")}>
                <input className="input-base" value={cv.email} onChange={(e) => update("email", e.target.value)} />
              </Field>
              <Field label={t("resume.phone")}>
                <input className="input-base" value={cv.phone} onChange={(e) => update("phone", e.target.value)} />
              </Field>
              <Field label={t("resume.location")}>
                <input className="input-base" value={cv.location} onChange={(e) => update("location", e.target.value)} />
              </Field>
            </div>
          </Card>

          <Card title={t("resume.summary")}>
            <textarea
              className="textarea-base"
              rows={4}
              value={cv.summary}
              onChange={(e) => update("summary", e.target.value)}
              placeholder={t("resume.summaryPlaceholder")}
            />
          </Card>

          <Card
            title={t("resume.experience")}
            action={
              <AddBtn onClick={() =>
                update("experiences", [
                  ...cv.experiences,
                  { id: uid(), title: "", company: "", start: "", end: "", description: "" },
                ])
              }>{t("resume.addExperience")}</AddBtn>
            }
          >
            <div className="space-y-3">
              {cv.experiences.map((exp, idx) => (
                <div key={exp.id} className="relative rounded-2xl border border-line p-4">
                  <RemoveBtn onClick={() => update("experiences", cv.experiences.filter((e) => e.id !== exp.id))} />
                  <h4 className="text-[14px] font-semibold text-ink mb-3 pr-8">{t("resume.experienceN", { n: idx + 1 })}</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <input className="input-base" placeholder={t("resume.jobTitle")} value={exp.title}
                      onChange={(e) => update("experiences", cv.experiences.map((x) => x.id === exp.id ? { ...x, title: e.target.value } : x))} />
                    <input className="input-base" placeholder={t("resume.company")} value={exp.company}
                      onChange={(e) => update("experiences", cv.experiences.map((x) => x.id === exp.id ? { ...x, company: e.target.value } : x))} />
                    <input className="input-base" placeholder={t("resume.startPlaceholder")} value={exp.start}
                      onChange={(e) => update("experiences", cv.experiences.map((x) => x.id === exp.id ? { ...x, start: e.target.value } : x))} />
                    <input className="input-base" placeholder={t("resume.endPlaceholder")} value={exp.end}
                      onChange={(e) => update("experiences", cv.experiences.map((x) => x.id === exp.id ? { ...x, end: e.target.value } : x))} />
                  </div>
                  <textarea className="textarea-base mt-3" rows={3} placeholder={t("resume.descPlaceholder")} value={exp.description}
                    onChange={(e) => update("experiences", cv.experiences.map((x) => x.id === exp.id ? { ...x, description: e.target.value } : x))} />
                </div>
              ))}
            </div>
          </Card>

          <Card
            title={t("resume.education")}
            action={
              <AddBtn onClick={() =>
                update("education", [...cv.education, { id: uid(), school: "", degree: "", field: "", date: "" }])
              }>{t("resume.addEducation")}</AddBtn>
            }
          >
            <div className="space-y-3">
              {cv.education.map((ed, idx) => (
                <div key={ed.id} className="relative rounded-2xl border border-line p-4">
                  <RemoveBtn onClick={() => update("education", cv.education.filter((e) => e.id !== ed.id))} />
                  <h4 className="text-[14px] font-semibold text-ink mb-3 pr-8">{t("resume.educationN", { n: idx + 1 })}</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <input className="input-base" placeholder={t("resume.school")} value={ed.school}
                      onChange={(e) => update("education", cv.education.map((x) => x.id === ed.id ? { ...x, school: e.target.value } : x))} />
                    <input className="input-base" placeholder={t("resume.degree")} value={ed.degree}
                      onChange={(e) => update("education", cv.education.map((x) => x.id === ed.id ? { ...x, degree: e.target.value } : x))} />
                    <input className="input-base" placeholder={t("resume.field")} value={ed.field}
                      onChange={(e) => update("education", cv.education.map((x) => x.id === ed.id ? { ...x, field: e.target.value } : x))} />
                    <input className="input-base" placeholder={t("resume.gradDate")} value={ed.date}
                      onChange={(e) => update("education", cv.education.map((x) => x.id === ed.id ? { ...x, date: e.target.value } : x))} />
                  </div>
                </div>
              ))}
            </div>
          </Card>

          <Card title={t("resume.skills")}>
            <div className="flex flex-wrap gap-2 mb-3">
              {cv.skills.map((s) => (
                <span key={s} className="inline-flex items-center gap-1.5 rounded-full bg-surface-2 border border-line px-3 py-1.5 text-[13px] text-ink">
                  {s}
                  <button
                    type="button"
                    onClick={() => update("skills", cv.skills.filter((x) => x !== s))}
                    aria-label={t("resume.removeSkill", { s })}
                    className="text-ink-muted hover:text-ink transition-colors duration-180"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </span>
              ))}
            </div>
            <input
              value={skillDraft}
              onChange={(e) => setSkillDraft(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && skillDraft.trim()) {
                  e.preventDefault();
                  update("skills", [...cv.skills, skillDraft.trim()]);
                  setSkillDraft("");
                }
              }}
              placeholder={t("resume.skillPlaceholder")}
              className="input-base"
            />
          </Card>
        </section>
        </div>

        {/* Preview - canvas with A4 page */}
        <div
          className={cn(
            "relative lg:h-[calc(100vh-64px)]",
            mobileTab !== "preview" ? "hidden lg:block" : "flex-1 min-h-0"
          )}
        >
          <section className="bg-transparent overflow-auto h-full flex justify-center px-4 pt-6 pb-24 lg:px-6">
            <div
              className="mx-auto"
              style={{ width: `${794 * zoom}px`, height: `${1123 * zoom}px` }}
            >
              <article
                className="document-canvas bg-white text-ink shadow-2xl origin-top-left"
                data-doc-theme={docStyle.theme}
                data-doc-size={docStyle.size}
                data-doc-density={docStyle.density}
                data-doc-page={docStyle.page}
                style={{
                  width: "794px",
                  minHeight: "1123px",
                  padding: "64px",
                  transform: `scale(${zoom})`,
                }}
              >
                <CvPreview cv={cv} />
              </article>
            </div>
          </section>
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
            className="btn-icon-sm absolute top-4 right-4 h-8 w-8 rounded-full"
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

    {/* Download Modal */}
    <DownloadModal
      open={downloadOpen}
      onClose={() => {
        setDownloadOpen(false);
        setDownloadData(null);
      }}
      title={t("resume.downloadTitle")}
      defaultName={downloadData?.name || cv.fullName || t("resume.defaultSaveName")}
      documentType="resume"
      onExport={handleExportCV}
    />
    </>
  );
}

function renderCvAsText(cv: CV, t: TFn): string {
  const parts: string[] = [];
  parts.push([cv.email, cv.phone, cv.location].filter(Boolean).join(" · "));
  if (cv.summary) parts.push("\n" + cv.summary);
  if (cv.experiences.length) {
    parts.push("\n" + t("resume.sectionExperience").toUpperCase());
    cv.experiences.forEach((e) => {
      parts.push(`\n${e.title}${e.company ? " · " + e.company : ""}  (${[e.start, e.end].filter(Boolean).join(" – ")})`);
      if (e.description) parts.push(e.description);
    });
  }
  if (cv.education.length) {
    parts.push("\n" + t("resume.sectionEducation").toUpperCase());
    cv.education.forEach((e) => {
      parts.push(`${e.school} — ${[e.degree, e.field].filter(Boolean).join(", ")} (${e.date})`);
    });
  }
  if (cv.skills.length) {
    parts.push("\n" + t("resume.sectionSkills").toUpperCase());
    parts.push(cv.skills.join(" · "));
  }
  return parts.join("\n");
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="field-label">{label}</label>
      {children}
    </div>
  );
}

function Card({ title, children, action }: { title: string; children: React.ReactNode; action?: React.ReactNode }) {
  return (
    <div className="glass-modal p-5 mb-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-[15px] font-semibold text-ink">{title}</h3>
        {action}
      </div>
      {children}
    </div>
  );
}

function AddBtn({ children, onClick }: { children: React.ReactNode; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="inline-flex items-center gap-1 text-brand text-[13px] font-medium hover:underline transition-colors"
    >
      <Plus className="h-3.5 w-3.5" /> {children}
    </button>
  );
}

function RemoveBtn({ onClick }: { onClick: () => void }) {
  const { t } = useT();
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={t("common.remove")}
      className="absolute top-3 right-3 h-7 w-7 rounded-full grid place-items-center text-ink-muted hover:text-ink hover:bg-surface-2 transition-colors duration-180"
    >
      <X className="h-3.5 w-3.5" />
    </button>
  );
}

interface CvMoreMenuProps {
  customizeOpen: boolean;
  onDesign: () => void;
  onDownload: () => void;
  onLibrary: () => void;
  zoom: number;
  onZoom: (z: number) => void;
}

function CvMoreMenu({ customizeOpen, onDesign, onDownload, onLibrary, zoom, onZoom }: CvMoreMenuProps) {
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
              className="btn-icon-sm h-7 w-7"
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
              className="btn-icon-sm h-7 w-7"
            >
              <Plus className="h-3 w-3" />
            </button>
            <div className="w-px h-4 bg-line" />
            <button
              type="button"
              onClick={fit}
              className="btn-icon-sm px-2 h-7 text-[11px] font-medium"
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

  const PAGE_LABELS: Record<DocPage, string> = {
    light: t("design.light"),
    dark:  t("design.dark"),
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

function CvPreview({ cv }: { cv: CV }) {
  const { t } = useT();
  const contactLine = [cv.email, cv.phone, cv.linkedin, cv.location].filter(Boolean).join(" · ");

  return (
    <div>
      <header className="text-center mb-6">
        <h2 className="cv-name">{cv.fullName}</h2>
        {cv.title && <p className="cv-role">{cv.title}</p>}
        <p className="cv-contact">{contactLine}</p>
      </header>

      {cv.summary && (
        <CvSection title={t("resume.sectionSummary")}>
          <p className="cv-body whitespace-pre-line">{cv.summary}</p>
        </CvSection>
      )}
      {cv.experiences.length > 0 && (
        <CvSection title={t("resume.sectionExperience")}>
          {cv.experiences.map((e) => <ExpItem key={e.id} e={e} />)}
        </CvSection>
      )}
      {cv.education.length > 0 && (
        <CvSection title={t("resume.sectionEducation")}>
          {cv.education.map((e) => <EduItem key={e.id} e={e} />)}
        </CvSection>
      )}
      {cv.skills.length > 0 && (
        <CvSection title={t("resume.sectionSkills")}>
          <p className="cv-body">{cv.skills.join(" · ")}</p>
        </CvSection>
      )}
    </div>
  );
}

function CvSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="cv-section">
      <h3 className="cv-section-title">{title}</h3>
      {children}
    </section>
  );
}

function ExpItem({ e }: { e: Experience }) {
  return (
    <div className="cv-item">
      <div className="flex items-baseline justify-between gap-3">
        <p className="cv-item-heading">{e.title}{e.company && ` – ${e.company}`}</p>
        <p className="cv-item-meta">{[e.start, e.end].filter(Boolean).join(" – ")}</p>
      </div>
      {e.description && (
        <ul className="mt-1 list-disc pl-5 space-y-0.5">
          {e.description.split("\n").filter(Boolean).map((line, i) => (
            <li key={i} className="cv-body">{line}</li>
          ))}
        </ul>
      )}
    </div>
  );
}

function EduItem({ e }: { e: Education }) {
  return (
    <div className="cv-item">
      <div className="flex items-baseline justify-between gap-3">
        <p className="cv-item-heading">{e.degree}{e.school && ` – ${e.school}`}</p>
        <p className="cv-item-meta">{e.date}</p>
      </div>
      {e.field && <p className="cv-body">{e.field}</p>}
    </div>
  );
}
