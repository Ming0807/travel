-- Phase 12: storage privacy hardening for already-created Supabase projects.
-- Fresh projects should also use the corrected setup_storage migration.

INSERT INTO storage.buckets (id, name, public)
VALUES
  ('visit-photos', 'visit-photos', false),
  ('certificate-files', 'certificate-files', false),
  ('export-files', 'export-files', false),
  ('stamp-assets', 'stamp-assets', true)
ON CONFLICT (id) DO UPDATE
SET public = excluded.public;

UPDATE storage.buckets
SET public = false
WHERE id IN ('visit-photos', 'certificate-files', 'export-files');

DROP POLICY IF EXISTS "Public can view generated certificates" ON storage.objects;

DROP POLICY IF EXISTS "Service role can read certificates" ON storage.objects;
CREATE POLICY "Service role can read certificates"
ON storage.objects FOR SELECT
TO service_role
USING (bucket_id = 'certificate-files');

DROP POLICY IF EXISTS "Service role can read exports" ON storage.objects;
CREATE POLICY "Service role can read exports"
ON storage.objects FOR SELECT
TO service_role
USING (bucket_id = 'export-files');

DROP POLICY IF EXISTS "Service role can upload exports" ON storage.objects;
CREATE POLICY "Service role can upload exports"
ON storage.objects FOR INSERT
TO service_role
WITH CHECK (bucket_id = 'export-files');

DROP POLICY IF EXISTS "Public can view stamp assets" ON storage.objects;
CREATE POLICY "Public can view stamp assets"
ON storage.objects FOR SELECT
USING (bucket_id = 'stamp-assets');

DROP POLICY IF EXISTS "Service role can upload stamp assets" ON storage.objects;
CREATE POLICY "Service role can upload stamp assets"
ON storage.objects FOR INSERT
TO service_role
WITH CHECK (bucket_id = 'stamp-assets');
