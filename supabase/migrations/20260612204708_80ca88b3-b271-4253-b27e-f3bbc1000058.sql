
ALTER TABLE public.schedule_stops
  ADD COLUMN IF NOT EXISTS completed_at timestamptz,
  ADD COLUMN IF NOT EXISTS completed_by uuid REFERENCES public.people(id) ON DELETE SET NULL;

-- Update self-assign trigger so assigned driver/distributor can also toggle completion.
CREATE OR REPLACE FUNCTION public.enforce_stop_self_assign()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  me uuid := auth.uid();
  my_pid uuid;
  is_assigned boolean;
BEGIN
  IF me IS NULL OR public.is_admin(me) THEN RETURN NEW; END IF;
  SELECT id INTO my_pid FROM public.people WHERE profile_id = me LIMIT 1;
  is_assigned := my_pid IS NOT NULL
                 AND (OLD.driver_id = my_pid OR OLD.coordinator_id = my_pid);

  IF NEW.schedule_date_id IS DISTINCT FROM OLD.schedule_date_id
     OR NEW.location_id     IS DISTINCT FROM OLD.location_id
     OR NEW.rule_stop_id    IS DISTINCT FROM OLD.rule_stop_id
     OR NEW.sort_order      IS DISTINCT FROM OLD.sort_order
     OR NEW.notes           IS DISTINCT FROM OLD.notes THEN
    RAISE EXCEPTION 'not authorized: only assignment/completion fields may be changed';
  END IF;

  IF NEW.driver_id IS DISTINCT FROM OLD.driver_id THEN
    IF NOT public.has_role(me,'driver') THEN RAISE EXCEPTION 'not authorized: driver role required'; END IF;
    IF OLD.driver_id IS NOT NULL THEN RAISE EXCEPTION 'driver slot already assigned'; END IF;
    IF my_pid IS NULL OR NEW.driver_id IS DISTINCT FROM my_pid THEN
      RAISE EXCEPTION 'can only self-assign as driver';
    END IF;
  END IF;

  IF NEW.coordinator_id IS DISTINCT FROM OLD.coordinator_id THEN
    IF NOT public.has_role(me,'coordinator') THEN RAISE EXCEPTION 'not authorized: distributor role required'; END IF;
    IF OLD.coordinator_id IS NOT NULL THEN RAISE EXCEPTION 'distributor slot already assigned'; END IF;
    IF my_pid IS NULL OR NEW.coordinator_id IS DISTINCT FROM my_pid THEN
      RAISE EXCEPTION 'can only self-assign as distributor';
    END IF;
  END IF;

  IF NEW.completed_at IS DISTINCT FROM OLD.completed_at
     OR NEW.completed_by IS DISTINCT FROM OLD.completed_by THEN
    IF NOT is_assigned THEN
      RAISE EXCEPTION 'not authorized: only assigned driver/distributor can change completion';
    END IF;
    IF NEW.completed_at IS NOT NULL AND (NEW.completed_by IS NULL OR NEW.completed_by <> my_pid) THEN
      RAISE EXCEPTION 'completed_by must be the acting user';
    END IF;
    IF NEW.completed_at IS NULL AND NEW.completed_by IS NOT NULL THEN
      RAISE EXCEPTION 'completed_by must be null when not completed';
    END IF;
  END IF;

  RETURN NEW;
END
$function$;

-- Allow assigned driver/coordinator to UPDATE their own stop (trigger limits which fields).
DROP POLICY IF EXISTS "stops_complete_assigned" ON public.schedule_stops;
CREATE POLICY "stops_complete_assigned" ON public.schedule_stops
  FOR UPDATE TO authenticated
  USING (
    is_approved(auth.uid())
    AND my_person_id() IS NOT NULL
    AND (driver_id = my_person_id() OR coordinator_id = my_person_id())
  )
  WITH CHECK (
    is_approved(auth.uid())
    AND my_person_id() IS NOT NULL
    AND (driver_id = my_person_id() OR coordinator_id = my_person_id())
  );
