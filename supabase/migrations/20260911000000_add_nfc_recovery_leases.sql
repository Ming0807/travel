-- Held scheduling foundation only. No worker, finalization or provider deletion.
CREATE TABLE public.nfc_evidence_recovery_jobs (
  asset_id uuid PRIMARY KEY REFERENCES public.nfc_evidence_upload_intents(asset_id) ON DELETE RESTRICT,
  next_attempt_at timestamptz NOT NULL DEFAULT (clock_timestamp()+interval '5 minutes'),
  attempt_count integer NOT NULL DEFAULT 0 CHECK (attempt_count>=0),
  lease_token uuid,
  lease_expires_at timestamptz,
  last_attempt_at timestamptz,
  last_outcome text CHECK (last_outcome IN ('provider_unavailable','absent','content_conflict','namespace_changed','actor_unavailable','tag_changed')),
  review_required boolean NOT NULL DEFAULT false,
  completed_at timestamptz,
  CHECK ((lease_token IS NULL)=(lease_expires_at IS NULL)),
  CHECK (lease_token IS NULL OR (last_attempt_at IS NOT NULL AND lease_expires_at>last_attempt_at)),
  CHECK (NOT review_required OR lease_token IS NULL),
  CHECK (completed_at IS NULL OR lease_token IS NULL)
);
CREATE INDEX idx_nfc_recovery_due ON public.nfc_evidence_recovery_jobs(next_attempt_at,asset_id)
  WHERE completed_at IS NULL AND NOT review_required;
ALTER TABLE public.nfc_evidence_recovery_jobs ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.nfc_evidence_recovery_jobs FROM PUBLIC,anon,authenticated,service_role;
GRANT SELECT ON public.nfc_evidence_recovery_jobs TO service_role;

CREATE FUNCTION public.enqueue_nfc_evidence_recovery()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path='' AS $$
BEGIN
  INSERT INTO public.nfc_evidence_recovery_jobs(asset_id) VALUES(NEW.asset_id) ON CONFLICT DO NOTHING;
  RETURN NEW;
END;
$$;
CREATE TRIGGER enqueue_nfc_evidence_recovery AFTER INSERT ON public.nfc_evidence_upload_intents
FOR EACH ROW EXECUTE FUNCTION public.enqueue_nfc_evidence_recovery();
INSERT INTO public.nfc_evidence_recovery_jobs(asset_id)
  SELECT asset_id FROM public.nfc_evidence_upload_intents ON CONFLICT DO NOTHING;

CREATE FUNCTION public.claim_nfc_evidence_recovery(p_limit integer DEFAULT 1)
RETURNS SETOF public.nfc_evidence_recovery_jobs
LANGUAGE plpgsql SECURITY DEFINER SET search_path='' AS $$
DECLARE v_id uuid; v_now timestamptz;
BEGIN
  IF p_limit IS NULL OR p_limit<1 OR p_limit>5 THEN RAISE EXCEPTION 'NFC_RECOVERY_LIMIT_INVALID'; END IF;
  FOR v_id IN SELECT j.asset_id FROM public.nfc_evidence_recovery_jobs j
    WHERE j.completed_at IS NULL AND NOT j.review_required AND j.next_attempt_at<=clock_timestamp()
      AND (j.lease_expires_at IS NULL OR j.lease_expires_at<=clock_timestamp())
    ORDER BY j.next_attempt_at,j.asset_id LIMIT p_limit FOR UPDATE SKIP LOCKED
  LOOP
    v_now:=clock_timestamp();
    RETURN QUERY UPDATE public.nfc_evidence_recovery_jobs SET lease_token=gen_random_uuid(),
      lease_expires_at=v_now+interval '2 minutes',last_attempt_at=v_now,attempt_count=attempt_count+1
      WHERE asset_id=v_id RETURNING *;
  END LOOP;
END;
$$;

CREATE FUNCTION public.renew_nfc_evidence_recovery(p_asset_id uuid,p_lease_token uuid)
RETURNS timestamptz LANGUAGE plpgsql SECURITY DEFINER SET search_path='' AS $$
DECLARE v_expiry timestamptz;
BEGIN
  UPDATE public.nfc_evidence_recovery_jobs SET lease_expires_at=clock_timestamp()+interval '2 minutes'
    WHERE asset_id=p_asset_id AND lease_token=p_lease_token AND lease_expires_at>clock_timestamp()
      AND completed_at IS NULL AND NOT review_required RETURNING lease_expires_at INTO v_expiry;
  IF NOT FOUND THEN RAISE EXCEPTION 'NFC_RECOVERY_LEASE_LOST'; END IF;
  RETURN v_expiry;
END;
$$;

CREATE FUNCTION public.defer_nfc_evidence_recovery(p_asset_id uuid,p_lease_token uuid,p_outcome text)
RETURNS boolean LANGUAGE plpgsql SECURITY DEFINER SET search_path='' AS $$
DECLARE v_job public.nfc_evidence_recovery_jobs%ROWTYPE; v_review boolean; v_seconds double precision;
BEGIN
  IF p_outcome IS NULL OR p_outcome NOT IN ('provider_unavailable','absent','content_conflict','namespace_changed','actor_unavailable','tag_changed')
    THEN RAISE EXCEPTION 'NFC_RECOVERY_OUTCOME_INVALID'; END IF;
  SELECT * INTO v_job FROM public.nfc_evidence_recovery_jobs WHERE asset_id=p_asset_id FOR UPDATE;
  IF NOT FOUND OR p_lease_token IS NULL OR v_job.lease_token IS DISTINCT FROM p_lease_token
    OR v_job.lease_expires_at IS NULL OR v_job.lease_expires_at<=clock_timestamp()
    OR v_job.completed_at IS NOT NULL OR v_job.review_required THEN RAISE EXCEPTION 'NFC_RECOVERY_LEASE_LOST'; END IF;
  v_review:=p_outcome IN ('content_conflict','namespace_changed','actor_unavailable','tag_changed');
  -- Backoff is scheduling, never proof that a provider upload has settled.
  v_seconds:=least(3600,30*power(2,least(greatest(v_job.attempt_count-1,0),7))) * (1+random()*0.1);
  UPDATE public.nfc_evidence_recovery_jobs SET lease_token=NULL,lease_expires_at=NULL,
    last_outcome=p_outcome,review_required=v_review,next_attempt_at=clock_timestamp()+v_seconds*interval '1 second'
    WHERE asset_id=p_asset_id;
  RETURN true;
END;
$$;
REVOKE ALL ON FUNCTION public.enqueue_nfc_evidence_recovery() FROM PUBLIC,anon,authenticated,service_role;
REVOKE ALL ON FUNCTION public.claim_nfc_evidence_recovery(integer),public.renew_nfc_evidence_recovery(uuid,uuid),
  public.defer_nfc_evidence_recovery(uuid,uuid,text) FROM PUBLIC,anon,authenticated;
GRANT EXECUTE ON FUNCTION public.claim_nfc_evidence_recovery(integer),public.renew_nfc_evidence_recovery(uuid,uuid),
  public.defer_nfc_evidence_recovery(uuid,uuid,text) TO service_role;
COMMENT ON TABLE public.nfc_evidence_recovery_jobs IS
  'Held lease/backoff scheduling only. Machine authorization required upstream; no completion/finalization RPC or deletion authority yet. Retain abandoned intent jobs for late-arrival reconciliation.';
