-- Migration: 20260525115929_add_accommodations_and_relations
-- Description: Create accommodations table and manual curation junction tables

-- ==========================================
-- 1. ACCOMMODATIONS TABLE
-- ==========================================

CREATE TABLE public.accommodations (
    accommodation_id bigint generated always as identity primary key,
    province_id bigint not null references public.provinces(province_id),
    slug varchar(200) not null unique,
    name_th varchar(255) not null,
    name_en varchar(255),
    description_th text,
    description_en text,
    accommodation_type varchar(100),
    latitude numeric(10,7),
    longitude numeric(10,7),
    address_text text,
    contact_info varchar(255),
    cover_image_url text,
    price_range varchar(100),
    is_published boolean not null default false,
    is_active boolean not null default true,
    created_at timestamptz not null default now(),
    updated_at timestamptz
);

COMMENT ON TABLE public.accommodations IS 'ที่พัก โรงแรม รีสอร์ทในพื้นที่';

-- ==========================================
-- 2. MANUAL CURATION JUNCTION TABLES
-- ==========================================

-- For "Things to Do" (Attraction relates to other Attractions)
CREATE TABLE public.attraction_related_attractions (
    id bigint generated always as identity primary key,
    attraction_id bigint not null references public.attractions(attraction_id) on delete cascade,
    related_attraction_id bigint not null references public.attractions(attraction_id) on delete cascade,
    display_order integer not null default 0,
    created_at timestamptz not null default now(),
    unique(attraction_id, related_attraction_id)
);

-- For "Food & Drink" (Attraction relates to Restaurants)
CREATE TABLE public.attraction_related_restaurants (
    id bigint generated always as identity primary key,
    attraction_id bigint not null references public.attractions(attraction_id) on delete cascade,
    restaurant_id bigint not null references public.restaurants(restaurant_id) on delete cascade,
    display_order integer not null default 0,
    created_at timestamptz not null default now(),
    unique(attraction_id, restaurant_id)
);

-- For "Where to Stay" (Attraction relates to Accommodations)
CREATE TABLE public.attraction_related_accommodations (
    id bigint generated always as identity primary key,
    attraction_id bigint not null references public.attractions(attraction_id) on delete cascade,
    accommodation_id bigint not null references public.accommodations(accommodation_id) on delete cascade,
    display_order integer not null default 0,
    created_at timestamptz not null default now(),
    unique(attraction_id, accommodation_id)
);

-- For "Recommended Articles" (Attraction relates to Stories)
CREATE TABLE public.attraction_related_stories (
    id bigint generated always as identity primary key,
    attraction_id bigint not null references public.attractions(attraction_id) on delete cascade,
    story_id bigint not null references public.travel_stories(story_id) on delete cascade,
    display_order integer not null default 0,
    created_at timestamptz not null default now(),
    unique(attraction_id, story_id)
);

-- ==========================================
-- 3. INDEXES
-- ==========================================

CREATE INDEX idx_accommodations_province_id ON public.accommodations(province_id);
CREATE INDEX idx_accommodations_slug ON public.accommodations(slug);
CREATE INDEX idx_accommodations_is_published ON public.accommodations(is_published) WHERE is_published = true;

CREATE INDEX idx_ara_attraction_id ON public.attraction_related_attractions(attraction_id);
CREATE INDEX idx_arr_attraction_id ON public.attraction_related_restaurants(attraction_id);
CREATE INDEX idx_arac_attraction_id ON public.attraction_related_accommodations(attraction_id);
CREATE INDEX idx_ars_attraction_id ON public.attraction_related_stories(attraction_id);

-- ==========================================
-- 4. ROW LEVEL SECURITY
-- ==========================================

ALTER TABLE public.accommodations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.attraction_related_attractions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.attraction_related_restaurants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.attraction_related_accommodations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.attraction_related_stories ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can read published accommodations"
    ON public.accommodations FOR SELECT
    USING (is_published = true AND is_active = true);

CREATE POLICY "Public can read curated relations"
    ON public.attraction_related_attractions FOR SELECT USING (true);
CREATE POLICY "Public can read curated relations"
    ON public.attraction_related_restaurants FOR SELECT USING (true);
CREATE POLICY "Public can read curated relations"
    ON public.attraction_related_accommodations FOR SELECT USING (true);
CREATE POLICY "Public can read curated relations"
    ON public.attraction_related_stories FOR SELECT USING (true);

-- ==========================================
-- 5. TRIGGERS
-- ==========================================

CREATE TRIGGER set_updated_at
    BEFORE UPDATE ON public.accommodations
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
