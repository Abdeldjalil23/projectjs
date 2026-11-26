-- MedSuite: consultations of each service (general medicine, nursing, dental care, psychology),
-- the acts performed (injections, dressings, extractions…), and the medical documents issued:
-- consultation report, prescription, referral letter, lab and imaging requests, medical
-- evacuation and medical certificate. Every document gets a serial number per type and year
-- (ORD-2026-00001) and is never changed once issued: it can only be cancelled, with a reason.
--
-- Each service reads and writes its own consultations with its own permissions:
--   general → consultations.*, nursing → nursing.*, dental → dental.*, psychology → psychology.*
-- Documents need documents.read to be read and documents.issue to be issued.
-- Every change is written to the audit log.

-- True when the signed-in user has the permission of the service for the action (read / write).
create function public.has_service_permission(p_service text, p_action text)
returns boolean
language sql
stable
set search_path = public
as $$
  select public.has_permission(
    case p_service
      when 'general' then 'consultations'
      when 'nursing' then 'nursing'
      when 'dental' then 'dental'
      when 'psychology' then 'psychology'
    end || '.' || p_action
  );
$$;

create table public.consultations (
  id                  uuid primary key default gen_random_uuid(),
  beneficiary_id      uuid not null references public.beneficiaries(id) on delete restrict,
  service             text not null check (service in ('general', 'nursing', 'dental', 'psychology')),
  consultation_date   date not null default current_date check (consultation_date <= current_date + 1),
  nature              text check (nature in ('care', 'emergency', 'specific', 'periodic', 'hiring', 'follow_up')),
  reason              text check (length(reason) <= 1000),
  -- Blood pressure, pulse, temperature, weight, blood sugar, oxygen saturation…
  vitals              jsonb not null default '{}'::jsonb check (jsonb_typeof(vitals) = 'object'),
  findings            text check (length(findings) <= 4000),
  diagnosis           text check (length(diagnosis) <= 2000),
  treatment           text check (length(treatment) <= 4000),
  work_stoppage_days  smallint check (work_stoppage_days between 0 and 365),
  author_name         text default public.current_staff_name() check (length(author_name) <= 200),
  created_at          timestamptz not null default now(),
  created_by          uuid default auth.uid(),
  updated_at          timestamptz not null default now(),
  updated_by          uuid default auth.uid()
);

create index consultations_beneficiary_idx on public.consultations (beneficiary_id, consultation_date desc);
create index consultations_date_idx on public.consultations (service, consultation_date);

-- Acts performed during a consultation, from the list of acts of the centre (codes kept by the
-- application). Dental acts carry the tooth number (FDI notation).
create table public.consultation_acts (
  id               uuid primary key default gen_random_uuid(),
  consultation_id  uuid not null references public.consultations(id) on delete cascade,
  act_code         text not null check (act_code ~ '^[a-z0-9_]{2,40}$'),
  -- FDI: quadrants 1–4 with teeth 1–8 (permanent), quadrants 5–8 with teeth 1–5 (milk teeth).
  tooth            smallint check ((tooth / 10 between 1 and 4 and tooth % 10 between 1 and 8)
                                or (tooth / 10 between 5 and 8 and tooth % 10 between 1 and 5)),
  quantity         smallint not null default 1 check (quantity between 1 and 50),
  notes            text check (length(notes) <= 500),
  created_at       timestamptz not null default now(),
  created_by       uuid default auth.uid()
);

create index consultation_acts_consultation_idx on public.consultation_acts (consultation_id);

create table public.documents (
  id               uuid primary key default gen_random_uuid(),
  beneficiary_id   uuid not null references public.beneficiaries(id) on delete restrict,
  consultation_id  uuid references public.consultations(id) on delete set null,
  doc_type         text not null check (doc_type in (
                     'consultation_report',  -- Consultation médicale (diagnostic)
                     'prescription',         -- Ordonnance
                     'referral',             -- Lettre d'orientation
                     'lab_request',          -- Demande d'analyse
                     'imaging_request',      -- Demande d'imagerie
                     'evacuation',           -- Évacuation sanitaire
                     'medical_certificate'   -- Certificat médical (arrêt, prolongation, reprise, hospitalisation)
                   )),
  serial           text not null unique,
  issued_on        date not null,
  author_name      text default public.current_staff_name() check (length(author_name) <= 200),
  content          jsonb not null default '{}'::jsonb check (jsonb_typeof(content) = 'object'),
  cancelled_at     timestamptz,
  cancel_reason    text check (length(trim(cancel_reason)) between 3 and 500),
  created_at       timestamptz not null default now(),
  created_by       uuid default auth.uid(),
  check ((cancelled_at is null) = (cancel_reason is null))
);

create index documents_beneficiary_idx on public.documents (beneficiary_id, issued_on desc);
create index documents_type_idx on public.documents (doc_type, issued_on);

