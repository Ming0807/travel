-- Additive operational evidence. Does not activate tags or certify physical presence.
CREATE TABLE public.nfc_field_checks (
  request_id uuid PRIMARY KEY,
  nfc_tag_id uuid NOT NULL REFERENCES public.nfc_tags(nfc_tag_id) ON DELETE RESTRICT,
  tag_version integer NOT NULL CHECK (tag_version > 0),
  tag_status varchar(20) NOT NULL CHECK (tag_status IN ('draft','active','inactive','revoked')),
  actor_id uuid NOT NULL REFERENCES public.admin_users(admin_id) ON DELETE RESTRICT,
  location_note text NOT NULL CHECK (char_length(btrim(location_note)) BETWEEN 3 AND 300),
  device_label text NOT NULL CHECK (char_length(btrim(device_label)) BETWEEN 2 AND 120),
  platform varchar(20) NOT NULL CHECK (platform IN ('ios','android','other')),
  nfc_result varchar(20) NOT NULL CHECK (nfc_result IN ('passed','failed','not_tested')),
  qr_result varchar(20) NOT NULL CHECK (qr_result IN ('passed','failed','not_tested')),
  notes text NOT NULL CHECK (char_length(notes) <= 1000),
  evidence_reference text NOT NULL CHECK (char_length(evidence_reference) <= 300),
  reported_at timestamptz NOT NULL DEFAULT now(),
  CHECK (nfc_result <> 'not_tested' OR qr_result <> 'not_tested'),
  CHECK ((nfc_result <> 'failed' AND qr_result <> 'failed') OR char_length(btrim(notes)) >= 3)
);
CREATE INDEX idx_nfc_field_checks_tag_reported ON public.nfc_field_checks(nfc_tag_id,reported_at DESC,request_id DESC);
ALTER TABLE public.nfc_field_checks ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.nfc_field_checks FROM PUBLIC,anon,authenticated,service_role;
GRANT SELECT ON public.nfc_field_checks TO service_role;

CREATE FUNCTION public.guard_nfc_field_check_history()
RETURNS trigger LANGUAGE plpgsql SET search_path = '' AS $$
BEGIN RAISE EXCEPTION 'NFC_FIELD_HISTORY_IMMUTABLE'; END;
$$;
CREATE TRIGGER guard_nfc_field_check_history BEFORE UPDATE OR DELETE ON public.nfc_field_checks
FOR EACH ROW EXECUTE FUNCTION public.guard_nfc_field_check_history();
REVOKE ALL ON FUNCTION public.guard_nfc_field_check_history() FROM PUBLIC,anon,authenticated,service_role;

CREATE FUNCTION public.record_nfc_field_check(
  p_request_id uuid, p_tag_id uuid, p_version integer, p_actor_id uuid,
  p_location text, p_device text, p_platform text, p_nfc_result text, p_qr_result text,
  p_notes text, p_evidence_reference text
) RETURNS uuid LANGUAGE plpgsql SECURITY DEFINER SET search_path = '' AS $$
DECLARE v_tag public.nfc_tags%ROWTYPE; v_existing public.nfc_field_checks%ROWTYPE;
BEGIN
  IF p_request_id IS NULL OR p_tag_id IS NULL OR p_actor_id IS NULL THEN
    RAISE EXCEPTION 'NFC_FIELD_INPUT_INVALID';
  END IF;
  PERFORM pg_advisory_xact_lock(hashtextextended('nfc-field-check:' || p_request_id::text,0));
  SELECT * INTO v_existing FROM public.nfc_field_checks WHERE request_id=p_request_id;
  IF FOUND THEN
    IF ROW(v_existing.nfc_tag_id,v_existing.tag_version,v_existing.actor_id,v_existing.location_note,
      v_existing.device_label,v_existing.platform,v_existing.nfc_result,v_existing.qr_result,
      v_existing.notes,v_existing.evidence_reference)
      IS DISTINCT FROM ROW(p_tag_id,p_version,p_actor_id,btrim(p_location),btrim(p_device),p_platform,
        p_nfc_result,p_qr_result,btrim(p_notes),btrim(p_evidence_reference)) THEN
      RAISE EXCEPTION 'NFC_FIELD_REQUEST_CONFLICT';
    END IF;
    RETURN v_existing.request_id;
  END IF;
  SELECT * INTO v_tag FROM public.nfc_tags WHERE nfc_tag_id=p_tag_id FOR SHARE;
  IF NOT FOUND THEN RAISE EXCEPTION 'NFC_NOT_FOUND'; END IF;
  IF v_tag.version IS DISTINCT FROM p_version THEN RAISE EXCEPTION 'NFC_VERSION_CONFLICT'; END IF;
  IF p_nfc_result='passed' AND (v_tag.verified_at IS NULL OR v_tag.status='revoked') THEN
    RAISE EXCEPTION 'NFC_FIELD_PASS_NOT_ELIGIBLE';
  END IF;
  INSERT INTO public.nfc_field_checks(request_id,nfc_tag_id,tag_version,tag_status,actor_id,
    location_note,device_label,platform,nfc_result,qr_result,notes,evidence_reference)
  VALUES(p_request_id,p_tag_id,p_version,v_tag.status,p_actor_id,btrim(p_location),btrim(p_device),
    p_platform,p_nfc_result,p_qr_result,btrim(p_notes),btrim(p_evidence_reference));
  RETURN p_request_id;
END;
$$;
REVOKE ALL ON FUNCTION public.record_nfc_field_check(uuid,uuid,integer,uuid,text,text,text,text,text,text,text) FROM PUBLIC,anon,authenticated;
GRANT EXECUTE ON FUNCTION public.record_nfc_field_check(uuid,uuid,integer,uuid,text,text,text,text,text,text,text) TO service_role;
COMMENT ON TABLE public.nfc_field_checks IS 'Append-only staff-reported field checks, not proof of visitor presence, consent, or automatic tag activation. reported_at is server submission time.';
