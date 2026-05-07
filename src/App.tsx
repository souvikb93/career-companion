import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AppLayout } from "@/components/AppLayout";
import { JobsProvider } from "@/lib/jobs-store";
import { LanguageProvider } from "@/lib/i18n";
import Index from "./pages/Index.tsx";
import CVBuilderPage from "./pages/CVBuilderPage";
import CoverLetterPage from "./pages/CoverLetterPage";
import NotFound from "./pages/NotFound.tsx";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <LanguageProvider>
        <JobsProvider>
          <Routes>
            <Route element={<AppLayout />}>
              <Route path="/" element={<Index />} />
              <Route path="/cv" element={<CVBuilderPage />} />
              <Route path="/cover-letter" element={<CoverLetterPage />} />
            </Route>
            <Route path="*" element={<NotFound />} />
          </Routes>
        </JobsProvider>
        </LanguageProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
