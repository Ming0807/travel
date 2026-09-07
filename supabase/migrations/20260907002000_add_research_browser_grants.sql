-- Foundation only. No application caller, cookie migration or rollout activation.
CREATE TABLE public.research_browser_grants (
  browser_token_hash text NOT NULL CHECK (browser_token_hash ~ '^[a-f0-9]{64}$'),
  research_session_id uuid NOT NULL REFERENCES public.research_sessions(research_session_id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now(),
  expires_at timestamptz NOT NULL,
  revoked_at timestamptz,
  PRIMARY KEY (browser_token_hash, research_session_id),
  CHECK (expires_at > created_at)
);
CREATE INDEX idx_research_browser_grants_session ON public.research_browser_grants(research_session_id);
CREATE INDEX idx_research_browser_grants_expiry ON public.research_browser_grants(expires_at);
ALTER TABLE public.research_browser_grants ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.research_browser_grants FROM PUBLIC, anon, authenticated, service_role;

CREATE FUNCTION public.bind_research_browser_grant(
  p_browser_token_hash text, p_public_session_code uuid,
  p_access_token_hash text, p_withdrawal_token_hash text
) RETURNS boolean LANGUAGE plpgsql SECURITY DEFINER SET search_path = '' AS $$
DECLARE
  v_session public.research_sessions%ROWTYPE;
  v_expiry timestamptz;
  v_grant public.research_browser_grants%ROWTYPE;
  v_study_id uuid;
  v_retention timestamptz;
BEGIN
  IF p_browser_token_hash IS NULL OR p_browser_token_hash !~ '^[a-f0-9]{64}$'
    OR p_access_token_hash IS NULL OR p_access_token_hash !~ '^[a-f0-9]{64}$'
    OR p_withdrawal_token_hash IS NULL OR p_withdrawal_token_hash !~ '^[a-f0-9]{64}$' THEN RETURN false; END IF;
  SELECT study_id INTO v_study_id FROM public.research_sessions WHERE public_session_code=p_public_session_code;
  IF NOT FOUND THEN RETURN false; END IF;
  -- Study before session matches acceptance's lock order.
  SELECT retention_until INTO v_retention FROM public.research_studies
    WHERE research_study_id=v_study_id FOR SHARE;
  IF NOT FOUND THEN RETURN false; END IF;
  SELECT * INTO v_session FROM public.research_sessions
    WHERE public_session_code=p_public_session_code AND access_token_hash=p_access_token_hash
      AND withdrawal_token_hash=p_withdrawal_token_hash AND withdrawn_at IS NULL
      AND study_id=v_study_id AND status IN ('consented','in_progress','completed') FOR UPDATE;
  IF NOT FOUND THEN RETURN false; END IF;
  v_expiry := LEAST(v_session.created_at + interval '30 days', COALESCE(v_retention,'infinity'::timestamptz));
  IF v_expiry IS NULL OR v_expiry <= now() THEN RETURN false; END IF;
  SELECT * INTO v_grant FROM public.research_browser_grants
    WHERE browser_token_hash=p_browser_token_hash AND research_session_id=v_session.research_session_id;
  IF FOUND THEN RETURN v_grant.revoked_at IS NULL AND v_grant.expires_at > now(); END IF;
  INSERT INTO public.research_browser_grants(browser_token_hash,research_session_id,expires_at)
    VALUES(p_browser_token_hash,v_session.research_session_id,v_expiry);
  RETURN true;
END;
$$;

-- Hashes returned here are server-side RPC credentials, never public response data.
CREATE FUNCTION public.resolve_research_browser_grant(p_browser_token_hash text, p_public_session_code uuid)
RETURNS TABLE(public_session_code uuid, access_token_hash text, withdrawal_token_hash text, visit_id uuid)
LANGUAGE sql SECURITY DEFINER SET search_path = '' AS $$
  SELECT s.public_session_code,s.access_token_hash,s.withdrawal_token_hash,s.visit_id
    FROM public.research_browser_grants g JOIN public.research_sessions s USING(research_session_id)
    JOIN public.research_studies study ON study.research_study_id=s.study_id
    WHERE g.browser_token_hash=p_browser_token_hash AND s.public_session_code=p_public_session_code
      AND g.revoked_at IS NULL AND g.expires_at>now() AND s.withdrawn_at IS NULL
      AND s.status IN ('consented','in_progress','completed')
      AND (study.retention_until IS NULL OR study.retention_until>now());
$$;

CREATE FUNCTION public.revoke_research_browser_grant(p_browser_token_hash text, p_public_session_code uuid)
RETURNS void LANGUAGE sql SECURITY DEFINER SET search_path = '' AS $$
  UPDATE public.research_browser_grants SET revoked_at=COALESCE(revoked_at,now())
    WHERE browser_token_hash=p_browser_token_hash AND research_session_id IN (
      SELECT research_session_id FROM public.research_sessions WHERE public_session_code=p_public_session_code
    );
$$;

REVOKE ALL ON FUNCTION public.bind_research_browser_grant(text,uuid,text,text),
  public.resolve_research_browser_grant(text,uuid),public.revoke_research_browser_grant(text,uuid)
  FROM PUBLIC,anon,authenticated;
GRANT EXECUTE ON FUNCTION public.bind_research_browser_grant(text,uuid,text,text),
  public.resolve_research_browser_grant(text,uuid),public.revoke_research_browser_grant(text,uuid)
  TO service_role;

CREATE FUNCTION public.cleanup_expired_research_browser_grants(p_limit integer DEFAULT 500)
RETURNS integer LANGUAGE plpgsql SECURITY DEFINER SET search_path = '' AS $$
DECLARE v_deleted integer;
BEGIN
  IF p_limit IS NULL OR p_limit NOT BETWEEN 1 AND 1000 THEN
    RAISE EXCEPTION 'RESEARCH_GRANT_CLEANUP_LIMIT_INVALID';
  END IF;
  WITH expired AS (
    -- Keep revocation tombstones through the maximum credential lifetime.
    SELECT ctid FROM public.research_browser_grants WHERE expires_at<=now()
      AND created_at + interval '30 days' <= now()
      ORDER BY expires_at LIMIT p_limit FOR UPDATE SKIP LOCKED
  ) DELETE FROM public.research_browser_grants g USING expired e WHERE g.ctid=e.ctid;
  GET DIAGNOSTICS v_deleted = ROW_COUNT;
  RETURN v_deleted;
END;
$$;
REVOKE ALL ON FUNCTION public.cleanup_expired_research_browser_grants(integer) FROM PUBLIC,anon,authenticated;
GRANT EXECUTE ON FUNCTION public.cleanup_expired_research_browser_grants(integer) TO service_role;
COMMENT ON TABLE public.research_browser_grants IS
  'Server-only research capabilities, not tourist identity or consent. Application integration and cleanup required before activation.';
