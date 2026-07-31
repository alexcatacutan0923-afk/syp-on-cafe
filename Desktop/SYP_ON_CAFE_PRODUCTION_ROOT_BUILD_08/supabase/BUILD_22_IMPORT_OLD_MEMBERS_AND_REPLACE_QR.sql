-- BUILD 22: Import old Google Sheets loyalty members into Supabase
-- Replaces every Apps Script QR link with syponcafe.shop/member-login?identity=SYPxxxx

create extension if not exists pgcrypto;

-- Allow legacy members without a mobile number (example: SYP0033).
alter table public.loyalty_members alter column mobile drop not null;

-- Extra migration fields retained from the old sheet.
alter table public.loyalty_members add column if not exists status text not null default 'Active';
alter table public.loyalty_members add column if not exists qr_link text;
alter table public.loyalty_members add column if not exists qr_image text;
alter table public.loyalty_members add column if not exists total_stamps integer not null default 0;
alter table public.loyalty_members add column if not exists referrals integer not null default 0;
alter table public.loyalty_members add column if not exists claimed_date date;
alter table public.loyalty_members add column if not exists claim_status text;
alter table public.loyalty_members add column if not exists last_stamp_date date;
alter table public.loyalty_members add column if not exists member_level text;
alter table public.loyalty_members add column if not exists referred_by text;
alter table public.loyalty_members add column if not exists photo_url text;

-- Remove old Apps Script URLs if any already exist.
update public.loyalty_members
set qr_link = 'https://syponcafe.shop/member-login?identity=' || member_code,
    qr_image = '/member-qr/' || member_code || '.png'
where qr_link is null or qr_link ilike '%script.google.com%';

