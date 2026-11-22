-- MedSuite: explicit API privileges for the tables of 20261122000001_core_access.sql.
--
-- Supabase can create projects that do not expose new tables to the API automatically,
-- and projects that do expose them grant everything to everyone. Listing the privileges
-- here gives the same, minimal result in both cases. Row Level Security still decides
-- which rows each signed-in user can see or change.

-- Nothing for visitors who are not signed in.
revoke all on public.roles, public.permissions, public.role_permissions,
              public.profiles, public.app_settings, public.audit_log
  from anon, authenticated;

grant usage on schema public to authenticated;

-- Roles and their permissions: everyone signed in reads them; changes need roles.manage (RLS).
-- The permission list itself comes with the code and is not edited from the app.
grant select on public.roles, public.permissions, public.role_permissions to authenticated;
grant insert, update, delete on public.roles, public.role_permissions to authenticated;

-- Profiles are created by the sign-up trigger and never deleted (accounts are deactivated).
grant select, update on public.profiles to authenticated;

grant select, insert, update on public.app_settings to authenticated;

-- The audit log is written by triggers only.
grant select on public.audit_log to authenticated;

-- Functions: only the two the app calls are callable through the API.
revoke execute on all functions in schema public from public, anon, authenticated;
grant execute on function public.has_permission(text) to authenticated;
grant execute on function public.my_permissions() to authenticated;
