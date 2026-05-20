import { NavLink, useNavigate } from "react-router-dom";
import { User, Globe, Settings, LifeBuoy, LogOut } from "lucide-react";
import { cn } from "@/lib/utils";
import logo from "@/assets/logo.svg";
import { useT } from "@/lib/i18n";
import { LanguageToggle } from "./LanguageToggle";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "@/components/ui/material-ui-dropdown-menu";

export function TopNav() {
  const { t } = useT();
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  const NAV = [
    { to: "/", label: t("nav.tracker"), end: true },
    { to: "/cv", label: t("nav.resume") },
    { to: "/cover-letter", label: t("nav.letters") },
    { to: "/lab/notlex", label: "Lab" },
  ];

  const MENU = [
    { icon: User, label: t("menu.profile"), to: "/profile" },
    { icon: Globe, label: t("menu.aiModel"), to: "/ai-model" },
    { icon: Settings, label: t("menu.settings"), to: "/settings" },
    { icon: LifeBuoy, label: t("menu.support"), to: "/support" },
  ];

  const initials = (user?.email ?? "?")
    .split("@")[0]
    .slice(0, 2)
    .toUpperCase();

  const handleLogout = async () => {
    await signOut();
    toast.success("Signed out");
    navigate("/auth", { replace: true });
  };

  return (
    <header className="sticky top-0 z-40 w-full bg-surface border-b border-line">
      <div className="h-16 px-8 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <img src={logo} alt="Tracka logo" className="h-10 w-10" />
          <span className="logo-wordmark hidden sm:inline text-[28px] leading-none text-ink">tracka</span>
        </div>

        <nav className="flex items-center gap-8">
          {NAV.map((n) => (
            <NavLink
              key={n.to}
              to={n.to}
              end={n.end}
              className={({ isActive }) =>
                cn("nav-item", isActive && "nav-item-active text-ink")
              }
            >
              {n.label}
            </NavLink>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          <LanguageToggle />
          <DropdownMenu>
            <DropdownMenuTrigger
              className="h-10 w-10 rounded-full bg-surface-2 border border-line text-ink text-[13px] font-semibold transition-colors duration-200 hover:bg-surface-hover outline-none"
              aria-label="User menu"
            >
              {initials}
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              {MENU.map(({ icon: Icon, label, to }) => (
                <DropdownMenuItem key={label} onClick={() => navigate(to)}>
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
  );
}
