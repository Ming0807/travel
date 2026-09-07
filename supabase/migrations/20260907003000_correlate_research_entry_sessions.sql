-- Add exact provenance without guessing associations for historical sessions.
ALTER TABLE public.research_sessions ADD COLUMN entry_session_id uuid
  REFERENCES public.checkin_entry_sessions(entry_session_id) ON DELETE RESTRICT;
CREATE INDEX idx_research_session_entry ON public.research_sessions(entry_session_id)
  WHERE entry_session_id IS NOT NULL;

CREATE FUNCTION public.guard_research_entry_binding()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = '' AS $$
DECLARE
  v_entry public.checkin_entry_sessions%ROWTYPE;
BEGIN
  IF TG_OP = 'UPDATE' AND OLD.entry_session_id IS NOT NULL
    AND NEW.entry_session_id IS DISTINCT FROM OLD.entry_session_id THEN
    RAISE EXCEPTION 'RESEARCH_ENTRY_IMMUTABLE';
  END IF;
  IF NEW.entry_session_id IS NULL THEN RETURN NEW; END IF;
  SELECT * INTO v_entry FROM public.checkin_entry_sessions
    WHERE entry_session_id = NEW.entry_session_id;
  IF NOT FOUND OR NEW.participant_type <> 'tourist'
    OR NEW.study_id IS DISTINCT FROM v_entry.research_study_id_snapshot
    OR NEW.checkin_code_id IS DISTINCT FROM v_entry.checkin_code_id
    OR (NEW.visit_id IS NOT NULL AND NEW.visit_id IS DISTINCT FROM v_entry.visit_id) THEN
    RAISE EXCEPTION 'RESEARCH_ENTRY_MISMATCH';
  END IF;
  RETURN NEW;
END;
$$;
CREATE TRIGGER guard_research_entry_binding
  BEFORE INSERT OR UPDATE OF entry_session_id, study_id, checkin_code_id, participant_type, visit_id
  ON public.research_sessions FOR EACH ROW EXECUTE FUNCTION public.guard_research_entry_binding();
REVOKE ALL ON FUNCTION public.guard_research_entry_binding() FROM PUBLIC, anon, authenticated, service_role;

CREATE OR REPLACE FUNCTION public.accept_entry_research_invitation(
  p_entry_session_id uuid, p_study_code text, p_checkin_code text,
  p_operational_session_hash text, p_access_token_hash text,
  p_withdrawal_token_hash text, p_language text
) RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path = '' AS $$
DECLARE
  v_entry public.checkin_entry_sessions%ROWTYPE;
  v_study_id uuid;
  v_frozen_at timestamptz;
  v_mode text;
  v_result jsonb;
BEGIN
  PERFORM pg_advisory_xact_lock(hashtextextended(p_study_code || ':' || p_operational_session_hash, 0));
  SELECT * INTO v_entry FROM public.checkin_entry_sessions
    WHERE entry_session_id = p_entry_session_id
      AND code_snapshot = p_checkin_code AND expires_at > now();
  IF NOT FOUND OR v_entry.research_study_id_snapshot IS NULL
    OR v_entry.research_frozen_at_snapshot IS NULL OR v_entry.evidence_scope = 'unknown' THEN
    RETURN jsonb_build_object('success',false,'error_code','RESEARCH_STUDY_UNAVAILABLE');
  END IF;
  PERFORM public.validate_checkin_entry_assignment(v_entry);
  SELECT study.research_study_id, study.frozen_at, deployment.default_collection_mode
    INTO v_study_id, v_frozen_at, v_mode
    FROM public.research_studies AS study
    JOIN public.research_checkin_codes AS deployment ON deployment.study_id = study.research_study_id
    WHERE study.study_code = p_study_code AND study.status = 'active'
      AND (study.starts_at IS NULL OR study.starts_at <= now())
      AND (study.ends_at IS NULL OR study.ends_at > now())
      AND deployment.checkin_code_id = v_entry.checkin_code_id AND deployment.is_active
      AND (deployment.starts_at IS NULL OR deployment.starts_at <= now())
      AND (deployment.ends_at IS NULL OR deployment.ends_at > now())
    FOR UPDATE OF study, deployment;
  IF NOT FOUND OR v_study_id IS DISTINCT FROM v_entry.research_study_id_snapshot
    OR v_frozen_at IS DISTINCT FROM v_entry.research_frozen_at_snapshot
    OR v_mode IS DISTINCT FROM v_entry.evidence_scope THEN
    RETURN jsonb_build_object('success',false,'error_code','RESEARCH_STUDY_UNAVAILABLE');
  END IF;
  v_result := public.accept_research_invitation(p_study_code,p_checkin_code,
    p_operational_session_hash,p_access_token_hash,p_withdrawal_token_hash,p_language);
  IF (v_result->>'success')::boolean IS NOT TRUE THEN RETURN v_result; END IF;
  -- Any binding failure aborts this transaction, including legacy token rotation.
  UPDATE public.research_sessions SET entry_session_id = p_entry_session_id
    WHERE public_session_code = (v_result->>'public_session_code')::uuid
      AND access_token_hash = p_access_token_hash AND study_id = v_study_id;
  IF NOT FOUND THEN RAISE EXCEPTION 'RESEARCH_ENTRY_BIND_FAILED'; END IF;
  RETURN v_result;
END;
$$;
REVOKE ALL ON FUNCTION public.accept_entry_research_invitation(uuid,text,text,text,text,text,text)
  FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.accept_entry_research_invitation(uuid,text,text,text,text,text,text)
  TO service_role;
