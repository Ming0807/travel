-- Held worker-only read. Finalization must independently recheck current authority.
CREATE FUNCTION public.read_leased_nfc_recovery_intent(p_asset_id uuid,p_lease_token uuid)
RETURNS SETOF public.nfc_evidence_upload_intents
LANGUAGE plpgsql SECURITY DEFINER SET search_path='' AS $$
DECLARE v_job public.nfc_evidence_recovery_jobs%ROWTYPE;
  v_intent public.nfc_evidence_upload_intents%ROWTYPE;
BEGIN
  SELECT * INTO v_job FROM public.nfc_evidence_recovery_jobs WHERE asset_id=p_asset_id FOR UPDATE;
  IF NOT FOUND OR p_lease_token IS NULL OR v_job.lease_token IS DISTINCT FROM p_lease_token
    OR v_job.lease_expires_at IS NULL OR v_job.lease_expires_at<=clock_timestamp()
    OR v_job.completed_at IS NOT NULL OR v_job.review_required THEN RAISE EXCEPTION 'NFC_RECOVERY_LEASE_LOST'; END IF;
  SELECT * INTO v_intent FROM public.nfc_evidence_upload_intents WHERE asset_id=p_asset_id;
  IF NOT FOUND THEN RAISE EXCEPTION 'NFC_UPLOAD_NOT_FOUND'; END IF;
  IF v_job.lease_expires_at<=clock_timestamp() THEN RAISE EXCEPTION 'NFC_RECOVERY_LEASE_LOST'; END IF;
  RETURN NEXT v_intent;
END;
$$;
REVOKE ALL ON FUNCTION public.read_leased_nfc_recovery_intent(uuid,uuid) FROM PUBLIC,anon,authenticated;
GRANT EXECUTE ON FUNCTION public.read_leased_nfc_recovery_intent(uuid,uuid) TO service_role;
COMMENT ON FUNCTION public.read_leased_nfc_recovery_intent(uuid,uuid) IS
  'Held machine-only durable binding read requiring a live fenced lease. Returns no file bytes or signed URLs. Does not renew, finalize, abandon or authorize deletion. Caller must not serialize to browsers.';
