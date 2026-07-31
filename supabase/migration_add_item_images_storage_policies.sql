-- Allow authenticated users to upload only to the existing item-images bucket.
drop policy if exists "Authenticated users can upload item images"
on storage.objects;

create policy "Authenticated users can upload item images"
on storage.objects
for insert
to authenticated
with check (
  bucket_id = 'item-images'
);

-- Allow authenticated users to read metadata for their own uploaded objects.
-- Storage owner_id is stored as text, so compare it with auth.uid()::text.
drop policy if exists "Authenticated users can read own item image objects"
on storage.objects;

create policy "Authenticated users can read own item image objects"
on storage.objects
for select
to authenticated
using (
  bucket_id = 'item-images'
  and owner_id = (select auth.uid()::text)
);

-- Verify the policies after applying this migration:
-- select
--   policyname,
--   roles,
--   cmd,
--   qual,
--   with_check
-- from pg_policies
-- where schemaname = 'storage'
--   and tablename = 'objects'
--   and (
--     policyname = 'Authenticated users can upload item images'
--     or policyname = 'Authenticated users can read own item image objects'
--   )
-- order by cmd, policyname;
