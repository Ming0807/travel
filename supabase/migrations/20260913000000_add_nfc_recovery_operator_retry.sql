-- HELD: schedules verification only. No worker activation, evidence override or provider I/O.
CREATE TABLE public.nfc_evidence_recovery_retry_requests (
  request_id uuid PRIMARY KEY,
  asset_id uuid NOT NULL REFERENCES public.nfc_evidence_recovery_jobs(asset_id) ON DELETE RESTRICT,
  nfc_tag_id uuid NOT NULL REFERENCES public.nfc_tags(nfc_tag_id) ON DELETE RESTRICT,
  operator_id uuid NOT NULL REFERENCES public.admin_users(admin_id) ON DELETE RESTRICT,
  attempt_count integer NOT NULL CHECK (attempt_count>=0),
  reason text NOT NULL CHECK (reason IN ('provider_restored','connectivity_restored','recheck_requested')),
  requested_at timestamptz NOT NULL DEFAULT clock_timestamp(),
  scheduled_at timestamptz NOT NULL,
  UNIQUE(asset_id,attempt_count)
);
ALTER TABLE public.nfc_evidence_recovery_retry_requests ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.nfc_evidence_recovery_retry_requests FROM PUBLIC,anon,authenticated,service_role;
GRANT SELECT ON public.nfc_evidence_recovery_retry_requests TO service_role;
ALTER TABLE public.nfc_evidence_recovery_events DROP CONSTRAINT nfc_evidence_recovery_events_event_type_check,
  ADD CONSTRAINT nfc_evidence_recovery_events_event_type_check CHECK
    (event_type IN ('snapshot','queued','claimed','renewed','deferred','review','completed','retry_requested'));

CREATE FUNCTION public.request_nfc_evidence_recovery_retry(
  p_request_id uuid,p_tag_id uuid,p_asset_id uuid,p_operator_id uuid,p_attempt_count integer,p_reason text
) RETURNS uuid LANGUAGE plpgsql SECURITY DEFINER SET search_path='' AS $$
DECLARE v_job public.nfc_evidence_recovery_jobs%ROWTYPE;
  v_intent public.nfc_evidence_upload_intents%ROWTYPE;
  v_request public.nfc_evidence_recovery_retry_requests%ROWTYPE;
  v_tag public.nfc_tags%ROWTYPE; v_now timestamptz;
