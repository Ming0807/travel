-- Revalidate at activation, not just at public resolution. Does not activate tags.
CREATE FUNCTION public.guard_nfc_activation_assignment()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = '' AS $$
DECLARE v_code public.checkin_codes%ROWTYPE;
BEGIN
  IF NEW.status <> 'active' THEN RETURN NEW; END IF;
  SELECT * INTO v_code FROM public.checkin_codes
    WHERE checkin_code_id = NEW.checkin_code_id FOR SHARE;
  IF NOT FOUND OR NOT v_code.is_active OR NOT public.is_public_attraction(v_code.attraction_id)
    OR (v_code.starts_at IS NOT NULL AND v_code.starts_at > now())
    OR (v_code.ends_at IS NOT NULL AND v_code.ends_at < now()) THEN
    RAISE EXCEPTION 'NFC_ASSIGNMENT_UNAVAILABLE';
  END IF;
  IF ROW(v_code.code, v_code.attraction_id, v_code.photo_spot_id, v_code.campaign_id)
    IS DISTINCT FROM ROW(NEW.code_snapshot, NEW.attraction_id_snapshot, NEW.photo_spot_id_snapshot, NEW.campaign_id_snapshot) THEN
    RAISE EXCEPTION 'NFC_ASSIGNMENT_CHANGED';
  END IF;
  IF v_code.photo_spot_id IS NOT NULL AND NOT EXISTS (
    SELECT 1 FROM public.photo_spots WHERE photo_spot_id = v_code.photo_spot_id
      AND attraction_id = v_code.attraction_id AND is_active
  ) THEN RAISE EXCEPTION 'NFC_ASSIGNMENT_UNAVAILABLE'; END IF;
  RETURN NEW;
END;
$$;
CREATE TRIGGER guard_nfc_activation_assignment BEFORE UPDATE ON public.nfc_tags
  FOR EACH ROW EXECUTE FUNCTION public.guard_nfc_activation_assignment();
REVOKE ALL ON FUNCTION public.guard_nfc_activation_assignment() FROM PUBLIC, anon, authenticated, service_role;
