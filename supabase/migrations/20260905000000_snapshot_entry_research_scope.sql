-- No backfill: historical entry scope remains unknown.
ALTER TABLE public.checkin_entry_sessions
  ADD COLUMN research_study_id_snapshot uuid REFERENCES public.research_studies(research_study_id) ON DELETE RESTRICT,
  ADD COLUMN research_frozen_at_snapshot timestamptz,
  ADD COLUMN evidence_scope_reason varchar(30) NOT NULL DEFAULT 'legacy_unknown'
    CHECK (evidence_scope_reason IN ('legacy_unknown', 'no_deployment', 'deployment_unavailable', 'ambiguous_deployment', 'active_deployment'));

CREATE FUNCTION public.snapshot_checkin_entry_research_scope()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = '' AS $$
DECLARE
  v_deployment public.research_checkin_codes%ROWTYPE;
  v_study public.research_studies%ROWTYPE;
  v_count integer := 0;
  v_candidate public.research_checkin_codes%ROWTYPE;
BEGIN
  -- Never trust an input evidence scope, URL hint, or later consent cookie.
  NEW.evidence_scope := 'unknown';
  NEW.research_study_id_snapshot := NULL;
  NEW.research_frozen_at_snapshot := NULL;
  NEW.evidence_scope_reason := 'no_deployment';
  FOR v_candidate IN SELECT * FROM public.research_checkin_codes
    WHERE checkin_code_id = NEW.checkin_code_id AND is_active
      AND (starts_at IS NULL OR starts_at <= now())
      AND (ends_at IS NULL OR ends_at >= now())
    ORDER BY study_id FOR SHARE
  LOOP
    v_count := v_count + 1;
    v_deployment := v_candidate;
  END LOOP;
  IF v_count = 0 THEN RETURN NEW; END IF;
  IF v_count <> 1 THEN
    NEW.evidence_scope_reason := 'ambiguous_deployment';
    RETURN NEW;
  END IF;
  NEW.evidence_scope_reason := 'deployment_unavailable';
  SELECT * INTO v_study FROM public.research_studies
    WHERE research_study_id = v_deployment.study_id FOR SHARE;
  IF NOT FOUND OR v_study.status <> 'active' OR v_study.frozen_at IS NULL
    OR (v_study.starts_at IS NOT NULL AND v_study.starts_at > now())
    OR (v_study.ends_at IS NOT NULL AND v_study.ends_at < now()) THEN
    RETURN NEW;
  END IF;
  IF NOT ((v_study.study_kind = 'pilot' AND v_deployment.default_collection_mode IN ('pilot_internal', 'simulated_usability'))
    OR (v_study.study_kind = 'final_collection' AND v_deployment.default_collection_mode = 'field_observation')) THEN
    RETURN NEW;
  END IF;
  NEW.evidence_scope := v_deployment.default_collection_mode;
  NEW.research_study_id_snapshot := v_study.research_study_id;
  NEW.research_frozen_at_snapshot := v_study.frozen_at;
  NEW.evidence_scope_reason := 'active_deployment';
  RETURN NEW;
END;
$$;

CREATE TRIGGER snapshot_checkin_entry_research_scope
  BEFORE INSERT ON public.checkin_entry_sessions
  FOR EACH ROW EXECUTE FUNCTION public.snapshot_checkin_entry_research_scope();
REVOKE ALL ON FUNCTION public.snapshot_checkin_entry_research_scope() FROM PUBLIC, anon, authenticated, service_role;

COMMENT ON COLUMN public.checkin_entry_sessions.evidence_scope IS
  'Immutable collection context at entry, not research consent or inclusion eligibility. Unknown is excluded from field claims.';
COMMENT ON COLUMN public.checkin_entry_sessions.research_study_id_snapshot IS
  'Study deployment provenance only. Does not create research participation or authorize evaluation data collection.';
