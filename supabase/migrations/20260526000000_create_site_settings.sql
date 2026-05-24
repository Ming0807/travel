-- ==============================================================================
-- Site Settings (CMS Module)
-- ==============================================================================

-- 1. Create site_settings table
CREATE TABLE public.site_settings (
    setting_key text PRIMARY KEY,
    setting_value jsonb NOT NULL,
    description text,
    created_at timestamptz DEFAULT now() NOT NULL,
    updated_at timestamptz DEFAULT now() NOT NULL,
    updated_by uuid REFERENCES auth.users(id) ON DELETE SET NULL
);

-- 2. Add RLS Policies
ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;

-- Allow public read access to settings (for frontend rendering)
CREATE POLICY "Allow public read access to site_settings"
    ON public.site_settings
    FOR SELECT
    USING (true);

-- Allow admins to manage settings
CREATE POLICY "Allow admins to manage site_settings"
    ON public.site_settings
    FOR ALL
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

-- 3. Add Updated_At trigger
CREATE TRIGGER update_site_settings_updated_at
    BEFORE UPDATE ON public.site_settings
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

-- 4. Seed initial settings for the homepage
INSERT INTO public.site_settings (setting_key, setting_value, description)
VALUES 
    ('homepage_hero', '{
        "title": "ค้นพบความมหัศจรรย์ที่ซ่อนเร้น",
        "subtitle": "ออกเดินทางสู่ดินแดนแห่งมนต์เสน่ห์",
        "description": "ตามหาช่วงเวลาสุดพิเศษและสถานที่ที่ซ่อนเร้นเพื่อจุดประกายประสบการณ์ที่ไม่มีวันลืม ในยะลา ปัตตานี และนราธิวาส",
        "images": [
            "https://images.unsplash.com/photo-1549880181-56a44cf4a9a1?auto=format&fit=crop&w=800&q=85",
            "https://images.unsplash.com/photo-1584551246679-0daf3d275d0f?auto=format&fit=crop&w=800&q=85",
            "https://images.unsplash.com/photo-1546182990-dffeafbe841d?auto=format&fit=crop&w=800&q=85"
        ]
    }', 'Configuration for Homepage Hero section'),
    
    ('homepage_featured', '{
        "attractionIds": [],
        "storyIds": []
    }', 'IDs of featured attractions and stories on the homepage');
