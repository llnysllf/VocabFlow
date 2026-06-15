-- VocabFlow — Supabase schema
-- Run this once in your project: Supabase dashboard -> SQL Editor -> New query
-- -> paste -> Run. It creates one row per user to hold their progress JSON,
-- locked down so each user can only ever read/write their own row.

create table if not exists public.progress (
  user_id    uuid primary key references auth.users (id) on delete cascade,
  state      jsonb       not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

alter table public.progress enable row level security;

-- A user may only see their own row.
drop policy if exists "read own progress" on public.progress;
create policy "read own progress"
  on public.progress for select
  using (auth.uid() = user_id);

-- A user may only create a row for themselves.
drop policy if exists "insert own progress" on public.progress;
create policy "insert own progress"
  on public.progress for insert
  with check (auth.uid() = user_id);

-- A user may only update their own row.
drop policy if exists "update own progress" on public.progress;
create policy "update own progress"
  on public.progress for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);
