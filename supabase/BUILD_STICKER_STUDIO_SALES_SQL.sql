-- SYP Sticker Studio standalone sales tracker
-- Run once in Supabase SQL Editor. Does not read or write POS tables.

create table if not exists public.sticker_studio_sales (
  id uuid primary key,
  order_number text not null,
  business_date date not null default ((now() at time zone 'Asia/Manila')::date),
  customer_name text not null default 'Walk-in',
  items jsonb not null default '[]'::jsonb,
  total_quantity integer not null check (total_quantity > 0),
  total_amount numeric(12,2) not null check (total_amount >= 0),
  created_at timestamptz not null default now()
);

grant select, insert on public.sticker_studio_sales to anon, authenticated;

create index if not exists sticker_studio_sales_business_date_idx
  on public.sticker_studio_sales (business_date, created_at desc);

alter table public.sticker_studio_sales enable row level security;

drop policy if exists "Sticker Studio can read sales" on public.sticker_studio_sales;
create policy "Sticker Studio can read sales"
  on public.sticker_studio_sales for select to anon, authenticated using (true);

drop policy if exists "Sticker Studio can add sales" on public.sticker_studio_sales;
create policy "Sticker Studio can add sales"
  on public.sticker_studio_sales for insert to anon, authenticated with check (
    total_quantity > 0 and total_amount >= 0
  );

create table if not exists public.sticker_studio_daily_counters (
  business_date date primary key,
  last_number integer not null default 0 check (last_number >= 0),
  updated_at timestamptz not null default now()
);

alter table public.sticker_studio_daily_counters enable row level security;

-- The page reads cash_reset_at directly to calculate today's cash total.
-- Allow read-only access to this non-sensitive daily counter row.
grant usage on schema public to anon, authenticated;
grant select on public.sticker_studio_daily_counters to anon, authenticated;
drop policy if exists "Sticker Studio can read daily counters" on public.sticker_studio_daily_counters;
create policy "Sticker Studio can read daily counters"
  on public.sticker_studio_daily_counters for select to anon, authenticated using (true);

-- No direct insert/update/delete access; writes happen only through SECURITY DEFINER RPCs.
revoke insert, update, delete on public.sticker_studio_daily_counters from anon, authenticated;

create or replace function public.syp_sticker_next_order_number()
returns text language plpgsql security definer set search_path = public
as $$
declare
  today date := (now() at time zone 'Asia/Manila')::date;
  next_no integer;
begin
  insert into public.sticker_studio_daily_counters (business_date, last_number)
  values (today, 1)
  on conflict (business_date) do update
    set last_number = sticker_studio_daily_counters.last_number + 1,
        updated_at = now()
  returning last_number into next_no;
  return lpad(next_no::text, 3, '0');
end;
$$;

create or replace function public.syp_sticker_peek_order_number()
returns text language plpgsql security definer set search_path = public
as $$
declare
  today date := (now() at time zone 'Asia/Manila')::date;
  current_no integer;
begin
  select last_number + 1 into current_no
  from public.sticker_studio_daily_counters where business_date = today;
  return lpad(coalesce(current_no, 1)::text, 3, '0');
end;
$$;

create or replace function public.syp_sticker_reset_order_number()
returns text language plpgsql security definer set search_path = public
as $$
declare
  today date := (now() at time zone 'Asia/Manila')::date;
begin
  insert into public.sticker_studio_daily_counters (business_date, last_number)
  values (today, 0)
  on conflict (business_date) do update
    set last_number = 0, updated_at = now();
  return '001';
end;
$$;

revoke all on function public.syp_sticker_next_order_number() from public;
revoke all on function public.syp_sticker_peek_order_number() from public;
revoke all on function public.syp_sticker_reset_order_number() from public;
grant execute on function public.syp_sticker_next_order_number() to anon, authenticated;
grant execute on function public.syp_sticker_peek_order_number() to anon, authenticated;
grant execute on function public.syp_sticker_reset_order_number() to anon, authenticated;


-- Cash reset is separate from order-number reset and never deletes sales.
alter table public.sticker_studio_daily_counters
  add column if not exists cash_reset_at timestamptz;

create or replace function public.syp_sticker_reset_cash()
returns timestamptz language plpgsql security definer set search_path = public
as $$
declare
  today date := (now() at time zone 'Asia/Manila')::date;
  reset_time timestamptz := now();
begin
  insert into public.sticker_studio_daily_counters (business_date, last_number, cash_reset_at)
  values (today, 0, reset_time)
  on conflict (business_date) do update
    set cash_reset_at = reset_time, updated_at = now();
  return reset_time;
end;
$$;

revoke all on function public.syp_sticker_reset_cash() from public;
grant execute on function public.syp_sticker_reset_cash() to anon, authenticated;

notify pgrst, 'reload schema';


-- Manual reset for the displayed orders count.
alter table public.sticker_studio_daily_counters
  add column if not exists orders_reset_at timestamptz;

create or replace function public.syp_sticker_reset_orders()
returns timestamptz language plpgsql security definer set search_path = public
as $$
declare
  today date := (now() at time zone 'Asia/Manila')::date;
  reset_time timestamptz := now();
begin
  insert into public.sticker_studio_daily_counters (business_date, last_number, orders_reset_at)
  values (today, 0, reset_time)
  on conflict (business_date) do update
    set orders_reset_at = reset_time, updated_at = now();
  return reset_time;
end;
$$;

