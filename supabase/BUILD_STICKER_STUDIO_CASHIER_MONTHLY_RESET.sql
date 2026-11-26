-- Sticker Studio cashier attribution + monthly sales reset
-- Run once in Supabase SQL Editor. Existing order history is preserved.
alter table public.sticker_studio_sales
  add column if not exists cashier_name text;

alter table public.sticker_studio_daily_counters
  add column if not exists monthly_reset_at timestamptz;

create or replace function public.syp_sticker_reset_monthly_sales()
returns timestamptz
language plpgsql
security definer
set search_path = public
as $$
declare
  reset_time timestamptz := now();
begin
  insert into public.sticker_studio_daily_counters
    (business_date, last_number, monthly_reset_at)
  values
    (date '2000-01-01', 0, reset_time)
  on conflict (business_date) do update
    set monthly_reset_at = reset_time,
        updated_at = now();
  return reset_time;
end;
$$;

revoke all on function public.syp_sticker_reset_monthly_sales() from public;
grant execute on function public.syp_sticker_reset_monthly_sales() to anon, authenticated;

notify pgrst, 'reload schema';
