
-- 1. Add approval_status column
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS approval_status text NOT NULL DEFAULT 'pending'
    CHECK (approval_status IN ('pending', 'approved', 'rejected')),
  ADD COLUMN IF NOT EXISTS approved_at timestamptz,
  ADD COLUMN IF NOT EXISTS approved_by uuid;

-- 2. Backfill: existing admins => approved (preserves admin access)
UPDATE public.profiles
SET approval_status = 'approved', approved_at = now()
WHERE id IN (SELECT user_id FROM public.user_roles WHERE role = 'admin');

-- 3. All other existing users stay 'pending' (default) per request

-- 4. is_approved security definer function
CREATE OR REPLACE FUNCTION public.is_approved(_user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = _user_id AND approval_status = 'approved'
  )
$$;

-- 5. Update handle_new_user: new signups start pending (but first user still becomes admin+approved)
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
declare
  user_count int;
  is_first boolean;
begin
  select count(*) = 0 into is_first from public.user_roles;

  insert into public.profiles (id, full_name, email, approval_status, approved_at)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'name', split_part(new.email,'@',1)),
    new.email,
    case when is_first then 'approved' else 'pending' end,
    case when is_first then now() else null end
  )
  on conflict (id) do nothing;

  if is_first then
    insert into public.user_roles(user_id, role) values (new.id, 'admin')
    on conflict do nothing;
  end if;
  return new;
end;
$$;

-- 6. Tighten RLS: require is_approved on sensitive tables

-- people: restrict reads + writes to approved users
DROP POLICY IF EXISTS people_read ON public.people;
DROP POLICY IF EXISTS people_admin_write ON public.people;
CREATE POLICY people_read ON public.people FOR SELECT TO authenticated
  USING (public.is_approved(auth.uid()));
CREATE POLICY people_admin_write ON public.people FOR ALL TO authenticated
  USING (public.is_admin(auth.uid()) AND public.is_approved(auth.uid()))
  WITH CHECK (public.is_admin(auth.uid()) AND public.is_approved(auth.uid()));

-- people_roles
DROP POLICY IF EXISTS people_roles_read ON public.people_roles;
DROP POLICY IF EXISTS people_roles_admin_write ON public.people_roles;
CREATE POLICY people_roles_read ON public.people_roles FOR SELECT TO authenticated
  USING (public.is_approved(auth.uid()));
CREATE POLICY people_roles_admin_write ON public.people_roles FOR ALL TO authenticated
  USING (public.is_admin(auth.uid()) AND public.is_approved(auth.uid()))
  WITH CHECK (public.is_admin(auth.uid()) AND public.is_approved(auth.uid()));

-- recipient_households
DROP POLICY IF EXISTS households_read ON public.recipient_households;
DROP POLICY IF EXISTS households_admin_write ON public.recipient_households;
CREATE POLICY households_read ON public.recipient_households FOR SELECT TO authenticated
  USING (public.is_approved(auth.uid()));
CREATE POLICY households_admin_write ON public.recipient_households FOR ALL TO authenticated
  USING (public.is_admin(auth.uid()) AND public.is_approved(auth.uid()))
  WITH CHECK (public.is_admin(auth.uid()) AND public.is_approved(auth.uid()));

-- household_members
DROP POLICY IF EXISTS members_read ON public.household_members;
DROP POLICY IF EXISTS members_admin_write ON public.household_members;
CREATE POLICY members_read ON public.household_members FOR SELECT TO authenticated
  USING (public.is_approved(auth.uid()));
CREATE POLICY members_admin_write ON public.household_members FOR ALL TO authenticated
  USING (public.is_admin(auth.uid()) AND public.is_approved(auth.uid()))
  WITH CHECK (public.is_admin(auth.uid()) AND public.is_approved(auth.uid()));

-- driver_pickup_households
DROP POLICY IF EXISTS dph_read ON public.driver_pickup_households;
DROP POLICY IF EXISTS dph_admin_write ON public.driver_pickup_households;
CREATE POLICY dph_read ON public.driver_pickup_households FOR SELECT TO authenticated
  USING (public.is_approved(auth.uid()));
CREATE POLICY dph_admin_write ON public.driver_pickup_households FOR ALL TO authenticated
  USING (public.is_admin(auth.uid()) AND public.is_approved(auth.uid()))
  WITH CHECK (public.is_admin(auth.uid()) AND public.is_approved(auth.uid()));

-- date_recipients: keep reads open for planner; restrict writes
DROP POLICY IF EXISTS date_recipients_read ON public.date_recipients;
DROP POLICY IF EXISTS date_recipients_admin_write ON public.date_recipients;
DROP POLICY IF EXISTS date_recipients_coord_write ON public.date_recipients;
CREATE POLICY date_recipients_read ON public.date_recipients FOR SELECT TO authenticated
  USING (public.is_approved(auth.uid()));
