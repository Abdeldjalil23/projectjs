-- MedSuite: occupational health visits (Visite médicale d'embauche, périodique, de reprise…)
-- and the schedule of the visits to come.
--
-- * visits holds what the doctor records: measurements, vision and hearing, questions and
--   examination of each system, explorations, orientation and the fitness decision. It is
--   covered by medical secrecy: reading needs visits.read and writing visits.write.
-- * visit_appointments is the administrative schedule (who is called, when, came or not). It
--   holds no medical content: reading needs appointments.read and writing appointments.write.
-- * visits_due() lists the workers whose next visit is due, for the people who organise the
--   visits, without any medical detail.
-- Every change is written to the audit log.

-- Name of the signed-in staff member, written on what they record (the paper forms carry
-- the doctor's name). Profiles are private, so this reads only the caller's own name.
create function public.current_staff_name()
returns text
language sql
stable
security definer
set search_path = public
as $$
  select nullif(trim(full_name), '') from public.profiles where id = auth.uid();
$$;

create table public.visits (
  id                  uuid primary key default gen_random_uuid(),
  beneficiary_id      uuid not null references public.beneficiaries(id) on delete restrict,
  visit_type          text not null check (visit_type in ('hiring', 'periodic', 'return_to_work', 'on_request')),
  -- A day of margin: the server counts days in UTC, the centre one hour ahead.
  visit_date          date not null default current_date check (visit_date <= current_date + 1),
  doctor_name         text default public.current_staff_name() check (length(doctor_name) <= 200),
  -- Measurements
  weight_kg           numeric(5, 1) check (weight_kg between 2 and 400),
  height_cm           numeric(5, 1) check (height_cm between 40 and 250),
  pulse               smallint check (pulse between 20 and 250),
  bp_systolic         smallint check (bp_systolic between 50 and 300),
  bp_diastolic        smallint check (bp_diastolic between 20 and 200),
  -- Urine dipstick, vision and hearing: {urine_albumin, urine_sugar, vision_far_right…, colors, hearing_right…}
  measures            jsonb not null default '{}'::jsonb check (jsonb_typeof(measures) = 'object'),
  -- Questions and examination, per system: {"eyes": {"symptoms": ["tearing"], "other": "…"}}
  questionnaire       jsonb not null default '{}'::jsonb check (jsonb_typeof(questionnaire) = 'object'),
  examination         jsonb not null default '{}'::jsonb check (jsonb_typeof(examination) = 'object'),
  -- Functional explorations and complementary exams: {respiratory, circulatory, motor, radiology, biology, toxicology}
  explorations        jsonb not null default '{}'::jsonb check (jsonb_typeof(explorations) = 'object'),
  -- Orientation: {specialty, purpose: opinion|treatment, hospitalisation, service: social|employment, answer}
  orientation         jsonb not null default '{}'::jsonb check (jsonb_typeof(orientation) = 'object'),
  -- Fitness decision (aptitude); empty while the visit is not concluded.
  decision            text check (decision in ('fit', 'fit_with_reservations', 'temporarily_unfit', 'permanently_unfit')),
  unfit_until         date,
  restrictions        text check (length(restrictions) <= 2000),
  recommended_positions text check (length(recommended_positions) <= 1000),
  unsuitable_positions  text check (length(unsuitable_positions) <= 1000),
  next_visit_date     date,
  notes               text check (length(notes) <= 4000),
  created_at          timestamptz not null default now(),
  created_by          uuid default auth.uid(),
  updated_at          timestamptz not null default now(),
  updated_by          uuid default auth.uid(),
  check (next_visit_date is null or next_visit_date > visit_date),
  check (unfit_until is null or unfit_until >= visit_date)
);

create index visits_beneficiary_idx on public.visits (beneficiary_id, visit_date desc);

create table public.visit_appointments (
  id              uuid primary key default gen_random_uuid(),
  beneficiary_id  uuid not null references public.beneficiaries(id) on delete restrict,
  visit_type      text not null default 'periodic' check (visit_type in ('hiring', 'periodic', 'return_to_work', 'on_request')),
  scheduled_on    date not null,
  status          text not null default 'scheduled' check (status in ('scheduled', 'done', 'missed', 'cancelled')),
  reminder_on     date,
  notes           text check (length(notes) <= 500),
  visit_id        uuid references public.visits(id) on delete set null,
  created_at      timestamptz not null default now(),
  created_by      uuid default auth.uid(),
  updated_at      timestamptz not null default now(),
  updated_by      uuid default auth.uid()
);

-- One open appointment (scheduled or missed) per person: a missed one is rescheduled, not doubled.
create unique index visit_appointments_open_key on public.visit_appointments (beneficiary_id)
  where status in ('scheduled', 'missed');
create index visit_appointments_date_idx on public.visit_appointments (scheduled_on);

create trigger visits_touch before update on public.visits
  for each row execute function public.touch_row();
create trigger visit_appointments_touch before update on public.visit_appointments
  for each row execute function public.touch_row();

create trigger audit_visits after insert or update or delete on public.visits
  for each row execute function public.audit_row_change();
create trigger audit_visit_appointments after insert or update or delete on public.visit_appointments
  for each row execute function public.audit_row_change();

-- Recording a visit closes the person's open appointment.
create function public.close_visit_appointment()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  update public.visit_appointments
     set status = 'done', visit_id = new.id
   where beneficiary_id = new.beneficiary_id
     and status in ('scheduled', 'missed');
  return new;
end;
$$;

create trigger visits_close_appointment after insert on public.visits
  for each row execute function public.close_visit_appointment();

-- Row Level Security.
alter table public.visits enable row level security;
alter table public.visit_appointments enable row level security;

create policy visits_read on public.visits
  for select to authenticated using (public.has_permission('visits.read'));
create policy visits_insert on public.visits
  for insert to authenticated with check (public.has_permission('visits.write'));
create policy visits_update on public.visits
  for update to authenticated
  using (public.has_permission('visits.write'))
  with check (public.has_permission('visits.write'));

create policy visit_appointments_read on public.visit_appointments
  for select to authenticated using (public.has_permission('appointments.read'));
create policy visit_appointments_write on public.visit_appointments
  for all to authenticated
  using (public.has_permission('appointments.write'))
  with check (public.has_permission('appointments.write'));

-- Workers whose visit is due by p_until: the date the doctor set at the last visit, or one year
-- after it. With p_include_never, workers never seen are listed too. Returns the person, the last
-- visit date and type, and the open appointment if any. No finding and no decision.
create function public.visits_due(
  p_until date,
  p_include_never boolean default false,
  p_search text default null,
  p_limit integer default 200
)
returns table (
  beneficiary_id     uuid,
  external_id        text,
  last_name          text,
  first_name         text,
  category           text,
  company            text,
  unit               text,
  last_visit_on      date,
  last_visit_type    text,
  due_on             date,
  appointment_id     uuid,
  appointment_on     date,
  appointment_status text
)
language plpgsql
stable
security definer
set search_path = public
as $$
#variable_conflict use_column
begin
  if not (public.has_permission('visits.read') or public.has_permission('appointments.read')) then
    raise exception 'Not allowed' using errcode = '42501';
  end if;

  return query
  with last_visit as (
    select distinct on (v.beneficiary_id)
           v.beneficiary_id, v.visit_date, v.visit_type,
           coalesce(v.next_visit_date, (v.visit_date + interval '1 year')::date) as due
      from public.visits v
     order by v.beneficiary_id, v.visit_date desc, v.created_at desc
  )
  select b.id, b.external_id, b.last_name, b.first_name, b.category, b.company, b.unit,
         lv.visit_date, lv.visit_type, lv.due,
         a.id, a.scheduled_on, a.status
    from public.beneficiaries b
    left join last_visit lv on lv.beneficiary_id = b.id
    left join public.visit_appointments a
           on a.beneficiary_id = b.id and a.status in ('scheduled', 'missed')
   where b.active
     and b.category in ('agent', 'contractor_agent')
     and (lv.due <= p_until or (lv.beneficiary_id is null and p_include_never))
     and (coalesce(trim(p_search), '') = '' or b.search_text like '%' || lower(trim(p_search)) || '%')
   order by lv.due nulls last, b.last_name, b.first_name
   limit least(greatest(coalesce(p_limit, 200), 1), 1000);
end;
$$;

-- API privileges: nothing for visitors. Visits are corrected, never deleted; appointments can be
-- removed when created by mistake (the audit log keeps them).
revoke all on public.visits, public.visit_appointments from anon, authenticated;
grant select, insert, update on public.visits to authenticated;
grant select, insert, update, delete on public.visit_appointments to authenticated;
revoke execute on function public.current_staff_name() from public, anon;
grant execute on function public.current_staff_name() to authenticated;
revoke execute on function public.close_visit_appointment() from public, anon, authenticated;
revoke execute on function public.visits_due(date, boolean, text, integer) from public, anon;
grant execute on function public.visits_due(date, boolean, text, integer) to authenticated;