insert into public.loyalty_members
(member_code,name,mobile,birthday,pin,stamps,total_visits,favorite_drink,joined_at,updated_at,status,qr_link,qr_image,total_stamps,referrals,claimed_date,claim_status,last_stamp_date,member_level,referred_by,photo_url)
values
('SYP0003', 'Angeline Keith', '09774182559', '2000-10-06'::date, '2559', 10, 42, 'Not selected', now()::date, now(), 'FREE DRINK READY', 'https://syponcafe.shop/member-login?identity=SYP0003', '/member-qr/SYP0003.png', 42, 0, '2026-07-21'::date, 'Claimed', '2026-07-22'::date, '⚪ Silver Member', null, null),
('SYP0005', 'Franchesca bartolome', '09511182321', '2004-06-20'::date, '2321', 0, 0, 'Not selected', now()::date, now(), 'Active', 'https://syponcafe.shop/member-login?identity=SYP0005', '/member-qr/SYP0005.png', 0, 0, null, null, null, '🟤 Bronze Member', null, null),
('SYP0006', 'PrinceCharlsCatacutan', '09064631863', '2001-12-07'::date, '1863', 0, 16, 'Not selected', now()::date, now(), 'Active', 'https://syponcafe.shop/member-login?identity=SYP0006', '/member-qr/SYP0006.png', 16, 1, null, null, '2026-07-19'::date, '🟤 Bronze Member', null, null),
('SYP0007', 'Camille Delos Reyes Rongap', '09463942021', '2000-10-28'::date, '2021', 3, 1, 'Not selected', now()::date, now(), 'Active', 'https://syponcafe.shop/member-login?identity=SYP0007', '/member-qr/SYP0007.png', 1, 0, null, null, '2026-07-08'::date, '🟤 Bronze Member', null, null),
('SYP0008', 'Chase Asuncion', '09911941889', '2008-03-03'::date, '1889', 1, 1, 'Not selected', now()::date, now(), 'Active', 'https://syponcafe.shop/member-login?identity=SYP0008', '/member-qr/SYP0008.png', 1, 0, null, null, '2026-07-15'::date, '🟤 Bronze Member', null, null),
('SYP0009', 'Marc Daniell Ramos', '09926257649', '2005-06-27'::date, '7649', 2, 38, 'Not selected', now()::date, now(), 'Active', 'https://syponcafe.shop/member-login?identity=SYP0009', '/member-qr/SYP0009.png', 38, 0, null, null, '2026-07-19'::date, '⚪ Silver Member', null, null),
('SYP0011', 'Pauline Gacutan', '09324485606', '1993-04-06'::date, '5606', 0, 0, 'Not selected', '2026-07-06'::date, now(), 'Active', 'https://syponcafe.shop/member-login?identity=SYP0011', '/member-qr/SYP0011.png', 0, 0, null, null, null, null, null, null),
('SYP0016', 'Crystal Kyle Pulos', '09957218565', '2000-11-26'::date, '8565', 4, 2, 'Not selected', '2026-07-06'::date, now(), 'Active', 'https://syponcafe.shop/member-login?identity=SYP0016', '/member-qr/SYP0016.png', 2, 0, null, null, '2026-07-16'::date, '🟤 Bronze Member', null, null),
('SYP0017', 'Miguel Jarel Salandanan', '09279869261', '2014-12-05'::date, '9261', 4, 4, 'Not selected', '2026-07-10'::date, now(), 'Active', 'https://syponcafe.shop/member-login?identity=SYP0017', '/member-qr/SYP0017.png', 4, 0, null, null, '2026-07-25'::date, '🟤 Bronze Member', 'SYP0003', null),
('SYP0018', 'jayvee', '09947210800', '1997-03-08'::date, '0800', 5, 1, 'Not selected', '2026-07-11'::date, now(), 'Active', 'https://syponcafe.shop/member-login?identity=SYP0018', '/member-qr/SYP0018.png', 1, 0, null, null, '2026-07-17'::date, '🟤 Bronze Member', null, null),
('SYP0019', 'Marvin Lopez', '09853824202', '2005-11-26'::date, '4202', 4, 4, 'Not selected', '2026-07-14'::date, now(), 'Active', 'https://syponcafe.shop/member-login?identity=SYP0019', '/member-qr/SYP0019.png', 4, 0, null, null, '2026-07-21'::date, '🟤 Bronze Member', null, null),
('SYP0020', 'Dheyna lopez', '09648966380', '1988-12-16'::date, '6380', 0, 0, 'Not selected', '2026-07-16'::date, now(), 'Active', 'https://syponcafe.shop/member-login?identity=SYP0020', '/member-qr/SYP0020.png', 0, 0, null, null, null, '🟤 Bronze Member', null, null),
('SYP0021', 'Jessica Mae Mara', '09942084782', '2006-01-31'::date, '4782', 2, 3, 'Not selected', '2026-07-18'::date, now(), 'Active', 'https://syponcafe.shop/member-login?identity=SYP0021', '/member-qr/SYP0021.png', 3, 0, null, null, '2026-07-18'::date, '🟤 Bronze Member', null, null),
('SYP0022', 'RheannaDela Cruz', '09951017690', '1996-01-05'::date, '7690', 0, 0, 'Not selected', '2026-07-18'::date, now(), 'Active', 'https://syponcafe.shop/member-login?identity=SYP0022', '/member-qr/SYP0022.png', 0, 0, null, null, null, '🟤 Bronze Member', null, null),
('SYP0023', 'marjolane de leon', '09616891145', '1987-09-29'::date, '1145', 1, 1, 'Not selected', '2026-07-18'::date, now(), 'Active', 'https://syponcafe.shop/member-login?identity=SYP0023', '/member-qr/SYP0023.png', 1, 0, null, null, '2026-07-18'::date, '🟤 Bronze Member', null, null),
('SYP0024', 'Mark Jules Alonzo', '09815440397', '2007-06-10'::date, '0397', 1, 1, 'Not selected', '2026-07-18'::date, now(), 'Active', 'https://syponcafe.shop/member-login?identity=SYP0024', '/member-qr/SYP0024.png', 1, 0, null, null, '2026-07-18'::date, '🟤 Bronze Member', null, null),
('SYP0025', 'SYP CAFE TEST', '09282992929', '2005-07-19'::date, '2929', 3, 3, 'Not selected', '2026-07-19'::date, now(), 'Active', 'https://syponcafe.shop/member-login?identity=SYP0025', '/member-qr/SYP0025.png', 3, 0, null, null, '2026-07-19'::date, '🟤 Bronze Member', 'SYP0009', null),
('SYP0027', 'sdasdasdasd', '09827839322', '2000-09-06'::date, '9322', 0, 0, 'Not selected', '2026-07-20'::date, now(), 'Active', 'https://syponcafe.shop/member-login?identity=SYP0027', '/member-qr/SYP0027.png', 0, 0, null, null, null, null, null, null),
('SYP0031', 'Jersey catacutan', '09150988491', '1997-01-01'::date, '8491', 1, 1, 'Not selected', '2026-07-20'::date, now(), 'Active', 'https://syponcafe.shop/member-login?identity=SYP0031', '/member-qr/SYP0031.png', 1, 0, null, null, '2026-07-20'::date, '🟤 Bronze Member', null, null),
('SYP0032', 'Mempys', '09954312807', '2004-07-20'::date, '2807', 1, 1, 'Not selected', '2026-07-20'::date, now(), 'Active', 'https://syponcafe.shop/member-login?identity=SYP0032', '/member-qr/SYP0032.png', 1, 0, null, null, '2026-07-21'::date, '🟤 Bronze Member', null, null),
('SYP0033', 'Maedeline Manrique', null, null, '0033', 2, 2, 'Not selected', '2026-07-20'::date, now(), 'Active', 'https://syponcafe.shop/member-login?identity=SYP0033', '/member-qr/SYP0033.png', 2, 0, null, null, '2026-07-22'::date, '🟤 Bronze Member', null, null),
('SYP0034', 'Jojo Balboa', '09647587196', '2007-03-04'::date, '7196', 0, 0, 'Not selected', '2026-07-20'::date, now(), 'Active', 'https://syponcafe.shop/member-login?identity=SYP0034', '/member-qr/SYP0034.png', 0, 0, null, null, null, '🟤 Bronze Member', null, null),
('SYP0035', 'nsksksks', '09109760880', '2005-07-21'::date, '0880', 0, 0, 'Not selected', '2026-07-21'::date, now(), 'Active', 'https://syponcafe.shop/member-login?identity=SYP0035', '/member-qr/SYP0035.png', 0, 0, null, null, null, null, null, null),
('SYP0036', 'AFSADASDSA', '09123123123', '2000-09-20'::date, '3123', 1, 1, 'Not selected', '2026-07-21'::date, now(), 'Active', 'https://syponcafe.shop/member-login?identity=SYP0036', '/member-qr/SYP0036.png', 1, 0, null, null, null, '🟤 Bronze Member', null, null),
('SYP0037', 'JEJEJEJE', '09997383939', '2000-09-20'::date, '3939', 0, 0, 'Not selected', '2026-07-21'::date, now(), 'Active', 'https://syponcafe.shop/member-login?identity=SYP0037', '/member-qr/SYP0037.png', 0, 0, null, null, null, null, null, null),
('SYP0038', 'Alex Unlocker', '09123123213', '2000-09-23'::date, '3213', 0, 0, 'Not selected', '2026-07-21'::date, now(), 'Active', 'https://syponcafe.shop/member-login?identity=SYP0038', '/member-qr/SYP0038.png', 0, 0, null, null, null, '🟤 Bronze Member', null, null),
('SYP0039', 'alex', '09838381833', '2003-09-23'::date, '1833', 0, 0, 'Not selected', '2026-07-21'::date, now(), 'Active', 'https://syponcafe.shop/member-login?identity=SYP0039', '/member-qr/SYP0039.png', 0, 0, null, null, null, null, null, null),
('SYP0040', 'SYP ON CAFE', '09954312806', '2000-02-22'::date, '2806', 0, 0, 'Not selected', '2026-07-22'::date, now(), 'Active', 'https://syponcafe.shop/member-login?identity=SYP0040', '/member-qr/SYP0040.png', 0, 0, null, null, null, null, null, null),
('SYP0041', 'Carl Barin', '09922408918', '2006-12-10'::date, '8918', 4, 4, 'Not selected', '2026-07-23'::date, now(), 'Active', 'https://syponcafe.shop/member-login?identity=SYP0041', '/member-qr/SYP0041.png', 4, 0, null, null, '2026-07-23'::date, null, null, null)
on conflict (member_code) do update set
  name = excluded.name,
  mobile = excluded.mobile,
  birthday = excluded.birthday,
  stamps = excluded.stamps,
  total_visits = excluded.total_visits,
  status = excluded.status,
  qr_link = excluded.qr_link,
  qr_image = excluded.qr_image,
  total_stamps = excluded.total_stamps,
  referrals = excluded.referrals,
  claimed_date = excluded.claimed_date,
  claim_status = excluded.claim_status,
  last_stamp_date = excluded.last_stamp_date,
  member_level = excluded.member_level,
  referred_by = excluded.referred_by,
  photo_url = excluded.photo_url,
  updated_at = now();

