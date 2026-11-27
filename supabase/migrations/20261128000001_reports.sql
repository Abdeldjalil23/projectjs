-- MedSuite: activity reports (phase 4), computed from what is recorded in the platform.
--
--   report_cms(from, to)           Monthly report of the CMS: consultations of each service, nursing
--                                  and dental acts, contracted doctors, documents and care requests,
--                                  by category of beneficiary and Homme / Femme / Enfant.
--   report_occupational(from, to)  Quarterly consolidation of occupational medicine: workforce,
--                                  visits and fitness decisions, work accidents, referrals,
--                                  emergencies, evacuations, complementary exams, vaccinations.
--
-- Rules
--   * Counts only: no name, no number, no diagnosis leaves these functions. They need
--     reports.read, which the administration has without seeing any medical record.
--   * The functions run with the owner's rights to count every service, then return the counts.
--   * Categories follow the columns of the CMS reports. Workers of contracted companies and their
--     dependents form one column. Homme / Femme / Enfant come from sex and birth date: a
--     beneficiary up to report_child_max_age (setting, 15 by default) on the day of the act is
--     counted as Enfant.
--   * Every list is returned flat ({category, class, count}…) and laid out by the application,
--     so a change of the paper form needs no change here.

-- Column of a beneficiary in the CMS reports.
create function public.report_category(p_category text)
returns text
language sql
immutable
as $$
  select case when p_category in ('contractor_agent', 'contractor_ad') then 'contractor' else p_category end;
$$;

-- Homme (M), Femme (F) or Enfant (C) on a day; U when the sex of an adult is not recorded.
create function public.report_person_class(p_sex text, p_birth date, p_on date, p_child_max integer)
returns text
language sql
immutable
as $$
  select case
    when p_birth is not null and extract(year from age(p_on, p_birth)) <= p_child_max then 'C'
    when p_sex in ('M', 'F') then p_sex
    else 'U'
  end;
$$;

-- Checks the right to read reports and the period asked for.
create function public.report_check(p_from date, p_to date)
returns void
language plpgsql
stable
security definer
set search_path = public
as $$
begin
  if not public.has_permission('reports.read') then
    raise exception 'Not allowed to read reports' using errcode = '42501';
  end if;
  if p_from is null or p_to is null or p_to < p_from or p_to - p_from > 400 then
    raise exception 'Invalid report period' using errcode = '22023';
  end if;
end;
$$;

-- ---------------------------------------------------------------------------
-- Monthly report of the CMS
-- ---------------------------------------------------------------------------

create function public.report_cms(p_from date, p_to date)
returns jsonb
language plpgsql
stable
security definer
set search_path = public
as $$
declare
  v_child integer := public.setting_int('report_child_max_age', 15);
