-- Keep identity linking and its purpose-specific consent in one transaction.
CREATE OR REPLACE FUNCTION public.link_tourist_identity_with_consent(
  p_tourist_id uuid,
  p_provider text,
  p_provider_user_id text,
  p_language text,
  p_consent_version text,
  p_purpose_key text
)
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  v_existing_tourist_id uuid;
  v_status text := 'linked';
BEGIN
  IF p_provider NOT IN ('line', 'google', 'email') THEN
    RAISE EXCEPTION 'UNSUPPORTED_IDENTITY_PROVIDER';
  END IF;

  IF p_purpose_key <> 'passport_recovery' THEN
    RAISE EXCEPTION 'UNSUPPORTED_CONSENT_PURPOSE';
  END IF;

  IF p_language NOT IN ('th', 'en') THEN
    RAISE EXCEPTION 'UNSUPPORTED_CONSENT_LANGUAGE';
  END IF;

  PERFORM pg_advisory_xact_lock(hashtextextended(p_provider || ':' || p_provider_user_id, 0));

  PERFORM 1 FROM public.tourists WHERE tourist_id = p_tourist_id FOR UPDATE;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'TOURIST_IDENTITY_NOT_FOUND';
  END IF;

  SELECT identity.tourist_id
  INTO v_existing_tourist_id
  FROM public.tourist_identities AS identity
  WHERE identity.provider = p_provider
    AND identity.provider_user_id = p_provider_user_id
  FOR UPDATE;

  IF v_existing_tourist_id IS NOT NULL AND v_existing_tourist_id <> p_tourist_id THEN
    RAISE EXCEPTION 'IDENTITY_CONFLICT';
  END IF;

  IF v_existing_tourist_id IS NULL THEN
    INSERT INTO public.tourist_identities (
      tourist_id,
      provider,
      provider_user_id,
      is_primary,
      linked_at,
      last_seen_at
    ) VALUES (
      p_tourist_id,
      p_provider,
      p_provider_user_id,
      false,
      now(),
      now()
    );
  ELSE
    v_status := 'already_linked';
    UPDATE public.tourist_identities
    SET last_seen_at = now(), linked_at = COALESCE(linked_at, now())
    WHERE provider = p_provider
      AND provider_user_id = p_provider_user_id;
  END IF;

  INSERT INTO public.consent_records (
    tourist_id,
    consent_version,
    purpose,
    consent_type,
    purpose_key,
    has_consented,
    source,
    language,
    metadata_json
  ) VALUES (
    p_tourist_id,
    p_consent_version,
    'Optional account linking for digital passport recovery.',
    p_provider || '_account_linking',
    p_purpose_key,
    true,
    CASE WHEN p_provider = 'line' THEN 'line_liff' ELSE 'web' END,
    p_language,
    jsonb_build_object('provider', p_provider, 'status', v_status)
  );

  RETURN v_status;
END;
$$;

-- Resolve or create a provider-backed tourist without consulting a guest cookie.
CREATE OR REPLACE FUNCTION public.resolve_tourist_oauth_identity(
  p_provider text,
  p_provider_user_id text,
  p_display_name text
)
RETURNS TABLE(tourist_id uuid, status text)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  v_tourist_id uuid;
BEGIN
  IF p_provider NOT IN ('line', 'google', 'email') THEN
    RAISE EXCEPTION 'UNSUPPORTED_IDENTITY_PROVIDER';
  END IF;

  PERFORM pg_advisory_xact_lock(hashtextextended(p_provider || ':' || p_provider_user_id, 0));

  SELECT identity.tourist_id
  INTO v_tourist_id
  FROM public.tourist_identities AS identity
  WHERE identity.provider = p_provider
    AND identity.provider_user_id = p_provider_user_id;

  IF v_tourist_id IS NOT NULL THEN
    UPDATE public.tourist_identities
    SET last_seen_at = now()
    WHERE provider = p_provider
      AND provider_user_id = p_provider_user_id;
    RETURN QUERY SELECT v_tourist_id, 'existing'::text;
    RETURN;
  END IF;

  BEGIN
    INSERT INTO public.tourists (display_name, age_group)
    VALUES (COALESCE(NULLIF(trim(p_display_name), ''), 'นักเดินทาง'), 'prefer_not_to_answer')
    RETURNING tourists.tourist_id INTO v_tourist_id;

    INSERT INTO public.tourist_identities (
      tourist_id,
      provider,
      provider_user_id,
      is_primary,
      linked_at,
      last_seen_at
    ) VALUES (
      v_tourist_id,
      p_provider,
      p_provider_user_id,
      true,
      now(),
      now()
    );
  EXCEPTION WHEN unique_violation THEN
    SELECT identity.tourist_id
    INTO v_tourist_id
    FROM public.tourist_identities AS identity
    WHERE identity.provider = p_provider
      AND identity.provider_user_id = p_provider_user_id;

    IF v_tourist_id IS NULL THEN
      RAISE;
    END IF;

    RETURN QUERY SELECT v_tourist_id, 'existing'::text;
    RETURN;
  END;

  RETURN QUERY SELECT v_tourist_id, 'created'::text;
