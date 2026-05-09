import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

const MODELS = [
  { id: "google/gemini-2.5-flash", name: "Gemini 2.5 Flash", desc: "Fast & balanced — recommended" },
  { id: "google/gemini-2.5-pro", name: "Gemini 2.5 Pro", desc: "Best for complex reasoning" },
  { id: "openai/gpt-5-mini", name: "GPT-5 Mini", desc: "Quick OpenAI option" },
  { id: "openai/gpt-5", name: "GPT-5", desc: "Highest quality OpenAI model" },
];

export default function AIModelPage() {
  const { user } = useAuth();
  const [selected, setSelected] = useState(MODELS[0].id);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!user) return;
    supabase
      .from("profiles")
      .select("preferred_ai_model")
      .eq("user_id", user.id)
      .maybeSingle()
      .then(({ data }) => {
        if (data?.preferred_ai_model) setSelected(data.preferred_ai_model);
        setLoading(false);
      });
  }, [user]);

  const save = async () => {
    if (!user) return;
    setSaving(true);
    const { error } = await supabase
      .from("profiles")
      .update({ preferred_ai_model: selected })
      .eq("user_id", user.id);
    setSaving(false);
    if (error) toast.error(error.message);
    else toast.success("AI model updated");
  };

  return (
    <main className="max-w-2xl mx-auto px-8 py-10">
      <h1 className="text-2xl font-semibold text-ink mb-2">AI Model</h1>
      <p className="text-sm text-ink-muted mb-6">
        Choose which model powers your CV and cover letter generation.
      </p>
      <div className="bg-surface border border-line rounded-xl p-6">
        <RadioGroup value={selected} onValueChange={setSelected} disabled={loading}>
          {MODELS.map((m) => (
            <label
              key={m.id}
              htmlFor={m.id}
              className="flex items-start gap-3 p-3 rounded-lg cursor-pointer hover:bg-surface-hover"
            >
              <RadioGroupItem value={m.id} id={m.id} className="mt-1" />
              <div>
                <div className="text-ink font-medium">{m.name}</div>
                <div className="text-xs text-ink-muted">{m.desc}</div>
              </div>
            </label>
          ))}
        </RadioGroup>
        <Button
          onClick={save}
          disabled={saving || loading}
          className="mt-4 bg-ink text-surface hover:bg-accent-orange hover:text-ink"
        >
          {saving ? "Saving…" : "Save"}
        </Button>
      </div>
    </main>
  );
}
