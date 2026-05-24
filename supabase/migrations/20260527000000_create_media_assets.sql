-- ==============================================================================
-- Site Media Assets Migration
-- ==============================================================================

-- 1. Create site-media bucket
INSERT INTO storage.buckets (id, name, public)
VALUES ('site-media', 'site-media', true)
ON CONFLICT (id) DO NOTHING;

-- 2. Define Storage Policies for site-media
-- Public can read
CREATE POLICY "Public can view site media"
ON storage.objects FOR SELECT
USING (bucket_id = 'site-media');

-- Service role can do everything
CREATE POLICY "Service role can upload site media"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'site-media');

CREATE POLICY "Service role can update site media"
ON storage.objects FOR UPDATE
USING (bucket_id = 'site-media');

CREATE POLICY "Service role can delete site media"
ON storage.objects FOR DELETE
USING (bucket_id = 'site-media');

-- 3. Create media_assets table
CREATE TABLE public.media_assets (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    file_name text NOT NULL,
    storage_path text NOT NULL UNIQUE,
    mime_type varchar(50) NOT NULL,
    size_bytes bigint NOT NULL,
    category varchar(50) DEFAULT 'General' NOT NULL,
    created_at timestamptz DEFAULT now() NOT NULL,
    uploaded_by uuid REFERENCES auth.users(id) ON DELETE SET NULL
);

-- 4. Enable RLS
ALTER TABLE public.media_assets ENABLE ROW LEVEL SECURITY;

-- 5. Define Table Policies
-- Public read access
CREATE POLICY "Allow public read access to media_assets"
ON public.media_assets FOR SELECT
USING (true);

-- Admin manage access
CREATE POLICY "Allow admins to manage media_assets"
ON public.media_assets FOR ALL
USING (
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

-- Service Role Policy (Optional, but good for backend scripts bypassing RLS anyway)
CREATE POLICY "Allow service role to manage media_assets"
ON public.media_assets FOR ALL
USING (auth.uid() IS NULL);
