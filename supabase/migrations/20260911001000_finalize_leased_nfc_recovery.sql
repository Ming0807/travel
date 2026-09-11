-- Held worker-only transaction. Caller must verify machine auth and remote bytes.
CREATE FUNCTION public.finalize_leased_nfc_recovery(
  p_asset_id uuid,p_lease_token uuid,p_account text,p_path text,p_sha256 text,
  p_size integer,p_width integer,p_height integer
) RETURNS uuid LANGUAGE plpgsql SECURITY DEFINER SET search_path='' AS $$
DECLARE v_job public.nfc_evidence_recovery_jobs%ROWTYPE; v_actor uuid; v_result uuid;
BEGIN
  SELECT * INTO v_job FROM public.nfc_evidence_recovery_jobs WHERE asset_id=p_asset_id FOR UPDATE;
  IF NOT FOUND OR p_lease_token IS NULL OR v_job.lease_token IS DISTINCT FROM p_lease_token
    OR v_job.lease_expires_at IS NULL OR v_job.lease_expires_at<=clock_timestamp()
    OR v_job.completed_at IS NOT NULL OR v_job.review_required THEN RAISE EXCEPTION 'NFC_RECOVERY_LEASE_LOST'; END IF;
  SELECT actor_id INTO v_actor FROM public.nfc_evidence_upload_intents WHERE asset_id=p_asset_id;
  IF NOT FOUND THEN RAISE EXCEPTION 'NFC_UPLOAD_NOT_FOUND'; END IF;
  -- Reuse binding/actor/tag/cleanup checks; never accept a scheduler-supplied owner.
  v_result:=public.finalize_nfc_evidence_upload(p_asset_id,v_actor,p_account,p_path,p_sha256,p_size,p_width,p_height);
  -- Finalization may wait on another transaction. Expired authority rolls back
  -- the asset insert and intent transition together with this entire statement.
  IF v_job.lease_expires_at<=clock_timestamp() THEN RAISE EXCEPTION 'NFC_RECOVERY_LEASE_LOST'; END IF;
  UPDATE public.nfc_evidence_recovery_jobs SET completed_at=clock_timestamp(),lease_token=NULL,lease_expires_at=NULL
    WHERE asset_id=p_asset_id;
  RETURN v_result;
END;
$$;
REVOKE ALL ON FUNCTION public.finalize_leased_nfc_recovery(uuid,uuid,text,text,text,integer,integer,integer) FROM PUBLIC,anon,authenticated;
GRANT EXECUTE ON FUNCTION public.finalize_leased_nfc_recovery(uuid,uuid,text,text,text,integer,integer,integer) TO service_role;
COMMENT ON FUNCTION public.finalize_leased_nfc_recovery(uuid,uuid,text,text,text,integer,integer,integer) IS
  'Held machine-authorized exact-content finalization. Requires live fenced lease before and after authoritative finalization; atomically completes recovery. SQL cannot verify remote bytes. No deletion authority.';
