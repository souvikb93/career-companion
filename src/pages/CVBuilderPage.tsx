import { useEffect, useRef, useState } from "react";
import { Plus, X, FolderOpen, Save, FilePlus } from "lucide-react";
import { cn } from "@/lib/utils";
import { MobileActionsMenu } from "@/components/MobileActionsMenu";
import { SegmentedControl } from "@/components/SegmentedControl";
import { useJobs } from "@/lib/jobs-store";
import { ZoomControls } from "@/components/ZoomControls";
import { ExportMenu } from "@/components/ExportMenu";
import { SavedCVsPanel } from "@/components/SavedCVsPanel";
import { SaveModal } from "@/components/SaveModal";
import { LayoutMenu, LayoutVariant, loadLayout } from "@/components/LayoutMenu";
import { useSavedResumes } from "@/lib/saved-items";
import { exportAs, ExportFormat } from "@/lib/exporters";
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
  const [newCvId, setNewCvId] = useState<string | undefined>(undefined);
  const [hoverPreview, setHoverPreview] = useState(false);
  const [mobileTab, setMobileTab] = useState<"editor" | "preview">("preview");
  const [showNewModal, setShowNewModal] = useState(false);
  const [layout, setLayoutState] = useState<LayoutVariant>(() => loadLayout("cv_layout"));
  const setLayout = (v: LayoutVariant) => {
    setLayoutState(v);
    try { window.localStorage.setItem("cv_layout", v); } catch { /* ignore */ }
  };
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

  const handleExport = (format: ExportFormat) => {
    const body = renderCvAsText(cv, t);
    const filename = targetJob ? `cv-${targetJob.company}` : `cv-${cv.fullName.replace(/\s+/g, "-")}`;
    exportAs(format, cv.fullName || "CV", body, filename);
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
          layout={layout}
          onLayoutChange={setLayout}
          onExport={handleExport}
          onLibrary={() => setSavedOpen(true)}
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

      <div className="flex-1 min-h-0 flex flex-col lg:grid lg:grid-cols-2 lg:h-[calc(100vh-64px)]">
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
          onMouseEnter={() => setHoverPreview(true)}
          onMouseLeave={() => setHoverPreview(false)}
        >
        <section
          className="bg-transparent overflow-auto h-full flex justify-center px-4 pt-6 pb-24 lg:px-6"
        >
          <div
            className="mx-auto"
            style={{ width: `${794 * zoom}px`, height: `${1123 * zoom}px` }}
          >
            <article
              className="document-canvas bg-white text-ink shadow-2xl origin-top-left"
              style={{
                width: "794px",
                minHeight: "1123px",
                padding: layout === "compact" ? "40px" : "64px",
                transform: `scale(${zoom})`,
              }}
            >
              <CvPreview cv={cv} layout={layout} />
            </article>
          </div>
        </section>

          {/* Floating zoom controls — only on hover, desktop only */}
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

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mb-6">
      <h3 className="text-[16px] font-semibold text-ink border-b border-line pb-1.5 mb-3">{title}</h3>
      {children}
    </section>
  );
}

function CvPreview({ cv, layout }: { cv: CV; layout: LayoutVariant }) {
  const { t } = useT();
  const contactLine = [cv.email, cv.phone, cv.linkedin, cv.location].filter(Boolean).join(" · ");

  if (layout === "modern") {
    return (
      <div className="grid grid-cols-3 gap-8">
        <aside className="col-span-1 border-r border-line pr-6 space-y-6">
          <div>
            <h2 className="text-[22px] font-semibold text-ink leading-tight">{cv.fullName}</h2>
            {cv.title && <p className="text-[13px] text-ink-muted mt-1">{cv.title}</p>}
          </div>
          <div className="space-y-1 text-[12px] text-ink-muted">
            {cv.email && <div>{cv.email}</div>}
            {cv.phone && <div>{cv.phone}</div>}
            {cv.linkedin && <div>{cv.linkedin}</div>}
            {cv.location && <div>{cv.location}</div>}
          </div>
          {cv.skills.length > 0 && (
            <div>
              <h3 className="text-[13px] font-semibold text-ink uppercase tracking-wide mb-2">{t("resume.sectionSkills")}</h3>
              <ul className="space-y-1 text-[13px] text-ink-muted">
                {cv.skills.map((s) => <li key={s}>{s}</li>)}
              </ul>
            </div>
          )}
        </aside>
        <div className="col-span-2 space-y-6">
          {cv.summary && (
            <Section title={t("resume.sectionSummary")}>
              <p className="text-[14px] text-ink-muted leading-relaxed whitespace-pre-line">{cv.summary}</p>
            </Section>
          )}
          {cv.experiences.length > 0 && (
            <Section title={t("resume.sectionExperience")}>
              {cv.experiences.map((e) => <ExpItem key={e.id} e={e} />)}
            </Section>
          )}
          {cv.education.length > 0 && (
            <Section title={t("resume.sectionEducation")}>
              {cv.education.map((e) => <EduItem key={e.id} e={e} />)}
            </Section>
          )}
        </div>
      </div>
    );
  }

  const compact = layout === "compact";
  return (
    <div className={compact ? "text-[13px] leading-snug" : ""}>
      <header className="text-center mb-6">
        <h2 className={compact ? "text-[22px] font-semibold text-ink" : "text-[28px] font-semibold text-ink"}>
          {cv.fullName}
        </h2>
        {cv.title && <p className="text-[13px] text-ink-muted mt-1">{cv.title}</p>}
        <p className="text-[12px] text-ink-muted mt-2">{contactLine}</p>
      </header>

      {cv.summary && (
        <Section title={t("resume.sectionSummary")}>
          <p className="text-[14px] text-ink-muted leading-relaxed whitespace-pre-line">{cv.summary}</p>
        </Section>
      )}

      {cv.experiences.length > 0 && (
        <Section title={t("resume.sectionExperience")}>
          {cv.experiences.map((e) => <ExpItem key={e.id} e={e} />)}
        </Section>
      )}

      {cv.education.length > 0 && (
        <Section title={t("resume.sectionEducation")}>
          {cv.education.map((e) => <EduItem key={e.id} e={e} />)}
        </Section>
      )}

      {cv.skills.length > 0 && (
        <Section title={t("resume.sectionSkills")}>
          <p className="text-[14px] text-ink-muted">{cv.skills.join(" · ")}</p>
        </Section>
      )}
    </div>
  );
}

function ExpItem({ e }: { e: Experience }) {
  return (
    <div className="mb-4">
      <div className="flex items-baseline justify-between gap-3">
        <p className="text-[15px] font-semibold text-ink">{e.title}{e.company && ` – ${e.company}`}</p>
        <p className="text-[12px] text-ink-muted whitespace-nowrap">{[e.start, e.end].filter(Boolean).join(" – ")}</p>
      </div>
      {e.description && (
        <ul className="mt-1 list-disc pl-5 space-y-0.5 text-[14px] text-ink-muted leading-relaxed">
          {e.description.split("\n").filter(Boolean).map((line, i) => <li key={i}>{line}</li>)}
        </ul>
      )}
    </div>
  );
}

function EduItem({ e }: { e: Education }) {
  return (
    <div className="mb-3">
      <div className="flex items-baseline justify-between gap-3">
        <p className="text-[15px] font-semibold text-ink">{e.degree}{e.school && ` – ${e.school}`}</p>
        <p className="text-[12px] text-ink-muted">{e.date}</p>
      </div>
      {e.field && <p className="text-[14px] text-ink-muted">{e.field}</p>}
    </div>
  );
}
