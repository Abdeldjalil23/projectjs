-- MedSuite: safeguards so that administrators cannot lock themselves, or everyone, out.
-- Like the other guards, they only apply to requests from the app (anon / authenticated);
-- the server side (SQL editor, service role) is trusted.

-- 1. Nobody changes their own role or status from the app, administrators included.
create function public.protect_own_account()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  if current_user in ('anon', 'authenticated')
     and new.id = auth.uid()
     and (new.role_id is distinct from old.role_id or new.active is distinct from old.active) then
    raise exception 'You cannot change your own role or status';
  end if;
  return new;
end;
$$;

create trigger profiles_protect_own_account
  before update on public.profiles
  for each row execute function public.protect_own_account();

-- 2. The administration role always keeps account and role management.
create function public.protect_admin_permissions()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  if current_user in ('anon', 'authenticated') and exists (
    select 1
    from public.roles r, public.permissions p
    where r.id = old.role_id
      and p.id = old.permission_id
      and r.code = 'admin'
      and p.code in ('users.manage', 'roles.manage')
  ) then
    raise exception 'The administration role must keep users.manage and roles.manage';
  end if;
  if tg_op = 'DELETE' then
    return old;
  end if;
  return new;
end;
$$;

create trigger role_permissions_protect_admin
  before update or delete on public.role_permissions
  for each row execute function public.protect_admin_permissions();

-- Trigger functions are not called through the API.
revoke execute on function public.protect_own_account(), public.protect_admin_permissions()
  from public, anon, authenticated;