revoke all on function public.syp_sticker_reset_orders() from public;
grant execute on function public.syp_sticker_reset_orders() to anon, authenticated;


-- MANUAL CASH-DRAWER MODE (no automatic day rollover).
-- A fixed counter key keeps the order sequence and manual reset timestamps
-- continuous across days and months. Sales rows retain their real business_date.
insert into public.sticker_studio_daily_counters
  (business_date, last_number, cash_reset_at, orders_reset_at)
select
  date '2000-01-01',
  0,
  max(cash_reset_at),
  max(orders_reset_at)
from public.sticker_studio_daily_counters
on conflict (business_date) do update
set cash_reset_at = coalesce(public.sticker_studio_daily_counters.cash_reset_at, excluded.cash_reset_at),
    orders_reset_at = coalesce(public.sticker_studio_daily_counters.orders_reset_at, excluded.orders_reset_at);

create or replace function public.syp_sticker_next_order_number()
returns text language plpgsql security definer set search_path = public
as $$
declare
  next_no integer;
begin
  insert into public.sticker_studio_daily_counters (business_date, last_number)
  values (date '2000-01-01', 1)
  on conflict (business_date) do update
    set last_number = sticker_studio_daily_counters.last_number + 1,
        updated_at = now()
  returning last_number into next_no;
  return lpad(next_no::text, 3, '0');
end;
$$;

create or replace function public.syp_sticker_peek_order_number()
returns text language plpgsql security definer set search_path = public
as $$
declare
  current_no integer;
begin
  select last_number + 1 into current_no
  from public.sticker_studio_daily_counters
  where business_date = date '2000-01-01';
  return lpad(coalesce(current_no, 1)::text, 3, '0');
end;
$$;

create or replace function public.syp_sticker_reset_order_number()
returns text language plpgsql security definer set search_path = public
as $$
begin
  insert into public.sticker_studio_daily_counters (business_date, last_number)
  values (date '2000-01-01', 0)
  on conflict (business_date) do update
    set last_number = 0, updated_at = now();
  return '001';
end;
$$;

create or replace function public.syp_sticker_reset_orders()
returns timestamptz language plpgsql security definer set search_path = public
as $$
declare
  reset_time timestamptz := now();
begin
  insert into public.sticker_studio_daily_counters (business_date, last_number, orders_reset_at)
  values (date '2000-01-01', 0, reset_time)
  on conflict (business_date) do update
    set orders_reset_at = reset_time, updated_at = now();
  return reset_time;
end;
$$;

create or replace function public.syp_sticker_reset_cash()
returns timestamptz language plpgsql security definer set search_path = public
as $$
declare
  reset_time timestamptz := now();
begin
  insert into public.sticker_studio_daily_counters (business_date, last_number, cash_reset_at)
  values (date '2000-01-01', 0, reset_time)
  on conflict (business_date) do update
    set cash_reset_at = reset_time, updated_at = now();
  return reset_time;
end;
$$;

revoke all on function public.syp_sticker_next_order_number() from public;
revoke all on function public.syp_sticker_peek_order_number() from public;
revoke all on function public.syp_sticker_reset_order_number() from public;
revoke all on function public.syp_sticker_reset_orders() from public;
revoke all on function public.syp_sticker_reset_cash() from public;
grant execute on function public.syp_sticker_next_order_number() to anon, authenticated;
grant execute on function public.syp_sticker_peek_order_number() to anon, authenticated;
grant execute on function public.syp_sticker_reset_order_number() to anon, authenticated;
grant execute on function public.syp_sticker_reset_orders() to anon, authenticated;
grant execute on function public.syp_sticker_reset_cash() to anon, authenticated;

notify pgrst, 'reload schema';


-- PAID / UNPAID checkout tracking for Sticker Studio.
-- Existing historical sales are treated as paid; new orders receive explicit status.
alter table public.sticker_studio_sales
  add column if not exists payment_status text not null default 'paid'
    check (payment_status in ('paid','unpaid')),
  add column if not exists amount_paid numeric(12,2) not null default 0
    check (amount_paid >= 0),
  add column if not exists payment_method text not null default 'Cash',
  add column if not exists paid_at timestamptz;

update public.sticker_studio_sales
set amount_paid = total_amount
where payment_status = 'paid' and amount_paid = 0;

grant update on public.sticker_studio_sales to anon, authenticated;
drop policy if exists "Sticker Studio can update unpaid sales" on public.sticker_studio_sales;
create policy "Sticker Studio can update unpaid sales"
  on public.sticker_studio_sales for update to anon, authenticated
  using (payment_status = 'unpaid')
  with check (payment_status in ('paid','unpaid'));

notify pgrst, 'reload schema';


-- Persist complete checkout breakdown for Sticker Studio sales.
alter table public.sticker_studio_sales
  add column if not exists subtotal_amount numeric(12,2) not null default 0 check (subtotal_amount >= 0),
  add column if not exists additional_charges jsonb not null default '[]'::jsonb,
  add column if not exists discount_amount numeric(12,2) not null default 0 check (discount_amount >= 0),
  add column if not exists cash_received numeric(12,2) not null default 0 check (cash_received >= 0),
  add column if not exists change_amount numeric(12,2) not null default 0 check (change_amount >= 0);

-- Backfill old rows without changing their recorded totals or payment status.
update public.sticker_studio_sales
set subtotal_amount = total_amount
where subtotal_amount = 0 and total_amount > 0;

grant select, insert, update on public.sticker_studio_sales to anon, authenticated;
notify pgrst, 'reload schema';
