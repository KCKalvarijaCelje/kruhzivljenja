
-- 1. Extend recipient_households
ALTER TABLE public.recipient_households
  ADD COLUMN IF NOT EXISTS address text,
  ADD COLUMN IF NOT EXISTS contact_name text;

-- 2. Add rule_id to schedule_dates
ALTER TABLE public.schedule_dates
  ADD COLUMN IF NOT EXISTS rule_id uuid REFERENCES public.recurring_schedule_rules(id) ON DELETE SET NULL;

-- Backfill rule_id by matching weekday + location
UPDATE public.schedule_dates sd
SET rule_id = r.id
FROM public.recurring_schedule_rules r
WHERE sd.rule_id IS NULL
  AND sd.location_id IS NOT DISTINCT FROM r.location_id
  AND extract(dow from sd.date)::int = r.weekday;

-- 3. recurring_recipient_templates
CREATE TABLE IF NOT EXISTS public.recurring_recipient_templates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  rule_id uuid NOT NULL REFERENCES public.recurring_schedule_rules(id) ON DELETE CASCADE,
  household_id uuid NOT NULL REFERENCES public.recipient_households(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(rule_id, household_id)
);

ALTER TABLE public.recurring_recipient_templates ENABLE ROW LEVEL SECURITY;

CREATE POLICY templates_read ON public.recurring_recipient_templates
  FOR SELECT TO authenticated USING (true);

CREATE POLICY templates_admin_write ON public.recurring_recipient_templates
  FOR ALL TO authenticated USING (is_admin(auth.uid())) WITH CHECK (is_admin(auth.uid()));

-- 4. Updated generate_ministry_year that records rule_id and copies template recipients
CREATE OR REPLACE FUNCTION public.generate_ministry_year(_start_year integer)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
declare
  my_id uuid;
  start_date date := make_date(_start_year, 9, 1);
  end_date   date := make_date(_start_year + 1, 8, 31);
  d date;
  rule record;
  weeks_since int;
  new_sd_id uuid;
begin
  insert into public.ministry_years(start_year, label)
  values (_start_year, _start_year || '/' || (_start_year + 1))
  on conflict (start_year) do update set label = excluded.label
  returning id into my_id;

  for rule in select * from public.recurring_schedule_rules where active loop
    d := start_date;
    while extract(dow from d)::int <> rule.weekday loop
      d := d + 1;
    end loop;
    weeks_since := 0;
    while d <= end_date loop
      if rule.frequency = 'weekly' or (rule.frequency = 'biweekly' and weeks_since % 2 = 0) then
        insert into public.schedule_dates(ministry_year_id, date, location_id, rule_id)
        values (my_id, d, rule.location_id, rule.id)
        on conflict (date, location_id) do update set rule_id = excluded.rule_id
        returning id into new_sd_id;

        -- copy template recipients
        insert into public.date_recipients(schedule_date_id, household_id)
        select new_sd_id, t.household_id
        from public.recurring_recipient_templates t
        where t.rule_id = rule.id
        on conflict do nothing;
      end if;
      d := d + 7;
      weeks_since := weeks_since + 1;
    end loop;
  end loop;
  return my_id;
end;
$function$;

-- 5. apply_template_to_future
CREATE OR REPLACE FUNCTION public.apply_template_to_future(_rule_id uuid, _from_date date)
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
declare
  inserted_count int := 0;
begin
  if not is_admin(auth.uid()) then
    raise exception 'not authorized';
  end if;

  with sd as (
    select id from public.schedule_dates
    where rule_id = _rule_id and date >= _from_date
  ),
  ins as (
    insert into public.date_recipients(schedule_date_id, household_id)
    select sd.id, t.household_id
    from sd
    cross join public.recurring_recipient_templates t
    where t.rule_id = _rule_id
    and not exists (
      select 1 from public.date_recipients dr
      where dr.schedule_date_id = sd.id and dr.household_id = t.household_id
    )
    returning 1
  )
  select count(*) into inserted_count from ins;
  return inserted_count;
end;
$$;
