-- OnSpot: Supabase Postgres Schema + Row-Level Security
-- Run this in your Supabase project's SQL Editor.

create table if not exists public.outlets (
  id text primary key,
  name text not null check (char_length(trim(name)) between 2 and 120),
  city text not null check (char_length(trim(city)) between 2 and 80),
  city_slug text not null check (char_length(trim(city_slug)) between 2 and 80),
  neighborhood text not null check (char_length(trim(neighborhood)) between 2 and 100),
  lat double precision not null check (lat between 6.0 and 38.0),
  lng double precision not null check (lng between 68.0 and 98.0),
  category text not null check (char_length(trim(category)) between 2 and 40),
  price_range text not null check (price_range in ('₹', '₹₹', '₹₹₹')),
  known_for text not null check (char_length(trim(known_for)) between 3 and 200),
  best_item text not null check (char_length(trim(best_item)) between 2 and 140),
  vibe text not null check (char_length(trim(vibe)) between 2 and 120),
  why_underrated text not null check (char_length(trim(why_underrated)) >= 20),
  curated_by text not null default 'Community' check (char_length(trim(curated_by)) between 2 and 60),
  last_verified text not null,
  tags text[] not null default '{}',
  status text not null default 'pending' check (status in ('pending', 'approved', 'rejected')),
  created_at timestamptz not null default now()
);

create unique index if not exists outlets_name_city_unique
  on public.outlets (lower(trim(name)), city_slug)
  where status <> 'rejected';

create index if not exists outlets_city_status_idx
  on public.outlets (city_slug, status);

alter table public.outlets enable row level security;

grant usage on schema public to anon, authenticated, service_role;
grant select, insert on table public.outlets to anon, authenticated;
grant all on table public.outlets to service_role;

drop policy if exists "Public can read approved outlets" on public.outlets;
create policy "Public can read approved outlets"
  on public.outlets
  for select
  to anon, authenticated
  using (status = 'approved');

drop policy if exists "Public can submit pending outlets" on public.outlets;
create policy "Public can submit pending outlets"
  on public.outlets
  for insert
  to anon, authenticated
  with check (status = 'pending');
