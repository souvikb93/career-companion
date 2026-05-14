import { useEffect, useState, useRef, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useProfile } from "@/lib/profile-store";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { useT } from "@/lib/i18n";

const STORAGE_KEY = "tracka_ai_model";
const DEFAULT_MODEL = "llama-3.3-70b-versatile";

export default function AIModelPage() {
  const { t } = useT();
  const { user } = useAuth();
  const { profile, saveProfile } = useProfile();
  const [selected, setSelected] = useState(DEFAULT_MODEL);
  const [modelLoading, setModelLoading] = useState(true);
  const [instructions, setInstructions] = useState("");
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

  const debouncedSaveInstructions = useCallback(() => {
    if (saveTimer.current) clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(async () => {
      try {
        await saveProfile({ ...profile, customInstructions: instructionsRef.current });
      } catch {
        toast.error(t("aiModel.failedSave"));
      }
    }, 800);
  }, [saveProfile, profile, t]);

  const handleInstructionsChange = (val: string) => {
    setInstructions(val);
    debouncedSaveInstructions();
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
    <div className="w-full px-10 py-8">
      <h1 className="display-2 mb-10">{t("aiModel.title")}</h1>

      <div className="max-w-2xl space-y-5">

        <div className="glass-card p-5">
          <h3 className="text-[15px] font-semibold text-ink mb-1">{t("aiModel.instructionsTitle")}</h3>
          <p className="text-[13px] text-ink-muted mb-4">{t("aiModel.instructionsDesc")}</p>
          <textarea
            className="w-full rounded-xl border border-line bg-white px-3 py-2.5 text-[14px] text-ink resize-none focus:outline-none focus:border-brand transition-colors"
            rows={5}
            value={instructions}
            onChange={(e) => handleInstructionsChange(e.target.value)}
            placeholder={t("aiModel.instructionsPlaceholder")}
          />
          <p className="text-[12px] text-ink-muted mt-2">{t("aiModel.instructionsFooter")}</p>
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
                    : "border-white/40 hover:border-ink/20 hover:bg-white/20"
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
                      <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-ink text-white">
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
    </div>
  );
}
