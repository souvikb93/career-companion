import { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { User, Cpu, Settings, LifeBuoy, LogOut } from "lucide-react";
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

export function TopNav() {
  const { t } = useT();
  const { user, signOut } = useAuth();
  const { profile } = useProfile();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  const go = (to: string) => {
    setMenuOpen(false);
    navigate(to);
  };

  const NAV = [
    { to: "/", label: t("nav.tracker"), end: true },
    { to: "/cv", label: t("nav.resume") },
    { to: "/cover-letter", label: t("nav.letters") },
  ];

  const MENU = [
    { icon: User, label: t("menu.profile"), to: "/profile" },
    { icon: Cpu, label: t("menu.aiModel"), to: "/ai-model" },
    { icon: Settings, label: t("menu.settings"), to: "/settings" },
    { icon: LifeBuoy, label: t("menu.support"), to: "/faq" },
  ];

  const handleLogout = async () => {
    setMenuOpen(false);
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
              {MENU.map(({ icon: Icon, label, to }) => (
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
  );
}
