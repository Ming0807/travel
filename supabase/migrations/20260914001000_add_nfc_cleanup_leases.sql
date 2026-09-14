-- Held reconciliation scheduling only. No remote deletion or settlement authority.
CREATE TABLE public.nfc_evidence_cleanup_jobs (
  asset_id uuid PRIMARY KEY REFERENCES public.nfc_evidence_cleanup(asset_id) ON DELETE RESTRICT
    REFERENCES public.nfc_evidence_upload_intents(asset_id) ON DELETE RESTRICT,
  next_attempt_at timestamptz NOT NULL DEFAULT clock_timestamp(),
  attempt_count integer NOT NULL DEFAULT 0 CHECK (attempt_count>=0),
  lease_token uuid,
  lease_expires_at timestamptz,
  last_attempt_at timestamptz,
  last_outcome text CHECK (last_outcome IN ('provider_unavailable','absent','content_conflict','namespace_changed','settlement_unproven')),
  review_required boolean NOT NULL DEFAULT false,
  CHECK ((lease_token IS NULL)=(lease_expires_at IS NULL)),
  CHECK (lease_token IS NULL OR (last_attempt_at IS NOT NULL AND lease_expires_at>last_attempt_at)),
  CHECK (NOT review_required OR lease_token IS NULL)
);
CREATE INDEX idx_nfc_cleanup_jobs_due ON public.nfc_evidence_cleanup_jobs(next_attempt_at,asset_id)
  WHERE NOT review_required;
ALTER TABLE public.nfc_evidence_cleanup_jobs ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.nfc_evidence_cleanup_jobs FROM PUBLIC,anon,authenticated,service_role;
GRANT SELECT ON public.nfc_evidence_cleanup_jobs TO service_role;

CREATE FUNCTION public.claim_nfc_cleanup_jobs(p_limit integer DEFAULT 1)
RETURNS SETOF public.nfc_evidence_cleanup_jobs
LANGUAGE plpgsql SECURITY DEFINER SET search_path='' AS $$
DECLARE v_id uuid; v_now timestamptz;
BEGIN
  IF p_limit IS NULL OR p_limit<1 OR p_limit>5 THEN RAISE EXCEPTION 'NFC_CLEANUP_LIMIT_INVALID'; END IF;
  -- Only new, fully bound evidence is admitted. Existing legacy tombstones stay held.
  FOR v_id IN SELECT a.asset_id FROM public.nfc_evidence_assets a
    JOIN public.nfc_evidence_upload_intents i ON i.asset_id=a.asset_id
    WHERE i.state='available' AND i.finalized_at<clock_timestamp()-interval '7 days'
      AND a.created_at<clock_timestamp()-interval '7 days'
      AND ROW(a.nfc_tag_id,a.tag_version,a.actor_id,a.provider,a.storage_path,a.sha256,a.size_bytes,a.width,a.height)
        IS NOT DISTINCT FROM ROW(i.nfc_tag_id,i.tag_version,i.actor_id,i.provider,i.storage_path,i.sha256,i.size_bytes,i.width,i.height)
      AND NOT EXISTS(SELECT 1 FROM public.nfc_field_check_photos p WHERE p.asset_id=a.asset_id)
      AND NOT EXISTS(SELECT 1 FROM public.nfc_evidence_cleanup c WHERE c.asset_id=a.asset_id)
    ORDER BY a.created_at,a.asset_id LIMIT p_limit FOR UPDATE OF a SKIP LOCKED
  LOOP
    -- Fresh snapshot after the same row lock used by report attachment.
    IF NOT EXISTS(SELECT 1 FROM public.nfc_field_check_photos WHERE asset_id=v_id)
      AND NOT EXISTS(SELECT 1 FROM public.nfc_evidence_cleanup WHERE asset_id=v_id) THEN
      INSERT INTO public.nfc_evidence_cleanup(asset_id) VALUES(v_id);
      INSERT INTO public.nfc_evidence_cleanup_jobs(asset_id) VALUES(v_id);
    END IF;
  END LOOP;
  FOR v_id IN SELECT j.asset_id FROM public.nfc_evidence_cleanup_jobs j
    JOIN public.nfc_evidence_cleanup c ON c.asset_id=j.asset_id
    WHERE NOT j.review_required AND c.deleted_at IS NULL AND j.next_attempt_at<=clock_timestamp()
      AND (j.lease_expires_at IS NULL OR j.lease_expires_at<=clock_timestamp())
    ORDER BY j.next_attempt_at,j.asset_id LIMIT p_limit FOR UPDATE OF j SKIP LOCKED
  LOOP
    v_now:=clock_timestamp();
    RETURN QUERY UPDATE public.nfc_evidence_cleanup_jobs SET lease_token=gen_random_uuid(),
      lease_expires_at=v_now+interval '2 minutes',last_attempt_at=v_now,attempt_count=attempt_count+1
      WHERE asset_id=v_id RETURNING *;
  END LOOP;
