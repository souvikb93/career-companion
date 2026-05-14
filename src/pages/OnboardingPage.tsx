import { useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Upload, ArrowRight, ArrowLeft, Plus, X, Check, Loader2, PenLine } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { parseCVFile, type ParsedProfile } from "@/lib/groq";
import { useProfile, EMPTY_PROFILE } from "@/lib/profile-store";
import { AuthCharacters } from "@/components/AuthCharacters";
import { BackgroundGradientAnimation } from "@/components/BackgroundGradientAnimation";
import { useT } from "@/lib/i18n";
import { toast } from "sonner";
import logo from "@/assets/logo.svg";

const uid = () => Math.random().toString(36).slice(2, 9);

type Step =
  | "upload"
  | "parsing"
  | "manual-1"
  | "manual-2"
  | "manual-3"
  | "manual-4"
  | "review";

const MANUAL_STEPS: Step[] = ["manual-1", "manual-2", "manual-3", "manual-4"];
const MANUAL_LABELS = ["Personal info", "Skills", "Experience", "Education"];

export default function OnboardingPage() {
  const navigate = useNavigate();
  const { t } = useT();
  const { saveProfile, completeOnboarding } = useProfile();
  const fileRef = useRef<HTMLInputElement>(null);

  const [step, setStep] = useState<Step>("upload");
  const [profile, setProfile] = useState<ParsedProfile>({ ...EMPTY_PROFILE });
  const [skillDraft, setSkillDraft] = useState("");
  const [saving, setSaving] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [doneSteps, setDoneSteps] = useState<number[]>([]);
  const [activeStep, setActiveStep] = useState(-1);

  const update = <K extends keyof ParsedProfile>(k: K, v: ParsedProfile[K]) =>
    setProfile((p) => ({ ...p, [k]: v }));

  const manualStepIndex = MANUAL_STEPS.indexOf(step);

  const handleFile = async (file: File) => {
    setDoneSteps([]);
    setActiveStep(0);
    setStep("parsing");

    const t1 = setTimeout(() => { setDoneSteps([0]);      setActiveStep(1); }, 1500);
    const t2 = setTimeout(() => { setDoneSteps([0, 1]);   setActiveStep(2); }, 3200);

    try {
      const parsed = await parseCVFile(file);
      clearTimeout(t1);
      clearTimeout(t2);
      // Ensure steps 0+1 are done and step 2 has been spinning for at least 400ms
      setDoneSteps([0, 1]);
      setActiveStep(2);
      await new Promise((r) => setTimeout(r, 500));
      setDoneSteps([0, 1, 2]);
      setActiveStep(-1);
      await new Promise((r) => setTimeout(r, 650));
      setProfile(parsed);
      setStep("review");
    } catch (e) {
      clearTimeout(t1);
      clearTimeout(t2);
      toast.error(e instanceof Error ? e.message : t("onboarding.cantParse"));
      setDoneSteps([]);
      setActiveStep(-1);
      setStep("upload");
    }
  };

  const onFileDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  };

  const confirm = async () => {
    setSaving(true);
    try {
      await completeOnboarding(profile);
      navigate("/", { replace: true });
    } catch {
      toast.error(t("onboarding.failedSave"));
    } finally {
      setSaving(false);
    }
  };

  const skip = async () => {
    await completeOnboarding();
    navigate("/", { replace: true });
  };

  const secondaryBtnClass = "w-full h-12 rounded-xl border border-line bg-white hover:bg-surface transition-colors flex items-center justify-center gap-2 text-[14px] font-medium text-ink";

  return (
    <div className="relative min-h-screen lg:h-screen lg:overflow-hidden grid lg:grid-cols-2">
      <BackgroundGradientAnimation containerClassName="absolute inset-0" interactive={false} />

      {/* ── Left panel — characters centred, logo + quote absolutely pinned (desktop) ── */}
      <div className="relative hidden lg:flex items-center justify-center p-12 overflow-hidden">
        <div className="absolute top-12 left-12 z-10 flex items-center gap-2">
          <img src={logo} alt="Tracka" className="h-9 w-9" />
          <span className="logo-wordmark text-[26px] leading-none text-ink">tracka</span>
        </div>

        <div className="relative z-10">
          <AuthCharacters />
        </div>

        <div className="absolute bottom-12 left-12 z-10">
          <blockquote className="text-[15px] text-ink-muted leading-relaxed max-w-xs">
            "{t("onboarding.tagline")}"
          </blockquote>
        </div>
      </div>

      {/* ── MOBILE upload step ── */}
      {step === "upload" && (
        <div className="relative flex flex-col min-h-screen lg:hidden">
          {/* Top bar */}
          <div className="sticky top-0 z-20 flex items-center justify-between px-6 h-14 border-b border-white/30 bg-white/50 backdrop-blur-md shrink-0">
            <div className="flex items-center gap-2">
              <img src={logo} alt="Tracka" className="h-7 w-7" />
              <span className="logo-wordmark text-[20px] leading-none text-ink">tracka</span>
            </div>
            <button onClick={skip} className="text-[13px] text-ink-muted hover:text-ink hover:underline underline-offset-2 transition-colors">
              {t("onboarding.skip")}
            </button>
          </div>

          {/* Form — takes only natural height */}
          <div className="shrink-0 px-8 pt-10 pb-4">
            <div className="mb-8">
              <h1 className="text-[32px] font-semibold text-ink tracking-tight leading-[1.1]">{t("onboarding.setupTitle")}</h1>
              <p className="text-[15px] text-ink-muted mt-2 leading-relaxed">{t("onboarding.setupSubtitle")}</p>
            </div>

            <div
              onClick={() => fileRef.current?.click()}
              className="border-2 border-dashed rounded-2xl p-8 flex flex-col items-center justify-center gap-3 cursor-pointer transition-all duration-200 border-line active:border-brand active:bg-brand/5"
            >
              <div className="h-14 w-14 rounded-2xl grid place-items-center bg-surface-2">
                <Upload className="h-6 w-6 text-ink-muted" />
              </div>
              <div className="text-center">
                <p className="text-[15px] font-semibold text-ink">{t("onboarding.uploadCv")}</p>
                <p className="text-[13px] text-ink-muted mt-1">{t("onboarding.browseHintMobile")}</p>
              </div>
            </div>

            <input
              ref={fileRef}
              type="file"
              accept=".pdf,.docx,.doc"
              className="hidden"
              onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile(f); }}
            />

            <div className="flex items-center gap-3 my-7">
              <div className="flex-1 h-px bg-line/60" />
              <span className="text-[12px] text-ink-muted">{t("onboarding.or")}</span>
              <div className="flex-1 h-px bg-line/60" />
            </div>

            <button
              type="button"
              onClick={() => setStep("manual-1")}
              className={secondaryBtnClass}
            >
              <PenLine className="h-4 w-4 text-ink-muted" />
              {t("onboarding.fillManually")}
            </button>
          </div>

          {/* Illustration — fills remaining space, centered */}
          <div className="flex-1 flex items-center justify-center overflow-hidden">
            <div style={{ width: 288, height: 204, overflow: "hidden" }}>
              <div style={{ transform: "scale(0.6) translateX(38px)", transformOrigin: "top left" }}>
                <AuthCharacters idleMode />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Right panel — frosted, scrollable (desktop always, mobile for non-upload steps) ── */}
      <div className={cn(
        "relative flex flex-col min-h-screen lg:h-screen bg-white/60 backdrop-blur-xl",
        step === "upload" ? "hidden lg:flex" : "flex"
      )}>

        {/* Top bar — mobile only (desktop has logo on left panel) */}
        <div className="sticky top-0 z-20 flex items-center justify-between px-6 sm:px-10 h-14 border-b border-white/30 bg-white/60 backdrop-blur-xl shrink-0 lg:hidden">
          <div className="flex items-center gap-2">
            <img src={logo} alt="Tracka" className="h-7 w-7" />
            <span className="logo-wordmark text-[20px] leading-none text-ink">tracka</span>
          </div>
          {step !== "parsing" && (
            <button onClick={skip} className="text-[13px] text-ink-muted hover:text-ink hover:underline underline-offset-2 transition-colors">
              {t("onboarding.skip")}
            </button>
          )}
        </div>
        {/* Desktop skip — just the link, top-right of right panel */}
        {step !== "parsing" && (
          <div className="hidden lg:flex justify-end px-10 pt-6 shrink-0">
            <button onClick={skip} className="text-[13px] text-ink-muted hover:text-ink hover:underline underline-offset-2 transition-colors">
              {t("onboarding.skip")}
            </button>
          </div>
        )}

        <div className={cn(
          "relative z-10 flex-1 overflow-y-auto flex justify-center px-6 sm:px-10 py-10",
          step === "review" ? "items-start" : "items-center"
        )}>
          <div className="w-full max-w-lg">

            {/* ── UPLOAD (desktop only) ── */}
            {step === "upload" && (
              <div>
                <h1 className="text-[30px] font-semibold text-ink mb-1">{t("onboarding.setupTitle")}</h1>
                <p className="text-[14px] text-ink-muted mb-8">{t("onboarding.setupSubtitle")}</p>

                <div
                  onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                  onDragLeave={() => setDragOver(false)}
                  onDrop={onFileDrop}
                  onClick={() => fileRef.current?.click()}
                  className={cn(
                    "border-2 border-dashed rounded-2xl p-14 flex flex-col items-center justify-center gap-4 cursor-pointer transition-all duration-200",
                    dragOver ? "border-brand bg-brand/5" : "border-line hover:border-brand hover:bg-surface"
                  )}
                >
                  <div className={cn(
                    "h-16 w-16 rounded-2xl grid place-items-center transition-colors",
                    dragOver ? "bg-brand/10" : "bg-surface-2"
                  )}>
                    <Upload className={cn("h-7 w-7 transition-colors", dragOver ? "text-brand" : "text-ink-muted")} />
                  </div>
                  <div className="text-center">
                    <p className="text-[15px] font-semibold text-ink">{t("onboarding.dropCv")}</p>
                    <p className="text-[13px] text-ink-muted mt-1">{t("onboarding.browseHint")}</p>
                  </div>
                </div>

                <input
                  ref={fileRef}
                  type="file"
                  accept=".pdf,.docx,.doc"
                  className="hidden"
                  onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile(f); }}
                />

                <div className="flex items-center gap-3 mt-6">
                  <div className="flex-1 h-px bg-line" />
                  <span className="text-[12px] text-ink-muted">{t("onboarding.or")}</span>
                  <div className="flex-1 h-px bg-line" />
                </div>

                <button
                  type="button"
                  onClick={() => setStep("manual-1")}
                  className={cn(secondaryBtnClass, "mt-6")}
                >
                  <PenLine className="h-4 w-4 text-ink-muted" />
                  {t("onboarding.fillManually")}
                </button>
              </div>
            )}

            {/* ── PARSING ── */}
            {step === "parsing" && (
              <div className="text-center py-8">
                <h1 className="text-[26px] font-semibold text-ink mb-2">{t("onboarding.readingTitle")}</h1>
                <p className="text-[14px] text-ink-muted mb-10">{t("onboarding.readingDesc")}</p>
                <div className="space-y-5 text-left max-w-xs mx-auto">
                  {[t("onboarding.step1"), t("onboarding.step2"), t("onboarding.step3")].map((label, i) => {
                    const done  = doneSteps.includes(i);
                    const active = activeStep === i;
                    return (
                      <div
                        key={i}
                        className={cn(
                          "flex items-center gap-4 text-[14px] transition-opacity duration-500",
                          active || done ? "opacity-100" : "opacity-25"
                        )}
                      >
                        {/* Icon slot — fixed size so layout never shifts */}
                        <span className="relative h-5 w-5 shrink-0">
                          {/* Spinner ring — visible only when active */}
                          {active && !done && (
                            <span className="absolute inset-0 rounded-full border-2 border-brand/30 border-t-brand animate-step-spin" />
                          )}
                          {/* Check — visible only when done, pops in once */}
                          {done && (
                            <span className="absolute inset-0 flex items-center justify-center animate-step-pop">
                              <span className="h-5 w-5 rounded-full bg-brand flex items-center justify-center">
                                <Check className="h-3 w-3 text-white" strokeWidth={3} />
                              </span>
                            </span>
                          )}
                          {/* Idle ring — visible when pending */}
                          {!active && !done && (
                            <span className="absolute inset-0 rounded-full border-2 border-line" />
                          )}
                        </span>
                        <span className={cn(
                          "transition-colors duration-300",
                          done ? "text-ink font-medium" : active ? "text-ink" : "text-ink-muted"
                        )}>
                          {label}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* ── MANUAL STEPS ── */}
            {manualStepIndex >= 0 && (
              <div>
                {/* Progress */}
                <div className="flex items-center gap-2 mb-8">
                  {MANUAL_STEPS.map((s, i) => (
                    <div key={s} className="flex items-center gap-2">
                      <div className={cn(
                        "h-7 w-7 rounded-full text-[12px] font-semibold grid place-items-center transition-colors",
                        i < manualStepIndex ? "bg-brand text-white" :
                        i === manualStepIndex ? "bg-ink text-white" :
                        "bg-surface-2 text-ink-muted"
                      )}>
                        {i < manualStepIndex ? <Check className="h-3.5 w-3.5" /> : i + 1}
                      </div>
                      <span className={cn("text-[12px] hidden sm:block", i === manualStepIndex ? "text-ink font-medium" : "text-ink-muted")}>
                        {(t("onboarding.stepLabels") as unknown as string[])[i] ?? MANUAL_LABELS[i]}
                      </span>
                      {i < MANUAL_STEPS.length - 1 && <div className="w-6 h-px bg-line mx-1" />}
                    </div>
                  ))}
                </div>

                {step === "manual-1" && (
                  <div>
                    <h1 className="text-[26px] font-semibold text-ink mb-6">{t("onboarding.personalInfo")}</h1>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <Field label={t("onboarding.fullName")}><Input className="h-11" value={profile.fullName} onChange={(e) => update("fullName", e.target.value)} placeholder="Jane Smith" /></Field>
                      <Field label={t("onboarding.professionalTitle")}><Input className="h-11" value={profile.title} onChange={(e) => update("title", e.target.value)} placeholder="e.g. Product Designer" /></Field>
                      <Field label={t("onboarding.email")}><Input className="h-11" value={profile.email} onChange={(e) => update("email", e.target.value)} placeholder="jane@example.com" /></Field>
                      <Field label={t("onboarding.phone")}><Input className="h-11" value={profile.phone} onChange={(e) => update("phone", e.target.value)} placeholder="+49 123 456789" /></Field>
                      <Field label={t("onboarding.location")}><Input className="h-11" value={profile.location} onChange={(e) => update("location", e.target.value)} placeholder="Berlin, Germany" /></Field>
                      <Field label={t("onboarding.linkedin")}><Input className="h-11" value={profile.linkedin} onChange={(e) => update("linkedin", e.target.value)} placeholder="linkedin.com/in/jane" /></Field>
                    </div>
                    <Field label={t("onboarding.summary")} className="mt-4">
                      <textarea
                        className="textarea-base"
                        rows={3}
                        value={profile.summary}
                        onChange={(e) => update("summary", e.target.value)}
                        placeholder={t("onboarding.summaryPlaceholder")}
                      />
                    </Field>
                  </div>
                )}

                {step === "manual-2" && (
                  <div>
                    <h1 className="text-[26px] font-semibold text-ink mb-2">{t("onboarding.skillsTitle")}</h1>
                    <p className="text-[14px] text-ink-muted mb-6">{t("onboarding.skillsHint")}</p>
                    <div className="flex flex-wrap gap-2 mb-4 min-h-[40px]">
                      {profile.skills.map((s) => (
                        <span key={s} className="inline-flex items-center gap-1.5 rounded-full bg-surface-2 border border-line px-3 py-1.5 text-[13px] text-ink">
                          {s}
                          <button type="button" onClick={() => update("skills", profile.skills.filter((x) => x !== s))}>
                            <X className="h-3 w-3 text-ink-muted hover:text-ink" />
                          </button>
                        </span>
                      ))}
                    </div>
                    <Input
                      className="h-11"
                      value={skillDraft}
                      onChange={(e) => setSkillDraft(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" && skillDraft.trim()) {
                          e.preventDefault();
                          update("skills", [...profile.skills, skillDraft.trim()]);
                          setSkillDraft("");
                        }
                      }}
                      placeholder={t("onboarding.skillPlaceholder")}
                    />
                  </div>
                )}

                {step === "manual-3" && (
                  <div>
                    <h1 className="text-[26px] font-semibold text-ink mb-6">{t("onboarding.experienceTitle")}</h1>
                    <div className="space-y-4">
                      {profile.experiences.map((exp, idx) => (
                        <div key={exp.id} className="rounded-2xl border border-line p-4 relative">
                          <div className="flex items-center justify-between mb-3">
                            <span className="text-[13px] font-semibold text-ink">{t("onboarding.experience", { n: idx + 1 })}</span>
                            <button type="button" onClick={() => update("experiences", profile.experiences.filter((e) => e.id !== exp.id))} className="h-7 w-7 rounded-full grid place-items-center text-ink-muted hover:text-ink hover:bg-surface-2 transition-colors">
                              <X className="h-3.5 w-3.5" />
                            </button>
                          </div>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <Input className="h-10" placeholder={t("onboarding.jobTitlePlaceholder")} value={exp.title} onChange={(e) => update("experiences", profile.experiences.map((x) => x.id === exp.id ? { ...x, title: e.target.value } : x))} />
                            <Input className="h-10" placeholder="Company" value={exp.company} onChange={(e) => update("experiences", profile.experiences.map((x) => x.id === exp.id ? { ...x, company: e.target.value } : x))} />
                            <Input className="h-10" placeholder="Start (e.g. Jan 2022)" value={exp.start} onChange={(e) => update("experiences", profile.experiences.map((x) => x.id === exp.id ? { ...x, start: e.target.value } : x))} />
                            <Input className="h-10" placeholder="End (or Present)" value={exp.end} onChange={(e) => update("experiences", profile.experiences.map((x) => x.id === exp.id ? { ...x, end: e.target.value } : x))} />
                          </div>
                          <textarea className="textarea-base mt-3" rows={2} placeholder={t("onboarding.expDescPlaceholder")} value={exp.description} onChange={(e) => update("experiences", profile.experiences.map((x) => x.id === exp.id ? { ...x, description: e.target.value } : x))} />
                        </div>
                      ))}
                    </div>
                    <button type="button" onClick={() => update("experiences", [...profile.experiences, { id: uid(), title: "", company: "", start: "", end: "", description: "" }])} className="mt-4 flex items-center gap-1.5 text-[13px] text-brand font-medium hover:underline">
                      <Plus className="h-3.5 w-3.5" /> {t("onboarding.addExperience")}
                    </button>
                  </div>
                )}

                {step === "manual-4" && (
                  <div>
                    <h1 className="text-[26px] font-semibold text-ink mb-6">{t("onboarding.educationTitle")}</h1>
                    <div className="space-y-4">
                      {profile.education.map((ed, idx) => (
                        <div key={ed.id} className="rounded-2xl border border-line p-4 relative">
                          <div className="flex items-center justify-between mb-3">
                            <span className="text-[13px] font-semibold text-ink">{t("onboarding.education", { n: idx + 1 })}</span>
                            <button type="button" onClick={() => update("education", profile.education.filter((e) => e.id !== ed.id))} className="h-7 w-7 rounded-full grid place-items-center text-ink-muted hover:text-ink hover:bg-surface-2 transition-colors">
                              <X className="h-3.5 w-3.5" />
                            </button>
                          </div>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <Input className="h-10" placeholder={t("onboarding.institutionPlaceholder")} value={ed.school} onChange={(e) => update("education", profile.education.map((x) => x.id === ed.id ? { ...x, school: e.target.value } : x))} />
                            <Input className="h-10" placeholder="Degree" value={ed.degree} onChange={(e) => update("education", profile.education.map((x) => x.id === ed.id ? { ...x, degree: e.target.value } : x))} />
                            <Input className="h-10" placeholder="Field of study" value={ed.field} onChange={(e) => update("education", profile.education.map((x) => x.id === ed.id ? { ...x, field: e.target.value } : x))} />
                            <Input className="h-10" placeholder="Graduation year" value={ed.date} onChange={(e) => update("education", profile.education.map((x) => x.id === ed.id ? { ...x, date: e.target.value } : x))} />
                          </div>
                        </div>
                      ))}
                    </div>
                    <button type="button" onClick={() => update("education", [...profile.education, { id: uid(), school: "", degree: "", field: "", date: "" }])} className="mt-4 flex items-center gap-1.5 text-[13px] text-brand font-medium hover:underline">
                      <Plus className="h-3.5 w-3.5" /> {t("onboarding.addEducation")}
                    </button>
                  </div>
                )}

                {/* Step nav */}
                <div className="flex items-center justify-between mt-8">
                  <button
                    onClick={() => setStep(manualStepIndex === 0 ? "upload" : MANUAL_STEPS[manualStepIndex - 1])}
                    className="flex items-center gap-1.5 text-[13px] text-ink-muted hover:text-ink transition-colors"
                  >
                    <ArrowLeft className="h-3.5 w-3.5" /> {t("onboarding.back")}
                  </button>
                  <div className="flex items-center gap-3">
                    {(step === "manual-3" || step === "manual-4") && (
                      <button onClick={() => setStep(manualStepIndex === MANUAL_STEPS.length - 1 ? "review" : MANUAL_STEPS[manualStepIndex + 1])} className="text-[13px] text-ink-muted hover:text-ink transition-colors">
                        {t("onboarding.skipStep")}
                      </button>
                    )}
                    <button
                      onClick={() => setStep(manualStepIndex === MANUAL_STEPS.length - 1 ? "review" : MANUAL_STEPS[manualStepIndex + 1])}
                      className="h-10 px-5 rounded-xl bg-ink text-white text-[13px] font-medium hover:bg-brand transition-colors flex items-center gap-2"
                    >
                      {manualStepIndex === MANUAL_STEPS.length - 1 ? t("onboarding.review") : t("onboarding.next")} <ArrowRight className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* ── REVIEW ── */}
            {step === "review" && (
              <div>
                <button onClick={() => setStep("manual-4")} className="flex items-center gap-1.5 text-[13px] text-ink-muted hover:text-ink mb-6 transition-colors">
                  <ArrowLeft className="h-3.5 w-3.5" /> {t("onboarding.back")}
                </button>
                <h1 className="text-[26px] font-semibold text-ink mb-1">{t("onboarding.reviewTitle")}</h1>
                <p className="text-[14px] text-ink-muted mb-6">{t("onboarding.reviewDesc")}</p>

                <div className="space-y-4 mb-8">
                  <ReviewSection title={t("onboarding.personalInfo")} onEdit={() => setStep("manual-1")}>
                    <div className="grid grid-cols-2 gap-x-6 gap-y-1 text-[13px]">
                      <ReviewRow label={t("onboarding.name")} value={profile.fullName} />
                      <ReviewRow label={t("onboarding.title")} value={profile.title} />
                      <ReviewRow label={t("onboarding.email")} value={profile.email} />
                      <ReviewRow label={t("onboarding.phone")} value={profile.phone} />
                      <ReviewRow label={t("onboarding.location")} value={profile.location} />
                      <ReviewRow label="LinkedIn" value={profile.linkedin} />
                    </div>
                    {profile.summary && <p className="text-[13px] text-ink-muted mt-2 leading-relaxed">{profile.summary}</p>}
                  </ReviewSection>

                  {profile.skills.length > 0 && (
                    <ReviewSection title={t("onboarding.skillsTitle")} onEdit={() => setStep("manual-2")}>
                      <div className="flex flex-wrap gap-1.5">
                        {profile.skills.map((s) => (
                          <span key={s} className="rounded-full bg-surface-2 border border-line px-2.5 py-1 text-[12px] text-ink">{s}</span>
                        ))}
                      </div>
                    </ReviewSection>
                  )}

                  {profile.experiences.length > 0 && (
                    <ReviewSection title={t("onboarding.experienceTitle")} onEdit={() => setStep("manual-3")}>
                      {profile.experiences.map((e) => (
                        <div key={e.id} className="text-[13px] mb-2">
                          <span className="font-medium text-ink">{e.title}{e.company ? ` · ${e.company}` : ""}</span>
                          {(e.start || e.end) && <span className="text-ink-muted ml-2">{[e.start, e.end].filter(Boolean).join(" – ")}</span>}
                        </div>
                      ))}
                    </ReviewSection>
                  )}

                  {profile.education.length > 0 && (
                    <ReviewSection title={t("onboarding.educationTitle")} onEdit={() => setStep("manual-4")}>
                      {profile.education.map((e) => (
                        <div key={e.id} className="text-[13px] mb-1">
                          <span className="font-medium text-ink">{e.degree}{e.school ? ` · ${e.school}` : ""}</span>
                          {e.date && <span className="text-ink-muted ml-2">{e.date}</span>}
                        </div>
                      ))}
                    </ReviewSection>
                  )}
                </div>

                <button
                  onClick={confirm}
                  disabled={saving}
                  className="w-full h-12 rounded-xl bg-ink text-white font-medium hover:bg-brand transition-colors flex items-center justify-center gap-2 disabled:opacity-60"
                >
                  {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
                  {saving ? t("onboarding.saving") : t("onboarding.confirm")}
                </button>
              </div>
            )}

          </div>
        </div>
      </div>
    </div>
  );
}

function Field({ label, children, className }: { label: string; children: React.ReactNode; className?: string }) {
  return (
    <div className={className}>
      <Label className="text-[12px] font-medium text-ink-muted mb-1 block">{label}</Label>
      {children}
    </div>
  );
}

function ReviewSection({ title, children, onEdit }: { title: string; children: React.ReactNode; onEdit: () => void }) {
  return (
    <div className="rounded-2xl border border-line p-4">
      <div className="flex items-center justify-between mb-3">
        <span className="text-[13px] font-semibold text-ink">{title}</span>
        <button onClick={onEdit} className="text-[12px] text-brand hover:underline">Edit</button>
      </div>
      {children}
    </div>
  );
}

function ReviewRow({ label, value }: { label: string; value: string }) {
  if (!value) return null;
  return (
    <div className="min-w-0">
      <span className="text-ink-muted">{label}: </span>
      <span className="text-ink break-all line-clamp-1">{value}</span>
    </div>
  );
}
