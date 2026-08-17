ALTER TABLE public.recipient_households
  ADD COLUMN IF NOT EXISTS person_id uuid UNIQUE REFERENCES public.people(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_recipient_households_person ON public.recipient_households(person_id);