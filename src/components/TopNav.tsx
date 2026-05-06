import { NavLink } from "react-router-dom";
import { User, Globe, Settings, LifeBuoy, LogOut } from "lucide-react";
import { cn } from "@/lib/utils";
import logo from "@/assets/logo.svg";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "@/components/ui/material-ui-dropdown-menu";

const NAV = [
  { to: "/", label: "Tracker", end: true },
  { to: "/cv", label: "Resume" },
  { to: "/cover-letter", label: "Letters" },
];

const MENU = [
  { icon: User, label: "Profile" },
  { icon: Globe, label: "Language" },
  { icon: Settings, label: "Settings" },
  { icon: LifeBuoy, label: "Support" },
  { icon: LogOut, label: "Log out" },
];

export function TopNav() {
  return (
    <header className="sticky top-0 z-40 w-full bg-surface border-b border-line">
      <div className="h-16 px-6 flex items-center justify-between">
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
          <DropdownMenu>
            <DropdownMenuTrigger
              className="h-10 w-10 rounded-full bg-surface-2 border border-line text-ink text-[13px] font-semibold transition-colors duration-200 hover:bg-surface-hover outline-none"
              aria-label="User menu"
            >
              JD
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              {MENU.slice(0, -1).map(({ icon: Icon, label }) => (
                <DropdownMenuItem key={label}>
                  <Icon className="h-4 w-4 text-ink-muted mr-1" />
                  {label}
                </DropdownMenuItem>
              ))}
              <DropdownMenuSeparator />
              <DropdownMenuItem>
                <LogOut className="h-4 w-4 text-ink-muted mr-1" />
                Log out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}
