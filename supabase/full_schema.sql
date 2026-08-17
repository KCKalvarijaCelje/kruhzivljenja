-- =============================================================================
-- KRUH ŽIVLJENJA (Bread of Life) - FULL CONSOLIDATED DATABASE SCHEMA & MIGRATIONS
-- Project ID: qgocuxupqanlvfxsazqp
--
-- This script contains all 38 migrations in chronological order, allowing you
-- to initialize or recreate the entire database in a single execution.
-- =============================================================================

-- =============================================================================
-- 1. BASE TYPES, TABLES & SECURITY HELPERS
-- =============================================================================

-- Roles enum
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'app_role') THEN
    CREATE TYPE public.app_role AS ENUM ('admin','driver','coordinator','recipient','volunteer');
  END IF;
END $$;

-- Profiles (linked to auth users)
CREATE TABLE IF NOT EXISTS public.profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name text,
  email text,
  phone text,
  notes text,
  active boolean NOT NULL DEFAULT true,
  approval_status text NOT NULL DEFAULT 'pending' CHECK (approval_status IN ('pending', 'approved', 'rejected')),
  approved_at timestamptz,
  approved_by uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- People (directory of volunteers, drivers, recipients)
CREATE TABLE IF NOT EXISTS public.people (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  full_name text NOT NULL,
  first_name text,
  last_name text,
  phone text,
  email text,
  notes text,
  active boolean NOT NULL DEFAULT true,
  needs_name_review boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX IF NOT EXISTS people_profile_id_unique
  ON public.people(profile_id) WHERE profile_id IS NOT NULL;

-- User roles
CREATE TABLE IF NOT EXISTS public.user_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role app_role NOT NULL,
  UNIQUE (user_id, role)
);

-- People roles
CREATE TABLE IF NOT EXISTS public.people_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  person_id uuid NOT NULL REFERENCES public.people(id) ON DELETE CASCADE,
  role app_role NOT NULL,
  UNIQUE (person_id, role)
);

