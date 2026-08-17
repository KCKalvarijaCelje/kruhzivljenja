
CREATE TABLE public.stop_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  schedule_stop_id uuid NOT NULL REFERENCES public.schedule_stops(id) ON DELETE CASCADE,
  author_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  author_name text NOT NULL,
  body text NOT NULL CHECK (char_length(body) BETWEEN 1 AND 2000),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX stop_messages_stop_created_idx ON public.stop_messages (schedule_stop_id, created_at DESC);

GRANT SELECT, INSERT, DELETE ON public.stop_messages TO authenticated;
GRANT ALL ON public.stop_messages TO service_role;

ALTER TABLE public.stop_messages ENABLE ROW LEVEL SECURITY;

-- Any signed-in user can read messages
CREATE POLICY "stop_messages_select_authenticated"
  ON public.stop_messages FOR SELECT
  TO authenticated
  USING (true);

-- Insert: admin OR assigned driver/distributor on the stop; author_id must be the caller
CREATE POLICY "stop_messages_insert_assigned_or_admin"
  ON public.stop_messages FOR INSERT
  TO authenticated
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

-- Delete: admin or original author
CREATE POLICY "stop_messages_delete_admin_or_author"
  ON public.stop_messages FOR DELETE
  TO authenticated
  USING (public.is_admin(auth.uid()) OR author_id = auth.uid());

CREATE TRIGGER stop_messages_touch_updated_at
  BEFORE UPDATE ON public.stop_messages
  FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();
