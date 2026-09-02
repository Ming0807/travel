-- Phase 21-22: controlled research activation and attraction analytics scope.
-- This migration seeds no study, evidence, participant, or response data.

ALTER TABLE public.research_studies
  ADD COLUMN IF NOT EXISTS study_kind varchar(30) NOT NULL DEFAULT 'pilot'
    CHECK (study_kind IN ('pilot', 'final_collection')),
  ADD COLUMN IF NOT EXISTS source_pilot_study_id uuid
    REFERENCES public.research_studies(research_study_id) ON DELETE RESTRICT,
  ADD COLUMN IF NOT EXISTS approved_title_th varchar(255),
  ADD COLUMN IF NOT EXISTS approved_geographic_boundary text,
  ADD COLUMN IF NOT EXISTS approved_objectives jsonb,
  ADD COLUMN IF NOT EXISTS approved_research_questions jsonb,
  ADD COLUMN IF NOT EXISTS analysis_wording varchar(40)
    CHECK (analysis_wording IN ('exploratory', 'descriptive_associational', 'confirmatory'));

ALTER TABLE public.research_studies
  ADD CONSTRAINT research_studies_source_pilot_check
  CHECK (source_pilot_study_id IS NULL OR source_pilot_study_id <> research_study_id),
  ADD CONSTRAINT research_studies_kind_source_check
  CHECK (
    (study_kind = 'pilot' AND source_pilot_study_id IS NULL)
    OR (study_kind = 'final_collection' AND source_pilot_study_id IS NOT NULL)
  );

CREATE TABLE public.research_activation_evidence (
  research_activation_evidence_id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  study_id uuid NOT NULL REFERENCES public.research_studies(research_study_id) ON DELETE RESTRICT,
  evidence_type varchar(40) NOT NULL CHECK (
    evidence_type IN ('expert_review', 'cognitive_pretest', 'mobile_flow_qa')
  ),
  version_number integer NOT NULL DEFAULT 1 CHECK (version_number > 0),
  status varchar(20) NOT NULL CHECK (status IN ('passed', 'failed', 'not_required')),
  evidence_date date NOT NULL,
  reference varchar(500) NOT NULL CHECK (char_length(btrim(reference)) BETWEEN 1 AND 500),
  summary text NOT NULL CHECK (char_length(btrim(summary)) BETWEEN 1 AND 4000),
  participant_count integer CHECK (participant_count IS NULL OR participant_count BETWEEN 0 AND 10000),
  median_completion_seconds integer CHECK (
    median_completion_seconds IS NULL OR median_completion_seconds BETWEEN 0 AND 86400
  ),
  abandonment_rate numeric(5,2) CHECK (abandonment_rate IS NULL OR abandonment_rate BETWEEN 0 AND 100),
  missingness_rate numeric(5,2) CHECK (missingness_rate IS NULL OR missingness_rate BETWEEN 0 AND 100),
  recorded_by uuid NOT NULL REFERENCES public.admin_users(admin_id) ON DELETE RESTRICT,
  recorded_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (study_id, evidence_type, version_number)
);

