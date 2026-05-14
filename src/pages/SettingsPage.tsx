import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { LogOut, Trash2, X, Sun, Moon, Monitor, Download } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useJobs } from "@/lib/jobs-store";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { useT } from "@/lib/i18n";
import { deleteAllSavedItems } from "@/lib/saved-items";
import { clearTrackaStorage } from "@/lib/storage";

const THEME_KEY = "tracka_theme";
const NOTIF_KEY = "tracka_email_notif";

type Theme = "light" | "auto" | "dark";

function getStoredTheme(): Theme {
  try { return (localStorage.getItem(THEME_KEY) as Theme) || "auto"; } catch { return "auto"; }
}
function getStoredNotif(): boolean {
  try { return localStorage.getItem(NOTIF_KEY) === "true"; } catch { return false; }
}

function Toggle({ enabled, onChange }: { enabled: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      role="switch"
      aria-checked={enabled}
      onClick={() => onChange(!enabled)}
      className={cn(
        "relative inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full transition-colors duration-200",
        enabled ? "bg-ink" : "bg-line"
      )}
    >
      <span className={cn(
        "inline-block h-4 w-4 transform rounded-full bg-white shadow-sm transition-transform duration-200",
        enabled ? "translate-x-6" : "translate-x-1"
      )} />
    </button>
  );
}

function ConfirmDialog({
  open, title, description, confirmLabel, cancelLabel, onConfirm, onCancel,
}: {
  open: boolean; title: string; description: string; confirmLabel: string; cancelLabel: string;
  onConfirm: () => void; onCancel: () => void;
}) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-ink/30 backdrop-blur-sm" onClick={onCancel} />
      <div className="relative glass-modal p-6 w-full max-w-sm mx-4">
        <button onClick={onCancel} className="absolute top-4 right-4 h-7 w-7 rounded-full grid place-items-center text-ink-muted hover:bg-surface-2 transition-colors">
          <X className="h-4 w-4" />
        </button>
        <h2 className="text-[18px] font-semibold text-ink mb-2">{title}</h2>
        <p className="text-[14px] text-ink-muted mb-6">{description}</p>
        <div className="flex gap-3 justify-end">
          <button onClick={onCancel} className="h-10 px-4 rounded-xl border border-line text-[13px] font-medium text-ink hover:bg-surface transition-colors">
            {cancelLabel}
          </button>
          <button
            onClick={onConfirm}
            className="h-10 px-4 rounded-xl text-[13px] font-medium text-white bg-red-600 hover:bg-red-700 transition-colors"
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}

