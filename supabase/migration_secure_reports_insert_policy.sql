-- Remove the legacy unrestricted report INSERT policy.
drop policy if exists "Allow public insert access to reports"
on public.reports;

-- Synchronize the secure authenticated-only report INSERT policy.
drop policy if exists "Authenticated users can insert reports"
on public.reports;

create policy "Authenticated users can insert reports"
on public.reports
for insert
to authenticated
with check (
  profile_id is not null
  and profile_id = (select auth.uid())
);

-- Verify the reports policies after applying this migration:
-- select
--   policyname,
--   roles,
--   cmd,
--   qual,
--   with_check
-- from pg_policies
-- where schemaname = 'public'
--   and tablename = 'reports'
-- order by cmd, policyname;

-- Verify report table privileges after applying this migration:
-- select
--   grantee,
--   privilege_type
-- from information_schema.role_table_grants
-- where table_schema = 'public'
--   and table_name = 'reports'
--   and grantee in ('anon', 'authenticated')
-- order by grantee, privilege_type;
