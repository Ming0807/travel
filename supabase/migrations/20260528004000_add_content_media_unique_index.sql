-- Migration: 20260528004000_add_content_media_unique_index
-- Description: Add unique index on content_media(attraction_id, storage_path)
-- to mirror the original attraction_media constraint that was dropped when
-- the table was migrated to content_media. This supports rerunnable seed.sql
-- ON CONFLICT DO UPDATE and prevents duplicate media records.

CREATE UNIQUE INDEX IF NOT EXISTS uq_content_media_attraction_storage_path
  ON public.content_media(attraction_id, storage_path)
  WHERE attraction_id IS NOT NULL;