CREATE TABLE public.research_freeze_snapshots (
  research_freeze_snapshot_id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  study_id uuid NOT NULL UNIQUE REFERENCES public.research_studies(research_study_id) ON DELETE RESTRICT,
  protocol_version varchar(50) NOT NULL,
  consent_version varchar(50) NOT NULL,
  notice_version varchar(50) NOT NULL,
  instrument_manifest jsonb NOT NULL CHECK (jsonb_typeof(instrument_manifest) = 'array'),
  task_manifest jsonb NOT NULL CHECK (jsonb_typeof(task_manifest) = 'array'),
  scoring_version varchar(50) NOT NULL,
  retention_version varchar(50) NOT NULL,
  withdrawal_version varchar(50) NOT NULL,
  language_version varchar(50) NOT NULL,
  inclusion_version varchar(50) NOT NULL,
  application_revision varchar(100) NOT NULL,
  database_revision varchar(100) NOT NULL,
  frozen_by uuid NOT NULL REFERENCES public.admin_users(admin_id) ON DELETE RESTRICT,
  frozen_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.research_pilot_reviews (
  research_pilot_review_id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  pilot_study_id uuid NOT NULL REFERENCES public.research_studies(research_study_id) ON DELETE RESTRICT,
  decision varchar(30) NOT NULL CHECK (decision IN ('revise', 'repeat_pilot', 'ready_for_field')),
  reviewed_session_count integer NOT NULL CHECK (reviewed_session_count BETWEEN 0 AND 10000),
  median_completion_seconds integer CHECK (
    median_completion_seconds IS NULL OR median_completion_seconds BETWEEN 0 AND 86400
  ),
  abandonment_rate numeric(5,2) CHECK (abandonment_rate IS NULL OR abandonment_rate BETWEEN 0 AND 100),
  missingness_rate numeric(5,2) CHECK (missingness_rate IS NULL OR missingness_rate BETWEEN 0 AND 100),
  reliability_note text NOT NULL CHECK (char_length(btrim(reliability_note)) BETWEEN 1 AND 4000),
  decision_rationale text NOT NULL CHECK (char_length(btrim(decision_rationale)) BETWEEN 1 AND 4000),
  reviewed_by uuid NOT NULL REFERENCES public.admin_users(admin_id) ON DELETE RESTRICT,
  reviewed_at timestamptz NOT NULL DEFAULT now(),
  CHECK (
    decision <> 'ready_for_field'
    OR (
      reviewed_session_count > 0
      AND median_completion_seconds IS NOT NULL
      AND abandonment_rate IS NOT NULL
      AND missingness_rate IS NOT NULL
    )
  )
);

ALTER TABLE public.visits
  ADD COLUMN IF NOT EXISTS entry_channel varchar(30) NOT NULL DEFAULT 'unknown'
    CHECK (entry_channel IN ('qr', 'nfc', 'direct', 'admin_import', 'unknown'));

CREATE INDEX IF NOT EXISTS idx_research_studies_kind_status
  ON public.research_studies(study_kind, status, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_research_activation_evidence_gate
  ON public.research_activation_evidence(study_id, evidence_type, status, version_number DESC);
CREATE INDEX IF NOT EXISTS idx_research_pilot_reviews_decision
  ON public.research_pilot_reviews(pilot_study_id, reviewed_at DESC, decision);
CREATE INDEX IF NOT EXISTS idx_visits_attraction_scope
  ON public.visits(attraction_id, visit_date DESC, checkin_code_id, entry_channel);
CREATE INDEX IF NOT EXISTS idx_visits_attraction_tourist_date
  ON public.visits(attraction_id, tourist_id, visit_date DESC);
CREATE INDEX IF NOT EXISTS idx_tourist_stamps_visit_earned
  ON public.tourist_stamps(visit_id, earned_at DESC);

CREATE OR REPLACE FUNCTION public.prevent_research_freeze_snapshot_mutation()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = ''
AS $$
BEGIN
  RAISE EXCEPTION 'RESEARCH_FREEZE_SNAPSHOT_IMMUTABLE';
END;
$$;

CREATE TRIGGER prevent_research_freeze_snapshot_mutation
BEFORE UPDATE OR DELETE ON public.research_freeze_snapshots
FOR EACH ROW EXECUTE FUNCTION public.prevent_research_freeze_snapshot_mutation();

CREATE OR REPLACE FUNCTION public.prevent_research_governance_record_mutation()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = ''
AS $$
BEGIN
  RAISE EXCEPTION 'RESEARCH_GOVERNANCE_RECORD_IMMUTABLE';
END;
$$;

CREATE TRIGGER prevent_research_activation_evidence_mutation
BEFORE UPDATE OR DELETE ON public.research_activation_evidence
FOR EACH ROW EXECUTE FUNCTION public.prevent_research_governance_record_mutation();
CREATE TRIGGER prevent_research_pilot_review_mutation
BEFORE UPDATE OR DELETE ON public.research_pilot_reviews
FOR EACH ROW EXECUTE FUNCTION public.prevent_research_governance_record_mutation();

CREATE OR REPLACE FUNCTION public.enforce_research_activation_stage()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = ''
AS $$
DECLARE
  v_source_kind varchar(30);
BEGIN
  IF NEW.status <> 'active' OR OLD.status = 'active' THEN
    RETURN NEW;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM public.research_freeze_snapshots AS snapshot
    WHERE snapshot.study_id = NEW.research_study_id
  ) THEN
    RAISE EXCEPTION 'RESEARCH_FREEZE_SNAPSHOT_REQUIRED';
  END IF;

  IF nullif(btrim(NEW.approved_title_th), '') IS NULL
    OR nullif(btrim(NEW.approved_geographic_boundary), '') IS NULL
    OR NEW.approved_objectives IS NULL
    OR jsonb_typeof(NEW.approved_objectives) <> 'array'
    OR jsonb_array_length(NEW.approved_objectives) = 0
    OR NEW.approved_research_questions IS NULL
    OR jsonb_typeof(NEW.approved_research_questions) <> 'array'
    OR jsonb_array_length(NEW.approved_research_questions) = 0
    OR NEW.analysis_wording IS NULL THEN
    RAISE EXCEPTION 'RESEARCH_APPROVED_SCOPE_REQUIRED';
  END IF;

  IF NEW.study_kind = 'pilot' THEN
    IF EXISTS (
      SELECT 1 FROM public.research_checkin_codes AS deployment
      WHERE deployment.study_id = NEW.research_study_id
        AND deployment.is_active = true
        AND deployment.default_collection_mode = 'field_observation'
    ) THEN
      RAISE EXCEPTION 'PILOT_FIELD_DEPLOYMENT_NOT_ALLOWED';
    END IF;

    IF NOT EXISTS (
      SELECT 1 FROM public.research_checkin_codes AS deployment
      WHERE deployment.study_id = NEW.research_study_id
        AND deployment.is_active = true
        AND deployment.default_collection_mode IN ('pilot_internal', 'simulated_usability')
    ) THEN
      RAISE EXCEPTION 'PILOT_CONTROLLED_DEPLOYMENT_REQUIRED';
    END IF;

    IF EXISTS (
      SELECT required.evidence_type
      FROM (VALUES ('expert_review'), ('cognitive_pretest'), ('mobile_flow_qa')) AS required(evidence_type)
      WHERE COALESCE((
        SELECT evidence.status FROM public.research_activation_evidence AS evidence
        WHERE evidence.study_id = NEW.research_study_id
          AND evidence.evidence_type = required.evidence_type
        ORDER BY evidence.version_number DESC, evidence.recorded_at DESC
        LIMIT 1
      ), 'missing') NOT IN ('passed', 'not_required')
    ) THEN
      RAISE EXCEPTION 'PILOT_ACTIVATION_EVIDENCE_REQUIRED';
    END IF;
  ELSE
    IF NEW.source_pilot_study_id IS NULL THEN
      RAISE EXCEPTION 'FINAL_COLLECTION_PILOT_SOURCE_REQUIRED';
    END IF;

    SELECT source.study_kind INTO v_source_kind
    FROM public.research_studies AS source
    WHERE source.research_study_id = NEW.source_pilot_study_id;

    IF v_source_kind IS DISTINCT FROM 'pilot' THEN
      RAISE EXCEPTION 'FINAL_COLLECTION_PILOT_SOURCE_INVALID';
    END IF;

    IF COALESCE((
      SELECT review.decision FROM public.research_pilot_reviews AS review
      WHERE review.pilot_study_id = NEW.source_pilot_study_id
      ORDER BY review.reviewed_at DESC
      LIMIT 1
    ), 'missing') <> 'ready_for_field' THEN
      RAISE EXCEPTION 'FINAL_COLLECTION_PILOT_DECISION_REQUIRED';
    END IF;

    IF NOT EXISTS (
      SELECT 1 FROM public.research_checkin_codes AS deployment
      WHERE deployment.study_id = NEW.research_study_id
        AND deployment.is_active = true
        AND deployment.default_collection_mode = 'field_observation'
    ) THEN
      RAISE EXCEPTION 'FINAL_COLLECTION_FIELD_DEPLOYMENT_REQUIRED';
    END IF;
  END IF;

  RETURN NEW;
END;
$$;

CREATE TRIGGER enforce_research_activation_stage
BEFORE UPDATE ON public.research_studies
FOR EACH ROW EXECUTE FUNCTION public.enforce_research_activation_stage();

CREATE OR REPLACE FUNCTION public.prevent_post_freeze_research_configuration_mutation()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = ''
AS $$
DECLARE
  v_study_id uuid;
BEGIN
  IF TG_TABLE_NAME = 'research_items' THEN
    SELECT instrument.study_id INTO v_study_id
    FROM public.research_instruments AS instrument
    WHERE instrument.research_instrument_id = CASE WHEN TG_OP = 'DELETE' THEN OLD.instrument_id ELSE NEW.instrument_id END;
  ELSE
    v_study_id := CASE WHEN TG_OP = 'DELETE' THEN OLD.study_id ELSE NEW.study_id END;
  END IF;

  IF EXISTS (
    SELECT 1 FROM public.research_freeze_snapshots AS snapshot
    WHERE snapshot.study_id = v_study_id
  ) THEN
    RAISE EXCEPTION 'POST_FREEZE_RESEARCH_CONFIGURATION_IMMUTABLE';
  END IF;
  IF TG_OP = 'DELETE' THEN RETURN OLD; END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER prevent_post_freeze_research_instrument_mutation
BEFORE INSERT OR UPDATE OR DELETE ON public.research_instruments
FOR EACH ROW EXECUTE FUNCTION public.prevent_post_freeze_research_configuration_mutation();
CREATE TRIGGER prevent_post_freeze_research_item_mutation
BEFORE INSERT OR UPDATE OR DELETE ON public.research_items
FOR EACH ROW EXECUTE FUNCTION public.prevent_post_freeze_research_configuration_mutation();
CREATE TRIGGER prevent_post_freeze_research_task_mutation
BEFORE INSERT OR UPDATE OR DELETE ON public.research_operator_tasks
FOR EACH ROW EXECUTE FUNCTION public.prevent_post_freeze_research_configuration_mutation();
CREATE TRIGGER prevent_post_freeze_research_deployment_mutation
BEFORE INSERT OR UPDATE OR DELETE ON public.research_checkin_codes
FOR EACH ROW EXECUTE FUNCTION public.prevent_post_freeze_research_configuration_mutation();

CREATE OR REPLACE FUNCTION public.prevent_post_freeze_research_protocol_mutation()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = ''
AS $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM public.research_freeze_snapshots AS snapshot
    WHERE snapshot.study_id = OLD.research_study_id
  ) AND (
    OLD.study_code IS DISTINCT FROM NEW.study_code
    OR OLD.title_th IS DISTINCT FROM NEW.title_th
    OR OLD.protocol_version IS DISTINCT FROM NEW.protocol_version
    OR OLD.consent_version IS DISTINCT FROM NEW.consent_version
    OR OLD.notice_version IS DISTINCT FROM NEW.notice_version
    OR OLD.purpose_th IS DISTINCT FROM NEW.purpose_th
    OR OLD.participation_th IS DISTINCT FROM NEW.participation_th
    OR OLD.privacy_th IS DISTINCT FROM NEW.privacy_th
    OR OLD.withdrawal_th IS DISTINCT FROM NEW.withdrawal_th
    OR OLD.retention_until IS DISTINCT FROM NEW.retention_until
    OR OLD.study_kind IS DISTINCT FROM NEW.study_kind
    OR OLD.source_pilot_study_id IS DISTINCT FROM NEW.source_pilot_study_id
    OR OLD.approved_title_th IS DISTINCT FROM NEW.approved_title_th
    OR OLD.approved_geographic_boundary IS DISTINCT FROM NEW.approved_geographic_boundary
    OR OLD.approved_objectives IS DISTINCT FROM NEW.approved_objectives
    OR OLD.approved_research_questions IS DISTINCT FROM NEW.approved_research_questions
    OR OLD.analysis_wording IS DISTINCT FROM NEW.analysis_wording
  ) THEN
    RAISE EXCEPTION 'POST_FREEZE_RESEARCH_PROTOCOL_IMMUTABLE';
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER prevent_post_freeze_research_protocol_mutation
BEFORE UPDATE ON public.research_studies
FOR EACH ROW EXECUTE FUNCTION public.prevent_post_freeze_research_protocol_mutation();

