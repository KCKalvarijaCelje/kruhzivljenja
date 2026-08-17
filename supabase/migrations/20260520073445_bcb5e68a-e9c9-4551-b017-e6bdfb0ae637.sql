
CREATE TABLE public.recurring_schedule_rule_stops (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  rule_id uuid NOT NULL REFERENCES public.recurring_schedule_rules(id) ON DELETE CASCADE,
  location_id uuid NOT NULL REFERENCES public.locations(id) ON DELETE CASCADE,
  default_driver_id uuid REFERENCES public.people(id) ON DELETE SET NULL,
  default_coordinator_id uuid REFERENCES public.people(id) ON DELETE SET NULL,
  sort_order int NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(rule_id, location_id)
);
ALTER TABLE public.recurring_schedule_rule_stops ENABLE ROW LEVEL SECURITY;
CREATE POLICY rule_stops_read ON public.recurring_schedule_rule_stops FOR SELECT TO authenticated USING (true);
CREATE POLICY rule_stops_admin_write ON public.recurring_schedule_rule_stops FOR ALL TO authenticated USING (public.is_admin(auth.uid())) WITH CHECK (public.is_admin(auth.uid()));

CREATE TEMP TABLE _canon AS
SELECT DISTINCT ON (weekday, frequency) id AS keep_id, weekday, frequency
FROM public.recurring_schedule_rules
ORDER BY weekday, frequency, created_at;

INSERT INTO public.recurring_schedule_rule_stops (rule_id, location_id, default_driver_id, default_coordinator_id, sort_order)
SELECT c.keep_id, r.location_id, r.default_driver_id, r.default_coordinator_id,
       ROW_NUMBER() OVER (PARTITION BY c.keep_id ORDER BY r.created_at) - 1
FROM public.recurring_schedule_rules r
JOIN _canon c ON c.weekday = r.weekday AND c.frequency = r.frequency
WHERE r.location_id IS NOT NULL
ON CONFLICT (rule_id, location_id) DO NOTHING;

UPDATE public.recurring_recipient_templates t
SET rule_id = c.keep_id
FROM public.recurring_schedule_rules r
JOIN _canon c ON c.weekday = r.weekday AND c.frequency = r.frequency
WHERE t.rule_id = r.id AND t.rule_id <> c.keep_id
  AND NOT EXISTS (SELECT 1 FROM public.recurring_recipient_templates x WHERE x.rule_id = c.keep_id AND x.household_id = t.household_id);
DELETE FROM public.recurring_recipient_templates t
USING public.recurring_schedule_rules r, _canon c
WHERE t.rule_id = r.id AND r.weekday = c.weekday AND r.frequency = c.frequency AND r.id <> c.keep_id;

ALTER TABLE public.schedule_stops ADD COLUMN rule_stop_id uuid REFERENCES public.recurring_schedule_rule_stops(id) ON DELETE SET NULL;
UPDATE public.schedule_stops ss
SET rule_stop_id = (
  SELECT rs.id
  FROM public.recurring_schedule_rules r
  JOIN _canon c ON c.weekday = r.weekday AND c.frequency = r.frequency
  JOIN public.recurring_schedule_rule_stops rs ON rs.rule_id = c.keep_id AND rs.location_id = ss.location_id
  WHERE ss.rule_id = r.id
  LIMIT 1
)
WHERE ss.rule_id IS NOT NULL;
ALTER TABLE public.schedule_stops DROP COLUMN rule_id;

DELETE FROM public.recurring_schedule_rules r
WHERE NOT EXISTS (SELECT 1 FROM _canon c WHERE c.keep_id = r.id);

ALTER TABLE public.recurring_schedule_rules DROP COLUMN location_id;
ALTER TABLE public.recurring_schedule_rules DROP COLUMN default_driver_id;
ALTER TABLE public.recurring_schedule_rules DROP COLUMN default_coordinator_id;
ALTER TABLE public.recurring_schedule_rules ADD CONSTRAINT recurring_schedule_rules_weekday_frequency_key UNIQUE (weekday, frequency);

ALTER TABLE public.date_recipients ADD COLUMN schedule_date_id uuid REFERENCES public.schedule_dates(id) ON DELETE CASCADE;
UPDATE public.date_recipients dr
SET schedule_date_id = ss.schedule_date_id
FROM public.schedule_stops ss
WHERE ss.id = dr.stop_id;
DELETE FROM public.date_recipients WHERE schedule_date_id IS NULL;
DELETE FROM public.date_recipients a
USING public.date_recipients b
WHERE a.ctid > b.ctid
  AND a.schedule_date_id = b.schedule_date_id
  AND COALESCE(a.household_id::text,'') = COALESCE(b.household_id::text,'')
  AND COALESCE(a.person_id::text,'')    = COALESCE(b.person_id::text,'')
  AND COALESCE(a.manual_name,'')        = COALESCE(b.manual_name,'');
