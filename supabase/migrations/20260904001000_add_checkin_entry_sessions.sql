-- Phase 23: browser-bound canonical entry sessions; no backfill or activation.
CREATE TABLE public.checkin_entry_sessions (
  entry_session_id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  browser_hash varchar(64) NOT NULL CHECK (browser_hash ~ '^[a-f0-9]{64}$'),
  checkin_code_id bigint NOT NULL REFERENCES public.checkin_codes(checkin_code_id) ON DELETE RESTRICT,
  code_snapshot varchar(100) NOT NULL,
  attraction_id_snapshot bigint NOT NULL REFERENCES public.attractions(attraction_id) ON DELETE RESTRICT,
  photo_spot_id_snapshot bigint REFERENCES public.photo_spots(photo_spot_id) ON DELETE RESTRICT,
  campaign_id_snapshot bigint,
  entry_channel varchar(10) NOT NULL CHECK (entry_channel IN ('qr', 'nfc')),
  nfc_tag_id uuid REFERENCES public.nfc_tags(nfc_tag_id) ON DELETE RESTRICT,
  evidence_scope varchar(30) NOT NULL DEFAULT 'unknown' CHECK (evidence_scope IN (
    'unknown', 'operational_unclassified', 'field_observation', 'pilot_internal', 'simulated_usability'
  )),
  visit_id uuid UNIQUE REFERENCES public.visits(visit_id) ON DELETE RESTRICT,
  created_at timestamptz NOT NULL DEFAULT now(),
  expires_at timestamptz NOT NULL DEFAULT (now() + interval '2 hours'),
  CHECK ((entry_channel = 'nfc') = (nfc_tag_id IS NOT NULL)),
  CHECK (expires_at > created_at)
);

CREATE INDEX idx_checkin_entry_resume ON public.checkin_entry_sessions
  (browser_hash, checkin_code_id, entry_channel, created_at DESC);
CREATE INDEX idx_checkin_entry_cohort ON public.checkin_entry_sessions
  (attraction_id_snapshot, created_at, entry_channel);

-- Called with code/tag locks held by the entry RPCs. Never treat the URL as
-- proof of physical presence; these checks only authorize the current flow.
CREATE FUNCTION public.validate_checkin_entry_assignment(p_entry public.checkin_entry_sessions)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path = '' AS $$
DECLARE
  v_code public.checkin_codes%ROWTYPE;
  v_tag public.nfc_tags%ROWTYPE;
BEGIN
  SELECT * INTO v_code FROM public.checkin_codes
    WHERE checkin_code_id = p_entry.checkin_code_id FOR SHARE;
  IF NOT FOUND OR NOT v_code.is_active
    OR (v_code.starts_at IS NOT NULL AND v_code.starts_at > now())
    OR (v_code.ends_at IS NOT NULL AND v_code.ends_at < now())
    OR NOT public.is_public_attraction(v_code.attraction_id) THEN
    RAISE EXCEPTION 'CHECKIN_ENTRY_UNAVAILABLE';
  END IF;
  IF ROW(v_code.code, v_code.attraction_id, v_code.photo_spot_id, v_code.campaign_id)
    IS DISTINCT FROM ROW(p_entry.code_snapshot, p_entry.attraction_id_snapshot,
      p_entry.photo_spot_id_snapshot, p_entry.campaign_id_snapshot) THEN
    RAISE EXCEPTION 'CHECKIN_ENTRY_REASSIGNED';
  END IF;
  IF v_code.photo_spot_id IS NOT NULL AND NOT EXISTS (
    SELECT 1 FROM public.photo_spots WHERE photo_spot_id = v_code.photo_spot_id
      AND attraction_id = v_code.attraction_id AND is_active
  ) THEN RAISE EXCEPTION 'CHECKIN_ENTRY_UNAVAILABLE'; END IF;
  IF p_entry.entry_channel = 'nfc' THEN
    SELECT * INTO v_tag FROM public.nfc_tags WHERE nfc_tag_id = p_entry.nfc_tag_id FOR SHARE;
    IF NOT FOUND OR v_tag.status <> 'active' THEN RAISE EXCEPTION 'CHECKIN_ENTRY_TAG_UNAVAILABLE'; END IF;
    IF ROW(v_tag.checkin_code_id, v_tag.code_snapshot, v_tag.attraction_id_snapshot,
      v_tag.photo_spot_id_snapshot, v_tag.campaign_id_snapshot)
      IS DISTINCT FROM ROW(p_entry.checkin_code_id, p_entry.code_snapshot, p_entry.attraction_id_snapshot,
      p_entry.photo_spot_id_snapshot, p_entry.campaign_id_snapshot) THEN
      RAISE EXCEPTION 'CHECKIN_ENTRY_REASSIGNED';
    END IF;
  END IF;
