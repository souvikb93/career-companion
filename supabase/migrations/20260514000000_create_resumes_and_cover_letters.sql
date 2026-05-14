-- Separate tables for saved resumes and cover letters.
-- Each user's saved items are their own rows with RLS.

create table if not exists public.resumes (
  id          uuid        primary key default gen_random_uuid(),
  user_id     uuid        not null references auth.users(id) on delete cascade,
  name        text        not null default 'Untitled',
  data        jsonb       not null default '{}'::jsonb,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

alter table public.resumes enable row level security;

create policy "Users can manage their own resumes"
  on public.resumes for all
  using  (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create index if not exists resumes_user_id_idx on public.resumes (user_id);

-- ─────────────────────────────────────────────────────────────────

create table if not exists public.cover_letters (
  id          uuid        primary key default gen_random_uuid(),
  user_id     uuid        not null references auth.users(id) on delete cascade,
  name        text        not null default 'Untitled',
  data        jsonb       not null default '{}'::jsonb,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

alter table public.cover_letters enable row level security;

create policy "Users can manage their own cover letters"
  on public.cover_letters for all
  using  (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create index if not exists cover_letters_user_id_idx on public.cover_letters (user_id);
