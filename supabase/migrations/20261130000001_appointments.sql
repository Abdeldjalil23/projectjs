-- MedSuite: appointments with a doctor, a day and a time (the `appointments` table of the plan).
--
-- Visits of occupational medicine keep their own schedule (visit_appointments, a day per person).
-- These appointments are for the consultations of the centre: general medicine, dental care,
-- psychology and nursing, with the doctor and the time.
--
--   * The staff (appointments.write) book an appointment directly, or schedule one a worker asked
--     for in the app (status requested → scheduled, with the time and the doctor).
--   * A doctor cannot have two appointments at the same time.
--   * The worker sees the family's appointments in the app, asks for one (preferred day and part
--     of the day, no medical detail) and can cancel one that has not taken place.
--   * The worker is notified when an appointment is booked, moved or cancelled by the centre.
--   * States: requested, scheduled, done, missed, cancelled. Nothing is deleted.

create table public.appointments (
  id                uuid primary key default gen_random_uuid(),
  beneficiary_id    uuid not null references public.beneficiaries(id) on delete restrict,
  service           text not null check (service in ('general', 'dental', 'psychology', 'nursing')),
  status            text not null default 'scheduled' check (status in ('requested', 'scheduled', 'done', 'missed', 'cancelled')),
  -- Asked for in the app: the day and the part of the day the worker prefers.
  preferred_date    date,
  preferred_slot    text check (preferred_slot in ('morning', 'afternoon')),
  -- Set when the appointment is booked.
  starts_at         timestamptz,
  duration_minutes  smallint not null default 20 check (duration_minutes between 5 and 240),
  staff_id          uuid references public.profiles(id) on delete set null,
  staff_name        text check (length(staff_name) <= 200),
  -- Why, in administrative words (« Contrôle », « Détartrage »…); no diagnosis.
  reason            text check (reason is null or length(reason) <= 300),
  notes             text check (notes is null or length(notes) <= 1000),
  cancel_reason     text check (cancel_reason is null or length(cancel_reason) <= 300),
  source            text not null default 'platform' check (source in ('platform', 'app')),
  created_at        timestamptz not null default now(),
  created_by        uuid default auth.uid(),
  updated_at        timestamptz not null default now(),
  updated_by        uuid default auth.uid(),
  check (status in ('requested', 'cancelled') or starts_at is not null)
);

create index appointments_starts_idx on public.appointments (starts_at);
create index appointments_status_idx on public.appointments (status, created_at);
create index appointments_beneficiary_idx on public.appointments (beneficiary_id, starts_at desc);
create index appointments_staff_idx on public.appointments (staff_id, starts_at);

-- Fills the doctor's name and refuses a time the doctor already has.
create function public.prepare_appointment()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_staff_changed boolean;
begin
  if tg_op = 'INSERT' then
    new.created_at := now();
    new.created_by := coalesce(auth.uid(), new.created_by);
    v_staff_changed := true;
  else
    v_staff_changed := new.staff_id is distinct from old.staff_id;
  end if;
  new.updated_at := now();
  new.updated_by := coalesce(auth.uid(), new.updated_by);
  new.reason := nullif(trim(new.reason), '');
  new.notes := nullif(trim(new.notes), '');

  if v_staff_changed or new.staff_name is null then
    new.staff_name := (select nullif(trim(full_name), '') from public.profiles where id = new.staff_id);
  end if;

  if new.status = 'scheduled' and new.starts_at is null then
    raise exception 'A scheduled appointment needs a day and a time' using errcode = '23514';
  end if;

  if new.status = 'scheduled' and new.staff_id is not null and exists (
    select 1 from public.appointments a
     where a.staff_id = new.staff_id
       and a.id <> new.id
       and a.status = 'scheduled'
       and a.starts_at < new.starts_at + make_interval(mins => new.duration_minutes)
       and a.starts_at + make_interval(mins => a.duration_minutes) > new.starts_at
  ) then
    raise exception 'This doctor already has an appointment at that time' using errcode = '23P01';
  end if;
  return new;
end;
$$;

create trigger appointments_prepare before insert or update on public.appointments
  for each row execute function public.prepare_appointment();
