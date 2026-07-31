-- RLS policies determine which item rows are visible, while these grants
-- allow Supabase anon and authenticated clients to issue SELECT queries.
grant select on table public.items to anon, authenticated;

-- ReportForm requires an authenticated profile before inserting an item, and
-- the items INSERT policy is restricted to the authenticated role.
grant insert on table public.items to authenticated;

-- Verify the resulting table privileges after applying this migration:
-- select
--   grantee,
--   privilege_type
-- from information_schema.role_table_grants
-- where table_schema = 'public'
--   and table_name = 'items'
--   and grantee in ('anon', 'authenticated')
-- order by grantee, privilege_type;