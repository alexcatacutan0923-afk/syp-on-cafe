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

-- First create your admin account in Supabase Dashboard > Authentication > Users.
-- Replace the email below with your own admin email, then run this statement once:
-- update auth.users
-- set raw_app_meta_data = coalesce(raw_app_meta_data, '{}'::jsonb) || '{"role":"admin"}'::jsonb
-- where email = 'YOUR_ADMIN_EMAIL';


-- Extend the gallery with a staff/barista category.
alter table public.gallery_items drop constraint if exists gallery_items_type_check;
alter table public.gallery_items add constraint gallery_items_type_check check (type in ('photo','reel','barista'));

-- Public customer photo submissions are held for admin review before appearing publicly.
create table if not exists public.gallery_submissions (
  id uuid primary key default gen_random_uuid(),
  name text not null default '',
  media_url text not null,
  storage_path text not null,
  created_at timestamptz not null default now()
);
alter table public.gallery_submissions enable row level security;
drop policy if exists "Visitors can submit SYP Fam photos" on public.gallery_submissions;
create policy "Visitors can submit SYP Fam photos" on public.gallery_submissions
for insert to anon, authenticated with check (char_length(name) <= 70 and char_length(media_url) <= 2000 and char_length(storage_path) <= 500);
drop policy if exists "SYP admins can review photo submissions" on public.gallery_submissions;
create policy "SYP admins can review photo submissions" on public.gallery_submissions
for select to authenticated using ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');
drop policy if exists "SYP admins can remove photo submissions" on public.gallery_submissions;
create policy "SYP admins can remove photo submissions" on public.gallery_submissions
for delete to authenticated using ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');

-- Allow public uploads into the private-to-review workflow's shared public image bucket.
-- Only the gallery admin can publish a database gallery_items row.
drop policy if exists "Visitors can upload SYP Fam submissions" on storage.objects;
create policy "Visitors can upload SYP Fam submissions" on storage.objects
for insert to anon, authenticated with check (bucket_id = 'syp-gallery' and (storage.foldername(name))[1] = 'community' and (storage.extension(name) in ('jpg','jpeg','png','webp')));
