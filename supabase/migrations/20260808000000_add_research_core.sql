-- Phase 18: versioned, privacy-aware research evaluation foundation.
-- This migration creates only the inactive technical contract. It intentionally
-- seeds no study, instrument, item, operator task, session, or response.

CREATE TABLE public.research_studies (
  research_study_id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  study_code varchar(80) NOT NULL UNIQUE,
  title_th varchar(255) NOT NULL,
  title_en varchar(255),
  protocol_version varchar(50) NOT NULL,
  consent_version varchar(50) NOT NULL,
  notice_version varchar(50) NOT NULL,
  purpose_th text NOT NULL,
  participation_th text NOT NULL,
  privacy_th text NOT NULL,
  withdrawal_th text NOT NULL,
  contact_email varchar(320) NOT NULL CHECK (
    contact_email ~* '^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$'
  ),
  scope_code varchar(100) NOT NULL,
  status varchar(20) NOT NULL DEFAULT 'draft' CHECK (
    status IN ('draft', 'active', 'paused', 'closed', 'archived')
  ),
  starts_at timestamptz,
  ends_at timestamptz,
  retention_until timestamptz,
  advisor_approved_at timestamptz,
  ethics_review_status varchar(30) NOT NULL DEFAULT 'pending' CHECK (
    ethics_review_status IN ('pending', 'not_required', 'approved')
  ),
  ethics_approved_at timestamptz,
  approval_reference varchar(500),
  approval_recorded_by uuid REFERENCES public.admin_users(admin_id) ON DELETE SET NULL,
  frozen_at timestamptz,
  owner_admin_id uuid NOT NULL REFERENCES public.admin_users(admin_id) ON DELETE RESTRICT,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz,
  CONSTRAINT research_studies_code_check
    CHECK (study_code ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$'),
  CONSTRAINT research_studies_date_range_check
    CHECK (starts_at IS NULL OR ends_at IS NULL OR starts_at < ends_at),
  CONSTRAINT research_studies_retention_check
    CHECK (retention_until IS NULL OR ends_at IS NULL OR retention_until >= ends_at),
  CONSTRAINT research_studies_ethics_approval_check CHECK (
    (ethics_review_status = 'approved' AND ethics_approved_at IS NOT NULL)
    OR (ethics_review_status <> 'approved' AND ethics_approved_at IS NULL)
  ),
  CONSTRAINT research_studies_freeze_check
    CHECK (status = 'draft' OR frozen_at IS NOT NULL)
);

CREATE TABLE public.research_instruments (
  research_instrument_id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  study_id uuid NOT NULL REFERENCES public.research_studies(research_study_id) ON DELETE RESTRICT,
  instrument_key varchar(80) NOT NULL,
  version_number integer NOT NULL CHECK (version_number > 0),
  audience varchar(30) NOT NULL CHECK (
    audience IN ('tourist', 'operator', 'attraction_manager')
  ),
  status varchar(20) NOT NULL DEFAULT 'draft' CHECK (
    status IN ('draft', 'published', 'retired')
  ),
  title_th varchar(255) NOT NULL,
  title_en varchar(255),
  description_th text,
  description_en text,
  estimated_minutes integer CHECK (estimated_minutes IS NULL OR estimated_minutes BETWEEN 1 AND 60),
  published_at timestamptz,
  frozen_at timestamptz,
  created_by uuid REFERENCES public.admin_users(admin_id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz,
  CONSTRAINT research_instruments_key_check
    CHECK (instrument_key ~ '^[a-z0-9]+(?:_[a-z0-9]+)*$'),
  CONSTRAINT research_instruments_publication_check
    CHECK (status = 'draft' OR (published_at IS NOT NULL AND frozen_at IS NOT NULL)),
  UNIQUE (study_id, instrument_key, version_number)
);

CREATE UNIQUE INDEX uq_research_instruments_published_key
  ON public.research_instruments(study_id, instrument_key)
  WHERE status = 'published';

CREATE TABLE public.research_items (
  research_item_id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  instrument_id uuid NOT NULL REFERENCES public.research_instruments(research_instrument_id) ON DELETE RESTRICT,
  item_code varchar(30) NOT NULL,
  construct_key varchar(80) NOT NULL,
  prompt_th text NOT NULL,
  prompt_en text,
  answer_type varchar(30) NOT NULL CHECK (
    answer_type IN (
      'agreement_5', 'rating_5', 'boolean', 'integer',
      'single_choice', 'short_text', 'long_text'
    )
  ),
  options_json jsonb,
  display_order integer NOT NULL CHECK (display_order > 0),
  is_required boolean NOT NULL DEFAULT true,
  reverse_score boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz,
  CONSTRAINT research_items_code_check CHECK (item_code ~ '^[A-Z][A-Z0-9_]{1,29}$'),
  CONSTRAINT research_items_construct_check
    CHECK (construct_key ~ '^[a-z0-9]+(?:_[a-z0-9]+)*$'),
  CONSTRAINT research_items_options_check CHECK (
    (answer_type = 'single_choice' AND options_json IS NOT NULL AND jsonb_typeof(options_json) = 'array')
    OR (answer_type <> 'single_choice' AND options_json IS NULL)
  ),
  UNIQUE (instrument_id, item_code),
  UNIQUE (instrument_id, display_order)
);

CREATE TABLE public.research_checkin_codes (
  study_id uuid NOT NULL REFERENCES public.research_studies(research_study_id) ON DELETE RESTRICT,
  checkin_code_id bigint NOT NULL REFERENCES public.checkin_codes(checkin_code_id) ON DELETE RESTRICT,
  default_collection_mode varchar(30) NOT NULL CHECK (
    default_collection_mode IN ('field_observation', 'simulated_usability', 'pilot_internal')
  ),
  is_active boolean NOT NULL DEFAULT false,
  starts_at timestamptz,
  ends_at timestamptz,
  created_by uuid REFERENCES public.admin_users(admin_id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT research_checkin_codes_date_range_check
    CHECK (starts_at IS NULL OR ends_at IS NULL OR starts_at < ends_at),
  PRIMARY KEY (study_id, checkin_code_id)
);

CREATE TABLE public.research_sessions (
  research_session_id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  study_id uuid NOT NULL REFERENCES public.research_studies(research_study_id) ON DELETE RESTRICT,
  participant_code uuid NOT NULL DEFAULT gen_random_uuid() UNIQUE,
  public_session_code uuid NOT NULL DEFAULT gen_random_uuid() UNIQUE,
  access_token_hash text NOT NULL UNIQUE,
  withdrawal_token_hash text NOT NULL UNIQUE,
  operational_session_hash text,
  facilitator_invitation_key uuid UNIQUE,
  participant_type varchar(30) NOT NULL CHECK (
    participant_type IN ('tourist', 'operator', 'attraction_manager')
  ),
  collection_mode varchar(30) NOT NULL CHECK (
    collection_mode IN ('field_observation', 'simulated_usability', 'pilot_internal')
  ),
  tourist_id uuid REFERENCES public.tourists(tourist_id) ON DELETE SET NULL,
  visit_id uuid REFERENCES public.visits(visit_id) ON DELETE SET NULL,
  checkin_code_id bigint REFERENCES public.checkin_codes(checkin_code_id) ON DELETE SET NULL,
  status varchar(20) NOT NULL DEFAULT 'consented' CHECK (
    status IN ('consented', 'in_progress', 'completed', 'abandoned', 'withdrawn', 'excluded', 'expired')
  ),
  inclusion_status varchar(20) NOT NULL DEFAULT 'pending' CHECK (
    inclusion_status IN ('pending', 'included', 'excluded')
  ),
  exclusion_reason varchar(500),
  consented_at timestamptz NOT NULL,
  started_at timestamptz,
  completed_at timestamptz,
  withdrawn_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz,
  CONSTRAINT research_sessions_participant_link_check CHECK (
    participant_type = 'tourist' OR (tourist_id IS NULL AND visit_id IS NULL AND checkin_code_id IS NULL)
  ),
  CONSTRAINT research_sessions_completed_check CHECK (
    status <> 'completed' OR completed_at IS NOT NULL
  ),
  CONSTRAINT research_sessions_withdrawn_check CHECK (
    status <> 'withdrawn' OR (withdrawn_at IS NOT NULL AND inclusion_status = 'excluded')
  ),
  CONSTRAINT research_sessions_exclusion_check CHECK (
    inclusion_status <> 'excluded' OR exclusion_reason IS NOT NULL OR status = 'withdrawn'
  )
);

CREATE UNIQUE INDEX uq_research_sessions_study_visit
  ON public.research_sessions(study_id, visit_id)
  WHERE visit_id IS NOT NULL;

CREATE UNIQUE INDEX uq_research_sessions_study_operational_session
  ON public.research_sessions(study_id, operational_session_hash)
  WHERE operational_session_hash IS NOT NULL
    AND status NOT IN ('withdrawn', 'excluded', 'expired');

CREATE TABLE public.research_consents (
  research_consent_id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  research_session_id uuid NOT NULL REFERENCES public.research_sessions(research_session_id) ON DELETE RESTRICT,
  purpose_key varchar(80) NOT NULL CHECK (
    purpose_key IN ('research_evaluation', 'research_behavioral_correlation', 'operator_evaluation')
  ),
  consent_version varchar(50) NOT NULL,
  notice_version varchar(50) NOT NULL,
  has_consented boolean NOT NULL DEFAULT true CHECK (has_consented = true),
  language varchar(10) CHECK (language IN ('th', 'en', 'ms')),
  source varchar(100) NOT NULL,
  consented_at timestamptz NOT NULL DEFAULT now(),
  withdrawn_at timestamptz,
  withdrawal_source varchar(100),
  withdrawal_reason varchar(500),
  processed_by uuid REFERENCES public.admin_users(admin_id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT research_consents_withdrawal_check CHECK (
    withdrawn_at IS NULL OR withdrawal_source IS NOT NULL
  ),
  UNIQUE (research_session_id, purpose_key)
);

CREATE TABLE public.research_responses (
  research_response_id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  research_session_id uuid NOT NULL REFERENCES public.research_sessions(research_session_id) ON DELETE RESTRICT,
  instrument_id uuid NOT NULL REFERENCES public.research_instruments(research_instrument_id) ON DELETE RESTRICT,
  status varchar(20) NOT NULL DEFAULT 'draft' CHECK (
    status IN ('draft', 'submitted', 'withdrawn', 'excluded')
  ),
  started_at timestamptz NOT NULL DEFAULT now(),
  submitted_at timestamptz,
  duration_seconds integer CHECK (duration_seconds IS NULL OR duration_seconds BETWEEN 0 AND 86400),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz,
  CONSTRAINT research_responses_submission_check CHECK (
    status <> 'submitted' OR submitted_at IS NOT NULL
  ),
  UNIQUE (research_session_id, instrument_id)
);

CREATE TABLE public.research_answers (
  research_answer_id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  response_id uuid NOT NULL REFERENCES public.research_responses(research_response_id) ON DELETE RESTRICT,
  item_id uuid NOT NULL REFERENCES public.research_items(research_item_id) ON DELETE RESTRICT,
  integer_value integer,
  text_value text CHECK (text_value IS NULL OR char_length(text_value) <= 2000),
  boolean_value boolean,
  answered_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT research_answers_exactly_one_value_check CHECK (
    num_nonnulls(integer_value, text_value, boolean_value) = 1
  ),
  UNIQUE (response_id, item_id)
);

CREATE TABLE public.research_operator_tasks (
  research_operator_task_id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  study_id uuid NOT NULL REFERENCES public.research_studies(research_study_id) ON DELETE RESTRICT,
  task_code varchar(50) NOT NULL,
  version_number integer NOT NULL CHECK (version_number > 0),
  audience varchar(30) NOT NULL CHECK (audience IN ('operator', 'attraction_manager')),
  title_th varchar(255) NOT NULL,
  title_en varchar(255),
  instruction_th text NOT NULL,
  instruction_en text,
  expected_evidence text NOT NULL,
  scoring_rule jsonb NOT NULL CHECK (jsonb_typeof(scoring_rule) = 'object'),
  display_order integer NOT NULL CHECK (display_order > 0),
  maximum_minutes integer CHECK (maximum_minutes IS NULL OR maximum_minutes BETWEEN 1 AND 120),
  status varchar(20) NOT NULL DEFAULT 'draft' CHECK (
    status IN ('draft', 'published', 'retired')
  ),
  published_at timestamptz,
  frozen_at timestamptz,
  created_by uuid REFERENCES public.admin_users(admin_id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz,
  CONSTRAINT research_operator_tasks_code_check
    CHECK (task_code ~ '^[a-z0-9]+(?:_[a-z0-9]+)*$'),
  CONSTRAINT research_operator_tasks_publication_check
    CHECK (status = 'draft' OR (published_at IS NOT NULL AND frozen_at IS NOT NULL)),
  UNIQUE (study_id, task_code, version_number),
  UNIQUE (study_id, version_number, display_order)
);

CREATE TABLE public.research_operator_task_attempts (
  research_operator_task_attempt_id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  research_session_id uuid NOT NULL REFERENCES public.research_sessions(research_session_id) ON DELETE RESTRICT,
  research_operator_task_id uuid NOT NULL REFERENCES public.research_operator_tasks(research_operator_task_id) ON DELETE RESTRICT,
  sequence_number integer NOT NULL CHECK (sequence_number BETWEEN 1 AND 100),
  status varchar(20) NOT NULL DEFAULT 'not_started' CHECK (
    status IN ('not_started', 'in_progress', 'completed', 'skipped', 'abandoned')
  ),
  outcome varchar(20) CHECK (outcome IN ('passed', 'partial', 'failed', 'not_assessed')),
  confidence integer CHECK (confidence BETWEEN 1 AND 5),
  evidence_quality integer CHECK (evidence_quality BETWEEN 1 AND 5),
  rationale text CHECK (rationale IS NULL OR char_length(rationale) <= 4000),
  coded_notes jsonb CHECK (coded_notes IS NULL OR jsonb_typeof(coded_notes) = 'object'),
  started_at timestamptz,
  completed_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz,
  CONSTRAINT research_operator_attempts_completion_check CHECK (
    status <> 'completed' OR (completed_at IS NOT NULL AND outcome IS NOT NULL)
  ),
  UNIQUE (research_session_id, research_operator_task_id),
  UNIQUE (research_session_id, sequence_number)
);

ALTER TABLE public.funnel_events
  ADD COLUMN IF NOT EXISTS research_session_id uuid
    REFERENCES public.research_sessions(research_session_id) ON DELETE SET NULL;

CREATE INDEX idx_research_studies_status_dates
  ON public.research_studies(status, starts_at, ends_at);
CREATE INDEX idx_research_instruments_study_status
  ON public.research_instruments(study_id, status, instrument_key, version_number DESC);
CREATE INDEX idx_research_items_instrument_order
  ON public.research_items(instrument_id, display_order);
CREATE INDEX idx_research_checkin_codes_active
  ON public.research_checkin_codes(checkin_code_id, is_active, starts_at, ends_at);
CREATE UNIQUE INDEX uq_research_checkin_codes_one_active_study
  ON public.research_checkin_codes(checkin_code_id)
  WHERE is_active = true;
CREATE INDEX idx_research_sessions_study_mode_status
  ON public.research_sessions(study_id, collection_mode, status, created_at DESC);
CREATE INDEX idx_research_sessions_visit
  ON public.research_sessions(visit_id) WHERE visit_id IS NOT NULL;
CREATE INDEX idx_research_consents_session
  ON public.research_consents(research_session_id, purpose_key, consented_at);
CREATE INDEX idx_research_responses_instrument_status
  ON public.research_responses(instrument_id, status, submitted_at DESC);
CREATE INDEX idx_research_answers_response
  ON public.research_answers(response_id, item_id);
CREATE INDEX idx_research_operator_tasks_study_order
  ON public.research_operator_tasks(study_id, version_number, display_order);
CREATE INDEX idx_research_operator_attempts_session
  ON public.research_operator_task_attempts(research_session_id, sequence_number);
CREATE INDEX idx_funnel_events_research_session_time
  ON public.funnel_events(research_session_id, event_time)
  WHERE research_session_id IS NOT NULL;
CREATE INDEX idx_funnel_events_research_session_type_time
  ON public.funnel_events(research_session_id, event_type, event_time)
  WHERE research_session_id IS NOT NULL;

CREATE OR REPLACE FUNCTION public.correlate_research_funnel_event()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = ''
AS $$
DECLARE
  v_research_session_id uuid;
BEGIN
  IF NEW.research_session_id IS NOT NULL OR NEW.visit_id IS NULL THEN
    RETURN NEW;
  END IF;

  SELECT session.research_session_id
  INTO v_research_session_id
  FROM public.research_sessions AS session
  WHERE session.visit_id = NEW.visit_id
    AND session.participant_type = 'tourist'
    AND session.status IN ('in_progress', 'completed')
    AND session.inclusion_status <> 'excluded'
    AND session.withdrawn_at IS NULL
    AND session.consented_at <= NEW.event_time
  ORDER BY session.consented_at DESC
  LIMIT 1;

  NEW.research_session_id := v_research_session_id;
  RETURN NEW;
END;
$$;

CREATE TRIGGER correlate_research_funnel_event
BEFORE INSERT ON public.funnel_events
FOR EACH ROW EXECUTE FUNCTION public.correlate_research_funnel_event();

CREATE OR REPLACE FUNCTION public.prevent_frozen_research_study_mutation()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  IF TG_OP = 'DELETE' THEN
    IF OLD.frozen_at IS NOT NULL OR OLD.status <> 'draft' THEN
      RAISE EXCEPTION 'FROZEN_RESEARCH_STUDY_IMMUTABLE';
    END IF;
    RETURN OLD;
  END IF;

  IF OLD.status IS DISTINCT FROM NEW.status AND NOT (
    (OLD.status = 'draft' AND NEW.status = 'active')
    OR (OLD.status = 'active' AND NEW.status IN ('paused', 'closed'))
    OR (OLD.status = 'paused' AND NEW.status IN ('active', 'closed'))
    OR (OLD.status = 'closed' AND NEW.status = 'archived')
  ) THEN
    RAISE EXCEPTION 'RESEARCH_STUDY_STATUS_TRANSITION_INVALID';
  END IF;

  IF OLD.frozen_at IS NULL AND NEW.frozen_at IS NOT NULL AND NEW.status = 'draft' THEN
    RAISE EXCEPTION 'RESEARCH_STUDY_FREEZE_REQUIRES_ACTIVATION';
  END IF;

  IF NEW.status = 'active' AND OLD.status IS DISTINCT FROM 'active' THEN
    IF NEW.frozen_at IS NULL THEN
      RAISE EXCEPTION 'RESEARCH_STUDY_NOT_FROZEN';
    END IF;

    IF NEW.advisor_approved_at IS NULL
      OR NEW.ethics_review_status NOT IN ('not_required', 'approved')
      OR nullif(btrim(NEW.approval_reference), '') IS NULL
      OR NEW.approval_recorded_by IS NULL THEN
      RAISE EXCEPTION 'RESEARCH_STUDY_APPROVAL_REQUIRED';
    END IF;

    IF EXISTS (
      SELECT 1
      FROM public.research_instruments AS instrument
      WHERE instrument.study_id = NEW.research_study_id
        AND instrument.status = 'draft'
    ) OR EXISTS (
      SELECT 1
      FROM public.research_operator_tasks AS task
      WHERE task.study_id = NEW.research_study_id
        AND task.status = 'draft'
    ) THEN
      RAISE EXCEPTION 'RESEARCH_STUDY_DRAFT_CONFIGURATION_EXISTS';
    END IF;

    IF NOT EXISTS (
      SELECT 1
      FROM public.research_instruments AS instrument
      WHERE instrument.study_id = NEW.research_study_id
        AND instrument.audience = 'tourist'
        AND instrument.status = 'published'
        AND instrument.frozen_at IS NOT NULL
    ) THEN
      RAISE EXCEPTION 'RESEARCH_STUDY_TOURIST_INSTRUMENT_REQUIRED';
    END IF;

    IF NOT EXISTS (
      SELECT 1
      FROM public.research_checkin_codes AS deployment
      WHERE deployment.study_id = NEW.research_study_id
        AND deployment.is_active = true
    ) THEN
      RAISE EXCEPTION 'RESEARCH_STUDY_DEPLOYMENT_REQUIRED';
    END IF;
  END IF;

  IF (OLD.frozen_at IS NOT NULL OR OLD.status <> 'draft') AND (
    NEW.study_code IS DISTINCT FROM OLD.study_code
    OR NEW.title_th IS DISTINCT FROM OLD.title_th
    OR NEW.title_en IS DISTINCT FROM OLD.title_en
    OR NEW.protocol_version IS DISTINCT FROM OLD.protocol_version
    OR NEW.consent_version IS DISTINCT FROM OLD.consent_version
    OR NEW.notice_version IS DISTINCT FROM OLD.notice_version
    OR NEW.purpose_th IS DISTINCT FROM OLD.purpose_th
    OR NEW.participation_th IS DISTINCT FROM OLD.participation_th
    OR NEW.privacy_th IS DISTINCT FROM OLD.privacy_th
    OR NEW.withdrawal_th IS DISTINCT FROM OLD.withdrawal_th
    OR NEW.contact_email IS DISTINCT FROM OLD.contact_email
    OR NEW.scope_code IS DISTINCT FROM OLD.scope_code
    OR NEW.advisor_approved_at IS DISTINCT FROM OLD.advisor_approved_at
    OR NEW.ethics_review_status IS DISTINCT FROM OLD.ethics_review_status
    OR NEW.ethics_approved_at IS DISTINCT FROM OLD.ethics_approved_at
    OR NEW.approval_reference IS DISTINCT FROM OLD.approval_reference
    OR NEW.approval_recorded_by IS DISTINCT FROM OLD.approval_recorded_by
    OR NEW.owner_admin_id IS DISTINCT FROM OLD.owner_admin_id
    OR NEW.frozen_at IS DISTINCT FROM OLD.frozen_at
  ) THEN
    RAISE EXCEPTION 'FROZEN_RESEARCH_STUDY_IMMUTABLE';
  END IF;

  RETURN NEW;
END;
$$;

CREATE TRIGGER prevent_frozen_research_study_mutation
BEFORE UPDATE OR DELETE ON public.research_studies
FOR EACH ROW EXECUTE FUNCTION public.prevent_frozen_research_study_mutation();

CREATE OR REPLACE FUNCTION public.prevent_frozen_research_child_link_mutation()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $$
DECLARE
  v_old_frozen_at timestamptz;
  v_new_frozen_at timestamptz;
BEGIN
  IF TG_OP = 'UPDATE' THEN
    SELECT frozen_at INTO v_old_frozen_at
    FROM public.research_studies
    WHERE research_study_id = OLD.study_id
    FOR SHARE;
  END IF;

  SELECT frozen_at INTO v_new_frozen_at
  FROM public.research_studies
  WHERE research_study_id = NEW.study_id
  FOR SHARE;

  IF v_old_frozen_at IS NOT NULL OR v_new_frozen_at IS NOT NULL THEN
    RAISE EXCEPTION 'FROZEN_RESEARCH_CONFIGURATION_IMMUTABLE';
  END IF;

  RETURN NEW;
END;
$$;

CREATE TRIGGER prevent_frozen_research_instrument_insert
BEFORE INSERT OR UPDATE OF study_id ON public.research_instruments
FOR EACH ROW EXECUTE FUNCTION public.prevent_frozen_research_child_link_mutation();

CREATE TRIGGER prevent_frozen_research_task_insert
BEFORE INSERT OR UPDATE OF study_id ON public.research_operator_tasks
FOR EACH ROW EXECUTE FUNCTION public.prevent_frozen_research_child_link_mutation();

CREATE OR REPLACE FUNCTION public.prevent_frozen_research_deployment_mutation()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $$
DECLARE
  v_study_id uuid;
  v_frozen_at timestamptz;
BEGIN
  v_study_id := CASE WHEN TG_OP = 'DELETE' THEN OLD.study_id ELSE NEW.study_id END;

  SELECT frozen_at INTO v_frozen_at
  FROM public.research_studies
  WHERE research_study_id = v_study_id
  FOR SHARE;

  IF v_frozen_at IS NULL THEN
    RETURN CASE WHEN TG_OP = 'DELETE' THEN OLD ELSE NEW END;
  END IF;

  IF TG_OP <> 'UPDATE'
    OR NEW.study_id IS DISTINCT FROM OLD.study_id
    OR NEW.checkin_code_id IS DISTINCT FROM OLD.checkin_code_id
    OR NEW.default_collection_mode IS DISTINCT FROM OLD.default_collection_mode
    OR NEW.starts_at IS DISTINCT FROM OLD.starts_at
    OR NEW.ends_at IS DISTINCT FROM OLD.ends_at
    OR NEW.created_by IS DISTINCT FROM OLD.created_by
    OR NEW.created_at IS DISTINCT FROM OLD.created_at THEN
    RAISE EXCEPTION 'FROZEN_RESEARCH_CONFIGURATION_IMMUTABLE';
  END IF;

  -- is_active is the only operational switch allowed after protocol freeze.
  RETURN NEW;
END;
$$;

CREATE TRIGGER prevent_frozen_research_deployment_mutation
BEFORE INSERT OR UPDATE OR DELETE ON public.research_checkin_codes
FOR EACH ROW EXECUTE FUNCTION public.prevent_frozen_research_deployment_mutation();

CREATE OR REPLACE FUNCTION public.prevent_published_research_instrument_mutation()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  IF TG_OP = 'DELETE' THEN
    IF OLD.status IN ('published', 'retired') THEN
      RAISE EXCEPTION 'PUBLISHED_RESEARCH_INSTRUMENT_IMMUTABLE';
    END IF;
    RETURN OLD;
  END IF;

  IF OLD.status IS DISTINCT FROM NEW.status AND NOT (
    (OLD.status = 'draft' AND NEW.status = 'published')
    OR (OLD.status = 'published' AND NEW.status = 'retired')
  ) THEN
    RAISE EXCEPTION 'RESEARCH_INSTRUMENT_STATUS_TRANSITION_INVALID';
  END IF;

  IF OLD.status IN ('published', 'retired') AND (
    NEW.study_id IS DISTINCT FROM OLD.study_id
    OR NEW.instrument_key IS DISTINCT FROM OLD.instrument_key
    OR NEW.version_number IS DISTINCT FROM OLD.version_number
    OR NEW.audience IS DISTINCT FROM OLD.audience
    OR NEW.title_th IS DISTINCT FROM OLD.title_th
    OR NEW.title_en IS DISTINCT FROM OLD.title_en
    OR NEW.description_th IS DISTINCT FROM OLD.description_th
    OR NEW.description_en IS DISTINCT FROM OLD.description_en
    OR NEW.estimated_minutes IS DISTINCT FROM OLD.estimated_minutes
    OR NEW.published_at IS DISTINCT FROM OLD.published_at
    OR NEW.frozen_at IS DISTINCT FROM OLD.frozen_at
    OR NEW.status NOT IN (OLD.status, 'retired')
  ) THEN
    RAISE EXCEPTION 'PUBLISHED_RESEARCH_INSTRUMENT_IMMUTABLE';
  END IF;

  RETURN NEW;
END;
$$;

CREATE TRIGGER prevent_published_research_instrument_mutation
BEFORE UPDATE OR DELETE ON public.research_instruments
FOR EACH ROW EXECUTE FUNCTION public.prevent_published_research_instrument_mutation();

CREATE OR REPLACE FUNCTION public.prevent_published_research_item_mutation()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $$
DECLARE
  v_instrument_id uuid;
  v_status text;
BEGIN
  v_instrument_id := CASE WHEN TG_OP = 'DELETE' THEN OLD.instrument_id ELSE NEW.instrument_id END;

  SELECT status INTO v_status
  FROM public.research_instruments
  WHERE research_instrument_id = v_instrument_id;

  IF v_status IN ('published', 'retired') THEN
    RAISE EXCEPTION 'PUBLISHED_RESEARCH_ITEMS_IMMUTABLE';
  END IF;

  RETURN CASE WHEN TG_OP = 'DELETE' THEN OLD ELSE NEW END;
END;
$$;

CREATE TRIGGER prevent_published_research_item_mutation
BEFORE INSERT OR UPDATE OR DELETE ON public.research_items
FOR EACH ROW EXECUTE FUNCTION public.prevent_published_research_item_mutation();

CREATE OR REPLACE FUNCTION public.validate_research_response_scope()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $$
DECLARE
  v_session_study_id uuid;
  v_instrument_study_id uuid;
  v_instrument_status text;
BEGIN
  SELECT study_id INTO v_session_study_id
  FROM public.research_sessions
  WHERE research_session_id = NEW.research_session_id;

  SELECT study_id, status INTO v_instrument_study_id, v_instrument_status
  FROM public.research_instruments
  WHERE research_instrument_id = NEW.instrument_id;

  IF v_session_study_id IS DISTINCT FROM v_instrument_study_id THEN
    RAISE EXCEPTION 'RESEARCH_RESPONSE_STUDY_MISMATCH';
  END IF;

  IF v_instrument_status <> 'published' THEN
    RAISE EXCEPTION 'RESEARCH_INSTRUMENT_NOT_PUBLISHED';
  END IF;

  RETURN NEW;
END;
$$;

CREATE TRIGGER validate_research_response_scope
BEFORE INSERT OR UPDATE OF research_session_id, instrument_id ON public.research_responses
FOR EACH ROW EXECUTE FUNCTION public.validate_research_response_scope();

CREATE OR REPLACE FUNCTION public.validate_research_answer_type()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $$
DECLARE
  v_answer_type text;
  v_options jsonb;
  v_response_instrument_id uuid;
  v_item_instrument_id uuid;
BEGIN
  SELECT answer_type, options_json, instrument_id
    INTO v_answer_type, v_options, v_item_instrument_id
  FROM public.research_items
  WHERE research_item_id = NEW.item_id;

  SELECT instrument_id INTO v_response_instrument_id
  FROM public.research_responses
  WHERE research_response_id = NEW.response_id;

  IF v_response_instrument_id IS DISTINCT FROM v_item_instrument_id THEN
    RAISE EXCEPTION 'RESEARCH_ANSWER_INSTRUMENT_MISMATCH';
  END IF;

  IF NOT EXISTS (
    SELECT 1
    FROM public.research_instruments
    WHERE research_instrument_id = v_item_instrument_id
      AND status = 'published'
  ) THEN
    RAISE EXCEPTION 'RESEARCH_INSTRUMENT_NOT_PUBLISHED';
  END IF;

  IF v_answer_type IN ('agreement_5', 'rating_5') THEN
    IF NEW.integer_value IS NULL OR NEW.integer_value NOT BETWEEN 1 AND 5 THEN
      RAISE EXCEPTION 'RESEARCH_ANSWER_TYPE_MISMATCH';
    END IF;
  ELSIF v_answer_type = 'integer' THEN
    IF NEW.integer_value IS NULL THEN
      RAISE EXCEPTION 'RESEARCH_ANSWER_TYPE_MISMATCH';
    END IF;
  ELSIF v_answer_type = 'boolean' THEN
    IF NEW.boolean_value IS NULL THEN
      RAISE EXCEPTION 'RESEARCH_ANSWER_TYPE_MISMATCH';
    END IF;
  ELSE
    IF NEW.text_value IS NULL THEN
      RAISE EXCEPTION 'RESEARCH_ANSWER_TYPE_MISMATCH';
    END IF;

    IF v_answer_type = 'short_text' AND char_length(NEW.text_value) > 500 THEN
      RAISE EXCEPTION 'RESEARCH_ANSWER_TOO_LONG';
    END IF;

    IF v_answer_type = 'single_choice' AND NOT (v_options ? NEW.text_value) THEN
      RAISE EXCEPTION 'RESEARCH_ANSWER_OPTION_INVALID';
    END IF;
  END IF;

  RETURN NEW;
END;
$$;

CREATE TRIGGER validate_research_answer_type
BEFORE INSERT OR UPDATE OF response_id, item_id, integer_value, text_value, boolean_value
ON public.research_answers
FOR EACH ROW EXECUTE FUNCTION public.validate_research_answer_type();

CREATE OR REPLACE FUNCTION public.prevent_final_research_response_mutation()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  IF TG_OP = 'DELETE' AND OLD.status <> 'draft' THEN
    RAISE EXCEPTION 'FINAL_RESEARCH_RESPONSE_IMMUTABLE';
  END IF;

  IF TG_OP = 'UPDATE' AND OLD.status <> 'draft' AND (
    NEW.research_session_id IS DISTINCT FROM OLD.research_session_id
    OR NEW.instrument_id IS DISTINCT FROM OLD.instrument_id
    OR NEW.started_at IS DISTINCT FROM OLD.started_at
    OR NEW.submitted_at IS DISTINCT FROM OLD.submitted_at
    OR NEW.duration_seconds IS DISTINCT FROM OLD.duration_seconds
    OR NEW.status NOT IN (OLD.status, 'withdrawn', 'excluded')
  ) THEN
    RAISE EXCEPTION 'FINAL_RESEARCH_RESPONSE_IMMUTABLE';
  END IF;

  RETURN CASE WHEN TG_OP = 'DELETE' THEN OLD ELSE NEW END;
END;
$$;

CREATE TRIGGER prevent_final_research_response_mutation
BEFORE UPDATE OR DELETE ON public.research_responses
FOR EACH ROW EXECUTE FUNCTION public.prevent_final_research_response_mutation();

CREATE OR REPLACE FUNCTION public.prevent_final_research_answer_mutation()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $$
DECLARE
  v_response_id uuid;
  v_response_status text;
BEGIN
  v_response_id := CASE WHEN TG_OP = 'DELETE' THEN OLD.response_id ELSE NEW.response_id END;

  SELECT status INTO v_response_status
  FROM public.research_responses
  WHERE research_response_id = v_response_id;

  IF v_response_status IS DISTINCT FROM 'draft' THEN
    RAISE EXCEPTION 'FINAL_RESEARCH_ANSWERS_IMMUTABLE';
  END IF;

  RETURN CASE WHEN TG_OP = 'DELETE' THEN OLD ELSE NEW END;
END;
$$;

CREATE TRIGGER prevent_final_research_answer_mutation
BEFORE INSERT OR UPDATE OR DELETE ON public.research_answers
FOR EACH ROW EXECUTE FUNCTION public.prevent_final_research_answer_mutation();

CREATE OR REPLACE FUNCTION public.prevent_published_research_task_mutation()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  IF TG_OP = 'DELETE' THEN
    IF OLD.status IN ('published', 'retired') THEN
      RAISE EXCEPTION 'PUBLISHED_RESEARCH_TASK_IMMUTABLE';
    END IF;
    RETURN OLD;
  END IF;

  IF OLD.status IS DISTINCT FROM NEW.status AND NOT (
    (OLD.status = 'draft' AND NEW.status = 'published')
    OR (OLD.status = 'published' AND NEW.status = 'retired')
  ) THEN
    RAISE EXCEPTION 'RESEARCH_OPERATOR_TASK_STATUS_TRANSITION_INVALID';
  END IF;

  IF OLD.status IN ('published', 'retired') AND (
    NEW.study_id IS DISTINCT FROM OLD.study_id
    OR NEW.task_code IS DISTINCT FROM OLD.task_code
    OR NEW.version_number IS DISTINCT FROM OLD.version_number
    OR NEW.audience IS DISTINCT FROM OLD.audience
    OR NEW.title_th IS DISTINCT FROM OLD.title_th
    OR NEW.title_en IS DISTINCT FROM OLD.title_en
    OR NEW.instruction_th IS DISTINCT FROM OLD.instruction_th
    OR NEW.instruction_en IS DISTINCT FROM OLD.instruction_en
    OR NEW.expected_evidence IS DISTINCT FROM OLD.expected_evidence
    OR NEW.scoring_rule IS DISTINCT FROM OLD.scoring_rule
    OR NEW.display_order IS DISTINCT FROM OLD.display_order
    OR NEW.maximum_minutes IS DISTINCT FROM OLD.maximum_minutes
    OR NEW.published_at IS DISTINCT FROM OLD.published_at
    OR NEW.frozen_at IS DISTINCT FROM OLD.frozen_at
    OR NEW.status NOT IN (OLD.status, 'retired')
  ) THEN
    RAISE EXCEPTION 'PUBLISHED_RESEARCH_TASK_IMMUTABLE';
  END IF;

  RETURN NEW;
END;
$$;

CREATE TRIGGER prevent_published_research_task_mutation
BEFORE UPDATE OR DELETE ON public.research_operator_tasks
FOR EACH ROW EXECUTE FUNCTION public.prevent_published_research_task_mutation();

CREATE OR REPLACE FUNCTION public.validate_research_operator_attempt_scope()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $$
DECLARE
  v_session_study_id uuid;
  v_participant_type text;
  v_task_study_id uuid;
  v_task_audience text;
BEGIN
  SELECT study_id, participant_type INTO v_session_study_id, v_participant_type
  FROM public.research_sessions
  WHERE research_session_id = NEW.research_session_id;

  SELECT study_id, audience INTO v_task_study_id, v_task_audience
  FROM public.research_operator_tasks
  WHERE research_operator_task_id = NEW.research_operator_task_id;

  IF v_session_study_id IS DISTINCT FROM v_task_study_id
    OR v_participant_type IS DISTINCT FROM v_task_audience THEN
    RAISE EXCEPTION 'RESEARCH_OPERATOR_TASK_SCOPE_MISMATCH';
  END IF;

  RETURN NEW;
END;
$$;

CREATE TRIGGER validate_research_operator_attempt_scope
BEFORE INSERT OR UPDATE OF research_session_id, research_operator_task_id
ON public.research_operator_task_attempts
FOR EACH ROW EXECUTE FUNCTION public.validate_research_operator_attempt_scope();

CREATE OR REPLACE FUNCTION public.accept_research_invitation(
  p_study_code text,
  p_checkin_code text,
  p_operational_session_hash text,
  p_access_token_hash text,
  p_withdrawal_token_hash text,
  p_language text
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  v_study_id uuid;
  v_checkin_code_id bigint;
  v_collection_mode text;
  v_consent_version text;
  v_notice_version text;
  v_existing_session public.research_sessions%ROWTYPE;
  v_new_session public.research_sessions%ROWTYPE;
BEGIN
  IF p_study_code IS NULL OR p_study_code !~ '^[a-z0-9]+(?:-[a-z0-9]+)*$'
    OR p_checkin_code IS NULL OR char_length(p_checkin_code) NOT BETWEEN 1 AND 100
    OR p_operational_session_hash IS NULL OR p_operational_session_hash !~ '^[a-f0-9]{64}$'
    OR p_access_token_hash IS NULL OR p_access_token_hash !~ '^[a-f0-9]{64}$'
    OR p_withdrawal_token_hash IS NULL OR p_withdrawal_token_hash !~ '^[a-f0-9]{64}$'
    OR (p_language IS NOT NULL AND p_language NOT IN ('th', 'en', 'ms')) THEN
    RETURN jsonb_build_object('success', false, 'error_code', 'RESEARCH_INVITATION_INVALID');
  END IF;

  PERFORM pg_advisory_xact_lock(
    hashtextextended(p_study_code || ':' || p_operational_session_hash, 0)
  );

  SELECT
    study.research_study_id,
    code.checkin_code_id,
    deployment.default_collection_mode,
    study.consent_version,
    study.notice_version
  INTO
    v_study_id,
    v_checkin_code_id,
    v_collection_mode,
    v_consent_version,
    v_notice_version
  FROM public.research_studies AS study
  JOIN public.research_checkin_codes AS deployment
    ON deployment.study_id = study.research_study_id
  JOIN public.checkin_codes AS code
    ON code.checkin_code_id = deployment.checkin_code_id
  WHERE study.study_code = p_study_code
    AND study.status = 'active'
    AND study.frozen_at IS NOT NULL
    AND (study.starts_at IS NULL OR study.starts_at <= now())
    AND (study.ends_at IS NULL OR study.ends_at > now())
    AND deployment.is_active = true
    AND (deployment.starts_at IS NULL OR deployment.starts_at <= now())
    AND (deployment.ends_at IS NULL OR deployment.ends_at > now())
    AND code.code = p_checkin_code
    AND code.is_active = true
    AND (code.starts_at IS NULL OR code.starts_at <= now())
    AND (code.ends_at IS NULL OR code.ends_at > now())
  FOR UPDATE OF study, deployment;

  IF NOT FOUND THEN
    RETURN jsonb_build_object('success', false, 'error_code', 'RESEARCH_STUDY_UNAVAILABLE');
  END IF;

  SELECT session.*
  INTO v_existing_session
  FROM public.research_sessions AS session
  WHERE study_id = v_study_id
    AND operational_session_hash = p_operational_session_hash
    AND status NOT IN ('withdrawn', 'excluded', 'expired')
  FOR UPDATE;

  IF FOUND THEN
    UPDATE public.research_sessions
    SET access_token_hash = p_access_token_hash,
        withdrawal_token_hash = p_withdrawal_token_hash,
        updated_at = now()
    WHERE research_session_id = v_existing_session.research_session_id
    RETURNING * INTO v_existing_session;

    RETURN jsonb_build_object(
      'success', true,
      'already_exists', true,
      'public_session_code', v_existing_session.public_session_code,
      'collection_mode', v_existing_session.collection_mode
    );
  END IF;

  INSERT INTO public.research_sessions (
    study_id,
    access_token_hash,
    withdrawal_token_hash,
    operational_session_hash,
    participant_type,
    collection_mode,
    checkin_code_id,
    status,
    inclusion_status,
    consented_at
  ) VALUES (
    v_study_id,
    p_access_token_hash,
    p_withdrawal_token_hash,
    p_operational_session_hash,
    'tourist',
    v_collection_mode,
    v_checkin_code_id,
    'consented',
    'pending',
    now()
  )
  RETURNING * INTO v_new_session;

  INSERT INTO public.research_consents (
    research_session_id,
    purpose_key,
    consent_version,
    notice_version,
    has_consented,
    language,
    source,
    consented_at
  ) VALUES
    (
      v_new_session.research_session_id,
      'research_evaluation',
      v_consent_version,
      v_notice_version,
      true,
      p_language,
      'research_invitation',
      v_new_session.consented_at
    ),
    (
      v_new_session.research_session_id,
      'research_behavioral_correlation',
      v_consent_version,
      v_notice_version,
      true,
      p_language,
      'research_invitation',
      v_new_session.consented_at
    );

  RETURN jsonb_build_object(
    'success', true,
    'already_exists', false,
    'public_session_code', v_new_session.public_session_code,
    'collection_mode', v_new_session.collection_mode
  );
EXCEPTION
  WHEN unique_violation THEN
    RETURN jsonb_build_object('success', false, 'error_code', 'RESEARCH_SESSION_CONFLICT');
  WHEN OTHERS THEN
    RETURN jsonb_build_object('success', false, 'error_code', 'RESEARCH_SESSION_CREATE_FAILED');
END;
$$;

CREATE OR REPLACE FUNCTION public.link_research_session_visit(
  p_public_session_code uuid,
  p_access_token_hash text,
  p_visit_id uuid,
  p_tourist_id uuid
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  v_research_session_id uuid;
BEGIN
  SELECT session.research_session_id
  INTO v_research_session_id
  FROM public.research_sessions AS session
  WHERE session.public_session_code = p_public_session_code
    AND session.access_token_hash = p_access_token_hash
    AND session.participant_type = 'tourist'
    AND session.status IN ('consented', 'in_progress')
    AND session.withdrawn_at IS NULL
  FOR UPDATE;

  IF NOT FOUND THEN
    RETURN jsonb_build_object('success', false, 'error_code', 'RESEARCH_SESSION_NOT_FOUND');
  END IF;

  IF NOT EXISTS (
    SELECT 1
    FROM public.visits AS visit
    JOIN public.research_sessions AS session
      ON session.research_session_id = v_research_session_id
    WHERE visit.visit_id = p_visit_id
      AND visit.tourist_id = p_tourist_id
      AND visit.checkin_code_id = session.checkin_code_id
  ) THEN
    RETURN jsonb_build_object('success', false, 'error_code', 'RESEARCH_VISIT_MISMATCH');
  END IF;

  UPDATE public.research_sessions
  SET tourist_id = p_tourist_id,
      visit_id = p_visit_id,
      status = 'in_progress',
      started_at = COALESCE(started_at, now()),
      updated_at = now()
  WHERE research_session_id = v_research_session_id;

  RETURN jsonb_build_object('success', true, 'research_session_id', v_research_session_id);
END;
$$;

CREATE OR REPLACE FUNCTION public.accept_research_operator_invitation(
  p_study_code text,
  p_participant_type text,
  p_collection_mode text,
  p_access_token_hash text,
  p_withdrawal_token_hash text,
  p_language text,
  p_idempotency_key uuid,
  p_processed_by uuid
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  v_study public.research_studies%ROWTYPE;
  v_session public.research_sessions%ROWTYPE;
BEGIN
  IF p_study_code IS NULL OR p_study_code !~ '^[a-z0-9]+(?:-[a-z0-9]+)*$'
    OR p_participant_type NOT IN ('operator', 'attraction_manager')
    OR p_collection_mode NOT IN ('field_observation', 'simulated_usability', 'pilot_internal')
    OR p_access_token_hash IS NULL OR p_access_token_hash !~ '^[a-f0-9]{64}$'
    OR p_withdrawal_token_hash IS NULL OR p_withdrawal_token_hash !~ '^[a-f0-9]{64}$'
    OR p_idempotency_key IS NULL
    OR (p_language IS NOT NULL AND p_language NOT IN ('th', 'en', 'ms'))
    OR NOT EXISTS (
      SELECT 1 FROM public.admin_users AS admin
      WHERE admin.admin_id = p_processed_by AND admin.is_active = true
    ) THEN
    RETURN jsonb_build_object('success', false, 'error_code', 'RESEARCH_OPERATOR_INVITATION_INVALID');
  END IF;

  SELECT study.* INTO v_study
  FROM public.research_studies AS study
  WHERE study.study_code = p_study_code
    AND study.status = 'active'
    AND study.frozen_at IS NOT NULL
    AND (study.starts_at IS NULL OR study.starts_at <= now())
    AND (study.ends_at IS NULL OR study.ends_at > now())
  FOR UPDATE;

  IF v_study.research_study_id IS NULL
    OR NOT EXISTS (
      SELECT 1 FROM public.research_instruments AS instrument
      WHERE instrument.study_id = v_study.research_study_id
        AND instrument.audience = p_participant_type
        AND instrument.status = 'published'
        AND instrument.frozen_at IS NOT NULL
    )
    OR NOT EXISTS (
      SELECT 1 FROM public.research_operator_tasks AS task
      WHERE task.study_id = v_study.research_study_id
        AND task.audience = p_participant_type
        AND task.status = 'published'
        AND task.frozen_at IS NOT NULL
    ) THEN
    RETURN jsonb_build_object('success', false, 'error_code', 'RESEARCH_OPERATOR_STUDY_UNAVAILABLE');
  END IF;

  INSERT INTO public.research_sessions (
    study_id, access_token_hash, withdrawal_token_hash, facilitator_invitation_key, participant_type,
    collection_mode, status, inclusion_status, consented_at
  ) VALUES (
    v_study.research_study_id, p_access_token_hash, p_withdrawal_token_hash,
    p_idempotency_key, p_participant_type, p_collection_mode, 'consented', 'pending', now()
  )
  ON CONFLICT (facilitator_invitation_key) DO UPDATE
  SET access_token_hash = EXCLUDED.access_token_hash,
      withdrawal_token_hash = EXCLUDED.withdrawal_token_hash,
      updated_at = now()
  WHERE public.research_sessions.study_id = EXCLUDED.study_id
    AND public.research_sessions.participant_type = EXCLUDED.participant_type
    AND public.research_sessions.collection_mode = EXCLUDED.collection_mode
    AND public.research_sessions.status = 'consented'
  RETURNING * INTO v_session;

  IF v_session.research_session_id IS NULL THEN
    RETURN jsonb_build_object('success', false, 'error_code', 'RESEARCH_OPERATOR_SESSION_CONFLICT');
  END IF;

  INSERT INTO public.research_consents (
    research_session_id, purpose_key, consent_version, notice_version,
    has_consented, language, source, consented_at, processed_by
  ) VALUES (
    v_session.research_session_id, 'operator_evaluation', v_study.consent_version,
    v_study.notice_version, true, p_language, 'facilitated_operator_invitation',
    v_session.consented_at, p_processed_by
  )
  ON CONFLICT (research_session_id, purpose_key) DO NOTHING;

  RETURN jsonb_build_object(
    'success', true,
    'public_session_code', v_session.public_session_code,
    'collection_mode', v_session.collection_mode,
    'participant_type', v_session.participant_type
  );
EXCEPTION
  WHEN unique_violation THEN
    RETURN jsonb_build_object('success', false, 'error_code', 'RESEARCH_OPERATOR_SESSION_CONFLICT');
  WHEN OTHERS THEN
    RETURN jsonb_build_object('success', false, 'error_code', 'RESEARCH_OPERATOR_SESSION_CREATE_FAILED');
END;
$$;

CREATE OR REPLACE FUNCTION public.save_research_operator_attempt(
  p_public_session_code uuid,
  p_access_token_hash text,
  p_task_code text,
  p_status text,
  p_confidence integer,
  p_rationale text
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  v_session public.research_sessions%ROWTYPE;
  v_task public.research_operator_tasks%ROWTYPE;
  v_attempt_id uuid;
  v_existing_attempt_status text;
  v_now timestamptz := now();
BEGIN
  IF p_access_token_hash IS NULL OR p_access_token_hash !~ '^[a-f0-9]{64}$'
    OR p_task_code IS NULL OR p_task_code !~ '^[a-z0-9]+(?:_[a-z0-9]+)*$'
    OR p_status NOT IN ('in_progress', 'completed', 'skipped', 'abandoned')
    OR (p_confidence IS NOT NULL AND p_confidence NOT BETWEEN 1 AND 5)
    OR char_length(COALESCE(p_rationale, '')) > 4000 THEN
    RETURN jsonb_build_object('success', false, 'error_code', 'RESEARCH_OPERATOR_ATTEMPT_INVALID');
  END IF;

  SELECT session.* INTO v_session
  FROM public.research_sessions AS session
  JOIN public.research_consents AS consent
    ON consent.research_session_id = session.research_session_id
  WHERE session.public_session_code = p_public_session_code
    AND session.access_token_hash = p_access_token_hash
    AND session.participant_type IN ('operator', 'attraction_manager')
    AND session.status IN ('consented', 'in_progress')
    AND session.inclusion_status <> 'excluded'
    AND session.withdrawn_at IS NULL
    AND consent.purpose_key = 'operator_evaluation'
    AND consent.has_consented = true
    AND consent.withdrawn_at IS NULL
  FOR UPDATE OF session;

  IF NOT FOUND THEN
    RETURN jsonb_build_object('success', false, 'error_code', 'RESEARCH_OPERATOR_SESSION_NOT_FOUND');
  END IF;

  SELECT task.* INTO v_task
  FROM public.research_operator_tasks AS task
  WHERE task.study_id = v_session.study_id
    AND task.audience = v_session.participant_type
    AND task.task_code = p_task_code
    AND task.status = 'published'
    AND task.frozen_at IS NOT NULL
  ORDER BY task.version_number DESC
  LIMIT 1;

  IF NOT FOUND THEN
    RETURN jsonb_build_object('success', false, 'error_code', 'RESEARCH_OPERATOR_TASK_UNAVAILABLE');
  END IF;

  SELECT attempt.research_operator_task_attempt_id, attempt.status
  INTO v_attempt_id, v_existing_attempt_status
  FROM public.research_operator_task_attempts AS attempt
  WHERE attempt.research_session_id = v_session.research_session_id
    AND attempt.research_operator_task_id = v_task.research_operator_task_id
  FOR UPDATE;

  IF v_existing_attempt_status IN ('completed', 'skipped', 'abandoned') THEN
    IF v_existing_attempt_status = p_status THEN
      RETURN jsonb_build_object('success', true, 'attempt_id', v_attempt_id, 'status', v_existing_attempt_status);
    END IF;
    RETURN jsonb_build_object('success', false, 'error_code', 'RESEARCH_OPERATOR_ATTEMPT_FINALIZED');
  END IF;

  INSERT INTO public.research_operator_task_attempts (
    research_session_id, research_operator_task_id, sequence_number, status,
    outcome, confidence, rationale, started_at, completed_at
  ) VALUES (
    v_session.research_session_id,
    v_task.research_operator_task_id,
    v_task.display_order,
    p_status,
    CASE WHEN p_status = 'completed' THEN 'not_assessed' ELSE NULL END,
    p_confidence,
    nullif(btrim(COALESCE(p_rationale, '')), ''),
    v_now,
    CASE WHEN p_status IN ('completed', 'skipped', 'abandoned') THEN v_now ELSE NULL END
  )
  ON CONFLICT (research_session_id, research_operator_task_id) DO UPDATE
  SET status = EXCLUDED.status,
      outcome = EXCLUDED.outcome,
      confidence = EXCLUDED.confidence,
      rationale = EXCLUDED.rationale,
      started_at = COALESCE(public.research_operator_task_attempts.started_at, EXCLUDED.started_at),
      completed_at = EXCLUDED.completed_at,
      updated_at = v_now
  WHERE public.research_operator_task_attempts.status IN ('not_started', 'in_progress')
  RETURNING research_operator_task_attempt_id INTO v_attempt_id;

  UPDATE public.research_sessions
  SET status = 'in_progress', started_at = COALESCE(started_at, v_now), updated_at = v_now
  WHERE research_session_id = v_session.research_session_id;

  IF p_status IN ('completed', 'skipped')
    AND NOT EXISTS (
      SELECT 1
      FROM public.research_operator_tasks AS task
      WHERE task.study_id = v_session.study_id
        AND task.audience = v_session.participant_type
        AND task.status = 'published'
        AND NOT EXISTS (
          SELECT 1
          FROM public.research_operator_task_attempts AS attempt
          WHERE attempt.research_session_id = v_session.research_session_id
            AND attempt.research_operator_task_id = task.research_operator_task_id
            AND attempt.status IN ('completed', 'skipped')
        )
    )
    AND NOT EXISTS (
      SELECT 1
      FROM public.research_instruments AS instrument
      WHERE instrument.study_id = v_session.study_id
        AND instrument.audience = v_session.participant_type
        AND instrument.status = 'published'
        AND NOT EXISTS (
          SELECT 1
          FROM public.research_responses AS response
          WHERE response.research_session_id = v_session.research_session_id
            AND response.instrument_id = instrument.research_instrument_id
            AND response.status = 'submitted'
        )
    ) THEN
    UPDATE public.research_sessions
    SET status = 'completed',
        inclusion_status = 'included',
        completed_at = COALESCE(completed_at, v_now),
        updated_at = v_now
    WHERE research_session_id = v_session.research_session_id;
  END IF;

  RETURN jsonb_build_object('success', true, 'attempt_id', v_attempt_id, 'status', p_status);
END;
$$;

CREATE OR REPLACE FUNCTION public.save_research_response(
  p_public_session_code uuid,
  p_access_token_hash text,
  p_instrument_key text,
  p_answers jsonb,
  p_submit boolean DEFAULT false
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  v_research_session_id uuid;
  v_instrument_id uuid;
  v_response_id uuid;
  v_response_status text;
  v_answer_count integer;
  v_now timestamptz := now();
BEGIN
  IF p_public_session_code IS NULL
    OR p_access_token_hash IS NULL
    OR p_access_token_hash !~ '^[a-f0-9]{64}$'
    OR p_instrument_key IS NULL
    OR p_instrument_key !~ '^[a-z0-9]+(?:_[a-z0-9]+)*$'
    OR p_answers IS NULL
    OR jsonb_typeof(p_answers) <> 'array'
    OR jsonb_array_length(p_answers) > 100 THEN
    RETURN jsonb_build_object('success', false, 'error_code', 'RESEARCH_RESPONSE_INVALID');
  END IF;

  IF EXISTS (
    SELECT 1
    FROM jsonb_array_elements(p_answers) AS answer(value)
    WHERE jsonb_typeof(answer.value) <> 'object'
      OR answer.value->>'item_code' IS NULL
      OR answer.value->>'item_code' !~ '^[A-Z][A-Z0-9_]{1,29}$'
      OR (
        CASE WHEN (answer.value ? 'integer_value')
          AND jsonb_typeof(answer.value->'integer_value') <> 'null' THEN 1 ELSE 0 END
        + CASE WHEN (answer.value ? 'text_value')
          AND jsonb_typeof(answer.value->'text_value') <> 'null' THEN 1 ELSE 0 END
        + CASE WHEN (answer.value ? 'boolean_value')
          AND jsonb_typeof(answer.value->'boolean_value') <> 'null' THEN 1 ELSE 0 END
      ) <> 1
      OR ((answer.value ? 'integer_value') AND jsonb_typeof(answer.value->'integer_value') NOT IN ('number', 'null'))
      OR CASE
        WHEN (answer.value ? 'integer_value')
          AND jsonb_typeof(answer.value->'integer_value') = 'number'
        THEN (answer.value->>'integer_value')::numeric
          <> trunc((answer.value->>'integer_value')::numeric)
        ELSE false
      END
      OR ((answer.value ? 'text_value') AND jsonb_typeof(answer.value->'text_value') NOT IN ('string', 'null'))
      OR ((answer.value ? 'boolean_value') AND jsonb_typeof(answer.value->'boolean_value') NOT IN ('boolean', 'null'))
  ) THEN
    RETURN jsonb_build_object('success', false, 'error_code', 'RESEARCH_ANSWER_INVALID');
  END IF;

  IF EXISTS (
    SELECT answer.value->>'item_code'
    FROM jsonb_array_elements(p_answers) AS answer(value)
    GROUP BY answer.value->>'item_code'
    HAVING count(*) > 1
  ) THEN
    RETURN jsonb_build_object('success', false, 'error_code', 'RESEARCH_ANSWER_DUPLICATE');
  END IF;

  SELECT session.research_session_id, instrument.research_instrument_id
  INTO v_research_session_id, v_instrument_id
  FROM public.research_sessions AS session
  JOIN public.research_studies AS study
    ON study.research_study_id = session.study_id
  JOIN public.research_instruments AS instrument
    ON instrument.study_id = session.study_id
  JOIN public.research_consents AS consent
    ON consent.research_session_id = session.research_session_id
  WHERE session.public_session_code = p_public_session_code
    AND session.access_token_hash = p_access_token_hash
    AND session.status IN ('consented', 'in_progress')
    AND session.withdrawn_at IS NULL
    AND study.status IN ('active', 'paused', 'closed')
    AND study.frozen_at IS NOT NULL
    AND (session.participant_type <> 'tourist' OR session.visit_id IS NOT NULL)
    AND instrument.instrument_key = p_instrument_key
    AND instrument.status = 'published'
    AND instrument.frozen_at IS NOT NULL
    AND instrument.audience = session.participant_type
    AND consent.purpose_key = CASE
      WHEN session.participant_type = 'tourist' THEN 'research_evaluation'
      ELSE 'operator_evaluation'
    END
    AND consent.has_consented = true
    AND consent.withdrawn_at IS NULL
  FOR UPDATE OF session;

  IF NOT FOUND THEN
    RETURN jsonb_build_object('success', false, 'error_code', 'RESEARCH_RESPONSE_UNAVAILABLE');
  END IF;

  IF EXISTS (
    SELECT 1
    FROM jsonb_array_elements(p_answers) AS answer(value)
    WHERE NOT EXISTS (
      SELECT 1
      FROM public.research_items AS item
      WHERE item.instrument_id = v_instrument_id
        AND item.item_code = answer.value->>'item_code'
    )
  ) THEN
    RETURN jsonb_build_object('success', false, 'error_code', 'RESEARCH_ANSWER_ITEM_INVALID');
  END IF;

  INSERT INTO public.research_responses (
    research_session_id,
    instrument_id,
    status,
    started_at
  ) VALUES (
    v_research_session_id,
    v_instrument_id,
    'draft',
    v_now
  )
  ON CONFLICT (research_session_id, instrument_id) DO NOTHING;

  SELECT response.research_response_id, response.status
  INTO v_response_id, v_response_status
  FROM public.research_responses AS response
  WHERE response.research_session_id = v_research_session_id
    AND response.instrument_id = v_instrument_id
  FOR UPDATE;

  IF v_response_status <> 'draft' THEN
    RETURN jsonb_build_object('success', false, 'error_code', 'RESEARCH_RESPONSE_ALREADY_SUBMITTED');
  END IF;

  DELETE FROM public.research_answers
  WHERE response_id = v_response_id;

  INSERT INTO public.research_answers (
    response_id,
    item_id,
    integer_value,
    text_value,
    boolean_value,
    answered_at
  )
  SELECT
    v_response_id,
    item.research_item_id,
    CASE
      WHEN answer.value ? 'integer_value'
        AND jsonb_typeof(answer.value->'integer_value') <> 'null'
      THEN (answer.value->>'integer_value')::integer
      ELSE NULL
    END,
    CASE
      WHEN answer.value ? 'text_value'
        AND jsonb_typeof(answer.value->'text_value') <> 'null'
      THEN answer.value->>'text_value'
      ELSE NULL
    END,
    CASE
      WHEN answer.value ? 'boolean_value'
        AND jsonb_typeof(answer.value->'boolean_value') <> 'null'
      THEN (answer.value->>'boolean_value')::boolean
      ELSE NULL
    END,
    v_now
  FROM jsonb_array_elements(p_answers) AS answer(value)
  JOIN public.research_items AS item
    ON item.instrument_id = v_instrument_id
    AND item.item_code = answer.value->>'item_code';

  GET DIAGNOSTICS v_answer_count = ROW_COUNT;

  IF p_submit AND EXISTS (
    SELECT 1
    FROM public.research_items AS item
    WHERE item.instrument_id = v_instrument_id
      AND item.is_required = true
      AND NOT EXISTS (
        SELECT 1
        FROM public.research_answers AS answer
        WHERE answer.response_id = v_response_id
          AND answer.item_id = item.research_item_id
      )
  ) THEN
    RAISE EXCEPTION 'RESEARCH_REQUIRED_ANSWER_MISSING';
  END IF;

  IF p_submit THEN
    UPDATE public.research_responses
    SET status = 'submitted',
        submitted_at = v_now,
        duration_seconds = LEAST(
          86400,
          GREATEST(0, floor(extract(epoch FROM (v_now - started_at)))::integer)
        ),
        updated_at = v_now
    WHERE research_response_id = v_response_id;

    IF NOT EXISTS (
      SELECT 1
      FROM public.research_instruments AS instrument
      JOIN public.research_sessions AS session
        ON session.research_session_id = v_research_session_id
      WHERE instrument.study_id = session.study_id
        AND instrument.audience = session.participant_type
        AND instrument.status = 'published'
        AND NOT EXISTS (
          SELECT 1
          FROM public.research_responses AS response
          WHERE response.research_session_id = v_research_session_id
            AND response.instrument_id = instrument.research_instrument_id
            AND response.status = 'submitted'
        )
    ) AND (
      EXISTS (
        SELECT 1 FROM public.research_sessions AS session
        WHERE session.research_session_id = v_research_session_id
          AND session.participant_type = 'tourist'
      )
      OR NOT EXISTS (
        SELECT 1
        FROM public.research_operator_tasks AS task
        JOIN public.research_sessions AS session
          ON session.research_session_id = v_research_session_id
        WHERE task.study_id = session.study_id
          AND task.audience = session.participant_type
          AND task.status = 'published'
          AND NOT EXISTS (
            SELECT 1 FROM public.research_operator_task_attempts AS attempt
            WHERE attempt.research_session_id = v_research_session_id
              AND attempt.research_operator_task_id = task.research_operator_task_id
              AND attempt.status IN ('completed', 'skipped')
          )
      )
    ) THEN
      UPDATE public.research_sessions
      SET status = 'completed',
          inclusion_status = 'included',
          completed_at = v_now,
          updated_at = v_now
      WHERE research_session_id = v_research_session_id;
    END IF;
  ELSE
    UPDATE public.research_sessions
    SET status = 'in_progress',
        started_at = COALESCE(started_at, v_now),
        updated_at = v_now
    WHERE research_session_id = v_research_session_id;
  END IF;

  RETURN jsonb_build_object(
    'success', true,
    'response_id', v_response_id,
    'status', CASE WHEN p_submit THEN 'submitted' ELSE 'draft' END,
    'answer_count', v_answer_count
  );
EXCEPTION
  WHEN raise_exception THEN
    IF SQLERRM = 'RESEARCH_REQUIRED_ANSWER_MISSING' THEN
      RETURN jsonb_build_object('success', false, 'error_code', SQLERRM);
    END IF;
    RETURN jsonb_build_object('success', false, 'error_code', 'RESEARCH_RESPONSE_SAVE_FAILED');
  WHEN OTHERS THEN
    RETURN jsonb_build_object('success', false, 'error_code', 'RESEARCH_RESPONSE_SAVE_FAILED');
END;
$$;

CREATE OR REPLACE FUNCTION public.withdraw_research_session(
  p_public_session_code uuid,
  p_withdrawal_token_hash text,
  p_reason text,
  p_source text
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  v_research_session_id uuid;
  v_status text;
  v_now timestamptz := now();
BEGIN
  IF p_withdrawal_token_hash IS NULL OR p_withdrawal_token_hash !~ '^[a-f0-9]{64}$'
    OR p_source IS NULL OR btrim(p_source) = '' THEN
    RETURN jsonb_build_object('success', false, 'error_code', 'RESEARCH_WITHDRAWAL_INVALID');
  END IF;

  SELECT session.research_session_id, session.status
  INTO v_research_session_id, v_status
  FROM public.research_sessions AS session
  WHERE session.public_session_code = p_public_session_code
    AND session.withdrawal_token_hash = p_withdrawal_token_hash
  FOR UPDATE;

  IF NOT FOUND THEN
    RETURN jsonb_build_object('success', false, 'error_code', 'RESEARCH_SESSION_NOT_FOUND');
  END IF;

  IF v_status = 'withdrawn' THEN
    RETURN jsonb_build_object('success', true, 'already_withdrawn', true);
  END IF;

  UPDATE public.research_consents
  SET withdrawn_at = COALESCE(withdrawn_at, v_now),
      withdrawal_source = COALESCE(withdrawal_source, left(btrim(p_source), 100)),
      withdrawal_reason = COALESCE(withdrawal_reason, nullif(left(btrim(COALESCE(p_reason, '')), 500), ''))
  WHERE research_session_id = v_research_session_id;

  UPDATE public.research_responses
  SET status = 'withdrawn',
      updated_at = v_now
  WHERE research_session_id = v_research_session_id
    AND status <> 'withdrawn';

  UPDATE public.research_sessions
  SET status = 'withdrawn',
      inclusion_status = 'excluded',
      exclusion_reason = 'participant_withdrawal',
      withdrawn_at = v_now,
      updated_at = v_now
  WHERE research_session_id = v_research_session_id;

  RETURN jsonb_build_object('success', true, 'already_withdrawn', false);
END;
$$;

CREATE TRIGGER set_updated_at_research_studies
BEFORE UPDATE ON public.research_studies
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER set_updated_at_research_instruments
BEFORE UPDATE ON public.research_instruments
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER set_updated_at_research_items
BEFORE UPDATE ON public.research_items
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER set_updated_at_research_sessions
BEFORE UPDATE ON public.research_sessions
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER set_updated_at_research_responses
BEFORE UPDATE ON public.research_responses
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER set_updated_at_research_operator_tasks
BEFORE UPDATE ON public.research_operator_tasks
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER set_updated_at_research_operator_attempts
BEFORE UPDATE ON public.research_operator_task_attempts
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

REVOKE ALL ON FUNCTION public.prevent_frozen_research_study_mutation()
  FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.prevent_frozen_research_child_link_mutation()
  FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.prevent_frozen_research_deployment_mutation()
  FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.prevent_published_research_instrument_mutation()
  FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.prevent_published_research_item_mutation()
  FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.validate_research_response_scope()
  FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.validate_research_answer_type()
  FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.prevent_final_research_response_mutation()
  FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.prevent_final_research_answer_mutation()
  FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.prevent_published_research_task_mutation()
  FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.validate_research_operator_attempt_scope()
  FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.accept_research_invitation(text, text, text, text, text, text)
  FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.link_research_session_visit(uuid, text, uuid, uuid)
  FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.accept_research_operator_invitation(text, text, text, text, text, text, uuid, uuid)
  FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.save_research_operator_attempt(uuid, text, text, text, integer, text)
  FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.save_research_response(uuid, text, text, jsonb, boolean)
  FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.withdraw_research_session(uuid, text, text, text)
  FROM PUBLIC, anon, authenticated;

GRANT EXECUTE ON FUNCTION public.prevent_frozen_research_study_mutation(),
  public.prevent_frozen_research_child_link_mutation(),
  public.prevent_frozen_research_deployment_mutation(),
  public.prevent_published_research_instrument_mutation(),
  public.prevent_published_research_item_mutation(),
  public.validate_research_response_scope(),
  public.validate_research_answer_type(),
  public.prevent_final_research_response_mutation(),
  public.prevent_final_research_answer_mutation(),
  public.prevent_published_research_task_mutation(),
  public.validate_research_operator_attempt_scope()
TO service_role;

GRANT EXECUTE ON FUNCTION public.accept_research_invitation(text, text, text, text, text, text)
  TO service_role;
GRANT EXECUTE ON FUNCTION public.link_research_session_visit(uuid, text, uuid, uuid)
  TO service_role;
GRANT EXECUTE ON FUNCTION public.accept_research_operator_invitation(text, text, text, text, text, text, uuid, uuid)
  TO service_role;
GRANT EXECUTE ON FUNCTION public.save_research_operator_attempt(uuid, text, text, text, integer, text)
  TO service_role;
GRANT EXECUTE ON FUNCTION public.save_research_response(uuid, text, text, jsonb, boolean)
  TO service_role;
GRANT EXECUTE ON FUNCTION public.withdraw_research_session(uuid, text, text, text)
  TO service_role;

ALTER TABLE public.research_studies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.research_instruments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.research_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.research_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.research_consents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.research_responses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.research_answers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.research_operator_tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.research_operator_task_attempts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.research_checkin_codes ENABLE ROW LEVEL SECURITY;

REVOKE ALL ON TABLE
  public.research_studies,
  public.research_instruments,
  public.research_items,
  public.research_sessions,
  public.research_consents,
  public.research_responses,
  public.research_answers,
  public.research_operator_tasks,
  public.research_operator_task_attempts,
  public.research_checkin_codes
FROM PUBLIC, anon, authenticated;

GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE
  public.research_studies,
  public.research_instruments,
  public.research_items,
  public.research_sessions,
  public.research_consents,
  public.research_responses,
  public.research_answers,
  public.research_operator_tasks,
  public.research_operator_task_attempts,
  public.research_checkin_codes
TO service_role;

INSERT INTO public.permissions (permission_name, description)
VALUES
  ('research.read', 'Read approved research study records and aggregate evidence'),
  ('research.manage', 'Manage research studies, versions, sessions, and exclusions'),
  ('research.export', 'Create de-identified research exports')
ON CONFLICT (permission_name) DO UPDATE
SET description = EXCLUDED.description;

INSERT INTO public.roles (role_name, description, is_active)
VALUES ('researcher', 'Read and export approved de-identified research data', true)
ON CONFLICT (role_name) DO UPDATE
SET description = EXCLUDED.description,
    is_active = EXCLUDED.is_active;

INSERT INTO public.role_permissions (role_id, permission_id)
SELECT r.role_id, p.permission_id
FROM public.roles r
JOIN public.permissions p ON p.permission_name IN ('research.read', 'research.export')
WHERE r.role_name = 'researcher'
ON CONFLICT DO NOTHING;

INSERT INTO public.role_permissions (role_id, permission_id)
SELECT r.role_id, p.permission_id
FROM public.roles r
JOIN public.permissions p ON p.permission_name LIKE 'research.%'
WHERE r.role_name = 'super_admin'
ON CONFLICT DO NOTHING;
