import { useState, useEffect, useRef, useCallback } from "react";
import { Camera } from "lucide-react";
import { useProfile } from "@/lib/profile-store";
import { useAuth } from "@/hooks/useAuth";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar } from "@/components/Avatar";
import { toast } from "sonner";
import { useT } from "@/lib/i18n";
import type { ParsedProfile } from "@/lib/groq";

const MAX_AVATAR = 256;

async function fileToCompressedDataUrl(file: File): Promise<string> {
  const bitmap = await createImageBitmap(file);
  const { width, height } = bitmap;
  const scale = Math.min(1, MAX_AVATAR / Math.max(width, height));
  const w = Math.round(width * scale);
  const h = Math.round(height * scale);
  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas unavailable");
  ctx.drawImage(bitmap, 0, 0, w, h);
  bitmap.close();
  return canvas.toDataURL("image/jpeg", 0.85);
}

export default function ProfilePage() {
  const { t } = useT();
  const { user } = useAuth();
  const { profile, saveProfile, loading } = useProfile();
  const [local, setLocal] = useState<ParsedProfile>(() => ({ ...profile }));
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const localRef = useRef(local);

  useEffect(() => { localRef.current = local; }, [local]);

  if (!loading && local.fullName === "" && profile.fullName !== "") {
    setLocal({ ...profile });
  }

  const debouncedSave = useCallback(() => {
    if (saveTimer.current) clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(async () => {
      try {
        await saveProfile(localRef.current);
      } catch {
        toast.error(t("profile.failedSave"));
      }
    }, 800);
  }, [saveProfile, t]);

  const update = <K extends keyof ParsedProfile>(k: K, v: ParsedProfile[K]) => {
    setLocal((p) => ({ ...p, [k]: v }));
    debouncedSave();
  };

  const fileRef = useRef<HTMLInputElement>(null);
  const handlePhotoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    if (!file.type.startsWith("image/")) { toast.error(t("profile.notAnImage")); return; }
    if (file.size > 8 * 1024 * 1024) { toast.error(t("profile.imageTooLarge")); return; }
    try {
      const dataUrl = await fileToCompressedDataUrl(file);
      const next = { ...localRef.current, avatarUrl: dataUrl };
      setLocal(next);
      try { await saveProfile(next); toast.success(t("profile.savedOk")); } catch { toast.error(t("profile.failedPhoto")); }
    } catch {
      toast.error(t("profile.cantReadImage"));
    }
  };
  const memberSince = user?.created_at
    ? new Date(user.created_at).toLocaleDateString("en-US", { month: "long", year: "numeric" })
    : null;

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center text-ink-muted text-sm">
        Loading…
      </div>
    );
  }

  return (
    <div className="w-full p-4 sm:p-8">
      <h1 className="display-2 mb-10">{t("profile.title")}</h1>

      <div className="max-w-2xl space-y-5">

        <Section title={t("profile.photoSection")}>
          <div className="flex items-center gap-5">
            <Avatar
              name={local.fullName}
              email={user?.email ?? undefined}
              src={local.avatarUrl}
              size={72}
            />
            <div className="flex-1 min-w-0">
              <p className="text-[13px] text-ink-muted leading-relaxed mb-3">
                {t("profile.photoDesc")}
              </p>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => fileRef.current?.click()}
                  className="btn-ghost-sm"
                >
                  <Camera className="h-3.5 w-3.5" />
                  {t("profile.uploadPhoto")}
                </button>
              </div>
              <input
                ref={fileRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handlePhotoChange}
              />
            </div>
          </div>
        </Section>

        <Section title={t("profile.identitySection")}>
          <div className="grid grid-cols-2 gap-4">
            <Field label={t("profile.fullName")}>
              <Input className="h-10" value={local.fullName} onChange={(e) => update("fullName", e.target.value)} placeholder="Jane Smith" />
            </Field>
            <Field label={t("profile.professionalTitle")}>
              <Input className="h-10" value={local.title} onChange={(e) => update("title", e.target.value)} placeholder="e.g. Product Designer" />
            </Field>
            <Field label={t("profile.industry")}>
              <Input className="h-10" value={local.industry} onChange={(e) => update("industry", e.target.value)} placeholder="e.g. Design, Fintech" />
            </Field>
            <Field label={t("profile.location")}>
              <Input className="h-10" value={local.location} onChange={(e) => update("location", e.target.value)} placeholder="Berlin, Germany" />
            </Field>
            <Field label={t("profile.phone")}>
              <Input className="h-10" value={local.phone} onChange={(e) => update("phone", e.target.value)} placeholder="+49 123 456789" />
            </Field>
            <Field label={t("profile.linkedin")}>
              <Input className="h-10" value={local.linkedin} onChange={(e) => update("linkedin", e.target.value)} placeholder="linkedin.com/in/jane" />
            </Field>
          </div>
        </Section>

        <Section title={t("profile.accountSection")}>
          <div className="space-y-4">
            <div>
              <p className="text-[12px] font-medium text-ink-muted mb-0.5">{t("profile.signedInAs")}</p>
              <p className="text-[14px] font-medium text-ink truncate">{user?.email ?? "—"}</p>
            </div>
            {memberSince && (
              <div>
                <p className="text-[12px] font-medium text-ink-muted mb-0.5">{t("profile.memberSince")}</p>
                <p className="text-[14px] text-ink">{memberSince}</p>
              </div>
            )}
          </div>
        </Section>

      </div>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="glass-card p-5">
      <h3 className="text-[15px] font-semibold text-ink mb-4">{title}</h3>
      {children}
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
