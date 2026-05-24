-- ==============================================================================
-- Content Media Migration (Unified Media Linking)
-- ==============================================================================

-- 1. Create content_media table
CREATE TABLE public.content_media (
    media_id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    
    -- Nullable explicit foreign keys for true referential integrity
    attraction_id bigint REFERENCES public.attractions(attraction_id) ON DELETE CASCADE,
    restaurant_id bigint REFERENCES public.restaurants(restaurant_id) ON DELETE CASCADE,
    story_id bigint REFERENCES public.travel_stories(story_id) ON DELETE CASCADE,
    route_id bigint REFERENCES public.suggested_routes(route_id) ON DELETE CASCADE,
    
    media_type varchar(50) NOT NULL CHECK (media_type IN ('image', 'panorama', 'video360', 'embed', 'external_url')),
    storage_path text NOT NULL,
    alt_text_th varchar(255),
    alt_text_en varchar(255),
    caption_th varchar(255),
    caption_en varchar(255),
    
    display_order integer DEFAULT 0,
    is_cover boolean DEFAULT false NOT NULL,
    is_active boolean DEFAULT true NOT NULL,
    
    created_at timestamptz DEFAULT now() NOT NULL,
    updated_at timestamptz
);

-- Constraint to ensure exactly one entity is linked
ALTER TABLE public.content_media
ADD CONSTRAINT content_media_single_entity_check CHECK (
    (attraction_id IS NOT NULL)::integer + 
    (restaurant_id IS NOT NULL)::integer + 
    (story_id IS NOT NULL)::integer + 
    (route_id IS NOT NULL)::integer = 1
);

-- 2. Migrate existing data from attraction_media
INSERT INTO public.content_media (
    attraction_id, media_type, storage_path, 
    alt_text_th, alt_text_en, caption_th, caption_en, 
    display_order, is_cover, is_active, created_at, updated_at
)
SELECT 
    attraction_id, media_type, storage_path, 
    alt_text_th, alt_text_en, caption_th, caption_en, 
    display_order, is_cover, is_active, created_at, updated_at
FROM public.attraction_media;

-- 3. Drop old attraction_media
DROP TABLE public.attraction_media;

-- 4. Create Indexes
CREATE INDEX idx_content_media_attraction ON public.content_media(attraction_id) WHERE attraction_id IS NOT NULL;
CREATE INDEX idx_content_media_restaurant ON public.content_media(restaurant_id) WHERE restaurant_id IS NOT NULL;
CREATE INDEX idx_content_media_story ON public.content_media(story_id) WHERE story_id IS NOT NULL;
CREATE INDEX idx_content_media_route ON public.content_media(route_id) WHERE route_id IS NOT NULL;
CREATE INDEX idx_content_media_order ON public.content_media(display_order);

-- 5. Enable RLS
ALTER TABLE public.content_media ENABLE ROW LEVEL SECURITY;

-- 6. Define Policies
CREATE POLICY "Allow public read access to content_media"
ON public.content_media FOR SELECT
USING (is_active = true);

-- Service Role Policy
CREATE POLICY "Allow service role to manage content_media"
ON public.content_media FOR ALL
USING (auth.uid() IS NULL);
