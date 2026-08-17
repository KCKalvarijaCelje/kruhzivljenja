DROP POLICY IF EXISTS "stop_messages_select_authenticated" ON public.stop_messages;

CREATE POLICY "stop_messages_select_approved"
  ON public.stop_messages FOR SELECT
  TO authenticated
  USING (public.is_approved(auth.uid()));