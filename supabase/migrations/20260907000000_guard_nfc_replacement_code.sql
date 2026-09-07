-- Additive guard; no existing assignments or public rollout flags are changed.
CREATE FUNCTION public.guard_nfc_replacement_code()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = '' AS $$
DECLARE
  v_code_id bigint;
BEGIN
  IF NEW.replaces_tag_id IS NULL THEN RETURN NEW; END IF;
  SELECT checkin_code_id INTO v_code_id FROM public.nfc_tags
    WHERE nfc_tag_id = NEW.replaces_tag_id FOR UPDATE;
  IF v_code_id IS DISTINCT FROM NEW.checkin_code_id THEN
    RAISE EXCEPTION 'NFC_REPLACEMENT_CODE_MISMATCH';
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER guard_nfc_replacement_code BEFORE INSERT ON public.nfc_tags
  FOR EACH ROW EXECUTE FUNCTION public.guard_nfc_replacement_code();
REVOKE ALL ON FUNCTION public.guard_nfc_replacement_code() FROM PUBLIC, anon, authenticated, service_role;
COMMENT ON FUNCTION public.guard_nfc_replacement_code() IS
  'Replacement chains retain the original check-in code. Existing lifecycle and unique successor constraints remain authoritative.';
