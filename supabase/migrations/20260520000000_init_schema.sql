-- Migration: 20260520000000_init_schema
-- Description: Initial schema for Southern Border Tourism Data & Intelligence Platform MVP

-- 1. UTILITY FUNCTIONS
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- ==========================================
-- 2. REFERENCE TABLES
-- ==========================================

-- Countries
CREATE TABLE public.countries (
    country_id bigint generated always as identity primary key,
    country_name_en varchar(150) not null,
    country_name_th varchar(150),
    iso2_code char(2) unique,
    iso3_code char(3) unique,
    is_active boolean not null default true,
    created_at timestamptz not null default now(),
    updated_at timestamptz
);

-- Provinces
CREATE TABLE public.provinces (
    province_id bigint generated always as identity primary key,
    province_name_th varchar(150) not null unique,
    province_name_en varchar(150) not null unique,
    region_name varchar(150),
    is_target_area boolean not null default false,
    is_active boolean not null default true,
    created_at timestamptz not null default now(),
    updated_at timestamptz
);

-- Districts
CREATE TABLE public.districts (
    district_id bigint generated always as identity primary key,
    province_id bigint not null references public.provinces(province_id),
    district_name_th varchar(150) not null,
    district_name_en varchar(150),
    is_active boolean not null default true,
    created_at timestamptz not null default now(),
    updated_at timestamptz,
    unique(province_id, district_name_th)
);

-- Attraction Types
CREATE TABLE public.attraction_types (
    attraction_type_id bigint generated always as identity primary key,
    type_name_th varchar(150) not null,
    type_name_en varchar(150) not null,
    description text,
    is_active boolean not null default true,
    display_order integer,
    created_at timestamptz not null default now(),
    updated_at timestamptz
);

-- Transport Modes
CREATE TABLE public.transport_modes (
    transport_mode_id bigint generated always as identity primary key,
    name_th varchar(150) not null,
    name_en varchar(150) not null,
    display_order integer,
    is_active boolean not null default true,
    created_at timestamptz not null default now()
);

-- Travel Purposes
CREATE TABLE public.travel_purposes (
    travel_purpose_id bigint generated always as identity primary key,
    name_th varchar(150) not null,
    name_en varchar(150) not null,
    display_order integer,
    is_active boolean not null default true,
    created_at timestamptz not null default now()
);

-- Travel Companions
CREATE TABLE public.travel_companions (
    travel_companion_id bigint generated always as identity primary key,
    name_th varchar(150) not null,
    name_en varchar(150) not null,
    display_order integer,
    is_active boolean not null default true,
    created_at timestamptz not null default now()
);

-- Expense Categories
CREATE TABLE public.expense_categories (
    expense_category_id bigint generated always as identity primary key,
    name_th varchar(150) not null,
    name_en varchar(150) not null,
    display_order integer,
    is_active boolean not null default true,
    created_at timestamptz not null default now()
);

