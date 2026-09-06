-- Optional entry-aware acceptance. Legacy callers keep the original RPC.
CREATE FUNCTION public.accept_entry_research_invitation(
  p_entry_session_id uuid,
  p_study_code text,
  p_checkin_code text,
  p_operational_session_hash text,
  p_access_token_hash text,
  p_withdrawal_token_hash text,
  p_language text
) RETURNS jsonb
LANGUAGE plpgsql SECURITY DEFINER SET search_path = '' AS $$
DECLARE
  v_entry public.checkin_entry_sessions%ROWTYPE;
  v_study_id uuid;
  v_frozen_at timestamptz;
  v_mode text;
BEGIN
  -- Same lock order as the existing consent RPC, avoiding inverse lock order.
  PERFORM pg_advisory_xact_lock(hashtextextended(p_study_code || ':' || p_operational_session_hash, 0));
  SELECT * INTO v_entry FROM public.checkin_entry_sessions
    WHERE entry_session_id = p_entry_session_id
      AND code_snapshot = p_checkin_code AND expires_at > now();
  IF NOT FOUND OR v_entry.research_study_id_snapshot IS NULL
    OR v_entry.research_frozen_at_snapshot IS NULL OR v_entry.evidence_scope = 'unknown' THEN
    RETURN jsonb_build_object('success', false, 'error_code', 'RESEARCH_STUDY_UNAVAILABLE');
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
    RETURN jsonb_build_object('success', false, 'error_code', 'RESEARCH_STUDY_UNAVAILABLE');
  END IF;

  -- Locks remain held through consent creation/token rotation.
  RETURN public.accept_research_invitation(p_study_code, p_checkin_code,
    p_operational_session_hash, p_access_token_hash, p_withdrawal_token_hash, p_language);
END;
$$;

REVOKE ALL ON FUNCTION public.accept_entry_research_invitation(uuid,text,text,text,text,text,text)
  FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.accept_entry_research_invitation(uuid,text,text,text,text,text,text)
  TO service_role;
