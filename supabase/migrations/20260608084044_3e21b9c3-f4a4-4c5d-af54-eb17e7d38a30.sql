DROP POLICY IF EXISTS stops_self_assign ON public.schedule_stops;

CREATE POLICY stops_self_assign ON public.schedule_stops
FOR UPDATE TO authenticated
USING (
  public.is_approved(auth.uid())
  AND public.my_person_id() IS NOT NULL
  AND (
    (public.has_role(auth.uid(), 'driver'::public.app_role) AND driver_id IS NULL)
    OR
    (public.has_role(auth.uid(), 'coordinator'::public.app_role) AND coordinator_id IS NULL)
  )
)
WITH CHECK (
  public.is_approved(auth.uid())
  AND public.my_person_id() IS NOT NULL
  AND (
    (public.has_role(auth.uid(), 'driver'::public.app_role) AND driver_id = public.my_person_id())
    OR
    (public.has_role(auth.uid(), 'coordinator'::public.app_role) AND coordinator_id = public.my_person_id())
  )
);