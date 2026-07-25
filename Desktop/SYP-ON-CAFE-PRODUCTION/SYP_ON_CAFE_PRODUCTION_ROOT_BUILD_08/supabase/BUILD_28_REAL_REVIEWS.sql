create table if not exists public.customer_reviews (
  id uuid primary key default gen_random_uuid(),
  order_id uuid,
  order_number text,
  customer_id text,
  customer_name text not null,
  rating integer not null check (rating between 1 and 5),
  comment text not null check (char_length(comment) between 2 and 800),
  product_name text,
  is_approved boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create unique index if not exists customer_reviews_one_per_order
  on public.customer_reviews(order_number)
  where order_number is not null;

alter table public.customer_reviews enable row level security;

drop policy if exists "Public can read approved customer reviews" on public.customer_reviews;
create policy "Public can read approved customer reviews"
  on public.customer_reviews for select
  using (is_approved = true);

-- Submission should be done by the completed-order flow or a secured server action.
-- This patch intentionally does not allow anonymous direct inserts from the browser.
notify pgrst, 'reload schema';
