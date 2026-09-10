-- Held lifecycle foundation. Provider identity/content verification remains a server responsibility.
ALTER TABLE public.nfc_evidence_upload_intents
  DROP CONSTRAINT nfc_evidence_upload_intents_state_check,
  ADD COLUMN finalized_at timestamptz,
  ADD COLUMN abandoned_at timestamptz,
  ADD COLUMN storage_path text,
  ADD CHECK (state IN ('prepared','available','abandoned')),
  ADD CHECK (
    (state='prepared' AND finalized_at IS NULL AND abandoned_at IS NULL AND storage_path IS NULL) OR
    (state='available' AND finalized_at IS NOT NULL AND finalized_at>=created_at AND abandoned_at IS NULL AND storage_path IS NOT NULL) OR
    (state='abandoned' AND abandoned_at IS NOT NULL AND abandoned_at>=created_at AND finalized_at IS NULL AND storage_path IS NULL)
  );

CREATE FUNCTION public.guard_nfc_upload_intent_history()
RETURNS trigger LANGUAGE plpgsql SET search_path='' AS $$
BEGIN
  IF TG_OP='DELETE' THEN RAISE EXCEPTION 'NFC_UPLOAD_HISTORY_IMMUTABLE'; END IF;
  IF NEW IS NOT DISTINCT FROM OLD THEN RETURN NEW; END IF;
  IF ROW(NEW.asset_id,NEW.request_id,NEW.actor_id,NEW.nfc_tag_id,NEW.tag_version,NEW.provider,
    NEW.provider_account,NEW.storage_prefix,NEW.object_key,NEW.sha256,NEW.size_bytes,NEW.width,NEW.height,NEW.created_at)
    IS DISTINCT FROM ROW(OLD.asset_id,OLD.request_id,OLD.actor_id,OLD.nfc_tag_id,OLD.tag_version,OLD.provider,
    OLD.provider_account,OLD.storage_prefix,OLD.object_key,OLD.sha256,OLD.size_bytes,OLD.width,OLD.height,OLD.created_at)
    OR OLD.state<>'prepared' OR NEW.state NOT IN ('available','abandoned')
    THEN RAISE EXCEPTION 'NFC_UPLOAD_HISTORY_IMMUTABLE'; END IF;
  RETURN NEW;
END;
$$;
CREATE TRIGGER guard_nfc_upload_intent_history BEFORE UPDATE OR DELETE ON public.nfc_evidence_upload_intents
FOR EACH ROW EXECUTE FUNCTION public.guard_nfc_upload_intent_history();

CREATE FUNCTION public.guard_nfc_intent_asset_insert()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path='' AS $$
DECLARE v_intent public.nfc_evidence_upload_intents%ROWTYPE;
BEGIN
  SELECT * INTO v_intent FROM public.nfc_evidence_upload_intents WHERE asset_id=NEW.asset_id;
  IF FOUND AND (v_intent.state<>'available' OR
    ROW(NEW.nfc_tag_id,NEW.tag_version,NEW.actor_id,NEW.provider,NEW.storage_path,NEW.sha256,NEW.size_bytes,NEW.width,NEW.height)
    IS DISTINCT FROM ROW(v_intent.nfc_tag_id,v_intent.tag_version,v_intent.actor_id,v_intent.provider,
      v_intent.storage_path,v_intent.sha256,v_intent.size_bytes,v_intent.width,v_intent.height))
    THEN RAISE EXCEPTION 'NFC_UPLOAD_FINALIZE_REQUIRED'; END IF;
  RETURN NEW;
END;
$$;
CREATE TRIGGER guard_nfc_intent_asset_insert BEFORE INSERT ON public.nfc_evidence_assets
FOR EACH ROW EXECUTE FUNCTION public.guard_nfc_intent_asset_insert();

CREATE FUNCTION public.finalize_nfc_evidence_upload(
  p_asset_id uuid,p_actor_id uuid,p_account text,p_path text,p_sha256 text,p_size integer,p_width integer,p_height integer
) RETURNS uuid LANGUAGE plpgsql SECURITY DEFINER SET search_path='' AS $$
DECLARE v_intent public.nfc_evidence_upload_intents%ROWTYPE; v_tag public.nfc_tags%ROWTYPE;
  v_existing public.nfc_evidence_assets%ROWTYPE;
