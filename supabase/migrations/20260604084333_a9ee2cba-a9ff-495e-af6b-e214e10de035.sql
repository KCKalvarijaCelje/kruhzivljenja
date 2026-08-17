DROP POLICY IF EXISTS dnl_read ON public.driver_notification_log;
CREATE POLICY dnl_admin_read ON public.driver_notification_log
  FOR SELECT TO authenticated
  USING (is_admin(auth.uid()) AND is_approved(auth.uid()));

DROP POLICY IF EXISTS email_templates_read ON public.email_templates;
CREATE POLICY email_templates_admin_read ON public.email_templates
  FOR SELECT TO authenticated
  USING (is_admin(auth.uid()) AND is_approved(auth.uid()));