END;
$$;

CREATE FUNCTION public.read_leased_nfc_cleanup_binding(p_asset_id uuid,p_lease_token uuid)
RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path='' AS $$
DECLARE v_job public.nfc_evidence_cleanup_jobs%ROWTYPE;
  v_asset public.nfc_evidence_assets%ROWTYPE; v_intent public.nfc_evidence_upload_intents%ROWTYPE;
BEGIN
  SELECT * INTO v_job FROM public.nfc_evidence_cleanup_jobs WHERE asset_id=p_asset_id FOR UPDATE;
  IF NOT FOUND OR p_lease_token IS NULL OR v_job.lease_token IS DISTINCT FROM p_lease_token
    OR v_job.lease_expires_at IS NULL OR v_job.lease_expires_at<=clock_timestamp() OR v_job.review_required
    THEN RAISE EXCEPTION 'NFC_CLEANUP_LEASE_LOST'; END IF;
  SELECT * INTO v_asset FROM public.nfc_evidence_assets WHERE asset_id=p_asset_id FOR UPDATE;
  SELECT * INTO v_intent FROM public.nfc_evidence_upload_intents WHERE asset_id=p_asset_id;
  IF v_asset.asset_id IS NULL OR v_intent.asset_id IS NULL OR v_intent.state<>'available'
    OR ROW(v_asset.nfc_tag_id,v_asset.tag_version,v_asset.actor_id,v_asset.provider,v_asset.storage_path,
      v_asset.sha256,v_asset.size_bytes,v_asset.width,v_asset.height)
      IS DISTINCT FROM ROW(v_intent.nfc_tag_id,v_intent.tag_version,v_intent.actor_id,v_intent.provider,
        v_intent.storage_path,v_intent.sha256,v_intent.size_bytes,v_intent.width,v_intent.height)
    OR EXISTS(SELECT 1 FROM public.nfc_field_check_photos WHERE asset_id=p_asset_id)
    OR NOT EXISTS(SELECT 1 FROM public.nfc_evidence_cleanup WHERE asset_id=p_asset_id AND deleted_at IS NULL)
    THEN RAISE EXCEPTION 'NFC_CLEANUP_BINDING_CONFLICT'; END IF;
  IF v_job.lease_expires_at<=clock_timestamp() THEN RAISE EXCEPTION 'NFC_CLEANUP_LEASE_LOST'; END IF;
  RETURN jsonb_build_object('asset_id',v_intent.asset_id,'provider',v_intent.provider,
    'provider_account',v_intent.provider_account,'storage_prefix',v_intent.storage_prefix,
    'object_key',v_intent.object_key,'storage_path',v_intent.storage_path,'sha256',v_intent.sha256,
    'size_bytes',v_intent.size_bytes,'width',v_intent.width,'height',v_intent.height);
END;
$$;

