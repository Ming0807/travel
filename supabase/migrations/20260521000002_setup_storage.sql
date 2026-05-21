-- Migration: 20260521000002_setup_storage
-- Description: Create storage buckets and define strict RLS policies

-- 1. Create Buckets
INSERT INTO storage.buckets (id, name, public) 
VALUES 
  ('visit-photos', 'visit-photos', false),
  ('certificate-files', 'certificate-files', false),
  ('export-files', 'export-files', false),
  ('stamp-assets', 'stamp-assets', true),
  ('attraction-media', 'attraction-media', true)
ON CONFLICT (id) DO NOTHING;

-- 2. (RLS is enabled by default on storage.objects in Supabase)

-- 3. Define Policies for visit-photos (Private)
-- Only the backend service role should be able to read/write visit-photos
CREATE POLICY "Service role can upload visit-photos" 
ON storage.objects FOR INSERT 
TO service_role
WITH CHECK (bucket_id = 'visit-photos');

CREATE POLICY "Service role can read visit-photos" 
ON storage.objects FOR SELECT 
TO service_role
USING (bucket_id = 'visit-photos');

-- 4. Define Policies for certificate-files (Private, Service Role Only)
CREATE POLICY "Service role can read certificates" 
ON storage.objects FOR SELECT 
TO service_role
USING (bucket_id = 'certificate-files');

CREATE POLICY "Service role can upload certificates" 
ON storage.objects FOR INSERT 
TO service_role
WITH CHECK (bucket_id = 'certificate-files');

-- 5. Define Policies for export-files (Private, Service Role Only)
CREATE POLICY "Service role can read exports"
ON storage.objects FOR SELECT
TO service_role
USING (bucket_id = 'export-files');

CREATE POLICY "Service role can upload exports"
ON storage.objects FOR INSERT
TO service_role
WITH CHECK (bucket_id = 'export-files');

-- 6. Define Policies for stamp-assets (Public Read, Service Role Write)
CREATE POLICY "Public can view stamp assets"
ON storage.objects FOR SELECT
USING (bucket_id = 'stamp-assets');

CREATE POLICY "Service role can upload stamp assets"
ON storage.objects FOR INSERT
TO service_role
WITH CHECK (bucket_id = 'stamp-assets');

-- 7. Define Policies for attraction-media (Public Read, Service Role Write)
CREATE POLICY "Public can view attraction media" 
ON storage.objects FOR SELECT 
USING (bucket_id = 'attraction-media');

CREATE POLICY "Service role can upload attraction media" 
ON storage.objects FOR INSERT 
TO service_role
WITH CHECK (bucket_id = 'attraction-media');

CREATE POLICY "Service role can update attraction media" 
ON storage.objects FOR UPDATE 
TO service_role
USING (bucket_id = 'attraction-media');

CREATE POLICY "Service role can delete attraction media" 
ON storage.objects FOR DELETE 
TO service_role
USING (bucket_id = 'attraction-media');