-- Continue automatic IDs after the highest imported member number.
select setval(
  'public.loyalty_member_number_seq',
  greatest(
    1,
    coalesce((select max(regexp_replace(member_code, '\D', '', 'g')::bigint) from public.loyalty_members), 1)
  ),
  true
);

-- Make QR values automatic for every new registration.
create or replace function public.register_loyalty_member(
  p_name text,
  p_mobile text,
  p_birthday date,
  p_pin text
) returns public.loyalty_members
language plpgsql security definer set search_path = public
as $$
declare
  v_mobile text := regexp_replace(coalesce(p_mobile,''), '\D', '', 'g');
  v_member public.loyalty_members;
  v_code text;
begin
  if length(trim(coalesce(p_name,''))) < 2 then raise exception 'Name is required'; end if;
  if length(v_mobile) < 10 then raise exception 'Valid mobile number is required'; end if;
  if length(coalesce(p_pin,'')) < 4 then raise exception 'PIN must be at least 4 digits'; end if;

  select * into v_member from public.loyalty_members where mobile = v_mobile;
  if found then return v_member; end if;

  v_code := 'SYP' || lpad(nextval('public.loyalty_member_number_seq')::text, 4, '0');
  insert into public.loyalty_members(member_code,name,mobile,birthday,pin,qr_link,qr_image)
  values (
    v_code, trim(p_name), v_mobile, p_birthday, p_pin,
    'https://syponcafe.shop/member-login?identity=' || v_code,
    '/member-qr/' || v_code || '.png'
  ) returning * into v_member;
  return v_member;
end;
$$;

grant execute on function public.register_loyalty_member(text,text,date,text) to anon, authenticated;
notify pgrst, 'reload schema';

-- Verification
select member_code,name,mobile,stamps,total_stamps,qr_link from public.loyalty_members order by member_code;
