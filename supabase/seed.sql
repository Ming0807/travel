-- Seed: seed.sql
-- Description: Master data seeding for Southern Border Tourism MVP

-- 1. COUNTRIES
INSERT INTO public.countries (country_name_en, country_name_th, iso2_code, iso3_code) VALUES
('Thailand', 'ไทย', 'TH', 'THA'),
('Malaysia', 'มาเลเซีย', 'MY', 'MYS'),
('Singapore', 'สิงคโปร์', 'SG', 'SGP'),
('Indonesia', 'อินโดนีเซีย', 'ID', 'IDN'),
('China', 'จีน', 'CN', 'CHN')
ON CONFLICT (iso2_code) DO NOTHING;

-- 2. PROVINCES (Target Areas)
INSERT INTO public.provinces (province_name_th, province_name_en, region_name, is_target_area) VALUES
('ยะลา', 'Yala', 'Southern', true),
('ปัตตานี', 'Pattani', 'Southern', true),
('นราธิวาส', 'Narathiwat', 'Southern', true),
('สงขลา', 'Songkhla', 'Southern', false),
('กรุงเทพมหานคร', 'Bangkok', 'Central', false)
ON CONFLICT (province_name_th) DO NOTHING;

-- 3. ATTRACTION TYPES
INSERT INTO public.attraction_types (type_name_th, type_name_en, display_order) VALUES
('ธรรมชาติและเชิงนิเวศ', 'Nature & Ecotourism', 1),
('วัฒนธรรมและประเพณี', 'Culture & Tradition', 2),
('ศาสนสถาน', 'Religious Sites', 3),
('ประวัติศาสตร์', 'Historical Sites', 4),
('ชุมชนและวิถีชีวิต', 'Community-based', 5),
('ทะเลและชายฝั่ง', 'Beach & Coastal', 6),
('อาหารและของฝาก', 'Food & Souvenirs', 7),
('จุดชมวิว', 'Viewpoint', 8),
('ผจญภัยและกีฬา', 'Adventure & Sports', 9)
ON CONFLICT DO NOTHING;

-- 4. TRANSPORT MODES
INSERT INTO public.transport_modes (name_th, name_en, display_order) VALUES
('รถยนต์ส่วนตัว', 'Private Car', 1),
('รถตู้เช่าเหมา', 'Chartered Van', 2),
('รถโดยสารประจำทาง', 'Public Bus', 3),
('รถไฟ', 'Train', 4),
('เครื่องบิน', 'Airplane', 5),
('รถจักรยานยนต์', 'Motorcycle', 6)
ON CONFLICT DO NOTHING;

-- 5. TRAVEL PURPOSES
INSERT INTO public.travel_purposes (name_th, name_en, display_order) VALUES
('พักผ่อนหย่อนใจ', 'Leisure/Vacation', 1),
('ไหว้พระ/ทำบุญ', 'Religious/Merit making', 2),
('เยี่ยมญาติ/เพื่อน', 'Visiting friends/relatives', 3),
('ศึกษาดูงาน', 'Study/Field trip', 4),
('ประชุม/สัมมนา', 'Business/MICE', 5),
('ทานอาหารพื้นถิ่น', 'Food tasting', 6)
ON CONFLICT DO NOTHING;

-- 6. TRAVEL COMPANIONS
INSERT INTO public.travel_companions (name_th, name_en, display_order) VALUES
('เดินทางคนเดียว', 'Alone', 1),
('ครอบครัว', 'Family', 2),
('เพื่อน', 'Friends', 3),
('คู่รัก', 'Couple', 4),
('หมู่คณะ/กรุ๊ปทัวร์', 'Tour Group', 5)
ON CONFLICT DO NOTHING;

-- 7. EXPENSE CATEGORIES
INSERT INTO public.expense_categories (name_th, name_en, display_order) VALUES
('ที่พัก', 'Accommodation', 1),
('อาหารและเครื่องดื่ม', 'Food & Beverage', 2),
('การเดินทาง', 'Transportation', 3),
('ของฝาก/ของที่ระลึก', 'Souvenirs', 4),
('ค่าเข้าชม/กิจกรรม', 'Activities/Entrance fees', 5)
ON CONFLICT DO NOTHING;

-- 8. SPENDING RANGES
INSERT INTO public.spending_ranges (range_label_th, range_label_en, min_value, max_value, display_order) VALUES
('น้อยกว่า 500 บาท', 'Less than 500 THB', 0, 499, 1),
('500 - 1,000 บาท', '500 - 1,000 THB', 500, 1000, 2),
('1,001 - 3,000 บาท', '1,001 - 3,000 THB', 1001, 3000, 3),
('3,001 - 5,000 บาท', '3,001 - 5,000 THB', 3001, 5000, 4),
('มากกว่า 5,000 บาท', 'More than 5,000 THB', 5001, null, 5)
ON CONFLICT DO NOTHING;

-- 9. AGE GROUPS
INSERT INTO public.age_groups (label, min_age, max_age, display_order) VALUES
('ต่ำกว่า 18 ปี', null, 17, 1),
('18 - 25 ปี', 18, 25, 2),
('26 - 35 ปี', 26, 35, 3),
('36 - 45 ปี', 36, 45, 4),
('46 - 60 ปี', 46, 60, 5),
('60 ปีขึ้นไป', 61, null, 6)
ON CONFLICT DO NOTHING;

-- 10. ROLES & PERMISSIONS
INSERT INTO public.roles (role_name, description) VALUES
('super_admin', 'Full platform access'),
('province_admin', 'Manage data within a specific province'),
('attraction_manager', 'Manage a specific attraction'),
('viewer', 'View dashboards and reports only')
ON CONFLICT (role_name) DO NOTHING;

INSERT INTO public.permissions (permission_name, description) VALUES
('dashboard.read', 'Can view dashboard analytics'),
('attraction.manage', 'Can create and edit attractions'),
('checkin_code.manage', 'Can generate and manage QR codes'),
('export.summary', 'Can export aggregated summary data'),
('export.detailed', 'Can export detailed raw data'),
('user.manage', 'Can manage admin users'),
('role.manage', 'Can manage roles and permissions')
ON CONFLICT (permission_name) DO NOTHING;

-- Assign permissions to super_admin
DO $$ 
DECLARE 
    sa_id bigint;
BEGIN 
    SELECT role_id INTO sa_id FROM public.roles WHERE role_name = 'super_admin';
    IF sa_id IS NOT NULL THEN
        INSERT INTO public.role_permissions (role_id, permission_id)
        SELECT sa_id, permission_id FROM public.permissions
        ON CONFLICT DO NOTHING;
    END IF;
END $$;
