-- Apply one editorial save as a single PostgreSQL transaction:
-- story update, taxonomy replacement, immutable revision, and workflow event.

CREATE OR REPLACE FUNCTION public.apply_story_editorial_change(
  p_story_id bigint,
  p_expected_updated_at timestamptz,
  p_actor_id uuid,
  p_title text,
  p_slug text,
  p_excerpt text,
  p_content text,
  p_content_document jsonb,
  p_content_schema_version integer,
  p_province_id bigint,
  p_geographic_scope text,
  p_primary_language text,
  p_seo_title text,
  p_seo_description text,
  p_scheduled_at timestamptz,
  p_reading_minutes integer,
  p_content_quality_score integer,
  p_status text,
  p_topic_ids bigint[],
  p_snapshot_extras jsonb,
  p_source_action text,
  p_review_note text,
  p_change_summary text
) RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_current public.travel_stories%ROWTYPE;
  v_updated public.travel_stories%ROWTYPE;
  v_revision_number integer;
  v_valid_topic_count integer;
  v_normalized_topic_ids bigint[];
  v_snapshot jsonb;
BEGIN
  SELECT *
  INTO v_current
  FROM public.travel_stories
  WHERE story_id = p_story_id
  FOR UPDATE;

  IF NOT FOUND THEN
    RETURN jsonb_build_object('success', false, 'error_code', 'STORY_NOT_FOUND');
  END IF;

  IF p_expected_updated_at IS NULL
    OR COALESCE(v_current.updated_at, v_current.created_at) IS DISTINCT FROM p_expected_updated_at THEN
    RETURN jsonb_build_object('success', false, 'error_code', 'EDIT_CONFLICT');
  END IF;

  SELECT COALESCE(array_agg(topic_id ORDER BY first_position), '{}'::bigint[])
  INTO v_normalized_topic_ids
  FROM (
    SELECT topic_id, MIN(position) AS first_position
    FROM unnest(COALESCE(p_topic_ids, '{}'::bigint[])) WITH ORDINALITY AS input(topic_id, position)
    GROUP BY topic_id
  ) normalized;

  SELECT COUNT(*)
  INTO v_valid_topic_count
  FROM public.story_topics
  WHERE topic_id = ANY(v_normalized_topic_ids)
    AND is_active = true;

  IF v_valid_topic_count <> cardinality(v_normalized_topic_ids) THEN
    RETURN jsonb_build_object('success', false, 'error_code', 'INVALID_TOPIC');
  END IF;

  UPDATE public.travel_stories
  SET
    title = p_title,
    slug = p_slug,
    excerpt = p_excerpt,
    content = p_content,
    content_document = p_content_document,
    content_schema_version = p_content_schema_version,
    province_id = p_province_id,
    geographic_scope = p_geographic_scope,
    primary_language = p_primary_language,
    seo_title = p_seo_title,
    seo_description = p_seo_description,
    scheduled_at = CASE WHEN p_status = 'scheduled' THEN p_scheduled_at ELSE NULL END,
    reading_minutes = p_reading_minutes,
    content_quality_score = p_content_quality_score,
    status = p_status,
    reviewed_by = CASE
      WHEN p_status IN ('approved', 'changes_requested', 'rejected') THEN p_actor_id
      ELSE reviewed_by
    END,
    reviewed_at = CASE
      WHEN p_status IN ('approved', 'changes_requested', 'rejected') THEN now()
      ELSE reviewed_at
    END
  WHERE story_id = p_story_id
  RETURNING * INTO v_updated;

  DELETE FROM public.story_topic_links
  WHERE story_id = p_story_id;

  INSERT INTO public.story_topic_links (story_id, topic_id, is_primary, created_by)
  SELECT
    p_story_id,
    topic_id,
    position = 1,
    p_actor_id
  FROM unnest(v_normalized_topic_ids) WITH ORDINALITY AS topics(topic_id, position);

  SELECT COALESCE(MAX(revision_number), 0) + 1
  INTO v_revision_number
  FROM public.story_revisions
  WHERE story_id = p_story_id;

  v_snapshot := jsonb_build_object(
    'storyId', v_updated.story_id,
    'authorType', v_updated.author_type,
    'status', v_updated.status,
    'title', v_updated.title,
    'slug', v_updated.slug,
    'excerpt', v_updated.excerpt,
    'legacyContent', v_updated.content,
    'contentDocument', v_updated.content_document,
    'contentSchemaVersion', v_updated.content_schema_version,
    'provinceId', v_updated.province_id,
    'geographicScope', v_updated.geographic_scope,
    'primaryLanguage', v_updated.primary_language,
    'seoTitle', v_updated.seo_title,
    'seoDescription', v_updated.seo_description,
    'scheduledAt', v_updated.scheduled_at,
    'readingMinutes', v_updated.reading_minutes,
    'contentQualityScore', v_updated.content_quality_score,
    'topicIds', to_jsonb(v_normalized_topic_ids),
    'coverMediaId', COALESCE(p_snapshot_extras -> 'coverMediaId', 'null'::jsonb),
    'usesGeneratedSeo', COALESCE(p_snapshot_extras -> 'usesGeneratedSeo', 'false'::jsonb)
  );

  INSERT INTO public.story_revisions (
    story_id,
    revision_number,
    snapshot,
    content_schema_version,
    source_action,
    change_summary,
    created_by
  ) VALUES (
    p_story_id,
    v_revision_number,
    v_snapshot,
    v_updated.content_schema_version,
    p_source_action,
    NULLIF(trim(p_change_summary), ''),
    p_actor_id
  );

  IF v_current.status IS DISTINCT FROM v_updated.status THEN
    INSERT INTO public.story_review_events (
      story_id,
      from_status,
      to_status,
      review_note,
      reviewer_id
    ) VALUES (
      p_story_id,
      v_current.status,
      v_updated.status,
      NULLIF(trim(p_review_note), ''),
      p_actor_id
    );
  END IF;

  RETURN jsonb_build_object(
    'success', true,
    'story_id', v_updated.story_id,
    'updated_at', v_updated.updated_at,
    'revision_number', v_revision_number
  );
EXCEPTION
  WHEN unique_violation THEN
    RETURN jsonb_build_object('success', false, 'error_code', 'DUPLICATE_SLUG');
  WHEN foreign_key_violation THEN
    RETURN jsonb_build_object('success', false, 'error_code', 'INVALID_REFERENCE');
  WHEN check_violation THEN
    RETURN jsonb_build_object('success', false, 'error_code', 'INVALID_EDITORIAL_DATA');
  WHEN OTHERS THEN
    RETURN jsonb_build_object('success', false, 'error_code', 'EDITORIAL_CHANGE_FAILED');
END;
$$;

REVOKE ALL ON FUNCTION public.apply_story_editorial_change(
  bigint, timestamptz, uuid, text, text, text, text, jsonb, integer, bigint,
  text, text, text, text, timestamptz, integer, integer, text, bigint[], jsonb,
  text, text, text
) FROM PUBLIC, anon, authenticated;

GRANT EXECUTE ON FUNCTION public.apply_story_editorial_change(
  bigint, timestamptz, uuid, text, text, text, text, jsonb, integer, bigint,
  text, text, text, text, timestamptz, integer, integer, text, bigint[], jsonb,
  text, text, text
) TO service_role;
