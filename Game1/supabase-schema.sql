create table if not exists public.maruppu_profile_stores (
  user_id uuid primary key references auth.users(id) on delete cascade,
  device_id text,
  store jsonb not null default '{"currentProfile":"","profiles":{}}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.maruppu_profile_stores
  add column if not exists user_id uuid references auth.users(id) on delete cascade;

alter table public.maruppu_profile_stores
  add column if not exists device_id text;

alter table public.maruppu_profile_stores
  add column if not exists store jsonb not null default '{"currentProfile":"","profiles":{}}'::jsonb;

alter table public.maruppu_profile_stores
  add column if not exists created_at timestamptz not null default now();

alter table public.maruppu_profile_stores
  add column if not exists updated_at timestamptz not null default now();

create unique index if not exists maruppu_profile_stores_user_id_key
on public.maruppu_profile_stores (user_id)
where user_id is not null;

alter table public.maruppu_profile_stores enable row level security;

drop policy if exists "anon can read maruppu stores" on public.maruppu_profile_stores;
drop policy if exists "anon can insert maruppu stores" on public.maruppu_profile_stores;
drop policy if exists "anon can update maruppu stores" on public.maruppu_profile_stores;
drop policy if exists "users can read their maruppu store" on public.maruppu_profile_stores;
drop policy if exists "users can insert their maruppu store" on public.maruppu_profile_stores;
drop policy if exists "users can update their maruppu store" on public.maruppu_profile_stores;

create policy "users can read their maruppu store"
on public.maruppu_profile_stores
for select
to authenticated
using (auth.uid() = user_id);

create policy "users can insert their maruppu store"
on public.maruppu_profile_stores
for insert
to authenticated
with check (auth.uid() = user_id);

create policy "users can update their maruppu store"
on public.maruppu_profile_stores
for update
to authenticated
using (auth.uid() = user_id)
with check (auth.uid() = user_id);
