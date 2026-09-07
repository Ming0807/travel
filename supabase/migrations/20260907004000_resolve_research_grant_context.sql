-- Bounded context lookup for one fixed-size browser credential. No activation.
CREATE FUNCTION public.resolve_research_browser_context(
  p_browser_token_hash text, p_context_kind text, p_context_id uuid
) RETURNS TABLE(public_session_code uuid, access_token_hash text,
  withdrawal_token_hash text, visit_id uuid, entry_session_id uuid)
LANGUAGE sql SECURITY DEFINER SET search_path = '' AS $$
  WITH candidates AS MATERIALIZED (
    SELECT resolved.*, s.entry_session_id
      FROM public.research_sessions s
      JOIN public.research_browser_grants g USING(research_session_id)
      CROSS JOIN LATERAL public.resolve_research_browser_grant(
        p_browser_token_hash,s.public_session_code) resolved
      WHERE g.browser_token_hash=p_browser_token_hash
        AND s.participant_type='tourist'
        AND ((p_context_kind='visit' AND s.visit_id=p_context_id)
          OR (p_context_kind='entry' AND s.entry_session_id=p_context_id))
      LIMIT 2
  )
  SELECT * FROM candidates WHERE (SELECT count(*) FROM candidates)=1;
$$;
REVOKE ALL ON FUNCTION public.resolve_research_browser_context(text,text,uuid)
  FROM PUBLIC,anon,authenticated;
GRANT EXECUTE ON FUNCTION public.resolve_research_browser_context(text,text,uuid)
  TO service_role;
