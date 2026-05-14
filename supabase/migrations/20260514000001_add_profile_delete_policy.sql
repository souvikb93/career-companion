-- Allow users to delete their own profile row.
-- Required for the "Delete account + data" flow in SettingsPage.
-- Without this policy, RLS silently blocks the DELETE and the profile
-- is never removed, so re-login after deletion skips onboarding.

create policy "Users can delete own profile"
  on public.profiles for delete
  using (auth.uid() = id);
