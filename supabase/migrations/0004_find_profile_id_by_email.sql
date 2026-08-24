-- Lets an authenticated user resolve an email to a profile id for the sole
-- purpose of granting them access to a child. Returns only the id — never
-- name, role or any other field — so it can't be used to browse profiles.
-- Needed because profiles SELECT is (rightly) restricted to self/admin, but
-- a parent still needs a way to look up a professional to authorise them.

create or replace function public.find_profile_id_by_email(lookup_email text)
returns uuid
language sql
stable
security definer
set search_path = public
as $$
  select id from profiles where email = lookup_email limit 1;
$$;

revoke all on function public.find_profile_id_by_email(text) from public;
grant execute on function public.find_profile_id_by_email(text) to authenticated;
-- Supabase's default privileges grant EXECUTE on new public-schema functions
-- to anon; revoking from PUBLIC above does not remove that separate grant,
-- so it must be revoked from anon explicitly too (verified via
-- has_function_privilege after applying).
revoke execute on function public.find_profile_id_by_email(text) from anon;
