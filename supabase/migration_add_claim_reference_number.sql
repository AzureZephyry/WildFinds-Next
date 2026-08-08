-- Add claim reference number and generator

alter table public.claims
  add column if not exists reference_number text;

create unique index if not exists idx_claims_reference_number_uq on public.claims (reference_number) where reference_number is not null;

create or replace function public.generate_claim_reference_number(reference_date date)
returns text
language plpgsql
security definer
set search_path = public
as $$
declare
  date_part text;
  pattern text;
  next_number integer;
begin
  if reference_date is null then
    raise exception 'Reference date is required' using errcode = '22023';
  end if;

  date_part := to_char(reference_date, 'YYYYMMDD');
  pattern := 'CL' || date_part || '-%';

  perform pg_advisory_xact_lock(hashtext('wildfinds:claim:' || date_part));

  select coalesce(max(cast(substring(reference_number from '[0-9]+$') as integer)), 0) + 1
  into next_number
  from public.claims
  where reference_number like pattern;

  return 'CL' || date_part || '-' || lpad(next_number::text, 4, '0');
end;
$$;

grant execute on function public.generate_claim_reference_number(date) to authenticated;
