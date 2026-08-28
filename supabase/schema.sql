-- =========================================================================
-- Lumos Market — Database Schema (Supabase / Postgres)
-- Run this once in the Supabase SQL editor (or via `supabase db push`).
-- =========================================================================

-- ---------------------------------------------------------------------
-- 1. profiles — one row per user. This is our own identity table, not an
--    extension of Supabase Auth: Supabase here is Postgres only.
--    Authentication (password hashing + JWT issuance) is hand-rolled in
--    the Express backend — see backend/src/modules/auth. role drives
--    every RBAC check there.
-- ---------------------------------------------------------------------
create type user_role as enum ('admin', 'sales_person', 'user');

create table profiles (
  id            uuid primary key default gen_random_uuid(),
  email         text not null unique,
  password_hash text not null,
  full_name     text,
  role          user_role not null default 'user',
  created_at    timestamptz not null default now()
);

-- ---------------------------------------------------------------------
-- 2. categories — managed by Admins (see backend/src/modules/categories).
--    Deleting a category that products still reference is blocked by the
--    FK (no ON DELETE CASCADE) — the API surfaces that as a clear 409
--    rather than silently orphaning or mass-deleting products.
-- ---------------------------------------------------------------------
create table categories (
  id          uuid primary key default gen_random_uuid(),
  name        text not null unique,
  created_at  timestamptz not null default now()
);

-- ---------------------------------------------------------------------
-- 3. products — owner_id is the Sales Person (or Admin) who listed it
-- ---------------------------------------------------------------------
create table products (
  id           uuid primary key default gen_random_uuid(),
  owner_id     uuid not null references profiles (id) on delete cascade,
  category_id  uuid not null references categories (id),
  name         text not null,
  description  text,
  price        numeric(10, 2) not null check (price >= 0),
  stock        integer not null default 0 check (stock >= 0),
  image_url    text,
  image_public_id text,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);

create extension if not exists pg_trgm;

create index idx_products_owner on products (owner_id);
create index idx_products_category on products (category_id);
create index idx_products_name_trgm on products using gin (name gin_trgm_ops);

-- ---------------------------------------------------------------------
-- 4. cart_items — one row per (user, product); quantity holds the count
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
-- 5. wishlist_items — one row per (user, product)
-- ---------------------------------------------------------------------
create table wishlist_items (
  id           uuid primary key default gen_random_uuid(),
  user_id      uuid not null references profiles (id) on delete cascade,
  product_id   uuid not null references products (id) on delete cascade,
  created_at   timestamptz not null default now(),
  unique (user_id, product_id)
);

-- ---------------------------------------------------------------------
-- 6. orders — one row per checkout; Razorpay fields verify the payment
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
-- 7. order_items — line items; seller_id is denormalised for fast
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
-- 8. idempotency_keys — backs the Idempotency-Key middleware
--    (backend/src/middleware/idempotency.middleware.js). A client retrying
--    a checkout request after a timeout/network blip replays the first
--    response instead of creating a second Razorpay order.
-- ---------------------------------------------------------------------
create table idempotency_keys (
  id                uuid primary key default gen_random_uuid(),
  idempotency_key   text not null,
  user_id           uuid not null references profiles (id) on delete cascade,
  method            text not null,
  path              text not null,
  request_hash      text not null,
  status            text not null default 'processing' check (status in ('processing', 'completed')),
  response_status   integer,
  response_body     jsonb,
  created_at        timestamptz not null default now(),
  unique (idempotency_key, user_id, method, path)
);

create index idx_idempotency_lookup on idempotency_keys (idempotency_key, user_id, method, path);

-- ---------------------------------------------------------------------
-- Row Level Security
-- The Express backend is the ONLY thing that ever talks to this database —
-- the frontend never calls Supabase directly (auth is our own, not Supabase
-- Auth, so there's no anon-key client anywhere in this app). The backend
-- always connects with the service_role key, which bypasses RLS by design;
-- all authorization is enforced in Express middleware instead (see
-- backend/src/middleware/role.middleware.js) so a restricted action fails
-- on the server, not just in the UI.
-- RLS is enabled with no policies on purpose: it's a hard backstop that
-- denies every row to any hypothetical non-service-role client, since
-- there's no auth.uid() session context for policies to check against here.
-- ---------------------------------------------------------------------
alter table profiles enable row level security;
alter table categories enable row level security;
alter table products enable row level security;
alter table cart_items enable row level security;
alter table wishlist_items enable row level security;
alter table orders enable row level security;
alter table order_items enable row level security;
alter table idempotency_keys enable row level security;
