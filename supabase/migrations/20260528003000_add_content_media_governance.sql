-- Migration: 20260528003000_add_content_media_governance
-- Description: Add rights metadata and lifecycle controls for public content media.

ALTER TABLE public.content_media
ADD COLUMN IF NOT EXISTS credit_text varchar(255),
ADD COLUMN IF NOT EXISTS source_url text,
ADD COLUMN IF NOT EXISTS license_type varchar(80),
ADD COLUMN IF NOT EXISTS usage_notes text,
ADD COLUMN IF NOT EXISTS lifecycle_status varchar(30) NOT NULL DEFAULT 'active',
ADD COLUMN IF NOT EXISTS archived_at timestamptz;

ALTER TABLE public.content_media
DROP CONSTRAINT IF EXISTS content_media_lifecycle_status_check;

ALTER TABLE public.content_media
ADD CONSTRAINT content_media_lifecycle_status_check CHECK (
  lifecycle_status IN ('draft', 'active', 'archived')
);

CREATE INDEX IF NOT EXISTS idx_content_media_lifecycle_status
ON public.content_media(lifecycle_status);

CREATE INDEX IF NOT EXISTS idx_content_media_public_ready
ON public.content_media(is_active, lifecycle_status, display_order);

DROP POLICY IF EXISTS "Allow public read access to content_media"
ON public.content_media;

CREATE POLICY "Allow public read access to content_media"
ON public.content_media FOR SELECT
USING (is_active = true AND lifecycle_status = 'active');
