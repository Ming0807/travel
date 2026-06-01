-- Seed Narathiwat data for explicit relations fallback demonstration

DO $$
DECLARE
    v_narathiwat_id INTEGER;
    v_attraction_1_id INTEGER;
    v_attraction_2_id INTEGER;
    v_restaurant_1_id INTEGER;
    v_accommodation_1_id INTEGER;
BEGIN
    -- Get province_id for Narathiwat
    SELECT province_id INTO v_narathiwat_id FROM public.provinces WHERE province_name_en = 'Narathiwat' LIMIT 1;
    
    IF v_narathiwat_id IS NULL THEN
        RAISE NOTICE 'Narathiwat province not found, skipping seed';
        RETURN;
    END IF;

    -- Insert Attraction 1 (Sungai Kolok Checkpoint)
    INSERT INTO public.attractions (slug, name_th, name_en, province_id, is_published, is_active, latitude, longitude, short_description_th)
    VALUES ('sungai-kolok-checkpoint', 'ด่านพรมแดนสุไหงโก-ลก', 'Sungai Kolok Border Checkpoint', v_narathiwat_id, true, true, 6.027, 101.972, 'จุดเชื่อมต่อการเดินทางระหว่างไทย-มาเลเซีย')
    ON CONFLICT (slug) DO NOTHING
    RETURNING attraction_id INTO v_attraction_1_id;

    IF v_attraction_1_id IS NULL THEN
        SELECT attraction_id INTO v_attraction_1_id FROM public.attractions WHERE slug = 'sungai-kolok-checkpoint';
    END IF;

    -- Insert Attraction 2 (Pha Nab Dao)
    INSERT INTO public.attractions (slug, name_th, name_en, province_id, is_published, is_active, latitude, longitude, short_description_th)
    VALUES ('pha-nab-dao', 'ผานับดาว', 'Pha Nab Dao', v_narathiwat_id, true, true, 6.13, 101.8, 'จุดชมวิวทะเลหมอกที่สวยงามที่สุดแห่งหนึ่งในสุคิริน')
    ON CONFLICT (slug) DO NOTHING
    RETURNING attraction_id INTO v_attraction_2_id;

    IF v_attraction_2_id IS NULL THEN
        SELECT attraction_id INTO v_attraction_2_id FROM public.attractions WHERE slug = 'pha-nab-dao';
    END IF;

    -- Insert Restaurant (Kolok Steakhouse)
    INSERT INTO public.restaurants (slug, name_th, name_en, province_id, is_published, is_active, food_type)
    VALUES ('kolok-steakhouse-rest', 'โกลกสเต็กเฮ้าส์', 'Kolok Steakhouse', v_narathiwat_id, true, true, 'Western / Thai')
    ON CONFLICT (slug) DO NOTHING
    RETURNING restaurant_id INTO v_restaurant_1_id;

    IF v_restaurant_1_id IS NULL THEN
        SELECT restaurant_id INTO v_restaurant_1_id FROM public.restaurants WHERE slug = 'kolok-steakhouse-rest';
    END IF;

    -- Insert Accommodation (Marina Hotel)
    INSERT INTO public.accommodations (slug, name_th, name_en, province_id, is_published, is_active, accommodation_type)
    VALUES ('marina-hotel-kolok', 'โรงแรมมารีน่า สุไหงโก-ลก', 'Marina Hotel Sungai Kolok', v_narathiwat_id, true, true, 'Hotel')
    ON CONFLICT (slug) DO NOTHING
    RETURNING accommodation_id INTO v_accommodation_1_id;

    IF v_accommodation_1_id IS NULL THEN
        SELECT accommodation_id INTO v_accommodation_1_id FROM public.accommodations WHERE slug = 'marina-hotel-kolok';
    END IF;

    -- Explicitly link them so we can see the exact curation working
    -- Attraction 1 (Sungai Kolok Checkpoint) -> related to Attraction 2, Restaurant 1, Accommodation 1
    
    INSERT INTO public.attraction_related_attractions (attraction_id, related_attraction_id, display_order)
    VALUES (v_attraction_1_id, v_attraction_2_id, 1)
    ON CONFLICT DO NOTHING;

    INSERT INTO public.attraction_related_restaurants (attraction_id, restaurant_id, display_order)
    VALUES (v_attraction_1_id, v_restaurant_1_id, 1)
    ON CONFLICT DO NOTHING;

    INSERT INTO public.attraction_related_accommodations (attraction_id, accommodation_id, display_order)
    VALUES (v_attraction_1_id, v_accommodation_1_id, 1)
    ON CONFLICT DO NOTHING;

    -- Kolok Steakhouse might have been mistaken for an attraction by the user.
    -- Let's also insert 'kolok-steakhouse' into attractions table JUST IN CASE the user literally navigates to `/attractions/kolok-steakhouse` and expects it there.
    INSERT INTO public.attractions (slug, name_th, name_en, province_id, is_published, is_active, short_description_th)
    VALUES ('kolok-steakhouse', 'โกลกสเต็กเฮ้าส์ (สาขาสถานที่ท่องเที่ยว)', 'Kolok Steakhouse', v_narathiwat_id, true, true, 'ร้านสเต็กยอดนิยมในสุไหงโก-ลก (แสดงตัวอย่าง)')
    ON CONFLICT (slug) DO NOTHING;

END $$;
