-- BUILD 21: Auto member creation + instant POS member directory/search/stamping
create extension if not exists pgcrypto;

create table if not exists public.loyalty_members (
  id uuid primary key default gen_random_uuid(),
  member_code text unique not null,
  name text not null,
  mobile text unique not null,
  birthday date,
  pin text not null,
  stamps integer not null default 0 check (stamps >= 0),
  total_visits integer not null default 0 check (total_visits >= 0),
  favorite_drink text not null default 'Not selected',
  joined_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create sequence if not exists public.loyalty_member_number_seq start 1;

create or replace function public.register_loyalty_member(
  p_name text,
  p_mobile text,
  p_birthday date,
  p_pin text
) returns public.loyalty_members
language plpgsql security definer set search_path = public
as $$
declare
  v_mobile text := regexp_replace(coalesce(p_mobile,''), '\\D', '', 'g');
  v_member public.loyalty_members;
  v_code text;
begin
  if length(trim(coalesce(p_name,''))) < 2 then raise exception 'Name is required'; end if;
  if length(v_mobile) < 10 then raise exception 'Valid mobile number is required'; end if;
  if length(coalesce(p_pin,'')) < 4 then raise exception 'PIN must be at least 4 digits'; end if;

  select * into v_member from public.loyalty_members where mobile = v_mobile;
  if found then return v_member; end if;

  v_code := 'SYP' || lpad(nextval('public.loyalty_member_number_seq')::text, 4, '0');
  insert into public.loyalty_members(member_code,name,mobile,birthday,pin)
  values (v_code, trim(p_name), v_mobile, p_birthday, p_pin)
  returning * into v_member;
  return v_member;
end;
$$;

create or replace function public.search_loyalty_members(p_query text)
returns setof public.loyalty_members
language sql security definer set search_path = public
as $$
  select * from public.loyalty_members
  where trim(coalesce(p_query,'')) <> ''
    and (
      member_code ilike '%' || trim(p_query) || '%'
      or name ilike '%' || trim(p_query) || '%'
      or mobile like '%' || regexp_replace(p_query, '\\D', '', 'g') || '%'
    )
  order by name
  limit 8;
$$;


create or replace function public.list_loyalty_members(p_limit integer default 20)
returns setof public.loyalty_members
language sql security definer set search_path = public
as $$
  select * from public.loyalty_members
  order by updated_at desc nulls last, joined_at desc, name asc
  limit least(greatest(coalesce(p_limit, 20), 1), 100);
$$;

create or replace function public.login_loyalty_member(p_identity text, p_pin text)
returns setof public.loyalty_members
language sql security definer set search_path = public
as $$
  select * from public.loyalty_members
  where (lower(member_code) = lower(trim(p_identity))
      or mobile = regexp_replace(p_identity, '\\D', '', 'g'))
    and pin = p_pin
  limit 1;
$$;

create or replace function public.add_loyalty_stamp(p_member_code text, p_count integer default 1)
returns public.loyalty_members
language plpgsql security definer set search_path = public
as $$
declare v_member public.loyalty_members;
begin
  update public.loyalty_members
  set stamps = stamps + greatest(0, p_count),
      total_visits = total_visits + case when p_count > 0 then 1 else 0 end,
      updated_at = now()
  where lower(member_code) = lower(trim(p_member_code))
  returning * into v_member;
  if not found then raise exception 'Member not found'; end if;
  return v_member;
end;
$$;

alter table public.loyalty_members enable row level security;
revoke all on public.loyalty_members from anon, authenticated;
grant execute on function public.register_loyalty_member(text,text,date,text) to anon, authenticated;
grant execute on function public.search_loyalty_members(text) to anon, authenticated;
grant execute on function public.list_loyalty_members(integer) to anon, authenticated;
grant execute on function public.login_loyalty_member(text,text) to anon, authenticated;
grant execute on function public.add_loyalty_stamp(text,integer) to anon, authenticated;
