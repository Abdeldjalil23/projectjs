-- MedSuite · Core access model
-- Staff accounts, dynamic roles and permissions, application settings, audit log.
--
-- Principles
--   * Every check is enforced in the database (Row Level Security), not only in the UI.
--   * Roles and their permissions are rows: an administrator can change them without code.
--   * Medical content is visible only to clinical roles; the administration sees
--     administrative data and aggregated reports.
--   * Every change to access rules and accounts is written to the audit log.

-- ---------------------------------------------------------------------------
-- Roles and permissions
-- ---------------------------------------------------------------------------

create table public.roles (
  id          uuid primary key default gen_random_uuid(),
  code        text not null unique check (code ~ '^[a-z][a-z0-9_]*$'),
  name_fr     text not null,
  name_ar     text not null,
  name_en     text not null,
  is_system   boolean not null default false,   -- system roles cannot be deleted
  created_at  timestamptz not null default now()
);

create table public.permissions (
  id          uuid primary key default gen_random_uuid(),
  code        text not null unique check (code ~ '^[a-z_]+\.[a-z_]+$'),  -- module.action
  module      text not null,
  description text not null,
  is_medical  boolean not null default false     -- grants access to clinical content
);

create table public.role_permissions (
  role_id       uuid not null references public.roles(id) on delete cascade,
  permission_id uuid not null references public.permissions(id) on delete cascade,
  primary key (role_id, permission_id)
);

-- ---------------------------------------------------------------------------
-- Staff profiles (one per Supabase Auth user)
-- ---------------------------------------------------------------------------

create table public.profiles (
  id                 uuid primary key references auth.users(id) on delete cascade,
  staff_id           text unique,                        -- identifier typed on the login screen
  full_name          text not null default '',
  role_id            uuid references public.roles(id),   -- null = no access yet
  specialty          text,
  active             boolean not null default false,     -- an administrator activates the account
  preferred_language text not null default 'fr' check (preferred_language in ('fr', 'ar', 'en')),
  created_at         timestamptz not null default now(),
  updated_at         timestamptz not null default now()
);

create index profiles_role_idx on public.profiles(role_id);

-- A new Auth user gets an empty, inactive profile. The role is assigned afterwards
-- by an administrator, so nothing typed at sign-up can grant access.
create function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, staff_id, full_name)
  values (
    new.id,
    nullif(new.raw_user_meta_data ->> 'staff_id', ''),
    coalesce(new.raw_user_meta_data ->> 'full_name', '')
  );
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

create function public.touch_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

create trigger profiles_touch_updated_at
  before update on public.profiles
  for each row execute function public.touch_updated_at();

-- ---------------------------------------------------------------------------
-- Permission helpers (used by every RLS policy)
-- ---------------------------------------------------------------------------

create function public.has_permission(permission_code text)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.profiles p
    join public.role_permissions rp on rp.role_id = p.role_id
    join public.permissions perm on perm.id = rp.permission_id
    where p.id = auth.uid()
      and p.active
      and perm.code = permission_code
  );
$$;

-- Everything the signed-in user may do, for the UI to show or hide screens.
create function public.my_permissions()
returns setof text
language sql
stable
security definer
set search_path = public
as $$
  select perm.code
  from public.profiles p
  join public.role_permissions rp on rp.role_id = p.role_id
  join public.permissions perm on perm.id = rp.permission_id
  where p.id = auth.uid()
    and p.active
  order by perm.code;
$$;

-- A user may edit their own name and language, never their role or status.
-- Only requests from the app (anon / authenticated) are checked; the server side
-- (service role, SQL editor) is trusted.
create function public.guard_profile_self_update()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  if current_user in ('anon', 'authenticated') and not public.has_permission('users.manage') then
    if new.role_id is distinct from old.role_id
       or new.active is distinct from old.active
       or new.staff_id is distinct from old.staff_id then
      raise exception 'Only an administrator can change role, status or identifier';
    end if;
  end if;
  return new;
end;
$$;

create trigger profiles_guard_self_update
  before update on public.profiles
  for each row execute function public.guard_profile_self_update();

-- ---------------------------------------------------------------------------
-- Application settings (values the team decides and can change later)
-- ---------------------------------------------------------------------------

create table public.app_settings (
  key         text primary key,
  value       jsonb not null,
  description text not null,
  updated_at  timestamptz not null default now(),
  updated_by  uuid references auth.users(id) default auth.uid()
);

create function public.touch_app_settings()
returns trigger
language plpgsql
as $$
begin
  new.updated_at := now();
  new.updated_by := auth.uid();
  return new;
end;
$$;

create trigger app_settings_touch
  before update on public.app_settings
  for each row execute function public.touch_app_settings();

-- ---------------------------------------------------------------------------
-- Audit log
-- ---------------------------------------------------------------------------

