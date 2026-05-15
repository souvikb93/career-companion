import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Trash2, X, Sun, Moon, Monitor, Download } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useJobs } from "@/lib/jobs-store";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { useT } from "@/lib/i18n";
import { deleteAllSavedItems } from "@/lib/saved-items";
import { clearTrackaStorage } from "@/lib/storage";
import { applyTheme } from "@/lib/theme";

const THEME_KEY = "tracka_theme";
const NOTIF_KEY = "tracka_email_notif";

type Theme = "light" | "auto" | "dark";

function getStoredTheme(): Theme {
  try { return (localStorage.getItem(THEME_KEY) as Theme) || "auto"; } catch { return "auto"; }
}
function getStoredNotif(): boolean {
  try { return localStorage.getItem(NOTIF_KEY) === "true"; } catch { return false; }
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
      <div className="absolute inset-0 bg-ink/40 backdrop-blur-sm" onClick={onClose} />
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
  { id: "jobs",   label: "Jobs",         desc: "All tracked jobs as a CSV spreadsheet",   ext: "CSV" },
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
      const msgs = localStorage.getItem("tracka_letter_msgs_v2");
      const data = JSON.stringify({ draft: draft ? JSON.parse(draft) : null, messages: msgs ? JSON.parse(msgs) : [] }, null, 2);
      const blob = new Blob([data], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a"); a.href = url; a.download = "tracka-letter.json"; a.click();
      URL.revokeObjectURL(url);
      toast.success("Cover letter data exported");
    }
    onClose();
  };

  return (
    <Modal open={open} onClose={onClose}>
      <h2 className="text-[18px] font-semibold text-ink mb-1 pr-8">Export Data</h2>
      <p className="text-[13px] text-ink-muted mb-5">Choose what you'd like to export.</p>
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
            <div className={cn(
              "h-4 w-4 rounded-full border-2 shrink-0 flex items-center justify-center transition-colors",
              selected === opt.id ? "border-brand" : "border-line"
            )}>
              {selected === opt.id && <div className="h-2 w-2 rounded-full bg-brand" />}
            </div>
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

/* ── Clear Data Modal ────────────────────────────────────────── */

const CLEAR_OPTIONS = [
  {
    id: "jobs",
    label: "Job Data",
    desc: "All tracked job applications",
    keys: ["jobs_v7", "jobs_added_count"],
  },
  {
    id: "resume",
    label: "Resume Data",
    desc: "CV drafts, layouts and saved resumes",
    keys: ["tracka_cv_draft", "cv_layout", "saved_cvs_v1", "saved_cvs_v2", "tracka_cv_jd"],
  },
  {
    id: "letter",
    label: "Letter Data",
    desc: "Cover letter drafts, messages and saved letters",
    keys: ["tracka_letter_draft", "tracka_letter_msgs_v2", "letter_layout", "saved_letters_v1", "saved_letters_v2", "tracka_letter_jd"],
  },
] as const;

type ClearId = typeof CLEAR_OPTIONS[number]["id"];

function ClearDataModal({ open, onClose, onClearJobs }: {
  open: boolean; onClose: () => void; onClearJobs: () => void;
}) {
  const [selected, setSelected] = useState<Set<ClearId>>(new Set());
  const [allData, setAllData] = useState(false);

  const toggleAll = (val: boolean) => {
    setAllData(val);
    if (val) setSelected(new Set(CLEAR_OPTIONS.map((o) => o.id)));
    else setSelected(new Set());
  };

  const toggleOption = (id: ClearId) => {
    const next = new Set(selected);
    next.has(id) ? next.delete(id) : next.add(id);
    setSelected(next);
    setAllData(next.size === CLEAR_OPTIONS.length);
  };

  const handleClear = () => {
    if (selected.size === 0 && !allData) { toast.error("Select at least one data type"); return; }
    const toClear = allData ? CLEAR_OPTIONS : CLEAR_OPTIONS.filter((o) => selected.has(o.id));
    toClear.forEach((opt) => {
      opt.keys.forEach((k) => { try { localStorage.removeItem(k); } catch { /* noop */ } });
      if (opt.id === "jobs") onClearJobs();
    });
    toast.success("Selected data cleared");
    setSelected(new Set());
    setAllData(false);
    onClose();
  };

  const noneSelected = selected.size === 0 && !allData;

  return (
    <Modal open={open} onClose={onClose}>
      <h2 className="text-[18px] font-semibold text-ink mb-1 pr-8">Clear Data</h2>
      <p className="text-[13px] text-ink-muted mb-5">Select what you'd like to clear. This cannot be undone.</p>

      {/* All Data toggle */}
      <button
        type="button"
        onClick={() => toggleAll(!allData)}
        className={cn(
          "w-full flex items-center gap-3 p-3.5 rounded-xl border mb-3 text-left transition-colors",
          allData ? "border-red-400 bg-red-50" : "border-line hover:border-red-300 hover:bg-red-50/50"
        )}
      >
        <div className={cn(
          "h-4 w-4 rounded border-2 shrink-0 flex items-center justify-center transition-colors",
          allData ? "bg-red-500 border-red-500" : "border-line"
        )}>
          {allData && <svg className="h-2.5 w-2.5 text-white" viewBox="0 0 12 12" fill="none"><path d="M2 6l3 3 5-5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" /></svg>}
        </div>
        <div>
          <p className="text-[14px] font-semibold text-ink">All Data</p>
          <p className="text-[12px] text-ink-muted mt-0.5">Jobs, resumes and cover letters</p>
        </div>
      </button>

      <div className="space-y-2 mb-6">
        {CLEAR_OPTIONS.map((opt) => {
          const checked = selected.has(opt.id) || allData;
          return (
            <button
              key={opt.id}
              type="button"
              onClick={() => !allData && toggleOption(opt.id)}
              disabled={allData}
              className={cn(
                "w-full flex items-center gap-3 p-3 rounded-xl border text-left transition-colors",
                checked
                  ? "border-red-300 bg-red-50/60"
                  : "border-line hover:border-red-200 hover:bg-red-50/30",
                allData && "opacity-60 cursor-default"
              )}
            >
              <div className={cn(
                "h-4 w-4 rounded border-2 shrink-0 flex items-center justify-center transition-colors",
                checked ? "bg-red-500 border-red-500" : "border-line"
              )}>
                {checked && <svg className="h-2.5 w-2.5 text-white" viewBox="0 0 12 12" fill="none"><path d="M2 6l3 3 5-5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" /></svg>}
              </div>
              <div>
                <p className="text-[13px] font-medium text-ink">{opt.label}</p>
                <p className="text-[12px] text-ink-muted mt-0.5">{opt.desc}</p>
              </div>
            </button>
          );
        })}
      </div>

      <div className="flex gap-3">
        <button onClick={onClose} className="btn-ghost flex-1 justify-center">Cancel</button>
        <button
          onClick={handleClear}
          disabled={noneSelected}
          className="flex-1 h-11 px-5 rounded-full bg-red-500 text-white text-[12px] font-bold uppercase tracking-[0.08em] transition-colors hover:bg-red-600 disabled:opacity-40 inline-flex items-center justify-center gap-2"
        >
          <Trash2 className="h-3.5 w-3.5" /> Clear
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
      <div className="absolute inset-0 bg-ink/40 backdrop-blur-sm" onClick={() => !deleting && onCancel()} />
      <div className="relative glass-modal p-6 w-full max-w-sm mx-4">
        <button onClick={onCancel} disabled={deleting}
          className="absolute top-4 right-4 h-7 w-7 rounded-full grid place-items-center text-ink-muted hover:bg-surface-2 transition-colors disabled:opacity-40">
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
              deleteData ? "bg-red-600 border-red-600" : "bg-white border-line group-hover:border-ink-muted"
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
        <div className="flex gap-3">
          <button onClick={onCancel} disabled={deleting} className="btn-ghost flex-1 justify-center disabled:opacity-40">
            {t("settings.deleteDialog.cancel")}
          </button>
          <button
            onClick={() => onConfirm(deleteData)}
            disabled={deleting}
            className="flex-1 h-11 px-5 rounded-full bg-red-500 text-white text-[12px] font-bold uppercase tracking-[0.08em] transition-colors hover:bg-red-600 disabled:opacity-60 inline-flex items-center justify-center"
          >
            {deleting ? t("settings.deleteDialog.pleaseWait") : deleteData ? t("settings.deleteDialog.deleteEverything") : t("settings.deleteDialog.deactivate")}
          </button>
        </div>
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
    { value: "light", label: t("settings.themeLight"), icon: Sun },
    { value: "auto",  label: t("settings.themeAuto"),  icon: Monitor },
    { value: "dark",  label: t("settings.themeDark"),  icon: Moon },
  ];

  const [theme,         setTheme]         = useState<Theme>(getStoredTheme);
  const [emailNotif,    setEmailNotif]    = useState(getStoredNotif);
  const [exportOpen,    setExportOpen]    = useState(false);
  const [clearOpen,     setClearOpen]     = useState(false);
  const [deleteDialog,  setDeleteDialog]  = useState(false);
  const [deleting,      setDeleting]      = useState(false);

  const handleThemeChange = (v: Theme) => {
    setTheme(v);
    try { localStorage.setItem(THEME_KEY, v); } catch { /* noop */ }
    applyTheme(v);
  };

  const handleNotifChange = (val: boolean) => {
    setEmailNotif(val);
    try { localStorage.setItem(NOTIF_KEY, String(val)); } catch { /* noop */ }
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

        {/* ── Appearance ── */}
        <Section title={t("settings.appearance")}>
          <Row label={t("settings.theme")} description={t("settings.themeDesc")}>
            {/* Mobile: dropdown */}
            <select
              value={theme}
              onChange={(e) => handleThemeChange(e.target.value as Theme)}
              className="sm:hidden h-10 w-full rounded-xl border border-line bg-white px-3 text-[14px] text-ink outline-none focus:border-brand focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2 transition-colors"
            >
              {themes.map(({ value, label }) => (
                <option key={value} value={value}>{label}</option>
              ))}
            </select>
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
        </Section>

        {/* ── Data ── */}
        <Section title={t("settings.data")}>

          {/* Export */}
          <Row label="Export" description="Download your data in various formats">
            <button onClick={() => setExportOpen(true)} className="btn-ghost-sm">
              <Download className="h-3.5 w-3.5" />
              Export
            </button>
          </Row>

          {/* Clear Data */}
          <Row label="Clear Data" description="Selectively remove stored data from your account">
            <button onClick={() => setClearOpen(true)} className="btn-danger-sm">
              <Trash2 className="h-3.5 w-3.5" />
              Clear
            </button>
          </Row>

          {/* Danger Zone */}
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
      <ClearDataModal open={clearOpen} onClose={() => setClearOpen(false)} onClearJobs={() => setJobs([])} />
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
