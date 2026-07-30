-- SYP ON CAFÉ Build 11: Rider Operations compatibility migration
-- Safe to run more than once in Supabase SQL Editor.

alter table public.orders add column if not exists rider_name text;
alter table public.orders add column if not exists rider_mobile text;
alter table public.orders add column if not exists rider_vehicle text;
alter table public.orders add column if not exists rider_eta text;
alter table public.orders add column if not exists rider_status text default 'waiting';
alter table public.orders add column if not exists accepted_by_rider_at timestamptz;
alter table public.orders add column if not exists out_for_delivery_at timestamptz;
alter table public.orders add column if not exists delivered_at timestamptz;

create index if not exists orders_rider_status_idx on public.orders (rider_status);
create index if not exists orders_order_type_status_idx on public.orders (order_type, status);
