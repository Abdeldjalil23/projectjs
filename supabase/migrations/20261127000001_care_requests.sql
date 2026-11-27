-- MedSuite: care coverage requests (Prise en charge) and the contracted doctors they are sent to.
--
-- The path of a request, as the staff explained it:
--   1. A request is made for a beneficiary, to a contracted doctor: from the platform on the
--      worker's behalf now, from the worker's app later (phase 5). State: pending.
--   2. The administration reviews it: approved, or refused with a reason.
--   3. An approved request gets a QR code that carries only a long random token (no name, no
--      number, no diagnosis) and is valid for a number of days (setting
--      care_request_validity_days).
--   4. The contracted doctor scans the code: a public page shows whether the coverage is valid,
--      without any medical information, and records its use. An approved request that was not
--      used in time is expired.
--   States: pending → approved / refused; approved → used / expired. "expired" is not stored:
--   it is worked out from valid_until, so it is always right without a scheduled job.
--
-- Rules
--   * Requests are read with care_requests.read, made with care_requests.create and reviewed with
--     care_requests.review. Contracted doctors are managed with contracted_doctors.manage.
--   * A request is never edited or deleted from the app: its review and its use go through the
--     functions below, which check the state, and every change is written to the audit log.
--   * The verification functions are the only ones open to visitors who are not signed in. They
--     need the token printed on the coverage, and return no medical information.

-- ---------------------------------------------------------------------------
-- Contracted doctors (État récapitulatif des médecins vacataires)
-- ---------------------------------------------------------------------------

create table public.contracted_doctors (
  id          uuid primary key default gen_random_uuid(),
  full_name   text not null check (length(trim(full_name)) between 2 and 150),
  specialty   text not null check (length(trim(specialty)) between 2 and 100),
  address     text check (address is null or length(address) <= 300),
  phone       text check (phone is null or length(phone) <= 30),
  notes       text check (notes is null or length(notes) <= 1000),
  active      boolean not null default true,
  created_at  timestamptz not null default now(),
  created_by  uuid default auth.uid(),
  updated_at  timestamptz not null default now(),
  updated_by  uuid default auth.uid()
);

create index contracted_doctors_name_idx on public.contracted_doctors (lower(full_name));

create trigger contracted_doctors_touch before update on public.contracted_doctors
  for each row execute function public.touch_row();
create trigger audit_contracted_doctors after insert or update or delete on public.contracted_doctors
  for each row execute function public.audit_row_change();

-- ---------------------------------------------------------------------------
-- Care coverage requests
-- ---------------------------------------------------------------------------

create table public.care_requests (
  id                    uuid primary key default gen_random_uuid(),
  -- PEC-2026-00001, given by the server.
  number                text not null unique,
  beneficiary_id        uuid not null references public.beneficiaries(id) on delete restrict,
  contracted_doctor_id  uuid not null references public.contracted_doctors(id) on delete restrict,
  -- The service asked for, in administrative words (« Consultation spécialisée », « Bilan
  -- sanguin »…). No diagnosis: the administration reads it.
  prestation            text not null check (length(trim(prestation)) between 2 and 200),
  notes                 text check (notes is null or length(notes) <= 1000),
  -- platform: made by the staff on the worker's behalf; app: sent from the worker's app.
  source                text not null default 'platform' check (source in ('platform', 'app')),
  status                text not null default 'pending' check (status in ('pending', 'approved', 'refused')),
  requester_name        text default public.current_staff_name() check (length(requester_name) <= 200),
  reviewed_at           timestamptz,
  reviewed_by           uuid,
  reviewer_name         text check (length(reviewer_name) <= 200),
  refusal_reason        text check (refusal_reason is null or length(trim(refusal_reason)) between 3 and 500),
  -- Set on approval: the token in the QR code and the last day the coverage can be used.
  qr_token              text unique check (qr_token is null or qr_token ~ '^[0-9a-f]{64}$'),
  valid_until           date,
  used_at               timestamptz,
  use_count             integer not null default 0 check (use_count >= 0),
  created_at            timestamptz not null default now(),
  created_by            uuid default auth.uid(),
  check ((status = 'refused') = (refusal_reason is not null)),
  check ((status = 'approved') = (qr_token is not null and valid_until is not null)),
  check ((status = 'pending') = (reviewed_at is null)),
  check (used_at is null or status = 'approved')
);

create index care_requests_status_idx on public.care_requests (status, created_at desc);
create index care_requests_beneficiary_idx on public.care_requests (beneficiary_id, created_at desc);
create index care_requests_doctor_idx on public.care_requests (contracted_doctor_id, used_at);

