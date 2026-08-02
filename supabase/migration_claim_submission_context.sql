-- Claim submission context foundation
-- Returns a privacy-safe Claim submission context for the future Claim screen.

create or replace function public.get_claim_submission_context(p_item_id uuid)
returns table (
  item_id uuid,
  source_report_id uuid,
  reference_number text,
  item_type text,
  item_status text,
  item_name text,
  category text,
  brand text,
  color text,
  building text,
  location text,
  date_reported date,
  image_url text,
  has_active_claim boolean,
  is_eligible boolean,
  unavailable_reason text
)
language plpgsql
security definer
set search_path = pg_catalog, public
as $$
declare
  current_user_id uuid;
  item_record record;
  source_report_id uuid;
  source_report_profile_id uuid;
  report_count integer;
  has_duplicate_claim boolean;
begin
  current_user_id := auth.uid();

  if p_item_id is null then
    return query
      select
        null::uuid,
        null::uuid,
        null::text,
        null::text,
        null::text,
        null::text,
        null::text,
        null::text,
        null::text,
        null::text,
        null::text,
        null::date,
        null::text,
        false,
        false,
        'invalid_item_id';
    return;
  end if;

  if current_user_id is null then
    return;
  end if;

  if not exists (
    select 1
    from public.profiles p
    where p.id = current_user_id
  ) then
    return;
  end if;

  select i.id, i.reference_number, i.type, i.status, i.name, i.category, i.brand, i.color, i.building, i.location, i.date_reported, i.image_url
  into item_record
  from public.items i
  where i.id = p_item_id;

  if not found then
    return query
      select
        p_item_id,
        null::uuid,
        null::text,
        null::text,
        null::text,
        null::text,
        null::text,
        null::text,
        null::text,
        null::text,
        null::text,
        null::date,
        null::text,
        false,
        false,
        'item_not_found';
    return;
  end if;

  if item_record.type = 'lost' then
    return query
      select
        item_record.id,
        null::uuid,
        item_record.reference_number,
        item_record.type,
        item_record.status,
        item_record.name,
        item_record.category,
        item_record.brand,
        item_record.color,
        item_record.building,
        item_record.location,
        item_record.date_reported,
        item_record.image_url,
        false,
        false,
        'lost_item';
    return;
  end if;

  if item_record.status not in ('submitted', 'active') then
    return query
      select
        item_record.id,
        null::uuid,
        item_record.reference_number,
        item_record.type,
        item_record.status,
        item_record.name,
        item_record.category,
        item_record.brand,
        item_record.color,
        item_record.building,
        item_record.location,
        item_record.date_reported,
        item_record.image_url,
        false,
        false,
        'terminal_status';
    return;
  end if;

  select count(*)
  into report_count
  from public.reports r
  where r.item_id = p_item_id;

  if report_count = 0 then
    return query
      select
        item_record.id,
        null::uuid,
        item_record.reference_number,
        item_record.type,
        item_record.status,
        item_record.name,
        item_record.category,
        item_record.brand,
        item_record.color,
        item_record.building,
        item_record.location,
        item_record.date_reported,
        item_record.image_url,
        false,
        false,
        'missing_source_report';
    return;
  end if;

  if report_count > 1 then
    return query
      select
        item_record.id,
        null::uuid,
        item_record.reference_number,
        item_record.type,
        item_record.status,
        item_record.name,
        item_record.category,
        item_record.brand,
        item_record.color,
        item_record.building,
        item_record.location,
        item_record.date_reported,
        item_record.image_url,
        false,
        false,
        'ambiguous_source_report';
    return;
  end if;

  select r.id
  into source_report_id
  from public.reports r
  where r.item_id = p_item_id;

  select r.profile_id
  into source_report_profile_id
  from public.reports r
  where r.id = source_report_id;

  if source_report_profile_id is null then
    return query
      select
        item_record.id,
        source_report_id,
        item_record.reference_number,
        item_record.type,
        item_record.status,
        item_record.name,
        item_record.category,
        item_record.brand,
        item_record.color,
        item_record.building,
        item_record.location,
        item_record.date_reported,
        item_record.image_url,
        false,
        false,
        'invalid_source_report';
    return;
  end if;

  if exists (
    select 1
    from public.reports r
    where r.id = source_report_id
      and r.profile_id = current_user_id
  ) then
    return query
      select
        item_record.id,
        source_report_id,
        item_record.reference_number,
        item_record.type,
        item_record.status,
        item_record.name,
        item_record.category,
        item_record.brand,
        item_record.color,
        item_record.building,
        item_record.location,
        item_record.date_reported,
        item_record.image_url,
        false,
        false,
        'own_report';
    return;
  end if;

  select exists (
    select 1
    from public.claims c
    where c.item_id = p_item_id
      and c.claimant_profile_id = current_user_id
      and c.status in ('submitted', 'pending_review')
  )
  into has_duplicate_claim;

  if has_duplicate_claim then
    return query
      select
        item_record.id,
        source_report_id,
        item_record.reference_number,
        item_record.type,
        item_record.status,
        item_record.name,
        item_record.category,
        item_record.brand,
        item_record.color,
        item_record.building,
        item_record.location,
        item_record.date_reported,
        item_record.image_url,
        true,
        false,
        'duplicate_active_claim';
    return;
  end if;

  if public.is_claim_submission_eligible(p_item_id, source_report_id) then
    return query
      select
        item_record.id,
        source_report_id,
        item_record.reference_number,
        item_record.type,
        item_record.status,
        item_record.name,
        item_record.category,
        item_record.brand,
        item_record.color,
        item_record.building,
        item_record.location,
        item_record.date_reported,
        item_record.image_url,
        false,
        true,
        null::text;
    return;
  end if;

  return query
    select
      item_record.id,
      source_report_id,
      item_record.reference_number,
      item_record.type,
      item_record.status,
      item_record.name,
      item_record.category,
      item_record.brand,
      item_record.color,
      item_record.building,
      item_record.location,
      item_record.date_reported,
      item_record.image_url,
      false,
      false,
      'invalid_source_report';
end;
$$;

revoke all on function public.get_claim_submission_context(uuid) from public;
revoke all on function public.get_claim_submission_context(uuid) from anon;
grant execute on function public.get_claim_submission_context(uuid) to authenticated;

-- Verification queries:
-- select proname, pg_get_functiondef(p.oid) as definition
-- from pg_proc p join pg_namespace n on p.pronamespace = n.oid
-- where n.nspname = 'public' and proname = 'get_claim_submission_context';
-- select * from information_schema.routine_privileges
-- where routine_schema = 'public' and routine_name = 'get_claim_submission_context';
-- select * from public.get_claim_submission_context('00000000-0000-0000-0000-000000000000'::uuid);
-- select * from public.get_claim_submission_context((select id from public.items where type = 'found' and status = 'submitted' limit 1));
-- select * from public.get_claim_submission_context((select id from public.items where type = 'lost' limit 1));
-- select * from public.get_claim_submission_context((select id from public.items where status in ('matched','claimed','closed') limit 1));
-- select * from public.get_claim_submission_context((select id from public.items where id not in (select item_id from public.reports) limit 1));
-- select * from public.get_claim_submission_context((select id from public.items where id in (select item_id from public.reports group by item_id having count(*) > 1) limit 1));
