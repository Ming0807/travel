-- Migration: 20260605000000_add_media_assets_thumbnail
-- Description: Add thumbnail_storage_path column to media_assets for WebP thumbnail support.
-- Backward compatible: nullable column, no data migration needed for existing rows.

ALTER TABLE public.media_assets
ADD COLUMN IF NOT EXISTS thumbnail_storage_path text;

CREATE INDEX IF NOT EXISTS idx_media_assets_thumbnail_path
ON public.media_assets(thumbnail_storage_path)
WHERE thumbnail_storage_path IS NOT NULL;
