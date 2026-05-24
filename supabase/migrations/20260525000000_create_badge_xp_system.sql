-- Migration: 20260525000000_create_badge_xp_system
-- Description: Create XP tracking, badge definition, tourist badges, and leaderboard system

-- ==========================================
-- 1. XP EVENTS (append-only audit log of XP awards)
-- ==========================================

CREATE TABLE public.xp_events (
    xp_event_id uuid primary key default gen_random_uuid(),
    tourist_id uuid not null references public.tourists(tourist_id),
    visit_id uuid references public.visits(visit_id),
    xp_source varchar(100) not null check (xp_source in (
        'qr_checkin', 'photo_upload', 'certificate_generated', 
        'survey_completed', 'stamp_earned', 'review_submitted',
        'restaurant_visit', 'badge_earned', 'admin_award'
    )),
    xp_amount integer not null check (xp_amount > 0),
    metadata jsonb,
    created_at timestamptz not null default now()
);

CREATE INDEX IF NOT EXISTS idx_xp_events_tourist
    ON public.xp_events(tourist_id, created_at);
CREATE INDEX IF NOT EXISTS idx_xp_events_source
    ON public.xp_events(xp_source);

-- ==========================================
-- 2. BADGE DEFINITIONS
-- ==========================================

CREATE TABLE public.badge_definitions (
    badge_id bigint generated always as identity primary key,
    badge_key varchar(100) not null unique,
    name_th varchar(255) not null,
    name_en varchar(255) not null,
    description_th text,
    description_en text,
    icon_name varchar(100),
    icon_color varchar(50) default '#E18868',
    category varchar(50) not null check (category in ('exploration', 'engagement', 'milestone', 'social')),
    requirement_type varchar(100) not null check (requirement_type in (
        'xp_total', 'stamp_count', 'visit_count', 'survey_count',
        'review_count', 'restaurant_count', 'province_count',
        'attractions_in_province', 'attraction_category'
    )),
    requirement_value integer not null default 1,
    requirement_extra varchar(255), -- e.g. province name or category for complex checks
    display_order integer not null default 0,
    is_active boolean not null default true,
    created_at timestamptz not null default now(),
    updated_at timestamptz
);

CREATE INDEX IF NOT EXISTS idx_badge_definitions_active
    ON public.badge_definitions(is_active, display_order);

-- ==========================================
-- 3. TOURIST BADGES (earned)
-- ==========================================

CREATE TABLE public.tourist_badges (
    badge_award_id uuid primary key default gen_random_uuid(),
    tourist_id uuid not null references public.tourists(tourist_id),
    badge_id bigint not null references public.badge_definitions(badge_id),
    visit_id uuid references public.visits(visit_id),
    earned_at timestamptz not null default now(),
    unique(tourist_id, badge_id)
);

CREATE INDEX IF NOT EXISTS idx_tourist_badges_tourist
    ON public.tourist_badges(tourist_id, earned_at);

-- ==========================================
-- 4. XP SUMMARY VIEW
-- ==========================================

CREATE OR REPLACE VIEW public.tourist_xp_summary AS
SELECT 
    xe.tourist_id,
    COALESCE(SUM(xe.xp_amount), 0)::integer as total_xp,
    COUNT(DISTINCT xe.visit_id) as xp_visit_count,
    COUNT(DISTINCT CASE WHEN xe.xp_source = 'survey_completed' THEN xe.xp_event_id END) as survey_count,
    COUNT(DISTINCT CASE WHEN xe.xp_source = 'review_submitted' THEN xe.xp_event_id END) as review_count,
    COUNT(DISTINCT CASE WHEN xe.xp_source = 'stamp_earned' THEN xe.xp_event_id END) as stamp_xp_count,
    MAX(xe.created_at) as last_xp_event
FROM public.xp_events xe
GROUP BY xe.tourist_id;

-- ==========================================
-- 5. LEADERBOARD SNAPSHOT TABLE
-- ==========================================

CREATE TABLE public.leaderboard_snapshots (
    snapshot_id uuid primary key default gen_random_uuid(),
    period varchar(20) not null check (period in ('weekly', 'monthly', 'all_time')),
    snapshot_date date not null default current_date,
    ranking jsonb not null, -- Array of {rank, tourist_id, tourist_name, total_xp, badge_count, stamp_count, visit_count}
    generated_at timestamptz not null default now(),
    unique(period, snapshot_date)
);

-- ==========================================
-- 6. RLS
-- ==========================================

ALTER TABLE public.xp_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.badge_definitions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tourist_badges ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.leaderboard_snapshots ENABLE ROW LEVEL SECURITY;

-- Service role bypasses RLS; define public read policies for badges

CREATE POLICY "Public can read active badge definitions"
    ON public.badge_definitions FOR SELECT
    USING (is_active = true);

-- All other tables (xp_events, tourist_badges, leaderboard_snapshots) remain restricted
-- They will be accessed via Supabase server clients with service role keys.

-- ==========================================
-- 7. SEED BADGE DEFINITIONS
-- ==========================================

