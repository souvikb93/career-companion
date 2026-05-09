import { LanguageToggle } from "@/components/LanguageToggle";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

export default function SettingsPage() {
  const { signOut } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut();
    toast.success("Signed out");
    navigate("/auth", { replace: true });
  };

  return (
    <main className="max-w-2xl mx-auto px-8 py-10 space-y-6">
      <h1 className="text-2xl font-semibold text-ink">Settings</h1>

      <section className="bg-surface border border-line rounded-xl p-6">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-ink font-medium">Language</div>
            <div className="text-xs text-ink-muted">Switch the interface language</div>
          </div>
          <LanguageToggle />
        </div>
      </section>

      <section className="bg-surface border border-line rounded-xl p-6">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-ink font-medium">Sign out</div>
            <div className="text-xs text-ink-muted">End your current session</div>
          </div>
          <Button variant="outline" onClick={handleSignOut}>Sign out</Button>
        </div>
      </section>
    </main>
  );
}