CREATE POLICY date_recipients_admin_write ON public.date_recipients FOR ALL TO authenticated
  USING (public.is_admin(auth.uid()) AND public.is_approved(auth.uid()))
  WITH CHECK (public.is_admin(auth.uid()) AND public.is_approved(auth.uid()));
CREATE POLICY date_recipients_coord_write ON public.date_recipients FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'coordinator') AND public.is_approved(auth.uid()))
  WITH CHECK (public.has_role(auth.uid(), 'coordinator') AND public.is_approved(auth.uid()));

-- schedule_stops: writes require approval
DROP POLICY IF EXISTS stops_admin_write ON public.schedule_stops;
DROP POLICY IF EXISTS stops_coord_update ON public.schedule_stops;
CREATE POLICY stops_admin_write ON public.schedule_stops FOR ALL TO authenticated
  USING (public.is_admin(auth.uid()) AND public.is_approved(auth.uid()))
  WITH CHECK (public.is_admin(auth.uid()) AND public.is_approved(auth.uid()));
CREATE POLICY stops_coord_update ON public.schedule_stops FOR UPDATE TO authenticated
  USING (public.has_role(auth.uid(), 'coordinator') AND public.is_approved(auth.uid()))
  WITH CHECK (public.has_role(auth.uid(), 'coordinator') AND public.is_approved(auth.uid()));

-- schedule_dates writes
DROP POLICY IF EXISTS schedule_admin_write ON public.schedule_dates;
DROP POLICY IF EXISTS schedule_assigned_update ON public.schedule_dates;
CREATE POLICY schedule_admin_write ON public.schedule_dates FOR ALL TO authenticated
  USING (public.is_admin(auth.uid()) AND public.is_approved(auth.uid()))
  WITH CHECK (public.is_admin(auth.uid()) AND public.is_approved(auth.uid()));
CREATE POLICY schedule_assigned_update ON public.schedule_dates FOR UPDATE TO authenticated
  USING ((public.has_role(auth.uid(), 'driver') OR public.has_role(auth.uid(), 'coordinator')) AND public.is_approved(auth.uid()))
  WITH CHECK ((public.has_role(auth.uid(), 'driver') OR public.has_role(auth.uid(), 'coordinator')) AND public.is_approved(auth.uid()));

-- locations writes
DROP POLICY IF EXISTS locations_admin_write ON public.locations;
CREATE POLICY locations_admin_write ON public.locations FOR ALL TO authenticated
  USING (public.is_admin(auth.uid()) AND public.is_approved(auth.uid()))
  WITH CHECK (public.is_admin(auth.uid()) AND public.is_approved(auth.uid()));

-- ministry_years writes
DROP POLICY IF EXISTS years_admin_write ON public.ministry_years;
CREATE POLICY years_admin_write ON public.ministry_years FOR ALL TO authenticated
  USING (public.is_admin(auth.uid()) AND public.is_approved(auth.uid()))
  WITH CHECK (public.is_admin(auth.uid()) AND public.is_approved(auth.uid()));

-- recurring_schedule_rules writes
DROP POLICY IF EXISTS rules_admin_write ON public.recurring_schedule_rules;
CREATE POLICY rules_admin_write ON public.recurring_schedule_rules FOR ALL TO authenticated
  USING (public.is_admin(auth.uid()) AND public.is_approved(auth.uid()))
  WITH CHECK (public.is_admin(auth.uid()) AND public.is_approved(auth.uid()));

-- recurring_schedule_rule_stops writes
DROP POLICY IF EXISTS rule_stops_admin_write ON public.recurring_schedule_rule_stops;
CREATE POLICY rule_stops_admin_write ON public.recurring_schedule_rule_stops FOR ALL TO authenticated
  USING (public.is_admin(auth.uid()) AND public.is_approved(auth.uid()))
  WITH CHECK (public.is_admin(auth.uid()) AND public.is_approved(auth.uid()));

-- recurring_recipient_templates writes
DROP POLICY IF EXISTS templates_admin_write ON public.recurring_recipient_templates;
CREATE POLICY templates_admin_write ON public.recurring_recipient_templates FOR ALL TO authenticated
  USING (public.is_admin(auth.uid()) AND public.is_approved(auth.uid()))
  WITH CHECK (public.is_admin(auth.uid()) AND public.is_approved(auth.uid()));

-- user_roles writes (admin only)
DROP POLICY IF EXISTS user_roles_admin_write ON public.user_roles;
CREATE POLICY user_roles_admin_write ON public.user_roles FOR ALL TO authenticated
  USING (public.is_admin(auth.uid()) AND public.is_approved(auth.uid()))
  WITH CHECK (public.is_admin(auth.uid()) AND public.is_approved(auth.uid()));
