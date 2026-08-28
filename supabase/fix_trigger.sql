-- Run this once to patch the profile-creation trigger already applied to
-- your database — it fixes the "Database error saving new user" signup
-- failure. See supabase/schema.sql for the corrected canonical version.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email, full_name, role)
  values (
    new.id,
    new.email,
    new.raw_user_meta_data ->> 'full_name',
    coalesce((new.raw_user_meta_data ->> 'role')::public.user_role, 'user')
  );
  return new;
end;
$$;