INSERT INTO public.badge_definitions (badge_key, name_th, name_en, description_th, description_en, icon_name, icon_color, category, requirement_type, requirement_value, display_order, is_active)
VALUES
    ('first_steps', 'ก้าวแรก', 'First Steps', 'เริ่มต้นการเดินทางด้วยการเช็คอินครั้งแรก', 'Start your journey with your first check-in', 'Footprints', '#4CAF50', 'exploration', 'visit_count', 1, 1, true),
    ('explorer_3', 'นักเดินทางผู้อยากรู้', 'Explorer', 'เยี่ยมชม 3 สถานที่ท่องเที่ยว', 'Visit 3 attractions', 'MapPin', '#2196F3', 'exploration', 'visit_count', 3, 2, true),
    ('explorer_5', 'นักผจญภัย', 'Adventurer', 'เยี่ยมชม 5 สถานที่ท่องเที่ยว', 'Visit 5 attractions', 'MapPin', '#3F51B5', 'exploration', 'visit_count', 5, 3, true),
    ('explorer_10', 'นักเดินทางตัวจริง', 'Trailblazer', 'เยี่ยมชม 10 สถานที่ท่องเที่ยว', 'Visit 10 attractions', 'MapPin', '#673AB7', 'exploration', 'visit_count', 10, 4, true),
    ('stamp_collector_3', 'นักสะสมตราประทับ', 'Stamp Collector', 'สะสมตราประทับ 3 ดวง', 'Collect 3 stamps', 'SealCheck', '#E18868', 'exploration', 'stamp_count', 3, 5, true),
    ('stamp_collector_6', 'นักสะสมตัวยง', 'Stamp Enthusiast', 'สะสมตราประทับ 6 ดวง', 'Collect 6 stamps', 'SealCheck', '#E18868', 'exploration', 'stamp_count', 6, 6, true),
    ('stamp_collector_all', 'ราชันตราประทับ', 'Stamp Master', 'สะสมตราประทับครบทุกสถานที่', 'Collect all available stamps', 'SealCheck', '#FF5722', 'exploration', 'stamp_count', 16, 7, true),
    ('survey_master_5', 'ผู้ให้ข้อมูล', 'Survey Master', 'ตอบแบบสอบถามครบ 5 ครั้ง', 'Complete 5 surveys', 'ClipboardText', '#009688', 'engagement', 'survey_count', 5, 8, true),
    ('survey_master_10', 'นักสำรวจความคิดเห็น', 'Survey Guru', 'ตอบแบบสอบถามครบ 10 ครั้ง', 'Complete 10 surveys', 'ClipboardText', '#00796B', 'engagement', 'survey_count', 10, 9, true),
    ('review_star_3', 'นักรีวิว', 'Review Star', 'เขียนรีวิว 3 ครั้ง', 'Write 3 reviews', 'ChatCircleText', '#FF9800', 'engagement', 'review_count', 3, 10, true),
    ('review_star_10', 'นักรีวิวตัวยง', 'Review Legend', 'เขียนรีวิว 10 ครั้ง', 'Write 10 reviews', 'ChatCircleText', '#E65100', 'engagement', 'review_count', 10, 11, true),
    ('foodie_3', 'นักชิม', 'Foodie', 'เยี่ยมชมร้านอาหาร 3 แห่ง', 'Visit 3 restaurants', 'ForkKnife', '#F44336', 'social', 'restaurant_count', 3, 12, true),
    ('foodie_6', 'นักชิมตัวจริง', 'Foodie Master', 'เยี่ยมชมร้านอาหาร 6 แห่ง', 'Visit 6 restaurants', 'ForkKnife', '#D32F2F', 'social', 'restaurant_count', 6, 13, true),
    ('province_explorer', 'นักเดินทางสามจังหวัด', 'Province Explorer', 'เยี่ยมชมสถานที่ในทั้ง 3 จังหวัดชายแดนใต้', 'Visit attractions in all 3 southern border provinces', 'GlobeHemisphereEast', '#4CAF50', 'exploration', 'province_count', 3, 14, true),
    ('xp_500', 'แรงบันดาลใจ', 'Inspiration', 'สะสม XP ครบ 500', 'Earn 500 XP total', 'Star', '#FFD700', 'milestone', 'xp_total', 500, 15, true),
    ('xp_1000', 'เซนจูรี่คลับ', 'Century Club', 'สะสม XP ครบ 1,000', 'Earn 1,000 XP total', 'Star', '#FFC107', 'milestone', 'xp_total', 1000, 16, true),
    ('xp_2500', 'นักเดินทางระดับตำนาน', 'Legend', 'สะสม XP ครบ 2,500', 'Earn 2,500 XP total', 'Trophy', '#FFB300', 'milestone', 'xp_total', 2500, 17, true),
    ('xp_5000', 'ตำนานมีชีวิต', 'Living Legend', 'สะสม XP ครบ 5,000', 'Earn 5,000 XP total', 'Trophy', '#FF8F00', 'milestone', 'xp_total', 5000, 18, true),
    ('culture_seeker', 'ผู้แสวงหาวัฒนธรรม', 'Culture Seeker', 'เยี่ยมชมสถานที่ทางวัฒนธรรม 3 แห่ง', 'Visit 3 cultural/religious attractions', 'Building', '#9C27B0', 'exploration', 'attraction_category', 3, 19, true)
ON CONFLICT (badge_key) DO UPDATE
SET name_th = EXCLUDED.name_th,
    name_en = EXCLUDED.name_en,
    description_th = EXCLUDED.description_th,
    description_en = EXCLUDED.description_en,
    icon_name = EXCLUDED.icon_name,
    icon_color = EXCLUDED.icon_color,
    category = EXCLUDED.category,
    requirement_type = EXCLUDED.requirement_type,
    requirement_value = EXCLUDED.requirement_value,
    display_order = EXCLUDED.display_order,
    is_active = EXCLUDED.is_active;
