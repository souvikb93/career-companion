import { useState } from "react";
import { Link, NavLink, useNavigate, useLocation } from "react-router-dom";
import { Menu, X, LogOut } from "lucide-react";
import { cn } from "@/lib/utils";
import logo from "@/assets/logo.svg";
import { useT } from "@/lib/i18n";
import { useAuth } from "@/hooks/useAuth";
import { useProfile } from "@/lib/profile-store";
import { toast } from "sonner";
import { LanguageToggle } from "./LanguageToggle";
import { Avatar } from "./Avatar";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "@/components/ui/material-ui-dropdown-menu";
import { User, Cpu, Settings, LifeBuoy } from "lucide-react";

export function TopNav() {
  const { t } = useT();
  const { user, signOut } = useAuth();
  const { profile } = useProfile();
  const navigate = useNavigate();
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);

  const closeDrawer = () => setDrawerOpen(false);

  const go = (to: string) => {
    setMenuOpen(false);
    closeDrawer();
    navigate(to);
  };

  const handleLogout = async () => {
    setMenuOpen(false);
    closeDrawer();
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
    { to: "/profile", label: t("menu.profile") },
    { to: "/ai-model", label: t("menu.aiModel") },
    { to: "/settings", label: t("menu.settings") },
    { to: "/faq", label: t("menu.support") },
  ];

  const MENU_ITEMS = [
    { icon: User, label: t("menu.profile"), to: "/profile" },
    { icon: Cpu, label: t("menu.aiModel"), to: "/ai-model" },
    { icon: Settings, label: t("menu.settings"), to: "/settings" },
    { icon: LifeBuoy, label: t("menu.support"), to: "/faq" },
  ];

  const isActive = (to: string, end?: boolean) => {
    if (end) return location.pathname === to;
    return location.pathname.startsWith(to);
  };

  return (
    <>
      {/* ── Desktop header ── */}
      <header className="sticky top-0 z-40 w-full bg-surface border-b border-line hidden lg:block">
        <div className="h-16 px-4 sm:px-8 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <img src={logo} alt="Tracka logo" className="h-10 w-10" />
            <span className="logo-wordmark text-[28px] leading-none text-ink">tracka</span>
          </div>

          <nav className="flex items-center gap-8">
            {NAV.map((n) => (
              <NavLink
                key={n.to}
                to={n.to}
                end={n.end}
                className={({ isActive }) =>
                  cn("nav-item text-[13px]", isActive && "nav-item-active text-ink")
                }
              >
                {n.label}
              </NavLink>
            ))}
          </nav>

          <div className="flex items-center gap-4">
            <LanguageToggle />
            <DropdownMenu open={menuOpen} onOpenChange={setMenuOpen}>
              <DropdownMenuTrigger
                className="rounded-full outline-none transition-opacity duration-200 hover:opacity-80"
                aria-label="User menu"
              >
                <Avatar
                  name={profile.fullName}
                  email={user?.email ?? undefined}
                  src={profile.avatarUrl}
                  size={40}
                />
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                {MENU_ITEMS.map(({ icon: Icon, label, to }) => (
                  <DropdownMenuItem key={label} onClick={() => go(to)}>
                    <Icon className="h-4 w-4 text-ink-muted mr-1" />
                    {label}
                  </DropdownMenuItem>
                ))}
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout}>
                  <LogOut className="h-4 w-4 text-ink-muted mr-1" />
                  {t("menu.logout")}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </header>

      {/* ── Mobile header ── */}
      <header className="sticky top-0 z-40 w-full bg-surface border-b border-line lg:hidden">
        <div className="h-16 px-4 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <img src={logo} alt="Tracka logo" className="h-10 w-10" />
            <span className="logo-wordmark text-[28px] leading-none text-ink">tracka</span>
          </Link>

          <button
            type="button"
            onClick={() => setDrawerOpen(true)}
            className="h-10 w-10 grid place-items-center rounded-xl text-ink hover:bg-surface-2 transition-colors"
            aria-label="Open menu"
          >
            <Menu className="h-5 w-5" />
          </button>
        </div>
      </header>

      {/* ── Slide-in drawer (mobile + desktop) ── */}
      {drawerOpen && (
        <>
          <div
            className="fixed inset-0 z-50 bg-ink/30 backdrop-blur-sm animate-panel-in"
            onClick={closeDrawer}
          />
          <aside className="fixed top-0 right-0 z-50 h-screen w-full max-w-[300px] bg-white/80 backdrop-blur-3xl border-l border-white/40 shadow-2xl flex flex-col animate-slide-in-right nav-drawer">

            {/* Header */}
            <div className="flex items-center justify-between px-5 h-16 border-b border-black/[0.06] nav-hairline shrink-0">
              <div className="flex items-center gap-2">
                <img src={logo} alt="Tracka" className="h-8 w-8" />
                <span className="logo-wordmark text-[22px] leading-none text-ink">tracka</span>
              </div>
              <button
                type="button"
                onClick={closeDrawer}
                className="h-9 w-9 grid place-items-center rounded-full text-ink-muted hover:text-ink hover:bg-black/5 transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Nav body */}
            <div className="flex-1 overflow-y-auto px-3 py-4 space-y-1">

              {/* Primary nav */}
              {NAV.map((n) => (
                <NavLink
                  key={n.to}
                  to={n.to}
                  end={n.end}
                  onClick={closeDrawer}
                  className={({ isActive }) =>
                    cn(
                      "flex items-center h-12 w-full px-4 rounded-xl text-[16px] font-medium transition-colors duration-150",
                      isActive ? "bg-ink text-white nav-item-active" : "text-ink hover:bg-black/5 nav-item-hover"
                    )
                  }
                >
                  {n.label}
                </NavLink>
              ))}

              {/* Divider */}
              <div className="h-px bg-black/[0.08] nav-divider mx-1 my-2" />

              {/* Settings items — no icons */}
              {SETTINGS_ITEMS.map(({ to, label }) => (
                <button
                  key={to}
                  type="button"
                  onClick={() => go(to)}
                  className={cn(
                    "w-full flex items-center h-12 px-4 rounded-xl text-[16px] font-medium transition-colors duration-150",
                    isActive(to) ? "bg-ink text-white nav-item-active" : "text-ink hover:bg-black/5 nav-item-hover"
                  )}
                >
                  {label}
                </button>
              ))}

              {/* Divider */}
              <div className="h-px bg-black/[0.08] nav-divider mx-1 my-2" />

              {/* Language */}
              <div className="px-4 py-2">
                <LanguageToggle />
              </div>

              {/* Sign out */}
              <button
                type="button"
                onClick={handleLogout}
                className="w-full flex items-center gap-3 h-12 px-4 rounded-xl text-[16px] font-medium text-red-500 hover:bg-red-50 transition-colors duration-150"
              >
                <LogOut className="h-4 w-4 shrink-0" />
                {t("menu.logout")}
              </button>
            </div>

            {/* Footer — user email */}
            {user?.email && (
              <div className="px-5 py-4 border-t border-black/[0.06] nav-hairline shrink-0">
                <p className="text-[12px] text-ink-muted truncate">{user.email}</p>
              </div>
            )}
          </aside>
        </>
      )}
    </>
  );
}
