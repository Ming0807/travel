-- Migration: 20260529000000_add_media_assets_lifecycle
-- Description: Add lifecycle controls to media_assets for archive/unarchive workflow.

ALTER TABLE public.media_assets
ADD COLUMN IF NOT EXISTS lifecycle_status varchar(30) NOT NULL DEFAULT 'active';

ALTER TABLE public.media_assets
ADD COLUMN IF NOT EXISTS archived_at timestamptz;

ALTER TABLE public.media_assets
ADD COLUMN IF NOT EXISTS archived_by uuid REFERENCES auth.users(id) ON DELETE SET NULL;

ALTER TABLE public.media_assets
DROP CONSTRAINT IF EXISTS media_assets_lifecycle_status_check;

ALTER TABLE public.media_assets
ADD CONSTRAINT media_assets_lifecycle_status_check CHECK (
  lifecycle_status IN ('active', 'archived')
);

CREATE INDEX IF NOT EXISTS idx_media_assets_lifecycle_status
ON public.media_assets(lifecycle_status);

-- Only show active assets in public queries by default
DROP POLICY IF EXISTS "Allow public read access to media_assets" ON public.media_assets;

CREATE POLICY "Allow public read access to media_assets"
ON public.media_assets FOR SELECT
USING (lifecycle_status = 'active');

-- Admins can see all
DROP POLICY IF EXISTS "Allow admins to manage media_assets" ON public.media_assets;

CREATE POLICY "Allow admins to manage media_assets"
ON public.media_assets FOR ALL
USING (
  lifecycle_status IS NOT NULL AND
  EXISTS (
    SELECT 1 FROM public.admin_users au
    JOIN public.admin_user_roles aur ON au.admin_id = aur.admin_id
    JOIN public.roles r ON aur.role_id = r.role_id
    WHERE au.auth_user_id = auth.uid() AND r.role_name IN ('admin', 'superadmin')
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.admin_users au
    JOIN public.admin_user_roles aur ON au.admin_id = aur.admin_id
    JOIN public.roles r ON aur.role_id = r.role_id
    WHERE au.auth_user_id = auth.uid() AND r.role_name IN ('admin', 'superadmin')
  )
);
