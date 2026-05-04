create table if not exists public.maruppu_profile_stores (
  device_id text primary key,
  store jsonb not null default '{"currentProfile":"","profiles":{}}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.maruppu_profile_stores enable row level security;

drop policy if exists "anon can read maruppu stores" on public.maruppu_profile_stores;
drop policy if exists "anon can insert maruppu stores" on public.maruppu_profile_stores;
drop policy if exists "anon can update maruppu stores" on public.maruppu_profile_stores;

create policy "anon can read maruppu stores"
on public.maruppu_profile_stores
for select
to anon
using (true);

create policy "anon can insert maruppu stores"
on public.maruppu_profile_stores
for insert
to anon
with check (true);

create policy "anon can update maruppu stores"
on public.maruppu_profile_stores
for update
to anon
using (true)
with check (true);
