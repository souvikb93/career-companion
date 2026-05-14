-- Add a jobs column to the profiles table so job-tracker data persists
-- in Supabase across devices and browser sessions instead of being
-- localStorage-only.
alter table public.profiles
  add column if not exists jobs jsonb not null default '[]'::jsonb;
