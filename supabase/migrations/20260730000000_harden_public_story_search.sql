-- Harden the public Story feed after the structured editorial rollout.
-- This migration is idempotent and does not modify story content.

CREATE EXTENSION IF NOT EXISTS pg_trgm;

CREATE INDEX IF NOT EXISTS idx_travel_stories_public_feed_stable
  ON public.travel_stories(published_at DESC, story_id DESC)
  WHERE status = 'published' AND is_published = true;

CREATE INDEX IF NOT EXISTS idx_travel_stories_public_title_trgm
  ON public.travel_stories USING gin (title gin_trgm_ops)
  WHERE status = 'published' AND is_published = true;

CREATE INDEX IF NOT EXISTS idx_travel_stories_public_excerpt_trgm
  ON public.travel_stories USING gin (excerpt gin_trgm_ops)
  WHERE status = 'published' AND is_published = true;

DROP POLICY IF EXISTS "Public can view published stories"
  ON public.travel_stories;

CREATE POLICY "Public can view published stories"
ON public.travel_stories
FOR SELECT
TO anon, authenticated
USING (status = 'published' AND is_published = true);
