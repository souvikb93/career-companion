/**
 * MobileNavBar — single source of truth for the mobile top nav bar.
 *
 * Layout:  [logo + "tracka"]  ·····  [right slot]
 * Height:  h-14 (56 px)
 * Glass:   glass-nav  (theme-aware: light + dark)
 * Logo:    h-7 w-7
 * Wordmark: text-[20px] logo-wordmark
 *
 * Consumers pass a `right` ReactNode for page-specific actions:
 *   - Hamburger menu  (TopNav / main app pages)
 *   - Skip / back     (OnboardingPage)
 *   - Theme + Lang    (AuthPage)
 *   - Nothing         (simple pages)
 */

import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";
import logo from "@/assets/logo.svg";

interface MobileNavBarProps {
  /** Page-specific actions rendered in the trailing slot */
  right?: React.ReactNode;
  /** Extra classes applied to the <header> element */
  className?: string;
  /** Whether the logo links to "/" (default true; false during onboarding) */
  logoLink?: boolean;
}

export function MobileNavBar({ right, className, logoLink = true }: MobileNavBarProps) {
  const branding = (
    <div className="flex items-center gap-2">
      <img src={logo} alt="Tracka" className="h-7 w-7" />
      <span className="logo-wordmark text-[20px] leading-none text-ink">tracka</span>
    </div>
  );

  return (
    <header
      className={cn(
        "lg:hidden sticky top-0 z-40 w-full",
        "flex items-center justify-between px-4 h-14",
        "glass-nav",
        className,
      )}
    >
      {logoLink ? (
        <Link to="/" className="flex items-center gap-2 -ml-0.5">
          <img src={logo} alt="Tracka" className="h-7 w-7" />
          <span className="logo-wordmark text-[20px] leading-none text-ink">tracka</span>
        </Link>
      ) : (
        branding
      )}

      {right && (
        <div className="flex items-center gap-3">
          {right}
        </div>
      )}
    </header>
  );
}
