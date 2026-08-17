CREATE TABLE public.driver_pickup_households (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  person_id uuid NOT NULL,
  household_id uuid NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  UNIQUE (person_id, household_id)
);

ALTER TABLE public.driver_pickup_households ENABLE ROW LEVEL SECURITY;

CREATE POLICY "dph_read" ON public.driver_pickup_households FOR SELECT TO authenticated USING (true);
CREATE POLICY "dph_admin_write" ON public.driver_pickup_households FOR ALL TO authenticated USING (is_admin(auth.uid())) WITH CHECK (is_admin(auth.uid()));

ALTER TABLE public.date_recipients
  ADD COLUMN force_include boolean NOT NULL DEFAULT false;