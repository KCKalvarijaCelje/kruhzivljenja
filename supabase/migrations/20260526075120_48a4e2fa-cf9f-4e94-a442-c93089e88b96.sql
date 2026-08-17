
-- Editable email templates (admin-managed)
CREATE TABLE public.email_templates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  template_key text NOT NULL UNIQUE,
  subject text NOT NULL,
  body text NOT NULL,
  description text,
  placeholders text[] NOT NULL DEFAULT '{}',
  updated_at timestamptz NOT NULL DEFAULT now(),
  updated_by uuid
);

ALTER TABLE public.email_templates ENABLE ROW LEVEL SECURITY;

CREATE POLICY email_templates_read ON public.email_templates
  FOR SELECT TO authenticated USING (is_approved(auth.uid()));

CREATE POLICY email_templates_admin_write ON public.email_templates
  FOR ALL TO authenticated
  USING (is_admin(auth.uid()) AND is_approved(auth.uid()))
  WITH CHECK (is_admin(auth.uid()) AND is_approved(auth.uid()));

CREATE TRIGGER email_templates_touch
  BEFORE UPDATE ON public.email_templates
  FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

-- Seed defaults (Slovenian primary text; placeholders documented)
INSERT INTO public.email_templates (template_key, subject, body, description, placeholders) VALUES
('driver_assignment',
 'Nov razpored prevoza — {{date}}',
 'Pozdravljen/a {{driver_name}},

dodeljen/a si kot voznik/ica za prevzem hrane:

Datum: {{date}}
Lokacija: {{location}}
{{#coordinator}}Koordinator/ica: {{coordinator}}{{/coordinator}}

Hvala za tvojo pomoč!

Lep pozdrav,
Kruh življenja',
 'Sent when a driver is newly assigned to a stop.',
 ARRAY['driver_name','date','location','coordinator']),

('driver_change',
 'Sprememba razporeda — {{date}}',
 'Pozdravljen/a {{driver_name}},

obveščamo te o spremembi na tvoji dodelitvi:

Datum: {{date}}
Lokacija: {{location}}
{{#coordinator}}Koordinator/ica: {{coordinator}}{{/coordinator}}

Če imaš vprašanja, se obrni na koordinatorja.

Lep pozdrav,
Kruh življenja',
 'Sent when an existing assignment changes (date/location/coordinator).',
 ARRAY['driver_name','date','location','coordinator']),

('driver_reminder',
 'Opomnik: jutri si na vrsti — {{date}}',
 'Pozdravljen/a {{driver_name}},

prijazno te opominjamo, da si jutri dodeljen/a za prevzem hrane:

Datum: {{date}}
Lokacija: {{location}}
{{#coordinator}}Koordinator/ica: {{coordinator}}{{/coordinator}}

Hvala in lep dan!

Kruh življenja',
 'Sent the day before the assignment as a reminder.',
 ARRAY['driver_name','date','location','coordinator']);

-- Notification log
CREATE TABLE public.driver_notification_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  schedule_stop_id uuid NOT NULL,
  driver_person_id uuid NOT NULL,
  notification_type text NOT NULL CHECK (notification_type IN ('assignment','change','reminder')),
  recipient_email text NOT NULL,
  status text NOT NULL DEFAULT 'queued',
  message_id text,
  error_message text,
  sent_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_dnl_stop ON public.driver_notification_log(schedule_stop_id);
CREATE INDEX idx_dnl_driver_type ON public.driver_notification_log(driver_person_id, notification_type);

ALTER TABLE public.driver_notification_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY dnl_read ON public.driver_notification_log
  FOR SELECT TO authenticated USING (is_approved(auth.uid()));

CREATE POLICY dnl_admin_write ON public.driver_notification_log
  FOR ALL TO authenticated
  USING (is_admin(auth.uid()) AND is_approved(auth.uid()))
  WITH CHECK (is_admin(auth.uid()) AND is_approved(auth.uid()));
