-- Run this once against your already-provisioned database to turn
-- products.category (free text) into a real categories table. See
-- supabase/schema.sql (sections 2-3) for the canonical version if you're
-- setting up a fresh DB instead.
--
-- Safe with existing product rows: every distinct category string already
-- in use becomes its own categories row, and every product is backfilled
-- to point at the matching one -- nothing is renamed or lost.

create table categories (
  id          uuid primary key default gen_random_uuid(),
  name        text not null unique,
  created_at  timestamptz not null default now()
);

alter table categories enable row level security;
-- No policies on purpose -- only the backend's service_role key ever
-- touches this table (see supabase/schema.sql's RLS note for why).

-- One categories row per distinct value currently on products.category.
insert into categories (name)
select distinct category from products
on conflict (name) do nothing;

-- Backfill: point every product at its matching category row.
alter table products add column if not exists category_id uuid;

update products
set category_id = categories.id
from categories
where products.category = categories.name;

alter table products alter column category_id set not null;
alter table products add constraint products_category_id_fkey
  foreign key (category_id) references categories (id);

drop index if exists idx_products_category;
alter table products drop column category;

create index idx_products_category on products (category_id);
