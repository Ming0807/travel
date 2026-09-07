-- Preserve first Visit association and permit no-op retries, including completion.
CREATE OR REPLACE FUNCTION public.link_research_session_visit(
  p_public_session_code uuid, p_access_token_hash text, p_visit_id uuid, p_tourist_id uuid
) RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path = '' AS $$
DECLARE
  v_session public.research_sessions%ROWTYPE;
BEGIN
  SELECT * INTO v_session FROM public.research_sessions
    WHERE public_session_code = p_public_session_code
      AND access_token_hash = p_access_token_hash AND participant_type = 'tourist'
      AND status IN ('consented','in_progress','completed') AND withdrawn_at IS NULL
    FOR UPDATE;
  IF NOT FOUND THEN
    RETURN jsonb_build_object('success',false,'error_code','RESEARCH_SESSION_NOT_FOUND');
  END IF;
  IF (v_session.visit_id IS NOT NULL AND v_session.visit_id IS DISTINCT FROM p_visit_id)
    OR (v_session.tourist_id IS NOT NULL AND v_session.tourist_id IS DISTINCT FROM p_tourist_id)
    OR NOT EXISTS (SELECT 1 FROM public.visits WHERE visit_id = p_visit_id
      AND tourist_id = p_tourist_id AND checkin_code_id = v_session.checkin_code_id) THEN
    RETURN jsonb_build_object('success',false,'error_code','RESEARCH_VISIT_MISMATCH');
  END IF;
  IF v_session.visit_id IS NOT NULL THEN
    RETURN jsonb_build_object('success',true,'research_session_id',v_session.research_session_id);
  END IF;
  IF v_session.status = 'completed' THEN
    RETURN jsonb_build_object('success',false,'error_code','RESEARCH_SESSION_NOT_FOUND');
  END IF;
  UPDATE public.research_sessions SET tourist_id=p_tourist_id, visit_id=p_visit_id,
    status='in_progress', started_at=COALESCE(started_at,now()), updated_at=now()
    WHERE research_session_id=v_session.research_session_id;
  RETURN jsonb_build_object('success',true,'research_session_id',v_session.research_session_id);
END;
$$;
REVOKE ALL ON FUNCTION public.link_research_session_visit(uuid,text,uuid,uuid) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.link_research_session_visit(uuid,text,uuid,uuid) TO service_role;
