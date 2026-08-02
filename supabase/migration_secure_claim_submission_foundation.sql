-- Claim foundation for the production workflow
-- Adds claim identity and review columns, eligibility checks, and secure RLS policies.

alter table public.claims
  add column if not exists source_report_id uuid;

alter table public.claims
  add column if not exists claimant_profile_id uuid;

alter table public.claims
  add column if not exists reviewed_by_profile_id uuid;

alter table public.claims
  add column if not exists review_notes text;

-- Ensure the claim can only point at a report that belongs to the same item.
do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conrelid = 'public.claims'::regclass
      and conname = 'claims_claimant_profile_id_fkey'
  ) then
    alter table public.claims
      add constraint claims_claimant_profile_id_fkey
      foreign key (claimant_profile_id) references public.profiles (id) on delete set null;
  end if;

  if not exists (
    select 1
    from pg_constraint
    where conrelid = 'public.claims'::regclass
      and conname = 'claims_reviewed_by_profile_id_fkey'
  ) then
    alter table public.claims
      add constraint claims_reviewed_by_profile_id_fkey
      foreign key (reviewed_by_profile_id) references public.profiles (id) on delete set null;
  end if;
end
$$;

-- Create a unique relationship between reports and items for claim validation.
create unique index if not exists idx_reports_id_item_id_uq on public.reports (id, item_id);

-- Enforce report/item integrity for claims via a composite foreign key.
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

create index if not exists idx_claims_item_id on public.claims (item_id);
create index if not exists idx_claims_source_report_id on public.claims (source_report_id);
create index if not exists idx_claims_claimant_profile_id on public.claims (claimant_profile_id);
create index if not exists idx_claims_status on public.claims (status);
create index if not exists idx_claims_reviewed_by_profile_id on public.claims (reviewed_by_profile_id);

create unique index if not exists idx_claims_active_unique
on public.claims (item_id, claimant_profile_id)
where status in ('submitted', 'pending_review') and claimant_profile_id is not null;

-- Backfill historical claims with the single-report match when available.
update public.claims c
set source_report_id = sub.source_report_id
from (
  select
    c2.id as claim_id,
    r.id as source_report_id
  from public.claims c2
  join public.reports r
    on r.item_id = c2.item_id
  where c2.source_report_id is null
    and c2.item_id is not null
    and r.item_id = c2.item_id
  group by c2.id, r.id
  having count(*) = 1
) sub
where c.id = sub.claim_id
  and c.source_report_id is null;

-- Leave null for zero or multiple candidate reports.
-- Existing non-null source_report_id values remain unchanged.

-- Verification queries:
-- select id, item_id, source_report_id from public.claims where source_report_id is not null order by created_at;
-- select id, item_id, source_report_id from public.claims where source_report_id is null order by created_at;
-- select c.id, c.item_id, count(r.id) as report_count
-- from public.claims c
-- left join public.reports r on r.item_id = c.item_id
-- group by c.id, c.item_id
-- having count(r.id) = 0;
-- select c.id, c.item_id, count(r.id) as report_count
-- from public.claims c
-- left join public.reports r on r.item_id = c.item_id
-- group by c.id, c.item_id
-- having count(r.id) > 1;
-- select c.id, c.item_id, c.source_report_id, r.item_id as report_item_id
-- from public.claims c
-- left join public.reports r on r.id = c.source_report_id
-- where c.source_report_id is not null and r.item_id is distinct from c.item_id;

create or replace function public.is_claim_submission_eligible(p_item_id uuid, p_source_report_id uuid)
returns boolean
language plpgsql
security definer
set search_path = pg_catalog, public
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

revoke all privileges on table public.claims from anon;
revoke all privileges on table public.claims from authenticated;
grant insert, select on table public.claims to authenticated;

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

-- Verification queries:
-- select column_name, data_type, is_nullable, column_default
-- from information_schema.columns
-- where table_schema = 'public' and table_name = 'claims'
-- order by ordinal_position;
-- select tc.table_name, tc.constraint_name, kcu.column_name, tc.constraint_type
-- from information_schema.table_constraints tc
-- join information_schema.key_column_usage kcu on tc.constraint_name = kcu.constraint_name
-- where tc.table_schema = 'public' and tc.table_name = 'claims';
-- select indexname, indexdef from pg_indexes where schemaname = 'public' and tablename = 'claims';
-- select * from pg_policies where schemaname = 'public' and tablename = 'claims';
-- select grantee, privilege_type from information_schema.role_table_grants where table_schema = 'public' and table_name = 'claims' order by grantee, privilege_type;
-- select proname, prosecdef, pg_get_functiondef(p.oid) as definition
-- from pg_proc p join pg_namespace n on p.pronamespace = n.oid
-- where n.nspname = 'public' and proname = 'is_claim_submission_eligible';
-- select has_function_privilege('authenticated', 'public.is_claim_submission_eligible(uuid, uuid)', 'execute');