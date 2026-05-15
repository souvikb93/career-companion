import { NavLink, Outlet } from "react-router-dom";
import { User, Cpu, Settings, LifeBuoy } from "lucide-react";
import { cn } from "@/lib/utils";
import { useT } from "@/lib/i18n";

export function AccountLayout() {
  const { t } = useT();

  const NAV = [
    { to: "/profile", icon: User, label: t("account.profile") },
    { to: "/ai-model", icon: Cpu, label: t("account.aiModel") },
    { to: "/settings", icon: Settings, label: t("account.settings") },
    { to: "/faq", icon: LifeBuoy, label: t("account.faq") },
  ];

  return (
    <div className="flex flex-col md:flex-row w-full" style={{ minHeight: "calc(100vh - 64px)" }}>
      {/* Desktop: vertical sidebar */}
      <aside
        className="hidden md:block w-60 shrink-0 border-r border-line/60 bg-white/40 backdrop-blur-xl px-4 py-8 sticky top-16 account-sidebar"
        style={{ height: "calc(100vh - 64px)" }}
      >
        <nav className="space-y-0.5">
          {NAV.map(({ to, icon: Icon, label }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-xl text-[14px] font-medium transition-colors duration-180",
                  isActive
                    ? "bg-ink text-white nav-item-active"
                    : "text-ink-muted hover:bg-surface-2 hover:text-ink nav-item-hover"
                )
              }
            >
              <Icon className="h-4 w-4 shrink-0" />
              {label}
            </NavLink>
          ))}
        </nav>
      </aside>

      {/* Content */}
      <main className="flex-1 min-w-0 overflow-y-auto">
        <Outlet />
      </main>
    </div>
  );
}
