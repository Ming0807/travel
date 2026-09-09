-- Durable cleanup claims retain asset metadata and never select report evidence.
CREATE TABLE public.nfc_evidence_cleanup (
  asset_id uuid PRIMARY KEY REFERENCES public.nfc_evidence_assets(asset_id) ON DELETE RESTRICT,
  queued_at timestamptz NOT NULL DEFAULT now(),
  deleted_at timestamptz,
  CHECK (deleted_at IS NULL OR deleted_at >= queued_at)
);
CREATE INDEX idx_nfc_evidence_cleanup_pending ON public.nfc_evidence_cleanup(queued_at,asset_id) WHERE deleted_at IS NULL;
ALTER TABLE public.nfc_evidence_cleanup ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.nfc_evidence_cleanup FROM PUBLIC,anon,authenticated,service_role;
GRANT SELECT ON public.nfc_evidence_cleanup TO service_role;

CREATE FUNCTION public.guard_nfc_photo_cleanup_claim()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path='' AS $$
BEGIN
  -- Same asset-row lock as report claims and cleanup selection.
  PERFORM 1 FROM public.nfc_evidence_assets WHERE asset_id=NEW.asset_id FOR UPDATE;
  IF EXISTS(SELECT 1 FROM public.nfc_evidence_cleanup WHERE asset_id=NEW.asset_id) THEN
    RAISE EXCEPTION 'NFC_EVIDENCE_NOT_AVAILABLE';
  END IF;
  RETURN NEW;
END;
$$;
CREATE TRIGGER guard_nfc_photo_cleanup_claim BEFORE INSERT ON public.nfc_field_check_photos
FOR EACH ROW EXECUTE FUNCTION public.guard_nfc_photo_cleanup_claim();
REVOKE ALL ON FUNCTION public.guard_nfc_photo_cleanup_claim() FROM PUBLIC,anon,authenticated,service_role;

CREATE FUNCTION public.claim_nfc_evidence_cleanup(p_limit integer DEFAULT 25)
RETURNS TABLE(asset_id uuid,provider text,storage_path text)
LANGUAGE plpgsql SECURITY DEFINER SET search_path='' AS $$
DECLARE v_asset uuid; v_available integer;
BEGIN
  IF p_limit IS NULL OR p_limit<1 OR p_limit>100 THEN RAISE EXCEPTION 'NFC_CLEANUP_LIMIT_INVALID'; END IF;
  -- Serialize queue admission; unfinished provider work consumes batch capacity.
  PERFORM pg_catalog.pg_advisory_xact_lock(pg_catalog.hashtextextended('nfc-evidence-cleanup-admission',0));
  SELECT greatest(0,p_limit-count(*)::integer) INTO v_available
    FROM public.nfc_evidence_cleanup c WHERE c.deleted_at IS NULL;
  -- Retain 7 days before cleanup, longer than the 24-hour attachment window.
  FOR v_asset IN SELECT a.asset_id FROM public.nfc_evidence_assets a
    WHERE a.created_at < now()-interval '7 days'
      AND NOT EXISTS(SELECT 1 FROM public.nfc_field_check_photos p WHERE p.asset_id=a.asset_id)
      AND NOT EXISTS(SELECT 1 FROM public.nfc_evidence_cleanup c WHERE c.asset_id=a.asset_id)
    ORDER BY a.created_at,a.asset_id LIMIT v_available FOR UPDATE OF a SKIP LOCKED
  LOOP
    -- Recheck in a fresh statement after the row lock, including concurrent attachments.
    IF NOT EXISTS(SELECT 1 FROM public.nfc_field_check_photos p WHERE p.asset_id=v_asset) THEN
      INSERT INTO public.nfc_evidence_cleanup(asset_id) VALUES(v_asset) ON CONFLICT DO NOTHING;
    END IF;
  END LOOP;
  -- Claims persist across crashes; repeated storage deletion is idempotent.
  RETURN QUERY SELECT a.asset_id,a.provider,a.storage_path
    FROM public.nfc_evidence_cleanup c JOIN public.nfc_evidence_assets a ON a.asset_id=c.asset_id
    WHERE c.deleted_at IS NULL ORDER BY c.queued_at,c.asset_id LIMIT p_limit;
END;
$$;
CREATE FUNCTION public.complete_nfc_evidence_cleanup(p_asset_id uuid)
RETURNS boolean LANGUAGE plpgsql SECURITY DEFINER SET search_path='' AS $$
BEGIN
  IF p_asset_id IS NULL THEN RAISE EXCEPTION 'NFC_CLEANUP_INPUT_INVALID'; END IF;
  UPDATE public.nfc_evidence_cleanup SET deleted_at=coalesce(deleted_at,now()) WHERE asset_id=p_asset_id;
  RETURN FOUND;
END;
$$;
REVOKE ALL ON FUNCTION public.claim_nfc_evidence_cleanup(integer) FROM PUBLIC,anon,authenticated;
GRANT EXECUTE ON FUNCTION public.claim_nfc_evidence_cleanup(integer) TO service_role;
REVOKE ALL ON FUNCTION public.complete_nfc_evidence_cleanup(uuid) FROM PUBLIC,anon,authenticated;
GRANT EXECUTE ON FUNCTION public.complete_nfc_evidence_cleanup(uuid) TO service_role;
COMMENT ON TABLE public.nfc_evidence_cleanup IS 'Durable tombstones for unclaimed installation images older than seven days. deleted_at is set only after provider deletion succeeds. Metadata and report photos are retained.';
