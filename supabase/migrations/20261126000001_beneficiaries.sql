-- MedSuite: beneficiaries, everyone who receives care at the centre.
--
-- * Categories follow the columns of the CMS monthly reports. Homme / Femme / Enfant
--   are not stored: reports work them out from sex and birth date.
-- * Dependents (ayants droit) are linked to the worker or retiree they depend on.
-- * external_id is the person's number in the company's list (Matricule). It is unique,
--   whichever way the record arrived: typed in the app or imported from a file / another
--   system (source). An import updates the record that has the same number.
-- * Records are never deleted from the app: they are deactivated, and every change is audited.

create table public.beneficiaries (
  id            uuid primary key default gen_random_uuid(),
  external_id   text check (external_id is null or length(trim(external_id)) between 1 and 64),
  source        text not null default 'manual' check (source ~ '^[a-z0-9_-]{2,32}$'),
  category      text not null check (category in (
                  'agent',             -- Agent SH
                  'ayant_droit',       -- Ayant droit of an agent
                  'retraite',          -- Retraité
                  'ad_retraite',       -- Ayant droit of a retiree
                  'contractor_agent',  -- Worker of a contracted company
                  'contractor_ad',     -- Ayant droit of a contracted company's worker
                  'local_population'   -- Population locale
                )),
  last_name     text not null check (length(trim(last_name)) between 1 and 100),
  first_name    text not null check (length(trim(first_name)) between 1 and 100),
  birth_date    date check (birth_date is null or birth_date between date '1900-01-01' and current_date),
  sex           text check (sex in ('M', 'F')),
  holder_id     uuid references public.beneficiaries(id) on delete restrict,
  relationship  text check (relationship in ('spouse', 'child', 'parent', 'other')),
  company       text check (company is null or length(company) <= 150),
  unit          text check (unit is null or length(unit) <= 150),
  phone         text check (phone is null or length(phone) <= 30),
  notes         text check (notes is null or length(notes) <= 2000),
  active        boolean not null default true,
  created_at    timestamptz not null default now(),
  created_by    uuid default auth.uid(),
  updated_at    timestamptz not null default now(),
  updated_by    uuid default auth.uid(),
  check (holder_id is null or holder_id <> id),
  -- Words used by the search box: number, last name and first name in lower case.
  search_text   text generated always as (
                  lower(coalesce(external_id, '') || ' ' || last_name || ' ' || first_name)
                ) stored
);

create unique index beneficiaries_external_id_key on public.beneficiaries (external_id) where external_id is not null;
create index beneficiaries_holder_idx on public.beneficiaries (holder_id);
create index beneficiaries_name_idx on public.beneficiaries (lower(last_name), lower(first_name));
create index beneficiaries_category_idx on public.beneficiaries (category);

comment on table public.beneficiaries is 'Everyone who receives care: workers, dependents, retirees, contractors, local population';
comment on column public.beneficiaries.external_id is 'Number in the company list (Matricule), unique';
comment on column public.beneficiaries.source is 'Where the record comes from: manual, excel, oracle…';

-- Dependents point to a worker, a retiree or a contractor's worker; the others point to nobody.
create function public.check_beneficiary_holder()
returns trigger
language plpgsql
set search_path = public
as $$
declare
  holder_category text;
begin
  new.updated_at := now();
  new.updated_by := coalesce(auth.uid(), new.updated_by);

  if new.category not in ('ayant_droit', 'ad_retraite', 'contractor_ad') then
    if new.holder_id is not null then
      raise exception 'Only dependents can be linked to a worker';
    end if;
    new.relationship := null;
    return new;
  end if;

  if new.holder_id is not null then
    select category into holder_category from public.beneficiaries where id = new.holder_id;
    if holder_category is null or holder_category not in ('agent', 'retraite', 'contractor_agent') then
      raise exception 'A dependent must be linked to a worker, a retiree or a contracted company''s worker';
    end if;
  end if;
  return new;
end;
$$;

create trigger beneficiaries_check_holder
  before insert or update on public.beneficiaries
  for each row execute function public.check_beneficiary_holder();

create trigger audit_beneficiaries
  after insert or update or delete on public.beneficiaries
  for each row execute function public.audit_row_change();

-- Row Level Security: reading and writing follow the editable permissions.
alter table public.beneficiaries enable row level security;

create policy beneficiaries_read on public.beneficiaries
  for select to authenticated using (public.has_permission('beneficiaries.read'));
create policy beneficiaries_insert on public.beneficiaries
  for insert to authenticated with check (public.has_permission('beneficiaries.write'));