BEGIN
  IF p_request_id IS NULL OR p_tag_id IS NULL OR p_asset_id IS NULL OR p_operator_id IS NULL
    OR p_attempt_count IS NULL OR p_attempt_count<0 OR p_reason IS NULL
    OR p_reason NOT IN ('provider_restored','connectivity_restored','recheck_requested')
    THEN RAISE EXCEPTION 'NFC_RECOVERY_RETRY_INPUT_INVALID'; END IF;

  -- The server must derive operator identity from its authenticated session.
  -- Lock the currently qualifying grant; revocation cannot race an accepted mutation.
  PERFORM 1 FROM public.admin_users WHERE admin_id=p_operator_id AND is_active FOR SHARE;
  IF NOT FOUND THEN RAISE EXCEPTION 'NFC_RECOVERY_RETRY_FORBIDDEN'; END IF;
  PERFORM 1 FROM public.admin_user_roles ur JOIN public.roles r USING(role_id)
    WHERE ur.admin_id=p_operator_id AND r.is_active AND r.role_name='super_admin' FOR SHARE OF ur,r;
  IF NOT FOUND THEN
    PERFORM 1 FROM public.admin_user_roles ur JOIN public.roles r USING(role_id)
      JOIN public.role_permissions rp USING(role_id) JOIN public.permissions p USING(permission_id)
      WHERE ur.admin_id=p_operator_id AND r.is_active AND p.permission_name IN ('checkin_code.manage','system.all')
      FOR SHARE OF ur,r,rp,p;
    IF NOT FOUND THEN RAISE EXCEPTION 'NFC_RECOVERY_RETRY_FORBIDDEN'; END IF;
  END IF;

  PERFORM pg_catalog.pg_advisory_xact_lock(pg_catalog.hashtextextended('nfc-recovery-request:'||p_request_id::text,0));
  SELECT * INTO v_request FROM public.nfc_evidence_recovery_retry_requests WHERE request_id=p_request_id;
  IF FOUND THEN
    IF ROW(v_request.asset_id,v_request.nfc_tag_id,v_request.operator_id,v_request.attempt_count,v_request.reason)
      IS DISTINCT FROM ROW(p_asset_id,p_tag_id,p_operator_id,p_attempt_count,p_reason)
      THEN RAISE EXCEPTION 'NFC_RECOVERY_RETRY_REQUEST_CONFLICT'; END IF;
    RETURN v_request.request_id;
  END IF;

  SELECT * INTO v_job FROM public.nfc_evidence_recovery_jobs WHERE asset_id=p_asset_id FOR UPDATE;
  IF NOT FOUND THEN RAISE EXCEPTION 'NFC_RECOVERY_RETRY_SCOPE_INVALID'; END IF;
  -- Same job -> asset -> intent lock order as the worker's leased finalization.
  PERFORM pg_catalog.pg_advisory_xact_lock(pg_catalog.hashtextextended('nfc-evidence:'||p_asset_id::text,0));
  SELECT * INTO v_intent FROM public.nfc_evidence_upload_intents WHERE asset_id=p_asset_id FOR SHARE;
  IF NOT FOUND OR v_intent.nfc_tag_id IS DISTINCT FROM p_tag_id THEN RAISE EXCEPTION 'NFC_RECOVERY_RETRY_SCOPE_INVALID'; END IF;
  v_now:=clock_timestamp();
  IF v_job.review_required OR v_job.completed_at IS NOT NULL OR v_job.lease_token IS NOT NULL
    OR v_job.last_outcome IS NULL OR v_job.last_outcome NOT IN ('absent','provider_unavailable')
    OR v_job.last_attempt_at IS NULL OR v_job.last_attempt_at>v_now-interval '60 seconds'
    OR v_job.next_attempt_at<=v_now THEN RAISE EXCEPTION 'NFC_RECOVERY_RETRY_UNAVAILABLE'; END IF;
  IF v_job.attempt_count IS DISTINCT FROM p_attempt_count THEN RAISE EXCEPTION 'NFC_RECOVERY_RETRY_STALE'; END IF;
  IF EXISTS(SELECT 1 FROM public.nfc_evidence_recovery_retry_requests WHERE asset_id=p_asset_id AND attempt_count=p_attempt_count)
    THEN RAISE EXCEPTION 'NFC_RECOVERY_RETRY_UNAVAILABLE'; END IF;
  PERFORM 1 FROM public.admin_users WHERE admin_id=v_intent.actor_id AND is_active FOR SHARE;
  IF NOT FOUND THEN RAISE EXCEPTION 'NFC_UPLOAD_ACTOR_UNAVAILABLE'; END IF;
  SELECT * INTO v_tag FROM public.nfc_tags WHERE nfc_tag_id=p_tag_id FOR SHARE;
  IF NOT FOUND OR v_tag.status='revoked' THEN RAISE EXCEPTION 'NFC_UPLOAD_TAG_UNAVAILABLE'; END IF;
  IF v_tag.version IS DISTINCT FROM v_intent.tag_version THEN RAISE EXCEPTION 'NFC_VERSION_CONFLICT'; END IF;

  v_now:=clock_timestamp();
  IF v_job.next_attempt_at<=v_now THEN RAISE EXCEPTION 'NFC_RECOVERY_RETRY_UNAVAILABLE'; END IF;
  INSERT INTO public.nfc_evidence_recovery_retry_requests(request_id,asset_id,nfc_tag_id,operator_id,attempt_count,reason,requested_at,scheduled_at)
    VALUES(p_request_id,p_asset_id,p_tag_id,p_operator_id,p_attempt_count,p_reason,v_now,v_now);
  UPDATE public.nfc_evidence_recovery_jobs SET next_attempt_at=v_now WHERE asset_id=p_asset_id;
  INSERT INTO public.nfc_evidence_recovery_events(asset_id,event_type,attempt_count,outcome,next_attempt_at)
    VALUES(p_asset_id,'retry_requested',p_attempt_count,NULL,v_now);
  INSERT INTO public.audit_logs(admin_id,action,entity_type,entity_id,old_data,new_data)
    VALUES(p_operator_id,'nfc_recovery.retry_requested','nfc_evidence',p_asset_id::text,
      jsonb_build_object('next_attempt_at',v_job.next_attempt_at),
      jsonb_build_object('request_id',p_request_id,'tag_id',p_tag_id,'attempt_count',p_attempt_count,'reason',p_reason,'scheduled_at',v_now));
  RETURN p_request_id;
END;
$$;
REVOKE ALL ON FUNCTION public.request_nfc_evidence_recovery_retry(uuid,uuid,uuid,uuid,integer,text) FROM PUBLIC,anon,authenticated;
GRANT EXECUTE ON FUNCTION public.request_nfc_evidence_recovery_retry(uuid,uuid,uuid,uuid,integer,text) TO service_role;
COMMENT ON FUNCTION public.request_nfc_evidence_recovery_retry(uuid,uuid,uuid,uuid,integer,text) IS
  'Held operator retry scheduling, permission-first service required. Current active RBAC/owner/tag checks; exact request replay, one retry per attempt, 60s minimum, no lease/review/completed override. Receipt, event, audit and queue commit atomically. No provider I/O.';
