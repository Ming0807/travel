-- Migration: 20260610000000_add_public_listing_indexes
-- Description: Add specific performance indexes for public attraction listing and reviews

-- Enable pg_trgm for text search if not already enabled
CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- Partial index for public active attractions (used heavily in listPublicAttractionCards)
CREATE INDEX IF NOT EXISTS idx_attractions_published_active
  ON public.attractions (created_at DESC)
  WHERE is_published = true AND is_active = true;

-- Trigram indexes for text search in attractions (name_th, name_en)
CREATE INDEX IF NOT EXISTS idx_attractions_name_th_trgm
  ON public.attractions USING gin (name_th gin_trgm_ops);

CREATE INDEX IF NOT EXISTS idx_attractions_name_en_trgm
  ON public.attractions USING gin (name_en gin_trgm_ops);

-- Partial index for active and published reviews by attraction (used in withReviewSummaries)
CREATE INDEX IF NOT EXISTS idx_reviews_public_attraction
  ON public.reviews (attraction_id, rating)
  WHERE is_approved = true AND is_published = true AND deleted_at IS NULL;

-- Partial index for active and published reviews by restaurant
CREATE INDEX IF NOT EXISTS idx_reviews_public_restaurant
  ON public.reviews (restaurant_id, rating)
  WHERE is_approved = true AND is_published = true AND deleted_at IS NULL;
