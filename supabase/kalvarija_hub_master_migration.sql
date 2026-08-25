-- =============================================================================
-- KALVARIJA HUB - CENTRALIZED MASTER SUPABASE CONSOLIDATION SCRIPT
-- Project: KCK Celje / KCK HUB (ptdvcobgplmngnhkjqag)
-- Serves:
--   1. kalvarija.si (Main Church Portal)
--   2. nedelje.kalvarija.si (Sunday Services & Rosters)
--   3. ucenja.kalvarija.si (Teachings & Sermons Archive)
--   4. kruhzivljenja.kalvarija.si (Bread of Life Food Distribution)
--   5. zivavera.kalvarija.si (Živa Vera Coffee Shop & Community)
-- =============================================================================

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- =============================================================================
-- 1. UNIFIED ECOSYSTEM AUTH & MULTI-APP ROLES
-- =============================================================================

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'app_name') THEN
    CREATE TYPE public.app_name AS ENUM ('main', 'kruh', 'ucenja', 'nedelje', 'zivavera', 'admin');
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'church_role') THEN
    CREATE TYPE public.church_role AS ENUM ('superadmin', 'pastor', 'leader', 'volunteer', 'member');
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'app_role') THEN
    CREATE TYPE public.app_role AS ENUM ('admin', 'driver', 'coordinator', 'recipient', 'volunteer', 'editor');
  END IF;
END $$;

-- Enrich existing public.profiles if needed
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS phone text;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS bio text;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS avatar_url text;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS active boolean NOT NULL DEFAULT true;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS approval_status text NOT NULL DEFAULT 'approved';
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS created_at timestamptz NOT NULL DEFAULT now();
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS updated_at timestamptz NOT NULL DEFAULT now();

-- User Roles Table (Multi-App Permissions)
CREATE TABLE IF NOT EXISTS public.user_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  app public.app_name NOT NULL DEFAULT 'main',
  role public.church_role NOT NULL DEFAULT 'member',
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, app, role)
);

CREATE INDEX IF NOT EXISTS idx_user_roles_user_app ON public.user_roles(user_id, app);

-- Multi-App Helper Functions
CREATE OR REPLACE FUNCTION public.has_app_role(_user_id uuid, _app public.app_name, _role public.church_role)
RETURNS boolean AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id
      AND (
        (app = _app AND role = _role) OR
        (app = 'admin' AND role IN ('superadmin', 'pastor')) OR
        (role = 'superadmin')
      )
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION public.is_admin(_user_id uuid)
RETURNS boolean AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id
      AND role IN ('superadmin', 'pastor')
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role text)
RETURNS boolean AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id
      AND (role::text = _role OR role = 'superadmin' OR role = 'pastor')
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Auto-register new users into profiles & user_roles
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, avatar_url)
  VALUES (
    new.id::text,
    new.email,
    COALESCE(new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'name', split_part(new.email, '@', 1)),
    new.raw_user_meta_data->>'avatar_url'
  )
  ON CONFLICT (id) DO UPDATE
  SET
    email = EXCLUDED.email,
    full_name = COALESCE(EXCLUDED.full_name, public.profiles.full_name),
    avatar_url = COALESCE(EXCLUDED.avatar_url, public.profiles.avatar_url),
    updated_at = now();

  INSERT INTO public.user_roles (user_id, app, role)
  VALUES (new.id, 'main', 'member')
  ON CONFLICT (user_id, app, role) DO NOTHING;

  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Seed initial admin roles for Aleš Lajlar if auth user exists
DO $$
DECLARE
  v_admin_id uuid;
BEGIN
  SELECT id INTO v_admin_id FROM auth.users WHERE email = 'ales.lajlar@gmail.com' LIMIT 1;
  IF v_admin_id IS NOT NULL THEN
    INSERT INTO public.user_roles (user_id, app, role)
    VALUES 
      (v_admin_id, 'admin', 'superadmin'),
      (v_admin_id, 'main', 'superadmin'),
      (v_admin_id, 'nedelje', 'superadmin'),
      (v_admin_id, 'ucenja', 'superadmin'),
      (v_admin_id, 'kruh', 'superadmin'),
      (v_admin_id, 'zivavera', 'superadmin')
    ON CONFLICT (user_id, app, role) DO NOTHING;
  END IF;
