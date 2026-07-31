-- Allow authenticated users to query report records.
-- RLS restricts users to their own reports.
grant select on table public.reports to authenticated;

-- Allow users to read items linked to their own reports, including resolved
-- items that are no longer publicly visible.
drop policy if exists "Authenticated users can read own reported items"
on public.items;

create policy "Authenticated users can read own reported items"
on public.items
for select
to authenticated
using (
	exists (
		select 1
		from public.reports r
		where r.item_id = public.items.id
			and r.profile_id = (select auth.uid())
	)
);

-- Verify the resulting table privilege after applying this migration:
-- select
--   table_name,
--   grantee,
--   privilege_type
-- from information_schema.role_table_grants
-- where table_schema = 'public'
--   and table_name in ('reports', 'items', 'profiles')
--   and grantee in ('anon', 'authenticated')
-- order by table_name, grantee, privilege_type;

-- Verify the own-item policy after applying this migration:
-- select
--   tablename,
--   policyname,
--   roles,
--   cmd,
--   qual,
--   with_check
-- from pg_policies
-- where schemaname = 'public'
--   and tablename in ('reports', 'items', 'profiles')
-- order by tablename, cmd, policyname;
