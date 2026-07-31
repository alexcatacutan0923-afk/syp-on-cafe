-- BUILD 21.1: Fix member directory stuck on "Loading members..."
-- Run this entire script in Supabase SQL Editor.

-- Allow the public POS client to read only the member directory rows.
-- PIN is still stored in the table, so the frontend code must never request/show it.
alter table public.loyalty_members enable row level security;

grant select on public.loyalty_members to anon, authenticated;

drop policy if exists "POS can read loyalty member directory" on public.loyalty_members;
create policy "POS can read loyalty member directory"
on public.loyalty_members
for select
to anon, authenticated
using (true);

-- Refresh RPCs and make sure they are executable.
create or replace function public.list_loyalty_members(p_limit integer default 20)
returns setof public.loyalty_members
language sql
stable
security definer
set search_path = public
as $$
  select *
  from public.loyalty_members
  order by updated_at desc nulls last, joined_at desc, name asc
  limit least(greatest(coalesce(p_limit, 20), 1), 100);
$$;

create or replace function public.search_loyalty_members(p_query text)
returns setof public.loyalty_members
language sql
stable
security definer
set search_path = public
as $$
  select *
  from public.loyalty_members
  where trim(coalesce(p_query, '')) <> ''
    and (
      member_code ilike '%' || trim(p_query) || '%'
      or name ilike '%' || trim(p_query) || '%'
      or mobile like '%' || regexp_replace(p_query, '\\D', '', 'g') || '%'
    )
  order by name asc
  limit 8;
$$;

grant execute on function public.list_loyalty_members(integer) to anon, authenticated;
grant execute on function public.search_loyalty_members(text) to anon, authenticated;

-- Make PostgREST reload its schema cache immediately.
notify pgrst, 'reload schema';
