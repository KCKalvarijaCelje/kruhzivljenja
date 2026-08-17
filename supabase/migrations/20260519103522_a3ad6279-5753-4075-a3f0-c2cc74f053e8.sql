-- 1. Rewrite generator so location_id is always set and conflict is keyed on (date, location_id)
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

  for rule in
    select * from public.recurring_schedule_rules
    where active and location_id is not null
  loop
    d := start_date;
    while extract(dow from d)::int <> rule.weekday loop
      d := d + 1;
    end loop;
    weeks_since := 0;
    while d <= end_date loop
      if rule.frequency = 'weekly'
         or (rule.frequency = 'biweekly' and weeks_since % 2 = 0) then
        insert into public.schedule_dates(ministry_year_id, date, location_id, rule_id)
        values (my_id, d, rule.location_id, rule.id)
        on conflict (date, location_id) do update
          set rule_id = excluded.rule_id,
              ministry_year_id = excluded.ministry_year_id
        returning id into new_sd_id;

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

-- 2. Remove previously generated empty entries (keep anything with real data)
DELETE FROM public.schedule_dates sd
WHERE sd.driver_id IS NULL
  AND sd.coordinator_id IS NULL
  AND (sd.notes IS NULL OR sd.notes = '')
  AND NOT EXISTS (
    SELECT 1 FROM public.date_recipients dr WHERE dr.schedule_date_id = sd.id
  );

-- 3. Regenerate the current ministry year(s) using the fixed function
DO $$
DECLARE
  y record;
BEGIN
  FOR y IN SELECT start_year FROM public.ministry_years LOOP
    PERFORM public.generate_ministry_year(y.start_year);
  END LOOP;
END $$;