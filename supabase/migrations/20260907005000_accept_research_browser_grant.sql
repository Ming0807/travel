-- Atomic browser-grant acceptance. Dormant until stable cookie provisioning exists.
CREATE FUNCTION public.accept_research_browser_invitation(
  p_browser_token_hash text, p_entry_browser_hash text, p_entry_session_id uuid,
  p_study_code text, p_checkin_code text, p_operational_session_hash text,
  p_access_token_hash text, p_withdrawal_token_hash text, p_language text
) RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path = '' AS $$
DECLARE
  v_grant record;
  v_result jsonb;
  v_access text := p_access_token_hash;
  v_withdrawal text := p_withdrawal_token_hash;
BEGIN
  IF p_browser_token_hash IS NULL OR p_browser_token_hash !~ '^[a-f0-9]{64}$'
    OR p_entry_browser_hash IS NULL OR p_entry_browser_hash !~ '^[a-f0-9]{64}$'
    OR p_access_token_hash IS NULL OR p_access_token_hash !~ '^[a-f0-9]{64}$'
    OR p_withdrawal_token_hash IS NULL OR p_withdrawal_token_hash !~ '^[a-f0-9]{64}$' THEN
    RETURN jsonb_build_object('success',false,'error_code','RESEARCH_INVITATION_INVALID');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM public.checkin_entry_sessions
    WHERE entry_session_id=p_entry_session_id AND browser_hash=p_entry_browser_hash) THEN
    RETURN jsonb_build_object('success',false,'error_code','RESEARCH_ENTRY_MISMATCH');
  END IF;
  -- Serialize every acceptance for this entry, even malformed operational hashes.
  PERFORM pg_advisory_xact_lock(hashtextextended('research-browser-entry:' || p_entry_session_id::text,0));
  SELECT * INTO v_grant FROM public.resolve_research_browser_context(
    p_browser_token_hash,'entry',p_entry_session_id);
  IF FOUND THEN
    v_access := v_grant.access_token_hash;
    v_withdrawal := v_grant.withdrawal_token_hash;
  ELSIF EXISTS (SELECT 1 FROM public.research_sessions
    WHERE entry_session_id=p_entry_session_id
      AND status IN ('consented','in_progress','completed') AND withdrawn_at IS NULL) THEN
    -- Existing legacy/revoked/ambiguous rights need verified migration, not takeover.
    RETURN jsonb_build_object('success',false,'error_code','RESEARCH_GRANT_MIGRATION_REQUIRED');
  END IF;
  -- Preserve the existing current-deployment/frozen-instrument checks on retries.
  v_result := public.accept_entry_research_invitation(p_entry_session_id,p_study_code,
    p_checkin_code,p_operational_session_hash,v_access,v_withdrawal,p_language);
  IF (v_result->>'success')::boolean IS NOT TRUE THEN RETURN v_result; END IF;
  IF v_grant.public_session_code IS NOT NULL
    AND (v_result->>'public_session_code')::uuid IS DISTINCT FROM v_grant.public_session_code THEN
    RAISE EXCEPTION 'RESEARCH_GRANT_SESSION_MISMATCH';
  END IF;
  IF NOT public.bind_research_browser_grant(p_browser_token_hash,
    (v_result->>'public_session_code')::uuid,v_access,v_withdrawal) THEN
    RAISE EXCEPTION 'RESEARCH_GRANT_BIND_FAILED';
  END IF;
  RETURN v_result;
END;
$$;
REVOKE ALL ON FUNCTION public.accept_research_browser_invitation(text,text,uuid,text,text,text,text,text,text)
  FROM PUBLIC,anon,authenticated;
GRANT EXECUTE ON FUNCTION public.accept_research_browser_invitation(text,text,uuid,text,text,text,text,text,text)
  TO service_role;
