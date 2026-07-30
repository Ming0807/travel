BEGIN;

CREATE OR REPLACE FUNCTION public.replace_story_recommendations(
  p_source_story_id bigint,
  p_items jsonb,
  p_actor_id uuid
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  item_count integer;
BEGIN
  IF p_source_story_id IS NULL OR p_source_story_id <= 0 THEN
    RAISE EXCEPTION 'INVALID_SOURCE_STORY';
  END IF;

  IF NOT EXISTS (
    SELECT 1
    FROM public.travel_stories
    WHERE story_id = p_source_story_id
  ) THEN
    RAISE EXCEPTION 'STORY_NOT_FOUND';
  END IF;

  IF jsonb_typeof(COALESCE(p_items, '[]'::jsonb)) <> 'array' THEN
    RAISE EXCEPTION 'INVALID_RECOMMENDATION_ITEMS';
  END IF;

  item_count := jsonb_array_length(COALESCE(p_items, '[]'::jsonb));
  IF item_count > 12 THEN
    RAISE EXCEPTION 'TOO_MANY_RECOMMENDATIONS';
  END IF;

  IF EXISTS (
    SELECT 1
    FROM jsonb_to_recordset(COALESCE(p_items, '[]'::jsonb))
      AS item(target_story_id bigint, display_order integer, reason text)
    WHERE item.target_story_id = p_source_story_id
      OR item.target_story_id IS NULL
      OR item.display_order IS NULL
      OR item.display_order < 0
      OR item.display_order >= item_count
      OR char_length(COALESCE(item.reason, '')) > 255
  ) THEN
    RAISE EXCEPTION 'INVALID_RECOMMENDATION_ITEM';
  END IF;

  IF (
    SELECT count(DISTINCT item.target_story_id)
    FROM jsonb_to_recordset(COALESCE(p_items, '[]'::jsonb))
      AS item(target_story_id bigint, display_order integer, reason text)
  ) <> item_count OR (
    SELECT count(DISTINCT item.display_order)
    FROM jsonb_to_recordset(COALESCE(p_items, '[]'::jsonb))
      AS item(target_story_id bigint, display_order integer, reason text)
  ) <> item_count THEN
    RAISE EXCEPTION 'DUPLICATE_RECOMMENDATION_ITEM';
  END IF;

  IF EXISTS (
    SELECT 1
    FROM jsonb_to_recordset(COALESCE(p_items, '[]'::jsonb))
      AS item(target_story_id bigint, display_order integer, reason text)
    LEFT JOIN public.travel_stories target
      ON target.story_id = item.target_story_id
    WHERE target.story_id IS NULL
      OR target.status <> 'published'
      OR target.is_published IS NOT TRUE
  ) THEN
    RAISE EXCEPTION 'RECOMMENDATION_TARGET_NOT_PUBLIC';
  END IF;

  DELETE FROM public.story_recommendations
  WHERE source_story_id = p_source_story_id;

  INSERT INTO public.story_recommendations (
    source_story_id,
    target_story_id,
    display_order,
    reason,
    is_active,
    created_by
  )
  SELECT
    p_source_story_id,
    item.target_story_id,
    item.display_order,
    NULLIF(btrim(item.reason), ''),
    true,
    p_actor_id
  FROM jsonb_to_recordset(COALESCE(p_items, '[]'::jsonb))
    AS item(target_story_id bigint, display_order integer, reason text)
  ORDER BY item.display_order;
END;
$$;

REVOKE ALL ON FUNCTION public.replace_story_recommendations(bigint, jsonb, uuid)
FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.replace_story_recommendations(bigint, jsonb, uuid)
TO service_role;

COMMIT;
