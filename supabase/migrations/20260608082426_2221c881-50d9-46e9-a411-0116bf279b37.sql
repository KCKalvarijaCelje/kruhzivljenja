DROP POLICY IF EXISTS stops_self_assign ON public.schedule_stops;

CREATE POLICY stops_self_assign ON public.schedule_stops
FOR UPDATE
USING (
  is_approved(auth.uid())
  AND (
    (has_role(auth.uid(), 'driver'::app_role)
       AND (driver_id IS NULL OR driver_id = public.my_person_id()))
    OR
    (has_role(auth.uid(), 'coordinator'::app_role)
       AND (coordinator_id IS NULL OR coordinator_id = public.my_person_id()))
  )
)
WITH CHECK (
  is_approved(auth.uid())
  AND (driver_id IS NULL OR driver_id = public.my_person_id())
  AND (coordinator_id IS NULL OR coordinator_id = public.my_person_id())
);