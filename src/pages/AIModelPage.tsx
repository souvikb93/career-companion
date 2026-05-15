import { useEffect, useState, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useProfile } from "@/lib/profile-store";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { useT } from "@/lib/i18n";
import { Sparkles } from "lucide-react";

const STORAGE_KEY = "tracka_ai_model";
const DEFAULT_MODEL = "llama-3.3-70b-versatile";

export default function AIModelPage() {
  const { t } = useT();
  const { user } = useAuth();
  const { profile, saveProfile } = useProfile();
  const [selected, setSelected] = useState(DEFAULT_MODEL);
  const [modelLoading, setModelLoading] = useState(true);
  const [instructions, setInstructions] = useState("");
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [instructionsError, setInstructionsError] = useState("");
  const instructionsRef = useRef(instructions);
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const MODELS = [
    { id: "llama-3.3-70b-versatile", name: "Llama 3.3 70B", desc: t("aiModel.model0desc"), badge: t("aiModel.badgeRecommended") },
    { id: "llama-3.1-8b-instant",    name: "Llama 3.1 8B Instant", desc: t("aiModel.model1desc"), badge: t("aiModel.badgeFast") },
    { id: "mixtral-8x7b-32768",      name: "Mixtral 8×7B", desc: t("aiModel.model2desc"), badge: null },
    { id: "gemma2-9b-it",            name: "Gemma 2 9B", desc: t("aiModel.model3desc"), badge: null },
  ];

  useEffect(() => { instructionsRef.current = instructions; }, [instructions]);

  useEffect(() => {
    if (!user) return;
    const cached = localStorage.getItem(STORAGE_KEY);
    if (cached) setSelected(cached);

    supabase
      .from("profiles")
      .select("preferred_ai_model")
      .eq("id", user.id)
      .single()
      .then(({ data }) => {
        if (data?.preferred_ai_model) {
          setSelected(data.preferred_ai_model);
          localStorage.setItem(STORAGE_KEY, data.preferred_ai_model);
        }
        setModelLoading(false);
      });
  }, [user]);

  useEffect(() => {
    if (profile.customInstructions) {
      setInstructions(profile.customInstructions);
    }
  }, [profile.customInstructions]);

  const handleRemove = async () => {
    setSaving(true);
    try {
      await saveProfile({ ...profile, customInstructions: "" });
      setInstructions("");
      toast.success(t("aiModel.instructionsRemoved"));
    } catch {
      toast.error(t("aiModel.failedSave"));
    } finally {
      setSaving(false);
    }
  };

  const handleConfirmSave = async () => {
    setSaving(true);
    try {
      await saveProfile({ ...profile, customInstructions: instructions });
      toast.success(t("aiModel.instructionsSaved"));
      setConfirmOpen(false);
    } catch {
      toast.error(t("aiModel.failedSave"));
    } finally {
      setSaving(false);
    }
  };

  const handleModelSelect = async (id: string) => {
    if (id === selected) return;
    setSelected(id);
    localStorage.setItem(STORAGE_KEY, id);
    const name = MODELS.find((m) => m.id === id)?.name ?? id;
    toast.success(t("aiModel.modelChanged").replace("{name}", name));
    if (!user) return;
    try {
      await supabase
        .from("profiles")
        .update({ preferred_ai_model: id })
        .eq("id", user.id);
    } catch {
      /* selection persists locally regardless */
    }
  };

  return (
    <div className="w-full p-4 sm:p-8">
      <h1 className="heading-1 mb-6">{t("aiModel.title")}</h1>

      <div className="max-w-2xl space-y-5">

        <div className="glass-card p-5">
          <h3 className="text-[15px] font-semibold text-ink mb-1">{t("aiModel.instructionsTitle")}</h3>
          <p className="text-[13px] text-ink-muted mb-4">{t("aiModel.instructionsDesc")}</p>
          <textarea
            className="textarea-base"
            rows={5}
            value={instructions}
            onChange={(e) => { setInstructions(e.target.value); if (instructionsError) setInstructionsError(""); }}
            placeholder={t("aiModel.instructionsPlaceholder")}
          />
          {instructionsError && (
            <p className="mt-2 text-[12px] text-red-500">{instructionsError}</p>
          )}
          <div className="mt-3 flex items-center justify-end gap-2">
            {profile.customInstructions && (
              <button
                type="button"
                onClick={handleRemove}
                disabled={saving}
                className="btn-ghost h-9 px-4 text-[13px]"
              >
                {t("aiModel.instructionsRemove")}
              </button>
            )}
            <button
              type="button"
              onClick={() => {
                if (!instructions.trim()) {
                  setInstructionsError(t("aiModel.instructionsError"));
                  return;
                }
                setInstructionsError("");
                setConfirmOpen(true);
              }}
              className="btn-primary h-9 px-5 text-[13px]"
            >
              {t("aiModel.instructionsSave")}
            </button>
          </div>
        </div>

        <div className="glass-card p-5">
          <h3 className="text-[15px] font-semibold text-ink mb-1">{t("aiModel.modelTitle")}</h3>
          <p className="text-[13px] text-ink-muted mb-4">{t("aiModel.modelDesc")}</p>
          <div className="space-y-2">
            {MODELS.map((m) => (
              <button
                key={m.id}
                type="button"
                disabled={modelLoading}
                onClick={() => handleModelSelect(m.id)}
                className={cn(
                  "w-full flex items-center gap-4 p-4 rounded-xl border text-left transition-colors",
                  selected === m.id
                    ? "border-brand bg-brand/[0.06]"
                    : "border-line hover:border-brand/40 hover:bg-brand/[0.03]"
                )}
              >
                <div className={cn(
                  "h-4 w-4 rounded-full border-2 shrink-0 flex items-center justify-center transition-colors",
                  selected === m.id ? "border-brand" : "border-line"
                )}>
                  {selected === m.id && <div className="h-2 w-2 rounded-full bg-brand" />}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-[14px] font-medium text-ink">{m.name}</span>
                    {m.badge && (
                      <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-brand/[0.08] border border-brand/20 text-brand">
                        {m.badge}
                      </span>
                    )}
                  </div>
                  <p className="text-[13px] text-ink-muted mt-0.5">{m.desc}</p>
                </div>
              </button>
            ))}
          </div>
        </div>

      </div>

      {/* Confirmation modal — outside glass-card to avoid backdrop-filter stacking context */}
      {confirmOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center px-4">
          <div className="absolute inset-0 modal-backdrop" onClick={() => !saving && setConfirmOpen(false)} />
          <div className="relative glass-modal w-full max-w-[400px] p-6 animate-modal-in">
            <div className="h-11 w-11 rounded-2xl glass-chip flex items-center justify-center mb-4">
              <Sparkles className="h-5 w-5 text-brand" />
            </div>
            <h3 className="modal-heading">{t("aiModel.instructionsConfirmTitle")}</h3>
            <p className="modal-body mb-6">{t("aiModel.instructionsConfirmBody")}</p>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setConfirmOpen(false)}
                disabled={saving}
                className="btn-ghost flex-1 h-10 justify-center text-[12px]"
              >
                {t("aiModel.instructionsCancel")}
              </button>
              <button
                type="button"
                onClick={handleConfirmSave}
                disabled={saving}
                className="btn-primary flex-1 h-10 justify-center text-[12px]"
              >
                {saving ? "…" : t("aiModel.instructionsConfirm")}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
