-- Held, bounded metadata history only; no worker activation or provider I/O.
CREATE TABLE public.nfc_evidence_cleanup_events (
  event_id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  asset_id uuid NOT NULL REFERENCES public.nfc_evidence_cleanup_jobs(asset_id) ON DELETE RESTRICT,
  occurred_at timestamptz NOT NULL DEFAULT clock_timestamp(),
  event_type text NOT NULL CHECK (event_type IN ('snapshot','queued','claimed','renewed','deferred','review')),
  attempt_count integer NOT NULL CHECK (attempt_count>=0),
  outcome text CHECK (outcome IN ('provider_unavailable','absent','content_conflict','namespace_changed','settlement_unproven')),
  next_attempt_at timestamptz NOT NULL,
  CHECK (event_type IN ('snapshot','deferred','review') OR outcome IS NULL)
);
CREATE INDEX idx_nfc_cleanup_events_asset ON public.nfc_evidence_cleanup_events(asset_id,event_id DESC);
ALTER TABLE public.nfc_evidence_cleanup_events ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.nfc_evidence_cleanup_events FROM PUBLIC,anon,authenticated,service_role;
GRANT SELECT ON public.nfc_evidence_cleanup_events TO service_role;
REVOKE ALL ON SEQUENCE public.nfc_evidence_cleanup_events_event_id_seq FROM PUBLIC,anon,authenticated,service_role;

CREATE FUNCTION public.guard_nfc_cleanup_event_history()
RETURNS trigger LANGUAGE plpgsql SET search_path='' AS $$
BEGIN
  RAISE EXCEPTION 'NFC_CLEANUP_HISTORY_IMMUTABLE';
END;
$$;
CREATE TRIGGER guard_nfc_cleanup_event_history BEFORE UPDATE OR DELETE ON public.nfc_evidence_cleanup_events
  FOR EACH ROW EXECUTE FUNCTION public.guard_nfc_cleanup_event_history();

CREATE FUNCTION public.record_nfc_cleanup_event()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path='' AS $$
DECLARE v_event text;
BEGIN
  IF TG_OP='INSERT' THEN v_event:='queued';
  ELSIF NEW.lease_token IS NOT NULL AND NEW.lease_token IS DISTINCT FROM OLD.lease_token THEN v_event:='claimed';
  ELSIF NEW.lease_token IS NOT NULL AND NEW.lease_expires_at IS DISTINCT FROM OLD.lease_expires_at THEN v_event:='renewed';
  ELSIF NEW.lease_token IS NULL AND OLD.lease_token IS NOT NULL THEN
    v_event:=CASE WHEN NEW.review_required THEN 'review' ELSE 'deferred' END;
  ELSE RETURN NEW;
  END IF;
  INSERT INTO public.nfc_evidence_cleanup_events(asset_id,event_type,attempt_count,outcome,next_attempt_at)
    VALUES(NEW.asset_id,v_event,NEW.attempt_count,
      CASE WHEN v_event IN ('deferred','review') THEN NEW.last_outcome ELSE NULL END,NEW.next_attempt_at);
  RETURN NEW;
END;
$$;
CREATE TRIGGER record_nfc_cleanup_event AFTER INSERT OR UPDATE ON public.nfc_evidence_cleanup_jobs
  FOR EACH ROW EXECUTE FUNCTION public.record_nfc_cleanup_event();
INSERT INTO public.nfc_evidence_cleanup_events(asset_id,event_type,attempt_count,outcome,next_attempt_at)
  SELECT asset_id,'snapshot',attempt_count,last_outcome,next_attempt_at FROM public.nfc_evidence_cleanup_jobs;
REVOKE ALL ON FUNCTION public.guard_nfc_cleanup_event_history(),public.record_nfc_cleanup_event()
  FROM PUBLIC,anon,authenticated,service_role;
COMMENT ON TABLE public.nfc_evidence_cleanup_events IS
  'Held append-only scheduling history, atomic with queue changes. Snapshot is not reconstructed history. No private locators, provider accounts, lease tokens or remote deletion/absence proof.';
