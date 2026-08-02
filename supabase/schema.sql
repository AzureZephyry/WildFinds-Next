-- WildFinds MVP database schema
-- This file is intended for Supabase SQL execution.

create extension if not exists pgcrypto;

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  email text not null,
  role text not null default 'user' check (role in ('owner', 'admin', 'moderator', 'user')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, full_name, email, role)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'full_name', null),
    new.email,
    'user'
  )
  on conflict (id) do nothing;

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;

create trigger on_auth_user_created
after insert on auth.users
for each row
execute function public.handle_new_user();

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
  profile_id uuid references public.profiles (id) on delete set null,
  reporter_name text not null,
  email text not null,
  contact_number text not null,
  verification_details text,
  submitted_at timestamptz not null default now(),
  review_status text not null default 'pending' check (review_status in ('pending', 'approved', 'rejected'))
);

create index if not exists idx_reports_profile_id on public.reports (profile_id);

create unique index if not exists idx_reports_id_item_id_uq on public.reports (id, item_id);

create table if not exists public.claims (
  id uuid primary key default gen_random_uuid(),
  item_id uuid not null references public.items (id) on delete cascade,
  source_report_id uuid,
  claimant_profile_id uuid references public.profiles (id) on delete set null,
  claimant_name text not null,
  contact_info text not null,
  details text not null,
  status text not null default 'submitted' check (status in ('submitted', 'pending_review', 'approved', 'rejected', 'withdrawn')),
  reviewed_by_profile_id uuid references public.profiles (id) on delete set null,
  review_notes text,
  created_at timestamptz not null default now(),
  reviewed_at timestamptz
);

create index if not exists idx_claims_item_id on public.claims (item_id);
create index if not exists idx_claims_source_report_id on public.claims (source_report_id);
create index if not exists idx_claims_claimant_profile_id on public.claims (claimant_profile_id);
create index if not exists idx_claims_status on public.claims (status);
create index if not exists idx_claims_reviewed_by_profile_id on public.claims (reviewed_by_profile_id);

create unique index if not exists idx_claims_active_unique
on public.claims (item_id, claimant_profile_id)
where status in ('submitted', 'pending_review') and claimant_profile_id is not null;

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conrelid = 'public.claims'::regclass
      and conname = 'claims_source_report_item_fkey'
  ) then
    alter table public.claims
      add constraint claims_source_report_item_fkey
      foreign key (source_report_id, item_id) references public.reports (id, item_id) on delete restrict;
  end if;
end
$$;

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

create or replace function public.is_claim_submission_eligible(p_item_id uuid, p_source_report_id uuid)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
declare
  current_user_id uuid;
  source_report_record record;
  item_record record;
begin
  current_user_id := auth.uid();

  if current_user_id is null or p_item_id is null or p_source_report_id is null then
    return false;
  end if;

  if not exists (
    select 1
    from public.profiles p
    where p.id = current_user_id
  ) then
    return false;
  end if;

  if not exists (
    select 1
    from public.reports r
    where r.id = p_source_report_id
  ) then
    return false;
  end if;

  select id, item_id, profile_id
  into source_report_record
  from public.reports
  where id = p_source_report_id;

  if source_report_record.item_id is distinct from p_item_id then
    return false;
  end if;

  if source_report_record.profile_id is null or source_report_record.profile_id = current_user_id then
    return false;
  end if;

  select id, type, status
  into item_record
  from public.items
  where id = p_item_id;

  if not found then
    return false;
  end if;

  if item_record.type is distinct from 'found' then
    return false;
  end if;

  if item_record.status not in ('submitted', 'active') then
    return false;
  end if;

  if not exists (
    select 1
    from public.claims c
    where c.item_id = p_item_id
      and c.claimant_profile_id = current_user_id
      and c.status = 'submitted'
  ) and not exists (
    select 1
    from public.claims c
    where c.item_id = p_item_id
      and c.claimant_profile_id = current_user_id
      and c.status = 'pending_review'
  ) then
    return true;
  end if;

  return false;
end;
$$;

revoke all on function public.is_claim_submission_eligible(uuid, uuid) from public;
grant execute on function public.is_claim_submission_eligible(uuid, uuid) to authenticated;

revoke all privileges on table public.profiles from anon;
revoke all privileges on table public.profiles from authenticated;
grant select on table public.profiles to authenticated;
grant update (full_name) on table public.profiles to authenticated;

revoke all privileges on table public.reports from anon;
revoke all privileges on table public.reports from authenticated;
grant insert, select on table public.reports to authenticated;

