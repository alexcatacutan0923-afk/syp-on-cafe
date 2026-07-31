-- BUILD 25: temporary default PIN for imported members + secure self-service PIN change
-- Existing imported accounts can log in with 1234, then change it from the dashboard.
update public.loyalty_members
set pin = '1234', updated_at = now()
where member_code ~ '^SYP[0-9]+$';

create or replace function public.change_loyalty_member_pin(
  p_member_code text,
  p_current_pin text,
  p_new_pin text
) returns boolean
language plpgsql
security definer
set search_path = public
as $$
begin
  if p_new_pin !~ '^[0-9]{4,6}$' then
    raise exception 'New PIN must contain 4 to 6 digits';
  end if;

  update public.loyalty_members
  set pin = p_new_pin, updated_at = now()
  where member_code = upper(trim(p_member_code))
    and pin = p_current_pin;

  if not found then
    raise exception 'Current PIN is incorrect';
  end if;

  return true;
end;
$$;

grant execute on function public.change_loyalty_member_pin(text,text,text) to anon, authenticated;
notify pgrst, 'reload schema';
