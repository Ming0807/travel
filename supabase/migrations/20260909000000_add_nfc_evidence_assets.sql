-- Private installation evidence, independent of public CMS media.
CREATE TABLE public.nfc_evidence_assets (
  asset_id uuid PRIMARY KEY,
  nfc_tag_id uuid NOT NULL REFERENCES public.nfc_tags(nfc_tag_id) ON DELETE RESTRICT,
  tag_version integer NOT NULL CHECK (tag_version > 0),
  actor_id uuid NOT NULL REFERENCES public.admin_users(admin_id) ON DELETE RESTRICT,
  provider text NOT NULL CHECK (provider IN ('supabase','cloudinary')),
  storage_path text NOT NULL UNIQUE,
  sha256 text NOT NULL CHECK (sha256 ~ '^[0-9a-f]{64}$'),
  size_bytes integer NOT NULL CHECK (size_bytes BETWEEN 1 AND 2097152),
  width integer NOT NULL CHECK (width BETWEEN 1 AND 2560),
  height integer NOT NULL CHECK (height BETWEEN 1 AND 2560),
  created_at timestamptz NOT NULL DEFAULT now(),
  CHECK (
    (provider='supabase' AND storage_path='nfc-evidence/' || asset_id::text || '.webp') OR
    (provider='cloudinary' AND storage_path ~ '^cloudinary:image:authenticated:v[0-9]+:webp:([^/:]+/)*nfc-evidence/[0-9a-f-]+$'
      AND right(storage_path,49)='nfc-evidence/' || asset_id::text
      AND storage_path !~ '\.\.')
  )
);
CREATE INDEX idx_nfc_evidence_assets_created ON public.nfc_evidence_assets(created_at,asset_id);
CREATE INDEX idx_nfc_evidence_assets_tag ON public.nfc_evidence_assets(nfc_tag_id,created_at DESC);
CREATE TABLE public.nfc_field_check_photos (
  request_id uuid NOT NULL REFERENCES public.nfc_field_checks(request_id) ON DELETE RESTRICT,
  asset_id uuid NOT NULL UNIQUE REFERENCES public.nfc_evidence_assets(asset_id) ON DELETE RESTRICT,
  position smallint NOT NULL CHECK (position BETWEEN 1 AND 3),
  PRIMARY KEY(request_id,position)
);
ALTER TABLE public.nfc_evidence_assets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.nfc_field_check_photos ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.nfc_evidence_assets,public.nfc_field_check_photos FROM PUBLIC,anon,authenticated,service_role;
GRANT SELECT ON public.nfc_evidence_assets,public.nfc_field_check_photos TO service_role;
CREATE TRIGGER guard_nfc_evidence_assets BEFORE UPDATE OR DELETE ON public.nfc_evidence_assets
FOR EACH ROW EXECUTE FUNCTION public.guard_nfc_field_check_history();
CREATE TRIGGER guard_nfc_field_check_photos BEFORE UPDATE OR DELETE ON public.nfc_field_check_photos
FOR EACH ROW EXECUTE FUNCTION public.guard_nfc_field_check_history();

CREATE FUNCTION public.register_nfc_evidence_asset(
  p_asset_id uuid,p_tag_id uuid,p_version integer,p_actor_id uuid,p_provider text,
  p_path text,p_sha256 text,p_size integer,p_width integer,p_height integer
) RETURNS uuid LANGUAGE plpgsql SECURITY DEFINER SET search_path='' AS $$
DECLARE v_existing public.nfc_evidence_assets%ROWTYPE; v_version integer;
BEGIN
  IF p_asset_id IS NULL THEN RAISE EXCEPTION 'NFC_EVIDENCE_INPUT_INVALID'; END IF;
  PERFORM pg_advisory_xact_lock(hashtextextended('nfc-evidence:' || p_asset_id::text,0));
  SELECT * INTO v_existing FROM public.nfc_evidence_assets WHERE asset_id=p_asset_id;
  IF FOUND THEN
    IF ROW(v_existing.nfc_tag_id,v_existing.tag_version,v_existing.actor_id,v_existing.provider,
      v_existing.storage_path,v_existing.sha256,v_existing.size_bytes,v_existing.width,v_existing.height)
      IS DISTINCT FROM ROW(p_tag_id,p_version,p_actor_id,p_provider,p_path,p_sha256,p_size,p_width,p_height)
      THEN RAISE EXCEPTION 'NFC_EVIDENCE_REQUEST_CONFLICT'; END IF;
    RETURN p_asset_id;
  END IF;
  SELECT version INTO v_version FROM public.nfc_tags WHERE nfc_tag_id=p_tag_id FOR SHARE;
  IF NOT FOUND THEN RAISE EXCEPTION 'NFC_NOT_FOUND'; END IF;
  IF v_version IS DISTINCT FROM p_version THEN RAISE EXCEPTION 'NFC_VERSION_CONFLICT'; END IF;
  INSERT INTO public.nfc_evidence_assets(asset_id,nfc_tag_id,tag_version,actor_id,provider,
    storage_path,sha256,size_bytes,width,height)
  VALUES(p_asset_id,p_tag_id,p_version,p_actor_id,p_provider,p_path,p_sha256,p_size,p_width,p_height);
  RETURN p_asset_id;
