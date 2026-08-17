
-- Rewrite generate_ministry_year: schedule_stops has no (schedule_date_id, location_id)
-- unique constraint, so use NOT EXISTS instead of ON CONFLICT. Existing rows are preserved
-- (we only insert when no stop for that rule_stop_id or same location exists on that date).
CREATE OR REPLACE FUNCTION public.generate_ministry_year(_start_year integer)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  my_id uuid;
  start_date date := make_date(_start_year, 9, 1);
  end_date   date := make_date(_start_year + 1, 8, 31);
  d date;
  rule record;
  rs record;
  weeks_since int;
  sd_id uuid;
BEGIN
  INSERT INTO public.ministry_years(start_year, label)
  VALUES (_start_year, _start_year || '/' || (_start_year + 1))
  ON CONFLICT (start_year) DO UPDATE SET label = excluded.label
  RETURNING id INTO my_id;

  FOR rule IN SELECT * FROM public.recurring_schedule_rules WHERE active LOOP
    d := start_date;
    WHILE extract(dow from d)::int <> rule.weekday LOOP d := d + 1; END LOOP;
    weeks_since := 0;
    WHILE d <= end_date LOOP
      IF rule.frequency = 'weekly'
         OR (rule.frequency = 'biweekly' AND weeks_since % 2 = 0) THEN
        INSERT INTO public.schedule_dates(ministry_year_id, date)
        VALUES (my_id, d)
        ON CONFLICT (ministry_year_id, date) DO UPDATE SET ministry_year_id = excluded.ministry_year_id
        RETURNING id INTO sd_id;

        FOR rs IN
          SELECT * FROM public.recurring_schedule_rule_stops
          WHERE rule_id = rule.id ORDER BY sort_order
        LOOP
          IF NOT EXISTS (
            SELECT 1 FROM public.schedule_stops ss
            WHERE ss.schedule_date_id = sd_id
              AND (ss.rule_stop_id = rs.id OR ss.location_id = rs.location_id)
          ) THEN
            INSERT INTO public.schedule_stops(schedule_date_id, location_id, driver_id, coordinator_id, rule_stop_id, sort_order)
            VALUES (sd_id, rs.location_id, rs.default_driver_id, rs.default_coordinator_id, rs.id, rs.sort_order);
          END IF;
        END LOOP;

        INSERT INTO public.date_recipients(schedule_date_id, household_id)
        SELECT sd_id, t.household_id
        FROM public.recurring_recipient_templates t
        WHERE t.rule_id = rule.id
          AND NOT EXISTS (
            SELECT 1 FROM public.date_recipients dr
            WHERE dr.schedule_date_id = sd_id AND dr.household_id = t.household_id
          );
      END IF;
      d := d + 7;
      weeks_since := weeks_since + 1;
    END LOOP;
  END LOOP;
  RETURN my_id;
END;
$$;

-- Auto-regenerate trigger so new rules/stops flow into existing ministry years.
CREATE OR REPLACE FUNCTION public.regenerate_all_ministry_years()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  y record;
BEGIN
  FOR y IN SELECT start_year FROM public.ministry_years LOOP
    PERFORM public.generate_ministry_year(y.start_year);
  END LOOP;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_regen_on_rule_insert ON public.recurring_schedule_rules;
CREATE TRIGGER trg_regen_on_rule_insert
AFTER INSERT ON public.recurring_schedule_rules
FOR EACH ROW EXECUTE FUNCTION public.regenerate_all_ministry_years();

DROP TRIGGER IF EXISTS trg_regen_on_rule_stop_insert ON public.recurring_schedule_rule_stops;
CREATE TRIGGER trg_regen_on_rule_stop_insert
AFTER INSERT ON public.recurring_schedule_rule_stops
FOR EACH ROW EXECUTE FUNCTION public.regenerate_all_ministry_years();

-- Backfill: materialize any currently missing entries (e.g. the new Tue bi-weekly stop).
DO $$
DECLARE
  y record;
BEGIN
  FOR y IN SELECT start_year FROM public.ministry_years LOOP
    PERFORM public.generate_ministry_year(y.start_year);
  END LOOP;
END$$;
