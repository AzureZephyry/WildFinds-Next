-- WildFinds MVP database schema
-- This file is intended for Supabase SQL execution.

create extension if not exists pgcrypto;

create table if not exists public.items (
  id uuid primary key default gen_random_uuid(),
  reference_number text not null unique,
  type text not null check (type in ('lost', 'found')),
  name text not null,
  category text not null,
  description text,
  brand text,
  color text,
  identifying_marks text,
  building text,
  location text not null,
  date_reported date not null,
  time_reported time not null,
  image_url text,
  status text not null default 'submitted' check (status in ('submitted', 'active', 'matched', 'claimed', 'closed')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  resolved_at timestamptz
);

create table if not exists public.reports (
  id uuid primary key default gen_random_uuid(),
  item_id uuid not null references public.items (id) on delete cascade,
  reporter_name text not null,
  email text not null,
  contact_number text not null,
  submitted_at timestamptz not null default now(),
  review_status text not null default 'pending' check (review_status in ('pending', 'approved', 'rejected'))
);

create table if not exists public.claims (
  id uuid primary key default gen_random_uuid(),
  item_id uuid not null references public.items (id) on delete cascade,
  claimant_name text not null,
  contact_info text not null,
  details text not null,
  status text not null default 'submitted' check (status in ('submitted', 'pending_review', 'approved', 'rejected', 'withdrawn')),
  created_at timestamptz not null default now(),
  reviewed_at timestamptz
);

create table if not exists public.matches (
  id uuid primary key default gen_random_uuid(),
  lost_item_id uuid not null references public.items (id) on delete cascade,
  found_item_id uuid not null references public.items (id) on delete cascade,
  status text not null default 'submitted' check (status in ('submitted', 'pending_review', 'approved', 'rejected', 'withdrawn')),
  created_at timestamptz not null default now(),
  reviewed_at timestamptz,
  constraint matches_lost_found_different check (lost_item_id <> found_item_id)
);

create or replace function public.generate_reference_number(report_type text, report_date date)
returns text
language plpgsql
security definer
set search_path = public
as $$
declare
  normalized_type text;
  prefix text;
  date_part text;
  pattern text;
  next_number integer;
begin
  if report_date is null then
    raise exception 'Report date is required' using errcode = '22023';
  end if;

  normalized_type := lower(btrim(coalesce(report_type, '')));

  if normalized_type = 'lost' then
    prefix := 'L';
  elsif normalized_type = 'found' then
    prefix := 'F';
  else
    raise exception 'Invalid report type: %', report_type using errcode = '22023';
  end if;

  date_part := to_char(report_date, 'YYYYMMDD');
  pattern := prefix || date_part || '-%';

  perform pg_advisory_xact_lock(hashtext('wildfinds:' || normalized_type || ':' || date_part));

  select coalesce(max(cast(substring(reference_number from '[0-9]+$') as integer)), 0) + 1
  into next_number
  from public.items
  where reference_number like pattern;

  return prefix || date_part || '-' || next_number;
end;
$$;

grant execute on function public.generate_reference_number(text, date) to anon, authenticated;

create or replace function public.update_updated_at_column()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists update_items_updated_at on public.items;

create trigger update_items_updated_at
before update on public.items
for each row
execute function public.update_updated_at_column();

alter table public.items enable row level security;
alter table public.reports enable row level security;
alter table public.claims enable row level security;
alter table public.matches enable row level security;

drop policy if exists "Allow public read access to items" on public.items;
drop policy if exists "Allow public insert access to items" on public.items;
drop policy if exists "Allow public read access to reports" on public.reports;
drop policy if exists "Allow public insert access to reports" on public.reports;
drop policy if exists "Allow public read access to claims" on public.claims;
drop policy if exists "Allow public insert access to claims" on public.claims;
drop policy if exists "Allow public read access to matches" on public.matches;
drop policy if exists "Allow public insert access to matches" on public.matches;

create policy "Allow public read access to visible items" on public.items
for select
using (status = 'submitted' or status = 'active' or status = 'matched');

create policy "Allow public insert access to items" on public.items
for insert
with check (status = 'submitted');

create policy "Allow public insert access to reports" on public.reports
for insert
with check (true);

create policy "Allow public insert access to claims" on public.claims
for insert
with check (true);