function DeleteAccountDialog({
  open, deleting, onConfirm, onCancel,
}: {
  open: boolean; deleting: boolean;
  onConfirm: (deleteData: boolean) => void; onCancel: () => void;
}) {
  const { t } = useT();
  const [deleteData, setDeleteData] = useState(false);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-ink/30 backdrop-blur-sm" onClick={() => !deleting && onCancel()} />
      <div className="relative glass-modal p-6 w-full max-w-sm mx-4">
        <button
          onClick={onCancel}
          disabled={deleting}
          className="absolute top-4 right-4 h-7 w-7 rounded-full grid place-items-center text-ink-muted hover:bg-surface-2 transition-colors disabled:opacity-40"
        >
          <X className="h-4 w-4" />
        </button>

        <h2 className="text-[18px] font-semibold text-ink mb-2">{t("settings.deleteDialog.title")}</h2>
        <p className="text-[14px] text-ink-muted mb-5">{t("settings.deleteDialog.subtitle")}</p>

        <label className="flex items-start gap-3 mb-6 cursor-pointer group">
          <button
            role="checkbox"
            aria-checked={deleteData}
            onClick={() => setDeleteData((v) => !v)}
            className={cn(
              "mt-0.5 shrink-0 h-5 w-5 rounded-md border-2 transition-colors grid place-items-center",
              deleteData
                ? "bg-red-600 border-red-600"
                : "bg-white border-line group-hover:border-ink-muted"
            )}
          >
            {deleteData && (
              <svg className="h-3 w-3 text-white" viewBox="0 0 12 12" fill="none">
                <path d="M2 6l3 3 5-5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            )}
          </button>
          <div>
            <p className="text-[14px] font-medium text-ink leading-snug">{t("settings.deleteDialog.deleteDataLabel")}</p>
            <p className="text-[12px] text-ink-muted mt-0.5">{t("settings.deleteDialog.deleteDataDesc")}</p>
          </div>
        </label>

        <div className="flex gap-3 justify-end">
          <button
            onClick={onCancel}
            disabled={deleting}
            className="h-10 px-4 rounded-xl border border-line text-[13px] font-medium text-ink hover:bg-surface transition-colors disabled:opacity-40"
          >
            {t("settings.deleteDialog.cancel")}
          </button>
          <button
            onClick={() => onConfirm(deleteData)}
            disabled={deleting}
            className="h-10 px-4 rounded-xl text-[13px] font-medium text-white bg-red-600 hover:bg-red-700 transition-colors disabled:opacity-60"
          >
            {deleting
              ? t("settings.deleteDialog.pleaseWait")
              : deleteData
                ? t("settings.deleteDialog.deleteEverything")
                : t("settings.deleteDialog.deactivate")}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function SettingsPage() {
  const { t } = useT();
  const { user, signOut } = useAuth();
  const { jobs, setJobs } = useJobs();
  const navigate = useNavigate();

  const themes: { value: Theme; label: string; icon: React.ElementType }[] = [
    { value: "light", label: t("settings.themeLight"), icon: Sun },
    { value: "auto", label: t("settings.themeAuto"), icon: Monitor },
    { value: "dark", label: t("settings.themeDark"), icon: Moon },
  ];

  const [theme, setTheme] = useState<Theme>(getStoredTheme);
  const [emailNotif, setEmailNotif] = useState(getStoredNotif);
  const [clearDialog, setClearDialog] = useState(false);
  const [deleteDialog, setDeleteDialog] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const handleThemeChange = (v: Theme) => {
    setTheme(v);
    try { localStorage.setItem(THEME_KEY, v); } catch { /* noop */ }
  };

  const handleNotifChange = (val: boolean) => {
    setEmailNotif(val);
    try { localStorage.setItem(NOTIF_KEY, String(val)); } catch { /* noop */ }
  };

  const handleExportJobs = () => {
    if (!jobs.length) { toast.error(t("settings.noJobsToExport")); return; }
    const header = ["Company", "Role", "Location", "Salary", "Status", "Date Added"].join(",");
    const rows = jobs.map((j) =>
      [j.company, j.role, j.location, j.salary, j.status, j.dateAdded]
        .map((v) => `"${String(v ?? "").replace(/"/g, '""')}"`)
        .join(",")
    );
    const csv = [header, ...rows].join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = "tracka-jobs.csv"; a.click();
    URL.revokeObjectURL(url);
    toast.success(t("settings.exported").replace("{n}", String(jobs.length)));
  };

  const handleClearJobs = () => {
    setJobs([]);
    toast.success(t("settings.jobsCleared"));
    setClearDialog(false);
  };

  const handleSignOut = async () => {
    await signOut();
    navigate("/auth", { replace: true });
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
      <h1 className="display-2 mb-10">{t("settings.title")}</h1>

      <div className="max-w-2xl space-y-5">

        <Section title={t("settings.appearance")}>
          <Row label={t("settings.theme")} description={t("settings.themeDesc")}>
            {/* Mobile: dropdown */}
            <select
              value={theme}
              onChange={(e) => handleThemeChange(e.target.value as Theme)}
              className="sm:hidden h-10 w-full rounded-xl border border-line bg-white px-3 text-[14px] text-ink outline-none focus:border-brand transition-colors"
            >
              {themes.map(({ value, label }) => (
                <option key={value} value={value}>{label}</option>
              ))}
            </select>
            {/* Desktop: toggle */}
            <div className="hidden sm:flex items-center rounded-2xl border border-line bg-surface-2 p-1 gap-0.5">
              {themes.map(({ value, label, icon: Icon }) => (
                <button
                  key={value}
                  onClick={() => handleThemeChange(value)}
                  className={cn(
                    "flex items-center gap-1.5 h-8 px-3 rounded-xl text-[13px] font-medium transition-colors duration-150",
                    theme === value
                      ? "bg-white text-ink shadow-sm"
                      : "text-ink-muted hover:text-ink"
                  )}
                >
                  <Icon className="h-3.5 w-3.5" />
                  {label}
                </button>
              ))}
            </div>
          </Row>
        </Section>

        <Section title={t("settings.notifications")}>
          <Row
            label={t("settings.emailNotif")}
            description={
              emailNotif
                ? t("settings.emailNotifOn").replace("{email}", user?.email ?? "your email")
                : t("settings.emailNotifOff")
            }
          >
            <Toggle enabled={emailNotif} onChange={handleNotifChange} />
          </Row>
        </Section>

        <Section title={t("settings.data")}>
          <Row label={t("settings.exportJobs")} description={t("settings.exportJobsDesc")}>
            <button
              onClick={handleExportJobs}
              className="flex items-center gap-2 h-9 px-3 rounded-xl border border-line text-[13px] font-medium text-ink hover:bg-surface-2 transition-colors"
            >
              <Download className="h-3.5 w-3.5 text-ink-muted" />
              {t("settings.exportCsv")}
            </button>
          </Row>
          <Row label={t("settings.clearJobs")} description={t("settings.clearJobsDesc")}>
            <button
              onClick={() => setClearDialog(true)}
              className="flex items-center gap-2 h-9 px-3 rounded-xl bg-red-50 border border-red-200 text-[13px] font-medium text-red-600 hover:bg-red-100 transition-colors"
            >
              <Trash2 className="h-3.5 w-3.5" />
              {t("settings.clearAll")}
            </button>
          </Row>
        </Section>

        <Section title={t("settings.account")}>
          <Row label={t("settings.signOut")} description={user?.email ?? ""}>
            <button
              onClick={handleSignOut}
              className="flex items-center gap-2 h-9 px-3 rounded-xl border border-line text-[13px] font-medium text-ink hover:bg-surface-2 transition-colors"
            >
              <LogOut className="h-3.5 w-3.5 text-ink-muted" />
              {t("settings.signOut")}
            </button>
          </Row>
          <div className="px-5 py-5 border-t border-line">
            <p className="text-[12px] font-semibold text-red-600 mb-1">{t("settings.dangerZone")}</p>
            <p className="text-[13px] text-ink-muted mb-3">{t("settings.dangerDesc")}</p>
            <button
              onClick={() => setDeleteDialog(true)}
              className="flex items-center gap-2 h-9 px-3 rounded-xl bg-red-50 border border-red-200 text-[13px] font-medium text-red-600 hover:bg-red-100 transition-colors"
            >
              <Trash2 className="h-3.5 w-3.5" />
              {t("settings.deleteAccount")}
            </button>
          </div>
        </Section>

      </div>

      <ConfirmDialog
        open={clearDialog}
        title={t("settings.clearDialog.title")}
        description={t("settings.clearDialog.description")}
        confirmLabel={t("settings.clearDialog.confirm")}
        cancelLabel={t("settings.clearDialog.cancel")}
        onConfirm={handleClearJobs}
        onCancel={() => setClearDialog(false)}
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
