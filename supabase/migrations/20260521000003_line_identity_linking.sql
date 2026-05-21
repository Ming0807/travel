-- Phase 11: Optional LINE LIFF account-linking support.
-- LINE remains optional. This migration only adds metadata needed to link a
-- verified LINE identity to an existing tourist profile and record consent.

ALTER TABLE public.tourist_identities
  ADD COLUMN IF NOT EXISTS linked_at timestamptz DEFAULT now(),
  ADD COLUMN IF NOT EXISTS metadata_json jsonb;

ALTER TABLE public.consent_records
  ADD COLUMN IF NOT EXISTS visit_id uuid REFERENCES public.visits(visit_id),
  ADD COLUMN IF NOT EXISTS consent_type varchar(100),
  ADD COLUMN IF NOT EXISTS purpose_key varchar(150),
  ADD COLUMN IF NOT EXISTS language varchar(10) DEFAULT 'th',
  ADD COLUMN IF NOT EXISTS metadata_json jsonb,
  ADD COLUMN IF NOT EXISTS withdrawn_at timestamptz;

CREATE INDEX IF NOT EXISTS idx_tourist_identities_tourist_provider
  ON public.tourist_identities(tourist_id, provider);

CREATE INDEX IF NOT EXISTS idx_consent_records_tourist_purpose
  ON public.consent_records(tourist_id, purpose_key, consented_at);
