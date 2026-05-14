import { useState } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { Menu, X, User, Cpu, Settings, LifeBuoy, LogOut } from "lucide-react";
import { cn } from "@/lib/utils";
import logo from "@/assets/logo.svg";
import { useT } from "@/lib/i18n";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import { LanguageToggle } from "./LanguageToggle";

export function TopNav() {
  const { t } = useT();
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

  const close = () => setOpen(false);

  const go = (to: string) => {
    close();
    navigate(to);
  };

  const handleLogout = async () => {
    close();
    await signOut();
    toast.success("Signed out");
    navigate("/auth", { replace: true });
  };

  const NAV = [
    { to: "/", label: t("nav.tracker"), end: true },
    { to: "/cv", label: t("nav.resume") },
    { to: "/cover-letter", label: t("nav.letters") },
  ];

  const SETTINGS_ITEMS = [
    { icon: User, label: t("menu.profile"), to: "/profile" },
    { icon: Cpu, label: t("menu.aiModel"), to: "/ai-model" },
    { icon: Settings, label: t("menu.settings"), to: "/settings" },
    { icon: LifeBuoy, label: t("menu.support"), to: "/faq" },
  ];

  return (
    <>
      <header className="sticky top-0 z-40 w-full bg-surface border-b border-line">
        <div className="h-16 px-4 sm:px-8 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <img src={logo} alt="Tracka logo" className="h-10 w-10" />
            <span className="logo-wordmark text-[28px] leading-none text-ink">tracka</span>
          </Link>

          <button
            type="button"
            onClick={() => setOpen(true)}
            className="h-10 w-10 grid place-items-center rounded-xl text-ink hover:bg-surface-2 transition-colors"
            aria-label="Open menu"
          >
            <Menu className="h-5 w-5" />
          </button>
        </div>
      </header>

      {open && (
        <>
          <div
            className="fixed inset-0 z-50 bg-ink/20 backdrop-blur-sm animate-panel-in"
            onClick={close}
          />
          <aside className="fixed top-0 right-0 z-50 h-screen w-full max-w-[300px] bg-white/85 backdrop-blur-2xl border-l border-white/50 flex flex-col animate-slide-in-right">
            {/* Menu header */}
            <div className="flex items-center justify-between px-5 h-16 border-b border-line/40 shrink-0">
              <div className="flex items-center gap-2">
                <img src={logo} alt="Tracka" className="h-8 w-8" />
                <span className="logo-wordmark text-[22px] leading-none text-ink">tracka</span>
              </div>
              <button
                type="button"
                onClick={close}
                className="h-9 w-9 grid place-items-center rounded-full text-ink-muted hover:text-ink hover:bg-surface-2 transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Menu body */}
            <div className="flex-1 overflow-y-auto py-3 space-y-0.5">
              {/* Section 1 — Navigation */}
              <MenuSection label="Navigation">
                {NAV.map((n) => (
                  <NavLink
                    key={n.to}
                    to={n.to}
                    end={n.end}
                    onClick={close}
                    className={({ isActive }) =>
                      cn(
                        "flex items-center h-11 w-full px-4 rounded-xl text-[15px] font-medium transition-colors duration-180",
                        isActive ? "bg-ink text-white" : "text-ink hover:bg-surface-2"
                      )
                    }
                  >
                    {n.label}
                  </NavLink>
                ))}
              </MenuSection>

              <div className="h-px bg-line/60 mx-4 my-1" />

              {/* Section 2 — User & App */}
              <MenuSection label={t("account.sectionHeader")}>
                {SETTINGS_ITEMS.map(({ icon: Icon, label, to }) => (
                  <button
                    key={to}
                    type="button"
                    onClick={() => go(to)}
                    className="w-full flex items-center gap-3 h-11 px-4 rounded-xl text-[15px] font-medium text-ink hover:bg-surface-2 transition-colors duration-180"
                  >
                    <Icon className="h-4 w-4 text-ink-muted shrink-0" />
                    {label}
                  </button>
                ))}
                <div className="px-4 py-1.5">
                  <LanguageToggle />
                </div>
              </MenuSection>

              <div className="h-px bg-line/60 mx-4 my-1" />

              {/* Section 3 — Account */}
              <MenuSection label="Account">
                <button
                  type="button"
                  onClick={handleLogout}
                  className="w-full flex items-center gap-3 h-11 px-4 rounded-xl text-[15px] font-medium text-red-500 hover:bg-red-50 transition-colors duration-180"
                >
                  <LogOut className="h-4 w-4 shrink-0" />
                  {t("menu.logout")}
                </button>
              </MenuSection>
            </div>

            {/* Footer — user email */}
            {user?.email && (
              <div className="px-5 py-4 border-t border-line/40 shrink-0">
                <p className="text-[12px] text-ink-muted truncate">{user.email}</p>
              </div>
            )}
          </aside>
        </>
      )}
    </>
  );
}

function MenuSection({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="py-1 px-2">
      <p className="eyebrow px-2 mb-1">{label}</p>
      {children}
    </div>
  );
}
