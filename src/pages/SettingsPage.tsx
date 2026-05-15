import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Trash2, X, Sun, Moon, Monitor, Download, Smartphone, CheckCircle2, Loader2, MessageSquare } from "lucide-react";
import { PhoneInput } from "@/components/ui/phone-input";
import { isValidPhoneNumber } from "react-phone-number-input";
import { Checkbox } from "@/components/ui/checkbox";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useJobs } from "@/lib/jobs-store";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { useT } from "@/lib/i18n";
import { deleteAllSavedItems } from "@/lib/saved-items";
import { clearTrackaStorage } from "@/lib/storage";
import { applyTheme } from "@/lib/theme";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";

const THEME_KEY        = "tracka_theme";
const NOTIF_KEY        = "tracka_email_notif";
const MOBILE_NOTIF_KEY = "tracka_mobile_notif";
const MOBILE_PHONE_KEY = "tracka_mobile_phone";

type Theme = "light" | "auto" | "dark";

function getStoredTheme(): Theme {
  try { return (localStorage.getItem(THEME_KEY) as Theme) || "auto"; } catch { return "auto"; }
}
function getStoredNotif(): boolean {
  try { return localStorage.getItem(NOTIF_KEY) === "true"; } catch { return false; }
}
function getStoredMobileNotif(): boolean {
  try { return localStorage.getItem(MOBILE_NOTIF_KEY) === "true"; } catch { return false; }
}
function getStoredMobilePhone(): string {
  try { return localStorage.getItem(MOBILE_PHONE_KEY) ?? ""; } catch { return ""; }
}

/* ── Shared UI primitives ────────────────────────────────────── */

function Toggle({ enabled, onChange }: { enabled: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      role="switch"
      aria-checked={enabled}
      onClick={() => onChange(!enabled)}
      className={cn(
        "relative inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full transition-colors duration-200",
        enabled ? "bg-ink active-fill" : "bg-line"
      )}
    >
      <span className={cn(
        "inline-block h-4 w-4 transform rounded-full bg-white shadow-sm transition-transform duration-200",
        enabled ? "translate-x-6" : "translate-x-1"
      )} />
    </button>
  );
}

function Modal({ open, onClose, children }: {
  open: boolean; onClose: () => void; children: React.ReactNode;
}) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 modal-backdrop" onClick={onClose} />
      <div className="relative glass-modal p-6 w-full max-w-sm mx-4">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 h-7 w-7 rounded-full grid place-items-center text-ink-muted hover:bg-surface-2 transition-colors"
        >
          <X className="h-4 w-4" />
        </button>
        {children}
      </div>
    </div>
  );
}

/* ── Export Modal ────────────────────────────────────────────── */

const EXPORT_OPTIONS = [
  { id: "jobs",   label: "Jobs",         desc: "All tracked jobs as a CSV spreadsheet",   ext: "CSV"  },
  { id: "resume", label: "Resume",       desc: "Saved resume drafts as JSON",              ext: "JSON" },
  { id: "letter", label: "Cover Letter", desc: "Saved cover letter drafts as JSON",        ext: "JSON" },
] as const;

type ExportId = typeof EXPORT_OPTIONS[number]["id"];

