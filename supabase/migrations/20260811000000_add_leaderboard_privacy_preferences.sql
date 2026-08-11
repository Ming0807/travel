-- Purpose-specific public leaderboard preference. Private is the safe default.
ALTER TABLE public.tourists
  ADD COLUMN IF NOT EXISTS leaderboard_visibility text NOT NULL DEFAULT 'private',
  ADD COLUMN IF NOT EXISTS leaderboard_alias text;

ALTER TABLE public.tourists
  DROP CONSTRAINT IF EXISTS tourists_leaderboard_visibility_check;

ALTER TABLE public.tourists
  ADD CONSTRAINT tourists_leaderboard_visibility_check
  CHECK (leaderboard_visibility IN ('private', 'alias', 'display_name'));

ALTER TABLE public.tourists
  DROP CONSTRAINT IF EXISTS tourists_leaderboard_alias_check;

ALTER TABLE public.tourists
  ADD CONSTRAINT tourists_leaderboard_alias_check
  CHECK (
    leaderboard_alias IS NULL
    OR (
      char_length(leaderboard_alias) BETWEEN 3 AND 40
      AND leaderboard_alias = btrim(leaderboard_alias)
      AND leaderboard_alias !~ '[[:cntrl:]]'
      AND leaderboard_alias !~* 'https?://'
    )
  );

CREATE INDEX IF NOT EXISTS idx_tourists_public_leaderboard
  ON public.tourists(leaderboard_visibility, tourist_id)
  WHERE leaderboard_visibility <> 'private';

COMMENT ON COLUMN public.tourists.leaderboard_visibility IS
  'Purpose-specific public leaderboard preference: private, alias, or display_name.';

COMMENT ON COLUMN public.tourists.leaderboard_alias IS
  'Optional public alias used only when leaderboard_visibility is alias.';

CREATE OR REPLACE FUNCTION public.set_tourist_leaderboard_preference(
  p_tourist_id uuid,
  p_visibility text,
  p_alias text DEFAULT NULL,
  p_consent_version text DEFAULT 'leaderboard-privacy-v1',
  p_source text DEFAULT 'tourist_profile'
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  v_alias text;
BEGIN
  IF p_visibility NOT IN ('private', 'alias', 'display_name') THEN
    RAISE EXCEPTION 'INVALID_LEADERBOARD_VISIBILITY';
  END IF;

  v_alias := NULLIF(regexp_replace(btrim(COALESCE(p_alias, '')), '\s+', ' ', 'g'), '');

  IF p_visibility = 'alias' AND v_alias IS NOT NULL AND (
    char_length(v_alias) NOT BETWEEN 3 AND 40
    OR v_alias ~ '[[:cntrl:]]'
    OR v_alias ~* 'https?://'
  ) THEN
    RAISE EXCEPTION 'INVALID_LEADERBOARD_ALIAS';
  END IF;

  UPDATE public.tourists
  SET leaderboard_visibility = p_visibility,
      leaderboard_alias = CASE WHEN p_visibility = 'alias' THEN v_alias ELSE NULL END,
      updated_at = now()
  WHERE tourist_id = p_tourist_id;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'TOURIST_NOT_FOUND';
  END IF;

  INSERT INTO public.consent_records (
    tourist_id,
    consent_version,
    purpose,
    consent_type,
    purpose_key,
    has_consented,
    source,
    metadata_json
  ) VALUES (
    p_tourist_id,
    p_consent_version,
    'การแสดงข้อมูลในกระดานผู้นำสาธารณะ',
    'public_profile',
    'leaderboard_public_profile',
    p_visibility <> 'private',
    p_source,
    jsonb_build_object('visibility', p_visibility)
  );
END;
$$;

REVOKE ALL ON FUNCTION public.set_tourist_leaderboard_preference(uuid, text, text, text, text)
  FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.set_tourist_leaderboard_preference(uuid, text, text, text, text)
  TO service_role;

-- Historical snapshots may contain certificate display names collected before opt-in existed.
DELETE FROM public.leaderboard_snapshots;
