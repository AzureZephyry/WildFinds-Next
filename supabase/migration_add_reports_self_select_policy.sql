-- Allow authenticated users to read only report rows owned by their profile.
-- profiles.id uses the same UUID as auth.users.id.
drop policy if exists "Authenticated users can read own reports"
on public.reports;

create policy "Authenticated users can read own reports"
on public.reports
for select
to authenticated
using (
  profile_id = (select auth.uid())
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
