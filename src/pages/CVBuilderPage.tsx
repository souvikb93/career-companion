import { useEffect, useState } from "react";
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

const LOREM_LONG = "Lorem ipsum dolor sit amet, consectetur adipiscing elit.";

const initial: CV = {
  fullName: "[Your Name]",
  title: "[Your Professional Title]",
  email: "[Your Email Address]",
  phone: "[Your Phone Number]",
  linkedin: "[Your LinkedIn Profile]",
  location: "[Your Address or City, Country]",
  summary:
    "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Curabitur vitae sapien id nulla ullamcorper convallis.",
  experiences: [
    {
      id: "e1",
      title: "Job Title 1",
      company: "Company Name",
      start: "[Month/Year]",
      end: "Present",
      description:
        "Lorem ipsum dolor sit amet, consectetur adipiscing elit.\nSed do eiusmod tempor incididunt ut labore.",
    },
    {
      id: "e2",
      title: "Job Title 2",
      company: "Company Name",
      start: "[Month/Year]",
      end: "[Month/Year]",
      description:
        "Ut enim ad minim veniam, quis nostrud exercitation.\nDuis aute irure dolor in reprehenderit.",
    },
  ],
  education: [
    { id: "ed1", school: "University Name", degree: "Degree", field: LOREM_LONG, date: "[Year of Graduation]" },
  ],
  skills: ["Lorem ipsum", "Dolor sit amet", "Consectetur adipiscing"],
};

const uid = () => Math.random().toString(36).slice(2, 9);