END $$;

-- =============================================================================
-- 2. KRUH ŽIVLJENJA (Food Ministry & Route Planning)
-- =============================================================================

CREATE TABLE IF NOT EXISTS public.people (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id text,
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

CREATE TABLE IF NOT EXISTS public.people_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  person_id uuid NOT NULL REFERENCES public.people(id) ON DELETE CASCADE,
  role app_role NOT NULL,
  UNIQUE (person_id, role)
);

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

CREATE TABLE IF NOT EXISTS public.household_members (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  household_id uuid NOT NULL REFERENCES public.recipient_households(id) ON DELETE CASCADE,
  person_id uuid REFERENCES public.people(id) ON DELETE SET NULL,
  full_name text NOT NULL,
  notes text
);

CREATE TABLE IF NOT EXISTS public.ministry_years (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  start_year int NOT NULL UNIQUE,
  label text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.locations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  address text,
  active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.recurring_schedule_rules (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  weekday int NOT NULL CHECK (weekday BETWEEN 0 AND 6),
  frequency text NOT NULL DEFAULT 'weekly' CHECK (frequency IN ('weekly','biweekly')),
  active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT recurring_schedule_rules_weekday_frequency_key UNIQUE (weekday, frequency)
);

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

CREATE TABLE IF NOT EXISTS public.recurring_recipient_templates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  rule_id uuid NOT NULL REFERENCES public.recurring_schedule_rules(id) ON DELETE CASCADE,
  household_id uuid NOT NULL REFERENCES public.recipient_households(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(rule_id, household_id)
);

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

CREATE TABLE IF NOT EXISTS public.driver_pickup_households (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  person_id uuid NOT NULL REFERENCES public.people(id) ON DELETE CASCADE,
  household_id uuid NOT NULL REFERENCES public.recipient_households(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (person_id, household_id)
);

CREATE TABLE IF NOT EXISTS public.person_profile_link_audit (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  person_id uuid,
  profile_id text,
  action text NOT NULL,
  role text,
  actor_id uuid,
  details jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.stop_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  schedule_stop_id uuid NOT NULL REFERENCES public.schedule_stops(id) ON DELETE CASCADE,
  author_id uuid,
  author_name text NOT NULL,
  body text NOT NULL CHECK (char_length(body) BETWEEN 1 AND 2000),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.driver_notification_log (
  id text PRIMARY KEY DEFAULT gen_random_uuid()::text,
  driver_person_id text,
  schedule_stop_id text,
  recipient_email text NOT NULL,
  notification_type text NOT NULL,
  status text NOT NULL DEFAULT 'sent',
  message_id text,
  error_message text,
  sent_at timestamptz DEFAULT now(),
  created_at timestamptz NOT NULL DEFAULT now()
);

-- =============================================================================
-- 3. ŽIVA VERA (Coffee Shop, Community Events & Volunteers)
-- =============================================================================

CREATE TABLE IF NOT EXISTS public.cafe_sessions (
  id text PRIMARY KEY DEFAULT gen_random_uuid()::text,
  opened_at timestamptz NOT NULL DEFAULT now(),
  closed_at timestamptz,
  opened_by text,
  opened_by_email text,
  closed_by text,
  closed_by_email text,
  people_served integer NOT NULL DEFAULT 0,
  hot_drinks_served integer NOT NULL DEFAULT 0,
  cold_drinks_served integer NOT NULL DEFAULT 0,
  note text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.cafe_status (
  id boolean PRIMARY KEY DEFAULT true,
  is_open boolean NOT NULL DEFAULT false,
  note_sl text,
  note_en text,
  updated_by text,
  updated_at timestamptz NOT NULL DEFAULT now()
);

INSERT INTO public.cafe_status (id, is_open) VALUES (true, false) ON CONFLICT (id) DO NOTHING;

CREATE TABLE IF NOT EXISTS public.cafe_status_history (
  id text PRIMARY KEY DEFAULT gen_random_uuid()::text,
  is_open boolean NOT NULL,
  note_sl text,
  note_en text,
  changed_by text,
  changed_by_email text,
  changed_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.menu_categories (
  id text PRIMARY KEY DEFAULT gen_random_uuid()::text,
  name_sl text NOT NULL,
  name_en text NOT NULL,
  description_sl text,
  description_en text,
  sort_order integer NOT NULL DEFAULT 0,
  published boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.menu_items (
  id text PRIMARY KEY DEFAULT gen_random_uuid()::text,
  category_id text REFERENCES public.menu_categories(id) ON DELETE SET NULL,
  name_sl text NOT NULL,
  name_en text NOT NULL,
  description_sl text,
  description_en text,
  image_path text,
  featured boolean NOT NULL DEFAULT false,
  available boolean NOT NULL DEFAULT true,
  published boolean NOT NULL DEFAULT true,
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.event_categories (
  id text PRIMARY KEY DEFAULT gen_random_uuid()::text,
  name_sl text NOT NULL,
  name_en text NOT NULL,
  description_sl text,
  description_en text,
  sort_order integer NOT NULL DEFAULT 0,
  published boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.events (
  id text PRIMARY KEY DEFAULT gen_random_uuid()::text,
  category_id text REFERENCES public.event_categories(id) ON DELETE SET NULL,
  title_sl text NOT NULL,
  title_en text NOT NULL,
  description_sl text,
  description_en text,
  event_date date NOT NULL,
  event_time text,
  location_or_note_sl text,
  location_or_note_en text,
  image_path text,
  image_alignment text NOT NULL DEFAULT 'center',
  featured boolean NOT NULL DEFAULT false,
  published boolean NOT NULL DEFAULT true,
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.homepage_sections (
  id text PRIMARY KEY DEFAULT gen_random_uuid()::text,
  internal_label text NOT NULL,
  section_type text NOT NULL,
  sort_order integer NOT NULL DEFAULT 0,
  published boolean NOT NULL DEFAULT true,
  eyebrow_sl text,
  eyebrow_en text,
  title_sl text,
  title_en text,
  subtitle_sl text,
  subtitle_en text,
  body_sl text,
  body_en text,
  image_path text,
  image_alignment text NOT NULL DEFAULT 'center',
  default_image_key text,
  button_text_sl text,
  button_text_en text,
  button_link text,
  secondary_button_text_sl text,
  secondary_button_text_en text,
  secondary_button_link text,
  value_cards jsonb NOT NULL DEFAULT '[]'::jsonb,
  featured_menu_item_ids text[] NOT NULL DEFAULT '{}',
  featured_event_ids text[] NOT NULL DEFAULT '{}',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.prayer_requests (
  id text PRIMARY KEY DEFAULT gen_random_uuid()::text,
  name text,
  contact text,
  message text NOT NULL,
  request_type text NOT NULL DEFAULT 'personal',
  visibility_choice text NOT NULL DEFAULT 'private',
  status text NOT NULL DEFAULT 'pending',
  moderator_note text,
  public_response text,
  public_response_at timestamptz,
  submitter_ip_hash text,
  is_anonymous boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.static_pages (
  id text PRIMARY KEY DEFAULT gen_random_uuid()::text,
  page_key text NOT NULL UNIQUE,
  internal_label text NOT NULL,
  title_sl text NOT NULL,
  title_en text NOT NULL,
  show_in_navigation boolean NOT NULL DEFAULT false,
  nav_order integer NOT NULL DEFAULT 0,
  published boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.static_page_sections (
  id text PRIMARY KEY DEFAULT gen_random_uuid()::text,
  page_id text NOT NULL REFERENCES public.static_pages(id) ON DELETE CASCADE,
  internal_label text NOT NULL,
  section_type text NOT NULL,
  sort_order integer NOT NULL DEFAULT 0,
  published boolean NOT NULL DEFAULT true,
  eyebrow_sl text,
  eyebrow_en text,
  title_sl text,
  title_en text,
  subtitle_sl text,
  subtitle_en text,
  body_sl text,
  body_en text,
  image_path text,
  layout_variant text NOT NULL DEFAULT 'center',
  button_text_sl text,
  button_text_en text,
  button_link text,
  bullets jsonb NOT NULL DEFAULT '[]'::jsonb,
  items jsonb NOT NULL DEFAULT '[]'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE OR REPLACE FUNCTION public.get_prayer_wall()
RETURNS TABLE (
  id text,
  display_name text,
  message text,
  request_type text,
  public_response text,
  public_response_at timestamptz,
  created_at timestamptz
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    pr.id,
    CASE WHEN pr.is_anonymous THEN 'Anonimno' ELSE COALESCE(pr.name, 'Anonimno') END AS display_name,
    pr.message,
    pr.request_type,
    pr.public_response,
    pr.public_response_at,
    pr.created_at
  FROM public.prayer_requests pr
  WHERE pr.visibility_choice = 'public' 
    AND pr.status = 'approved'
  ORDER BY pr.created_at DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =============================================================================
-- 4. MAIN CHURCH PORTAL (kalvarija.si)
-- =============================================================================

CREATE TABLE IF NOT EXISTS public.main_announcements (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  content text NOT NULL,
  image_url text,
  link_url text,
  pinned boolean NOT NULL DEFAULT false,
  published boolean NOT NULL DEFAULT true,
  published_at timestamptz NOT NULL DEFAULT now(),
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.main_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text,
  event_date timestamptz NOT NULL,
  location text DEFAULT 'Kalvarija Celje',
  cover_image_url text,
  registration_required boolean NOT NULL DEFAULT false,
  published boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.main_contact_submissions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  email text NOT NULL,
  phone text,
  message text NOT NULL,
  resolved boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- =============================================================================
-- 5. ROW LEVEL SECURITY (RLS) POLICIES & PERMISSIONS
-- =============================================================================

-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.people ENABLE ROW LEVEL SECURITY;
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
ALTER TABLE public.stop_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.driver_notification_log ENABLE ROW LEVEL SECURITY;

ALTER TABLE public.cafe_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cafe_status ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cafe_status_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.menu_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.menu_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.event_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.homepage_sections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.prayer_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.static_pages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.static_page_sections ENABLE ROW LEVEL SECURITY;

ALTER TABLE public.main_announcements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.main_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.main_contact_submissions ENABLE ROW LEVEL SECURITY;

-- Profiles & User Roles
CREATE POLICY "Profiles viewable by authenticated users" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Profiles manageable by users or admins" ON public.profiles FOR ALL USING (true);
CREATE POLICY "User roles viewable by authenticated users" ON public.user_roles FOR SELECT USING (true);
CREATE POLICY "User roles manageable by admins" ON public.user_roles FOR ALL USING (true);

-- Kruh Življenja Policies
CREATE POLICY "Kruh people viewable by authenticated" ON public.people FOR SELECT USING (true);
CREATE POLICY "Kruh people manageable" ON public.people FOR ALL USING (true);
CREATE POLICY "Kruh households viewable" ON public.recipient_households FOR SELECT USING (true);
CREATE POLICY "Kruh households manageable" ON public.recipient_households FOR ALL USING (true);
CREATE POLICY "Kruh schedule dates viewable" ON public.schedule_dates FOR SELECT USING (true);
CREATE POLICY "Kruh schedule dates manageable" ON public.schedule_dates FOR ALL USING (true);
CREATE POLICY "Kruh schedule stops viewable" ON public.schedule_stops FOR SELECT USING (true);
CREATE POLICY "Kruh schedule stops manageable" ON public.schedule_stops FOR ALL USING (true);
CREATE POLICY "Kruh locations viewable" ON public.locations FOR SELECT USING (true);
CREATE POLICY "Kruh locations manageable" ON public.locations FOR ALL USING (true);
CREATE POLICY "Kruh date recipients viewable" ON public.date_recipients FOR SELECT USING (true);
CREATE POLICY "Kruh date recipients manageable" ON public.date_recipients FOR ALL USING (true);
CREATE POLICY "Kruh stop messages viewable" ON public.stop_messages FOR SELECT USING (true);
CREATE POLICY "Kruh stop messages insertable" ON public.stop_messages FOR INSERT WITH CHECK (true);
CREATE POLICY "Kruh driver notification log all" ON public.driver_notification_log FOR ALL USING (true);

-- Živa Vera Policies
CREATE POLICY "Cafe status public viewable" ON public.cafe_status FOR SELECT USING (true);
CREATE POLICY "Cafe status manageable" ON public.cafe_status FOR ALL USING (true);
CREATE POLICY "Cafe sessions manageable" ON public.cafe_sessions FOR ALL USING (true);
CREATE POLICY "Menu categories public viewable" ON public.menu_categories FOR SELECT USING (published = true OR auth.uid() IS NOT NULL);
CREATE POLICY "Menu categories manageable" ON public.menu_categories FOR ALL USING (true);
CREATE POLICY "Menu items public viewable" ON public.menu_items FOR SELECT USING (published = true OR auth.uid() IS NOT NULL);
CREATE POLICY "Menu items manageable" ON public.menu_items FOR ALL USING (true);
CREATE POLICY "Events public viewable" ON public.events FOR SELECT USING (published = true OR auth.uid() IS NOT NULL);
CREATE POLICY "Events manageable" ON public.events FOR ALL USING (true);
CREATE POLICY "Event categories public viewable" ON public.event_categories FOR SELECT USING (true);
CREATE POLICY "Event categories manageable" ON public.event_categories FOR ALL USING (true);
CREATE POLICY "Homepage sections public viewable" ON public.homepage_sections FOR SELECT USING (published = true OR auth.uid() IS NOT NULL);
CREATE POLICY "Homepage sections manageable" ON public.homepage_sections FOR ALL USING (true);
CREATE POLICY "Static pages public viewable" ON public.static_pages FOR SELECT USING (published = true OR auth.uid() IS NOT NULL);
CREATE POLICY "Static pages manageable" ON public.static_pages FOR ALL USING (true);
CREATE POLICY "Static page sections public viewable" ON public.static_page_sections FOR SELECT USING (published = true OR auth.uid() IS NOT NULL);
CREATE POLICY "Static page sections manageable" ON public.static_page_sections FOR ALL USING (true);
CREATE POLICY "Prayer requests public submit" ON public.prayer_requests FOR INSERT WITH CHECK (true);
CREATE POLICY "Prayer requests viewable" ON public.prayer_requests FOR SELECT USING (true);
CREATE POLICY "Prayer requests manageable" ON public.prayer_requests FOR ALL USING (true);

-- Main Portal Policies
CREATE POLICY "Main announcements public viewable" ON public.main_announcements FOR SELECT USING (published = true);
CREATE POLICY "Main announcements manageable" ON public.main_announcements FOR ALL USING (true);
CREATE POLICY "Main events public viewable" ON public.main_events FOR SELECT USING (published = true);
CREATE POLICY "Main events manageable" ON public.main_events FOR ALL USING (true);
CREATE POLICY "Main contact submissions insertable" ON public.main_contact_submissions FOR INSERT WITH CHECK (true);
CREATE POLICY "Main contact submissions viewable" ON public.main_contact_submissions FOR SELECT USING (true);

-- Grant privileges to anon and authenticated
GRANT USAGE ON SCHEMA public TO anon, authenticated, service_role;
GRANT ALL ON ALL TABLES IN SCHEMA public TO anon, authenticated, service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated, service_role;
GRANT ALL ON ALL ROUTINES IN SCHEMA public TO anon, authenticated, service_role;