create table public.audit_log (
  id          bigint generated always as identity primary key,
  at          timestamptz not null default now(),
  actor       uuid default auth.uid(),
  action      text not null check (action in ('INSERT', 'UPDATE', 'DELETE')),
  table_name  text not null,
  record_id   text,
  old_data    jsonb,
  new_data    jsonb
);

create index audit_log_at_idx on public.audit_log(at desc);
create index audit_log_table_idx on public.audit_log(table_name, record_id);

create function public.audit_row_change()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  rec jsonb := case when tg_op = 'DELETE' then to_jsonb(old) else to_jsonb(new) end;
begin
  insert into public.audit_log (action, table_name, record_id, old_data, new_data)
  values (
    tg_op,
    tg_table_name,
    coalesce(rec ->> 'id', rec ->> 'key', concat_ws(':', rec ->> 'role_id', rec ->> 'permission_id')),
    case when tg_op in ('UPDATE', 'DELETE') then to_jsonb(old) end,
    case when tg_op in ('INSERT', 'UPDATE') then to_jsonb(new) end
  );
  return null;
end;
$$;

create trigger audit_roles            after insert or update or delete on public.roles            for each row execute function public.audit_row_change();
create trigger audit_role_permissions after insert or update or delete on public.role_permissions for each row execute function public.audit_row_change();
create trigger audit_profiles         after insert or update or delete on public.profiles         for each row execute function public.audit_row_change();
create trigger audit_app_settings     after insert or update or delete on public.app_settings     for each row execute function public.audit_row_change();

-- ---------------------------------------------------------------------------
-- Row Level Security
-- ---------------------------------------------------------------------------

alter table public.roles            enable row level security;
alter table public.permissions      enable row level security;
alter table public.role_permissions enable row level security;
alter table public.profiles         enable row level security;
alter table public.app_settings     enable row level security;
alter table public.audit_log        enable row level security;

-- Roles and permissions: readable by any signed-in user (the UI needs the labels),
-- editable only with roles.manage.
create policy roles_read   on public.roles for select to authenticated using (true);
create policy roles_write  on public.roles for all    to authenticated
  using (public.has_permission('roles.manage'))
  with check (public.has_permission('roles.manage'));

create policy permissions_read on public.permissions for select to authenticated using (true);

create policy role_permissions_read  on public.role_permissions for select to authenticated using (true);
create policy role_permissions_write on public.role_permissions for all    to authenticated
  using (public.has_permission('roles.manage'))
  with check (public.has_permission('roles.manage'));

-- System roles cannot be deleted.
create function public.protect_system_roles()
returns trigger
language plpgsql
as $$
begin
  if old.is_system then
    raise exception 'System role % cannot be deleted', old.code;
  end if;
  return old;
end;
$$;

create trigger roles_protect_system
  before delete on public.roles
  for each row execute function public.protect_system_roles();

-- Profiles: each user sees and edits their own; users.manage sees and edits all.
create policy profiles_read_own   on public.profiles for select to authenticated using (id = auth.uid());
create policy profiles_read_admin on public.profiles for select to authenticated using (public.has_permission('users.manage'));
create policy profiles_update_own on public.profiles for update to authenticated
  using (id = auth.uid()) with check (id = auth.uid());
create policy profiles_update_admin on public.profiles for update to authenticated
  using (public.has_permission('users.manage')) with check (public.has_permission('users.manage'));

-- Settings: readable by any signed-in user, editable with settings.manage.
create policy app_settings_read  on public.app_settings for select to authenticated using (true);
create policy app_settings_write on public.app_settings for all    to authenticated
  using (public.has_permission('settings.manage'))
  with check (public.has_permission('settings.manage'));

-- Audit log: written only by triggers, readable with audit.read.
create policy audit_log_read on public.audit_log for select to authenticated using (public.has_permission('audit.read'));

-- ---------------------------------------------------------------------------
-- Default data
-- ---------------------------------------------------------------------------

insert into public.roles (code, name_fr, name_ar, name_en, is_system) values
  ('admin',             'Administration',      'الإدارة',            'Administration',    true),
  ('doctor',            'Médecin',             'طبيب',               'Doctor',            true),
  ('nurse',             'Infirmier',           'ممرض',               'Nurse',             true),
  ('dentist',           'Chirurgien-dentiste', 'طبيب أسنان',         'Dentist',           true),
  ('psychologist',      'Psychologue',         'أخصائي نفساني',      'Psychologist',      true),
  ('social_worker',     'Assistant social',    'مساعد اجتماعي',      'Social worker',     true),
  ('contracted_doctor', 'Médecin conventionné','طبيب متعاقد',        'Contracted doctor', true);