-- Recipient households
CREATE TABLE IF NOT EXISTS public.recipient_households (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  person_id uuid UNIQUE REFERENCES public.people(id) ON DELETE SET NULL,
  name text NOT NULL,
  first_name text,
  last_name text,
  contact_name text,
  phone text,
  address text,
  notes text,
  active boolean NOT NULL DEFAULT true,
  size int NOT NULL DEFAULT 1,
  needs_name_review boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_recipient_households_person ON public.recipient_households(person_id);

CREATE TABLE IF NOT EXISTS public.household_members (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  household_id uuid NOT NULL REFERENCES public.recipient_households(id) ON DELETE CASCADE,
  person_id uuid REFERENCES public.people(id) ON DELETE SET NULL,
  full_name text NOT NULL,
  notes text
);

-- Ministry years (Sep 1 - Aug 31)
CREATE TABLE IF NOT EXISTS public.ministry_years (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  start_year int NOT NULL UNIQUE,
  label text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Locations
CREATE TABLE IF NOT EXISTS public.locations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  address text,
  active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Recurring schedule rules
CREATE TABLE IF NOT EXISTS public.recurring_schedule_rules (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  weekday int NOT NULL CHECK (weekday BETWEEN 0 AND 6),
  frequency text NOT NULL DEFAULT 'weekly' CHECK (frequency IN ('weekly','biweekly')),
  active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT recurring_schedule_rules_weekday_frequency_key UNIQUE (weekday, frequency)
);

-- Recurring rule stops
CREATE TABLE IF NOT EXISTS public.recurring_schedule_rule_stops (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  rule_id uuid NOT NULL REFERENCES public.recurring_schedule_rules(id) ON DELETE CASCADE,
  location_id uuid NOT NULL REFERENCES public.locations(id) ON DELETE CASCADE,
  default_driver_id uuid REFERENCES public.people(id) ON DELETE SET NULL,
  default_coordinator_id uuid REFERENCES public.people(id) ON DELETE SET NULL,
  sort_order int NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(rule_id, location_id)
);

-- Recurring recipient templates
CREATE TABLE IF NOT EXISTS public.recurring_recipient_templates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  rule_id uuid NOT NULL REFERENCES public.recurring_schedule_rules(id) ON DELETE CASCADE,
  household_id uuid NOT NULL REFERENCES public.recipient_households(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(rule_id, household_id)
);

-- Schedule dates
CREATE TABLE IF NOT EXISTS public.schedule_dates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  ministry_year_id uuid NOT NULL REFERENCES public.ministry_years(id) ON DELETE CASCADE,
  date date NOT NULL,
  notes text,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','complete','cancelled')),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT schedule_dates_year_date_uniq UNIQUE (ministry_year_id, date)
);

-- Schedule stops
CREATE TABLE IF NOT EXISTS public.schedule_stops (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  schedule_date_id uuid NOT NULL REFERENCES public.schedule_dates(id) ON DELETE CASCADE,
  location_id uuid REFERENCES public.locations(id) ON DELETE SET NULL,
  driver_id uuid REFERENCES public.people(id) ON DELETE SET NULL,
  coordinator_id uuid REFERENCES public.people(id) ON DELETE SET NULL,
  rule_stop_id uuid REFERENCES public.recurring_schedule_rule_stops(id) ON DELETE SET NULL,
  notes text,
  sort_order int NOT NULL DEFAULT 0,
  completed_at timestamptz,
  completed_by uuid REFERENCES public.people(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Date recipients
CREATE TABLE IF NOT EXISTS public.date_recipients (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  schedule_date_id uuid NOT NULL REFERENCES public.schedule_dates(id) ON DELETE CASCADE,
  household_id uuid REFERENCES public.recipient_households(id) ON DELETE SET NULL,
  person_id uuid REFERENCES public.people(id) ON DELETE SET NULL,
  manual_name text,
  notes text,
  force_include boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Driver pickup households
CREATE TABLE IF NOT EXISTS public.driver_pickup_households (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  person_id uuid NOT NULL REFERENCES public.people(id) ON DELETE CASCADE,
  household_id uuid NOT NULL REFERENCES public.recipient_households(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (person_id, household_id)
);

-- Person-Profile Link Audit
CREATE TABLE IF NOT EXISTS public.person_profile_link_audit (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  person_id uuid,
  profile_id uuid,
  action text NOT NULL CHECK (action IN ('linked','created','unlinked','role_added','role_removed')),
  role text,
  actor_id uuid,
  details jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_ppla_profile ON public.person_profile_link_audit(profile_id);
CREATE INDEX IF NOT EXISTS idx_ppla_person ON public.person_profile_link_audit(person_id);

-- Stop Messages
CREATE TABLE IF NOT EXISTS public.stop_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  schedule_stop_id uuid NOT NULL REFERENCES public.schedule_stops(id) ON DELETE CASCADE,
  author_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  author_name text NOT NULL,
  body text NOT NULL CHECK (char_length(body) BETWEEN 1 AND 2000),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS stop_messages_stop_created_idx ON public.stop_messages (schedule_stop_id, created_at DESC);

-- =============================================================================
-- 2. EMAIL INFRASTRUCTURE & SETTINGS
-- =============================================================================

CREATE EXTENSION IF NOT EXISTS pg_net SCHEMA extensions;
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_extension WHERE extname = 'pg_cron') THEN
    CREATE EXTENSION pg_cron;
  END IF;
EXCEPTION WHEN OTHERS THEN NULL;
END $$;
CREATE EXTENSION IF NOT EXISTS supabase_vault;
CREATE EXTENSION IF NOT EXISTS pgmq;

DO $$ BEGIN PERFORM pgmq.create('auth_emails'); EXCEPTION WHEN OTHERS THEN NULL; END $$;
DO $$ BEGIN PERFORM pgmq.create('transactional_emails'); EXCEPTION WHEN OTHERS THEN NULL; END $$;
DO $$ BEGIN PERFORM pgmq.create('auth_emails_dlq'); EXCEPTION WHEN OTHERS THEN NULL; END $$;
DO $$ BEGIN PERFORM pgmq.create('transactional_emails_dlq'); EXCEPTION WHEN OTHERS THEN NULL; END $$;

CREATE TABLE IF NOT EXISTS public.email_send_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  message_id TEXT,
  provider_message_id TEXT,
  provider_response JSONB,
  template_name TEXT NOT NULL,
  recipient_email TEXT NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('pending', 'sent', 'suppressed', 'failed', 'bounced', 'complained', 'dlq')),
  error_message TEXT,
  metadata JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_email_send_log_created ON public.email_send_log(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_email_send_log_recipient ON public.email_send_log(recipient_email);
CREATE INDEX IF NOT EXISTS idx_email_send_log_message ON public.email_send_log(message_id);
CREATE INDEX IF NOT EXISTS idx_email_send_log_provider_message_id ON public.email_send_log(provider_message_id) WHERE provider_message_id IS NOT NULL;
CREATE UNIQUE INDEX IF NOT EXISTS idx_email_send_log_message_sent_unique ON public.email_send_log(message_id) WHERE status = 'sent';

CREATE TABLE IF NOT EXISTS public.email_send_state (
  id INT PRIMARY KEY DEFAULT 1 CHECK (id = 1),
  retry_after_until TIMESTAMPTZ,
  batch_size INTEGER NOT NULL DEFAULT 10,
  send_delay_ms INTEGER NOT NULL DEFAULT 200,
  auth_email_ttl_minutes INTEGER NOT NULL DEFAULT 15,
  transactional_email_ttl_minutes INTEGER NOT NULL DEFAULT 60,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

INSERT INTO public.email_send_state (id) VALUES (1) ON CONFLICT (id) DO NOTHING;

CREATE TABLE IF NOT EXISTS public.suppressed_emails (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT NOT NULL UNIQUE,
  reason TEXT NOT NULL CHECK (reason IN ('unsubscribe', 'bounce', 'complaint')),
  metadata JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_suppressed_emails_email ON public.suppressed_emails(email);

CREATE TABLE IF NOT EXISTS public.email_unsubscribe_tokens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  token TEXT NOT NULL UNIQUE,
  email TEXT NOT NULL UNIQUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  used_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_unsubscribe_tokens_token ON public.email_unsubscribe_tokens(token);

CREATE TABLE IF NOT EXISTS public.email_templates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  template_key text NOT NULL,
  language text NOT NULL DEFAULT 'sl',
  subject text NOT NULL,
  body text NOT NULL,
  footer text,
  description text,
  placeholders text[] NOT NULL DEFAULT '{}',
  updated_at timestamptz NOT NULL DEFAULT now(),
  updated_by uuid
);

CREATE UNIQUE INDEX IF NOT EXISTS email_templates_key_lang_uidx
  ON public.email_templates (template_key, language);

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

INSERT INTO public.email_brand_settings (id) VALUES (1) ON CONFLICT (id) DO NOTHING;

CREATE TABLE IF NOT EXISTS public.driver_notification_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  schedule_stop_id uuid NOT NULL REFERENCES public.schedule_stops(id) ON DELETE CASCADE,
  driver_person_id uuid NOT NULL REFERENCES public.people(id) ON DELETE CASCADE,
  notification_type text NOT NULL CHECK (notification_type IN ('assignment','change','reminder')),
  recipient_email text NOT NULL,
  status text NOT NULL DEFAULT 'queued',
  message_id text,
  error_message text,
  sent_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_dnl_stop ON public.driver_notification_log(schedule_stop_id);
CREATE INDEX IF NOT EXISTS idx_dnl_driver_type ON public.driver_notification_log(driver_person_id, notification_type);

-- =============================================================================
-- 3. STORED FUNCTIONS & PROCEDURES
-- =============================================================================

CREATE OR REPLACE FUNCTION public.touch_updated_at()
RETURNS trigger LANGUAGE plpgsql SET search_path = public AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role app_role)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role);
$$;

CREATE OR REPLACE FUNCTION public.is_admin(_user_id uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT public.has_role(_user_id, 'admin');
$$;

CREATE OR REPLACE FUNCTION public.is_approved(_user_id uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = _user_id AND approval_status = 'approved'
  );
$$;

CREATE OR REPLACE FUNCTION public.my_person_id()
RETURNS uuid LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT id FROM public.people WHERE profile_id = auth.uid() LIMIT 1;
$$;

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  is_first boolean;
BEGIN
  SELECT count(*) = 0 INTO is_first FROM public.user_roles;

  INSERT INTO public.profiles (id, full_name, email, approval_status, approved_at)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name', split_part(NEW.email,'@',1)),
    NEW.email,
    CASE WHEN is_first THEN 'approved' ELSE 'pending' END,
    CASE WHEN is_first THEN now() ELSE null END
  )
  ON CONFLICT (id) DO NOTHING;

  IF is_first THEN
    INSERT INTO public.user_roles(user_id, role) VALUES (NEW.id, 'admin')
    ON CONFLICT DO NOTHING;
  END IF;
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.generate_ministry_year(_start_year integer)
RETURNS uuid LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  my_id uuid;
  start_date date := make_date(_start_year, 9, 1);
  end_date   date := make_date(_start_year + 1, 8, 31);
  d date;
  rule record;
  rs record;
  weeks_since int;
  sd_id uuid;
BEGIN
  INSERT INTO public.ministry_years(start_year, label)
  VALUES (_start_year, _start_year || '/' || (_start_year + 1))
  ON CONFLICT (start_year) DO UPDATE SET label = excluded.label
  RETURNING id INTO my_id;

  FOR rule IN SELECT * FROM public.recurring_schedule_rules WHERE active LOOP
    d := start_date;
    WHILE extract(dow from d)::int <> rule.weekday LOOP d := d + 1; END LOOP;
    weeks_since := 0;
    WHILE d <= end_date LOOP
      IF rule.frequency = 'weekly'
         OR (rule.frequency = 'biweekly' AND weeks_since % 2 = 0) THEN
        INSERT INTO public.schedule_dates(ministry_year_id, date)
        VALUES (my_id, d)
        ON CONFLICT (ministry_year_id, date) DO UPDATE SET ministry_year_id = excluded.ministry_year_id
        RETURNING id INTO sd_id;

        FOR rs IN
          SELECT * FROM public.recurring_schedule_rule_stops
          WHERE rule_id = rule.id ORDER BY sort_order
        LOOP
          IF NOT EXISTS (
            SELECT 1 FROM public.schedule_stops ss
            WHERE ss.schedule_date_id = sd_id
              AND (ss.rule_stop_id = rs.id OR ss.location_id = rs.location_id)
          ) THEN
            INSERT INTO public.schedule_stops(schedule_date_id, location_id, driver_id, coordinator_id, rule_stop_id, sort_order)
            VALUES (sd_id, rs.location_id, rs.default_driver_id, rs.default_coordinator_id, rs.id, rs.sort_order);
          END IF;
        END LOOP;

        INSERT INTO public.date_recipients(schedule_date_id, household_id)
        SELECT sd_id, t.household_id
        FROM public.recurring_recipient_templates t
        WHERE t.rule_id = rule.id
          AND NOT EXISTS (
            SELECT 1 FROM public.date_recipients dr
            WHERE dr.schedule_date_id = sd_id AND dr.household_id = t.household_id
          );
      END IF;
      d := d + 7;
      weeks_since := weeks_since + 1;
    END LOOP;
  END LOOP;
  RETURN my_id;
END;
$$;

CREATE OR REPLACE FUNCTION public.regenerate_all_ministry_years()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  y record;
BEGIN
  FOR y IN SELECT start_year FROM public.ministry_years LOOP
    PERFORM public.generate_ministry_year(y.start_year);
  END LOOP;
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.apply_template_to_future(_rule_id uuid, _from_date date)
RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  inserted_count int := 0;
  deleted_count int := 0;
BEGIN
  IF NOT is_admin(auth.uid()) THEN RAISE EXCEPTION 'not authorized'; END IF;

  WITH target_dates AS (
    SELECT DISTINCT d.id AS date_id
    FROM public.schedule_dates d
    JOIN public.schedule_stops s ON s.schedule_date_id = d.id
    JOIN public.recurring_schedule_rule_stops rs ON rs.id = s.rule_stop_id
    WHERE rs.rule_id = _rule_id AND d.date >= _from_date
  ),
  del AS (
    DELETE FROM public.date_recipients dr
    USING target_dates td
    WHERE dr.schedule_date_id = td.date_id
      AND dr.force_include = false
      AND dr.household_id IS NOT NULL
      AND NOT EXISTS (
        SELECT 1 FROM public.recurring_recipient_templates t
        WHERE t.rule_id = _rule_id AND t.household_id = dr.household_id
      )
    RETURNING 1
  )
  SELECT count(*) INTO deleted_count FROM del;

  WITH target_dates AS (
    SELECT DISTINCT d.id AS date_id
    FROM public.schedule_dates d
    JOIN public.schedule_stops s ON s.schedule_date_id = d.id
    JOIN public.recurring_schedule_rule_stops rs ON rs.id = s.rule_stop_id
    WHERE rs.rule_id = _rule_id AND d.date >= _from_date
  ),
  ins AS (
    INSERT INTO public.date_recipients(schedule_date_id, household_id)
    SELECT td.date_id, t.household_id
    FROM target_dates td
    CROSS JOIN public.recurring_recipient_templates t
    WHERE t.rule_id = _rule_id
      AND NOT EXISTS (
        SELECT 1 FROM public.date_recipients dr
        WHERE dr.schedule_date_id = td.date_id AND dr.household_id = t.household_id
      )
    RETURNING 1
  )
  SELECT count(*) INTO inserted_count FROM ins;

  RETURN jsonb_build_object('inserted', inserted_count, 'deleted', deleted_count);
END;
$$;

CREATE OR REPLACE FUNCTION public.apply_assignments_to_future(_rule_stop_id uuid, _from_date date, _override boolean DEFAULT false)
RETURNS integer LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  affected int := 0;
  rs record;
BEGIN
  IF NOT is_admin(auth.uid()) THEN RAISE EXCEPTION 'not authorized'; END IF;
  SELECT * INTO rs FROM public.recurring_schedule_rule_stops WHERE id = _rule_stop_id;

  IF _override THEN
    UPDATE public.schedule_stops s
    SET driver_id = rs.default_driver_id, coordinator_id = rs.default_coordinator_id
    FROM public.schedule_dates d
    WHERE s.schedule_date_id = d.id AND s.rule_stop_id = _rule_stop_id AND d.date >= _from_date;
  ELSE
    UPDATE public.schedule_stops s
    SET driver_id = coalesce(s.driver_id, rs.default_driver_id),
        coordinator_id = coalesce(s.coordinator_id, rs.default_coordinator_id)
    FROM public.schedule_dates d
    WHERE s.schedule_date_id = d.id AND s.rule_stop_id = _rule_stop_id AND d.date >= _from_date;
  END IF;
  GET DIAGNOSTICS affected = row_count;
  RETURN affected;
END;
$$;

CREATE OR REPLACE FUNCTION public.apply_person_to_future(
  _rule_stop_id uuid,
  _from_date date,
  _field text,
  _person_id uuid,
  _update_template boolean DEFAULT false
)
RETURNS integer LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  affected int := 0;
BEGIN
  IF NOT is_admin(auth.uid()) THEN RAISE EXCEPTION 'not authorized'; END IF;
  IF _field NOT IN ('driver','coordinator') THEN RAISE EXCEPTION 'invalid field'; END IF;

  IF _field = 'driver' THEN
    UPDATE public.schedule_stops s
       SET driver_id = _person_id
      FROM public.schedule_dates d
     WHERE s.schedule_date_id = d.id
       AND s.rule_stop_id = _rule_stop_id
       AND d.date >= _from_date;
    GET DIAGNOSTICS affected = row_count;

    IF _update_template THEN
      UPDATE public.recurring_schedule_rule_stops
         SET default_driver_id = _person_id
       WHERE id = _rule_stop_id;
    END IF;
  ELSE
    UPDATE public.schedule_stops s
       SET coordinator_id = _person_id
      FROM public.schedule_dates d
     WHERE s.schedule_date_id = d.id
       AND s.rule_stop_id = _rule_stop_id
       AND d.date >= _from_date;
    GET DIAGNOSTICS affected = row_count;

    IF _update_template THEN
      UPDATE public.recurring_schedule_rule_stops
         SET default_coordinator_id = _person_id
       WHERE id = _rule_stop_id;
    END IF;
  END IF;

  RETURN affected;
END;
$$;

CREATE OR REPLACE FUNCTION public.link_or_create_person_for_profile(
  _profile_id uuid,
  _link_to_person_id uuid DEFAULT NULL::uuid,
  _force_create boolean DEFAULT false
)
RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  prof record;
  existing_person record;
  email_match_id uuid;
  email_match_count int;
  candidates jsonb;
  target_person_id uuid;
  has_driver boolean;
  has_coord boolean;
  actor uuid := auth.uid();
BEGIN
  IF NOT is_admin(actor) THEN RAISE EXCEPTION 'not authorized'; END IF;

  SELECT id, full_name, email INTO prof FROM public.profiles WHERE id = _profile_id;
  IF NOT FOUND THEN RAISE EXCEPTION 'profile not found'; END IF;

  SELECT * INTO existing_person FROM public.people WHERE profile_id = _profile_id LIMIT 1;
  IF FOUND THEN
    target_person_id := existing_person.id;
  ELSIF _link_to_person_id IS NOT NULL THEN
    UPDATE public.people
       SET profile_id = _profile_id,
           email = COALESCE(NULLIF(email, ''), prof.email),
           full_name = COALESCE(NULLIF(full_name, ''), prof.full_name)
     WHERE id = _link_to_person_id AND profile_id IS NULL
     RETURNING id INTO target_person_id;
    IF target_person_id IS NULL THEN
      RAISE EXCEPTION 'selected person is already linked to another account';
    END IF;
    INSERT INTO public.person_profile_link_audit(person_id, profile_id, action, actor_id, details)
    VALUES (target_person_id, _profile_id, 'linked', actor, jsonb_build_object('mode','manual'));
  ELSIF _force_create THEN
    INSERT INTO public.people (full_name, email, profile_id)
    VALUES (COALESCE(NULLIF(prof.full_name, ''), prof.email), prof.email, _profile_id)
    RETURNING id INTO target_person_id;
    INSERT INTO public.person_profile_link_audit(person_id, profile_id, action, actor_id, details)
    VALUES (target_person_id, _profile_id, 'created', actor, jsonb_build_object('mode','force_create'));
  ELSE
    IF prof.email IS NOT NULL AND prof.email <> '' THEN
      SELECT count(*) INTO email_match_count
        FROM public.people
       WHERE lower(email) = lower(prof.email) AND profile_id IS NULL;

      IF email_match_count = 1 THEN
        SELECT id INTO email_match_id
          FROM public.people
         WHERE lower(email) = lower(prof.email) AND profile_id IS NULL
         LIMIT 1;
        UPDATE public.people
           SET profile_id = _profile_id,
               full_name = COALESCE(NULLIF(full_name, ''), prof.full_name)
         WHERE id = email_match_id
         RETURNING id INTO target_person_id;
        INSERT INTO public.person_profile_link_audit(person_id, profile_id, action, actor_id, details)
        VALUES (target_person_id, _profile_id, 'linked', actor, jsonb_build_object('mode','email_auto'));
      END IF;
    END IF;

    IF target_person_id IS NULL THEN
      SELECT COALESCE(jsonb_agg(c ORDER BY c->>'match_type', c->>'full_name'), '[]'::jsonb)
        INTO candidates
      FROM (
        SELECT DISTINCT ON (p.id)
          jsonb_build_object(
            'id', p.id,
            'full_name', p.full_name,
            'email', p.email,
            'phone', p.phone,
            'notes', p.notes,
            'active', p.active,
            'roles', COALESCE((
              SELECT jsonb_agg(pr.role ORDER BY pr.role)
                FROM public.people_roles pr
               WHERE pr.person_id = p.id
            ), '[]'::jsonb),
            'match_type', CASE
              WHEN prof.email IS NOT NULL AND prof.email <> ''
                   AND lower(p.email) = lower(prof.email) THEN 'email'
              ELSE 'name'
            END
          ) AS c
        FROM public.people p
        WHERE p.profile_id IS NULL
          AND (
            (prof.email IS NOT NULL AND prof.email <> ''
              AND lower(p.email) = lower(prof.email))
            OR
            (prof.full_name IS NOT NULL AND prof.full_name <> ''
              AND lower(trim(p.full_name)) = lower(trim(prof.full_name)))
          )
      ) t;

      IF jsonb_array_length(candidates) > 0 THEN
        RETURN jsonb_build_object('status', 'needs_choice', 'candidates', candidates);
      END IF;

      INSERT INTO public.people (full_name, email, profile_id)
      VALUES (COALESCE(NULLIF(prof.full_name, ''), prof.email), prof.email, _profile_id)
      RETURNING id INTO target_person_id;
      INSERT INTO public.person_profile_link_audit(person_id, profile_id, action, actor_id, details)
      VALUES (target_person_id, _profile_id, 'created', actor, jsonb_build_object('mode','auto_create'));
    END IF;
  END IF;

  SELECT EXISTS(SELECT 1 FROM public.user_roles WHERE user_id = _profile_id AND role = 'driver') INTO has_driver;
  SELECT EXISTS(SELECT 1 FROM public.user_roles WHERE user_id = _profile_id AND role = 'coordinator') INTO has_coord;

  IF has_driver THEN
    INSERT INTO public.people_roles(person_id, role) VALUES (target_person_id, 'driver')
    ON CONFLICT (person_id, role) DO NOTHING;
  END IF;
  IF has_coord THEN
    INSERT INTO public.people_roles(person_id, role) VALUES (target_person_id, 'coordinator')
    ON CONFLICT (person_id, role) DO NOTHING;
  END IF;

  RETURN jsonb_build_object('status', 'linked', 'person_id', target_person_id);
END;
$$;

CREATE OR REPLACE FUNCTION public.sync_person_role(_profile_id uuid, _role app_role, _enabled boolean)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  pid uuid;
  actor uuid := auth.uid();
BEGIN
  IF NOT is_admin(actor) THEN RAISE EXCEPTION 'not authorized'; END IF;
  IF _role NOT IN ('driver', 'coordinator') THEN RETURN; END IF;
  SELECT id INTO pid FROM public.people WHERE profile_id = _profile_id;
  IF pid IS NULL THEN RETURN; END IF;
  IF _enabled THEN
    INSERT INTO public.people_roles(person_id, role) VALUES (pid, _role)
    ON CONFLICT (person_id, role) DO NOTHING;
    INSERT INTO public.person_profile_link_audit(person_id, profile_id, action, role, actor_id)
    VALUES (pid, _profile_id, 'role_added', _role::text, actor);
  ELSE
    DELETE FROM public.people_roles WHERE person_id = pid AND role = _role;
    INSERT INTO public.person_profile_link_audit(person_id, profile_id, action, role, actor_id)
    VALUES (pid, _profile_id, 'role_removed', _role::text, actor);
  END IF;
END;
$$;

CREATE OR REPLACE FUNCTION public.enforce_stop_self_assign()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
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
END;
$$;

CREATE OR REPLACE FUNCTION public.admin_get_cron_status()
RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, cron AS $$
DECLARE
  result jsonb;
BEGIN
  IF NOT is_admin(auth.uid()) THEN RAISE EXCEPTION 'not authorized'; END IF;
  SELECT jsonb_build_object(
    'jobs', COALESCE((
      SELECT jsonb_agg(jsonb_build_object(
        'jobid', j.jobid,
        'jobname', j.jobname,
        'schedule', j.schedule,
        'active', j.active
      ) ORDER BY j.jobname)
      FROM cron.job j
      WHERE j.jobname IN ('driver-reminders-daily','process-email-queue')
    ), '[]'::jsonb),
    'runs', COALESCE((
      SELECT jsonb_agg(jsonb_build_object(
        'jobid', r.jobid,
        'jobname', j.jobname,
        'status', r.status,
        'return_message', r.return_message,
        'start_time', r.start_time,
        'end_time', r.end_time
      ) ORDER BY r.start_time DESC)
      FROM cron.job_run_details r
      JOIN cron.job j ON j.jobid = r.jobid
      WHERE j.jobname IN ('driver-reminders-daily','process-email-queue')
        AND r.start_time > now() - interval '7 days'
      LIMIT 50
    ), '[]'::jsonb)
  ) INTO result;
  RETURN result;
END;
$$;

-- Email Queue RPC wrappers
CREATE OR REPLACE FUNCTION public.enqueue_email(queue_name TEXT, payload JSONB)
RETURNS BIGINT LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, pgmq AS $$
BEGIN
  RETURN pgmq.send(queue_name, payload);
EXCEPTION WHEN undefined_table THEN
  PERFORM pgmq.create(queue_name);
  RETURN pgmq.send(queue_name, payload);
END;
$$;

CREATE OR REPLACE FUNCTION public.read_email_batch(queue_name TEXT, batch_size INT, vt INT)
RETURNS TABLE(msg_id BIGINT, read_ct INT, message JSONB)
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, pgmq AS $$
BEGIN
  RETURN QUERY SELECT r.msg_id, r.read_ct, r.message FROM pgmq.read(queue_name, vt, batch_size) r;
EXCEPTION WHEN undefined_table THEN
  PERFORM pgmq.create(queue_name);
  RETURN;
END;
$$;

CREATE OR REPLACE FUNCTION public.delete_email(queue_name TEXT, message_id BIGINT)
RETURNS BOOLEAN LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, pgmq AS $$
BEGIN
  RETURN pgmq.delete(queue_name, message_id);
EXCEPTION WHEN undefined_table THEN
  RETURN FALSE;
END;
$$;

CREATE OR REPLACE FUNCTION public.move_to_dlq(
  source_queue TEXT, dlq_name TEXT, message_id BIGINT, payload JSONB
)
RETURNS BIGINT LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, pgmq AS $$
DECLARE new_id BIGINT;
BEGIN
  SELECT pgmq.send(dlq_name, payload) INTO new_id;
  PERFORM pgmq.delete(source_queue, message_id);
  RETURN new_id;
EXCEPTION WHEN undefined_table THEN
  BEGIN
    PERFORM pgmq.create(dlq_name);
  EXCEPTION WHEN OTHERS THEN NULL;
  END;
  SELECT pgmq.send(dlq_name, payload) INTO new_id;
  BEGIN
    PERFORM pgmq.delete(source_queue, message_id);
  EXCEPTION WHEN undefined_table THEN NULL;
  END;
  RETURN new_id;
END;
$$;

-- =============================================================================
-- 4. TRIGGERS
-- =============================================================================

DROP TRIGGER IF EXISTS trg_profiles_updated ON public.profiles;
CREATE TRIGGER trg_profiles_updated BEFORE UPDATE ON public.profiles
FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

DROP TRIGGER IF EXISTS trg_people_updated ON public.people;
CREATE TRIGGER trg_people_updated BEFORE UPDATE ON public.people
FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

DROP TRIGGER IF EXISTS trg_recipient_households_updated ON public.recipient_households;
CREATE TRIGGER trg_recipient_households_updated BEFORE UPDATE ON public.recipient_households
FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

DROP TRIGGER IF EXISTS trg_schedule_dates_updated ON public.schedule_dates;
CREATE TRIGGER trg_schedule_dates_updated BEFORE UPDATE ON public.schedule_dates
FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

DROP TRIGGER IF EXISTS stops_touch ON public.schedule_stops;
CREATE TRIGGER stops_touch BEFORE UPDATE ON public.schedule_stops
FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

DROP TRIGGER IF EXISTS email_templates_touch ON public.email_templates;
CREATE TRIGGER email_templates_touch BEFORE UPDATE ON public.email_templates
FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

DROP TRIGGER IF EXISTS stop_messages_touch_updated_at ON public.stop_messages;
CREATE TRIGGER stop_messages_touch_updated_at BEFORE UPDATE ON public.stop_messages
FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

DROP TRIGGER IF EXISTS trg_regen_on_rule_insert ON public.recurring_schedule_rules;
CREATE TRIGGER trg_regen_on_rule_insert AFTER INSERT ON public.recurring_schedule_rules
FOR EACH ROW EXECUTE FUNCTION public.regenerate_all_ministry_years();

DROP TRIGGER IF EXISTS trg_regen_on_rule_stop_insert ON public.recurring_schedule_rule_stops;
CREATE TRIGGER trg_regen_on_rule_stop_insert AFTER INSERT ON public.recurring_schedule_rule_stops
FOR EACH ROW EXECUTE FUNCTION public.regenerate_all_ministry_years();

DROP TRIGGER IF EXISTS enforce_stop_self_assign_trg ON public.schedule_stops;
CREATE TRIGGER enforce_stop_self_assign_trg BEFORE UPDATE ON public.schedule_stops
FOR EACH ROW EXECUTE FUNCTION public.enforce_stop_self_assign();

-- =============================================================================
-- 5. ROW LEVEL SECURITY (RLS) POLICIES
-- =============================================================================

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.people ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.people_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.recipient_households ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.household_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ministry_years ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.locations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.recurring_schedule_rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.recurring_schedule_rule_stops ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.recurring_recipient_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.schedule_dates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.schedule_stops ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.date_recipients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.driver_pickup_households ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.person_profile_link_audit ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.email_send_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.email_send_state ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.suppressed_emails ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.email_unsubscribe_tokens ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.email_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.email_brand_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.driver_notification_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.stop_messages ENABLE ROW LEVEL SECURITY;

-- Profiles
CREATE POLICY "profiles_read" ON public.profiles FOR SELECT TO authenticated
  USING (auth.uid() = id OR is_approved(auth.uid()) OR is_admin(auth.uid()));
CREATE POLICY "profiles_self_update" ON public.profiles FOR UPDATE TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (
    auth.uid() = id
    AND approval_status = (SELECT approval_status FROM public.profiles WHERE id = auth.uid())
    AND approved_at IS NOT DISTINCT FROM (SELECT approved_at FROM public.profiles WHERE id = auth.uid())
    AND approved_by IS NOT DISTINCT FROM (SELECT approved_by FROM public.profiles WHERE id = auth.uid())
  );
CREATE POLICY "profiles_admin_all" ON public.profiles FOR ALL TO authenticated
  USING (public.is_admin(auth.uid())) WITH CHECK (public.is_admin(auth.uid()));

-- People & Roles
CREATE POLICY "people_read" ON public.people FOR SELECT TO authenticated
  USING (public.is_approved(auth.uid()));
CREATE POLICY "people_admin_write" ON public.people FOR ALL TO authenticated
  USING (public.is_admin(auth.uid()) AND public.is_approved(auth.uid()))
  WITH CHECK (public.is_admin(auth.uid()) AND public.is_approved(auth.uid()));

CREATE POLICY "user_roles_read" ON public.user_roles FOR SELECT TO authenticated
  USING (auth.uid() = user_id OR is_approved(auth.uid()) OR is_admin(auth.uid()));
CREATE POLICY "user_roles_admin_write" ON public.user_roles FOR ALL TO authenticated
  USING (public.is_admin(auth.uid()) AND public.is_approved(auth.uid()))
  WITH CHECK (public.is_admin(auth.uid()) AND public.is_approved(auth.uid()));

CREATE POLICY "people_roles_read" ON public.people_roles FOR SELECT TO authenticated
  USING (public.is_approved(auth.uid()));
CREATE POLICY "people_roles_admin_write" ON public.people_roles FOR ALL TO authenticated
  USING (public.is_admin(auth.uid()) AND public.is_approved(auth.uid()))
  WITH CHECK (public.is_admin(auth.uid()) AND public.is_approved(auth.uid()));

-- Households
CREATE POLICY "households_read" ON public.recipient_households FOR SELECT TO authenticated
  USING (public.is_approved(auth.uid()));
CREATE POLICY "households_admin_write" ON public.recipient_households FOR ALL TO authenticated
  USING (public.is_admin(auth.uid()) AND public.is_approved(auth.uid()))
  WITH CHECK (public.is_admin(auth.uid()) AND public.is_approved(auth.uid()));

CREATE POLICY "members_read" ON public.household_members FOR SELECT TO authenticated
  USING (public.is_approved(auth.uid()));
CREATE POLICY "members_admin_write" ON public.household_members FOR ALL TO authenticated
  USING (public.is_admin(auth.uid()) AND public.is_approved(auth.uid()))
  WITH CHECK (public.is_admin(auth.uid()) AND public.is_approved(auth.uid()));

CREATE POLICY "dph_read" ON public.driver_pickup_households FOR SELECT TO authenticated
  USING (public.is_approved(auth.uid()));
CREATE POLICY "dph_admin_write" ON public.driver_pickup_households FOR ALL TO authenticated
  USING (public.is_admin(auth.uid()) AND public.is_approved(auth.uid()))
  WITH CHECK (public.is_admin(auth.uid()) AND public.is_approved(auth.uid()));

-- Schedule structure
CREATE POLICY "years_read" ON public.ministry_years FOR SELECT TO authenticated
  USING (is_approved(auth.uid()));
CREATE POLICY "years_admin_write" ON public.ministry_years FOR ALL TO authenticated
  USING (public.is_admin(auth.uid()) AND public.is_approved(auth.uid()))
  WITH CHECK (public.is_admin(auth.uid()) AND public.is_approved(auth.uid()));

CREATE POLICY "locations_read" ON public.locations FOR SELECT TO authenticated
  USING (is_approved(auth.uid()));
CREATE POLICY "locations_admin_write" ON public.locations FOR ALL TO authenticated
  USING (public.is_admin(auth.uid()) AND public.is_approved(auth.uid()))
  WITH CHECK (public.is_admin(auth.uid()) AND public.is_approved(auth.uid()));

CREATE POLICY "rules_read" ON public.recurring_schedule_rules FOR SELECT TO authenticated
  USING (is_approved(auth.uid()));
CREATE POLICY "rules_admin_write" ON public.recurring_schedule_rules FOR ALL TO authenticated
  USING (public.is_admin(auth.uid()) AND public.is_approved(auth.uid()))
  WITH CHECK (public.is_admin(auth.uid()) AND public.is_approved(auth.uid()));

CREATE POLICY "rule_stops_read" ON public.recurring_schedule_rule_stops FOR SELECT TO authenticated
  USING (is_approved(auth.uid()));
CREATE POLICY "rule_stops_admin_write" ON public.recurring_schedule_rule_stops FOR ALL TO authenticated
  USING (public.is_admin(auth.uid()) AND public.is_approved(auth.uid()))
  WITH CHECK (public.is_admin(auth.uid()) AND public.is_approved(auth.uid()));

CREATE POLICY "templates_read" ON public.recurring_recipient_templates FOR SELECT TO authenticated
  USING (is_approved(auth.uid()));
CREATE POLICY "templates_admin_write" ON public.recurring_recipient_templates FOR ALL TO authenticated
  USING (public.is_admin(auth.uid()) AND public.is_approved(auth.uid()))
  WITH CHECK (public.is_admin(auth.uid()) AND public.is_approved(auth.uid()));

-- Schedule Dates & Stops
CREATE POLICY "schedule_read" ON public.schedule_dates FOR SELECT TO authenticated
  USING (is_approved(auth.uid()));
CREATE POLICY "schedule_admin_write" ON public.schedule_dates FOR ALL TO authenticated
  USING (public.is_admin(auth.uid()) AND public.is_approved(auth.uid()))
  WITH CHECK (public.is_admin(auth.uid()) AND public.is_approved(auth.uid()));

CREATE POLICY "stops_read" ON public.schedule_stops FOR SELECT TO authenticated
  USING (is_approved(auth.uid()));
CREATE POLICY "stops_admin_write" ON public.schedule_stops FOR ALL TO authenticated
  USING (public.is_admin(auth.uid()) AND public.is_approved(auth.uid()))
  WITH CHECK (public.is_admin(auth.uid()) AND public.is_approved(auth.uid()));

CREATE POLICY "stops_self_assign" ON public.schedule_stops FOR UPDATE TO authenticated
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

CREATE POLICY "stops_complete_assigned" ON public.schedule_stops FOR UPDATE TO authenticated
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

CREATE POLICY "date_recipients_read" ON public.date_recipients FOR SELECT TO authenticated
  USING (public.is_approved(auth.uid()));
CREATE POLICY "date_recipients_admin_write" ON public.date_recipients FOR ALL TO authenticated
  USING (public.is_admin(auth.uid()) AND public.is_approved(auth.uid()))
  WITH CHECK (public.is_admin(auth.uid()) AND public.is_approved(auth.uid()));

-- Messages & Audit
CREATE POLICY "stop_messages_select_approved" ON public.stop_messages FOR SELECT TO authenticated
  USING (public.is_approved(auth.uid()));

CREATE POLICY "stop_messages_insert_assigned_or_admin" ON public.stop_messages FOR INSERT TO authenticated
  WITH CHECK (
    author_id = auth.uid()
    AND (
      public.is_admin(auth.uid())
      OR EXISTS (
        SELECT 1 FROM public.schedule_stops s
        WHERE s.id = schedule_stop_id
          AND public.my_person_id() IS NOT NULL
          AND (s.driver_id = public.my_person_id() OR s.coordinator_id = public.my_person_id())
      )
    )
  );

CREATE POLICY "stop_messages_delete_admin_or_author" ON public.stop_messages FOR DELETE TO authenticated
  USING (public.is_admin(auth.uid()) OR author_id = auth.uid());

CREATE POLICY "ppla_admin_read" ON public.person_profile_link_audit FOR SELECT TO authenticated
  USING (is_admin(auth.uid()));

-- Email service policies
CREATE POLICY "email_brand_admin_all" ON public.email_brand_settings FOR ALL TO authenticated
  USING (is_admin(auth.uid()) AND is_approved(auth.uid()))
  WITH CHECK (is_admin(auth.uid()) AND is_approved(auth.uid()));

CREATE POLICY "email_templates_admin_read" ON public.email_templates FOR SELECT TO authenticated
  USING (is_admin(auth.uid()) AND is_approved(auth.uid()));
CREATE POLICY "email_templates_admin_write" ON public.email_templates FOR ALL TO authenticated
  USING (is_admin(auth.uid()) AND is_approved(auth.uid()))
  WITH CHECK (is_admin(auth.uid()) AND is_approved(auth.uid()));

CREATE POLICY "dnl_admin_read" ON public.driver_notification_log FOR SELECT TO authenticated
  USING (is_admin(auth.uid()) AND is_approved(auth.uid()));
CREATE POLICY "dnl_admin_write" ON public.driver_notification_log FOR ALL TO authenticated
  USING (is_admin(auth.uid()) AND is_approved(auth.uid()))
  WITH CHECK (is_admin(auth.uid()) AND is_approved(auth.uid()));

CREATE POLICY "Service role can manage send log" ON public.email_send_log FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "Service role can manage send state" ON public.email_send_state FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "Service role can manage suppressed" ON public.suppressed_emails FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "Service role can manage tokens" ON public.email_unsubscribe_tokens FOR ALL TO service_role USING (true) WITH CHECK (true);

-- Permissions
REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.touch_updated_at() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.generate_ministry_year(integer) FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.apply_template_to_future(uuid, date) FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.apply_assignments_to_future(uuid, date, boolean) FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.apply_person_to_future(uuid, date, text, uuid, boolean) FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.enqueue_email(text, jsonb) FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.read_email_batch(text, integer, integer) FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.delete_email(text, bigint) FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.move_to_dlq(text, text, bigint, jsonb) FROM PUBLIC, anon, authenticated;

GRANT EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) TO authenticated;
GRANT EXECUTE ON FUNCTION public.is_admin(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.is_approved(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.my_person_id() TO authenticated;
GRANT EXECUTE ON FUNCTION public.generate_ministry_year(integer) TO authenticated;
GRANT EXECUTE ON FUNCTION public.admin_get_cron_status() TO authenticated;
GRANT EXECUTE ON FUNCTION public.enqueue_email(text, jsonb) TO service_role;
GRANT EXECUTE ON FUNCTION public.read_email_batch(text, integer, integer) TO service_role;
GRANT EXECUTE ON FUNCTION public.delete_email(text, bigint) TO service_role;
GRANT EXECUTE ON FUNCTION public.move_to_dlq(text, text, bigint, jsonb) TO service_role;

-- =============================================================================
-- 6. DEFAULT SEED DATA
-- =============================================================================

INSERT INTO public.locations(name) VALUES ('Main'), ('Location A'), ('Location B')
ON CONFLICT DO NOTHING;

INSERT INTO public.email_templates (template_key, language, subject, body, footer, description, placeholders) VALUES
('driver_assignment', 'sl',
 'Nov razpored prevoza — {{date}}',
 E'Pozdravljen/a {{driver_name}},\n\ndodeljen/a si kot voznik/ica za prevzem hrane:\n\nDatum: {{date}}\nLokacija: {{location}}\n{{#coordinator}}Koordinator/ica: {{coordinator}}{{/coordinator}}\n\nHvala za tvojo pomoč!\n\nLep pozdrav,\nKruh življenja',
 E'Lep pozdrav,\nKruh življenja',
 'Sent when a driver is newly assigned to a stop.',
 ARRAY['driver_name','date','location','coordinator']),

('driver_change', 'sl',
 'Sprememba razporeda — {{date}}',
 E'Pozdravljen/a {{driver_name}},\n\nobveščamo te o spremembi na tvoji dodelitvi:\n\nDatum: {{date}}\nLokacija: {{location}}\n{{#coordinator}}Koordinator/ica: {{coordinator}}{{/coordinator}}\n\nČe imaš vprašanja, se obrni na koordinatorja.\n\nLep pozdrav,\nKruh življenja',
 E'Lep pozdrav,\nKruh življenja',
 'Sent when an existing assignment changes (date/location/coordinator).',
 ARRAY['driver_name','date','location','coordinator']),

('driver_reminder', 'sl',
 'Opomnik: jutri si na vrsti — {{date}}',
 E'Pozdravljen/a {{driver_name}},\n\nprijazno te opominjamo, da si jutri dodeljen/a za prevzem hrane:\n\nDatum: {{date}}\nLokacija: {{location}}\n{{#coordinator}}Koordinator/ica: {{coordinator}}{{/coordinator}}\n\nHvala in lep dan!\n\nKruh življenja',
 'Kruh življenja',
 'Sent the day before the assignment as a reminder.',
 ARRAY['driver_name','date','location','coordinator']),

('driver_assignment', 'en',
 'New delivery assignment — {{date}}',
 E'Hello {{driver_name}},\n\nyou have been assigned as the driver for a food pickup:\n\nDate: {{date}}\nLocation: {{location}}\n{{#coordinator}}Coordinator: {{coordinator}}{{/coordinator}}\n\nThank you for your help!',
 E'Best regards,\nKruh življenja',
 'Sent when a driver is newly assigned to a stop.',
 ARRAY['driver_name','date','location','coordinator']),

('driver_change', 'en',
 'Schedule change — {{date}}',
 E'Hello {{driver_name}},\n\nthere is an update to your assignment:\n\nDate: {{date}}\nLocation: {{location}}\n{{#coordinator}}Coordinator: {{coordinator}}{{/coordinator}}\n\nIf you have any questions, please contact the coordinator.',
 E'Best regards,\nKruh življenja',
 'Sent when an assignment is changed (different driver/location/date).',
 ARRAY['driver_name','date','location','coordinator']),

('driver_reminder', 'en',
 'Reminder: you''re on the schedule tomorrow — {{date}}',
 E'Hello {{driver_name}},\n\nfriendly reminder that you are scheduled tomorrow for a food pickup:\n\nDate: {{date}}\nLocation: {{location}}\n{{#coordinator}}Coordinator: {{coordinator}}{{/coordinator}}\n\nThank you and have a great day!',
 'Kruh življenja',
 '24-hour reminder before a scheduled pickup.',
 ARRAY['driver_name','date','location','coordinator']),

('test_email', 'sl',
 'Testno sporočilo · {{app_name}}',
 E'Pozdravljen/a {{person_name}},\n\nto je testno sporočilo poslano iz administratorske strani ob {{date}} {{time}}.\nČe si ga prejel/a, pošiljatelj deluje pravilno.',
 E'Lep pozdrav,\n{{app_name}}',
 'Sent by the Email Queue "Send test email" button.',
 ARRAY['person_name','date','time','app_name']),

('test_email', 'en',
 'Test message · {{app_name}}',
 E'Hello {{person_name}},\n\nthis is a test message sent from the admin Email Queue at {{date}} {{time}}.\nIf you received it, the sender is working correctly.',
 E'Best regards,\n{{app_name}}',
 'Sent by the Email Queue "Send test email" button.',
 ARRAY['person_name','date','time','app_name'])
ON CONFLICT (template_key, language) DO NOTHING;
