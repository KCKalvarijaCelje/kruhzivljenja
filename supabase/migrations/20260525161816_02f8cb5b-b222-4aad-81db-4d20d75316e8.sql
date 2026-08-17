
-- 1. Tighten profiles SELECT: only self, approved users, or admin can read
DROP POLICY IF EXISTS profiles_read ON public.profiles;
CREATE POLICY profiles_read ON public.profiles
  FOR SELECT TO authenticated
  USING (auth.uid() = id OR is_approved(auth.uid()) OR is_admin(auth.uid()));

-- 2. Tighten user_roles SELECT: self, approved users, or admin
DROP POLICY IF EXISTS user_roles_read ON public.user_roles;
CREATE POLICY user_roles_read ON public.user_roles
  FOR SELECT TO authenticated
  USING (auth.uid() = user_id OR is_approved(auth.uid()) OR is_admin(auth.uid()));

-- 3. Restrict operational read policies to approved users
DROP POLICY IF EXISTS schedule_read ON public.schedule_dates;
CREATE POLICY schedule_read ON public.schedule_dates
  FOR SELECT TO authenticated USING (is_approved(auth.uid()));

DROP POLICY IF EXISTS stops_read ON public.schedule_stops;
CREATE POLICY stops_read ON public.schedule_stops
  FOR SELECT TO authenticated USING (is_approved(auth.uid()));

DROP POLICY IF EXISTS rules_read ON public.recurring_schedule_rules;
CREATE POLICY rules_read ON public.recurring_schedule_rules
  FOR SELECT TO authenticated USING (is_approved(auth.uid()));

DROP POLICY IF EXISTS rule_stops_read ON public.recurring_schedule_rule_stops;
CREATE POLICY rule_stops_read ON public.recurring_schedule_rule_stops
  FOR SELECT TO authenticated USING (is_approved(auth.uid()));

DROP POLICY IF EXISTS locations_read ON public.locations;
CREATE POLICY locations_read ON public.locations
  FOR SELECT TO authenticated USING (is_approved(auth.uid()));

DROP POLICY IF EXISTS years_read ON public.ministry_years;
CREATE POLICY years_read ON public.ministry_years
  FOR SELECT TO authenticated USING (is_approved(auth.uid()));

DROP POLICY IF EXISTS templates_read ON public.recurring_recipient_templates;
CREATE POLICY templates_read ON public.recurring_recipient_templates
  FOR SELECT TO authenticated USING (is_approved(auth.uid()));

-- 4. Set immutable search_path on touch_updated_at trigger function
CREATE OR REPLACE FUNCTION public.touch_updated_at()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $$
begin new.updated_at = now(); return new; end;
$$;

-- 5. Lock down SECURITY DEFINER functions that should not be callable by anon
REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.touch_updated_at() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.generate_ministry_year(integer) FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.apply_template_to_future(uuid, date) FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.apply_assignments_to_future(uuid, date, boolean) FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.apply_person_to_future(uuid, date, text, uuid, boolean) FROM PUBLIC, anon;
