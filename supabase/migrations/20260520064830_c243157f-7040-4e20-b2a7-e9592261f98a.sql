
-- 1. Create schedule_stops
CREATE TABLE public.schedule_stops (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  schedule_date_id uuid NOT NULL REFERENCES public.schedule_dates(id) ON DELETE CASCADE,
  location_id uuid REFERENCES public.locations(id) ON DELETE SET NULL,
  driver_id uuid REFERENCES public.people(id) ON DELETE SET NULL,
  coordinator_id uuid REFERENCES public.people(id) ON DELETE SET NULL,
  rule_id uuid REFERENCES public.recurring_schedule_rules(id) ON DELETE SET NULL,
  notes text,
  sort_order int NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX schedule_stops_date_location_uniq
  ON public.schedule_stops(schedule_date_id, location_id)
  WHERE location_id IS NOT NULL;

ALTER TABLE public.schedule_stops ENABLE ROW LEVEL SECURITY;

CREATE POLICY stops_read ON public.schedule_stops FOR SELECT TO authenticated USING (true);
CREATE POLICY stops_admin_write ON public.schedule_stops FOR ALL TO authenticated
  USING (is_admin(auth.uid())) WITH CHECK (is_admin(auth.uid()));
CREATE POLICY stops_coord_update ON public.schedule_stops FOR UPDATE TO authenticated
  USING (has_role(auth.uid(), 'coordinator'::app_role))
  WITH CHECK (has_role(auth.uid(), 'coordinator'::app_role));

CREATE TRIGGER stops_touch BEFORE UPDATE ON public.schedule_stops
  FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

-- 2. Backfill: every current schedule_dates row becomes one stop
INSERT INTO public.schedule_stops (schedule_date_id, location_id, driver_id, coordinator_id, rule_id, notes)
SELECT id, location_id, driver_id, coordinator_id, rule_id, NULL
FROM public.schedule_dates;

-- 3. Add stop_id to date_recipients and backfill
ALTER TABLE public.date_recipients ADD COLUMN stop_id uuid REFERENCES public.schedule_stops(id) ON DELETE CASCADE;

UPDATE public.date_recipients dr
SET stop_id = s.id
FROM public.schedule_stops s
WHERE s.schedule_date_id = dr.schedule_date_id;

-- 4. Collapse duplicate dates. For each (ministry_year_id, date) keep earliest schedule_dates row;
--    repoint stops to it; delete the extras.
WITH ranked AS (
  SELECT id, ministry_year_id, date,
    FIRST_VALUE(id) OVER (PARTITION BY ministry_year_id, date ORDER BY created_at, id) AS keeper_id
  FROM public.schedule_dates
),
remap AS (
  SELECT id AS old_id, keeper_id AS new_id
  FROM ranked
  WHERE id <> keeper_id
)
UPDATE public.schedule_stops s
SET schedule_date_id = r.new_id
FROM remap r
WHERE s.schedule_date_id = r.old_id;

DELETE FROM public.schedule_dates sd
WHERE EXISTS (
  SELECT 1 FROM public.schedule_dates sd2
  WHERE sd2.ministry_year_id = sd.ministry_year_id
    AND sd2.date = sd.date
    AND (sd2.created_at, sd2.id) < (sd.created_at, sd.id)
);

-- 5. Drop now-redundant columns from schedule_dates and add uniqueness
ALTER TABLE public.schedule_dates DROP COLUMN IF EXISTS location_id;
ALTER TABLE public.schedule_dates DROP COLUMN IF EXISTS driver_id;
ALTER TABLE public.schedule_dates DROP COLUMN IF EXISTS coordinator_id;
ALTER TABLE public.schedule_dates DROP COLUMN IF EXISTS rule_id;
ALTER TABLE public.schedule_dates ADD CONSTRAINT schedule_dates_year_date_uniq UNIQUE (ministry_year_id, date);

-- 6. date_recipients: stop_id required, drop schedule_date_id
ALTER TABLE public.date_recipients ALTER COLUMN stop_id SET NOT NULL;
ALTER TABLE public.date_recipients DROP COLUMN schedule_date_id;

-- 7. Rewrite generate_ministry_year
CREATE OR REPLACE FUNCTION public.generate_ministry_year(_start_year integer)
RETURNS uuid LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public' AS $function$
declare
  my_id uuid;
  start_date date := make_date(_start_year, 9, 1);
  end_date   date := make_date(_start_year + 1, 8, 31);
  d date;
  rule record;
  weeks_since int;
  sd_id uuid;
  stop_id uuid;
begin
  insert into public.ministry_years(start_year, label)
  values (_start_year, _start_year || '/' || (_start_year + 1))
  on conflict (start_year) do update set label = excluded.label
  returning id into my_id;

  for rule in select * from public.recurring_schedule_rules where active and location_id is not null loop
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

        insert into public.schedule_stops(schedule_date_id, location_id, driver_id, coordinator_id, rule_id)
        values (sd_id, rule.location_id, rule.default_driver_id, rule.default_coordinator_id, rule.id)
        on conflict (schedule_date_id, location_id) do update set
          driver_id = coalesce(public.schedule_stops.driver_id, excluded.driver_id),
          coordinator_id = coalesce(public.schedule_stops.coordinator_id, excluded.coordinator_id),
          rule_id = coalesce(public.schedule_stops.rule_id, excluded.rule_id)
        returning id into stop_id;

        insert into public.date_recipients(stop_id, household_id)
        select stop_id, t.household_id
        from public.recurring_recipient_templates t
        where t.rule_id = rule.id
          and not exists (
            select 1 from public.date_recipients dr
            where dr.stop_id = stop_id and dr.household_id = t.household_id
          );
      end if;
      d := d + 7;
      weeks_since := weeks_since + 1;
    end loop;
  end loop;
  return my_id;
end;
$function$;

-- 8. Rewrite apply_template_to_future to work on stops
CREATE OR REPLACE FUNCTION public.apply_template_to_future(_rule_id uuid, _from_date date)
RETURNS integer LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public' AS $function$
declare
  inserted_count int := 0;
begin
  if not is_admin(auth.uid()) then raise exception 'not authorized'; end if;

  with target_stops as (
    select s.id as stop_id
    from public.schedule_stops s
    join public.schedule_dates d on d.id = s.schedule_date_id
    where s.rule_id = _rule_id and d.date >= _from_date
  ),
  ins as (
    insert into public.date_recipients(stop_id, household_id)
    select ts.stop_id, t.household_id
    from target_stops ts
    cross join public.recurring_recipient_templates t
    where t.rule_id = _rule_id
      and not exists (
        select 1 from public.date_recipients dr
        where dr.stop_id = ts.stop_id and dr.household_id = t.household_id
      )
    returning 1
  )
  select count(*) into inserted_count from ins;
  return inserted_count;
end;
$function$;

-- 9. Rewrite apply_assignments_to_future to work on stops
CREATE OR REPLACE FUNCTION public.apply_assignments_to_future(_rule_id uuid, _from_date date, _override boolean DEFAULT false)
RETURNS integer LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public' AS $function$
declare
  affected int := 0;
  r record;
begin
  if not is_admin(auth.uid()) then raise exception 'not authorized'; end if;

  select default_driver_id, default_coordinator_id into r
  from public.recurring_schedule_rules where id = _rule_id;

  if _override then
    update public.schedule_stops s
    set driver_id = r.default_driver_id, coordinator_id = r.default_coordinator_id
    from public.schedule_dates d
    where s.schedule_date_id = d.id and s.rule_id = _rule_id and d.date >= _from_date;
  else
    update public.schedule_stops s
    set driver_id = coalesce(s.driver_id, r.default_driver_id),
        coordinator_id = coalesce(s.coordinator_id, r.default_coordinator_id)
    from public.schedule_dates d
    where s.schedule_date_id = d.id and s.rule_id = _rule_id and d.date >= _from_date;
  end if;
  get diagnostics affected = row_count;
  return affected;
end;
$function$;