function ExportModal({ open, onClose, jobs }: {
  open: boolean; onClose: () => void; jobs: ReturnType<typeof useJobs>["jobs"];
}) {
  const [selected, setSelected] = useState<ExportId>("jobs");

  const handleExport = () => {
    if (selected === "jobs") {
      if (!jobs.length) { toast.error("No jobs to export"); return; }
      const header = ["Company", "Role", "Location", "Salary", "Status", "Date Added"].join(",");
      const rows = jobs.map((j) =>
        [j.company, j.role, j.location, j.salary, j.status, j.dateAdded]
          .map((v) => `"${String(v ?? "").replace(/"/g, '""')}"`)
          .join(",")
      );
      const blob = new Blob([[header, ...rows].join("\n")], { type: "text/csv" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a"); a.href = url; a.download = "tracka-jobs.csv"; a.click();
      URL.revokeObjectURL(url);
      toast.success(`Exported ${jobs.length} job${jobs.length !== 1 ? "s" : ""}`);
    } else if (selected === "resume") {
      const draft = localStorage.getItem("tracka_cv_draft");
      if (!draft) { toast.error("No resume data to export"); return; }
      const blob = new Blob([draft], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a"); a.href = url; a.download = "tracka-resume.json"; a.click();
      URL.revokeObjectURL(url);
      toast.success("Resume data exported");
    } else if (selected === "letter") {
      const draft = localStorage.getItem("tracka_letter_draft");
      const msgs  = localStorage.getItem("tracka_letter_msgs_v2");
      const data  = JSON.stringify({ draft: draft ? JSON.parse(draft) : null, messages: msgs ? JSON.parse(msgs) : [] }, null, 2);
      const blob  = new Blob([data], { type: "application/json" });
      const url   = URL.createObjectURL(blob);
      const a = document.createElement("a"); a.href = url; a.download = "tracka-letter.json"; a.click();
      URL.revokeObjectURL(url);
      toast.success("Cover letter data exported");
    }
    onClose();
  };

  return (
    <Modal open={open} onClose={onClose}>
      <h2 className="modal-heading pr-8">Export Data</h2>
      <p className="modal-body">Choose what you'd like to export.</p>
      <div className="space-y-2 mb-6">
        {EXPORT_OPTIONS.map((opt) => (
          <button
            key={opt.id}
            type="button"
            onClick={() => setSelected(opt.id)}
            className={cn(
              "w-full flex items-center gap-3 p-3.5 rounded-xl border text-left transition-colors",
              selected === opt.id
                ? "border-brand bg-brand/[0.06]"
                : "border-line hover:border-brand/40 hover:bg-brand/[0.03]"
            )}
          >
            <Checkbox
              checked={selected === opt.id}
              onCheckedChange={() => setSelected(opt.id)}
              className="shrink-0 data-[state=checked]:bg-brand data-[state=checked]:border-brand focus-visible:ring-brand/50"
            />
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-[14px] font-medium text-ink">{opt.label}</span>
                <span className="text-[11px] font-semibold px-1.5 py-0.5 rounded bg-surface-2 text-ink-muted">{opt.ext}</span>
              </div>
              <p className="text-[12px] text-ink-muted mt-0.5">{opt.desc}</p>
            </div>
          </button>
        ))}
      </div>
      <div className="flex gap-3">
        <button onClick={onClose} className="btn-ghost flex-1 justify-center">Cancel</button>
        <button onClick={handleExport} className="btn-primary flex-1 justify-center">
          <Download className="h-3.5 w-3.5" /> Export
        </button>
      </div>
    </Modal>
  );
}

/* ── Delete Account Dialog ───────────────────────────────────── */

function DeleteAccountDialog({ open, deleting, onConfirm, onCancel }: {
  open: boolean; deleting: boolean;
  onConfirm: (deleteData: boolean) => void; onCancel: () => void;
}) {
  const { t } = useT();
  const [deleteData, setDeleteData] = useState(false);
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 modal-backdrop" onClick={() => !deleting && onCancel()} />
      <div className="relative glass-modal p-6 w-full max-w-sm mx-4">
        <button onClick={onCancel} disabled={deleting}
          className="absolute top-4 right-4 h-7 w-7 rounded-full grid place-items-center text-ink-muted hover:bg-surface-2 transition-colors disabled:opacity-40">
          <X className="h-4 w-4" />
        </button>
        <h2 className="modal-heading mb-2">{t("settings.deleteDialog.title")}</h2>
        <p className="modal-body">{t("settings.deleteDialog.subtitle")}</p>
        <label className="flex items-start gap-3 mb-6 cursor-pointer">
          <Checkbox
            id="delete-data-checkbox"
            checked={deleteData}
            onCheckedChange={(v) => setDeleteData(!!v)}
            className="mt-0.5 h-5 w-5 data-[state=checked]:bg-red-500 data-[state=checked]:border-red-500 focus-visible:ring-red-400/50"
          />
          <div>
            <p className="text-[14px] font-medium text-ink leading-snug">{t("settings.deleteDialog.deleteDataLabel")}</p>
            <p className="text-[12px] text-ink-muted mt-0.5">{t("settings.deleteDialog.deleteDataDesc")}</p>
          </div>
        </label>
        <div className="flex gap-3">
          <button onClick={onCancel} disabled={deleting} className="btn-ghost flex-1 justify-center disabled:opacity-40">
            {t("settings.deleteDialog.cancel")}
          </button>
          <button
            onClick={() => onConfirm(deleteData)}
            disabled={deleting}
            className="btn-danger-primary flex-1 justify-center"
          >
            {deleting ? t("settings.deleteDialog.pleaseWait") : deleteData ? t("settings.deleteDialog.deleteEverything") : t("settings.deleteDialog.deactivate")}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ── Mobile Verification Modal ───────────────────────────────── */

type VerifyStage = "phone" | "code" | "success";

function MobileVerifyModal({ open, initialPhone, onClose, onVerified }: {
  open: boolean;
  initialPhone: string;
  onClose: () => void;
  onVerified: (phone: string) => void;
}) {
  const [stage,       setStage]       = useState<VerifyStage>("phone");
  const [phone,       setPhone]       = useState(initialPhone);
  const [code,        setCode]        = useState("");
  const [phoneError,  setPhoneError]  = useState("");
  const [codeError,   setCodeError]   = useState("");
  const [sending,     setSending]     = useState(false);
  const [verifying,   setVerifying]   = useState(false);
  const [resendTimer, setResendTimer] = useState(0);

  useEffect(() => {
    if (!open) return;
    setStage("phone");
    setPhone(initialPhone);
    setCode("");
    setPhoneError("");
    setCodeError("");
    setSending(false);
    setVerifying(false);
    setResendTimer(0);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  useEffect(() => {
    if (resendTimer <= 0) return;
    const id = setTimeout(() => setResendTimer((r) => r - 1), 1000);
    return () => clearTimeout(id);
  }, [resendTimer]);

  const handleClose = () => {
    if (verifying) return;
    onClose();
  };

  const sendCode = async () => {
    if (!phone || !isValidPhoneNumber(phone)) { setPhoneError("Enter a valid phone number"); return; }
    setPhoneError("");
    setSending(true);
    await new Promise((r) => setTimeout(r, 1200));
    setSending(false);
    setCode("");
    setCodeError("");
    setResendTimer(30);
    setStage("code");
  };

  const verify = async () => {
    if (code.length < 6) { setCodeError("Enter all 6 digits"); return; }
    setCodeError("");
    setVerifying(true);
    await new Promise((r) => setTimeout(r, 900));
    setVerifying(false);
    setStage("success");
  };

  const resend = async () => {
    if (resendTimer > 0 || sending) return;
    setSending(true);
    await new Promise((r) => setTimeout(r, 800));
    setSending(false);
    setResendTimer(30);
    setCode("");
    toast.success("Verification code resent");
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
      <div className="absolute inset-0 modal-backdrop animate-panel-in" onClick={handleClose} />
      <div className="relative glass-modal p-6 w-full max-w-sm animate-modal-in">

        {/* Close — hidden on success */}
        {stage !== "success" && (
          <button onClick={handleClose} className="absolute top-4 right-4 btn-icon-sm h-7 w-7 rounded-full">
            <X className="h-4 w-4" />
          </button>
        )}

        {/* ── Stage: phone ── */}
        {stage === "phone" && (
          <>
            <div className="flex justify-center mb-5">
              <div className="h-14 w-14 rounded-2xl bg-surface-2 grid place-items-center">
                <Smartphone className="h-6 w-6 text-brand" />
              </div>
            </div>
            <h2 className="modal-heading text-center">Verify your number</h2>
            <p className="modal-body text-center">
              We'll send a 6-digit code to confirm your mobile number.
            </p>

            <div className="mb-1">
              <label htmlFor="verify-phone" className="field-label">Mobile number</label>
              <PhoneInput
                id="verify-phone"
                value={phone as import("react-phone-number-input").Value}
                onChange={(v) => { setPhone(v ?? ""); if (phoneError) setPhoneError(""); }}
                defaultCountry="DE"
                className={cn(phoneError && "!border-red-500 focus-within:!border-red-500")}
                autoFocus
              />
              {phoneError && <p className="text-[12px] text-red-500 mt-1.5">{phoneError}</p>}
            </div>

            <div className="mt-6 flex gap-3">
              <button onClick={handleClose} className="btn-ghost flex-1 justify-center">Cancel</button>
              <button onClick={sendCode} disabled={sending} className="btn-primary flex-1 justify-center">
                {sending
                  ? <><Loader2 className="h-4 w-4 animate-spin" /> Sending…</>
                  : "Send code"}
              </button>
            </div>
          </>
        )}

        {/* ── Stage: code ── */}
        {stage === "code" && (
          <>
            <div className="flex justify-center mb-5">
              <div className="h-14 w-14 rounded-2xl bg-surface-2 grid place-items-center">
                <MessageSquare className="h-6 w-6 text-brand" />
              </div>
            </div>
            <h2 className="modal-heading text-center">Enter the code</h2>
            <p className="modal-body text-center">
              Sent to <span className="font-medium text-ink">{phone}</span>
            </p>

            <InputOTP
              maxLength={6}
              value={code}
              onChange={(v) => { setCode(v); if (codeError) setCodeError(""); }}
              disabled={verifying}
            >
              <InputOTPGroup>
                {Array.from({ length: 6 }).map((_, i) => (
                  <InputOTPSlot key={i} index={i} />
                ))}
              </InputOTPGroup>
            </InputOTP>
            {codeError && <p className="text-[12px] text-red-500 mt-2 text-center">{codeError}</p>}

            <div className="flex justify-center mt-3 mb-6">
              <button
                onClick={resend}
                disabled={resendTimer > 0 || sending}
                className="text-[13px] text-ink-muted hover:text-ink transition-colors disabled:cursor-default disabled:hover:text-ink-muted"
              >
                {resendTimer > 0
                  ? `Resend in ${resendTimer}s`
                  : sending ? "Sending…" : "Resend code"}
              </button>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => { setStage("phone"); setCode(""); setCodeError(""); }}
                disabled={verifying}
                className="btn-ghost flex-1 justify-center disabled:opacity-40"
              >
                Back
              </button>
              <button
                onClick={verify}
                disabled={verifying || code.length < 6}
                className="btn-primary flex-1 justify-center"
              >
                {verifying
                  ? <><Loader2 className="h-4 w-4 animate-spin" /> Verifying…</>
                  : "Verify"}
              </button>
            </div>
          </>
        )}

        {/* ── Stage: success ── */}
        {stage === "success" && (
          <div className="text-center">
            <div className="flex justify-center mb-5">
              <div className="h-14 w-14 rounded-2xl bg-green-50 dark:bg-green-500/15 grid place-items-center">
                <CheckCircle2 className="h-7 w-7 text-green-600 dark:text-green-400" />
              </div>
            </div>
            <h2 className="modal-heading text-center">Number verified!</h2>
            <p className="modal-body text-center">
              Mobile notifications are now active for{" "}
              <span className="font-medium text-ink">{phone}</span>.
            </p>
            <button
              onClick={() => { onVerified(phone); handleClose(); }}
              className="btn-primary w-full justify-center mt-2"
            >
              Done
            </button>
          </div>
        )}

      </div>
    </div>
  );
}

/* ── Main Page ───────────────────────────────────────────────── */

export default function SettingsPage() {
  const { t } = useT();
  const { user, signOut } = useAuth();
  const { jobs, setJobs } = useJobs();
  const navigate = useNavigate();

  const themes: { value: Theme; label: string; icon: React.ElementType }[] = [
    { value: "light", label: t("settings.themeLight"), icon: Sun     },
    { value: "auto",  label: t("settings.themeAuto"),  icon: Monitor },
    { value: "dark",  label: t("settings.themeDark"),  icon: Moon    },
  ];

  const [theme,            setTheme]            = useState<Theme>(getStoredTheme);
  const [emailNotif,       setEmailNotif]       = useState(getStoredNotif);
  const [mobileNotif,      setMobileNotif]      = useState(getStoredMobileNotif);
  const [mobilePhone,      setMobilePhone]      = useState(getStoredMobilePhone);
  const [exportOpen,       setExportOpen]       = useState(false);
  const [mobileVerifyOpen, setMobileVerifyOpen] = useState(false);
  const [deleteDialog,     setDeleteDialog]     = useState(false);
  const [deleting,         setDeleting]         = useState(false);

  const handleThemeChange = (v: Theme) => {
    setTheme(v);
    try { localStorage.setItem(THEME_KEY, v); } catch { /* noop */ }
    applyTheme(v);
  };

  const handleNotifChange = (val: boolean) => {
    setEmailNotif(val);
    try { localStorage.setItem(NOTIF_KEY, String(val)); } catch { /* noop */ }
  };

  const handleMobileToggle = (val: boolean) => {
    if (val) {
      if (mobilePhone) {
        setMobileNotif(true);
        try { localStorage.setItem(MOBILE_NOTIF_KEY, "true"); } catch { /* noop */ }
      } else {
        setMobileVerifyOpen(true);
      }
    } else {
      setMobileNotif(false);
      try { localStorage.setItem(MOBILE_NOTIF_KEY, "false"); } catch { /* noop */ }
    }
  };

  const handleMobileVerified = (phone: string) => {
    setMobilePhone(phone);
    setMobileNotif(true);
    try {
      localStorage.setItem(MOBILE_PHONE_KEY, phone);
      localStorage.setItem(MOBILE_NOTIF_KEY, "true");
    } catch { /* noop */ }
    toast.success("Mobile notifications enabled");
  };

  const handleDeleteAccount = async (deleteData: boolean) => {
    setDeleting(true);
    try {
      if (user && deleteData) {
        setJobs([]);
        await Promise.all([
          supabase.from("profiles").delete().eq("id", user.id),
          deleteAllSavedItems(user.id),
        ]);
        clearTrackaStorage();
      }
      await signOut();
      navigate("/auth", { replace: true });
    } catch {
      toast.error("Something went wrong. Please try again.");
      setDeleting(false);
      setDeleteDialog(false);
    }
  };

  return (
    <div className="w-full p-4 sm:p-8">
      <h1 className="heading-1 mb-6">{t("settings.title")}</h1>

      <div className="max-w-2xl space-y-5">

        {/* ── Appearance ── */}
        <Section title={t("settings.appearance")}>
          <Row label={t("settings.theme")} description={t("settings.themeDesc")}>
            {/* Mobile: dropdown */}
            <Select value={theme} onValueChange={(v) => handleThemeChange(v as Theme)}>
              <SelectTrigger className="sm:hidden h-10 focus:ring-0 focus:ring-offset-0">
                <SelectValue />
              </SelectTrigger>
              <SelectContent
                className="z-[60] overflow-hidden rounded-2xl border border-white/60 p-1 bg-white/60 backdrop-blur-xl shadow-lg glass-popover"
                position="popper"
                sideOffset={6}
              >
                {themes.map(({ value, label, icon: Icon }) => (
                  <SelectItem
                    key={value}
                    value={value}
                    className="rounded-xl text-[14px] text-ink cursor-pointer py-2.5 pl-9 pr-3 focus:bg-black/[0.05] focus:text-ink data-[state=checked]:font-medium"
                  >
                    <span className="flex items-center gap-2">
                      <Icon className="h-3.5 w-3.5 text-ink-muted" />
                      {label}
                    </span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {/* Desktop: segmented */}
            <div className="hidden sm:flex items-center rounded-2xl border border-line bg-surface-2 p-1 gap-0.5">
              {themes.map(({ value, label, icon: Icon }) => (
                <button
                  key={value}
                  onClick={() => handleThemeChange(value)}
                  className={cn(
                    "flex items-center gap-1.5 h-8 px-3 rounded-xl text-[13px] font-medium transition-colors duration-150",
                    theme === value ? "bg-white text-ink shadow-sm theme-segment-active" : "text-ink-muted hover:text-ink"
                  )}
                >
                  <Icon className="h-3.5 w-3.5" />
                  {label}
                </button>
              ))}
            </div>
          </Row>
        </Section>

        {/* ── Notifications ── */}
        <Section title={t("settings.notifications")}>
          <Row
            label={t("settings.emailNotif")}
            description={emailNotif
              ? t("settings.emailNotifOn").replace("{email}", user?.email ?? "your email")
              : t("settings.emailNotifOff")}
          >
            <Toggle enabled={emailNotif} onChange={handleNotifChange} />
          </Row>
          <Row
            label="Mobile notifications"
            description={mobileNotif && mobilePhone
              ? `Active — ${mobilePhone}`
              : "Get job alerts and deadline reminders via SMS"}
          >
            <Toggle enabled={mobileNotif} onChange={handleMobileToggle} />
          </Row>
        </Section>

        {/* ── Data ── */}
        <Section title={t("settings.data")}>

          <Row label="Export" description="Download your data in various formats">
            <button onClick={() => setExportOpen(true)} className="btn-ghost-sm">
              <Download className="h-3.5 w-3.5" />
              Export
            </button>
          </Row>

          <Row
            label={t("settings.dangerZone")}
            description={t("settings.dangerDesc")}
          >
            <button onClick={() => setDeleteDialog(true)} className="btn-danger-sm">
              <Trash2 className="h-3.5 w-3.5" />
              {t("settings.deleteAccount")}
            </button>
          </Row>

        </Section>

      </div>

      <ExportModal open={exportOpen} onClose={() => setExportOpen(false)} jobs={jobs} />
      <MobileVerifyModal
        open={mobileVerifyOpen}
        initialPhone={mobilePhone}
        onClose={() => setMobileVerifyOpen(false)}
        onVerified={handleMobileVerified}
      />
      <DeleteAccountDialog
        open={deleteDialog}
        deleting={deleting}
        onConfirm={handleDeleteAccount}
        onCancel={() => !deleting && setDeleteDialog(false)}
      />
    </div>
  );
}

/* ── Layout helpers ──────────────────────────────────────────── */

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h2 className="text-[14px] font-semibold text-ink-muted uppercase tracking-wide mb-3 px-1">{title}</h2>
      <div className="glass-card overflow-hidden divide-y divide-line/60">
        {children}
      </div>
    </div>
  );
}

function Row({ label, description, children }: { label: string; description?: string; children?: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-6 px-5 py-4">
      <div>
        <p className="text-[14px] font-medium text-ink">{label}</p>
        {description && <p className="text-[13px] text-ink-muted">{description}</p>}
      </div>
      {children && <div className="shrink-0">{children}</div>}
    </div>
  );
}
