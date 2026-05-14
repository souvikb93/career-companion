import { Component, ReactNode } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AppLayout } from "@/components/AppLayout";
import { AccountLayout } from "@/components/AccountLayout";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { JobsProvider } from "@/lib/jobs-store";
import { LanguageProvider } from "@/lib/i18n";
import { AuthProvider } from "@/hooks/useAuth";
import { ProfileProvider } from "@/lib/profile-store";
import OnboardingPage from "./pages/OnboardingPage";
import Index from "./pages/Index.tsx";
import CVBuilderPage from "./pages/CVBuilderPage";
import CoverLetterPage from "./pages/CoverLetterPage";
import AuthPage from "./pages/AuthPage";
import ProfilePage from "./pages/ProfilePage";
import AIModelPage from "./pages/AIModelPage";
import SettingsPage from "./pages/SettingsPage";
import SupportPage from "./pages/SupportPage";
import NotFound from "./pages/NotFound.tsx";

class ErrorBoundary extends Component<{ children: ReactNode }, { error: Error | null }> {
  state: { error: Error | null } = { error: null };
  static getDerivedStateFromError(error: Error) { return { error }; }
  render() {
    if (this.state.error) {
      return (
        <div style={{ padding: 40, fontFamily: "monospace" }}>
          <h1 style={{ color: "red" }}>Something went wrong</h1>
          <pre style={{ whiteSpace: "pre-wrap", marginTop: 16 }}>{this.state.error.message}</pre>
          <pre style={{ whiteSpace: "pre-wrap", marginTop: 8, fontSize: 12, color: "#666" }}>
            {this.state.error.stack}
          </pre>
          <button onClick={() => window.location.reload()} style={{ marginTop: 24, padding: "8px 20px", cursor: "pointer" }}>
            Reload
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

const queryClient = new QueryClient();

const App = () => (
  <ErrorBoundary>
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <LanguageProvider>
            <ProfileProvider>
              <JobsProvider>
                <Routes>
                  <Route path="/auth" element={<AuthPage />} />
                  <Route
                    path="/onboarding"
                    element={
                      <ProtectedRoute>
                        <OnboardingPage />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    element={
                      <ProtectedRoute checkOnboarding>
                        <AppLayout />
                      </ProtectedRoute>
                    }
                  >
                    <Route path="/" element={<Index />} />
                    <Route path="/cv" element={<CVBuilderPage />} />
                    <Route path="/cover-letter" element={<CoverLetterPage />} />

                    {/* Account section — shared sidebar */}
                    <Route element={<AccountLayout />}>
                      <Route path="/profile" element={<ProfilePage />} />
                      <Route path="/ai-model" element={<AIModelPage />} />
                      <Route path="/settings" element={<SettingsPage />} />
                      <Route path="/faq" element={<SupportPage />} />
                    </Route>
                  </Route>
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </JobsProvider>
            </ProfileProvider>
          </LanguageProvider>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
  </ErrorBoundary>
);

export default App;
