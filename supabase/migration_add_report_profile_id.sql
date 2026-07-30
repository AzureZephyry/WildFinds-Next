-- Safe migration for existing Supabase databases
-- Adds profile_id to public.reports and links it to public.profiles.

alter table public.reports
  add column if not exists profile_id uuid;

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conrelid = 'public.reports'::regclass
      and conname = 'reports_profile_id_fkey'
      and contype = 'f'
  ) then
    alter table public.reports
      add constraint reports_profile_id_fkey
      foreign key (profile_id) references public.profiles (id) on delete set null;
  end if;
end
$$;

create index if not exists idx_reports_profile_id on public.reports (profile_id);