END;
$$;

CREATE FUNCTION public.begin_checkin_entry(p_browser_hash text, p_code text, p_channel text, p_tag_id uuid DEFAULT NULL)
RETURNS TABLE(entry_session_id uuid, was_created boolean)
LANGUAGE plpgsql SECURITY DEFINER SET search_path = '' AS $$
DECLARE
  v_entry public.checkin_entry_sessions%ROWTYPE;
  v_code public.checkin_codes%ROWTYPE;
BEGIN
  IF p_browser_hash IS NULL OR p_browser_hash !~ '^[a-f0-9]{64}$'
    OR p_channel IS NULL OR p_channel NOT IN ('qr', 'nfc')
    OR ((p_channel = 'nfc') <> (p_tag_id IS NOT NULL)) THEN
    RAISE EXCEPTION 'CHECKIN_ENTRY_INVALID';
  END IF;
  -- A browser/source lock serializes simultaneous initial requests without
  -- global locking or IP-based identity. Collisions only serialize extra work.
  PERFORM pg_advisory_xact_lock(hashtextextended(p_browser_hash || ':' || p_code || ':' || p_channel || ':' || coalesce(p_tag_id::text, ''), 0));
  SELECT * INTO v_code FROM public.checkin_codes WHERE code = p_code FOR SHARE;
  IF NOT FOUND THEN RAISE EXCEPTION 'CHECKIN_ENTRY_UNAVAILABLE'; END IF;
  SELECT * INTO v_entry FROM public.checkin_entry_sessions AS e
    WHERE e.browser_hash = p_browser_hash AND e.checkin_code_id = v_code.checkin_code_id
      AND e.entry_channel = p_channel AND e.nfc_tag_id IS NOT DISTINCT FROM p_tag_id
      AND e.expires_at > now()
    ORDER BY e.created_at DESC LIMIT 1;
  IF FOUND THEN
    PERFORM public.validate_checkin_entry_assignment(v_entry);
    RETURN QUERY SELECT v_entry.entry_session_id, false;
    RETURN;
  END IF;
  v_entry.browser_hash := p_browser_hash;
  v_entry.checkin_code_id := v_code.checkin_code_id;
  v_entry.code_snapshot := v_code.code;
  v_entry.attraction_id_snapshot := v_code.attraction_id;
  v_entry.photo_spot_id_snapshot := v_code.photo_spot_id;
  v_entry.campaign_id_snapshot := v_code.campaign_id;
  v_entry.entry_channel := p_channel;
  v_entry.nfc_tag_id := p_tag_id;
  PERFORM public.validate_checkin_entry_assignment(v_entry);
  INSERT INTO public.checkin_entry_sessions (browser_hash, checkin_code_id, code_snapshot,
    attraction_id_snapshot, photo_spot_id_snapshot, campaign_id_snapshot, entry_channel, nfc_tag_id)
    VALUES (p_browser_hash, v_code.checkin_code_id, v_code.code, v_code.attraction_id,
      v_code.photo_spot_id, v_code.campaign_id, p_channel, p_tag_id)
    RETURNING * INTO v_entry;
  RETURN QUERY SELECT v_entry.entry_session_id, true;
END;
$$;

CREATE FUNCTION public.read_checkin_entry(p_session_id uuid, p_browser_hash text, p_code text)
RETURNS SETOF public.checkin_entry_sessions
LANGUAGE plpgsql SECURITY DEFINER SET search_path = '' AS $$
DECLARE v_entry public.checkin_entry_sessions%ROWTYPE;
BEGIN
  SELECT * INTO v_entry FROM public.checkin_entry_sessions
    WHERE entry_session_id = p_session_id AND browser_hash = p_browser_hash
      AND code_snapshot = p_code AND expires_at > now();
  IF NOT FOUND THEN RAISE EXCEPTION 'CHECKIN_ENTRY_INVALID'; END IF;
  PERFORM public.validate_checkin_entry_assignment(v_entry);
  RETURN NEXT v_entry;
END;
$$;

