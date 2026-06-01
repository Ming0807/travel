-- Migration: 20260529000001_unify_content_media
-- Description: Backfill content_media records from legacy cover_image columns on
-- restaurants, accommodations, travel_stories, and suggested_routes.
-- Then drop the legacy columns — content_media is now THE source of truth.
-- Attractions were already migrated earlier in 20260528000000_create_content_media.sql.

-- ============================================================================
-- 1. RESTAURANTS — migrate cover_image_url → content_media
-- ============================================================================

INSERT INTO public.content_media (
    restaurant_id,
    media_type,
    storage_path,
    alt_text_th,
    alt_text_en,
    is_cover,
    is_active,
    lifecycle_status,
    display_order
)
SELECT
    r.restaurant_id,
    'image' AS media_type,
    r.cover_image_url AS storage_path,
    r.name_th AS alt_text_th,
    r.name_en AS alt_text_en,
    TRUE AS is_cover,
    TRUE AS is_active,
    'active' AS lifecycle_status,
    0 AS display_order
FROM public.restaurants r
WHERE r.cover_image_url IS NOT NULL
  AND r.cover_image_url != ''
  AND NOT EXISTS (
      SELECT 1 FROM public.content_media cm
      WHERE cm.restaurant_id = r.restaurant_id
        AND cm.is_cover = TRUE
  );

-- ============================================================================
-- 2. ACCOMMODATIONS — migrate cover_image_url → content_media
-- ============================================================================

-- Ensure content_media has the accommodation_id column (added in
-- 20260528001000). This guard makes the migration self-contained so it
-- works even if prior migrations were skipped or applied out of order.
ALTER TABLE public.content_media
ADD COLUMN IF NOT EXISTS accommodation_id bigint REFERENCES public.accommodations(accommodation_id) ON DELETE CASCADE;

-- Drop and recreate the single-entity check to include accommodation_id
ALTER TABLE public.content_media
DROP CONSTRAINT IF EXISTS content_media_single_entity_check;

ALTER TABLE public.content_media
ADD CONSTRAINT content_media_single_entity_check CHECK (
    (attraction_id IS NOT NULL)::integer +
    (restaurant_id IS NOT NULL)::integer +
    (accommodation_id IS NOT NULL)::integer +
    (story_id IS NOT NULL)::integer +
    (route_id IS NOT NULL)::integer = 1
);

CREATE INDEX IF NOT EXISTS idx_content_media_accommodation
ON public.content_media(accommodation_id)
WHERE accommodation_id IS NOT NULL;

INSERT INTO public.content_media (
    accommodation_id,
    media_type,
    storage_path,
    alt_text_th,
    alt_text_en,
    is_cover,
    is_active,
    lifecycle_status,
    display_order
)
SELECT
    a.accommodation_id,
    'image' AS media_type,
    a.cover_image_url AS storage_path,
    a.name_th AS alt_text_th,
    a.name_en AS alt_text_en,
    TRUE AS is_cover,
    TRUE AS is_active,
    'active' AS lifecycle_status,
    0 AS display_order
FROM public.accommodations a
WHERE a.cover_image_url IS NOT NULL
  AND a.cover_image_url != ''
  AND NOT EXISTS (
      SELECT 1 FROM public.content_media cm
      WHERE cm.accommodation_id = a.accommodation_id
        AND cm.is_cover = TRUE
  );

-- ============================================================================
-- 3. TRAVEL STORIES — migrate image_url → content_media
-- ============================================================================

INSERT INTO public.content_media (
    story_id,
    media_type,
    storage_path,
    alt_text_th,
    alt_text_en,
    is_cover,
    is_active,
    lifecycle_status,
    display_order
)
SELECT
    s.story_id,
    'image' AS media_type,
    s.image_url AS storage_path,
    s.title AS alt_text_th,
    NULL AS alt_text_en,
    TRUE AS is_cover,
    TRUE AS is_active,
    'active' AS lifecycle_status,
    0 AS display_order
FROM public.travel_stories s
WHERE s.image_url IS NOT NULL
  AND s.image_url != ''
  AND NOT EXISTS (
      SELECT 1 FROM public.content_media cm
      WHERE cm.story_id = s.story_id
        AND cm.is_cover = TRUE
  );

-- ============================================================================
-- 4. SUGGESTED ROUTES — migrate cover_image_path → content_media
-- ============================================================================

INSERT INTO public.content_media (
    route_id,
    media_type,
    storage_path,
    alt_text_th,
    alt_text_en,
    is_cover,
    is_active,
    lifecycle_status,
    display_order
)
SELECT
    r.route_id,
    'image' AS media_type,
    r.cover_image_path AS storage_path,
    r.name_th AS alt_text_th,
    r.name_en AS alt_text_en,
    TRUE AS is_cover,
    TRUE AS is_active,
    'active' AS lifecycle_status,
    0 AS display_order
FROM public.suggested_routes r
WHERE r.cover_image_path IS NOT NULL
  AND r.cover_image_path != ''
  AND NOT EXISTS (
      SELECT 1 FROM public.content_media cm
      WHERE cm.route_id = r.route_id
        AND cm.is_cover = TRUE
  );

-- ============================================================================
-- 5. DROP LEGACY COLUMNS
-- ============================================================================

ALTER TABLE public.restaurants DROP COLUMN IF EXISTS cover_image_url;
ALTER TABLE public.accommodations DROP COLUMN IF EXISTS cover_image_url;
ALTER TABLE public.travel_stories DROP COLUMN IF EXISTS image_url;
ALTER TABLE public.suggested_routes DROP COLUMN IF EXISTS cover_image_path;
ALTER TABLE public.attractions DROP COLUMN IF EXISTS cover_image_path;

-- ============================================================================
-- 6. UPDATE RLS POLICIES — content_media now serves cover images for all types
--    Existing policies already cover restaurant_id, story_id, route_id,
--    and the accommodation FK was added in 20260528001000.
--    No policy changes needed — the existing "public read active" policy covers
--    all entity types via the is_active/lifecycle_status check.
-- ============================================================================

-- Ensure indexes exist for all entity FK columns
CREATE INDEX IF NOT EXISTS idx_content_media_restaurant
    ON public.content_media(restaurant_id) WHERE restaurant_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_content_media_story
    ON public.content_media(story_id) WHERE story_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_content_media_route
    ON public.content_media(route_id) WHERE route_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_content_media_accommodation
    ON public.content_media(accommodation_id) WHERE accommodation_id IS NOT NULL;
