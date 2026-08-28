-- Run this once against your already-provisioned database to switch from
-- Supabase Auth to the backend's own bcrypt + JWT authentication. See
-- supabase/schema.sql (section 1) for the canonical version if you're
-- setting up a fresh DB instead.
--
-- Safe to run even with existing rows in `profiles`, EXCEPT any such rows
-- won't have a password_hash yet and won't be able to log in until one is
-- set — fine for this project since no real accounts exist yet.

-- The trigger only made sense when Supabase Auth owned user creation.
drop trigger if exists on_auth_user_created on auth.users;
drop function if exists public.handle_new_user();

-- profiles is now its own identity table, not an extension of auth.users.
alter table profiles drop constraint if exists profiles_id_fkey;
alter table profiles alter column id set default gen_random_uuid();
alter table profiles add column if not exists password_hash text not null default '';
alter table profiles alter column password_hash drop default;
alter table profiles add constraint profiles_email_key unique (email);

-- The old RLS policies checked auth.uid(), which no longer means anything
-- (there's no Supabase Auth session context in this app anymore). Drop
-- them — RLS stays enabled with zero policies, denying every row to any
-- non-service-role client by default.
drop policy if exists "profiles are self-readable" on profiles;
drop policy if exists "cart is private to owner" on cart_items;
drop policy if exists "wishlist is private to owner" on wishlist_items;
drop policy if exists "orders are private to owner" on orders;
