-- Secure report verification storage and profile role hardening.
-- This migration is intentionally idempotent where practical.

alter table public.reports
  add column if not exists verification_details text;

-- Backfill existing report verification details from item-level identifying marks.
-- Only rows with exactly one related report and a currently null verification_details
-- are backfilled. Existing non-null verification values are preserved.
do $$
begin
  update public.reports r
  set verification_details = i.identifying_marks
  from public.items i
  where r.verification_details is null
    and r.item_id = i.id
    and i.identifying_marks is not null
    and (
      select count(*)
      from public.reports r2
      where r2.item_id = i.id
    ) = 1;
end
$$;

-- Verification queries (commented):
-- select i.id, i.reference_number, i.identifying_marks
-- from public.items i
-- left join public.reports r on r.item_id = i.id
-- where i.identifying_marks is not null
-- group by i.id, i.reference_number, i.identifying_marks
-- having count(r.id) = 0;
--
-- select i.id, i.reference_number, i.identifying_marks, count(r.id) as report_count
-- from public.items i
-- left join public.reports r on r.item_id = i.id
-- where i.identifying_marks is not null
-- group by i.id, i.reference_number, i.identifying_marks
-- having count(r.id) > 1;
--
-- select id, item_id, verification_details
-- from public.reports
-- where verification_details is not null
-- order by submitted_at;
--
-- select id, item_id, verification_details
-- from public.reports
-- where verification_details is null
-- order by submitted_at;

-- Harden profile updates so ordinary users can only update self-service profile fields.
-- Allowed self-update columns: full_name.
-- Protected system-controlled columns remain immutable through browser access:
-- id, role, created_at.
revoke all privileges on table public.profiles from anon;
revoke all privileges on table public.profiles from authenticated;
grant select on table public.profiles to authenticated;
grant update (full_name) on table public.profiles to authenticated;

-- Keep private report access restricted to authenticated users and their own reports.
-- The report verification field is private and should not be exposed to anon.
revoke all privileges on table public.reports from anon;
revoke all privileges on table public.reports from authenticated;
grant insert, select on table public.reports to authenticated;

-- Restrict public item access to the intended public columns only.
-- The old broad table-level SELECT grant is removed so the public item columns
-- are no longer reachable through a blanket select.
revoke insert on table public.items from anon;
revoke select on table public.items from anon;
revoke insert on table public.items from authenticated;
revoke select on table public.items from authenticated;
grant select (id, reference_number, type, name, category, description, brand, color, building, location, date_reported, time_reported, image_url, status, created_at, updated_at, resolved_at) on table public.items to anon, authenticated;
grant insert on table public.items to authenticated;

-- Restrict public item insertion to authenticated users and require submitted items.
drop policy if exists "Allow public insert access to items" on public.items;

create policy "Authenticated users can insert submitted items"
on public.items
for insert
to authenticated
with check (status = 'submitted');

-- Preserve the existing public-item RLS policies that govern visibility of
-- submitted/active/matched rows. The item-level select grants above are the
-- repository-defined privacy boundary for the public item columns.
