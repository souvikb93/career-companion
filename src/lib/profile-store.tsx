import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import type { ParsedProfile } from "@/lib/groq";

export type Profile = ParsedProfile;

export const EMPTY_PROFILE: Profile = {
  fullName: "",
  title: "",
  email: "",
  phone: "",
  location: "",
  industry: "",
  linkedin: "",
  summary: "",
  skills: [],
  experiences: [],
  education: [],
  customInstructions: "",
};

interface ProfileCtx {
  profile: Profile;
  setProfile: (p: Profile) => void;
  saveProfile: (p: Profile) => Promise<void>;
  completeOnboarding: (p?: Profile) => Promise<void>;
  loading: boolean;
  onboardingCompleted: boolean | null;
}

const ProfileContext = createContext<ProfileCtx | null>(null);

export function ProfileProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [profile, setProfileState] = useState<Profile>(EMPTY_PROFILE);
  const [loading, setLoading] = useState(true);
  const [onboardingCompleted, setOnboardingCompleted] = useState<boolean | null>(null);

  const userId = user?.id;
  useEffect(() => {
    if (!userId) { setLoading(false); setOnboardingCompleted(null); return; }
    setLoading(true);
    supabase
      .from("profiles")
      .select("data, onboarding_completed")
      .eq("id", userId)
      .single()
      .then(({ data }) => {
        if (data?.data) setProfileState(data.data as Profile);
        setOnboardingCompleted(data?.onboarding_completed ?? false);
      })
      .catch(() => {
        setOnboardingCompleted(false);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [userId]);

  const setProfile = (p: Profile) => setProfileState(p);

  const saveProfile = async (p: Profile) => {
    if (!user) return;
    setProfileState(p);
    await supabase.from("profiles").upsert({ id: user.id, data: p });
  };

  const completeOnboarding = async (p?: Profile) => {
    if (!user) return;
    const data = p ?? { ...EMPTY_PROFILE, email: user.email ?? "" };
    await supabase.from("profiles").upsert({ id: user.id, data, onboarding_completed: true });
    setProfileState(data);
    setOnboardingCompleted(true);
  };

  return (
    <ProfileContext.Provider value={{ profile, setProfile, saveProfile, completeOnboarding, loading, onboardingCompleted }}>
      {children}
    </ProfileContext.Provider>
  );
}

export function useProfile() {
  const ctx = useContext(ProfileContext);
  if (!ctx) throw new Error("useProfile must be used within ProfileProvider");
  return ctx;
}
