import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useProfile } from "@/lib/profile-store";

export function ProtectedRoute({ children, checkOnboarding }: { children: JSX.Element; checkOnboarding?: boolean }) {
  const { session, loading: authLoading } = useAuth();
  const { onboardingCompleted, loading: profileLoading } = useProfile();
  const location = useLocation();

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-ink-muted text-sm">
        Loading…
      </div>
    );
  }

  if (!session) {
    return <Navigate to="/auth" state={{ from: location }} replace />;
  }

  if (checkOnboarding) {
    // Only block on the very first load — if we already know onboardingCompleted,
    // let a background re-fetch finish silently without unmounting the app.
    if (onboardingCompleted === null && profileLoading) {
      return (
        <div className="min-h-screen flex items-center justify-center text-ink-muted text-sm">
          Loading…
        </div>
      );
    }
    if (onboardingCompleted === false) {
      return <Navigate to="/onboarding" replace />;
    }
  }

  return children;
}
