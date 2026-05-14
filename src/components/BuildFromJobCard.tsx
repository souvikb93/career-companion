import { useState, useEffect, useCallback } from "react";
import { Sparkles, Loader2, AlertCircle } from "lucide-react";
import { useT } from "@/lib/i18n";
import { loadFromStorage, saveToStorage } from "@/lib/storage";

interface Props {
  storageKey: string;
  loading: boolean;
  onGenerate: (input: string) => Promise<void>;
  initialValue?: string;
}

export default function BuildFromJobCard({ storageKey, loading, onGenerate, initialValue }: Props) {
  const { t } = useT();
  const [input, setInput] = useState(() => loadFromStorage<string>(storageKey) ?? initialValue ?? "");
  const [error, setError] = useState(false);

  useEffect(() => { saveToStorage(storageKey, input); }, [input, storageKey]);

  useEffect(() => {
    if (initialValue && !loadFromStorage<string>(storageKey)) {
      setInput(initialValue);
    }
  }, [initialValue, storageKey]);

  const handleGenerate = useCallback(async () => {
    if (!input.trim()) {
      setError(true);
      return;
    }
    setError(false);
    await onGenerate(input.trim());
  }, [input, onGenerate]);

  return (
    <div className="glass-modal p-5 mb-4">
      <div className="flex items-center justify-between gap-3 mb-3">
        <h3 className="text-[15px] font-semibold text-ink leading-snug">
          {t("buildFromJob.heading")}
        </h3>
        <button
          type="button"
          onClick={handleGenerate}
          disabled={loading}
          className="btn-primary h-9 px-4 shrink-0"
        >
          {loading
            ? <Loader2 className="h-3.5 w-3.5 animate-spin" />
            : <Sparkles className="h-3.5 w-3.5" />}
          {loading ? t("buildFromJob.generating") : t("buildFromJob.generate")}
        </button>
      </div>

      <textarea
        value={input}
        onChange={(e) => { setInput(e.target.value); if (error) setError(false); }}
        rows={5}
        placeholder={t("buildFromJob.placeholder")}
        className="textarea-base w-full"
        disabled={loading}
      />

      {error && (
        <p className="text-[12px] text-red-600 mt-2">{t("buildFromJob.emptyError")}</p>
      )}

      <div className="flex items-start gap-2 mt-3">
        <AlertCircle className="h-3.5 w-3.5 text-ink-muted shrink-0 mt-0.5" />
        <p className="text-[12px] text-ink-muted leading-relaxed">
          {t("buildFromJob.blockedNote")}
        </p>
      </div>
    </div>
  );
}
