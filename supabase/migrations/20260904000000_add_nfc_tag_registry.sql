-- Phase 23 foundation. No public route activation or tag seed data.

CREATE TABLE public.nfc_tags (
  nfc_tag_id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  public_token uuid NOT NULL UNIQUE DEFAULT gen_random_uuid(),
  checkin_code_id bigint NOT NULL REFERENCES public.checkin_codes(checkin_code_id) ON DELETE RESTRICT,
  code_snapshot varchar(100) NOT NULL,
  attraction_id_snapshot bigint NOT NULL REFERENCES public.attractions(attraction_id) ON DELETE RESTRICT,
  photo_spot_id_snapshot bigint REFERENCES public.photo_spots(photo_spot_id) ON DELETE RESTRICT,
  campaign_id_snapshot bigint,
  label varchar(80) NOT NULL CHECK (char_length(btrim(label)) BETWEEN 1 AND 80),
  status varchar(20) NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'active', 'inactive', 'revoked')),
  replaces_tag_id uuid UNIQUE REFERENCES public.nfc_tags(nfc_tag_id) ON DELETE RESTRICT,
  verification_reference varchar(500),
  verified_by uuid REFERENCES public.admin_users(admin_id) ON DELETE RESTRICT,
  verified_at timestamptz,
  revoked_at timestamptz,
  last_change_reason varchar(500) NOT NULL CHECK (char_length(btrim(last_change_reason)) BETWEEN 1 AND 500),
  created_by uuid NOT NULL REFERENCES public.admin_users(admin_id) ON DELETE RESTRICT,
  updated_by uuid NOT NULL REFERENCES public.admin_users(admin_id) ON DELETE RESTRICT,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  version integer NOT NULL DEFAULT 1 CHECK (version > 0),
  CHECK (replaces_tag_id IS NULL OR replaces_tag_id <> nfc_tag_id),
  CHECK (
    (verified_at IS NULL AND verified_by IS NULL AND verification_reference IS NULL)
    OR (verified_at IS NOT NULL AND verified_by IS NOT NULL AND verification_reference IS NOT NULL
      AND char_length(btrim(verification_reference)) BETWEEN 1 AND 500)
  ),
  CHECK (status NOT IN ('active', 'inactive') OR verified_at IS NOT NULL),
  CHECK ((status = 'revoked') = (revoked_at IS NOT NULL))
);

CREATE TABLE public.nfc_tag_events (
  nfc_tag_event_id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  nfc_tag_id uuid NOT NULL REFERENCES public.nfc_tags(nfc_tag_id) ON DELETE RESTRICT,
  event_type varchar(20) NOT NULL CHECK (event_type IN ('registered', 'verified', 'activated', 'deactivated', 'revoked', 'updated')),
  previous_status varchar(20),
  status varchar(20) NOT NULL,
  version integer NOT NULL CHECK (version > 0),
  actor_id uuid NOT NULL REFERENCES public.admin_users(admin_id) ON DELETE RESTRICT,
  reason varchar(500) NOT NULL,
  occurred_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (nfc_tag_id, version)
);

CREATE INDEX idx_nfc_tags_code_status ON public.nfc_tags(checkin_code_id, status);
CREATE INDEX idx_nfc_tags_status_created ON public.nfc_tags(status, created_at DESC);

CREATE FUNCTION public.enforce_nfc_tag_lifecycle()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = '' AS $$
DECLARE
  v_code public.checkin_codes%ROWTYPE;
  v_previous_status text;
