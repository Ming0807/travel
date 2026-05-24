-- ==========================================
-- SEED: Leaderboard Mock Data
-- Description: Generates realistic mock tourists with XP, badges, and stamps.
-- ==========================================

DO $$
DECLARE
    t1 uuid := 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11';
    t2 uuid := 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12';
    t3 uuid := 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13';
    t4 uuid := 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a14';
    t5 uuid := 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a15';
    t6 uuid := 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a16';
    t7 uuid := 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a17';
    t8 uuid := 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a18';
    t9 uuid := 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a19';
    t10 uuid := 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a20';
BEGIN
    -- 1. Insert Mock Tourists
    INSERT INTO public.tourists (tourist_id, display_name, age_group, profile_completed_at)
    VALUES
        (t1, 'สมชาย พเนจร', '25_34', now()),
        (t2, 'มาลี รักเที่ยว', '18_24', now()),
        (t3, 'วิชัย ผจญภัย', '35_44', now()),
        (t4, 'สุดา พาเพลิน', '25_34', now()),
        (t5, 'ธนา ตามฝัน', '45_54', now()),
        (t6, 'นารี มีชัย', '18_24', now()),
        (t7, 'ทรงพล สายแดก', '25_34', now()),
        (t8, 'อรทัย สายมู', '35_44', now()),
        (t9, 'พิชิต ทุกยอดเขา', '25_34', now()),
        (t10, 'วรินทร์ สายถ่ายรูป', '18_24', now())
    ON CONFLICT (tourist_id) DO NOTHING;

    -- 2. Insert XP Events
    -- Tourist 1 (Top rank, heavily active)
    INSERT INTO public.xp_events (tourist_id, xp_source, xp_amount, created_at) VALUES 
        (t1, 'qr_checkin', 50, now() - interval '20 days'),
        (t1, 'photo_upload', 30, now() - interval '20 days'),
        (t1, 'stamp_earned', 150, now() - interval '19 days'),
        (t1, 'survey_completed', 75, now() - interval '18 days'),
        (t1, 'certificate_generated', 100, now() - interval '15 days'),
        (t1, 'badge_earned', 200, now() - interval '10 days'),
        (t1, 'review_submitted', 40, now() - interval '5 days'),
        (t1, 'restaurant_visit', 50, now() - interval '2 days');

    -- Tourist 2
    INSERT INTO public.xp_events (tourist_id, xp_source, xp_amount, created_at) VALUES 
        (t2, 'qr_checkin', 50, now() - interval '15 days'),
        (t2, 'stamp_earned', 150, now() - interval '14 days'),
        (t2, 'survey_completed', 75, now() - interval '12 days'),
        (t2, 'badge_earned', 200, now() - interval '10 days'),
        (t2, 'photo_upload', 30, now() - interval '1 days');

    -- Tourist 3
    INSERT INTO public.xp_events (tourist_id, xp_source, xp_amount, created_at) VALUES 
        (t3, 'qr_checkin', 50, now() - interval '10 days'),
        (t3, 'photo_upload', 30, now() - interval '9 days'),
        (t3, 'certificate_generated', 100, now() - interval '8 days'),
        (t3, 'stamp_earned', 150, now() - interval '7 days');

    -- Tourist 4
    INSERT INTO public.xp_events (tourist_id, xp_source, xp_amount, created_at) VALUES 
        (t4, 'qr_checkin', 50, now() - interval '2 days'),
        (t4, 'photo_upload', 30, now() - interval '1 days'),
        (t4, 'survey_completed', 75, now());

    -- Tourist 5
    INSERT INTO public.xp_events (tourist_id, xp_source, xp_amount, created_at) VALUES 
        (t5, 'qr_checkin', 50, now() - interval '30 days'),
        (t5, 'badge_earned', 200, now() - interval '25 days');

    -- Tourist 6
    INSERT INTO public.xp_events (tourist_id, xp_source, xp_amount, created_at) VALUES 
        (t6, 'stamp_earned', 150, now() - interval '5 days');

    -- Tourist 7
    INSERT INTO public.xp_events (tourist_id, xp_source, xp_amount, created_at) VALUES 
        (t7, 'restaurant_visit', 50, now() - interval '3 days'),
        (t7, 'restaurant_visit', 50, now() - interval '2 days'),
        (t7, 'restaurant_visit', 50, now() - interval '1 days');

    -- Tourist 8
    INSERT INTO public.xp_events (tourist_id, xp_source, xp_amount, created_at) VALUES 
        (t8, 'survey_completed', 75, now() - interval '1 days'),
        (t8, 'badge_earned', 200, now());

    -- Tourist 9
    INSERT INTO public.xp_events (tourist_id, xp_source, xp_amount, created_at) VALUES 
        (t9, 'qr_checkin', 50, now() - interval '40 days'),
        (t9, 'stamp_earned', 150, now() - interval '38 days'),
        (t9, 'photo_upload', 30, now() - interval '37 days'),
        (t9, 'review_submitted', 40, now() - interval '30 days');

    -- Tourist 10
    INSERT INTO public.xp_events (tourist_id, xp_source, xp_amount, created_at) VALUES 
        (t10, 'certificate_generated', 100, now() - interval '5 days');

END $$;
