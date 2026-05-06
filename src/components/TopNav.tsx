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
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onDoc = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, []);

  return (
    <header className="sticky top-0 z-40 w-full bg-surface border-b border-line">
      <div className="h-16 px-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <img src={logo} alt="Tracka logo" className="h-10 w-10" />
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

        <div className="flex items-center gap-3 relative" ref={ref}>
          <button
            type="button"
            onClick={() => setOpen((o) => !o)}
            className="h-10 w-10 rounded-full bg-surface-2 border border-line text-ink text-[13px] font-semibold transition-opacity duration-180 hover:opacity-80"
            aria-label="User menu"
            aria-expanded={open}
          >
            JD
          </button>
          {open && (
            <div className="absolute right-0 top-12 z-50 w-56 rounded-2xl border border-line bg-popover p-1 shadow-lg">
              {MENU.map(({ icon: Icon, label }, i) => (
                <button
                  key={label}
                  type="button"
                  onClick={() => setOpen(false)}
                  className={cn(
                    "w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-[13px] text-ink hover:bg-surface-2 transition-colors duration-200",
                    i === MENU.length - 1 && "mt-1 border-t border-line rounded-t-none",
                  )}
                >
                  <Icon className="h-4 w-4 text-ink-muted" />
                  {label}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
