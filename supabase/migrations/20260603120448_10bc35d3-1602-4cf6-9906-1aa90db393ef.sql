ALTER TABLE public.email_send_log
  ADD COLUMN IF NOT EXISTS provider_message_id text,
  ADD COLUMN IF NOT EXISTS provider_response jsonb;

CREATE INDEX IF NOT EXISTS idx_email_send_log_provider_message_id
  ON public.email_send_log (provider_message_id)
  WHERE provider_message_id IS NOT NULL;