comment on column public.care_requests.qr_token is 'Random token printed as a QR code; carries no information by itself';

-- Today in Algeria's time: the centre's days, not the server's.
create function public.algiers_today()
returns date
language sql
stable
as $$
  select (now() at time zone 'Africa/Algiers')::date;
$$;

-- Number of a value of the settings, or the fallback when it is missing or not a number.
create function public.setting_int(p_key text, p_fallback integer)
returns integer
language sql
stable
security definer
set search_path = public
as $$
  select coalesce(
    (select case when jsonb_typeof(value) = 'number' then (value #>> '{}')::integer end
       from public.app_settings where key = p_key),
    p_fallback);
$$;

create function public.setting_bool(p_key text, p_fallback boolean)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select coalesce(
    (select case when jsonb_typeof(value) = 'boolean' then (value #>> '{}')::boolean end
       from public.app_settings where key = p_key),
    p_fallback);
$$;

-- A new request: the server gives the number and starts it as pending, whatever was sent.
create function public.prepare_care_request()
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

  -- Same numbering as the medical documents: one counter per year, without gaps.
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
    new.requester_name := public.current_staff_name();
  end if;
  return new;
end;
$$;

create trigger care_requests_prepare before insert on public.care_requests
  for each row execute function public.prepare_care_request();

create trigger audit_care_requests after insert or update or delete on public.care_requests
  for each row execute function public.audit_row_change();

-- ---------------------------------------------------------------------------
-- Review: approve or refuse a pending request
-- ---------------------------------------------------------------------------

create function public.review_care_request(p_id uuid, p_approve boolean, p_reason text default null)
returns public.care_requests
language plpgsql
security definer
set search_path = public
as $$
declare
  v_request public.care_requests;
  v_reason  text := nullif(trim(p_reason), '');
begin
  if not public.has_permission('care_requests.review') then
    raise exception 'Not allowed to review care requests' using errcode = '42501';
  end if;

  select * into v_request from public.care_requests where id = p_id for update;
  if not found then
    raise exception 'Care request not found' using errcode = 'P0002';
  end if;
  if v_request.status <> 'pending' then
    raise exception 'This care request has already been reviewed' using errcode = '55000';
  end if;

  if p_approve then
    update public.care_requests
       set status = 'approved',
           reviewed_at = now(),
           reviewed_by = auth.uid(),
           reviewer_name = public.current_staff_name(),
           -- 64 hexadecimal characters from two random UUIDs: 244 random bits, impossible to guess.
           qr_token = replace(gen_random_uuid()::text || gen_random_uuid()::text, '-', ''),
           valid_until = public.algiers_today() + greatest(public.setting_int('care_request_validity_days', 30), 1)
     where id = p_id
     returning * into v_request;
  else
    if v_reason is null or length(v_reason) < 3 then
      raise exception 'A reason is needed to refuse a care request' using errcode = '23514';
    end if;
    update public.care_requests
       set status = 'refused',
           reviewed_at = now(),
           reviewed_by = auth.uid(),
           reviewer_name = public.current_staff_name(),
           refusal_reason = left(v_reason, 500)
     where id = p_id
     returning * into v_request;
  end if;

  return v_request;
end;
$$;

-- ---------------------------------------------------------------------------
-- Verification by the contracted doctor (public, with the token of the QR code)
-- ---------------------------------------------------------------------------

-- State of a request as people see it: pending, refused, approved (still valid), used, expired.
create function public.care_request_state(p_request public.care_requests)
returns text
language sql
stable
set search_path = public
as $$
  select case
    when p_request.status <> 'approved' then p_request.status
    when p_request.used_at is not null and public.setting_bool('care_request_single_use', true) then 'used'
    when p_request.valid_until < public.algiers_today() then 'expired'
    else 'approved'
  end;
$$;

-- What the verification page shows: validity, who the coverage is for (to compare with an
-- identity document) and which doctor it is addressed to. Nothing medical, not even the
-- prestation. An unknown token returns no row.
create function public.verify_care_request(p_token text)
returns table (
  number             text,
  state              text,
  beneficiary_name   text,
  beneficiary_number text,
  doctor_name        text,
  doctor_specialty   text,
  valid_until        date,
  used_at            timestamptz,
  use_count          integer
)
language sql
stable
security definer
set search_path = public
as $$
  select r.number,
         public.care_request_state(r),
         b.last_name || ' ' || b.first_name,
         b.external_id,
         d.full_name,
         d.specialty,
         r.valid_until,
         r.used_at,
         r.use_count
    from public.care_requests r
    join public.beneficiaries b on b.id = r.beneficiary_id
    join public.contracted_doctors d on d.id = r.contracted_doctor_id
   where r.status = 'approved'
     and p_token ~ '^[0-9a-f]{64}$'
     and r.qr_token = p_token;
$$;

-- The contracted doctor confirms the coverage is used. Allowed while it is valid; once only when
-- the setting care_request_single_use is on (the default).
create function public.use_care_request(p_token text)
returns table (
  number             text,
  state              text,
  beneficiary_name   text,
  beneficiary_number text,
  doctor_name        text,
  doctor_specialty   text,
  valid_until        date,
  used_at            timestamptz,
  use_count          integer
)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_request public.care_requests;
  v_state   text;
begin
  if p_token is null or p_token !~ '^[0-9a-f]{64}$' then
    raise exception 'Unknown care coverage' using errcode = 'P0002';
  end if;

  select * into v_request from public.care_requests r
   where r.qr_token = p_token and r.status = 'approved'
   for update;
  if not found then
    raise exception 'Unknown care coverage' using errcode = 'P0002';
  end if;

  v_state := public.care_request_state(v_request);
  if v_state = 'used' then
    raise exception 'This care coverage has already been used' using errcode = '55000';
  end if;
  if v_state = 'expired' then
    raise exception 'This care coverage has expired' using errcode = '55000';
  end if;

  update public.care_requests r
     set used_at = coalesce(r.used_at, now()),
         use_count = r.use_count + 1
   where r.id = v_request.id;

  return query select * from public.verify_care_request(p_token);
end;
$$;

-- ---------------------------------------------------------------------------
-- Row Level Security
-- ---------------------------------------------------------------------------

alter table public.contracted_doctors enable row level security;
alter table public.care_requests enable row level security;

-- Doctors are listed for whoever makes, reads or manages requests.
create policy contracted_doctors_read on public.contracted_doctors
  for select to authenticated
  using (public.has_permission('care_requests.read')
         or public.has_permission('care_requests.create')
         or public.has_permission('contracted_doctors.manage'));
create policy contracted_doctors_insert on public.contracted_doctors
  for insert to authenticated with check (public.has_permission('contracted_doctors.manage'));
create policy contracted_doctors_update on public.contracted_doctors
  for update to authenticated
  using (public.has_permission('contracted_doctors.manage'))
  with check (public.has_permission('contracted_doctors.manage'));

create policy care_requests_read on public.care_requests
  for select to authenticated using (public.has_permission('care_requests.read'));
create policy care_requests_insert on public.care_requests
  for insert to authenticated with check (public.has_permission('care_requests.create'));

-- ---------------------------------------------------------------------------
-- Permission and default rights
-- ---------------------------------------------------------------------------

insert into public.permissions (code, module, description, is_medical) values
  ('contracted_doctors.manage', 'care_requests', 'Add and edit contracted doctors', false)
on conflict (code) do nothing;

insert into public.role_permissions (role_id, permission_id)
select r.id, p.id
  from public.roles r, public.permissions p
 where r.code = 'admin' and p.code = 'contracted_doctors.manage'
on conflict do nothing;

-- ---------------------------------------------------------------------------
-- API privileges
-- ---------------------------------------------------------------------------

-- Nothing for visitors; requests are only inserted (with the fields a requester fills in) and read.
revoke all on public.contracted_doctors, public.care_requests from anon, authenticated;
grant select, insert, update on public.contracted_doctors to authenticated;
grant select on public.care_requests to authenticated;
grant insert (beneficiary_id, contracted_doctor_id, prestation, notes) on public.care_requests to authenticated;

revoke execute on function public.algiers_today() from public, anon;
grant execute on function public.algiers_today() to authenticated;
-- The settings are readable by every signed-in user anyway; the state of a request needs them.
revoke execute on function public.setting_int(text, integer) from public, anon;
revoke execute on function public.setting_bool(text, boolean) from public, anon;
grant execute on function public.setting_int(text, integer) to authenticated;
grant execute on function public.setting_bool(text, boolean) to authenticated;
revoke execute on function public.prepare_care_request() from public, anon, authenticated;
revoke execute on function public.care_request_state(public.care_requests) from public, anon;
grant execute on function public.care_request_state(public.care_requests) to authenticated;

revoke execute on function public.review_care_request(uuid, boolean, text) from public, anon;
grant execute on function public.review_care_request(uuid, boolean, text) to authenticated;

-- The two functions behind the QR code: open to the verification page without an account.
revoke execute on function public.verify_care_request(text) from public;
revoke execute on function public.use_care_request(text) from public;
grant execute on function public.verify_care_request(text) to anon, authenticated;
grant execute on function public.use_care_request(text) to anon, authenticated;