begin
  perform public.report_check(p_from, p_to);

  return jsonb_build_object(
    'from', p_from,
    'to', p_to,
    'child_max_age', v_child,

    -- Consultations of each service.
    'consultations', coalesce((
      select jsonb_agg(jsonb_build_object('service', service, 'category', category, 'class', class, 'count', n)
                       order by service, category, class)
        from (select c.service,
                     public.report_category(b.category) as category,
                     public.report_person_class(b.sex, b.birth_date, c.consultation_date, v_child) as class,
                     count(*) as n
                from public.consultations c
                join public.beneficiaries b on b.id = c.beneficiary_id
               where c.consultation_date between p_from and p_to
               group by 1, 2, 3) s), '[]'::jsonb),

    -- Acts performed (nursing, dental…), counted with their quantity.
    'acts', coalesce((
      select jsonb_agg(jsonb_build_object('service', service, 'act', act_code, 'category', category, 'class', class, 'count', n)
                       order by service, act_code, category, class)
        from (select c.service,
                     a.act_code,
                     public.report_category(b.category) as category,
                     public.report_person_class(b.sex, b.birth_date, c.consultation_date, v_child) as class,
                     sum(a.quantity) as n
                from public.consultation_acts a
                join public.consultations c on c.id = a.consultation_id
                join public.beneficiaries b on b.id = c.beneficiary_id
               where c.consultation_date between p_from and p_to
               group by 1, 2, 3, 4) s), '[]'::jsonb),

    -- Care coverages used with each contracted doctor (État récapitulatif des médecins vacataires).
    'contracted', coalesce((
      select jsonb_agg(jsonb_build_object('doctor_id', doctor_id, 'doctor', full_name, 'specialty', specialty,
                                          'category', category, 'class', class, 'count', n)
                       order by full_name, category, class)
        from (select d.id as doctor_id,
                     d.full_name,
                     d.specialty,
                     public.report_category(b.category) as category,
                     public.report_person_class(b.sex, b.birth_date, (r.used_at at time zone 'Africa/Algiers')::date, v_child) as class,
                     count(*) as n
                from public.care_requests r
                join public.contracted_doctors d on d.id = r.contracted_doctor_id
                join public.beneficiaries b on b.id = r.beneficiary_id
               where r.used_at is not null
                 and (r.used_at at time zone 'Africa/Algiers')::date between p_from and p_to
               group by 1, 2, 3, 4, 5) s), '[]'::jsonb),

    -- Medical documents issued (cancelled ones are left out).
    'documents', coalesce((
      select jsonb_agg(jsonb_build_object('type', doc_type, 'category', category, 'count', n) order by doc_type, category)
        from (select d.doc_type, public.report_category(b.category) as category, count(*) as n
                from public.documents d
                join public.beneficiaries b on b.id = d.beneficiary_id
               where d.issued_on between p_from and p_to
                 and d.cancelled_at is null
               group by 1, 2) s), '[]'::jsonb),

    -- Care coverage requests of the period.
    'care_requests', jsonb_build_object(
      'made', (select count(*) from public.care_requests
                where (created_at at time zone 'Africa/Algiers')::date between p_from and p_to),
      'approved', (select count(*) from public.care_requests
                    where status = 'approved' and (reviewed_at at time zone 'Africa/Algiers')::date between p_from and p_to),
      'refused', (select count(*) from public.care_requests
                   where status = 'refused' and (reviewed_at at time zone 'Africa/Algiers')::date between p_from and p_to),
      'used', (select count(*) from public.care_requests
                where used_at is not null and (used_at at time zone 'Africa/Algiers')::date between p_from and p_to))
  );
end;
$$;

-- ---------------------------------------------------------------------------
-- Quarterly consolidation of occupational medicine
-- ---------------------------------------------------------------------------