revoke insert on table public.items from anon;
revoke select on table public.items from anon;
revoke insert on table public.items from authenticated;
revoke select on table public.items from authenticated;
grant select (id, reference_number, type, name, category, description, brand, color, building, location, date_reported, time_reported, image_url, status, created_at, updated_at, resolved_at) on table public.items to anon, authenticated;
grant insert on table public.items to authenticated;

revoke all privileges on table public.claims from anon;
revoke all privileges on table public.claims from authenticated;
grant insert, select on table public.claims to authenticated;

create or replace function public.update_updated_at_column()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists update_items_updated_at on public.items;

drop trigger if exists update_profiles_updated_at on public.profiles;

create trigger update_items_updated_at
before update on public.items
for each row
execute function public.update_updated_at_column();

create trigger update_profiles_updated_at
before update on public.profiles
for each row
execute function public.update_updated_at_column();

alter table public.profiles enable row level security;
alter table public.items enable row level security;
alter table public.reports enable row level security;
alter table public.claims enable row level security;
alter table public.matches enable row level security;

drop policy if exists "Allow public read access to visible items" on public.items;
drop policy if exists "Allow public insert access to items" on public.items;
drop policy if exists "Allow public read access to reports" on public.reports;
drop policy if exists "Allow public insert access to reports" on public.reports;
drop policy if exists "Authenticated users can insert reports" on public.reports;
drop policy if exists "Authenticated users can read own reports" on public.reports;
drop policy if exists "Authenticated users can update own reports" on public.reports;
drop policy if exists "Authenticated users can delete own unresolved reports" on public.reports;
drop policy if exists "Moderators and admins can access all reports" on public.reports;
drop policy if exists "Allow public read access to claims" on public.claims;
drop policy if exists "Allow public insert access to claims" on public.claims;
drop policy if exists "Allow public read access to matches" on public.matches;
drop policy if exists "Allow public insert access to matches" on public.matches;
drop policy if exists "Users can read own profile" on public.profiles;
drop policy if exists "Users can update own profile" on public.profiles;

create policy "Allow public read access to visible items" on public.items
for select
using (status = 'submitted' or status = 'active' or status = 'matched');

create policy "Authenticated users can insert submitted items" on public.items
for insert
to authenticated
with check (status = 'submitted');

create policy "Users can read own profile" on public.profiles
for select
to authenticated
using (auth.uid() = id);

create policy "Users can update own profile" on public.profiles
for update
to authenticated
using (auth.uid() = id)
with check (auth.uid() = id);

create policy "Authenticated users can insert reports" on public.reports
for insert
to authenticated
with check (
  profile_id is not null and
  profile_id = (select id from public.profiles where id = auth.uid())
);

create policy "Authenticated users can read own reports" on public.reports
for select
to authenticated
using (
  profile_id is not null and
  profile_id = (select id from public.profiles where id = auth.uid())
);

create policy "Authenticated users can update own reports" on public.reports
for update
to authenticated
using (
  profile_id is not null and
  profile_id = (select id from public.profiles where id = auth.uid())
)
with check (
  profile_id is not null and
  profile_id = (select id from public.profiles where id = auth.uid())
);

create policy "Authenticated users can delete own unresolved reports" on public.reports
for delete
to authenticated
using (
  profile_id is not null and
  profile_id = (select id from public.profiles where id = auth.uid()) and
  exists (
    select 1
    from public.items i
    where i.id = item_id
      and i.status in ('submitted', 'active')
  )
);

create policy "Moderators and admins can access all reports" on public.reports
for select
to authenticated
using (
  exists (
    select 1
    from public.profiles p
    where p.id = auth.uid()
      and p.role in ('moderator', 'admin', 'owner')
  )
);

drop policy if exists "Allow public insert access to claims" on public.claims;

drop policy if exists "Authenticated users can insert claims" on public.claims;
drop policy if exists "Authenticated users can read own claims" on public.claims;
drop policy if exists "Moderators and admins can access all claims" on public.claims;

create policy "Authenticated users can insert claims" on public.claims
for insert
to authenticated
with check (
  claimant_profile_id is not null and
  claimant_profile_id = auth.uid() and
  source_report_id is not null and
  status = 'submitted' and
  reviewed_by_profile_id is null and
  review_notes is null and
  reviewed_at is null and
  public.is_claim_submission_eligible(item_id, source_report_id)
);

create policy "Authenticated users can read own claims" on public.claims
for select
to authenticated
using (
  claimant_profile_id is not null and
  claimant_profile_id = auth.uid()
);

create policy "Moderators and admins can access all claims" on public.claims
for select
to authenticated
using (
  exists (
    select 1
    from public.profiles p
    where p.id = auth.uid()
      and p.role in ('moderator', 'admin', 'owner')
  )
);