BEGIN
  IF p_asset_id IS NULL OR p_actor_id IS NULL THEN RAISE EXCEPTION 'NFC_UPLOAD_INPUT_INVALID'; END IF;
  PERFORM pg_catalog.pg_advisory_xact_lock(pg_catalog.hashtextextended('nfc-evidence:' || p_asset_id::text,0));
  PERFORM 1 FROM public.admin_users WHERE admin_id=p_actor_id AND is_active FOR SHARE;
  IF NOT FOUND THEN RAISE EXCEPTION 'NFC_UPLOAD_ACTOR_UNAVAILABLE'; END IF;
  SELECT * INTO v_intent FROM public.nfc_evidence_upload_intents WHERE asset_id=p_asset_id FOR UPDATE;
  IF NOT FOUND THEN RAISE EXCEPTION 'NFC_UPLOAD_NOT_FOUND'; END IF;
  IF ROW(v_intent.actor_id,v_intent.provider_account,v_intent.sha256,v_intent.size_bytes,v_intent.width,v_intent.height)
    IS DISTINCT FROM ROW(p_actor_id,p_account,p_sha256,p_size,p_width,p_height)
    OR p_path IS NULL
    OR (v_intent.provider='supabase' AND p_path<>v_intent.object_key)
    OR (v_intent.provider='cloudinary' AND (
      p_path !~ '^cloudinary:image:authenticated:v[1-9][0-9]{0,15}:webp:' OR
      regexp_replace(p_path,'^cloudinary:image:authenticated:v[1-9][0-9]{0,15}:webp:','')<>v_intent.object_key))
    THEN RAISE EXCEPTION 'NFC_UPLOAD_FINALIZE_CONFLICT'; END IF;
  IF v_intent.state='abandoned' THEN RAISE EXCEPTION 'NFC_UPLOAD_ABANDONED'; END IF;
  SELECT * INTO v_tag FROM public.nfc_tags WHERE nfc_tag_id=v_intent.nfc_tag_id FOR SHARE;
  IF NOT FOUND OR v_tag.status='revoked' THEN RAISE EXCEPTION 'NFC_UPLOAD_TAG_UNAVAILABLE'; END IF;
  IF v_tag.version IS DISTINCT FROM v_intent.tag_version THEN RAISE EXCEPTION 'NFC_VERSION_CONFLICT'; END IF;
  SELECT * INTO v_existing FROM public.nfc_evidence_assets WHERE asset_id=p_asset_id FOR UPDATE;
  IF v_intent.state='available' THEN
    IF v_existing.asset_id IS NULL OR v_intent.storage_path IS DISTINCT FROM p_path
      OR EXISTS(SELECT 1 FROM public.nfc_evidence_cleanup WHERE asset_id=p_asset_id)
      THEN RAISE EXCEPTION 'NFC_UPLOAD_NOT_AVAILABLE'; END IF;
    RETURN p_asset_id;
  END IF;
  IF v_intent.created_at<clock_timestamp()-interval '24 hours' THEN RAISE EXCEPTION 'NFC_UPLOAD_EXPIRED'; END IF;
  IF v_existing.asset_id IS NOT NULL THEN RAISE EXCEPTION 'NFC_UPLOAD_FINALIZE_CONFLICT'; END IF;
  UPDATE public.nfc_evidence_upload_intents SET state='available',finalized_at=clock_timestamp(),storage_path=p_path
    WHERE asset_id=p_asset_id;
  INSERT INTO public.nfc_evidence_assets(asset_id,nfc_tag_id,tag_version,actor_id,provider,storage_path,sha256,size_bytes,width,height)
    VALUES(p_asset_id,v_intent.nfc_tag_id,v_intent.tag_version,p_actor_id,v_intent.provider,p_path,p_sha256,p_size,p_width,p_height);
  RETURN p_asset_id;
END;
$$;

CREATE FUNCTION public.abandon_stale_nfc_evidence_upload(p_asset_id uuid,p_operator_id uuid)
RETURNS boolean LANGUAGE plpgsql SECURITY DEFINER SET search_path='' AS $$
DECLARE v_intent public.nfc_evidence_upload_intents%ROWTYPE;
BEGIN
  IF p_asset_id IS NULL OR p_operator_id IS NULL THEN RAISE EXCEPTION 'NFC_UPLOAD_INPUT_INVALID'; END IF;
  PERFORM pg_catalog.pg_advisory_xact_lock(pg_catalog.hashtextextended('nfc-evidence:' || p_asset_id::text,0));
  PERFORM 1 FROM public.admin_users WHERE admin_id=p_operator_id AND is_active FOR SHARE;
  IF NOT FOUND THEN RAISE EXCEPTION 'NFC_UPLOAD_ACTOR_UNAVAILABLE'; END IF;
  SELECT * INTO v_intent FROM public.nfc_evidence_upload_intents WHERE asset_id=p_asset_id FOR UPDATE;
  IF NOT FOUND THEN RAISE EXCEPTION 'NFC_UPLOAD_NOT_FOUND'; END IF;
  IF v_intent.state='abandoned' THEN RETURN true; END IF;
  IF v_intent.state<>'prepared' OR EXISTS(SELECT 1 FROM public.nfc_evidence_assets WHERE asset_id=p_asset_id)
    THEN RAISE EXCEPTION 'NFC_UPLOAD_NOT_ABANDONABLE'; END IF;
  IF v_intent.created_at>=clock_timestamp()-interval '24 hours' THEN RAISE EXCEPTION 'NFC_UPLOAD_NOT_STALE'; END IF;
  UPDATE public.nfc_evidence_upload_intents SET state='abandoned',abandoned_at=clock_timestamp() WHERE asset_id=p_asset_id;
  RETURN true;
END;
$$;
REVOKE ALL ON FUNCTION public.guard_nfc_upload_intent_history(),public.guard_nfc_intent_asset_insert() FROM PUBLIC,anon,authenticated,service_role;
REVOKE ALL ON FUNCTION public.finalize_nfc_evidence_upload(uuid,uuid,text,text,text,integer,integer,integer),
  public.abandon_stale_nfc_evidence_upload(uuid,uuid) FROM PUBLIC,anon,authenticated;
GRANT EXECUTE ON FUNCTION public.finalize_nfc_evidence_upload(uuid,uuid,text,text,text,integer,integer,integer),
  public.abandon_stale_nfc_evidence_upload(uuid,uuid) TO service_role;
COMMENT ON FUNCTION public.finalize_nfc_evidence_upload(uuid,uuid,text,text,text,integer,integer,integer) IS
  'Held service-only transaction. Caller must authorize current checkin_code.manage and verify exact private provider content/account before finalization. SQL checks durable binding but cannot inspect remote bytes.';
COMMENT ON FUNCTION public.abandon_stale_nfc_evidence_upload(uuid,uuid) IS
  'Held service-only operator action; caller must authorize checkin_code.manage. The 24-hour stale boundary stops finalization, NOT proof of provider settlement or permission to delete. Tombstones must be retained for late-arrival reconciliation.';
