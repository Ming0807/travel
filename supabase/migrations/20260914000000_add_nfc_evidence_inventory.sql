-- HELD W6: metadata inventory only; never claims or authorizes deletion.
CREATE INDEX idx_nfc_evidence_assets_tag_cursor ON public.nfc_evidence_assets(nfc_tag_id,asset_id);
CREATE FUNCTION public.list_nfc_evidence_inventory(p_tag_id uuid,p_after_asset_id uuid DEFAULT NULL)
RETURNS jsonb LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path='' AS $$
DECLARE v_rows jsonb;
BEGIN
  IF p_tag_id IS NULL THEN RAISE EXCEPTION 'NFC_INVENTORY_INPUT_INVALID'; END IF;
  SELECT coalesce(jsonb_agg(to_jsonb(r) ORDER BY r.asset_id),'[]'::jsonb) INTO v_rows
  FROM (
    SELECT a.asset_id,a.created_at,a.provider,
      EXISTS(SELECT 1 FROM public.nfc_field_check_photos p WHERE p.asset_id=a.asset_id) AS attached,
      EXISTS(SELECT 1 FROM public.nfc_evidence_upload_intents i WHERE i.asset_id=a.asset_id) AS has_intent,
      CASE WHEN c.asset_id IS NULL THEN 'none' WHEN c.deleted_at IS NULL THEN 'pending'
        ELSE 'acknowledged' END AS cleanup_state
    FROM public.nfc_evidence_assets a
    LEFT JOIN public.nfc_evidence_cleanup c ON c.asset_id=a.asset_id
    WHERE a.nfc_tag_id=p_tag_id AND (p_after_asset_id IS NULL OR a.asset_id>p_after_asset_id)
    ORDER BY a.asset_id LIMIT 21
  ) r;
  RETURN jsonb_build_object('rows',v_rows);
END;
$$;
REVOKE ALL ON FUNCTION public.list_nfc_evidence_inventory(uuid,uuid) FROM PUBLIC,anon,authenticated;
GRANT EXECUTE ON FUNCTION public.list_nfc_evidence_inventory(uuid,uuid) TO service_role;
COMMENT ON FUNCTION public.list_nfc_evidence_inventory(uuid,uuid) IS
  'Held service-only tag inventory: 20 rows plus lookahead. No private locator or deletion authority. Acknowledged means recorded legacy acknowledgement, not verified current provider absence.';