END;
$$;

CREATE FUNCTION public.record_nfc_field_check_with_photos(
  p_request_id uuid,p_tag_id uuid,p_version integer,p_actor_id uuid,p_location text,p_device text,
  p_platform text,p_nfc_result text,p_qr_result text,p_notes text,p_evidence_reference text,p_asset_ids uuid[]
) RETURNS uuid LANGUAGE plpgsql SECURITY DEFINER SET search_path='' AS $$
DECLARE v_existing boolean; v_ids uuid[]; v_asset public.nfc_evidence_assets%ROWTYPE; v_id uuid;
BEGIN
  IF p_request_id IS NULL OR p_asset_ids IS NULL OR cardinality(p_asset_ids)>3
    OR (cardinality(p_asset_ids)>0 AND (array_ndims(p_asset_ids)<>1 OR array_lower(p_asset_ids,1)<>1))
    OR array_position(p_asset_ids,NULL) IS NOT NULL
    OR (SELECT count(DISTINCT id) FROM unnest(p_asset_ids) AS id)<>cardinality(p_asset_ids)
    THEN RAISE EXCEPTION 'NFC_EVIDENCE_INPUT_INVALID'; END IF;
  PERFORM pg_advisory_xact_lock(hashtextextended('nfc-field-check:' || p_request_id::text,0));
  SELECT EXISTS(SELECT 1 FROM public.nfc_field_checks WHERE request_id=p_request_id) INTO v_existing;
  IF v_existing THEN
    SELECT coalesce(array_agg(asset_id ORDER BY position),'{}'::uuid[]) INTO v_ids
      FROM public.nfc_field_check_photos WHERE request_id=p_request_id;
    IF v_ids IS DISTINCT FROM p_asset_ids THEN RAISE EXCEPTION 'NFC_FIELD_REQUEST_CONFLICT'; END IF;
  ELSE
    -- Stable lock order prevents concurrent reports from claiming the same photo.
    FOR v_asset IN SELECT * FROM public.nfc_evidence_assets WHERE asset_id=ANY(p_asset_ids)
      ORDER BY asset_id FOR UPDATE LOOP
      IF v_asset.nfc_tag_id IS DISTINCT FROM p_tag_id OR v_asset.tag_version IS DISTINCT FROM p_version
        OR v_asset.actor_id IS DISTINCT FROM p_actor_id OR v_asset.created_at < now()-interval '24 hours'
        OR EXISTS(SELECT 1 FROM public.nfc_field_check_photos WHERE asset_id=v_asset.asset_id)
        THEN RAISE EXCEPTION 'NFC_EVIDENCE_NOT_AVAILABLE'; END IF;
    END LOOP;
    IF (SELECT count(*) FROM public.nfc_evidence_assets WHERE asset_id=ANY(p_asset_ids))<>cardinality(p_asset_ids)
      THEN RAISE EXCEPTION 'NFC_EVIDENCE_NOT_AVAILABLE'; END IF;
  END IF;
  v_id:=public.record_nfc_field_check(p_request_id,p_tag_id,p_version,p_actor_id,p_location,p_device,
    p_platform,p_nfc_result,p_qr_result,p_notes,p_evidence_reference);
  IF NOT v_existing THEN
    INSERT INTO public.nfc_field_check_photos(request_id,asset_id,position)
      SELECT p_request_id,id,ordinality::smallint FROM unnest(p_asset_ids) WITH ORDINALITY AS assets(id,ordinality);
  END IF;
  RETURN v_id;
END;
$$;
REVOKE ALL ON FUNCTION public.register_nfc_evidence_asset(uuid,uuid,integer,uuid,text,text,text,integer,integer,integer) FROM PUBLIC,anon,authenticated;
GRANT EXECUTE ON FUNCTION public.register_nfc_evidence_asset(uuid,uuid,integer,uuid,text,text,text,integer,integer,integer) TO service_role;
REVOKE ALL ON FUNCTION public.record_nfc_field_check_with_photos(uuid,uuid,integer,uuid,text,text,text,text,text,text,text,uuid[]) FROM PUBLIC,anon,authenticated;
GRANT EXECUTE ON FUNCTION public.record_nfc_field_check_with_photos(uuid,uuid,integer,uuid,text,text,text,text,text,text,text,uuid[]) TO service_role;
COMMENT ON TABLE public.nfc_evidence_assets IS 'Immutable metadata for server-validated private WebP installation photos; no proof of visitor presence. Unclaimed uploads may be attached for 24 hours.';
COMMENT ON TABLE public.nfc_field_check_photos IS 'Ordered immutable evidence, at most three photos per report. Claims are atomic with report creation; retries cannot change photo order or content.';
