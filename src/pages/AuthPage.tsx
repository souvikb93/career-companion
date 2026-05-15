import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { z } from "zod";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { applyTheme } from "@/lib/theme";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { ArrowLeft, ArrowRight, Mail, X } from "lucide-react";
import { AuthCharacters } from "@/components/AuthCharacters";
import { BackgroundGradientAnimation } from "@/components/BackgroundGradientAnimation";
import { LanguageToggle } from "@/components/LanguageToggle";
import { ThemeDevToggle } from "@/components/TopNav";
import { useT } from "@/lib/i18n";
import logo from "@/assets/logo.svg";

const emailSchema = z.string().trim().email({ message: "Enter a valid email" }).max(255);

type ModalType = "privacy" | "terms" | "contact" | null;

const MODAL_CONTENT: Record<NonNullable<ModalType>, { title: string; body: React.ReactNode }> = {
  privacy: {
    title: "Privacy Policy",
    body: (
      <div className="space-y-4 text-[13px] text-ink-muted leading-relaxed">
        <p className="text-[12px] font-semibold text-ink-muted uppercase tracking-wide">Last updated: May 2025</p>
        <Section heading="What we collect">
          We collect your email address when you sign in, and any profile information you choose to provide — such as your name, work history, and skills. We also store the job applications you track and the CV content you create.
        </Section>
        <Section heading="How we use it">
          Your data is used solely to provide Tracka's features: powering your CV builder, cover letter generator, and job tracker. We do not sell, rent, or share your personal data with third parties for marketing purposes.
        </Section>
        <Section heading="Storage & security">
          All data is stored securely via Supabase, hosted on servers in the EU. Data is encrypted at rest and in transit. Access is restricted to your account only.
        </Section>
        <Section heading="Your rights">
          You can view, edit, or delete your data at any time from your Profile and Settings pages. Deleting your account permanently removes all stored data within 30 days.
        </Section>
        <Section heading="Cookies">
          We use only essential session cookies required to keep you signed in. No tracking or advertising cookies are used.
        </Section>
        <Section heading="Contact">
          For privacy-related questions, email us at <a href="mailto:souvik.b@alumni.nid.edu" className="text-brand hover:underline">souvik.b@alumni.nid.edu</a>.
        </Section>
      </div>
    ),
  },
  terms: {
    title: "Terms of Service",
    body: (
      <div className="space-y-4 text-[13px] text-ink-muted leading-relaxed">
        <p className="text-[12px] font-semibold text-ink-muted uppercase tracking-wide">Last updated: May 2025</p>
        <Section heading="Acceptance">
          By creating a Tracka account you agree to these terms. If you do not agree, please do not use the service.
        </Section>
        <Section heading="Use of the service">
          Tracka is provided for personal, non-commercial use to help you manage job applications. You must not use Tracka to scrape, harvest, or redistribute data, or to engage in any unlawful activity.
        </Section>
        <Section heading="Your content">
          You own all content you create in Tracka — your CV, cover letters, and job data. By storing it with us you grant us a limited licence to process it solely to provide the service to you.
        </Section>
        <Section heading="AI-generated content">
          Tracka uses AI to generate CV text and cover letters. You are responsible for reviewing and verifying any AI output before submitting it to employers.
        </Section>
        <Section heading="Account termination">
          We reserve the right to suspend or terminate accounts that violate these terms. You may delete your account at any time from Settings.
        </Section>
        <Section heading="Disclaimer">
          Tracka is provided "as is" without warranties of any kind. We do not guarantee job application outcomes or the accuracy of AI-generated content.
        </Section>
        <Section heading="Changes">
          We may update these terms from time to time. Continued use of the service after changes constitutes acceptance.
        </Section>
      </div>
    ),
  },
  contact: {
    title: "Contact Us",
    body: (
      <div className="space-y-5 text-[13px] text-ink-muted leading-relaxed">
        <p>We'd love to hear from you — whether it's a bug report, a feature idea, or a general question.</p>
        <div className="space-y-4">
          <ContactRow label="Email" value="souvik.b@alumni.nid.edu" href="mailto:souvik.b@alumni.nid.edu" />
          <ContactRow label="Phone" value="+49 162 801 1261" />
          <ContactRow label="Response time" value="We aim to reply within 1–2 business days." />
        </div>
        <p className="text-[12px] text-ink-muted border-t border-line pt-4">
          For urgent issues or account deletion requests, please include your registered email address in your message.
        </p>
      </div>
    ),
  },
};

