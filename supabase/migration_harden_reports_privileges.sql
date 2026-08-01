-- Remove all browser-role privileges from reports before restoring
-- only the operations required by the application.
revoke all privileges on table public.reports from anon;
revoke all privileges on table public.reports from authenticated;

-- Logged-in users may create and read report records.
-- RLS policies still restrict ownership at the row level.
grant insert, select on table public.reports to authenticated;

-- Verify report table privileges:
-- select
--   grantee,
--   privilege_type
-- from information_schema.role_table_grants
-- where table_schema = 'public'
--   and table_name = 'reports'
--   and grantee in ('anon', 'authenticated')
-- order by grantee, privilege_type;

-- Verify RLS policies:
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