END;
$$;

CREATE OR REPLACE FUNCTION public.recover_tourist_passport_with_line(
  p_line_provider_user_id text,
  p_new_guest_token text,
  p_language text,
  p_consent_version text,
  p_purpose_key text
)
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  v_tourist_id uuid;
BEGIN
  IF p_language NOT IN ('th', 'en') OR p_purpose_key <> 'passport_recovery' THEN
    RAISE EXCEPTION 'INVALID_RECOVERY_CONSENT';
  END IF;

  PERFORM pg_advisory_xact_lock(hashtextextended('line:' || p_line_provider_user_id, 0));

  SELECT identity.tourist_id
  INTO v_tourist_id
  FROM public.tourist_identities AS identity
  WHERE identity.provider = 'line'
    AND identity.provider_user_id = p_line_provider_user_id
  FOR UPDATE;

  IF v_tourist_id IS NULL THEN
    RAISE EXCEPTION 'TOURIST_NOT_FOUND';
  END IF;

  INSERT INTO public.tourist_identities (
    tourist_id,
    provider,
    provider_user_id,
    is_primary,
    linked_at,
    last_seen_at
  ) VALUES (
    v_tourist_id,
    'anonymous_device',
    p_new_guest_token,
    false,
    now(),
    now()
  );

  INSERT INTO public.consent_records (
    tourist_id,
    consent_version,
    purpose,
    consent_type,
    purpose_key,
    has_consented,
    source,
    language,
    metadata_json
  ) VALUES (
    v_tourist_id,
    p_consent_version,
    'Recover an existing digital passport on this device with LINE.',
    'line_passport_recovery',
    p_purpose_key,
    true,
    'line_liff',
    p_language,
    jsonb_build_object('provider', 'line', 'status', 'recovered')
  );

  RETURN 'recovered';
END;
$$;

REVOKE ALL ON FUNCTION public.link_tourist_identity_with_consent(uuid, text, text, text, text, text) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.link_tourist_identity_with_consent(uuid, text, text, text, text, text) FROM anon;
REVOKE ALL ON FUNCTION public.link_tourist_identity_with_consent(uuid, text, text, text, text, text) FROM authenticated;
GRANT EXECUTE ON FUNCTION public.link_tourist_identity_with_consent(uuid, text, text, text, text, text) TO service_role;

REVOKE ALL ON FUNCTION public.resolve_tourist_oauth_identity(text, text, text) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.resolve_tourist_oauth_identity(text, text, text) FROM anon;
REVOKE ALL ON FUNCTION public.resolve_tourist_oauth_identity(text, text, text) FROM authenticated;
GRANT EXECUTE ON FUNCTION public.resolve_tourist_oauth_identity(text, text, text) TO service_role;

REVOKE ALL ON FUNCTION public.recover_tourist_passport_with_line(text, text, text, text, text) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.recover_tourist_passport_with_line(text, text, text, text, text) FROM anon;
REVOKE ALL ON FUNCTION public.recover_tourist_passport_with_line(text, text, text, text, text) FROM authenticated;
GRANT EXECUTE ON FUNCTION public.recover_tourist_passport_with_line(text, text, text, text, text) TO service_role;