-- Spending Ranges (Assuming we might need a structured lookup for ranges, though often handled via enum/check, we'll create a table per requirements)
CREATE TABLE public.spending_ranges (
    spending_range_id bigint generated always as identity primary key,
    range_label_th varchar(150) not null,
    range_label_en varchar(150) not null,
    min_value numeric,
    max_value numeric,
    display_order integer,
    is_active boolean not null default true,
    created_at timestamptz not null default now()
);

-- Age Groups
CREATE TABLE public.age_groups (
    age_group_id bigint generated always as identity primary key,
    label varchar(50) not null,
    min_age integer,
    max_age integer,
    display_order integer,
    is_active boolean not null default true,
    created_at timestamptz not null default now()
);

-- ==========================================
-- 3. ATTRACTION TABLES
-- ==========================================

CREATE TABLE public.attractions (
    attraction_id bigint generated always as identity primary key,
    province_id bigint not null references public.provinces(province_id),
    district_id bigint references public.districts(district_id),
    attraction_type_id bigint references public.attraction_types(attraction_type_id),
    slug varchar(200) not null unique,
    name_th varchar(255) not null,
    name_en varchar(255),
    short_description_th text,
    short_description_en text,
    description_th text,
    description_en text,
    history_th text,
    history_en text,
    latitude numeric(10,7),
    longitude numeric(10,7),
    address_text text,
    opening_hours varchar(255),
    contact_info varchar(255),
    sustainability_category varchar(100),
    estimated_capacity_per_day integer,
    is_published boolean not null default false,
    is_active boolean not null default true,
    created_at timestamptz not null default now(),
    updated_at timestamptz
);

CREATE TABLE public.attraction_media (
    media_id bigint generated always as identity primary key,
    attraction_id bigint not null references public.attractions(attraction_id),
    media_type varchar(50) not null check (media_type in ('image', 'panorama', 'video360', 'embed', 'external_url')),
    storage_path text not null,
    alt_text_th varchar(255),
    alt_text_en varchar(255),
    caption_th varchar(255),
    caption_en varchar(255),
    display_order integer,
    is_cover boolean not null default false,
    is_active boolean not null default true,
    created_at timestamptz not null default now(),
    updated_at timestamptz
);

CREATE TABLE public.photo_spots (
    photo_spot_id bigint generated always as identity primary key,
    attraction_id bigint not null references public.attractions(attraction_id),
    spot_name_th varchar(255) not null,
    spot_name_en varchar(255),
    description_th text,
    description_en text,
    sample_image_path text,
    latitude numeric(10,7),
    longitude numeric(10,7),
    display_order integer,
    is_active boolean not null default true,
    created_at timestamptz not null default now(),
    updated_at timestamptz
);

CREATE TABLE public.checkin_codes (
    checkin_code_id bigint generated always as identity primary key,
    code varchar(100) not null unique,
    attraction_id bigint not null references public.attractions(attraction_id),
    photo_spot_id bigint references public.photo_spots(photo_spot_id),
    campaign_id bigint, -- Placeholder for future campaigns table
    label varchar(255),
    is_active boolean not null default true,
    starts_at timestamptz,
    ends_at timestamptz,
    created_at timestamptz not null default now(),
    updated_at timestamptz
);

CREATE TABLE public.suggested_routes (
    route_id bigint generated always as identity primary key,
    name_th varchar(255) not null,
    name_en varchar(255),
    description_th text,
    description_en text,
    cover_image_path text,
    is_published boolean not null default false,
    is_active boolean not null default true,
    created_at timestamptz not null default now(),
    updated_at timestamptz
);

CREATE TABLE public.suggested_route_stops (
    stop_id bigint generated always as identity primary key,
    route_id bigint not null references public.suggested_routes(route_id),
    attraction_id bigint not null references public.attractions(attraction_id),
    day_number integer not null default 1,
    display_order integer not null,
    stop_note_th text,
    stop_note_en text,
    created_at timestamptz not null default now(),
    unique(route_id, day_number, display_order)
);

-- ==========================================
-- 4. TOURIST IDENTITY & PROFILE
-- ==========================================

CREATE TABLE public.tourists (
    tourist_id uuid primary key default gen_random_uuid(),
    display_name varchar(150) not null,
    origin_country_id bigint references public.countries(country_id),
    origin_province_id bigint references public.provinces(province_id),
    age_group varchar(50),
    preferred_language varchar(10),
    profile_completed_at timestamptz,
    created_at timestamptz not null default now(),
    updated_at timestamptz
);

CREATE TABLE public.tourist_identities (
    identity_id uuid primary key default gen_random_uuid(),
    tourist_id uuid not null references public.tourists(tourist_id),
    provider varchar(50) not null check (provider in ('anonymous_device', 'line', 'google', 'email')),
    provider_user_id text not null,
    is_primary boolean not null default false,
    last_seen_at timestamptz,
    created_at timestamptz not null default now(),
    unique(provider, provider_user_id)
);

CREATE TABLE public.consent_records (
    consent_id uuid primary key default gen_random_uuid(),
    tourist_id uuid references public.tourists(tourist_id),
    consent_version varchar(50) not null,
    purpose text not null,
    has_consented boolean not null,
    consented_at timestamptz not null default now(),
    source varchar(100),
    ip_hash text,
    user_agent_hash text
);

-- ==========================================
-- 5. VISIT & FUNNEL
-- ==========================================

CREATE TABLE public.visits (
    visit_id uuid primary key default gen_random_uuid(),
    tourist_id uuid not null references public.tourists(tourist_id),
    attraction_id bigint not null references public.attractions(attraction_id),
    photo_spot_id bigint references public.photo_spots(photo_spot_id),
    checkin_code_id bigint references public.checkin_codes(checkin_code_id),
    visit_date date not null default current_date,
    visited_at timestamptz,
    travel_companion_id bigint references public.travel_companions(travel_companion_id),
    transport_mode_id bigint references public.transport_modes(transport_mode_id),
    travel_purpose_id bigint references public.travel_purposes(travel_purpose_id),
    group_size integer check (group_size is null or group_size >= 1),
    overnight_status varchar(50) check (overnight_status in ('same_day', 'overnight', 'unknown')),
    nights integer check (nights is null or nights >= 0),
    completion_status varchar(50) not null check (completion_status in ('started', 'minimal_form_completed', 'photo_uploaded', 'certificate_generated', 'survey_completed', 'abandoned')),
    created_at timestamptz not null default now(),
    updated_at timestamptz
);

CREATE TABLE public.funnel_events (
    event_id uuid primary key default gen_random_uuid(),
    visit_id uuid references public.visits(visit_id),
    tourist_id uuid references public.tourists(tourist_id),
    checkin_code_id bigint references public.checkin_codes(checkin_code_id),
    event_type varchar(100) not null,
    event_time timestamptz not null default now(),
    metadata jsonb
);

-- ==========================================
-- 6. PHOTO & CERTIFICATE
-- ==========================================

CREATE TABLE public.visit_photos (
    photo_id uuid primary key default gen_random_uuid(),
    visit_id uuid not null references public.visits(visit_id),
    storage_path text not null,
    thumbnail_path text,
    original_filename varchar(255),
    mime_type varchar(100) not null check (mime_type in ('image/jpeg', 'image/png', 'image/webp')),
    file_size_bytes integer not null check (file_size_bytes > 0),
    width integer,
    height integer,
    approval_status varchar(50) not null default 'pending' check (approval_status in ('pending', 'approved', 'rejected')),
    uploaded_at timestamptz not null default now()
);

CREATE TABLE public.certificate_templates (
    template_id bigint generated always as identity primary key,
    template_name varchar(150) not null,
    attraction_id bigint references public.attractions(attraction_id),
    background_path text,
    layout_config_json jsonb,
    language varchar(10) default 'th',
    is_default boolean not null default false,
    is_active boolean not null default true,
    created_at timestamptz not null default now(),
    updated_at timestamptz
);

CREATE TABLE public.certificates (
    certificate_id uuid primary key default gen_random_uuid(),
    visit_id uuid not null references public.visits(visit_id),
    template_id bigint not null references public.certificate_templates(template_id),
    photo_id uuid references public.visit_photos(photo_id),
    certificate_path text not null,
    share_url text,
    generated_at timestamptz not null default now(),
    download_count integer not null default 0 check (download_count >= 0),
    created_at timestamptz not null default now()
);

-- ==========================================
-- 7. DIGITAL PASSPORT / STAMP
-- ==========================================

CREATE TABLE public.stamp_definitions (
    stamp_definition_id bigint generated always as identity primary key,
    attraction_id bigint not null references public.attractions(attraction_id),
    stamp_name_th varchar(150) not null,
    stamp_name_en varchar(150),
    description_th text,
    description_en text,
    stamp_image_path text,
    is_active boolean not null default true,
    created_at timestamptz not null default now(),
    updated_at timestamptz
);

CREATE TABLE public.tourist_stamps (
    stamp_id uuid primary key default gen_random_uuid(),
    tourist_id uuid not null references public.tourists(tourist_id),
    attraction_id bigint not null references public.attractions(attraction_id),
    visit_id uuid not null references public.visits(visit_id),
    stamp_definition_id bigint not null references public.stamp_definitions(stamp_definition_id),
    earned_at timestamptz not null default now(),
    status varchar(50) not null default 'earned' check (status in ('earned', 'revoked')),
    unique(tourist_id, attraction_id) -- Prevents duplicate stamps for the same attraction
);

-- ==========================================
-- 8. SURVEY, EXPENSE & SATISFACTION
-- ==========================================

CREATE TABLE public.satisfaction_surveys (
    survey_id uuid primary key default gen_random_uuid(),
    visit_id uuid not null references public.visits(visit_id),
    tourist_id uuid not null references public.tourists(tourist_id),
    overall_score integer check (overall_score >= 1 and overall_score <= 5),
    facility_score integer check (facility_score >= 1 and facility_score <= 5),
    cleanliness_score integer check (cleanliness_score >= 1 and cleanliness_score <= 5),
    safety_score integer check (safety_score >= 1 and safety_score <= 5),
    revisit_intention varchar(50) check (revisit_intention in ('yes', 'no', 'maybe')),
    recommend_intention varchar(50) check (recommend_intention in ('yes', 'no', 'maybe')),
    comments text,
    submitted_at timestamptz not null default now()
);

CREATE TABLE public.visit_expenses (
    expense_id uuid primary key default gen_random_uuid(),
    visit_id uuid not null references public.visits(visit_id),
    expense_category_id bigint not null references public.expense_categories(expense_category_id),
    estimated_amount numeric(12,2) not null check (estimated_amount >= 0),
    spending_range_id bigint references public.spending_ranges(spending_range_id),
    created_at timestamptz not null default now()
);

-- ==========================================
-- 9. ADMIN & RBAC
-- ==========================================

CREATE TABLE public.roles (
    role_id bigint generated always as identity primary key,
    role_name varchar(50) not null unique,
    description text,
    is_active boolean not null default true,
    created_at timestamptz not null default now()
);

CREATE TABLE public.permissions (
    permission_id bigint generated always as identity primary key,
    permission_name varchar(100) not null unique,
    description text,
    created_at timestamptz not null default now()
);

CREATE TABLE public.role_permissions (
    role_id bigint not null references public.roles(role_id),
    permission_id bigint not null references public.permissions(permission_id),
    created_at timestamptz not null default now(),
    primary key (role_id, permission_id)
);

CREATE TABLE public.admin_users (
    admin_id uuid primary key default gen_random_uuid(),
    email varchar(255) not null unique,
    auth_user_id uuid, -- Link to auth.users if using Supabase Auth
    display_name varchar(150),
    is_active boolean not null default true,
    last_login_at timestamptz,
    created_at timestamptz not null default now(),
    updated_at timestamptz
);

CREATE TABLE public.admin_user_roles (
    admin_id uuid not null references public.admin_users(admin_id),
    role_id bigint not null references public.roles(role_id),
    assigned_at timestamptz not null default now(),
    primary key (admin_id, role_id)
);

-- ==========================================
-- 10. AUDIT & EXPORT
-- ==========================================

CREATE TABLE public.audit_logs (
    log_id uuid primary key default gen_random_uuid(),
    admin_id uuid references public.admin_users(admin_id),
    action varchar(150) not null,
    entity_type varchar(100),
    entity_id text,
    old_data jsonb,
    new_data jsonb,
    ip_address varchar(45),
    created_at timestamptz not null default now()
);

CREATE TABLE public.export_jobs (
    job_id uuid primary key default gen_random_uuid(),
    admin_id uuid not null references public.admin_users(admin_id),
    export_type varchar(100) not null,
    parameters jsonb,
    status varchar(50) not null default 'pending' check (status in ('pending', 'processing', 'completed', 'failed')),
    file_path text,
    error_message text,
    started_at timestamptz,
    completed_at timestamptz,
    created_at timestamptz not null default now()
);

-- ==========================================
-- 11. TRIGGERS FOR UPDATED_AT
-- ==========================================

DO $$
DECLARE
    t text;
BEGIN
    FOR t IN 
        SELECT table_name 
        FROM information_schema.columns 
        WHERE column_name = 'updated_at' 
          AND table_schema = 'public'
    LOOP
        EXECUTE format('
            CREATE TRIGGER set_updated_at
            BEFORE UPDATE ON public.%I
            FOR EACH ROW
            EXECUTE FUNCTION update_updated_at_column()
        ', t);
    END LOOP;
END;
$$;

-- ==========================================
-- 12. ROW LEVEL SECURITY (RLS)
-- ==========================================

-- Enable RLS on all tables
ALTER TABLE public.countries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.provinces ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.districts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.attraction_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transport_modes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.travel_purposes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.travel_companions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.expense_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.spending_ranges ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.age_groups ENABLE ROW LEVEL SECURITY;

ALTER TABLE public.attractions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.attraction_media ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.photo_spots ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.checkin_codes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.suggested_routes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.suggested_route_stops ENABLE ROW LEVEL SECURITY;

ALTER TABLE public.tourists ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tourist_identities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.consent_records ENABLE ROW LEVEL SECURITY;

ALTER TABLE public.visits ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.funnel_events ENABLE ROW LEVEL SECURITY;

ALTER TABLE public.visit_photos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.certificate_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.certificates ENABLE ROW LEVEL SECURITY;

ALTER TABLE public.stamp_definitions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tourist_stamps ENABLE ROW LEVEL SECURITY;

ALTER TABLE public.satisfaction_surveys ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.visit_expenses ENABLE ROW LEVEL SECURITY;

ALTER TABLE public.roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.role_permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_user_roles ENABLE ROW LEVEL SECURITY;

ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.export_jobs ENABLE ROW LEVEL SECURITY;

-- Note: In a production Supabase setup with server actions/service roles, we often rely on the service role
-- to bypass RLS for internal application logic. We will explicitly define public read policies for non-sensitive reference data.

CREATE POLICY "Public can read active countries" ON public.countries FOR SELECT USING (is_active = true);
CREATE POLICY "Public can read active provinces" ON public.provinces FOR SELECT USING (is_active = true);
CREATE POLICY "Public can read active districts" ON public.districts FOR SELECT USING (is_active = true);
CREATE POLICY "Public can read active attraction types" ON public.attraction_types FOR SELECT USING (is_active = true);
CREATE POLICY "Public can read active transport modes" ON public.transport_modes FOR SELECT USING (is_active = true);
CREATE POLICY "Public can read active travel purposes" ON public.travel_purposes FOR SELECT USING (is_active = true);
CREATE POLICY "Public can read active travel companions" ON public.travel_companions FOR SELECT USING (is_active = true);
CREATE POLICY "Public can read active expense categories" ON public.expense_categories FOR SELECT USING (is_active = true);
CREATE POLICY "Public can read active spending ranges" ON public.spending_ranges FOR SELECT USING (is_active = true);
CREATE POLICY "Public can read active age groups" ON public.age_groups FOR SELECT USING (is_active = true);

CREATE POLICY "Public can read published attractions" ON public.attractions FOR SELECT USING (is_published = true AND is_active = true);
CREATE POLICY "Public can read active attraction media" ON public.attraction_media FOR SELECT USING (is_active = true);
CREATE POLICY "Public can read active photo spots" ON public.photo_spots FOR SELECT USING (is_active = true);
CREATE POLICY "Public can read active checkin codes" ON public.checkin_codes FOR SELECT USING (is_active = true);
CREATE POLICY "Public can read published routes" ON public.suggested_routes FOR SELECT USING (is_published = true AND is_active = true);
CREATE POLICY "Public can read route stops" ON public.suggested_route_stops FOR SELECT USING (true);
CREATE POLICY "Public can read default certificate templates" ON public.certificate_templates FOR SELECT USING (is_active = true);
CREATE POLICY "Public can read active stamp definitions" ON public.stamp_definitions FOR SELECT USING (is_active = true);

-- All other tables (tourists, visits, certificates, expenses, etc.) remain restricted.
-- They will be accessed via Supabase server clients with service role keys, enforcing auth and ownership in the application layer.
