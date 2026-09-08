// Catalog-only checks shared by the release verifier and disposable database QA.
export const researchGrantReleaseChecks = `
  WITH required(signature) AS (VALUES
    ('bind_research_browser_grant(text,uuid,text,text)'),
    ('resolve_research_browser_grant(text,uuid)'),
    ('revoke_research_browser_grant(text,uuid)'),
    ('cleanup_expired_research_browser_grants(integer)'),
    ('resolve_research_browser_context(text,text,uuid)'),
    ('accept_research_browser_invitation(text,text,uuid,text,text,text,text,text,text)')
  ), functions AS (
    SELECT signature, to_regprocedure('public.' || signature) AS oid FROM required
  )
  SELECT 'research-rpc:' || signature AS check_name, oid IS NOT NULL AS passed FROM functions
  UNION ALL
  SELECT 'research-rpc-service-only:' || signature,
    COALESCE(has_function_privilege('service_role', oid, 'EXECUTE'), false)
    AND NOT COALESCE(has_function_privilege('anon', oid, 'EXECUTE'), true)
    AND NOT COALESCE(has_function_privilege('authenticated', oid, 'EXECUTE'), true)
    FROM functions
  UNION ALL
  SELECT 'research-rpc-definer-path:' || f.signature,
    COALESCE(p.prosecdef AND p.proconfig @> ARRAY['search_path=""'], false)
    FROM functions f LEFT JOIN pg_proc p ON p.oid=f.oid
  UNION ALL
  SELECT 'research-grants-rls', EXISTS (
    SELECT 1 FROM pg_class WHERE oid=to_regclass('public.research_browser_grants') AND relrowsecurity
  )
  UNION ALL
  SELECT 'research-grants-no-direct-access:' || role_name,
    to_regclass('public.research_browser_grants') IS NOT NULL
    AND NOT COALESCE(has_table_privilege(role_name, to_regclass('public.research_browser_grants'),
      'SELECT,INSERT,UPDATE,DELETE,TRUNCATE,REFERENCES,TRIGGER'), true)
    AND NOT COALESCE(has_any_column_privilege(role_name, to_regclass('public.research_browser_grants'),
      'SELECT,INSERT,UPDATE,REFERENCES'), true)
    FROM unnest(ARRAY['anon','authenticated','service_role']) role_name
  UNION ALL
  SELECT 'research-grants-index:' || name, EXISTS (
    SELECT 1 FROM pg_index WHERE indexrelid=to_regclass('public.' || name)
      AND indrelid=to_regclass('public.research_browser_grants') AND indisvalid AND indisready
  ) FROM unnest(ARRAY['research_browser_grants_pkey',
    'idx_research_browser_grants_session','idx_research_browser_grants_expiry']) name
`;
