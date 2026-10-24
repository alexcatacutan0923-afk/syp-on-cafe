-- BUILD 26: SYP ON CAFE unique delivery pin links
-- Run this SQL in Supabase Dashboard > SQL Editor before deploying the app.

create extension if not exists pgcrypto;

create table if not exists public.delivery_pin_links (
  id uuid primary key default gen_random_uuid(),
  token text not null unique default encode(gen_random_bytes(24), 'hex'),
  customer_name text not null,
  phone text not null,
  customer_mobile text,
  order_ref text,
  address_text text,
  landmark text,
  latitude double precision,
  longitude double precision,
  status text not null default 'awaiting_pin'
    check (status in ('awaiting_pin', 'pin_saved')),
  created_at timestamptz not null default now(),
  updated_at timestamptz,
  constraint delivery_pin_coordinates_pair check (
    (latitude is null and longitude is null)
    or (latitude between -90 and 90 and longitude between -180 and 180)
  )
);

alter table public.delivery_pin_links add column if not exists customer_mobile text;

create index if not exists delivery_pin_links_created_at_idx
  on public.delivery_pin_links (created_at desc);
create index if not exists delivery_pin_links_token_idx
  on public.delivery_pin_links (token);

alter table public.delivery_pin_links enable row level security;
revoke all on public.delivery_pin_links from anon, authenticated;

-- Admin functions require a logged-in Supabase user (the existing ProtectedRoute
-- uses Supabase Auth). The browser cannot read the table directly.
drop function if exists public.admin_list_delivery_pins();
create or replace function public.admin_list_delivery_pins()
returns table (
  id uuid, token text, customer_name text, phone text, customer_mobile text, order_ref text,
  address_text text, landmark text, latitude double precision,
  longitude double precision, status text, created_at timestamptz, updated_at timestamptz
)
language plpgsql
security definer
set search_path = public, pg_temp
as $$
begin
  if auth.uid() is null then
    raise exception 'Authentication required';
  end if;
  return query
    select d.id, d.token, d.customer_name, d.phone, d.customer_mobile, d.order_ref,
      d.address_text, d.landmark, d.latitude, d.longitude, d.status,
      d.created_at, d.updated_at
    from public.delivery_pin_links d
    order by d.created_at desc
    limit 500;
end;
$$;

create or replace function public.admin_create_delivery_pin(
  p_customer_name text,
  p_phone text,
  p_order_ref text default null,
  p_landmark text default null
)
returns table (
  id uuid, token text, customer_name text, phone text, order_ref text,
  address_text text, landmark text, latitude double precision,
  longitude double precision, status text, created_at timestamptz, updated_at timestamptz
)
language plpgsql
security definer
set search_path = public, pg_temp
as $$
begin
  if auth.uid() is null then
    raise exception 'Authentication required';
  end if;
  if length(trim(coalesce(p_customer_name, ''))) not between 1 and 120 then
    raise exception 'Customer name is required (max 120 characters)';
  end if;
  if length(trim(coalesce(p_phone, ''))) not between 7 and 30 then
    raise exception 'A valid contact number is required';
  end if;
  return query
    insert into public.delivery_pin_links(customer_name, phone, order_ref, landmark)
    values (
      trim(p_customer_name),
      trim(p_phone),
      nullif(left(trim(coalesce(p_order_ref, '')), 100), ''),
      nullif(left(trim(coalesce(p_landmark, '')), 300), '')
    )
    returning delivery_pin_links.id, delivery_pin_links.token,
      delivery_pin_links.customer_name, delivery_pin_links.phone,
      delivery_pin_links.order_ref, delivery_pin_links.address_text,
      delivery_pin_links.landmark, delivery_pin_links.latitude,
      delivery_pin_links.longitude, delivery_pin_links.status,
      delivery_pin_links.created_at, delivery_pin_links.updated_at;
end;
$$;

