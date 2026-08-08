-- Create a DB RPC to atomically generate a claim reference and insert the claim

create or replace function public.create_claim(
  p_item_id uuid,
  p_source_report_id uuid,
  p_claimant_name text,
  p_contact_info text,
  p_details text
)
returns table (id uuid, reference_number text, status text, created_at timestamptz)
language plpgsql
security definer
set search_path = public
as $$
declare
  current_user_id uuid := auth.uid();
  generated_ref text;
  inserted_id uuid;
  inserted_status text;
  inserted_created timestamptz;
begin
  if current_user_id is null then
    raise exception 'Authentication required' using errcode = '28000';
  end if;

  -- Ensure caller is eligible to submit claim
  if not public.is_claim_submission_eligible(p_item_id, p_source_report_id) then
    raise exception 'Not eligible to submit claim' using errcode = 'P0001';
  end if;

  loop
    generated_ref := public.generate_claim_reference_number(current_date);

    begin
      insert into public.claims (
        reference_number,
        item_id,
        source_report_id,
        claimant_profile_id,
        claimant_name,
        contact_info,
        details,
        status
      ) values (
        generated_ref,
        p_item_id,
        p_source_report_id,
        current_user_id,
        p_claimant_name,
        p_contact_info,
        nullif(trim(p_details), ''),
        'submitted'
      ) returning id, reference_number, status, created_at into inserted_id, generated_ref, inserted_status, inserted_created;

      id := inserted_id;
      reference_number := generated_ref;
      status := inserted_status;
      created_at := inserted_created;
      return next;
    exception when unique_violation then
      -- try again with a new generated reference
      null; -- continue loop
    end;
  end loop;
end;
$$;

grant execute on function public.create_claim(uuid, uuid, text, text, text) to authenticated;
