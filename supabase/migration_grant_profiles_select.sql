-- Allow authenticated users to query profiles.
-- RLS policies still determine which profile rows each user may access.
grant select on table public.profiles to authenticated;

-- Verify the resulting table privileges after applying this migration:
-- select
--   grantee,
--   privilege_type
-- from information_schema.role_table_grants
-- where table_schema = 'public'
--   and table_name = 'profiles'
--   and grantee in ('anon', 'authenticated')
-- order by grantee, privilege_type;

-- Verify that the authenticated user can have a profile row linked to Auth:
-- select
--   id,
--   role,
--   created_at
-- from public.profiles
-- where id = '0c176f4d-0a1c-4350-99a3-112c94f8bb39';
