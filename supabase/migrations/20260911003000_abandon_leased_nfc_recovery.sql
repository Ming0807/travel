-- Held worker transition only: retain the job and tombstone for late arrivals.
CREATE FUNCTION public.abandon_leased_nfc_recovery(p_asset_id uuid,p_lease_token uuid)
RETURNS boolean LANGUAGE plpgsql SECURITY DEFINER SET search_path='' AS $$
DECLARE v_job public.nfc_evidence_recovery_jobs%ROWTYPE; v_actor uuid;
BEGIN
  SELECT * INTO v_job FROM public.nfc_evidence_recovery_jobs WHERE asset_id=p_asset_id FOR UPDATE;
  IF NOT FOUND OR p_lease_token IS NULL OR v_job.lease_token IS DISTINCT FROM p_lease_token
    OR v_job.lease_expires_at IS NULL OR v_job.lease_expires_at<=clock_timestamp()
    OR v_job.completed_at IS NOT NULL OR v_job.review_required THEN RAISE EXCEPTION 'NFC_RECOVERY_LEASE_LOST'; END IF;
  SELECT actor_id INTO v_actor FROM public.nfc_evidence_upload_intents WHERE asset_id=p_asset_id;
  IF NOT FOUND THEN RAISE EXCEPTION 'NFC_UPLOAD_NOT_FOUND'; END IF;
  PERFORM public.abandon_stale_nfc_evidence_upload(p_asset_id,v_actor);
  -- A lock wait inside the transition must not let expired authority commit.
  IF v_job.lease_expires_at<=clock_timestamp() THEN RAISE EXCEPTION 'NFC_RECOVERY_LEASE_LOST'; END IF;
  RETURN true;
END;
$$;
REVOKE ALL ON FUNCTION public.abandon_leased_nfc_recovery(uuid,uuid) FROM PUBLIC,anon,authenticated;
GRANT EXECUTE ON FUNCTION public.abandon_leased_nfc_recovery(uuid,uuid) TO service_role;
COMMENT ON FUNCTION public.abandon_leased_nfc_recovery(uuid,uuid) IS
  'Held machine-authorized stale-intent transition with live lease fencing. Original actor must remain active. Keeps job and lease for reconciliation/defer; not completion, remote deletion or provider settlement proof.';
