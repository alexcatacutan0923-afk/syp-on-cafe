-- SYP ON CAFÉ gallery setup (run once in Supabase SQL Editor)
create table if not exists public.gallery_items (
  id uuid primary key default gen_random_uuid(),
  type text not null check (type in ('photo','reel')),
  title text not null default '',
  media_url text not null,
  storage_path text,
  created_at timestamptz not null default now()
);
alter table public.gallery_items enable row level security;

drop policy if exists "Gallery items are publicly readable" on public.gallery_items;
create policy "Gallery items are publicly readable" on public.gallery_items
for select using (true);

drop policy if exists "Only SYP admins can add gallery items" on public.gallery_items;
create policy "Only SYP admins can add gallery items" on public.gallery_items
for insert to authenticated
with check ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');

drop policy if exists "Only SYP admins can delete gallery items" on public.gallery_items;
create policy "Only SYP admins can delete gallery items" on public.gallery_items
for delete to authenticated
using ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('syp-gallery', 'syp-gallery', true, 10485760, array['image/jpeg','image/png','image/webp','image/gif'])
on conflict (id) do update set public = true, file_size_limit = 10485760;

drop policy if exists "Public can view SYP gallery images" on storage.objects;
create policy "Public can view SYP gallery images" on storage.objects
for select using (bucket_id = 'syp-gallery');

drop policy if exists "SYP admins can upload gallery images" on storage.objects;
create policy "SYP admins can upload gallery images" on storage.objects
for insert to authenticated
with check (bucket_id = 'syp-gallery' and (auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');

drop policy if exists "SYP admins can delete gallery images" on storage.objects;
create policy "SYP admins can delete gallery images" on storage.objects
for delete to authenticated
using (bucket_id = 'syp-gallery' and (auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');

-- In Supabase Dashboard > Authentication > Users, create your admin user.
-- Then edit that user and set app_metadata to: {"role":"admin"}
