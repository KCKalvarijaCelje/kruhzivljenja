
-- 1. Extend email_templates with language + footer
ALTER TABLE public.email_templates
  ADD COLUMN IF NOT EXISTS language text NOT NULL DEFAULT 'sl',
  ADD COLUMN IF NOT EXISTS footer text;

-- Drop old unique on template_key alone (if present), add composite
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'email_templates_template_key_key'
  ) THEN
    ALTER TABLE public.email_templates DROP CONSTRAINT email_templates_template_key_key;
  END IF;
END $$;

CREATE UNIQUE INDEX IF NOT EXISTS email_templates_key_lang_uidx
  ON public.email_templates (template_key, language);

-- 2. Seed English versions for driver_* templates
INSERT INTO public.email_templates (template_key, language, subject, body, footer, placeholders, description)
VALUES
  ('driver_assignment', 'en',
   'New delivery assignment — {{date}}',
   E'Hello {{driver_name}},\n\nyou have been assigned as the driver for a food pickup:\n\nDate: {{date}}\nLocation: {{location}}\n{{#coordinator}}Coordinator: {{coordinator}}{{/coordinator}}\n\nThank you for your help!',
   E'Best regards,\nKruh življenja',
   ARRAY['driver_name','date','location','coordinator'],
   'Sent when a driver is newly assigned to a stop.'),
  ('driver_change', 'en',
   'Schedule change — {{date}}',
   E'Hello {{driver_name}},\n\nthere is an update to your assignment:\n\nDate: {{date}}\nLocation: {{location}}\n{{#coordinator}}Coordinator: {{coordinator}}{{/coordinator}}\n\nIf you have any questions, please contact the coordinator.',
   E'Best regards,\nKruh življenja',
   ARRAY['driver_name','date','location','coordinator'],
   'Sent when an assignment is changed (different driver/location/date).'),
  ('driver_reminder', 'en',
   'Reminder: you''re on the schedule tomorrow — {{date}}',
   E'Hello {{driver_name}},\n\nfriendly reminder that you are scheduled tomorrow for a food pickup:\n\nDate: {{date}}\nLocation: {{location}}\n{{#coordinator}}Coordinator: {{coordinator}}{{/coordinator}}\n\nThank you and have a great day!',
   'Kruh življenja',
   ARRAY['driver_name','date','location','coordinator'],
   '24-hour reminder before a scheduled pickup.')
ON CONFLICT (template_key, language) DO NOTHING;

-- 3. Seed test_email template (sl + en)
INSERT INTO public.email_templates (template_key, language, subject, body, footer, placeholders, description)
VALUES
  ('test_email', 'sl',
   'Testno sporočilo · {{app_name}}',
   E'Pozdravljen/a {{person_name}},\n\nto je testno sporočilo poslano iz administratorske strani ob {{date}} {{time}}.\nČe si ga prejel/a, pošiljatelj deluje pravilno.',
   E'Lep pozdrav,\n{{app_name}}',
   ARRAY['person_name','date','time','app_name'],
   'Sent by the Email Queue "Send test email" button.'),
  ('test_email', 'en',
   'Test message · {{app_name}}',
   E'Hello {{person_name}},\n\nthis is a test message sent from the admin Email Queue at {{date}} {{time}}.\nIf you received it, the sender is working correctly.',
   E'Best regards,\n{{app_name}}',
   ARRAY['person_name','date','time','app_name'],
   'Sent by the Email Queue "Send test email" button.')
ON CONFLICT (template_key, language) DO NOTHING;

-- Backfill footer for existing SL rows if null
UPDATE public.email_templates
   SET footer = E'Lep pozdrav,\nKruh življenja'
 WHERE language = 'sl'
   AND template_key IN ('driver_assignment','driver_change')
   AND footer IS NULL;

UPDATE public.email_templates
   SET footer = 'Kruh življenja'
 WHERE language = 'sl' AND template_key = 'driver_reminder' AND footer IS NULL;

-- 4. Brand settings (single row)
CREATE TABLE IF NOT EXISTS public.email_brand_settings (
  id integer PRIMARY KEY DEFAULT 1 CHECK (id = 1),
  app_name text NOT NULL DEFAULT 'KRUH ŽIVLJENJA',
  logo_url text,
  header_image_url text,
  primary_color text NOT NULL DEFAULT '#0a0a0a',
  footer_text text,
  updated_at timestamptz NOT NULL DEFAULT now(),
  updated_by uuid
);

GRANT SELECT, INSERT, UPDATE ON public.email_brand_settings TO authenticated;
GRANT ALL ON public.email_brand_settings TO service_role;

ALTER TABLE public.email_brand_settings ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS email_brand_admin_all ON public.email_brand_settings;
CREATE POLICY email_brand_admin_all ON public.email_brand_settings
  FOR ALL TO authenticated
  USING (is_admin(auth.uid()) AND is_approved(auth.uid()))
  WITH CHECK (is_admin(auth.uid()) AND is_approved(auth.uid()));

INSERT INTO public.email_brand_settings (id) VALUES (1) ON CONFLICT (id) DO NOTHING;