CREATE OR REPLACE FUNCTION public.enforce_research_session_collection_mode()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = ''
AS $$
DECLARE
  v_study_kind varchar(30);
BEGIN
  SELECT study.study_kind INTO v_study_kind
  FROM public.research_studies AS study
  WHERE study.research_study_id = NEW.study_id;

  IF v_study_kind = 'pilot' AND NEW.collection_mode = 'field_observation' THEN
    RAISE EXCEPTION 'PILOT_FIELD_SESSION_NOT_ALLOWED';
  END IF;

  IF v_study_kind = 'final_collection' AND NEW.collection_mode <> 'field_observation' THEN
    RAISE EXCEPTION 'FINAL_NON_FIELD_SESSION_NOT_ALLOWED';
  END IF;

  RETURN NEW;
END;
$$;

CREATE TRIGGER enforce_research_session_collection_mode
BEFORE INSERT OR UPDATE OF study_id, collection_mode ON public.research_sessions
FOR EACH ROW EXECUTE FUNCTION public.enforce_research_session_collection_mode();

ALTER TABLE public.research_activation_evidence ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.research_freeze_snapshots ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.research_pilot_reviews ENABLE ROW LEVEL SECURITY;

REVOKE ALL ON TABLE public.research_activation_evidence FROM anon, authenticated;
REVOKE ALL ON TABLE public.research_freeze_snapshots FROM anon, authenticated;
REVOKE ALL ON TABLE public.research_pilot_reviews FROM anon, authenticated;
GRANT ALL ON TABLE public.research_activation_evidence TO service_role;
GRANT ALL ON TABLE public.research_freeze_snapshots TO service_role;
GRANT ALL ON TABLE public.research_pilot_reviews TO service_role;

