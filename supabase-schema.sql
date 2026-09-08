-- Run this once in Supabase SQL Editor to enable synced NEXURA Library data
create table if not exists public.nexura_collections (
  user_id uuid not null references auth.users(id) on delete cascade,
  kind text not null check (kind in ('favorites','recent')),
  items jsonb not null default '[]'::jsonb,
  updated_at timestamptz not null default now(),
  primary key (user_id, kind)
);
alter table public.nexura_collections enable row level security;
create policy "Users manage their own NEXURA collections"
on public.nexura_collections for all
using (auth.uid() = user_id)
with check (auth.uid() = user_id);