BEGIN
  IF TG_OP = 'DELETE' THEN
    RAISE EXCEPTION 'NFC_HISTORY_IMMUTABLE';
  END IF;
  IF TG_OP = 'INSERT' THEN
    IF NEW.status <> 'draft' OR NEW.verified_at IS NOT NULL OR NEW.verified_by IS NOT NULL
      OR NEW.verification_reference IS NOT NULL OR NEW.revoked_at IS NOT NULL THEN
      RAISE EXCEPTION 'NFC_DRAFT_REQUIRED';
    END IF;
    SELECT * INTO v_code FROM public.checkin_codes WHERE checkin_code_id = NEW.checkin_code_id FOR SHARE;
    IF NOT FOUND THEN RAISE EXCEPTION 'NFC_CHECKIN_CODE_REQUIRED'; END IF;
    NEW.code_snapshot := v_code.code;
    NEW.attraction_id_snapshot := v_code.attraction_id;
    NEW.photo_spot_id_snapshot := v_code.photo_spot_id;
    NEW.campaign_id_snapshot := v_code.campaign_id;
    NEW.version := 1;
    NEW.created_at := now();
    NEW.updated_by := NEW.created_by;
    IF NEW.replaces_tag_id IS NOT NULL THEN
      SELECT status INTO v_previous_status FROM public.nfc_tags WHERE nfc_tag_id = NEW.replaces_tag_id FOR UPDATE;
      IF v_previous_status IS DISTINCT FROM 'revoked' THEN
        RAISE EXCEPTION 'NFC_REPLACEMENT_REQUIRES_REVOCATION';
      END IF;
    END IF;
  ELSE
    IF OLD.status = 'revoked' THEN RAISE EXCEPTION 'NFC_REVOKED_IMMUTABLE'; END IF;
    IF ROW(NEW.nfc_tag_id, NEW.public_token, NEW.checkin_code_id, NEW.code_snapshot,
      NEW.attraction_id_snapshot, NEW.photo_spot_id_snapshot, NEW.campaign_id_snapshot,
      NEW.replaces_tag_id, NEW.created_by, NEW.created_at)
      IS DISTINCT FROM ROW(OLD.nfc_tag_id, OLD.public_token, OLD.checkin_code_id, OLD.code_snapshot,
      OLD.attraction_id_snapshot, OLD.photo_spot_id_snapshot, OLD.campaign_id_snapshot,
      OLD.replaces_tag_id, OLD.created_by, OLD.created_at) THEN
      RAISE EXCEPTION 'NFC_ASSIGNMENT_IMMUTABLE';
    END IF;
    IF OLD.verified_at IS NOT NULL AND ROW(NEW.verified_at, NEW.verified_by, NEW.verification_reference)
      IS DISTINCT FROM ROW(OLD.verified_at, OLD.verified_by, OLD.verification_reference) THEN
      RAISE EXCEPTION 'NFC_VERIFICATION_IMMUTABLE';
    END IF;
    IF NEW.status <> OLD.status AND NOT (
      (OLD.status = 'draft' AND NEW.status IN ('active', 'revoked'))
      OR (OLD.status = 'active' AND NEW.status IN ('inactive', 'revoked'))
      OR (OLD.status = 'inactive' AND NEW.status IN ('active', 'revoked'))
    ) THEN RAISE EXCEPTION 'NFC_INVALID_TRANSITION'; END IF;
    -- Activation and read-back verification are separate recorded operations.
    IF NEW.status = 'active' AND OLD.verified_at IS NULL THEN
      RAISE EXCEPTION 'NFC_VERIFICATION_REQUIRED';
    END IF;
    NEW.revoked_at := CASE WHEN NEW.status = 'revoked' THEN now() ELSE NULL END;
    NEW.version := OLD.version + 1;
  END IF;
  NEW.updated_at := now();
  RETURN NEW;
END;
$$;

CREATE FUNCTION public.audit_nfc_tag_change()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = '' AS $$
DECLARE
  v_type text;
  v_previous text;
BEGIN
  IF TG_OP = 'INSERT' THEN
    v_type := 'registered';
  ELSE
    v_previous := OLD.status;
    v_type := CASE
      WHEN NEW.status <> OLD.status AND NEW.status = 'active' THEN 'activated'
      WHEN NEW.status <> OLD.status AND NEW.status = 'inactive' THEN 'deactivated'
      WHEN NEW.status <> OLD.status AND NEW.status = 'revoked' THEN 'revoked'
      WHEN OLD.verified_at IS NULL AND NEW.verified_at IS NOT NULL THEN 'verified'
      ELSE 'updated' END;
  END IF;
  INSERT INTO public.nfc_tag_events (nfc_tag_id, event_type, previous_status, status, version, actor_id, reason)
    VALUES (NEW.nfc_tag_id, v_type, v_previous, NEW.status, NEW.version, NEW.updated_by, NEW.last_change_reason);
  RETURN NEW;
END;
$$;

CREATE FUNCTION public.prevent_nfc_event_mutation()
RETURNS trigger LANGUAGE plpgsql SET search_path = '' AS $$
BEGIN
  RAISE EXCEPTION 'NFC_HISTORY_IMMUTABLE';
END;
$$;

CREATE TRIGGER enforce_nfc_tag_lifecycle BEFORE INSERT OR UPDATE OR DELETE ON public.nfc_tags
  FOR EACH ROW EXECUTE FUNCTION public.enforce_nfc_tag_lifecycle();
CREATE TRIGGER audit_nfc_tag_change AFTER INSERT OR UPDATE ON public.nfc_tags
  FOR EACH ROW EXECUTE FUNCTION public.audit_nfc_tag_change();
CREATE TRIGGER prevent_nfc_event_mutation BEFORE UPDATE OR DELETE ON public.nfc_tag_events
  FOR EACH ROW EXECUTE FUNCTION public.prevent_nfc_event_mutation();

ALTER TABLE public.nfc_tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.nfc_tag_events ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.nfc_tags, public.nfc_tag_events FROM PUBLIC, anon, authenticated, service_role;
GRANT SELECT, INSERT, UPDATE ON public.nfc_tags TO service_role;
GRANT SELECT ON public.nfc_tag_events TO service_role;
REVOKE ALL ON FUNCTION public.enforce_nfc_tag_lifecycle(), public.audit_nfc_tag_change(),
  public.prevent_nfc_event_mutation() FROM PUBLIC, anon, authenticated;

COMMENT ON TABLE public.nfc_tags IS 'Revocable NFC URL assignments. Tokens identify public entry links, not verified physical taps.';
COMMENT ON COLUMN public.nfc_tags.campaign_id_snapshot IS 'Immutable historical snapshot, not a live assignment. Compared with checkin_codes on resolution.';
COMMENT ON TABLE public.nfc_tag_events IS 'Append-only operational tag lifecycle audit; contains no tourist identity or tourism statistics.';
