
-- Audit table
CREATE TABLE public.person_profile_link_audit (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  person_id uuid,
  profile_id uuid,
  action text NOT NULL CHECK (action IN ('linked','created','unlinked','role_added','role_removed')),
  role text,
  actor_id uuid,
  details jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT ON public.person_profile_link_audit TO authenticated;
GRANT ALL ON public.person_profile_link_audit TO service_role;

ALTER TABLE public.person_profile_link_audit ENABLE ROW LEVEL SECURITY;

CREATE POLICY ppla_admin_read ON public.person_profile_link_audit
  FOR SELECT TO authenticated
  USING (is_admin(auth.uid()));

CREATE INDEX idx_ppla_profile ON public.person_profile_link_audit(profile_id);
CREATE INDEX idx_ppla_person ON public.person_profile_link_audit(person_id);

-- Replace linking RPC
CREATE OR REPLACE FUNCTION public.link_or_create_person_for_profile(
  _profile_id uuid,
  _link_to_person_id uuid DEFAULT NULL::uuid,
  _force_create boolean DEFAULT false
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
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
  IF NOT is_admin(actor) THEN
    RAISE EXCEPTION 'not authorized';
  END IF;

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
    -- 1) Email match (unlinked only)
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

    -- 2) Build candidate list: email duplicates + name matches
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

      -- 3) Create new
      INSERT INTO public.people (full_name, email, profile_id)
      VALUES (COALESCE(NULLIF(prof.full_name, ''), prof.email), prof.email, _profile_id)
      RETURNING id INTO target_person_id;
      INSERT INTO public.person_profile_link_audit(person_id, profile_id, action, actor_id, details)
      VALUES (target_person_id, _profile_id, 'created', actor, jsonb_build_object('mode','auto_create'));
    END IF;
  END IF;

  -- Mirror roles
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
$function$;

-- Replace role sync with audit
CREATE OR REPLACE FUNCTION public.sync_person_role(_profile_id uuid, _role app_role, _enabled boolean)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
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
$function$;