function Section({ heading, children }: { heading: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="font-semibold text-ink mb-1">{heading}</p>
      <p>{children}</p>
    </div>
  );
}

function ContactRow({ label, value, href }: { label: string; value: string; href?: string }) {
  return (
    <div className="flex gap-3">
      <span className="w-32 shrink-0 font-medium text-ink">{label}</span>
      {href
        ? <a href={href} className="text-brand hover:underline underline-offset-2">{value}</a>
        : <span>{value}</span>
      }
    </div>
  );
}

function InfoModal({ type, onClose }: { type: NonNullable<ModalType>; onClose: () => void }) {
  const { title, body } = MODAL_CONTENT[type];
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 modal-backdrop" onClick={onClose} />
      <div className="relative glass-modal w-full max-w-lg max-h-[80vh] flex flex-col">
        <div className="flex items-center justify-between px-6 py-5 border-b border-line/60">
          <h2 className="modal-heading !mb-0">{title}</h2>
          <button
            onClick={onClose}
            aria-label="Close"
            className="h-7 w-7 rounded-full grid place-items-center text-ink-muted hover:bg-surface-2 transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
        <div className="overflow-y-auto px-6 py-5">
          {body}
        </div>
      </div>
    </div>
  );
}

export default function AuthPage() {
  const navigate = useNavigate();
  const { session } = useAuth();
  const [step, setStep] = useState<"email" | "sent">("email");
  const [email, setEmail] = useState("");
  const [emailLoading, setEmailLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [googleError, setGoogleError] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [modal, setModal] = useState<ModalType>(null);
  const { t } = useT();

  useEffect(() => {
    const stored = (localStorage.getItem("tracka_theme") as "light" | "dark" | "auto") || "auto";
    applyTheme(stored);
  }, []);

  useEffect(() => {
    if (session) navigate("/", { replace: true });
  }, [session, navigate]);

  const sendLink = async () => {
    const parsed = emailSchema.safeParse(email);
    if (!parsed.success) { toast.error(parsed.error.errors[0].message); return; }
    setEmailLoading(true);
    const { error } = await supabase.auth.signInWithOtp({
      email: parsed.data,
      options: { shouldCreateUser: true, emailRedirectTo: window.location.origin },
    });
    setEmailLoading(false);
    if (error) { toast.error(error.message); return; }
    setStep("sent");
  };

  const signInGoogle = async () => {
    setGoogleError(false);
    setGoogleLoading(true);
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: window.location.origin },
    });
    if (error) {
      setGoogleError(true);
      setGoogleLoading(false);
    }
  };

  return (
    <>
      <div className="relative min-h-screen lg:h-screen lg:overflow-hidden grid lg:grid-cols-2">
        <BackgroundGradientAnimation containerClassName="absolute inset-0" interactive={false} />

        {/* ── Left — characters centred, logo + quote absolutely pinned ── */}
        <div className="relative hidden lg:flex items-center justify-center overflow-hidden">
          {/* Dark-mode only: subtle veil over mesh */}
          <div className="absolute inset-0 z-0 auth-left-veil" />

          <div className="absolute top-12 left-12 z-10 flex items-center gap-2">
            <img src={logo} alt="Tracka" className="h-9 w-9" />
            <span className="logo-wordmark text-[26px] leading-none text-ink">tracka</span>
          </div>

          <div className="relative z-10">
            <AuthCharacters isTyping={isTyping} />
          </div>

          <div className="absolute bottom-12 left-12 z-10">
            <blockquote className="text-[15px] text-ink-muted leading-relaxed max-w-xs">
              "{t("auth.tagline")}"
            </blockquote>
            <div className="flex items-center gap-8 mt-6 text-xs text-ink-muted">
              {(["privacy", "terms", "contact"] as const).map((key) => (
                <button
                  key={key}
                  onClick={() => setModal(key)}
                  className="capitalize hover:text-ink hover:underline underline-offset-2 transition-colors"
                >
                  {key === "privacy" ? "Privacy" : key === "terms" ? "Terms" : "Contact"}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* ── Right — card centred, language toggle absolutely pinned ── */}
        <div className="relative flex flex-col bg-white/30 backdrop-blur-md glass-page-panel overflow-hidden">
          {/* Mobile top bar */}
          <div className="lg:hidden sticky top-0 z-10 flex items-center justify-between px-6 h-14 bg-white/50 backdrop-blur-md border-b border-white/30 glass-page-topbar shrink-0">
            <div className="flex items-center gap-2">
              <img src={logo} alt="Tracka" className="h-7 w-7" />
              <span className="logo-wordmark text-[20px] leading-none text-ink">tracka</span>
            </div>
            <div className="flex items-center gap-1">
              <ThemeDevToggle />
              <LanguageToggle />
            </div>
          </div>

          {/* Desktop language toggle */}
          <div className="hidden lg:flex items-center gap-1 absolute top-12 right-12 z-10">
            <ThemeDevToggle />
            <LanguageToggle />
          </div>

          {/* ── MOBILE content ── */}
          <div className="lg:hidden flex flex-col overflow-hidden" style={{ minHeight: "calc(100vh - 56px)" }}>

            {/* Form — takes only what it needs */}
            <div className="shrink-0 px-8 pt-10 pb-4">
              {step === "email" ? (
                <>
                  <div className="mb-8">
                    <h1 className="text-[32px] font-semibold text-ink tracking-tight leading-[1.1]">{t("auth.getStarted")}</h1>
                    <p className="text-[15px] text-ink-muted mt-2 leading-relaxed">{t("auth.subtitleMobile")}</p>
                  </div>

                  <div className="space-y-3">
                    <Label htmlFor="email-m" className="text-[13px] font-medium text-ink-muted">{t("auth.emailLabel")}</Label>
                    <Input
                      id="email-m"
                      type="email"
                      placeholder="you@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      onFocus={() => setIsTyping(true)}
                      onBlur={() => setIsTyping(false)}
                      onKeyDown={(e) => e.key === "Enter" && sendLink()}
                      className="glass-input h-12 text-[15px]"
                    />

                    <button
                      type="button"
                      onClick={sendLink}
                      disabled={emailLoading}
                      className="split-panel-btn-primary w-full h-12"
                    >
                      {emailLoading ? t("auth.sending") : (
                        <>{t("auth.continueShort")} <ArrowRight className="h-4 w-4" /></>
                      )}
                    </button>
                  </div>

                  <div className="flex items-center gap-3 my-7">
                    <div className="flex-1 h-px bg-line/60" />
                    <span className="text-[12px] text-ink-muted">{t("auth.orMobile")}</span>
                    <div className="flex-1 h-px bg-line/60" />
                  </div>

                  <button
                    type="button"
                    onClick={signInGoogle}
                    disabled={googleLoading}
                    className="split-panel-btn w-full h-12 flex items-center justify-center gap-3 text-[14px] font-medium text-ink disabled:opacity-60"
                  >
                    {googleLoading ? (
                      <span className="h-4 w-4 rounded-full border-2 border-ink border-t-transparent animate-spin" />
                    ) : (
                      <svg className="h-4 w-4 shrink-0" viewBox="0 0 24 24">
                        <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                        <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                        <path fill="#FBBC05" d="M5.84 14.1c-.22-.66-.35-1.36-.35-2.1s.13-1.44.35-2.1V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.83z"/>
                        <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.83C6.71 7.31 9.14 5.38 12 5.38z"/>
                      </svg>
                    )}
                    {t("auth.continueGoogle")}
                  </button>

                  {googleError && (
                    <div className="mt-3 rounded-xl border border-amber-200 bg-amber-50/80 backdrop-blur-md px-4 py-3 text-[13px] text-amber-800">
                      {t("auth.googleError")}
                    </div>
                  )}
                </>
              ) : (
                <>
                  <div className="h-14 w-14 rounded-2xl bg-white/50 backdrop-blur-md border border-white/60 grid place-items-center mb-6">
                    <Mail className="h-6 w-6 text-brand" />
                  </div>
                  <h1 className="text-[28px] font-semibold text-ink tracking-tight leading-tight">{t("auth.checkInbox")}</h1>
                  <p className="text-[14px] text-ink-muted mt-2">{t("auth.sentTo")}</p>
                  <p className="text-[15px] font-medium text-ink mt-1">{email}</p>
                  <p className="text-[13px] text-ink-muted mt-6 leading-relaxed">
                    {t("auth.clickLink")}<br />{t("auth.checkSpam")}
                  </p>
                  <div className="mt-8 space-y-3">
                    <button type="button" onClick={() => setStep("email")} className="split-panel-btn w-full h-12 flex items-center justify-center gap-2 text-[14px] font-medium text-ink">
                      <ArrowLeft className="h-4 w-4" /> {t("auth.differentEmail")}
                    </button>
                    <button type="button" onClick={sendLink} disabled={emailLoading} className="w-full text-[13px] text-ink-muted hover:text-ink transition-colors">
                      {emailLoading ? t("auth.sending") : t("auth.resendLink")}
                    </button>
                  </div>
                </>
              )}
            </div>

            {/* Illustration — centered in remaining space below form */}
            <div className="flex-1 flex items-center justify-center">
              <div style={{ width: 288, height: 204, overflow: "hidden" }}>
                <div style={{ transform: "scale(0.6) translateX(38px)", transformOrigin: "top left", width: 480 }}>
                  <AuthCharacters idleMode />
                </div>
              </div>
            </div>
          </div>

          {/* ── DESKTOP content (original) ── */}
          <div className="hidden lg:flex flex-1 items-center justify-center px-8 overflow-hidden">
            <div className="w-full max-w-[400px] glass-modal p-8">
              {step === "email" ? (
                <>
                  <div className="mb-5">
                    <h1 className="text-[28px] font-semibold text-ink tracking-tight">{t("auth.getStarted")}</h1>
                    <p className="text-[14px] text-ink-muted mt-2">{t("auth.subtitle")}</p>
                  </div>

                  <div className="space-y-4">
                    <div className="space-y-1.5">
                      <Label htmlFor="email-d" className="text-[13px] font-medium text-ink">{t("auth.emailLabel")}</Label>
                      <Input
                        id="email-d"
                        type="email"
                        placeholder="you@example.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        onFocus={() => setIsTyping(true)}
                        onBlur={() => setIsTyping(false)}
                        onKeyDown={(e) => e.key === "Enter" && sendLink()}
                        autoFocus
                        className="h-11"
                      />
                    </div>

                    <button
                      type="button"
                      onClick={sendLink}
                      disabled={emailLoading}
                      className="split-panel-btn-primary w-full h-11"
                    >
                      {emailLoading ? t("auth.sending") : t("auth.continueEmail")}
                    </button>

                    <div className="flex items-center gap-3">
                      <div className="flex-1 h-px bg-line" />
                      <span className="text-[12px] text-ink-muted">{t("auth.orEmail")}</span>
                      <div className="flex-1 h-px bg-line" />
                    </div>

                    <button
                      type="button"
                      onClick={signInGoogle}
                      disabled={googleLoading}
                      className="split-panel-btn w-full h-11 flex items-center justify-center gap-3 text-[14px] font-medium text-ink disabled:opacity-60"
                    >
                      {googleLoading ? (
                        <span className="h-4 w-4 rounded-full border-2 border-ink border-t-transparent animate-spin" />
                      ) : (
                        <svg className="h-4 w-4 shrink-0" viewBox="0 0 24 24">
                          <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                          <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                          <path fill="#FBBC05" d="M5.84 14.1c-.22-.66-.35-1.36-.35-2.1s.13-1.44.35-2.1V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.83z"/>
                          <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.83C6.71 7.31 9.14 5.38 12 5.38z"/>
                        </svg>
                      )}
                      {t("auth.continueGoogle")}
                    </button>

                    {googleError && (
                      <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-[13px] text-amber-800">
                        {t("auth.googleError")}
                      </div>
                    )}
                  </div>
                </>
              ) : (
                <div className="text-center">
                  <div className="mx-auto h-16 w-16 rounded-2xl glass-chip grid place-items-center mb-6">
                    <Mail className="h-7 w-7 text-brand" />
                  </div>
                  <h1 className="text-[26px] font-semibold text-ink">{t("auth.checkInbox")}</h1>
                  <p className="text-[14px] text-ink-muted mt-2 mb-1">{t("auth.sentTo")}</p>
                  <p className="text-[14px] font-medium text-ink mb-6">{email}</p>
                  <p className="text-[13px] text-ink-muted mb-8">
                    {t("auth.clickLink")}<br />
                    {t("auth.checkSpam")}
                  </p>
                  <button
                    type="button"
                    onClick={() => setStep("email")}
                    className="split-panel-btn w-full h-11 flex items-center justify-center gap-2 text-[14px] font-medium text-ink"
                  >
                    <ArrowLeft className="h-4 w-4" /> {t("auth.differentEmail")}
                  </button>
                  <button
                    onClick={sendLink}
                    disabled={emailLoading}
                    className="w-full mt-3 text-[13px] text-ink-muted hover:text-ink transition-colors"
                  >
                    {emailLoading ? t("auth.sending") : t("auth.resendLink")}
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {modal && <InfoModal type={modal} onClose={() => setModal(null)} />}
    </>
  );
}
