-- =========================================================================
-- Lumos Market — Database Schema (Supabase / Postgres)
-- Run this once in the Supabase SQL editor (or via `supabase db push`).
-- =========================================================================

-- ---------------------------------------------------------------------
-- 1. profiles — one row per authenticated user, extends auth.users
--    role drives every RBAC check in the Express backend.
-- ---------------------------------------------------------------------
create type user_role as enum ('admin', 'sales_person', 'user');

create table profiles (
  id           uuid primary key references auth.users (id) on delete cascade,
  email        text not null,
  full_name    text,
  role         user_role not null default 'user',
  created_at   timestamptz not null default now()
);

-- Auto-create a profile row whenever a new user signs up via Supabase Auth.
create function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email, full_name, role)
  values (
    new.id,
    new.email,
    new.raw_user_meta_data ->> 'full_name',
    coalesce((new.raw_user_meta_data ->> 'role')::user_role, 'user')
  );
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- ---------------------------------------------------------------------
-- 2. products — owner_id is the Sales Person (or Admin) who listed it
-- ---------------------------------------------------------------------
create table products (
  id           uuid primary key default gen_random_uuid(),
  owner_id     uuid not null references profiles (id) on delete cascade,
  name         text not null,
  description  text,
  price        numeric(10, 2) not null check (price >= 0),
  category     text not null,
  stock        integer not null default 0 check (stock >= 0),
  image_url    text,
  image_public_id text,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);

create index idx_products_owner on products (owner_id);
create index idx_products_category on products (category);
create index idx_products_name_trgm on products using gin (name gin_trgm_ops);
create extension if not exists pg_trgm;

-- ---------------------------------------------------------------------
-- 3. cart_items — one row per (user, product); quantity holds the count
-- ---------------------------------------------------------------------
create table cart_items (
  id           uuid primary key default gen_random_uuid(),
  user_id      uuid not null references profiles (id) on delete cascade,
  product_id   uuid not null references products (id) on delete cascade,
  quantity     integer not null default 1 check (quantity > 0),
  created_at   timestamptz not null default now(),
  unique (user_id, product_id)
);

-- ---------------------------------------------------------------------
-- 4. wishlist_items — one row per (user, product)
-- ---------------------------------------------------------------------
create table wishlist_items (
  id           uuid primary key default gen_random_uuid(),
  user_id      uuid not null references profiles (id) on delete cascade,
  product_id   uuid not null references products (id) on delete cascade,
  created_at   timestamptz not null default now(),
  unique (user_id, product_id)
);

-- ---------------------------------------------------------------------
-- 5. orders — one row per checkout; Razorpay fields verify the payment
-- ---------------------------------------------------------------------
create type order_status as enum ('created', 'paid', 'failed');

create table orders (
  id                  uuid primary key default gen_random_uuid(),
  user_id             uuid not null references profiles (id) on delete cascade,
  total_amount        numeric(10, 2) not null,
  status              order_status not null default 'created',
  razorpay_order_id   text not null,
  razorpay_payment_id text,
  razorpay_signature  text,
  created_at          timestamptz not null default now()
);

-- ---------------------------------------------------------------------
-- 6. order_items — line items; seller_id is denormalised for fast
--    "orders containing my products" lookups by Sales Person
-- ---------------------------------------------------------------------
create table order_items (
  id             uuid primary key default gen_random_uuid(),
  order_id       uuid not null references orders (id) on delete cascade,
  product_id     uuid references products (id) on delete set null,
  seller_id      uuid not null references profiles (id),
  product_name   text not null,
  quantity       integer not null check (quantity > 0),
  price_at_purchase numeric(10, 2) not null
);

create index idx_order_items_order on order_items (order_id);
create index idx_order_items_seller on order_items (seller_id);

-- ---------------------------------------------------------------------
-- Row Level Security
-- The Express backend talks to Supabase with the service_role key, which
-- bypasses RLS by design — all authorization is enforced in Express
-- middleware (see backend/src/middleware/role.middleware.js) so that a
-- restricted action fails on the server, not just in the UI.
-- RLS is still enabled here as defense-in-depth in case a client ever
-- talks to Supabase directly with the anon key.
-- ---------------------------------------------------------------------
alter table profiles enable row level security;
alter table products enable row level security;
alter table cart_items enable row level security;
alter table wishlist_items enable row level security;
alter table orders enable row level security;
alter table order_items enable row level security;

create policy "profiles are self-readable" on profiles
  for select using (auth.uid() = id);

create policy "products are publicly readable" on products
  for select using (true);

create policy "cart is private to owner" on cart_items
  for all using (auth.uid() = user_id);

create policy "wishlist is private to owner" on wishlist_items
  for all using (auth.uid() = user_id);

create policy "orders are private to owner" on orders
  for select using (auth.uid() = user_id);
