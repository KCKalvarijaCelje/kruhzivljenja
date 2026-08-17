-- People
ALTER TABLE public.people
  ADD COLUMN IF NOT EXISTS first_name text,
  ADD COLUMN IF NOT EXISTS last_name text,
  ADD COLUMN IF NOT EXISTS needs_name_review boolean NOT NULL DEFAULT false;

UPDATE public.people
SET
  first_name = COALESCE(first_name, split_part(trim(full_name), ' ', 1)),
  last_name = COALESCE(
    last_name,
    NULLIF(trim(substring(trim(full_name) from position(' ' in trim(full_name)) + 1)), '')
  ),
  needs_name_review = (position(' ' in trim(full_name)) = 0)
WHERE first_name IS NULL OR last_name IS NULL;

-- Recipient households
ALTER TABLE public.recipient_households
  ADD COLUMN IF NOT EXISTS first_name text,
  ADD COLUMN IF NOT EXISTS last_name text,
  ADD COLUMN IF NOT EXISTS needs_name_review boolean NOT NULL DEFAULT false;

UPDATE public.recipient_households
SET
  first_name = COALESCE(first_name, split_part(trim(name), ' ', 1)),
  last_name = COALESCE(
    last_name,
    NULLIF(trim(substring(trim(name) from position(' ' in trim(name)) + 1)), '')
  ),
  needs_name_review = (position(' ' in trim(name)) = 0)
WHERE first_name IS NULL OR last_name IS NULL;