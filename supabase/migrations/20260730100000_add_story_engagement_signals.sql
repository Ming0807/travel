BEGIN;

CREATE TABLE IF NOT EXISTS public.story_engagement_events (
  event_id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  story_id bigint NOT NULL REFERENCES public.travel_stories(story_id) ON DELETE CASCADE,
  related_story_id bigint REFERENCES public.travel_stories(story_id) ON DELETE CASCADE,
  event_name text NOT NULL CHECK (
    event_name IN (
      'story_impression',
      'story_open',
      'related_content_click',
      'meaningful_read_complete'
    )
  ),
  surface text NOT NULL CHECK (
    surface IN ('story_hub', 'story_detail', 'related_rail')
  ),
  locale text NOT NULL DEFAULT 'th' CHECK (locale IN ('th', 'en')),
  position smallint CHECK (position BETWEEN 1 AND 24),
  occurred_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT story_engagement_event_shape_check CHECK (
    (
      event_name = 'story_impression'
      AND surface = 'story_hub'
      AND related_story_id IS NULL
      AND position IS NOT NULL
    )
    OR (
      event_name = 'story_open'
      AND surface = 'story_detail'
      AND related_story_id IS NULL
      AND position IS NULL
    )
    OR (
      event_name = 'meaningful_read_complete'
      AND surface = 'story_detail'
      AND related_story_id IS NULL
      AND position IS NULL
    )
    OR (
      event_name = 'related_content_click'
      AND surface = 'related_rail'
      AND related_story_id IS NOT NULL
      AND related_story_id <> story_id
      AND position IS NOT NULL
    )
  )
);

CREATE TABLE IF NOT EXISTS public.story_engagement_daily (
  aggregate_id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  aggregation_day date NOT NULL,
  story_id bigint NOT NULL REFERENCES public.travel_stories(story_id) ON DELETE CASCADE,
  related_story_id bigint REFERENCES public.travel_stories(story_id) ON DELETE CASCADE,
  event_name text NOT NULL CHECK (
    event_name IN (
      'story_impression',
      'story_open',
      'related_content_click',
      'meaningful_read_complete'
    )
  ),
  surface text NOT NULL CHECK (
    surface IN ('story_hub', 'story_detail', 'related_rail')
  ),
  locale text NOT NULL CHECK (locale IN ('th', 'en')),
  event_count bigint NOT NULL CHECK (event_count >= 0),
  unique_session_count bigint NOT NULL CHECK (unique_session_count >= 0),
  generated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT story_engagement_daily_dimensions_key
    UNIQUE NULLS NOT DISTINCT (
      aggregation_day,
      story_id,
      related_story_id,
      event_name,
      surface,
      locale
    )
);

CREATE TABLE IF NOT EXISTS public.story_engagement_dedup (
  dedup_hash text PRIMARY KEY CHECK (dedup_hash ~ '^[a-f0-9]{64}$'),
  expires_at timestamptz NOT NULL
);