create trigger audit_appointments after insert or update or delete on public.appointments
  for each row execute function public.audit_row_change();

-- A notification for the worker of a beneficiary (the dependent's worker for a dependent).
create function public.notify_worker(p_beneficiary_id uuid, p_kind text, p_data jsonb)
returns void
language sql
volatile
security definer
set search_path = public
as $$
  insert into public.notifications (user_id, kind, data)
  select a.user_id, p_kind, p_data || jsonb_build_object('beneficiary', b.first_name)
    from public.beneficiaries b
    join public.worker_accounts a on a.beneficiary_id = coalesce(b.holder_id, b.id) and a.active
   where b.id = p_beneficiary_id;
$$;

-- Booked, moved or cancelled by the centre: the worker is told. Their own cancellation is not.
create function public.notify_appointment()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_kind text;
begin
  if tg_op = 'INSERT' then
    if new.status = 'scheduled' then
      v_kind := 'appointment_scheduled';
    end if;
  elsif new.status = 'scheduled' and old.status <> 'scheduled' then
    v_kind := 'appointment_scheduled';
  elsif new.status = 'scheduled' and new.starts_at is distinct from old.starts_at then
    v_kind := 'appointment_moved';
  elsif new.status = 'cancelled' and old.status in ('requested', 'scheduled') and public.worker_beneficiary() is null then
    v_kind := 'appointment_cancelled';
  end if;
  if v_kind is null then
    return null;
  end if;

  perform public.notify_worker(new.beneficiary_id, v_kind, jsonb_build_object(
    'appointment_id', new.id,
    'service', new.service,
    'starts_at', new.starts_at,
    'staff', new.staff_name,
    'reason', new.cancel_reason));
  return null;
end;
$$;

create trigger appointments_notify after insert or update on public.appointments
  for each row execute function public.notify_appointment();

-- Staff who can see a service's patients: the doctors an appointment can be booked with.
create function public.appointment_staff(p_service text)
returns table (id uuid, full_name text, role_code text)
language plpgsql
stable
security definer
set search_path = public
as $$
begin
  if not (public.has_permission('appointments.read') or public.has_permission('appointments.write')) then
    raise exception 'Not allowed' using errcode = '42501';
  end if;
  return query
  select p.id, p.full_name, r.code
    from public.profiles p
    join public.roles r on r.id = p.role_id
   where p.active
     and coalesce(trim(p.full_name), '') <> ''
     and exists (
       select 1 from public.role_permissions rp
         join public.permissions perm on perm.id = rp.permission_id
        where rp.role_id = p.role_id
          and perm.code = case p_service
                            when 'general' then 'consultations.write'
                            when 'dental' then 'dental.write'
                            when 'psychology' then 'psychology.write'
                            when 'nursing' then 'nursing.write'
                          end)
   order by p.full_name;
end;
$$;

-- ---------------------------------------------------------------------------
-- The workers' app
-- ---------------------------------------------------------------------------

-- The family's appointments: visits of occupational medicine and consultations, those to come
-- or waiting first. The first five columns are those of the earlier version of this function.
drop function public.worker_appointments();

create function public.worker_appointments()
returns table (
  id uuid, beneficiary_name text, visit_type text, scheduled_on date, status text,
  kind text, service text, starts_at timestamptz, preferred_date date, preferred_slot text,
  staff_name text, reason text, cancel_reason text, can_cancel boolean)
language plpgsql
stable
security definer
set search_path = public
as $$
begin
  perform public.worker_require();
  return query
  select * from (
    select v.id, b.first_name || ' ' || b.last_name, v.visit_type, v.scheduled_on, v.status,
           'visit'::text, null::text, null::timestamptz, null::date, null::text,
           null::text, null::text, null::text, false
      from public.visit_appointments v
      join public.beneficiaries b on b.id = v.beneficiary_id
     where v.beneficiary_id in (select public.worker_family())
       and v.status <> 'cancelled'
       and (v.status in ('scheduled', 'missed') or v.scheduled_on >= public.algiers_today() - 180)
    union all
    select a.id, b.first_name || ' ' || b.last_name, null, coalesce((a.starts_at at time zone 'Africa/Algiers')::date, a.preferred_date), a.status,
           'consultation', a.service, a.starts_at, a.preferred_date, a.preferred_slot,
           a.staff_name, a.reason, a.cancel_reason,
           a.status = 'requested' or (a.status = 'scheduled' and a.starts_at > now())
      from public.appointments a
      join public.beneficiaries b on b.id = a.beneficiary_id
     where a.beneficiary_id in (select public.worker_family())
       and (a.status in ('requested', 'scheduled')
            or coalesce(a.starts_at, a.updated_at) >= now() - interval '180 days')
  ) x
  order by (x.status in ('requested', 'scheduled', 'missed')) desc, x.scheduled_on nulls last
  limit 100;
end;
$$;

-- The worker asks for an appointment: who, which service, the preferred day and part of the day.
create function public.worker_request_appointment(
  p_beneficiary_id uuid, p_service text, p_preferred_date date, p_slot text default null, p_reason text default null)
returns uuid
language plpgsql
volatile
security definer
set search_path = public
as $$
declare
  v_id uuid;
begin
  perform public.worker_require();
  if p_beneficiary_id not in (select public.worker_family()) then
    raise exception 'This person is not in your family' using errcode = '42501';
  end if;
  if p_service not in ('general', 'dental', 'psychology', 'nursing') then
    raise exception 'Unknown service' using errcode = '23514';
  end if;
  if p_preferred_date is null or p_preferred_date < public.algiers_today() or p_preferred_date > public.algiers_today() + 90 then
    raise exception 'Choose a day within the next 90 days' using errcode = '23514';
  end if;
  if (select count(*) from public.appointments a
       where a.beneficiary_id in (select public.worker_family()) and a.status = 'requested') >= 3 then
    raise exception 'Too many requests waiting' using errcode = '23514';
  end if;

  insert into public.appointments (beneficiary_id, service, status, preferred_date, preferred_slot, reason, source)
  values (p_beneficiary_id, p_service, 'requested', p_preferred_date,
          case when p_slot in ('morning', 'afternoon') then p_slot end, left(p_reason, 300), 'app')
  returning appointments.id into v_id;
  return v_id;
end;
$$;

-- The worker cancels a request or an appointment that has not taken place.
create function public.worker_cancel_appointment(p_id uuid)
returns void
language plpgsql
volatile
security definer
set search_path = public
as $$
begin
  perform public.worker_require();
  update public.appointments a
     set status = 'cancelled', cancel_reason = 'Annulé par le travailleur'
   where a.id = p_id
     and a.beneficiary_id in (select public.worker_family())
     and (a.status = 'requested' or (a.status = 'scheduled' and a.starts_at > now()));
  if not found then
    raise exception 'This appointment cannot be cancelled' using errcode = '55000';
  end if;
end;
$$;

-- ---------------------------------------------------------------------------
-- Row Level Security and API privileges
-- ---------------------------------------------------------------------------

alter table public.appointments enable row level security;

create policy appointments_read on public.appointments
  for select to authenticated using (public.has_permission('appointments.read'));
create policy appointments_insert on public.appointments
  for insert to authenticated with check (public.has_permission('appointments.write'));
create policy appointments_update on public.appointments
  for update to authenticated
  using (public.has_permission('appointments.write'))
  with check (public.has_permission('appointments.write'));

-- Appointments are cancelled, never deleted.
revoke all on public.appointments from anon, authenticated;
grant select, insert, update on public.appointments to authenticated;

revoke execute on function public.prepare_appointment() from public, anon, authenticated;
revoke execute on function public.notify_worker(uuid, text, jsonb) from public, anon, authenticated;
revoke execute on function public.notify_appointment() from public, anon, authenticated;
revoke execute on function public.appointment_staff(text) from public, anon;
grant execute on function public.appointment_staff(text) to authenticated;

revoke execute on function public.worker_appointments() from public, anon;
revoke execute on function public.worker_request_appointment(uuid, text, date, text, text) from public, anon;
revoke execute on function public.worker_cancel_appointment(uuid) from public, anon;
grant execute on function public.worker_appointments() to authenticated;
grant execute on function public.worker_request_appointment(uuid, text, date, text, text) to authenticated;
grant execute on function public.worker_cancel_appointment(uuid) to authenticated;