-- Last number given, per type of document and year.
create table public.document_counters (
  doc_type     text not null,
  year         smallint not null,
  last_number  integer not null,
  primary key (doc_type, year)
);

-- Gives the next serial number of the type for the year: PREFIX-YYYY-NNNNN, without gaps
-- between documents that were saved.
create function public.set_document_serial()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  -- Documents are dated the day they are issued, in Algeria's time.
  v_today  date := (now() at time zone 'Africa/Algiers')::date;
  v_year   smallint := extract(year from v_today);
  v_number integer;
begin
  insert into public.document_counters as c (doc_type, year, last_number)
  values (new.doc_type, v_year, 1)
  on conflict (doc_type, year) do update set last_number = c.last_number + 1
  returning last_number into v_number;

  new.serial := case new.doc_type
                  when 'consultation_report' then 'CON'
                  when 'prescription' then 'ORD'
                  when 'referral' then 'ORI'
                  when 'lab_request' then 'ANA'
                  when 'imaging_request' then 'IMG'
                  when 'evacuation' then 'EVA'
                  when 'medical_certificate' then 'CM'
                end || '-' || v_year || '-' || lpad(v_number::text, 5, '0');
  new.issued_on := v_today;
  new.cancelled_at := null;
  new.cancel_reason := null;
  return new;
end;
$$;

create trigger documents_serial before insert on public.documents
  for each row execute function public.set_document_serial();

-- An issued document keeps its content; only its cancellation can be recorded, once.
create function public.guard_document_update()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  if old.cancelled_at is not null then
    raise exception 'This document is already cancelled' using errcode = '42501';
  end if;
  if new.cancelled_at is null then
    raise exception 'An issued document cannot be changed, only cancelled' using errcode = '42501';
  end if;
  new.cancelled_at := now();
  return new;
end;
$$;

create trigger documents_guard_update before update on public.documents
  for each row execute function public.guard_document_update();

create trigger consultations_touch before update on public.consultations
  for each row execute function public.touch_row();

create trigger audit_consultations after insert or update or delete on public.consultations
  for each row execute function public.audit_row_change();
create trigger audit_consultation_acts after insert or update or delete on public.consultation_acts
  for each row execute function public.audit_row_change();
create trigger audit_documents after insert or update or delete on public.documents
  for each row execute function public.audit_row_change();

-- Row Level Security.
alter table public.consultations enable row level security;
alter table public.consultation_acts enable row level security;
alter table public.documents enable row level security;
alter table public.document_counters enable row level security;

create policy consultations_read on public.consultations
  for select to authenticated using (public.has_service_permission(service, 'read'));
create policy consultations_insert on public.consultations
  for insert to authenticated with check (public.has_service_permission(service, 'write'));
create policy consultations_update on public.consultations
  for update to authenticated
  using (public.has_service_permission(service, 'write'))
  with check (public.has_service_permission(service, 'write'));

-- Acts follow their consultation.
create policy consultation_acts_read on public.consultation_acts
  for select to authenticated
  using (exists (select 1 from public.consultations c
                  where c.id = consultation_id and public.has_service_permission(c.service, 'read')));
create policy consultation_acts_write on public.consultation_acts
  for all to authenticated
  using (exists (select 1 from public.consultations c
                  where c.id = consultation_id and public.has_service_permission(c.service, 'write')))
  with check (exists (select 1 from public.consultations c
                       where c.id = consultation_id and public.has_service_permission(c.service, 'write')));

create policy documents_read on public.documents
  for select to authenticated using (public.has_permission('documents.read'));
create policy documents_insert on public.documents
  for insert to authenticated with check (public.has_permission('documents.issue'));
create policy documents_cancel on public.documents
  for update to authenticated
  using (public.has_permission('documents.issue'))
  with check (public.has_permission('documents.issue'));

-- Header printed on the documents. An administrator can change it in the settings.
insert into public.app_settings (key, value, description) values
  ('print_header',
   '["Sonatrach", "Exploration – Production", "Direction Régionale Haoud Berkaoui", "Centre de Médecine du Travail"]',
   'Lines printed at the top of the medical documents')
on conflict (key) do nothing;

-- API privileges: nothing for visitors. Consultations are corrected, never deleted; acts can be
-- removed; documents can only be cancelled. The counters are reached only through the trigger.
revoke all on public.consultations, public.consultation_acts, public.documents, public.document_counters
  from anon, authenticated;
grant select, insert, update on public.consultations to authenticated;
grant select, insert, update, delete on public.consultation_acts to authenticated;
grant select, insert on public.documents to authenticated;
grant update (cancelled_at, cancel_reason) on public.documents to authenticated;
revoke execute on function public.set_document_serial() from public, anon, authenticated;
revoke execute on function public.guard_document_update() from public, anon, authenticated;
revoke execute on function public.has_service_permission(text, text) from public, anon;
grant execute on function public.has_service_permission(text, text) to authenticated;
