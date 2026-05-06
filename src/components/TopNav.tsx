import { NavLink } from "react-router-dom";
import { cn } from "@/lib/utils";

const NAV = [
  { to: "/", label: "Jobs", end: true },
  { to: "/cv", label: "CV Builder" },
  { to: "/cover-letter", label: "Cover Letter Builder" },
];

export function TopNav() {
  return (
    <header className="sticky top-0 z-40 w-full bg-surface border-b border-line">
      <div className="h-16 px-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div
            aria-label="Tracka logo"
            className="h-10 w-10 rounded-xl bg-brand grid place-items-center"
          >
            <span className="text-primary-foreground font-bold text-lg leading-none">T</span>
          </div>
          <span className="hidden sm:inline text-[14px] font-semibold text-ink">Tracka</span>
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
          <button
            type="button"
            className="h-10 w-10 rounded-full bg-surface-2 border border-line text-ink text-[13px] font-semibold transition-opacity duration-180 hover:opacity-80"
            aria-label="User menu"
          >
            JD
          </button>
        </div>
      </div>
    </header>
  );
}