export default function CVBuilderPage() {
  const [cv, setCv] = useState<CV>(initial);
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
    return [
      {
        id: "demo-cv-1",
        name: "Resume — Zalando Senior Designer",
        savedAt: daysAgo(3),
        data: variant(
          "Tailored for Zalando — Senior Product Designer. Six years shaping consumer commerce experiences, design systems, and cross-platform shopping flows.",
          ["Design Systems", "Product Design", "Figma", "Prototyping", "User Research", "HTML / CSS"],
        ),
      },
      {
        id: "demo-cv-2",
        name: "Resume — Delivery Hero Product Engineer",
        savedAt: daysAgo(5),
        data: variant(
          "Tailored for Delivery Hero — hybrid designer/engineer with a track record of shipping marketplace and logistics surfaces end-to-end.",
          ["HTML / CSS", "Prototyping", "Design Systems", "Figma", "Product Design", "User Research"],
        ),
      },
      {
        id: "demo-cv-3",
        name: "Resume — N26 Product Designer",
        savedAt: daysAgo(7),
        data: variant(
          "Tailored for N26 — fintech-focused product designer with experience reducing onboarding drop-off and clarifying complex money flows.",
          ["Product Design", "User Research", "Prototyping", "Design Systems", "Figma", "HTML / CSS"],
        ),
      },
      {
        id: "demo-cv-4",
        name: "Resume — FlixBus Brand Designer",
        savedAt: daysAgo(8),
        data: variant(
          "Tailored for FlixBus — brand-leaning product designer who has launched campaigns and visual systems across web, mobile, and out-of-home.",
          ["Figma", "Design Systems", "Product Design", "Prototyping", "HTML / CSS", "User Research"],
        ),
      },
      {
        id: "demo-cv-5",
        name: "Resume — Bolt Frontend Engineer",
        savedAt: daysAgo(10),
        data: variant(
          "Tailored for Bolt — designer-engineer comfortable owning frontend delivery, from component architecture to motion polish.",
          ["HTML / CSS", "Figma", "Prototyping", "Design Systems", "Product Design", "User Research"],
        ),
      },
      {
        id: "demo-cv-6",
        name: "Master Resume — General",
        savedAt: daysAgo(12),
        data: initial,
      },
    ];
  });
  const { toast } = useToast();
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
      toast({ title: "CV tailored", description: "Summary and skill order updated for this job." });
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Failed";
      toast({ title: "Couldn't build CV", description: msg, variant: "destructive" });
    } finally {
      setBuilding(false);
    }
  };

  return (
    <div className="w-full">
      <div className="px-8 py-5 flex items-center justify-between border-b border-line bg-surface flex-wrap gap-3">
        <div>
          <h1 className="text-[24px] font-semibold text-ink">Resume Builder</h1>
        </div>
        <div className="flex items-center gap-3">
          <button type="button" onClick={() => setSaveOpen(true)} className="btn-ghost">
            <Save className="h-4 w-4" /> Save
          </button>
          <button type="button" onClick={() => setSavedOpen(true)} className="btn-ghost">
            <FolderOpen className="h-4 w-4" /> Library
          </button>
          <ExportMenu onExport={handleExport} />
        </div>
      </div>

      <SavedCVsPanel
        open={savedOpen}
        onClose={() => setSavedOpen(false)}
        title="Resume Library"
        list={savedCVs}
        onLoad={(item) => {
          setCv(item.data);
          setSavedOpen(false);
          toast({ title: "Resume loaded", description: item.name });
        }}
        onDelete={(id) => removeCV(id)}
      />

      <SaveModal
        open={saveOpen}
        onClose={() => setSaveOpen(false)}
        title="Save Resume"
        defaultName={targetJob ? `Resume — ${targetJob.company}` : cv.fullName}
        onSave={(name, format) => {
          const item = saveCV(name, cv);
          handleExport(format);
          toast({ title: "Resume saved", description: `${item.name} · ${format.toUpperCase()}` });
        }}
      />

      <div className="grid grid-cols-1 lg:grid-cols-2" style={{ minHeight: "calc(100vh - 64px - 81px)" }}>
        {/* Editor */}
        <section className="bg-surface border-r border-line p-8 overflow-y-auto"
          style={{ maxHeight: "calc(100vh - 64px - 81px)" }}
        >
          <Card title="Build from job description" action={
            <button
              type="button"
              onClick={buildFromJD}
              disabled={building || (!jdText.trim() && !jdUrl.trim())}
              className="btn-primary h-9 px-4"
            >
              {building ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Sparkles className="h-3.5 w-3.5" />}
              {building ? "Building…" : "Build CV"}
            </button>
          }>
            <input
              value={jdUrl}
              onChange={(e) => setJdUrl(e.target.value)}
              placeholder="Paste a job URL (optional)"
              className="input-base mb-3"
            />
            <textarea
              value={jdText}
              onChange={(e) => setJdText(e.target.value)}
              rows={4}
              placeholder="...or paste the job description text here"
              className="textarea-base"
            />
          </Card>

          <h2 className="text-[20px] font-semibold text-ink mb-6 mt-6">Edit your Resume</h2>

          <Card title="Personal information">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Field label="Full name">
                <input className="input-base" value={cv.fullName} onChange={(e) => update("fullName", e.target.value)} />
              </Field>
              <Field label="Email">
                <input className="input-base" value={cv.email} onChange={(e) => update("email", e.target.value)} />
              </Field>
              <Field label="Phone">
                <input className="input-base" value={cv.phone} onChange={(e) => update("phone", e.target.value)} />
              </Field>
              <Field label="Location">
                <input className="input-base" value={cv.location} onChange={(e) => update("location", e.target.value)} />
              </Field>
            </div>
          </Card>

          <Card title="Professional summary">
            <textarea
              className="textarea-base"
              rows={4}
              value={cv.summary}
              onChange={(e) => update("summary", e.target.value)}
              placeholder="Write a brief overview of your professional background..."
            />
          </Card>

          <Card
            title="Work experience"
            action={
              <AddBtn onClick={() =>
                update("experiences", [
                  ...cv.experiences,
                  { id: uid(), title: "", company: "", start: "", end: "", description: "" },
                ])
              }>Add experience</AddBtn>
            }
          >
            <div className="space-y-3">
              {cv.experiences.map((exp, idx) => (
                <div key={exp.id} className="rounded-2xl border border-line p-4">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="text-[14px] font-semibold text-ink">Experience {idx + 1}</h4>
                    <RemoveBtn onClick={() => update("experiences", cv.experiences.filter((e) => e.id !== exp.id))} />
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <input className="input-base" placeholder="Job title" value={exp.title}
                      onChange={(e) => update("experiences", cv.experiences.map((x) => x.id === exp.id ? { ...x, title: e.target.value } : x))} />
                    <input className="input-base" placeholder="Company" value={exp.company}
                      onChange={(e) => update("experiences", cv.experiences.map((x) => x.id === exp.id ? { ...x, company: e.target.value } : x))} />
                    <input className="input-base" placeholder="Start (e.g. 2022)" value={exp.start}
                      onChange={(e) => update("experiences", cv.experiences.map((x) => x.id === exp.id ? { ...x, start: e.target.value } : x))} />
                    <input className="input-base" placeholder="End (e.g. Present)" value={exp.end}
                      onChange={(e) => update("experiences", cv.experiences.map((x) => x.id === exp.id ? { ...x, end: e.target.value } : x))} />
                  </div>
                  <textarea className="textarea-base mt-3" rows={3} placeholder="Describe your impact..." value={exp.description}
                    onChange={(e) => update("experiences", cv.experiences.map((x) => x.id === exp.id ? { ...x, description: e.target.value } : x))} />
                </div>
              ))}
            </div>
          </Card>

          <Card
            title="Education"
            action={
              <AddBtn onClick={() =>
                update("education", [...cv.education, { id: uid(), school: "", degree: "", field: "", date: "" }])
              }>Add education</AddBtn>
            }
          >
            <div className="space-y-3">
              {cv.education.map((ed, idx) => (
                <div key={ed.id} className="rounded-2xl border border-line p-4">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="text-[14px] font-semibold text-ink">Education {idx + 1}</h4>
                    <RemoveBtn onClick={() => update("education", cv.education.filter((e) => e.id !== ed.id))} />
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <input className="input-base" placeholder="School" value={ed.school}
                      onChange={(e) => update("education", cv.education.map((x) => x.id === ed.id ? { ...x, school: e.target.value } : x))} />
                    <input className="input-base" placeholder="Degree" value={ed.degree}
                      onChange={(e) => update("education", cv.education.map((x) => x.id === ed.id ? { ...x, degree: e.target.value } : x))} />
                    <input className="input-base" placeholder="Field of study" value={ed.field}
                      onChange={(e) => update("education", cv.education.map((x) => x.id === ed.id ? { ...x, field: e.target.value } : x))} />
                    <input className="input-base" placeholder="Graduation date" value={ed.date}
                      onChange={(e) => update("education", cv.education.map((x) => x.id === ed.id ? { ...x, date: e.target.value } : x))} />
                  </div>
                </div>
              ))}
            </div>
          </Card>

          <Card title="Skills">
            <div className="flex flex-wrap gap-2 mb-3">
              {cv.skills.map((s) => (
                <span key={s} className="inline-flex items-center gap-1.5 rounded-full bg-surface-2 border border-line px-3 py-1.5 text-[13px] text-ink">
                  {s}
                  <button
                    type="button"
                    onClick={() => update("skills", cv.skills.filter((x) => x !== s))}
                    aria-label={`Remove ${s}`}
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
              placeholder="Type a skill and press Enter"
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
              style={{ width: "794px", minHeight: "1123px", padding: "64px", transform: `scale(${zoom})` }}
            >
              <header className="text-center mb-8">
                <h2 className="text-[28px] font-semibold text-ink">{cv.fullName || "Your name"}</h2>
                <p className="text-[12px] text-ink-muted mt-2">
                  {[cv.email, cv.phone, cv.location].filter(Boolean).join(" · ")}
                </p>
              </header>

              {cv.summary && (
                <p className="italic text-[14px] text-ink-muted mb-8 leading-relaxed whitespace-pre-line">{cv.summary}</p>
              )}

              {cv.experiences.length > 0 && (
                <Section title="Experience">
                  {cv.experiences.map((e) => (
                    <div key={e.id} className="mb-5">
                      <div className="flex items-baseline justify-between gap-3">
                        <p className="text-[15px] font-semibold text-ink">{e.title || "Role"}{e.company && ` · ${e.company}`}</p>
                        <p className="text-[12px] text-ink-muted whitespace-nowrap">{[e.start, e.end].filter(Boolean).join(" – ")}</p>
                      </div>
                      {e.description && <p className="text-[14px] text-ink-muted mt-1 leading-relaxed">{e.description}</p>}
                    </div>
                  ))}
                </Section>
              )}

              {cv.education.length > 0 && (
                <Section title="Education">
                  {cv.education.map((e) => (
                    <div key={e.id} className="mb-3">
                      <div className="flex items-baseline justify-between gap-3">
                        <p className="text-[15px] font-semibold text-ink">{e.school || "School"}</p>
                        <p className="text-[12px] text-ink-muted">{e.date}</p>
                      </div>
                      <p className="text-[14px] text-ink-muted">{[e.degree, e.field].filter(Boolean).join(", ")}</p>
                    </div>
                  ))}
                </Section>
              )}

              {cv.skills.length > 0 && (
                <Section title="Skills">
                  <p className="text-[14px] text-ink-muted">{cv.skills.join(" · ")}</p>
                </Section>
              )}
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