insert into public.permissions (code, module, description, is_medical) values
  ('users.manage',          'administration', 'Create, activate and deactivate staff accounts',          false),
  ('roles.manage',          'administration', 'Edit roles and their permissions',                        false),
  ('settings.manage',       'administration', 'Edit application settings',                               false),
  ('audit.read',            'administration', 'Read the audit log',                                      false),
  ('beneficiaries.read',    'beneficiaries',  'View beneficiaries (identity and category)',              false),
  ('beneficiaries.write',   'beneficiaries',  'Create and edit beneficiaries',                           false),
  ('beneficiaries.import',  'beneficiaries',  'Import beneficiaries from an external source',            false),
  ('medical_records.read',  'clinical',       'View medical records (history, vaccinations, accidents)', true),
  ('medical_records.write', 'clinical',       'Edit medical records',                                    true),
  ('visits.read',           'clinical',       'View occupational health visits',                         true),
  ('visits.write',          'clinical',       'Record occupational health visits and fitness decisions', true),
  ('consultations.read',    'clinical',       'View general medicine consultations',                     true),
  ('consultations.write',   'clinical',       'Record consultations',                                    true),
  ('nursing.read',          'clinical',       'View nursing care',                                       true),
  ('nursing.write',         'clinical',       'Record nursing care',                                     true),
  ('dental.read',           'clinical',       'View dental records',                                     true),
  ('dental.write',          'clinical',       'Record dental care',                                      true),
  ('psychology.read',       'clinical',       'View psychology consultations',                           true),
  ('psychology.write',      'clinical',       'Record psychology consultations',                         true),
  ('documents.read',        'clinical',       'View issued medical documents',                           true),
  ('documents.issue',       'clinical',       'Issue prescriptions, certificates and referrals',         true),
  ('care_requests.create',  'care_requests',  'Create a care coverage request',                          false),
  ('care_requests.read',    'care_requests',  'View care coverage requests',                             false),
  ('care_requests.review',  'care_requests',  'Approve or refuse care coverage requests',                false),
  ('care_requests.verify',  'care_requests',  'Verify a care coverage QR code',                          false),
  ('appointments.read',     'appointments',   'View appointments',                                       false),
  ('appointments.write',    'appointments',   'Create and edit appointments',                            false),
  ('medicines.read',        'pharmacy',       'View the medicine stock',                                 false),
  ('medicines.write',       'pharmacy',       'Edit the medicine stock',                                 false),
  ('social_cases.read',     'social',         'View social support cases',                               false),
  ('social_cases.write',    'social',         'Edit social support cases',                               false),
  ('reports.read',          'reports',        'View aggregated activity reports (counts only)',          false);

-- Default matrix, following the usual separation of medical and administrative data.
-- It is a starting point: an administrator with roles.manage can change it at any time.
insert into public.role_permissions (role_id, permission_id)
select r.id, p.id
from (values
  ('admin', array[
    'users.manage','roles.manage','settings.manage','audit.read',
    'beneficiaries.read','beneficiaries.write','beneficiaries.import',
    'care_requests.create','care_requests.read','care_requests.review',
    'appointments.read','appointments.write','medicines.read','medicines.write','reports.read']),
  ('doctor', array[
    'beneficiaries.read','beneficiaries.write',
    'medical_records.read','medical_records.write','visits.read','visits.write',
    'consultations.read','consultations.write','nursing.read',
    'documents.read','documents.issue',
    'care_requests.create','care_requests.read',
    'appointments.read','appointments.write','medicines.read','reports.read']),
  ('nurse', array[
    'beneficiaries.read','medical_records.read','consultations.read',
    'nursing.read','nursing.write','documents.read',
    'appointments.read','appointments.write','medicines.read','medicines.write']),
  ('dentist', array[
    'beneficiaries.read','dental.read','dental.write','documents.read','documents.issue',
    'care_requests.create','care_requests.read','appointments.read','appointments.write','medicines.read']),
  ('psychologist', array[
    'beneficiaries.read','psychology.read','psychology.write','appointments.read','appointments.write']),
  ('social_worker', array[
    'beneficiaries.read','social_cases.read','social_cases.write',
    'care_requests.create','care_requests.read','appointments.read','reports.read']),
  ('contracted_doctor', array[
    'care_requests.verify'])
) as m(role_code, perms)
join public.roles r on r.code = m.role_code
join public.permissions p on p.code = any (m.perms);

insert into public.app_settings (key, value, description) values
  ('languages',                     '["fr", "ar", "en"]', 'Interface languages, in menu order'),
  ('default_language',              '"fr"',               'Language used before the user picks one'),
  ('report_child_max_age',          '15',                 'Age up to which a beneficiary is counted as "Enfant" in reports'),
  ('care_request_validity_days',    '30',                 'Days an approved care coverage stays valid'),
  ('care_request_single_use',       'true',               'An approved care coverage can be used once'),
  ('care_request_refusal_reasons',  '["Dossier incomplet", "Hors convention", "Prestation non couverte", "Autre"]',
                                                          'Reasons offered when refusing a request'),
  ('notification_channels',         '["in_app"]',         'Active notification channels (in_app, sms)');
