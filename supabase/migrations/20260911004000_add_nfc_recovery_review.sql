-- HELD: metadata-only operator history. Does not activate workers or allow retry/deletion.
CREATE TABLE public.nfc_evidence_recovery_events (
  event_id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  asset_id uuid NOT NULL REFERENCES public.nfc_evidence_recovery_jobs(asset_id) ON DELETE RESTRICT,
  occurred_at timestamptz NOT NULL DEFAULT clock_timestamp(),
  event_type text NOT NULL CHECK (event_type IN ('snapshot','queued','claimed','renewed','deferred','review','completed')),
  attempt_count integer NOT NULL CHECK (attempt_count>=0),
  outcome text CHECK (outcome IN ('provider_unavailable','absent','content_conflict','namespace_changed','actor_unavailable','tag_changed')),
  next_attempt_at timestamptz NOT NULL
);
CREATE INDEX idx_nfc_recovery_events_asset ON public.nfc_evidence_recovery_events(asset_id,event_id DESC);
CREATE INDEX idx_nfc_recovery_intents_tag_created ON public.nfc_evidence_upload_intents(nfc_tag_id,created_at DESC,asset_id DESC);
ALTER TABLE public.nfc_evidence_recovery_events ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.nfc_evidence_recovery_events FROM PUBLIC,anon,authenticated,service_role;
GRANT SELECT ON public.nfc_evidence_recovery_events TO service_role;
REVOKE ALL ON SEQUENCE public.nfc_evidence_recovery_events_event_id_seq FROM PUBLIC,anon,authenticated,service_role;

CREATE FUNCTION public.record_nfc_evidence_recovery_event()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path='' AS $$
DECLARE v_event text;
BEGIN
  IF TG_OP='INSERT' THEN v_event:='queued';
  ELSIF NEW.completed_at IS NOT NULL AND OLD.completed_at IS NULL THEN v_event:='completed';
  ELSIF NEW.lease_token IS NOT NULL AND NEW.lease_token IS DISTINCT FROM OLD.lease_token THEN v_event:='claimed';
  ELSIF NEW.lease_token IS NOT NULL AND NEW.lease_expires_at IS DISTINCT FROM OLD.lease_expires_at THEN v_event:='renewed';
  ELSIF NEW.lease_token IS NULL AND OLD.lease_token IS NOT NULL THEN
    v_event:=CASE WHEN NEW.review_required THEN 'review' ELSE 'deferred' END;
  ELSE RETURN NEW;
  END IF;
  INSERT INTO public.nfc_evidence_recovery_events(asset_id,event_type,attempt_count,outcome,next_attempt_at)
    VALUES(NEW.asset_id,v_event,NEW.attempt_count,
      CASE WHEN v_event IN ('deferred','review') THEN NEW.last_outcome ELSE NULL END,NEW.next_attempt_at);
  RETURN NEW;
END;
$$;
CREATE TRIGGER record_nfc_evidence_recovery_event AFTER INSERT OR UPDATE ON public.nfc_evidence_recovery_jobs
  FOR EACH ROW EXECUTE FUNCTION public.record_nfc_evidence_recovery_event();
INSERT INTO public.nfc_evidence_recovery_events(asset_id,event_type,attempt_count,outcome,next_attempt_at)
  SELECT asset_id,'snapshot',attempt_count,last_outcome,next_attempt_at FROM public.nfc_evidence_recovery_jobs;
REVOKE ALL ON FUNCTION public.record_nfc_evidence_recovery_event() FROM PUBLIC,anon,authenticated,service_role;

CREATE FUNCTION public.list_nfc_evidence_recovery(p_tag_id uuid,p_page integer DEFAULT 1)
RETURNS jsonb LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path='' AS $$
DECLARE v_rows jsonb;
BEGIN
  IF p_tag_id IS NULL OR p_page IS NULL OR p_page<1 OR p_page>10000 THEN
    RAISE EXCEPTION 'NFC_RECOVERY_FILTER_INVALID';
  END IF;
  SELECT coalesce(jsonb_agg(to_jsonb(r) ORDER BY r.created_at DESC,r.asset_id DESC),'[]'::jsonb) INTO v_rows FROM (
    SELECT i.asset_id,i.tag_version,i.state AS intent_state,i.created_at,j.attempt_count,j.last_attempt_at,
      j.next_attempt_at,CASE WHEN j.completed_at IS NULL THEN j.last_outcome ELSE NULL END AS last_outcome,j.completed_at,
      CASE WHEN j.completed_at IS NOT NULL THEN 'completed' WHEN j.review_required THEN 'review'
        WHEN j.lease_expires_at>statement_timestamp() THEN 'processing'
        WHEN j.next_attempt_at<=statement_timestamp() THEN 'ready' ELSE 'waiting' END AS status
    FROM public.nfc_evidence_upload_intents i JOIN public.nfc_evidence_recovery_jobs j USING(asset_id)
    WHERE i.nfc_tag_id=p_tag_id ORDER BY i.created_at DESC,i.asset_id DESC LIMIT 21 OFFSET (p_page-1)*20
  ) r;
  RETURN jsonb_build_object('rows',v_rows,'page',p_page);
END;
$$;

CREATE FUNCTION public.list_nfc_evidence_recovery_history(p_tag_id uuid,p_asset_id uuid,p_before_id bigint DEFAULT NULL)
RETURNS jsonb LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path='' AS $$
DECLARE v_rows jsonb;
BEGIN
  IF p_tag_id IS NULL OR p_asset_id IS NULL OR (p_before_id IS NOT NULL AND p_before_id<1) THEN
    RAISE EXCEPTION 'NFC_RECOVERY_FILTER_INVALID';
  END IF;
  SELECT coalesce(jsonb_agg(to_jsonb(r) ORDER BY r.sort_id DESC),'[]'::jsonb) INTO v_rows FROM (
    SELECT e.event_id AS sort_id,e.event_id::text AS event_id,e.occurred_at,e.event_type,e.attempt_count,e.outcome,e.next_attempt_at
    FROM public.nfc_evidence_recovery_events e JOIN public.nfc_evidence_upload_intents i USING(asset_id)
    WHERE e.asset_id=p_asset_id AND i.nfc_tag_id=p_tag_id AND (p_before_id IS NULL OR e.event_id<p_before_id)
    ORDER BY e.event_id DESC LIMIT 21
  ) r;
  SELECT coalesce(jsonb_agg(e.value-'sort_id' ORDER BY e.ordinality),'[]'::jsonb) INTO v_rows
    FROM jsonb_array_elements(v_rows) WITH ORDINALITY AS e(value,ordinality);
  RETURN jsonb_build_object('rows',v_rows);
END;
$$;
REVOKE ALL ON FUNCTION public.list_nfc_evidence_recovery(uuid,integer),
  public.list_nfc_evidence_recovery_history(uuid,uuid,bigint) FROM PUBLIC,anon,authenticated;
GRANT EXECUTE ON FUNCTION public.list_nfc_evidence_recovery(uuid,integer),
  public.list_nfc_evidence_recovery_history(uuid,uuid,bigint) TO service_role;
COMMENT ON TABLE public.nfc_evidence_recovery_events IS
  'Held append-only bounded event metadata. Backfill is a snapshot, not reconstructed attempt history. No private locators, owner identifiers, lease tokens or raw errors.';
