-- Allow authenticated users to create report ownership records.
-- RLS policies still determine which report rows may be inserted.
grant insert on table public.reports to authenticated;

-- Verify the resulting table privileges after applying this migration:
-- select
--   grantee,
--   privilege_type
-- from information_schema.role_table_grants
-- where table_schema = 'public'
--   and table_name = 'reports'
--   and grantee in ('anon', 'authenticated')
-- order by grantee, privilege_type;
