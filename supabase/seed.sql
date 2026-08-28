-- =========================================================================
-- Bootstrapping the first Admin account
-- =========================================================================
-- Every self-registration defaults to 'user' or 'sales_person' (see the
-- frontend register form) — nobody can grant themselves 'admin'. That's by
-- design: RBAC is only meaningful if privilege escalation requires an
-- out-of-band step. Run this once, after your first real sign-up, to
-- promote that account to Admin. From then on, the Admin dashboard's
-- "Users" tab can promote/demote anyone, including other admins.

-- 1. Sign up normally through the app (Register page) with the account
--    you want to use as Admin.
-- 2. Run this in the Supabase SQL editor, swapping in that email:

update profiles
set role = 'admin'
where email = 'admin@example.com';

-- 3. Sign out and back in on the frontend so a fresh session/profile is
--    fetched with the new role.