-- Public customer links can only retrieve/update the row matching their unguessable token.
drop function if exists public.get_delivery_pin(text);
create or replace function public.get_delivery_pin(p_token text)
returns table (
  customer_name text, customer_mobile text, order_ref text, address_text text, landmark text,
  latitude double precision, longitude double precision, status text
)
language sql
security definer
set search_path = public, pg_temp
as $$
  select d.customer_name, d.customer_mobile, d.order_ref, d.address_text, d.landmark,
    d.latitude, d.longitude, d.status
  from public.delivery_pin_links d
  where d.token = p_token and length(p_token) = 48
  limit 1;
$$;

drop function if exists public.save_delivery_pin(text, double precision, double precision, text, text);
create or replace function public.save_delivery_pin(
  p_token text,
  p_latitude double precision,
  p_longitude double precision,
  p_address_text text default null,
  p_landmark text default null,
  p_customer_mobile text default null
)
returns table (
  customer_name text, customer_mobile text, order_ref text, address_text text, landmark text,
  latitude double precision, longitude double precision, status text
)
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_pin public.delivery_pin_links%rowtype;
  v_notes text;
begin
  if length(coalesce(p_token, '')) <> 48 or p_token !~ '^[a-f0-9]{48}$' then
    raise exception 'Invalid delivery link';
  end if;
  if p_latitude is null or p_longitude is null
     or p_latitude < -90 or p_latitude > 90
     or p_longitude < -180 or p_longitude > 180 then
    raise exception 'Please choose a valid location on the map';
  end if;

  update public.delivery_pin_links d
  set latitude = p_latitude,
      longitude = p_longitude,
      address_text = nullif(left(trim(coalesce(p_address_text, '')), 500), ''),
      landmark = nullif(left(trim(coalesce(p_landmark, '')), 500), ''),
      customer_mobile = nullif(left(trim(coalesce(p_customer_mobile, '')), 30), ''),
      status = 'pin_saved',
      updated_at = now()
  where d.token = p_token
  returning d.* into v_pin;

  if not found then
    raise exception 'Delivery link not found';
  end if;

  -- If staff entered an existing POS order number when creating the link,
  -- sync the customer's saved delivery details back to that delivery order.
  if nullif(trim(coalesce(v_pin.order_ref, '')), '') is not null then
    update public.orders o
    set address = coalesce(v_pin.address_text, o.address),
        landmark = coalesce(v_pin.landmark, o.landmark),
        notes = concat_ws(E'\n',
          nullif(trim(regexp_replace(
            regexp_replace(coalesce(o.notes, ''), E'\\[DELIVERY PIN: [^\\]]+\\]', '', 'g'),
            E'\\[MAP: https://www\\.google\\.com/maps\\?q=[^\\]]+\\]', '', 'g'
          )), ''),
          format('[DELIVERY PIN: %s, %s]', v_pin.latitude, v_pin.longitude),
          format('[MAP: https://www.google.com/maps?q=%s,%s]', v_pin.latitude, v_pin.longitude)
        )
    where o.order_number::text = trim(v_pin.order_ref)
      and o.order_type = 'delivery';
  end if;

  return query
    select v_pin.customer_name, v_pin.customer_mobile, v_pin.order_ref, v_pin.address_text,
      v_pin.landmark, v_pin.latitude, v_pin.longitude, v_pin.status;
end;
$$;

revoke all on function public.admin_list_delivery_pins() from public, anon;
revoke all on function public.admin_create_delivery_pin(text, text, text, text) from public, anon;
revoke all on function public.get_delivery_pin(text) from public;
revoke all on function public.save_delivery_pin(text, double precision, double precision, text, text, text) from public;

grant execute on function public.admin_list_delivery_pins() to authenticated;
grant execute on function public.admin_create_delivery_pin(text, text, text, text) to authenticated;
grant execute on function public.get_delivery_pin(text) to anon, authenticated;
grant execute on function public.save_delivery_pin(text, double precision, double precision, text, text, text) to anon, authenticated;
