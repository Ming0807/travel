-- Migration: 20260523000000_create_restaurants_module
-- Description: Create restaurants and restaurant_attractions tables to support
-- the Local Economy / Restaurants module for the Smart Tourism platform.

-- ==========================================
-- 1. RESTAURANTS TABLE
-- ==========================================

CREATE TABLE public.restaurants (
    restaurant_id bigint generated always as identity primary key,
    province_id bigint not null references public.provinces(province_id),
    slug varchar(200) not null unique,
    name_th varchar(255) not null,
    name_en varchar(255),
    description_th text,
    description_en text,
    food_type varchar(100),
    latitude numeric(10,7),
    longitude numeric(10,7),
    address_text text,
    opening_hours varchar(255),
    contact_info varchar(255),
    cover_image_url text,
    is_published boolean not null default false,
    is_active boolean not null default true,
    created_at timestamptz not null default now(),
    updated_at timestamptz
);

COMMENT ON TABLE public.restaurants IS 'ร้านอาหารและธุรกิจชุมชนในพื้นที่จังหวัดชายแดนใต้';
COMMENT ON COLUMN public.restaurants.food_type IS 'ประเภทอาหาร เช่น Thai, Malay, International, Coffee, Bakery';
COMMENT ON COLUMN public.restaurants.latitude IS 'พิกัดละติจูดสำหรับแสดงแผนที่';
COMMENT ON COLUMN public.restaurants.longitude IS 'พิกัดลองจิจูดสำหรับแสดงแผนที่';

-- ==========================================
-- 2. RESTAURANT-ATTRACTION JUNCTION TABLE
-- ==========================================

CREATE TABLE public.restaurant_attractions (
    restaurant_attraction_id bigint generated always as identity primary key,
    restaurant_id bigint not null references public.restaurants(restaurant_id) on delete cascade,
    attraction_id bigint not null references public.attractions(attraction_id) on delete cascade,
    distance_text varchar(100),
    display_order integer not null default 0,
    created_at timestamptz not null default now(),
    unique(restaurant_id, attraction_id)
);

COMMENT ON TABLE public.restaurant_attractions IS 'ความเชื่อมโยงระหว่างร้านอาหารกับสถานที่ท่องเที่ยวใกล้เคียง';

-- ==========================================
-- 3. INDEXES
-- ==========================================

CREATE INDEX idx_restaurants_province_id ON public.restaurants(province_id);
CREATE INDEX idx_restaurants_slug ON public.restaurants(slug);
CREATE INDEX idx_restaurants_is_published ON public.restaurants(is_published) WHERE is_published = true;
CREATE INDEX idx_restaurants_food_type ON public.restaurants(food_type);
CREATE INDEX idx_restaurant_attractions_restaurant_id ON public.restaurant_attractions(restaurant_id);
CREATE INDEX idx_restaurant_attractions_attraction_id ON public.restaurant_attractions(attraction_id);

-- ==========================================
-- 4. ROW LEVEL SECURITY
-- ==========================================

ALTER TABLE public.restaurants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.restaurant_attractions ENABLE ROW LEVEL SECURITY;

-- Public read access for published/active restaurants
CREATE POLICY "Public can read published restaurants"
    ON public.restaurants FOR SELECT
    USING (is_published = true AND is_active = true);

CREATE POLICY "Public can read restaurant attractions"
    ON public.restaurant_attractions FOR SELECT
    USING (true);

-- ==========================================
-- 5. TRIGGERS
-- ==========================================

CREATE TRIGGER set_updated_at
    BEFORE UPDATE ON public.restaurants
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