CREATE FUNCTION public.renew_nfc_cleanup_job(p_asset_id uuid,p_lease_token uuid)
RETURNS timestamptz LANGUAGE plpgsql SECURITY DEFINER SET search_path='' AS $$
DECLARE v_job public.nfc_evidence_cleanup_jobs%ROWTYPE; v_expiry timestamptz;
BEGIN
  SELECT * INTO v_job FROM public.nfc_evidence_cleanup_jobs WHERE asset_id=p_asset_id FOR UPDATE;
  IF NOT FOUND OR p_lease_token IS NULL OR v_job.lease_token IS DISTINCT FROM p_lease_token
    OR v_job.lease_expires_at IS NULL OR v_job.lease_expires_at<=clock_timestamp() OR v_job.review_required
    THEN RAISE EXCEPTION 'NFC_CLEANUP_LEASE_LOST'; END IF;
  UPDATE public.nfc_evidence_cleanup_jobs SET lease_expires_at=clock_timestamp()+interval '2 minutes'
    WHERE asset_id=p_asset_id RETURNING lease_expires_at INTO v_expiry;
  RETURN v_expiry;
END;
$$;

CREATE FUNCTION public.defer_nfc_cleanup_job(p_asset_id uuid,p_lease_token uuid,p_outcome text)
RETURNS boolean LANGUAGE plpgsql SECURITY DEFINER SET search_path='' AS $$
DECLARE v_job public.nfc_evidence_cleanup_jobs%ROWTYPE; v_seconds double precision;
BEGIN
  IF p_outcome IS NULL OR p_outcome NOT IN ('provider_unavailable','absent','content_conflict','namespace_changed','settlement_unproven')
    THEN RAISE EXCEPTION 'NFC_CLEANUP_OUTCOME_INVALID'; END IF;
  SELECT * INTO v_job FROM public.nfc_evidence_cleanup_jobs WHERE asset_id=p_asset_id FOR UPDATE;
  IF NOT FOUND OR p_lease_token IS NULL OR v_job.lease_token IS DISTINCT FROM p_lease_token
    OR v_job.lease_expires_at IS NULL OR v_job.lease_expires_at<=clock_timestamp() OR v_job.review_required
    THEN RAISE EXCEPTION 'NFC_CLEANUP_LEASE_LOST'; END IF;
  v_seconds:=least(3600,30*power(2,least(greatest(v_job.attempt_count-1,0),7)))*(1+random()*0.1);
  UPDATE public.nfc_evidence_cleanup_jobs SET lease_token=NULL,lease_expires_at=NULL,last_outcome=p_outcome,
    review_required=p_outcome IN ('content_conflict','namespace_changed','settlement_unproven'),
    next_attempt_at=clock_timestamp()+v_seconds*interval '1 second' WHERE asset_id=p_asset_id;
  RETURN true;
END;
$$;

-- Old asset-only acknowledgements cannot bypass the new fenced lifecycle.
REVOKE ALL ON FUNCTION public.claim_nfc_evidence_cleanup(integer),public.complete_nfc_evidence_cleanup(uuid)
  FROM PUBLIC,anon,authenticated,service_role;
REVOKE ALL ON FUNCTION public.claim_nfc_cleanup_jobs(integer),public.read_leased_nfc_cleanup_binding(uuid,uuid),
  public.renew_nfc_cleanup_job(uuid,uuid),public.defer_nfc_cleanup_job(uuid,uuid,text) FROM PUBLIC,anon,authenticated;
GRANT EXECUTE ON FUNCTION public.claim_nfc_cleanup_jobs(integer),public.read_leased_nfc_cleanup_binding(uuid,uuid),
  public.renew_nfc_cleanup_job(uuid,uuid),public.defer_nfc_cleanup_job(uuid,uuid,text) TO service_role;
COMMENT ON TABLE public.nfc_evidence_cleanup_jobs IS
  'Held machine-only bound evidence reconciliation leases. No provider delete, completion or settlement authority. Legacy/unbound tombstones are not admitted. Production activation requires provider precondition, settlement and staging gates.';
