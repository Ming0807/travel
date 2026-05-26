-- Migration: 20260528001000_add_accommodation_content_media
-- Description: Allow unified content media records to belong to accommodations.

ALTER TABLE public.content_media
ADD COLUMN IF NOT EXISTS accommodation_id bigint REFERENCES public.accommodations(accommodation_id) ON DELETE CASCADE;

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