ALTER TABLE public.date_recipients ALTER COLUMN schedule_date_id SET NOT NULL;
ALTER TABLE public.date_recipients DROP COLUMN stop_id;

DROP TABLE _canon;

CREATE OR REPLACE FUNCTION public.generate_ministry_year(_start_year integer)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
declare
  my_id uuid;
  start_date date := make_date(_start_year, 9, 1);
  end_date   date := make_date(_start_year + 1, 8, 31);
  d date;
  rule record;
  rs record;
  weeks_since int;
  sd_id uuid;
begin
  insert into public.ministry_years(start_year, label)
  values (_start_year, _start_year || '/' || (_start_year + 1))
  on conflict (start_year) do update set label = excluded.label
  returning id into my_id;

  for rule in select * from public.recurring_schedule_rules where active loop
    d := start_date;
    while extract(dow from d)::int <> rule.weekday loop d := d + 1; end loop;
    weeks_since := 0;
    while d <= end_date loop
      if rule.frequency = 'weekly'
         or (rule.frequency = 'biweekly' and weeks_since % 2 = 0) then
        insert into public.schedule_dates(ministry_year_id, date)
        values (my_id, d)
        on conflict (ministry_year_id, date) do update set ministry_year_id = excluded.ministry_year_id
        returning id into sd_id;

        for rs in select * from public.recurring_schedule_rule_stops where rule_id = rule.id order by sort_order loop
          insert into public.schedule_stops(schedule_date_id, location_id, driver_id, coordinator_id, rule_stop_id, sort_order)
          values (sd_id, rs.location_id, rs.default_driver_id, rs.default_coordinator_id, rs.id, rs.sort_order)
          on conflict (schedule_date_id, location_id) do update set
            driver_id = coalesce(public.schedule_stops.driver_id, excluded.driver_id),
            coordinator_id = coalesce(public.schedule_stops.coordinator_id, excluded.coordinator_id),
            rule_stop_id = coalesce(public.schedule_stops.rule_stop_id, excluded.rule_stop_id);
        end loop;

        insert into public.date_recipients(schedule_date_id, household_id)
        select sd_id, t.household_id
        from public.recurring_recipient_templates t
        where t.rule_id = rule.id
          and not exists (
            select 1 from public.date_recipients dr
            where dr.schedule_date_id = sd_id and dr.household_id = t.household_id
          );
      end if;
      d := d + 7;
      weeks_since := weeks_since + 1;
    end loop;
  end loop;
  return my_id;
end;
$$;

CREATE OR REPLACE FUNCTION public.apply_template_to_future(_rule_id uuid, _from_date date)
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
declare
  inserted_count int := 0;
begin
  if not is_admin(auth.uid()) then raise exception 'not authorized'; end if;
  with target_dates as (
    select distinct d.id as date_id
    from public.schedule_dates d
    join public.schedule_stops s on s.schedule_date_id = d.id
    join public.recurring_schedule_rule_stops rs on rs.id = s.rule_stop_id
    where rs.rule_id = _rule_id and d.date >= _from_date
  ),
  ins as (
    insert into public.date_recipients(schedule_date_id, household_id)
    select td.date_id, t.household_id
    from target_dates td
    cross join public.recurring_recipient_templates t
    where t.rule_id = _rule_id
      and not exists (
        select 1 from public.date_recipients dr
        where dr.schedule_date_id = td.date_id and dr.household_id = t.household_id
      )
    returning 1
  )
  select count(*) into inserted_count from ins;
  return inserted_count;
end;
$$;

DROP FUNCTION IF EXISTS public.apply_assignments_to_future(uuid, date, boolean);
CREATE OR REPLACE FUNCTION public.apply_assignments_to_future(_rule_stop_id uuid, _from_date date, _override boolean DEFAULT false)
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
declare
  affected int := 0;
  rs record;
begin
  if not is_admin(auth.uid()) then raise exception 'not authorized'; end if;
  select * into rs from public.recurring_schedule_rule_stops where id = _rule_stop_id;

  if _override then
    update public.schedule_stops s
    set driver_id = rs.default_driver_id, coordinator_id = rs.default_coordinator_id
    from public.schedule_dates d
    where s.schedule_date_id = d.id and s.rule_stop_id = _rule_stop_id and d.date >= _from_date;
  else
    update public.schedule_stops s
    set driver_id = coalesce(s.driver_id, rs.default_driver_id),
        coordinator_id = coalesce(s.coordinator_id, rs.default_coordinator_id)
    from public.schedule_dates d
    where s.schedule_date_id = d.id and s.rule_stop_id = _rule_stop_id and d.date >= _from_date;
  end if;
  get diagnostics affected = row_count;
  return affected;
end;
$$;