CREATE TABLE IF NOT EXISTS public.story_engagement_rate_buckets (
  bucket_hash text PRIMARY KEY CHECK (bucket_hash ~ '^[a-f0-9]{64}$'),
  event_count integer NOT NULL DEFAULT 1 CHECK (event_count > 0),
  expires_at timestamptz NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_story_engagement_events_occurred
  ON public.story_engagement_events(occurred_at);
CREATE INDEX IF NOT EXISTS idx_story_engagement_events_story_event
  ON public.story_engagement_events(story_id, event_name, occurred_at);
CREATE INDEX IF NOT EXISTS idx_story_engagement_daily_story_day
  ON public.story_engagement_daily(story_id, aggregation_day DESC);
CREATE INDEX IF NOT EXISTS idx_story_engagement_dedup_expiry
  ON public.story_engagement_dedup(expires_at);
CREATE INDEX IF NOT EXISTS idx_story_engagement_rate_expiry
  ON public.story_engagement_rate_buckets(expires_at);

ALTER TABLE public.story_engagement_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.story_engagement_daily ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.story_engagement_dedup ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.story_engagement_rate_buckets ENABLE ROW LEVEL SECURITY;

REVOKE ALL ON public.story_engagement_events FROM PUBLIC, anon, authenticated;
REVOKE ALL ON public.story_engagement_daily FROM PUBLIC, anon, authenticated;
REVOKE ALL ON public.story_engagement_dedup FROM PUBLIC, anon, authenticated;
REVOKE ALL ON public.story_engagement_rate_buckets FROM PUBLIC, anon, authenticated;
GRANT ALL ON public.story_engagement_events TO service_role;
GRANT ALL ON public.story_engagement_daily TO service_role;
GRANT ALL ON public.story_engagement_dedup TO service_role;
GRANT ALL ON public.story_engagement_rate_buckets TO service_role;

CREATE OR REPLACE FUNCTION public.consume_story_engagement_rate_limit(
  p_source_bucket_hash text,
  p_content_bucket_hash text,
  p_source_limit integer,
  p_content_limit integer,
  p_expires_at timestamptz
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  source_count integer;
  content_count integer;
BEGIN
  IF p_source_bucket_hash !~ '^[a-f0-9]{64}$'
     OR p_content_bucket_hash !~ '^[a-f0-9]{64}$'
     OR p_source_limit < 1
     OR p_content_limit < 1
     OR p_expires_at <= now() THEN
    RAISE EXCEPTION 'INVALID_STORY_ENGAGEMENT_RATE_LIMIT';
  END IF;

  INSERT INTO public.story_engagement_rate_buckets (
    bucket_hash,
    event_count,
    expires_at
  )
  VALUES (p_source_bucket_hash, 1, p_expires_at)
  ON CONFLICT (bucket_hash) DO UPDATE
  SET event_count = public.story_engagement_rate_buckets.event_count + 1,
      expires_at = GREATEST(
        public.story_engagement_rate_buckets.expires_at,
        EXCLUDED.expires_at
      )
  RETURNING event_count INTO source_count;

  INSERT INTO public.story_engagement_rate_buckets (
    bucket_hash,
    event_count,
    expires_at
  )
  VALUES (p_content_bucket_hash, 1, p_expires_at)
  ON CONFLICT (bucket_hash) DO UPDATE
  SET event_count = public.story_engagement_rate_buckets.event_count + 1,
      expires_at = GREATEST(
        public.story_engagement_rate_buckets.expires_at,
        EXCLUDED.expires_at
      )
  RETURNING event_count INTO content_count;

  RETURN source_count <= p_source_limit AND content_count <= p_content_limit;
END;
$$;

CREATE OR REPLACE FUNCTION public.record_story_engagement_event(
  p_story_id bigint,
  p_related_story_id bigint,
  p_event_name text,
  p_surface text,
  p_locale text,
  p_position smallint,
  p_dedup_hash text,
  p_dedup_expires_at timestamptz
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
  IF p_story_id IS NULL
     OR p_story_id <= 0
     OR p_dedup_hash !~ '^[a-f0-9]{64}$'
     OR p_dedup_expires_at <= now() THEN
    RAISE EXCEPTION 'INVALID_STORY_ENGAGEMENT_EVENT';
  END IF;

  IF NOT EXISTS (
    SELECT 1
    FROM public.travel_stories
    WHERE story_id = p_story_id
      AND status = 'published'
      AND is_published = true
  ) THEN
    RAISE EXCEPTION 'STORY_NOT_PUBLIC';
  END IF;

  IF p_related_story_id IS NOT NULL AND NOT EXISTS (
    SELECT 1
    FROM public.travel_stories
    WHERE story_id = p_related_story_id
      AND status = 'published'
      AND is_published = true
  ) THEN
    RAISE EXCEPTION 'RELATED_STORY_NOT_PUBLIC';
  END IF;

  INSERT INTO public.story_engagement_dedup(dedup_hash, expires_at)
  VALUES (p_dedup_hash, p_dedup_expires_at)
  ON CONFLICT (dedup_hash) DO UPDATE
  SET expires_at = EXCLUDED.expires_at
  WHERE public.story_engagement_dedup.expires_at <= now();

  IF NOT FOUND THEN
    RETURN false;
  END IF;

  INSERT INTO public.story_engagement_events (
    story_id,
    related_story_id,
    event_name,
    surface,
    locale,
    position
  )
  VALUES (
    p_story_id,
    p_related_story_id,
    p_event_name,
    p_surface,
    p_locale,
    p_position
  );

  RETURN true;
END;
$$;

CREATE OR REPLACE FUNCTION public.aggregate_story_engagement_events(
  p_before timestamptz DEFAULT (
    date_trunc('day', now() AT TIME ZONE 'Asia/Bangkok')
    AT TIME ZONE 'Asia/Bangkok'
  )
)
RETURNS bigint
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  affected_rows bigint;
BEGIN
  IF p_before > now() THEN
    RAISE EXCEPTION 'INVALID_STORY_ENGAGEMENT_AGGREGATION_CUTOFF';
  END IF;

  INSERT INTO public.story_engagement_daily (
    aggregation_day,
    story_id,
    related_story_id,
    event_name,
    surface,
    locale,
    event_count,
    unique_session_count,
    generated_at
  )
  SELECT
    (occurred_at AT TIME ZONE 'Asia/Bangkok')::date,
    story_id,
    related_story_id,
    event_name,
    surface,
    locale,
    count(*),
    count(*),
    now()
  FROM public.story_engagement_events
  WHERE occurred_at < p_before
  GROUP BY
    (occurred_at AT TIME ZONE 'Asia/Bangkok')::date,
    story_id,
    related_story_id,
    event_name,
    surface,
    locale
  ON CONFLICT ON CONSTRAINT story_engagement_daily_dimensions_key
  DO UPDATE SET
    event_count = EXCLUDED.event_count,
    unique_session_count = EXCLUDED.unique_session_count,
    generated_at = now();

  GET DIAGNOSTICS affected_rows = ROW_COUNT;
  RETURN affected_rows;
END;
$$;

CREATE OR REPLACE FUNCTION public.purge_story_engagement_data()
RETURNS TABLE (
  deleted_events bigint,
  deleted_dedup bigint,
  deleted_rate_buckets bigint
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  event_rows bigint;
  dedup_rows bigint;
  rate_rows bigint;
BEGIN
  DELETE FROM public.story_engagement_events
  WHERE occurred_at < now() - interval '30 days';
  GET DIAGNOSTICS event_rows = ROW_COUNT;

  DELETE FROM public.story_engagement_dedup
  WHERE expires_at < now()
     OR expires_at < now() - interval '24 hours';
  GET DIAGNOSTICS dedup_rows = ROW_COUNT;

  DELETE FROM public.story_engagement_rate_buckets
  WHERE expires_at < now()
     OR expires_at < now() - interval '24 hours';
  GET DIAGNOSTICS rate_rows = ROW_COUNT;

  RETURN QUERY SELECT event_rows, dedup_rows, rate_rows;
END;
$$;

REVOKE ALL ON FUNCTION public.consume_story_engagement_rate_limit(
  text,
  text,
  integer,
  integer,
  timestamptz
) FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.record_story_engagement_event(
  bigint,
  bigint,
  text,
  text,
  text,
  smallint,
  text,
  timestamptz
) FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.aggregate_story_engagement_events(timestamptz)
  FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.purge_story_engagement_data()
  FROM PUBLIC, anon, authenticated;

GRANT EXECUTE ON FUNCTION public.consume_story_engagement_rate_limit(
  text,
  text,
  integer,
  integer,
  timestamptz
) TO service_role;
GRANT EXECUTE ON FUNCTION public.record_story_engagement_event(
  bigint,
  bigint,
  text,
  text,
  text,
  smallint,
  text,
  timestamptz
) TO service_role;
GRANT EXECUTE ON FUNCTION public.aggregate_story_engagement_events(timestamptz)
  TO service_role;
GRANT EXECUTE ON FUNCTION public.purge_story_engagement_data()
  TO service_role;

COMMIT;
