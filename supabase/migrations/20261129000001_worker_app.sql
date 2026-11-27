-- MedSuite: the workers' app (phase 5), a web app installed on the phone (PWA).
--
-- Accounts
--   * A worker (Agent SH, retiree, contracted company's worker) gets an account from an activation
--     code the staff give them (create_worker_invitation). The worker types their number
--     (matricule), the code and a password of their choice in the app; the Edge Function
--     worker-access checks the code (redeem_worker_invitation), creates the Auth user and links it
--     (complete_worker_invitation). The staff never know the password. A new code also resets a
--     forgotten password.
--   * Worker accounts are Auth users with an address <matricule>@worker.medsuite.local. They have no
--     staff profile and no permission: every staff table stays closed to them.
--
-- What a worker reaches, only through the functions below (no table is opened to them)
--   * Themselves and their dependents (ayants droit): names, number, category.
--   * Their family's care coverage requests, a new request (source 'app'), the coverage with its QR
--     code once approved.
--   * The active contracted doctors, their family's visit appointments, their notifications.
--   Nothing medical: no consultation, visit result, document or medical record.
--
-- Notifications: written by a trigger on every change of a request (made on their behalf,
-- approved, refused, used), shown in the app.

-- ---------------------------------------------------------------------------
-- Worker accounts and activation codes
-- ---------------------------------------------------------------------------

create table public.worker_accounts (
  user_id         uuid primary key references auth.users(id) on delete cascade,
  beneficiary_id  uuid not null unique references public.beneficiaries(id) on delete restrict,
  active          boolean not null default true,
  created_at      timestamptz not null default now(),
  last_seen_at    timestamptz
);

create table public.worker_invitations (
  id               uuid primary key default gen_random_uuid(),
  beneficiary_id   uuid not null references public.beneficiaries(id) on delete cascade,
  -- SHA-256 of the code: the code itself is shown once to the staff and never stored.
  code_hash        text not null check (code_hash ~ '^[0-9a-f]{64}$'),
  expires_at       timestamptz not null,
  used_at          timestamptz,
  attempts         smallint not null default 0,
  created_by       uuid default auth.uid(),
  created_by_name  text default public.current_staff_name(),
  created_at       timestamptz not null default now()
);

create index worker_invitations_beneficiary_idx on public.worker_invitations (beneficiary_id, created_at desc);

create trigger audit_worker_accounts after insert or update or delete on public.worker_accounts
  for each row execute function public.audit_row_change();
create trigger audit_worker_invitations after insert or update or delete on public.worker_invitations
  for each row execute function public.audit_row_change();

-- Staff profiles are created for staff accounts only.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if new.email like '%@worker.medsuite.local' then
    return new;
  end if;
  insert into public.profiles (id, staff_id, full_name)
  values (
    new.id,
    nullif(new.raw_user_meta_data ->> 'staff_id', ''),
    coalesce(new.raw_user_meta_data ->> 'full_name', '')
  );
  return new;
end;
$$;

-- Categories that can hold an account: the dependents are reached through their worker.
create function public.worker_eligible(p_category text)
returns boolean
language sql
immutable
as $$
  select p_category in ('agent', 'retraite', 'contractor_agent');
$$;

-- The beneficiary record of the signed-in worker, or null for anyone else.
create function public.worker_beneficiary()
returns uuid
language sql
stable
security definer
set search_path = public
as $$
  select a.beneficiary_id
    from public.worker_accounts a
    join public.beneficiaries b on b.id = a.beneficiary_id
   where a.user_id = auth.uid() and a.active and b.active;
$$;

-- The worker and their active dependents.
create function public.worker_family()
returns setof uuid
language sql
stable
security definer
set search_path = public
as $$
  select b.id
    from public.beneficiaries b
   where b.active
     and public.worker_beneficiary() is not null
     and (b.id = public.worker_beneficiary() or b.holder_id = public.worker_beneficiary());
$$;

-- Stops with "Not a worker account" when the caller is not a signed-in, active worker.
create function public.worker_require()
returns uuid
language plpgsql
stable
security definer
set search_path = public
as $$
declare
  v_id uuid := public.worker_beneficiary();
begin
  if v_id is null then
    raise exception 'Not a worker account' using errcode = '42501';
  end if;
  return v_id;
end;
$$;

-- A code of 10 characters without the ones that are easy to confuse (0/O, 1/I/L).
create function public.new_activation_code()
returns text
language plpgsql
volatile
as $$
declare
  v_alphabet constant text := 'ABCDEFGHJKMNPQRSTUVWXYZ23456789';
  v_bytes    bytea := uuid_send(gen_random_uuid()) || uuid_send(gen_random_uuid());
  v_code     text := '';
begin
  for i in 0..9 loop
    v_code := v_code || substr(v_alphabet, (get_byte(v_bytes, i) % length(v_alphabet)) + 1, 1);
  end loop;
  return v_code;
end;
$$;

create function public.activation_code_hash(p_code text)
returns text
language sql
immutable
as $$
  select encode(sha256(convert_to(upper(regexp_replace(coalesce(p_code, ''), '[\s-]', '', 'g')), 'UTF8')), 'hex');
$$;

-- Staff: a new activation code for a worker. Earlier unused codes stop working.
create function public.create_worker_invitation(p_beneficiary_id uuid)
returns table (code text, expires_at timestamptz, matricule text)
language plpgsql
volatile
security definer
set search_path = public
as $$
declare
  v_person public.beneficiaries;
  v_code   text := public.new_activation_code();
  v_until  timestamptz := now() + make_interval(days => greatest(public.setting_int('worker_invitation_days', 7), 1));
begin
  if not public.has_permission('worker_access.manage') then
    raise exception 'Not allowed to manage app access' using errcode = '42501';
  end if;
  select * into v_person from public.beneficiaries where id = p_beneficiary_id;
  if not found or not v_person.active then
    raise exception 'This beneficiary is not active' using errcode = '23514';
  end if;
  if not public.worker_eligible(v_person.category) then
    raise exception 'Only workers and retirees get an app account' using errcode = '23514';
  end if;
  if v_person.external_id is null then
    raise exception 'The beneficiary needs a number (matricule) to sign in' using errcode = '23514';
  end if;

  update public.worker_invitations w set expires_at = least(w.expires_at, now())
   where w.beneficiary_id = p_beneficiary_id and w.used_at is null and w.expires_at > now();

  insert into public.worker_invitations (beneficiary_id, code_hash, expires_at)
  values (p_beneficiary_id, public.activation_code_hash(v_code), v_until);

  return query select substr(v_code, 1, 5) || '-' || substr(v_code, 6, 5), v_until, v_person.external_id;
end;
$$;

-- Staff: whether a worker has an account, and the code waiting to be used.
create function public.worker_access_status(p_beneficiary_id uuid)
returns table (has_account boolean, active boolean, created_at timestamptz, last_seen_at timestamptz, pending_until timestamptz)
language plpgsql
stable
security definer
set search_path = public
as $$
begin
  if not public.has_permission('worker_access.manage') then
    raise exception 'Not allowed to manage app access' using errcode = '42501';
  end if;
  return query
  select a.user_id is not null,
         coalesce(a.active, false),
         a.created_at,
         a.last_seen_at,
         (select max(w.expires_at) from public.worker_invitations w
           where w.beneficiary_id = p_beneficiary_id and w.used_at is null and w.expires_at > now())
    from (select 1) one
    left join public.worker_accounts a on a.beneficiary_id = p_beneficiary_id;
end;
$$;

-- Staff: closes or reopens a worker's access.
create function public.set_worker_access(p_beneficiary_id uuid, p_active boolean)
returns void
language plpgsql
volatile
security definer
set search_path = public
as $$
begin
  if not public.has_permission('worker_access.manage') then
    raise exception 'Not allowed to manage app access' using errcode = '42501';
  end if;
  update public.worker_accounts set active = p_active where beneficiary_id = p_beneficiary_id;
  if not p_active then
    update public.worker_invitations w set expires_at = least(w.expires_at, now())
     where w.beneficiary_id = p_beneficiary_id and w.used_at is null;
  end if;
end;
$$;

-- Edge Function only: checks a code typed in the app. Returns no row when the number or the code
-- is wrong (without telling which), and five wrong codes close the code. It returns instead of
-- raising an error so that the count of wrong codes is kept.
create function public.redeem_worker_invitation(p_matricule text, p_code text)
returns table (invitation_id uuid, beneficiary_id uuid, user_id uuid, login text)
language plpgsql
volatile
security definer
set search_path = public
as $$
declare
  v_person     public.beneficiaries;
  v_invitation public.worker_invitations;
begin
  select * into v_person from public.beneficiaries b
   where lower(trim(b.external_id)) = lower(trim(p_matricule)) and b.active;
  if not found or not public.worker_eligible(v_person.category) then
    return;
  end if;

  select * into v_invitation from public.worker_invitations w
   where w.beneficiary_id = v_person.id and w.used_at is null and w.expires_at > now()
   order by w.created_at desc
   limit 1
   for update;
  if not found then
    return;
  end if;

  if v_invitation.code_hash <> public.activation_code_hash(p_code) then
    update public.worker_invitations w
       set attempts = w.attempts + 1,
           expires_at = case when w.attempts + 1 >= 5 then now() else w.expires_at end
     where w.id = v_invitation.id;
    return;
  end if;

  return query
  select v_invitation.id, v_person.id,
         (select a.user_id from public.worker_accounts a where a.beneficiary_id = v_person.id),
         lower(regexp_replace(trim(v_person.external_id), '[^A-Za-z0-9._-]', '-', 'g'));
end;
$$;

-- Edge Function only: links the Auth user to the worker and closes the code.
create function public.complete_worker_invitation(p_invitation_id uuid, p_user_id uuid)
returns void
language plpgsql
volatile
security definer
set search_path = public
as $$
declare
  v_beneficiary uuid;
begin
  update public.worker_invitations set used_at = now()
   where id = p_invitation_id and used_at is null
   returning beneficiary_id into v_beneficiary;
  if v_beneficiary is null then
    raise exception 'Invalid activation code' using errcode = 'P0002';
  end if;
  insert into public.worker_accounts (user_id, beneficiary_id)
  values (p_user_id, v_beneficiary)
  on conflict (beneficiary_id) do update set user_id = excluded.user_id, active = true;
end;
$$;

-- ---------------------------------------------------------------------------
-- Notifications
-- ---------------------------------------------------------------------------

create table public.notifications (
  id          bigint generated always as identity primary key,
  user_id     uuid not null references auth.users(id) on delete cascade,
  -- care_request_created | care_request_approved | care_request_refused | care_request_used
  kind        text not null check (kind ~ '^[a-z_]{3,60}$'),
  -- What the app needs to write the message in the reader's language: {number, request_id, …}
  data        jsonb not null default '{}'::jsonb check (jsonb_typeof(data) = 'object'),
  read_at     timestamptz,
  created_at  timestamptz not null default now()
);

create index notifications_user_idx on public.notifications (user_id, created_at desc);

-- On every change of a request, a notification for the worker it concerns (the dependent's
-- worker for a dependent).
create function public.notify_care_request()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user uuid;
  v_kind text;
begin
  if tg_op = 'INSERT' then
    v_kind := case when new.source = 'platform' then 'care_request_created' end;
  elsif new.status is distinct from old.status and new.status in ('approved', 'refused') then
    v_kind := 'care_request_' || new.status;
  elsif old.used_at is null and new.used_at is not null then
    v_kind := 'care_request_used';
  end if;
  if v_kind is null then
    return null;
  end if;

  select a.user_id into v_user
    from public.beneficiaries b
    join public.worker_accounts a on a.beneficiary_id = coalesce(b.holder_id, b.id) and a.active
   where b.id = new.beneficiary_id;
  if v_user is null then
    return null;
  end if;

  insert into public.notifications (user_id, kind, data)
  values (v_user, v_kind, jsonb_build_object(
    'request_id', new.id,
    'number', new.number,
    'prestation', new.prestation,
    'reason', new.refusal_reason,
    'valid_until', new.valid_until,
    'beneficiary', (select first_name from public.beneficiaries where id = new.beneficiary_id)));
  return null;
end;
$$;

create trigger care_requests_notify after insert or update on public.care_requests
  for each row execute function public.notify_care_request();

-- A request made in the app is signed with the worker's name instead of a staff name.
create or replace function public.prepare_care_request()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_year   smallint := extract(year from public.algiers_today());
  v_number integer;
begin
  if not exists (select 1 from public.contracted_doctors where id = new.contracted_doctor_id and active) then
    raise exception 'This contracted doctor is not active' using errcode = '23514';
  end if;
  if not exists (select 1 from public.beneficiaries where id = new.beneficiary_id and active) then
    raise exception 'This beneficiary is not active' using errcode = '23514';
  end if;

  insert into public.document_counters as c (doc_type, year, last_number)
  values ('care_request', v_year, 1)
  on conflict (doc_type, year) do update set last_number = c.last_number + 1
  returning last_number into v_number;

  new.number := 'PEC-' || v_year || '-' || lpad(v_number::text, 5, '0');
  new.prestation := trim(new.prestation);
  new.notes := nullif(trim(new.notes), '');
  new.status := 'pending';
  new.reviewed_at := null;
  new.reviewed_by := null;
  new.reviewer_name := null;
  new.refusal_reason := null;
  new.qr_token := null;
  new.valid_until := null;
  new.used_at := null;
  new.use_count := 0;
  new.created_at := now();
  new.created_by := coalesce(auth.uid(), new.created_by);
  if auth.uid() is not null then
    new.requester_name := coalesce(public.current_staff_name(), new.requester_name);
  end if;
  return new;
end;
$$;

-- ---------------------------------------------------------------------------
-- What the app calls (signed-in worker only)
-- ---------------------------------------------------------------------------

-- The worker and their dependents. Also records when the app was last used.
create function public.worker_me()
returns jsonb
language plpgsql
volatile
security definer
set search_path = public
as $$
declare
  v_me uuid := public.worker_require();
begin
  update public.worker_accounts set last_seen_at = now() where user_id = auth.uid();
  return jsonb_build_object(
    'me', (select jsonb_build_object('id', id, 'external_id', external_id, 'last_name', last_name,
                                     'first_name', first_name, 'category', category)
             from public.beneficiaries where id = v_me),
    'family', coalesce((select jsonb_agg(jsonb_build_object('id', id, 'last_name', last_name, 'first_name', first_name,
                                                            'relationship', relationship, 'birth_date', birth_date)
                                         order by birth_date nulls last)
                          from public.beneficiaries where holder_id = v_me and active), '[]'::jsonb));
end;
$$;

-- The family's requests, newest first. The QR token comes with approved requests only.
create function public.worker_care_requests()
returns table (
  id uuid, number text, beneficiary_id uuid, beneficiary_name text, prestation text, notes text, source text,
  status text, state text, refusal_reason text, created_at timestamptz, reviewed_at timestamptz,
  valid_until date, used_at timestamptz, qr_token text,
  doctor_name text, doctor_specialty text, doctor_address text, doctor_phone text)
language plpgsql
stable
security definer
set search_path = public
as $$
begin
  perform public.worker_require();
  return query
  select r.id, r.number, r.beneficiary_id, b.first_name || ' ' || b.last_name, r.prestation, r.notes, r.source,
         r.status, public.care_request_state(r), r.refusal_reason, r.created_at, r.reviewed_at,
         r.valid_until, r.used_at, case when r.status = 'approved' then r.qr_token end,
         d.full_name, d.specialty, d.address, d.phone
    from public.care_requests r
    join public.beneficiaries b on b.id = r.beneficiary_id
    join public.contracted_doctors d on d.id = r.contracted_doctor_id
   where r.beneficiary_id in (select public.worker_family())
   order by r.created_at desc
   limit 200;
end;
$$;

-- A new request from the app, for the worker or one of their dependents.
create function public.worker_create_care_request(p_beneficiary_id uuid, p_doctor_id uuid, p_prestation text, p_notes text default null)
returns table (id uuid, number text)
language plpgsql
volatile
security definer
set search_path = public
as $$
declare
  v_name text;
begin
  perform public.worker_require();
  if p_beneficiary_id not in (select public.worker_family()) then
    raise exception 'This person is not in your family' using errcode = '42501';
  end if;
  if length(trim(coalesce(p_prestation, ''))) < 2 then
    raise exception 'The service requested is missing' using errcode = '23514';
  end if;
  select b.first_name || ' ' || b.last_name into v_name from public.beneficiaries b where b.id = public.worker_beneficiary();

  return query
  insert into public.care_requests as r (beneficiary_id, contracted_doctor_id, prestation, notes, source, requester_name)
  values (p_beneficiary_id, p_doctor_id, left(p_prestation, 200), left(p_notes, 1000), 'app', left('Application · ' || v_name, 200))
  returning r.id, r.number;
end;
$$;

-- Trouver un médecin: the active contracted doctors.
create function public.worker_doctors()
returns table (id uuid, full_name text, specialty text, address text, phone text)
language plpgsql
stable
security definer
set search_path = public
as $$
begin
  perform public.worker_require();
  return query
  select d.id, d.full_name, d.specialty, d.address, d.phone
    from public.contracted_doctors d
   where d.active
   order by d.specialty, d.full_name;
end;
$$;

-- Rendez-vous: the family's visit appointments still to come or missed, and the last done ones.
create function public.worker_appointments()
returns table (id uuid, beneficiary_name text, visit_type text, scheduled_on date, status text)
language plpgsql
stable
security definer
set search_path = public
as $$
begin
  perform public.worker_require();
  return query
  select a.id, b.first_name || ' ' || b.last_name, a.visit_type, a.scheduled_on, a.status
    from public.visit_appointments a
    join public.beneficiaries b on b.id = a.beneficiary_id
   where a.beneficiary_id in (select public.worker_family())
     and a.status <> 'cancelled'
     and (a.status in ('scheduled', 'missed') or a.scheduled_on >= public.algiers_today() - 180)
   order by (a.status in ('scheduled', 'missed')) desc, a.scheduled_on
   limit 100;
end;
$$;

create function public.worker_notifications()
returns table (id bigint, kind text, data jsonb, read_at timestamptz, created_at timestamptz)
language plpgsql
stable
security definer
set search_path = public
as $$
begin
  perform public.worker_require();
  return query
  select n.id, n.kind, n.data, n.read_at, n.created_at
    from public.notifications n
   where n.user_id = auth.uid()
   order by n.created_at desc
   limit 100;
end;
$$;

create function public.worker_read_notifications()
returns void
language plpgsql
volatile
security definer
set search_path = public
as $$
begin
  perform public.worker_require();
  update public.notifications set read_at = now() where user_id = auth.uid() and read_at is null;
end;
$$;

-- ---------------------------------------------------------------------------
-- Rights, settings and API privileges
-- ---------------------------------------------------------------------------

alter table public.worker_accounts enable row level security;
alter table public.worker_invitations enable row level security;
alter table public.notifications enable row level security;

insert into public.permissions (code, module, description, is_medical) values
  ('worker_access.manage', 'beneficiaries', 'Give workers access to the app (activation codes)', false)
on conflict (code) do nothing;

insert into public.role_permissions (role_id, permission_id)
select r.id, p.id
  from public.roles r, public.permissions p
 where r.code in ('admin', 'social_worker') and p.code = 'worker_access.manage'
on conflict do nothing;

insert into public.app_settings (key, value, description) values
  ('worker_invitation_days', '7', 'Days an app activation code stays valid'),
  ('worker_contacts', '[]', 'Contacts shown in the workers'' app: [{"label": "…", "phone": "…", "hours": "…"}]')
on conflict (key) do nothing;

-- No table is opened to the API: workers and staff go through the functions.
revoke all on public.worker_accounts, public.worker_invitations, public.notifications from anon, authenticated;

revoke execute on function public.worker_eligible(text) from public, anon, authenticated;
revoke execute on function public.worker_beneficiary() from public, anon, authenticated;
revoke execute on function public.worker_family() from public, anon, authenticated;
revoke execute on function public.worker_require() from public, anon, authenticated;
revoke execute on function public.new_activation_code() from public, anon, authenticated;
revoke execute on function public.activation_code_hash(text) from public, anon, authenticated;
revoke execute on function public.notify_care_request() from public, anon, authenticated;
revoke execute on function public.prepare_care_request() from public, anon, authenticated;

revoke execute on function public.create_worker_invitation(uuid) from public, anon;
revoke execute on function public.worker_access_status(uuid) from public, anon;
revoke execute on function public.set_worker_access(uuid, boolean) from public, anon;
grant execute on function public.create_worker_invitation(uuid) to authenticated;
grant execute on function public.worker_access_status(uuid) to authenticated;
grant execute on function public.set_worker_access(uuid, boolean) to authenticated;

-- Reached only by the Edge Function, with the secret key.
revoke execute on function public.redeem_worker_invitation(text, text) from public, anon, authenticated;
revoke execute on function public.complete_worker_invitation(uuid, uuid) from public, anon, authenticated;
grant execute on function public.redeem_worker_invitation(text, text) to service_role;
grant execute on function public.complete_worker_invitation(uuid, uuid) to service_role;

revoke execute on function public.worker_me() from public, anon;
revoke execute on function public.worker_care_requests() from public, anon;
revoke execute on function public.worker_create_care_request(uuid, uuid, text, text) from public, anon;
revoke execute on function public.worker_doctors() from public, anon;
revoke execute on function public.worker_appointments() from public, anon;
revoke execute on function public.worker_notifications() from public, anon;
revoke execute on function public.worker_read_notifications() from public, anon;
grant execute on function public.worker_me() to authenticated;
grant execute on function public.worker_care_requests() to authenticated;
grant execute on function public.worker_create_care_request(uuid, uuid, text, text) to authenticated;
grant execute on function public.worker_doctors() to authenticated;
grant execute on function public.worker_appointments() to authenticated;
grant execute on function public.worker_notifications() to authenticated;
grant execute on function public.worker_read_notifications() to authenticated;