create function public.report_occupational(p_from date, p_to date)
returns jsonb
language plpgsql
stable
security definer
set search_path = public
as $$
begin
  perform public.report_check(p_from, p_to);

  return jsonb_build_object(
    'from', p_from,
    'to', p_to,

    -- 1. Workforce followed by the centre: active Sonatrach workers and contracted companies'
    --    workers, by sex and age group on the last day of the period.
    'workforce', coalesce((
      select jsonb_agg(jsonb_build_object('group', grp, 'sex', sex, 'band', band, 'count', n) order by grp, sex, band)
        from (select case when category = 'agent' then 'agent' else 'contractor' end as grp,
                     coalesce(sex, 'U') as sex,
                     case
                       when birth_date is null then 'unknown'
                       when extract(year from age(p_to, birth_date)) < 20 then 'under_20'
                       when extract(year from age(p_to, birth_date)) <= 30 then '20_30'
                       when extract(year from age(p_to, birth_date)) <= 40 then '31_40'
                       when extract(year from age(p_to, birth_date)) <= 50 then '41_50'
                       when extract(year from age(p_to, birth_date)) <= 60 then '51_60'
                       else 'over_60'
                     end as band,
                     count(*) as n
                from public.beneficiaries
               where active and category in ('agent', 'contractor_agent')
               group by 1, 2, 3) s), '[]'::jsonb),

    -- 3. Visits of occupational medicine and their fitness decision, by category.
    'visits', coalesce((
      select jsonb_agg(jsonb_build_object('type', visit_type, 'decision', decision, 'category', category, 'count', n)
                       order by visit_type, decision, category)
        from (select v.visit_type,
                     coalesce(v.decision, 'pending') as decision,
                     public.report_category(b.category) as category,
                     count(*) as n
                from public.visits v
                join public.beneficiaries b on b.id = v.beneficiary_id
               where v.visit_date between p_from and p_to
               group by 1, 2, 3) s), '[]'::jsonb),

    -- Periodic visit coverage: workers due (active) and workers examined in the period.
    'periodic', coalesce((
      select jsonb_agg(jsonb_build_object('group', grp, 'subject', subject, 'examined', examined) order by grp)
        from (select g.grp,
                     (select count(*) from public.beneficiaries b
                       where b.active and b.category = g.category) as subject,
                     (select count(distinct v.beneficiary_id) from public.visits v
                        join public.beneficiaries b on b.id = v.beneficiary_id
                       where v.visit_type = 'periodic' and b.category = g.category
                         and v.visit_date between p_from and p_to) as examined
                from (values ('agent', 'agent'), ('contractor', 'contractor_agent')) as g(grp, category)) s), '[]'::jsonb),

    -- Consultations of the period by service and nature (care, emergency…), by category.
    'consultations', coalesce((
      select jsonb_agg(jsonb_build_object('service', service, 'nature', nature, 'category', category, 'count', n)
                       order by service, nature, category)
        from (select c.service,
                     coalesce(c.nature, 'none') as nature,
                     public.report_category(b.category) as category,
                     count(*) as n
                from public.consultations c
                join public.beneficiaries b on b.id = c.beneficiary_id
               where c.consultation_date between p_from and p_to
               group by 1, 2, 3) s), '[]'::jsonb),

    -- Documents issued: evacuations, lab and imaging requests…, by category.
    'documents', coalesce((
      select jsonb_agg(jsonb_build_object('type', doc_type, 'category', category, 'count', n) order by doc_type, category)
        from (select d.doc_type, public.report_category(b.category) as category, count(*) as n
                from public.documents d
                join public.beneficiaries b on b.id = d.beneficiary_id
               where d.issued_on between p_from and p_to
                 and d.cancelled_at is null
               group by 1, 2) s), '[]'::jsonb),

    -- 5. Work accidents recorded in the medical records, with or without days off.
    'accidents', (
      select jsonb_build_object(
               'without_stop', count(*) filter (where days = 0),
               'with_stop', count(*) filter (where days > 0),
               'days_off', coalesce(sum(days), 0))
        from (select case when h.details ->> 'days_off' ~ '^\s*\d+(\.\d+)?\s*$'
                          then (h.details ->> 'days_off')::numeric else 0 end as days
                from public.medical_history h
               where h.kind = 'work_accident'
                 and h.event_date between p_from and p_to) a),

    -- Specialised referrals: referral letters and visit orientations, by specialty as written.
    'referrals', coalesce((
      select jsonb_agg(jsonb_build_object('specialty', specialty, 'count', n) order by n desc, specialty)
        from (select min(specialty) as specialty, count(*) as n
                from (select trim(d.content ->> 'specialty') as specialty
                        from public.documents d
                       where d.doc_type = 'referral' and d.cancelled_at is null
                         and d.issued_on between p_from and p_to
                      union all
                      select trim(v.orientation ->> 'specialty')
                        from public.visits v
                       where v.visit_date between p_from and p_to) x
               where coalesce(specialty, '') <> ''
               group by lower(specialty)) s), '[]'::jsonb),

    -- 6. Vaccinations given in the period: people vaccinated and doses, by vaccine.
    'vaccinations', coalesce((
      select jsonb_agg(jsonb_build_object('vaccine', vaccine, 'persons', persons, 'doses', doses) order by vaccine)
        from (select min(trim(vaccine)) as vaccine,
                     count(distinct beneficiary_id) as persons,
                     count(*) as doses
                from public.vaccinations
               where vaccination_date between p_from and p_to
               group by lower(trim(vaccine))) s), '[]'::jsonb)
  );
end;
$$;

-- ---------------------------------------------------------------------------
-- API privileges: only the two reports are callable, by signed-in users (reports.read is checked).
-- ---------------------------------------------------------------------------

revoke execute on function public.report_category(text) from public, anon, authenticated;
revoke execute on function public.report_person_class(text, date, date, integer) from public, anon, authenticated;
revoke execute on function public.report_check(date, date) from public, anon, authenticated;
revoke execute on function public.report_cms(date, date) from public, anon;
revoke execute on function public.report_occupational(date, date) from public, anon;
grant execute on function public.report_cms(date, date) to authenticated;
grant execute on function public.report_occupational(date, date) to authenticated;
