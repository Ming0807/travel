-- Held foundation: no live caller, finalization, abandonment, or provider operation.
CREATE TABLE public.nfc_evidence_upload_intents (
  asset_id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  request_id uuid NOT NULL,
  actor_id uuid NOT NULL REFERENCES public.admin_users(admin_id) ON DELETE RESTRICT,
  nfc_tag_id uuid NOT NULL REFERENCES public.nfc_tags(nfc_tag_id) ON DELETE RESTRICT,
  tag_version integer NOT NULL CHECK (tag_version > 0),
  provider text NOT NULL CHECK (provider IN ('supabase','cloudinary')),
  provider_account text NOT NULL CHECK (provider_account ~ '^[A-Za-z0-9][A-Za-z0-9._-]{0,199}$'),
  storage_prefix text NOT NULL,
  object_key text NOT NULL,
  sha256 text NOT NULL CHECK (sha256 ~ '^[0-9a-f]{64}$'),
  size_bytes integer NOT NULL CHECK (size_bytes BETWEEN 1 AND 2097152),
  width integer NOT NULL CHECK (width BETWEEN 1 AND 2560),
  height integer NOT NULL CHECK (height BETWEEN 1 AND 2560),
  state text NOT NULL DEFAULT 'prepared' CHECK (state='prepared'),
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(actor_id,request_id),
  UNIQUE(provider,provider_account,object_key),
  CHECK (
    (provider='supabase' AND storage_prefix='nfc-evidence'
      AND object_key='nfc-evidence/' || asset_id::text || '.webp') OR
    (provider='cloudinary' AND length(storage_prefix)<=200
      AND storage_prefix ~ '^([A-Za-z0-9_-]+/)*nfc-evidence$'
      AND object_key=storage_prefix || '/' || asset_id::text)
  )
);
CREATE INDEX idx_nfc_upload_intents_actor_pending
  ON public.nfc_evidence_upload_intents(actor_id,created_at,asset_id) WHERE state='prepared';
ALTER TABLE public.nfc_evidence_upload_intents ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.nfc_evidence_upload_intents FROM PUBLIC,anon,authenticated,service_role;
GRANT SELECT ON public.nfc_evidence_upload_intents TO service_role;

CREATE FUNCTION public.prepare_nfc_evidence_upload(
  p_request_id uuid,p_tag_id uuid,p_version integer,p_actor_id uuid,p_provider text,
  p_account text,p_prefix text,p_sha256 text,p_size integer,p_width integer,p_height integer
) RETURNS SETOF public.nfc_evidence_upload_intents
LANGUAGE plpgsql SECURITY DEFINER SET search_path='' AS $$
DECLARE v_existing public.nfc_evidence_upload_intents%ROWTYPE;
  v_asset_id uuid; v_tag public.nfc_tags%ROWTYPE;
BEGIN
  IF p_request_id IS NULL OR p_tag_id IS NULL OR p_actor_id IS NULL
    OR p_version IS NULL OR p_version<1
    OR p_provider IS NULL OR p_provider NOT IN ('supabase','cloudinary')
    OR p_account IS NULL OR p_account !~ '^[A-Za-z0-9][A-Za-z0-9._-]{0,199}$'
    OR p_prefix IS NULL OR length(p_prefix)>200
    OR (p_provider='supabase' AND p_prefix<>'nfc-evidence')
    OR (p_provider='cloudinary' AND p_prefix !~ '^([A-Za-z0-9_-]+/)*nfc-evidence$')
    OR p_sha256 IS NULL OR p_sha256 !~ '^[0-9a-f]{64}$'
    OR p_size IS NULL OR p_size NOT BETWEEN 1 AND 2097152
    OR p_width IS NULL OR p_width NOT BETWEEN 1 AND 2560
    OR p_height IS NULL OR p_height NOT BETWEEN 1 AND 2560
    THEN RAISE EXCEPTION 'NFC_UPLOAD_INPUT_INVALID'; END IF;

  -- Serialize both same-request retries and per-actor queue admission.
  PERFORM pg_catalog.pg_advisory_xact_lock(pg_catalog.hashtextextended('nfc-upload-actor:' || p_actor_id::text,0));
  PERFORM 1 FROM public.admin_users WHERE admin_id=p_actor_id AND is_active FOR SHARE;
  IF NOT FOUND THEN RAISE EXCEPTION 'NFC_UPLOAD_ACTOR_UNAVAILABLE'; END IF;
  SELECT * INTO v_existing FROM public.nfc_evidence_upload_intents
    WHERE actor_id=p_actor_id AND request_id=p_request_id;
  IF FOUND AND ROW(v_existing.nfc_tag_id,v_existing.tag_version,v_existing.provider,
    v_existing.provider_account,v_existing.storage_prefix,v_existing.sha256,
    v_existing.size_bytes,v_existing.width,v_existing.height)
    IS DISTINCT FROM ROW(p_tag_id,p_version,p_provider,p_account,p_prefix,p_sha256,p_size,p_width,p_height)
    THEN RAISE EXCEPTION 'NFC_UPLOAD_REQUEST_CONFLICT'; END IF;

  SELECT * INTO v_tag FROM public.nfc_tags WHERE nfc_tag_id=p_tag_id FOR SHARE;
  IF NOT FOUND OR v_tag.status='revoked' THEN RAISE EXCEPTION 'NFC_UPLOAD_TAG_UNAVAILABLE'; END IF;
  IF v_tag.version IS DISTINCT FROM p_version THEN RAISE EXCEPTION 'NFC_VERSION_CONFLICT'; END IF;
  IF v_existing.asset_id IS NOT NULL THEN
    RETURN NEXT v_existing; RETURN;
  END IF;
  IF (SELECT count(*) FROM public.nfc_evidence_upload_intents WHERE actor_id=p_actor_id AND state='prepared')>=20
    THEN RAISE EXCEPTION 'NFC_UPLOAD_PENDING_LIMIT'; END IF;
  v_asset_id:=gen_random_uuid();
  INSERT INTO public.nfc_evidence_upload_intents(asset_id,request_id,actor_id,nfc_tag_id,tag_version,
    provider,provider_account,storage_prefix,object_key,sha256,size_bytes,width,height)
  VALUES(v_asset_id,p_request_id,p_actor_id,p_tag_id,p_version,p_provider,p_account,p_prefix,
    p_prefix || '/' || v_asset_id::text || CASE WHEN p_provider='supabase' THEN '.webp' ELSE '' END,
    p_sha256,p_size,p_width,p_height) RETURNING * INTO v_existing;
  RETURN NEXT v_existing;
END;
$$;
REVOKE ALL ON FUNCTION public.prepare_nfc_evidence_upload(uuid,uuid,integer,uuid,text,text,text,text,integer,integer,integer)
  FROM PUBLIC,anon,authenticated;
GRANT EXECUTE ON FUNCTION public.prepare_nfc_evidence_upload(uuid,uuid,integer,uuid,text,text,text,text,integer,integer,integer)
  TO service_role;
COMMENT ON TABLE public.nfc_evidence_upload_intents IS
  'Held private upload preparation foundation. Same actor/request binds exact processed content and provider namespace. No remote URL, credential or original photo. No runtime activation until finalize/abandon/reconciliation gates pass.';
COMMENT ON FUNCTION public.prepare_nfc_evidence_upload(uuid,uuid,integer,uuid,text,text,text,text,integer,integer,integer) IS
  'Service-only; caller must verify checkin_code.manage using the current session. Database rechecks active actor, live tag version, retry binding and bounded pending admission. Preparation alone is not permission to attach evidence.';