create policy beneficiaries_update on public.beneficiaries
  for update to authenticated
  using (public.has_permission('beneficiaries.write'))
  with check (public.has_permission('beneficiaries.write'));

-- Import from a file or another system, in batches of at most 1000 rows.
-- Each row: external_id (required), category, last_name, first_name, birth_date (YYYY-MM-DD),
-- sex (M/F), relationship, company, unit, phone, holder_external_id (for dependents), row (line number).
-- Rows with the same external_id update the existing record. Send workers before their dependents.
-- Returns {"inserted": n, "updated": n, "linked": n, "errors": [{"row": n, "message": "…"}]}.
create function public.import_beneficiaries(p_source text, p_rows jsonb)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  r            jsonb;
  line         int := 0;
  v_external   text;
  v_existed    boolean;
  v_holder     uuid;
  n_inserted   int := 0;
  n_updated    int := 0;
  n_linked     int := 0;
  errors       jsonb := '[]'::jsonb;
begin
  if not public.has_permission('beneficiaries.import') then
    raise exception 'Permission denied: beneficiaries.import' using errcode = '42501';
  end if;
  if p_source is null or p_source !~ '^[a-z0-9_-]{2,32}$' or p_source = 'manual' then
    raise exception 'Invalid source name';
  end if;
  if jsonb_typeof(p_rows) is distinct from 'array' or jsonb_array_length(p_rows) > 1000 then
    raise exception 'Send an array of at most 1000 rows';
  end if;

  for r in select value from jsonb_array_elements(p_rows) loop
    line := line + 1;
    v_external := nullif(trim(r ->> 'external_id'), '');
    begin
      if v_external is null then
        raise exception 'The number (Matricule) is missing';
      end if;

      v_existed := exists (select 1 from public.beneficiaries where external_id = v_external);

      insert into public.beneficiaries as b
        (source, external_id, category, last_name, first_name, birth_date, sex, relationship, company, unit, phone)
      values (
        p_source,
        v_external,
        r ->> 'category',
        trim(r ->> 'last_name'),
        trim(r ->> 'first_name'),
        nullif(r ->> 'birth_date', '')::date,
        nullif(upper(trim(r ->> 'sex')), ''),
        nullif(r ->> 'relationship', ''),
        nullif(trim(r ->> 'company'), ''),
        nullif(trim(r ->> 'unit'), ''),
        nullif(trim(r ->> 'phone'), '')
      )
      on conflict (external_id) where external_id is not null do update set
        source       = excluded.source,
        category     = excluded.category,
        last_name    = excluded.last_name,
        first_name   = excluded.first_name,
        birth_date   = coalesce(excluded.birth_date, b.birth_date),
        sex          = coalesce(excluded.sex, b.sex),
        relationship = coalesce(excluded.relationship, b.relationship),
        company      = coalesce(excluded.company, b.company),
        unit         = coalesce(excluded.unit, b.unit),
        phone        = coalesce(excluded.phone, b.phone),
        holder_id    = case when excluded.category in ('ayant_droit', 'ad_retraite', 'contractor_ad')
                            then b.holder_id end,
        active       = true;

      -- Link a dependent to the worker it depends on. If the worker is unknown,
      -- the whole row is refused (the error rolls back this row only).
      v_holder := null;
      if nullif(trim(r ->> 'holder_external_id'), '') is not null then
        select id into v_holder from public.beneficiaries where external_id = trim(r ->> 'holder_external_id');
        if v_holder is null then
          raise exception 'Worker % not found: import the workers first', trim(r ->> 'holder_external_id');
        end if;
        update public.beneficiaries set holder_id = v_holder
          where external_id = v_external and holder_id is distinct from v_holder;
        if found then n_linked := n_linked + 1; end if;
      end if;

      -- Counted last, so that a refused row is not counted.
      if v_existed then n_updated := n_updated + 1; else n_inserted := n_inserted + 1; end if;
    exception when others then
      errors := errors || jsonb_build_object('row', coalesce((r ->> 'row')::int, line), 'message', sqlerrm);
    end;
  end loop;

  return jsonb_build_object('inserted', n_inserted, 'updated', n_updated, 'linked', n_linked, 'errors', errors);
end;
$$;

-- API privileges, as in 20261122000002_api_grants.sql: nothing for visitors who are not signed in.
revoke all on public.beneficiaries from anon, authenticated;
grant select, insert, update on public.beneficiaries to authenticated;

revoke execute on function public.check_beneficiary_holder() from public, anon, authenticated;
revoke execute on function public.import_beneficiaries(text, jsonb) from public, anon;
grant execute on function public.import_beneficiaries(text, jsonb) to authenticated;
