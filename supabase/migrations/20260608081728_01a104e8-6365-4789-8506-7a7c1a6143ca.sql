
-- Helper: current user's people.id (if linked)
CREATE OR REPLACE FUNCTION public.my_person_id()
RETURNS uuid LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$ SELECT id FROM public.people WHERE profile_id = auth.uid() LIMIT 1 $$;

GRANT EXECUTE ON FUNCTION public.my_person_id() TO authenticated;

-- Trigger: non-admins may only touch their OWN slot of driver_id/coordinator_id,
-- only when that slot was previously NULL, and only by setting it to themselves.
-- All other columns are immutable for non-admins.
CREATE OR REPLACE FUNCTION public.enforce_stop_self_assign()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  me uuid := auth.uid();
  my_pid uuid;
BEGIN
  IF me IS NULL OR public.is_admin(me) THEN RETURN NEW; END IF;
  SELECT id INTO my_pid FROM public.people WHERE profile_id = me LIMIT 1;

  IF NEW.schedule_date_id IS DISTINCT FROM OLD.schedule_date_id
     OR NEW.location_id     IS DISTINCT FROM OLD.location_id
     OR NEW.rule_stop_id    IS DISTINCT FROM OLD.rule_stop_id
     OR NEW.sort_order      IS DISTINCT FROM OLD.sort_order
     OR NEW.notes           IS DISTINCT FROM OLD.notes THEN
    RAISE EXCEPTION 'not authorized: only assignment fields may be changed';
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

  RETURN NEW;
END$$;

DROP TRIGGER IF EXISTS enforce_stop_self_assign_trg ON public.schedule_stops;
CREATE TRIGGER enforce_stop_self_assign_trg
BEFORE UPDATE ON public.schedule_stops
FOR EACH ROW EXECUTE FUNCTION public.enforce_stop_self_assign();

-- Tighten RLS: replace broad coordinator policy with narrow self-assign for driver+coord.
DROP POLICY IF EXISTS stops_coord_update ON public.schedule_stops;
CREATE POLICY stops_self_assign ON public.schedule_stops
FOR UPDATE TO authenticated
USING (
  public.is_approved(auth.uid())
  AND (public.has_role(auth.uid(),'driver') OR public.has_role(auth.uid(),'coordinator'))
)
WITH CHECK (
  public.is_approved(auth.uid())
  AND (public.has_role(auth.uid(),'driver') OR public.has_role(auth.uid(),'coordinator'))
);

-- Remove driver/coord write access on schedule_dates (notes, etc.) — admin only.
DROP POLICY IF EXISTS schedule_assigned_update ON public.schedule_dates;

-- Remove broad coordinator write on date_recipients — admin only.
DROP POLICY IF EXISTS date_recipients_coord_write ON public.date_recipients;
