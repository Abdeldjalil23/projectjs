-- MedSuite: the medical record (Dossier médical de médecine du travail), page 1 and Antécédents:
-- general information, positions held and their risks, personal and family history,
-- intoxications, work accidents and vaccinations.
--
-- Everything here is covered by medical secrecy: reading needs medical_records.read and writing
-- medical_records.write. Vaccinations can also be read and recorded by nurses (nursing.*).
-- Every change is written to the audit log.

-- Keeps who changed a row last, and when.
create function public.touch_row()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  new.updated_at := now();
  new.updated_by := coalesce(auth.uid(), new.updated_by);
  return new;
end;
$$;

-- General information: one row per beneficiary.
create table public.medical_records (
  beneficiary_id     uuid primary key references public.beneficiaries(id) on delete restrict,
  family_status      text check (family_status in ('single', 'married', 'divorced', 'widowed')),
  children_count     smallint check (children_count between 0 and 30),
  education          text check (length(education) <= 200),
  qualification      text check (length(qualification) <= 200),
  national_service   text check (national_service in ('done', 'exempt', 'deferred', 'not_applicable')),
  blood_group        text check (blood_group in ('A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-')),
  allergies          text check (length(allergies) <= 1000),
  chronic_conditions text[] not null default '{}',
  chronic_treatment  text check (length(chronic_treatment) <= 2000),
  smoking            text check (smoking in ('never', 'current', 'former')),
  alcohol            text check (alcohol in ('never', 'occasional', 'regular', 'former')),
  notes              text check (length(notes) <= 4000),
  created_at         timestamptz not null default now(),
  created_by         uuid default auth.uid(),
  updated_at         timestamptz not null default now(),
  updated_by         uuid default auth.uid()
);

-- Postes occupés: positions held, their risks and why they changed.
create table public.occupational_positions (
  id              uuid primary key default gen_random_uuid(),
  beneficiary_id  uuid not null references public.beneficiaries(id) on delete restrict,
  start_date      date,
  end_date        date,
  job_title       text not null check (length(trim(job_title)) between 1 and 200),
  risks           text check (length(risks) <= 1000),
  nuisances       text check (length(nuisances) <= 1000),
  change_type     text check (change_type in ('hiring', 'transfer', 'promotion', 'medical', 'other')),
  change_reason   text check (length(change_reason) <= 1000),
  change_details  text check (length(change_details) <= 2000),
  created_at      timestamptz not null default now(),
  created_by      uuid default auth.uid(),
  updated_at      timestamptz not null default now(),
  updated_by      uuid default auth.uid(),
  check (end_date is null or start_date is null or end_date >= start_date)
);

-- Antécédents: personal and family history, intoxications and work accidents.
-- Fields specific to one kind (days off and IPP for an accident, product for an intoxication…)
-- are kept in details.
create table public.medical_history (
  id              uuid primary key default gen_random_uuid(),
  beneficiary_id  uuid not null references public.beneficiaries(id) on delete restrict,
  kind            text not null check (kind in ('personal', 'family', 'intoxication', 'work_accident')),
  event_date      date check (event_date is null or event_date <= current_date),
  title           text not null check (length(trim(title)) between 1 and 300),
  description     text check (length(description) <= 4000),
  details         jsonb not null default '{}'::jsonb check (jsonb_typeof(details) = 'object'),
  created_at      timestamptz not null default now(),
  created_by      uuid default auth.uid(),
  updated_at      timestamptz not null default now(),
  updated_by      uuid default auth.uid()
);

create table public.vaccinations (
  id                uuid primary key default gen_random_uuid(),
  beneficiary_id    uuid not null references public.beneficiaries(id) on delete restrict,
  vaccine           text not null check (length(trim(vaccine)) between 1 and 200),
  dose              text check (length(dose) <= 50),
  vaccination_date  date check (vaccination_date is null or vaccination_date <= current_date),
  next_due_date     date,
  lot_number        text check (length(lot_number) <= 100),
  centre            text check (length(centre) <= 200),
  doctor            text check (length(doctor) <= 200),
  notes             text check (length(notes) <= 2000),
  created_at        timestamptz not null default now(),
  created_by        uuid default auth.uid(),
  updated_at        timestamptz not null default now(),
  updated_by        uuid default auth.uid()
);

create index occupational_positions_beneficiary_idx on public.occupational_positions (beneficiary_id);
create index medical_history_beneficiary_idx on public.medical_history (beneficiary_id, kind);
create index vaccinations_beneficiary_idx on public.vaccinations (beneficiary_id);

create trigger medical_records_touch before update on public.medical_records
  for each row execute function public.touch_row();
create trigger occupational_positions_touch before update on public.occupational_positions
  for each row execute function public.touch_row();
create trigger medical_history_touch before update on public.medical_history
  for each row execute function public.touch_row();
create trigger vaccinations_touch before update on public.vaccinations
  for each row execute function public.touch_row();

create trigger audit_medical_records after insert or update or delete on public.medical_records
  for each row execute function public.audit_row_change();
create trigger audit_occupational_positions after insert or update or delete on public.occupational_positions
  for each row execute function public.audit_row_change();
create trigger audit_medical_history after insert or update or delete on public.medical_history
  for each row execute function public.audit_row_change();
create trigger audit_vaccinations after insert or update or delete on public.vaccinations
  for each row execute function public.audit_row_change();

-- Row Level Security.
alter table public.medical_records enable row level security;
alter table public.occupational_positions enable row level security;
alter table public.medical_history enable row level security;
alter table public.vaccinations enable row level security;

create policy medical_records_read on public.medical_records
  for select to authenticated using (public.has_permission('medical_records.read'));
create policy medical_records_insert on public.medical_records
  for insert to authenticated with check (public.has_permission('medical_records.write'));
create policy medical_records_update on public.medical_records
  for update to authenticated
  using (public.has_permission('medical_records.write'))
  with check (public.has_permission('medical_records.write'));

create policy occupational_positions_read on public.occupational_positions
  for select to authenticated using (public.has_permission('medical_records.read'));
create policy occupational_positions_write on public.occupational_positions
  for all to authenticated
  using (public.has_permission('medical_records.write'))
  with check (public.has_permission('medical_records.write'));

create policy medical_history_read on public.medical_history
  for select to authenticated using (public.has_permission('medical_records.read'));
create policy medical_history_write on public.medical_history
  for all to authenticated
  using (public.has_permission('medical_records.write'))
  with check (public.has_permission('medical_records.write'));

create policy vaccinations_read on public.vaccinations
  for select to authenticated
  using (public.has_permission('medical_records.read') or public.has_permission('nursing.read'));
create policy vaccinations_write on public.vaccinations
  for all to authenticated
  using (public.has_permission('medical_records.write') or public.has_permission('nursing.write'))
  with check (public.has_permission('medical_records.write') or public.has_permission('nursing.write'));

-- API privileges: nothing for visitors; entries can be corrected or removed (the audit log keeps them),
-- the general information row cannot be deleted.
revoke all on public.medical_records, public.occupational_positions, public.medical_history, public.vaccinations
  from anon, authenticated;
grant select, insert, update on public.medical_records to authenticated;
grant select, insert, update, delete on public.occupational_positions, public.medical_history, public.vaccinations
  to authenticated;
revoke execute on function public.touch_row() from public, anon, authenticated;
