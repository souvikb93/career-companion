import { useEffect, useRef, useState } from "react";
import { Plus, X, Loader2, Sparkles, FolderOpen, Save } from "lucide-react";
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

export default function CVBuilderPage() {
  const { toast } = useToast();
  const { t, lang } = useT();
  const initial = makeInitial(t);
  const [cv, setCv] = useState<CV>(() => makeInitial(t));
  const prevDefaultRef = useRef<CV>(initial);

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
        phone: swap("phone") as string,
        linkedin: swap("linkedin") as string,
        location: swap("location") as string,
        summary: swap("summary") as string,
        experiences: cur.experiences.map((e, i) => {
          const p = prev.experiences[i]; const n = next.experiences[i];
          if (!p || !n) return e;
          return {
            id: e.id,
            title: e.title === p.title ? n.title : e.title,
            company: e.company === p.company ? n.company : e.company,
            start: e.start === p.start ? n.start : e.start,
            end: e.end === p.end ? n.end : e.end,
            description: e.description === p.description ? n.description : e.description,
          };
        }),
        education: cur.education.map((ed, i) => {
          const p = prev.education[i]; const n = next.education[i];
          if (!p || !n) return ed;
          return {
            id: ed.id,
            school: ed.school === p.school ? n.school : ed.school,
            degree: ed.degree === p.degree ? n.degree : ed.degree,
            field: ed.field === p.field ? n.field : ed.field,
            date: ed.date === p.date ? n.date : ed.date,
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
  const [zoom, setZoom] = useState(0.6);
  const [jdText, setJdText] = useState("");
  const [jdUrl, setJdUrl] = useState("");
  const [building, setBuilding] = useState(false);
  const [savedOpen, setSavedOpen] = useState(false);
  const [saveOpen, setSaveOpen] = useState(false);
  const [hoverPreview, setHoverPreview] = useState(false);
  const [layout, setLayoutState] = useState<LayoutVariant>(() => loadLayout("cv_layout"));
  const setLayout = (v: LayoutVariant) => {
    setLayoutState(v);
    try { window.localStorage.setItem("cv_layout", v); } catch { /* ignore */ }
  };
  const { getJob, targetJobId, setTargetJobId } = useJobs();
  const { list: savedCVs, save: saveCV, remove: removeCV } = useSavedCVs<CV>("saved_cvs_v2", () => {
    const daysAgo = (n: number) => new Date(Date.now() - n * 86400000).toISOString();
    const variant = (summary: string, skills: string[]): CV => ({ ...initial, summary, skills });
    const lbl = t("resume.defaultSaveName");
    return [
      { id: "demo-cv-1", name: `${lbl} — Zalando Senior Designer`, savedAt: daysAgo(3),
        data: variant("Tailored for Zalando — Senior Product Designer.", ["Design Systems", "Product Design", "Figma", "Prototyping", "User Research", "HTML / CSS"]) },
      { id: "demo-cv-2", name: `${lbl} — Delivery Hero Product Engineer`, savedAt: daysAgo(5),
        data: variant("Tailored for Delivery Hero — hybrid designer/engineer.", ["HTML / CSS", "Prototyping", "Design Systems", "Figma", "Product Design", "User Research"]) },
      { id: "demo-cv-3", name: `${lbl} — N26 Product Designer`, savedAt: daysAgo(7),
        data: variant("Tailored for N26 — fintech-focused product designer.", ["Product Design", "User Research", "Prototyping", "Design Systems", "Figma", "HTML / CSS"]) },
      { id: "demo-cv-4", name: `${lbl} — FlixBus Brand Designer`, savedAt: daysAgo(8),
        data: variant("Tailored for FlixBus — brand-leaning product designer.", ["Figma", "Design Systems", "Product Design", "Prototyping", "HTML / CSS", "User Research"]) },
      { id: "demo-cv-5", name: `${lbl} — Bolt Frontend Engineer`, savedAt: daysAgo(10),
        data: variant("Tailored for Bolt — designer-engineer.", ["HTML / CSS", "Figma", "Prototyping", "Design Systems", "Product Design", "User Research"]) },
      { id: "demo-cv-6", name: `${lbl} — General`, savedAt: daysAgo(12), data: initial },
    ];
  });
  const targetJob = targetJobId ? getJob(targetJobId) : null;

  useEffect(() => {
    if (targetJob) {
      setJdText(`${targetJob.role} at ${targetJob.company}\n\n${targetJob.description}`);
    }
    if (targetJobId) setTargetJobId(null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const update = <K extends keyof CV>(k: K, v: CV[K]) => setCv((p) => ({ ...p, [k]: v }));

  const handleExport = (format: ExportFormat) => {
    const body = renderCvAsText(cv);
    const filename = targetJob ? `cv-${targetJob.company}` : `cv-${cv.fullName.replace(/\s+/g, "-")}`;
    exportAs(format, cv.fullName || "CV", body, filename);
  };

  const buildFromJD = async () => {
    let jd = jdText.trim();
    if (!jd && !jdUrl.trim()) return;
    setBuilding(true);
    try {
      if (!jd && jdUrl.trim()) {
        const { data, error } = await supabase.functions.invoke("scrape-job", { body: { url: jdUrl.trim() } });
        if (error) throw error;
        if ((data as { error?: string })?.error) throw new Error((data as { error: string }).error);
        jd = `${data.role} at ${data.company}\n\n${data.description}`;
      }
      // Tailor: tweak summary + reorder skills based on JD keywords (lightweight prototype)
      const lower = jd.toLowerCase();
      const tailored = {
        ...cv,
        summary: `Tailored for: ${jd.split("\n")[0]}.\n\n${cv.summary}`,
        skills: [...cv.skills].sort((a, b) =>
          (lower.includes(b.toLowerCase()) ? 1 : 0) - (lower.includes(a.toLowerCase()) ? 1 : 0),
        ),
      };
      setCv(tailored);
      toast({ title: t("resume.tailored"), description: t("resume.tailoredDesc") });
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Failed";
      toast({ title: t("resume.cantBuild"), description: msg, variant: "destructive" });
    } finally {
      setBuilding(false);
    }
  };

  return (
    <div className="w-full">
      <div className="px-8 py-5 flex items-center justify-between border-b border-line bg-surface flex-wrap gap-3">
        <div>
          <h1 className="text-[24px] font-semibold text-ink">{t("resume.pageTitle")}</h1>
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
        title={t("resume.libraryTitle")}
        list={savedCVs}
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
        defaultName={targetJob ? `Resume — ${targetJob.company}` : cv.fullName}
        onSave={(name, format) => {
          const item = saveCV(name, cv);
          handleExport(format);
          toast({ title: t("resume.saved"), description: `${item.name} · ${format.toUpperCase()}` });
        }}
      />

      <div className="grid grid-cols-1 lg:grid-cols-2" style={{ minHeight: "calc(100vh - 64px - 81px)" }}>
        {/* Editor */}
        <section className="bg-surface border-r border-line p-8 overflow-y-auto"
          style={{ maxHeight: "calc(100vh - 64px - 81px)" }}
        >
          <Card title={t("resume.buildFromJd")} action={
            <button
              type="button"
              onClick={buildFromJD}
              disabled={building || (!jdText.trim() && !jdUrl.trim())}
              className="btn-primary h-9 px-4"
            >
              {building ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Sparkles className="h-3.5 w-3.5" />}
              {building ? t("resume.building") : t("resume.build")}
            </button>
          }>
            <input
              value={jdUrl}
              onChange={(e) => setJdUrl(e.target.value)}
              placeholder={t("resume.jdUrlPlaceholder")}
              className="input-base mb-3"
            />
            <textarea
              value={jdText}
              onChange={(e) => setJdText(e.target.value)}
              rows={4}
              placeholder={t("resume.jdTextPlaceholder")}
              className="textarea-base"
            />
          </Card>

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
                <div key={exp.id} className="rounded-2xl border border-line p-4">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="text-[14px] font-semibold text-ink">{t("resume.experienceN", { n: idx + 1 })}</h4>
                    <RemoveBtn onClick={() => update("experiences", cv.experiences.filter((e) => e.id !== exp.id))} />
                  </div>
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
                <div key={ed.id} className="rounded-2xl border border-line p-4">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="text-[14px] font-semibold text-ink">{t("resume.educationN", { n: idx + 1 })}</h4>
                    <RemoveBtn onClick={() => update("education", cv.education.filter((e) => e.id !== ed.id))} />
                  </div>
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

        {/* Preview - canvas with A4 page */}
        <div
          className="relative"
          style={{ maxHeight: "calc(100vh - 64px - 81px)" }}
          onMouseEnter={() => setHoverPreview(true)}
          onMouseLeave={() => setHoverPreview(false)}
        >
        <section
          className="bg-transparent px-6 pt-6 pb-24 overflow-auto h-full"
          style={{ maxHeight: "calc(100vh - 64px - 81px)" }}
        >
          <div
            className="mx-auto"
            style={{ width: `${794 * zoom}px`, height: `${1123 * zoom}px` }}
          >
            <article
              className="bg-white text-ink shadow-2xl origin-top-left"
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

          {/* Floating zoom controls — only on hover */}
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

function renderCvAsText(cv: CV): string {
  const parts: string[] = [];
  parts.push([cv.email, cv.phone, cv.location].filter(Boolean).join(" · "));
  if (cv.summary) parts.push("\n" + cv.summary);
  if (cv.experiences.length) {
    parts.push("\nEXPERIENCE");
    cv.experiences.forEach((e) => {
      parts.push(`\n${e.title}${e.company ? " · " + e.company : ""}  (${[e.start, e.end].filter(Boolean).join(" – ")})`);
      if (e.description) parts.push(e.description);
    });
  }
  if (cv.education.length) {
    parts.push("\nEDUCATION");
    cv.education.forEach((e) => {
      parts.push(`${e.school} — ${[e.degree, e.field].filter(Boolean).join(", ")} (${e.date})`);
    });
  }
  if (cv.skills.length) {
    parts.push("\nSKILLS");
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
    <div className="card-surface p-5 mb-4 bg-popover">
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
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label="Remove"
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