CREATE FUNCTION public.create_checkin_entry_visit(p_session_id uuid, p_browser_hash text, p_code text, p_tourist_id uuid)
RETURNS uuid LANGUAGE plpgsql SECURITY DEFINER SET search_path = '' AS $$
DECLARE
  v_entry public.checkin_entry_sessions%ROWTYPE;
  v_visit_id uuid;
BEGIN
  SELECT * INTO v_entry FROM public.checkin_entry_sessions
    WHERE entry_session_id = p_session_id AND browser_hash = p_browser_hash
      AND code_snapshot = p_code AND expires_at > now() FOR UPDATE;
  IF NOT FOUND THEN RAISE EXCEPTION 'CHECKIN_ENTRY_INVALID'; END IF;
  PERFORM public.validate_checkin_entry_assignment(v_entry);
  IF v_entry.visit_id IS NOT NULL THEN
    IF NOT EXISTS (SELECT 1 FROM public.visits WHERE visit_id = v_entry.visit_id AND tourist_id = p_tourist_id) THEN
      RAISE EXCEPTION 'CHECKIN_ENTRY_OWNER_MISMATCH';
    END IF;
    RETURN v_entry.visit_id;
  END IF;
  INSERT INTO public.visits (tourist_id, attraction_id, photo_spot_id, checkin_code_id, entry_channel, completion_status)
    VALUES (p_tourist_id, v_entry.attraction_id_snapshot, v_entry.photo_spot_id_snapshot,
      v_entry.checkin_code_id, v_entry.entry_channel, 'minimal_form_completed')
    RETURNING visit_id INTO v_visit_id;
  UPDATE public.checkin_entry_sessions SET visit_id = v_visit_id WHERE entry_session_id = p_session_id;
  INSERT INTO public.xp_events (tourist_id, visit_id, xp_source, xp_amount, metadata)
    VALUES (p_tourist_id, v_visit_id,
      CASE WHEN v_entry.entry_channel = 'nfc' THEN 'nfc_checkin' ELSE 'qr_checkin' END,
      50, jsonb_build_object('entry_session_id', p_session_id, 'entry_channel', v_entry.entry_channel));
  RETURN v_visit_id;
END;
$$;

CREATE FUNCTION public.protect_checkin_entry_context()
RETURNS trigger LANGUAGE plpgsql SET search_path = '' AS $$
BEGIN
  IF TG_OP = 'DELETE' THEN RAISE EXCEPTION 'CHECKIN_ENTRY_IMMUTABLE'; END IF;
  IF (to_jsonb(NEW) - 'visit_id') IS DISTINCT FROM (to_jsonb(OLD) - 'visit_id')
    OR OLD.visit_id IS NOT NULL THEN RAISE EXCEPTION 'CHECKIN_ENTRY_IMMUTABLE'; END IF;
  RETURN NEW;
END;
$$;
CREATE TRIGGER protect_checkin_entry_context BEFORE UPDATE OR DELETE ON public.checkin_entry_sessions
  FOR EACH ROW EXECUTE FUNCTION public.protect_checkin_entry_context();

ALTER TABLE public.checkin_entry_sessions ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.checkin_entry_sessions FROM PUBLIC, anon, authenticated, service_role;
GRANT SELECT ON public.checkin_entry_sessions TO service_role;
REVOKE ALL ON FUNCTION public.validate_checkin_entry_assignment(public.checkin_entry_sessions),
  public.begin_checkin_entry(text,text,text,uuid), public.read_checkin_entry(uuid,text,text),
  public.create_checkin_entry_visit(uuid,text,text,uuid), public.protect_checkin_entry_context()
  FROM PUBLIC, anon, authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.begin_checkin_entry(text,text,text,uuid),
  public.read_checkin_entry(uuid,text,text), public.create_checkin_entry_visit(uuid,text,text,uuid) TO service_role;

-- Keep gamification parity while preserving truthful channel attribution.
ALTER TABLE public.xp_events DROP CONSTRAINT IF EXISTS xp_events_xp_source_check;
ALTER TABLE public.xp_events ADD CONSTRAINT xp_events_xp_source_check CHECK (xp_source IN (
  'qr_checkin', 'nfc_checkin', 'photo_upload', 'certificate_generated',
  'survey_completed', 'stamp_earned', 'review_submitted',
  'restaurant_visit', 'badge_earned', 'admin_award'
));

COMMENT ON TABLE public.checkin_entry_sessions IS 'Browser-bound channel entry cohorts. Unknown evidence scope until pre-Visit classification is implemented; not verified people or physical taps.';