REVOKE ALL ON FUNCTION public.prevent_research_freeze_snapshot_mutation() FROM PUBLIC;
REVOKE ALL ON FUNCTION public.prevent_research_governance_record_mutation() FROM PUBLIC;
REVOKE ALL ON FUNCTION public.enforce_research_activation_stage() FROM PUBLIC;
REVOKE ALL ON FUNCTION public.enforce_research_session_collection_mode() FROM PUBLIC;
REVOKE ALL ON FUNCTION public.prevent_post_freeze_research_configuration_mutation() FROM PUBLIC;
REVOKE ALL ON FUNCTION public.prevent_post_freeze_research_protocol_mutation() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.prevent_research_freeze_snapshot_mutation() TO service_role;
GRANT EXECUTE ON FUNCTION public.prevent_research_governance_record_mutation() TO service_role;
GRANT EXECUTE ON FUNCTION public.enforce_research_activation_stage() TO service_role;
GRANT EXECUTE ON FUNCTION public.enforce_research_session_collection_mode() TO service_role;
GRANT EXECUTE ON FUNCTION public.prevent_post_freeze_research_configuration_mutation() TO service_role;
GRANT EXECUTE ON FUNCTION public.prevent_post_freeze_research_protocol_mutation() TO service_role;

COMMENT ON COLUMN public.visits.entry_channel IS
  'Observed entry channel. unknown is used when historical evidence cannot support QR/NFC/direct attribution.';
COMMENT ON TABLE public.research_freeze_snapshots IS
  'Immutable version manifest required before any pilot or final research activation.';
COMMENT ON TABLE public.research_pilot_reviews IS
  'Pilot quality decision. A ready_for_field decision is necessary but not sufficient for final activation.';
