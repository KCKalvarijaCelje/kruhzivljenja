
-- One person per linked profile
CREATE UNIQUE INDEX IF NOT EXISTS people_profile_id_unique
  ON public.people(profile_id) WHERE profile_id IS NOT NULL;

-- Resolve / link / create a person for an approved profile.
CREATE OR REPLACE FUNCTION public.link_or_create_person_for_profile(
  _profile_id uuid,
  _link_to_person_id uuid DEFAULT NULL,
  _force_create boolean DEFAULT false
) RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  prof record;
  existing_person record;
  email_match_id uuid;
  email_match_count int;
  name_matches jsonb;
  target_person_id uuid;
  has_driver boolean;
  has_coord boolean;
BEGIN
  IF NOT is_admin(auth.uid()) THEN
    RAISE EXCEPTION 'not authorized';
  END IF;

  SELECT id, full_name, email INTO prof FROM public.profiles WHERE id = _profile_id;
  IF NOT FOUND THEN RAISE EXCEPTION 'profile not found'; END IF;

  -- Already linked?
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
  ELSIF _force_create THEN
    INSERT INTO public.people (full_name, email, profile_id)
    VALUES (COALESCE(NULLIF(prof.full_name, ''), prof.email), prof.email, _profile_id)
    RETURNING id INTO target_person_id;
  ELSE
    -- 1) Try email match (unlinked only)
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
      END IF;
    END IF;

    -- 2) Name match -> ask admin
    IF target_person_id IS NULL THEN
      SELECT COALESCE(jsonb_agg(jsonb_build_object(
        'id', p.id,
        'full_name', p.full_name,
        'email', p.email,
        'phone', p.phone
      ) ORDER BY p.full_name), '[]'::jsonb)
        INTO name_matches
        FROM public.people p
       WHERE p.profile_id IS NULL
         AND prof.full_name IS NOT NULL
         AND prof.full_name <> ''
         AND lower(trim(p.full_name)) = lower(trim(prof.full_name));

      IF jsonb_array_length(name_matches) > 0 THEN
        RETURN jsonb_build_object('status', 'needs_choice', 'candidates', name_matches);
      END IF;

      -- 3) Create new
      INSERT INTO public.people (full_name, email, profile_id)
      VALUES (COALESCE(NULLIF(prof.full_name, ''), prof.email), prof.email, _profile_id)
      RETURNING id INTO target_person_id;
    END IF;
  END IF;

  -- Mirror Driver / Coordinator roles from user_roles into people_roles
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

-- Add/remove a single role on the People mirror for an approved profile.
CREATE OR REPLACE FUNCTION public.sync_person_role(
  _profile_id uuid,
  _role app_role,
  _enabled boolean
) RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  pid uuid;
BEGIN
  IF NOT is_admin(auth.uid()) THEN RAISE EXCEPTION 'not authorized'; END IF;
  IF _role NOT IN ('driver', 'coordinator') THEN RETURN; END IF;
  SELECT id INTO pid FROM public.people WHERE profile_id = _profile_id;
  IF pid IS NULL THEN RETURN; END IF;
  IF _enabled THEN
    INSERT INTO public.people_roles(person_id, role) VALUES (pid, _role)
    ON CONFLICT (person_id, role) DO NOTHING;
  ELSE
    DELETE FROM public.people_roles WHERE person_id = pid AND role = _role;
  END IF;
END;
$$;
