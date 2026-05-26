-- Seed: seed.sql
-- Description: Rerunnable development seed for the Southern Border Tourism
-- Data & Intelligence Platform.
--
-- Rules:
-- - Synthetic data only.
-- - No real tourist personal data.
-- - QR scans and landing views are seeded as funnel events, not visits.
-- - Official tourism statistics remain separate from platform visit records.

-- ==========================================
-- 1. MASTER DATA
-- ==========================================

INSERT INTO public.countries (country_name_en, country_name_th, iso2_code, iso3_code, is_active)
VALUES
  ('Thailand', 'ไทย', 'TH', 'THA', true),
  ('Malaysia', 'มาเลเซีย', 'MY', 'MYS', true),
  ('Singapore', 'สิงคโปร์', 'SG', 'SGP', true),
  ('Indonesia', 'อินโดนีเซีย', 'ID', 'IDN', true),
  ('China', 'จีน', 'CN', 'CHN', true),
  ('Japan', 'ญี่ปุ่น', 'JP', 'JPN', true),
  ('South Korea', 'เกาหลีใต้', 'KR', 'KOR', true),
  ('United Kingdom', 'สหราชอาณาจักร', 'GB', 'GBR', true),
  ('United States', 'สหรัฐอเมริกา', 'US', 'USA', true),
  ('Other', 'อื่น ๆ', 'ZZ', 'ZZZ', true),
  ('Prefer not to answer', 'ไม่ประสงค์ระบุ', 'XX', 'XXX', true)
ON CONFLICT (iso2_code) DO UPDATE
SET country_name_en = EXCLUDED.country_name_en,
    country_name_th = EXCLUDED.country_name_th,
    iso3_code = EXCLUDED.iso3_code,
    is_active = EXCLUDED.is_active;

INSERT INTO public.provinces (province_name_th, province_name_en, region_name, is_target_area, is_active)
VALUES
  ('ยะลา', 'Yala', 'Southern', true, true),
  ('ปัตตานี', 'Pattani', 'Southern', true, true),
  ('นราธิวาส', 'Narathiwat', 'Southern', true, true),
  ('สงขลา', 'Songkhla', 'Southern', false, true),
  ('สตูล', 'Satun', 'Southern', false, true),
  ('กรุงเทพมหานคร', 'Bangkok', 'Central', false, true),
  ('เชียงใหม่', 'Chiang Mai', 'Northern', false, true),
  ('ภูเก็ต', 'Phuket', 'Southern', false, true),
  ('นครศรีธรรมราช', 'Nakhon Si Thammarat', 'Southern', false, true),
  ('ตรัง', 'Trang', 'Southern', false, true),
  ('ไม่ประสงค์ระบุ', 'Prefer not to answer', 'Unknown', false, true)
ON CONFLICT (province_name_en) DO UPDATE
SET province_name_th = EXCLUDED.province_name_th,
    region_name = EXCLUDED.region_name,
    is_target_area = EXCLUDED.is_target_area,
    is_active = EXCLUDED.is_active;

WITH district_seed(province_en, district_name_th, district_name_en) AS (
  VALUES
    ('Yala', 'เมืองยะลา', 'Mueang Yala'),
    ('Yala', 'เบตง', 'Betong'),
    ('Yala', 'บันนังสตา', 'Bannang Sata'),
    ('Yala', 'ธารโต', 'Than To'),
    ('Yala', 'ยะหา', 'Yaha'),
    ('Yala', 'รามัน', 'Raman'),
    ('Pattani', 'เมืองปัตตานี', 'Mueang Pattani'),
    ('Pattani', 'โคกโพธิ์', 'Khok Pho'),
    ('Pattani', 'หนองจิก', 'Nong Chik'),
    ('Pattani', 'ปะนาเระ', 'Panare'),
    ('Pattani', 'มายอ', 'Mayo'),
    ('Pattani', 'ยะหริ่ง', 'Yaring'),
    ('Narathiwat', 'เมืองนราธิวาส', 'Mueang Narathiwat'),
    ('Narathiwat', 'สุไหงโก-ลก', 'Su-ngai Kolok'),
    ('Narathiwat', 'ตากใบ', 'Tak Bai'),
    ('Narathiwat', 'แว้ง', 'Waeng'),
    ('Narathiwat', 'สุคิริน', 'Sukhirin'),
    ('Narathiwat', 'บาเจาะ', 'Bacho'),
    ('Songkhla', 'เมืองสงขลา', 'Mueang Songkhla'),
    ('Songkhla', 'หาดใหญ่', 'Hat Yai'),
    ('Songkhla', 'จะนะ', 'Chana'),
    ('Songkhla', 'สะบ้าย้อย', 'Saba Yoi'),
    ('Satun', 'เมืองสตูล', 'Mueang Satun'),
    ('Satun', 'ละงู', 'La-ngu'),
    ('Satun', 'ควนโดน', 'Khuan Don'),
    ('Satun', 'ทุ่งหว้า', 'Thung Wa')
)
INSERT INTO public.districts (province_id, district_name_th, district_name_en, is_active)
SELECT p.province_id, d.district_name_th, d.district_name_en, true
FROM district_seed d
JOIN public.provinces p ON p.province_name_en = d.province_en
ON CONFLICT (province_id, district_name_th) DO UPDATE
SET district_name_en = EXCLUDED.district_name_en,
    is_active = EXCLUDED.is_active;

INSERT INTO public.attraction_types (type_name_th, type_name_en, description, display_order, is_active)
VALUES
  ('ธรรมชาติและเชิงนิเวศ', 'Nature & Ecotourism', 'Nature, forest, mountain, and ecology-based attractions', 1, true),
  ('วัฒนธรรมและประเพณี', 'Culture & Tradition', 'Local culture, living heritage, and community traditions', 2, true),
  ('ศาสนสถาน', 'Religious Sites', 'Mosques, temples, shrines, and sacred places', 3, true),
  ('ประวัติศาสตร์', 'Historical Sites', 'Historical places and heritage buildings', 4, true),
  ('ชุมชนและวิถีชีวิต', 'Community-based Tourism', 'Community, craft, market, and local life experiences', 5, true),
  ('ทะเลและชายฝั่ง', 'Beach & Coastal', 'Beaches, coastal viewpoints, islands, and seaside routes', 6, true),
  ('อาหารและของฝาก', 'Food & Souvenirs', 'Local food, cafes, products, and souvenirs', 7, true),
  ('จุดชมวิว', 'Viewpoint', 'Viewpoints and photography spots', 8, true),
  ('ผจญภัยและกีฬา', 'Adventure & Sports', 'Adventure, walking, cycling, and outdoor activities', 9, true),
  ('เมืองเก่าและสถาปัตยกรรม', 'Old Town & Architecture', 'Urban heritage, architecture, and walkable old towns', 10, true)
ON CONFLICT (type_name_en) DO UPDATE
SET type_name_th = EXCLUDED.type_name_th,
    description = EXCLUDED.description,
    display_order = EXCLUDED.display_order,
    is_active = EXCLUDED.is_active;

INSERT INTO public.transport_modes (name_th, name_en, display_order, is_active)
VALUES
  ('รถยนต์ส่วนตัว', 'Private Car', 1, true),
  ('รถตู้เช่าเหมา', 'Chartered Van', 2, true),
  ('รถโดยสารประจำทาง', 'Public Bus', 3, true),
  ('รถไฟ', 'Train', 4, true),
  ('เครื่องบิน', 'Airplane', 5, true),
  ('รถจักรยานยนต์', 'Motorcycle', 6, true),
  ('รถเช่า', 'Rental Car', 7, true),
  ('เดินเท้า', 'Walking', 8, true),
  ('เรือ', 'Boat', 9, true),
  ('อื่น ๆ', 'Other', 10, true)
ON CONFLICT (name_en) DO UPDATE
SET name_th = EXCLUDED.name_th,
    display_order = EXCLUDED.display_order,
    is_active = EXCLUDED.is_active;

INSERT INTO public.travel_purposes (name_th, name_en, display_order, is_active)
VALUES
  ('พักผ่อนหย่อนใจ', 'Leisure/Vacation', 1, true),
  ('ไหว้พระ/ทำบุญ', 'Religious/Merit making', 2, true),
  ('เยี่ยมญาติ/เพื่อน', 'Visiting friends/relatives', 3, true),
  ('ศึกษาดูงาน', 'Study/Field trip', 4, true),
  ('ประชุม/สัมมนา', 'Business/MICE', 5, true),
  ('ชิมอาหารท้องถิ่น', 'Food tasting', 6, true),
  ('ถ่ายภาพ/คอนเทนต์', 'Photography/Content', 7, true),
  ('ท่องเที่ยวชุมชน', 'Community tourism', 8, true),
  ('เดินทางผ่าน', 'Transit/Stopover', 9, true),
  ('อื่น ๆ', 'Other', 10, true)
ON CONFLICT (name_en) DO UPDATE
SET name_th = EXCLUDED.name_th,
    display_order = EXCLUDED.display_order,
    is_active = EXCLUDED.is_active;

INSERT INTO public.travel_companions (name_th, name_en, display_order, is_active)
VALUES
  ('เดินทางคนเดียว', 'Alone', 1, true),
  ('ครอบครัว', 'Family', 2, true),
  ('เพื่อน', 'Friends', 3, true),
  ('คู่รัก', 'Couple', 4, true),
  ('หมู่คณะ/กรุ๊ปทัวร์', 'Tour Group', 5, true),
  ('เพื่อนร่วมงาน', 'Colleagues', 6, true),
  ('โรงเรียน/มหาวิทยาลัย', 'School/University group', 7, true),
  ('อื่น ๆ', 'Other', 8, true)
ON CONFLICT (name_en) DO UPDATE
SET name_th = EXCLUDED.name_th,
    display_order = EXCLUDED.display_order,
    is_active = EXCLUDED.is_active;

INSERT INTO public.expense_categories (name_th, name_en, display_order, is_active)
VALUES
  ('ที่พัก', 'Accommodation', 1, true),
  ('อาหารและเครื่องดื่ม', 'Food & Beverage', 2, true),
  ('การเดินทาง', 'Transportation', 3, true),
  ('ของฝาก/ของที่ระลึก', 'Souvenirs', 4, true),
  ('ค่าเข้าชม/กิจกรรม', 'Activities/Entrance fees', 5, true),
  ('คาเฟ่/เครื่องดื่มพิเศษ', 'Cafe/Special drinks', 6, true),
  ('บริการท้องถิ่น', 'Local services', 7, true),
  ('อื่น ๆ', 'Other', 8, true)
ON CONFLICT (name_en) DO UPDATE
SET name_th = EXCLUDED.name_th,
    display_order = EXCLUDED.display_order,
    is_active = EXCLUDED.is_active;

INSERT INTO public.spending_ranges (range_label_th, range_label_en, min_value, max_value, display_order, is_active)
VALUES
  ('น้อยกว่า 500 บาท', 'Less than 500 THB', 0, 499, 1, true),
  ('500 - 1,000 บาท', '500 - 1,000 THB', 500, 1000, 2, true),
  ('1,001 - 3,000 บาท', '1,001 - 3,000 THB', 1001, 3000, 3, true),
  ('3,001 - 5,000 บาท', '3,001 - 5,000 THB', 3001, 5000, 4, true),
  ('5,001 - 10,000 บาท', '5,001 - 10,000 THB', 5001, 10000, 5, true),
  ('มากกว่า 10,000 บาท', 'More than 10,000 THB', 10001, null, 6, true),
  ('ไม่ประสงค์ระบุ', 'Prefer not to answer', null, null, 7, true)
ON CONFLICT (range_label_en) DO UPDATE
SET range_label_th = EXCLUDED.range_label_th,
    min_value = EXCLUDED.min_value,
    max_value = EXCLUDED.max_value,
    display_order = EXCLUDED.display_order,
    is_active = EXCLUDED.is_active;

INSERT INTO public.age_groups (label, min_age, max_age, display_order, is_active)
VALUES
  ('ต่ำกว่า 18 ปี', null, 17, 1, true),
  ('18 - 25 ปี', 18, 25, 2, true),
  ('26 - 35 ปี', 26, 35, 3, true),
  ('36 - 45 ปี', 36, 45, 4, true),
  ('46 - 60 ปี', 46, 60, 5, true),
  ('มากกว่า 60 ปี', 61, null, 6, true),
  ('ไม่ประสงค์ระบุ', null, null, 7, true)
ON CONFLICT (label) DO UPDATE
SET min_age = EXCLUDED.min_age,
    max_age = EXCLUDED.max_age,
    display_order = EXCLUDED.display_order,
    is_active = EXCLUDED.is_active;

-- ==========================================
-- 2. ADMIN ROLES AND PERMISSIONS
-- ==========================================

INSERT INTO public.roles (role_name, description, is_active)
VALUES
  ('super_admin', 'Full platform access', true),
  ('admin', 'Content and operations administrator', true),
  ('province_admin', 'Manage data within an assigned province', true),
  ('attraction_manager', 'Manage assigned attraction content and QR points', true),
  ('viewer', 'Read-only dashboard and report viewer', true)
ON CONFLICT (role_name) DO UPDATE
SET description = EXCLUDED.description,
    is_active = EXCLUDED.is_active;

INSERT INTO public.permissions (permission_name, description)
VALUES
  ('dashboard.read', 'View dashboard analytics'),
  ('dashboard.sensitive_view', 'View sensitive dashboard segments when approved'),
  ('dashboard.system_metrics', 'View system dashboard metrics'),
  ('attraction.read', 'Read attraction records'),
  ('attraction.create', 'Create attraction records'),
  ('attraction.update', 'Update attraction records'),
  ('attraction.publish', 'Publish attraction records'),
  ('attraction.unpublish', 'Unpublish attraction records'),
  ('attraction.deactivate', 'Deactivate attraction records'),
  ('attraction.delete', 'Delete attraction records'),
  ('attraction.manage', 'Manage attraction records'),
  ('photo_spot.read', 'Read photo spot records'),
  ('photo_spot.create', 'Create photo spot records'),
  ('photo_spot.update', 'Update photo spot records'),
  ('photo_spot.deactivate', 'Deactivate photo spot records'),
  ('photo_spot.delete', 'Delete photo spot records'),
  ('checkin_code.read', 'Read check-in code records'),
  ('checkin_code.create', 'Create check-in code records'),
  ('checkin_code.update', 'Update check-in code records'),
  ('checkin_code.deactivate', 'Deactivate check-in code records'),
  ('checkin_code.delete', 'Delete check-in code records'),
  ('checkin_code.download_qr', 'Download QR assets'),
  ('checkin_code.manage', 'Manage check-in code records'),
  ('media.read', 'Read media records'),
  ('media.upload', 'Upload media'),
  ('media.update', 'Update media'),
  ('media.deactivate', 'Deactivate media'),
  ('media.delete', 'Delete media'),
  ('visit.read', 'Read operational visit records'),
  ('visit.detail', 'Read visit detail records'),
  ('visit.update', 'Update visit records'),
  ('visit.sensitive_view', 'View sensitive visit fields when approved'),
  ('tourist.read', 'Read tourist profile summaries'),
  ('tourist.detail', 'Read tourist profile detail'),
  ('tourist.sensitive_view', 'View sensitive tourist fields when approved'),
  ('tourist.anonymize', 'Anonymize tourist records'),
  ('tourist.delete', 'Delete tourist records when policy allows'),
  ('tourist.identity_read', 'Read safe tourist identity status'),
  ('survey.read', 'Read survey summaries'),
  ('survey.detail', 'Read survey detail'),
  ('survey.comment_read', 'Read optional survey comments'),
  ('survey.export', 'Export survey data'),
  ('survey.delete', 'Delete survey records when policy allows'),
  ('certificate.read', 'Read certificate records'),
  ('certificate.detail', 'Read certificate detail'),
  ('certificate.revoke', 'Revoke certificates'),
  ('certificate.regenerate', 'Regenerate certificates'),
  ('certificate.template_manage', 'Manage certificate templates'),
  ('stamp.read', 'Read stamp records'),
  ('stamp.definition_manage', 'Manage stamp definitions'),
  ('stamp.revoke', 'Revoke stamps'),
  ('stamp.award_manual', 'Award stamps manually'),
  ('export.summary', 'Create summary exports'),
  ('export.detailed', 'Create detailed exports'),
  ('export.create', 'Create export jobs'),
  ('export.visit_records', 'Export visit records'),
  ('export.tourist_summary', 'Export tourist summaries'),
  ('export.expense_data', 'Export expense data'),
  ('export.survey_data', 'Export survey data'),
  ('export.funnel_data', 'Export funnel data'),
  ('export.dashboard_summary', 'Export dashboard summaries'),
  ('export.comments', 'Export optional comments'),
  ('export.personal_data', 'Export personal data when policy allows'),
  ('official_data.read', 'Read official imported data'),
  ('official_data.import', 'Import official data'),
  ('official_data.update', 'Update official imported data'),
  ('official_data.delete', 'Delete official imported data'),
  ('official_data.link_attraction', 'Link official references to attractions'),
  ('audit.read', 'Read audit logs'),
  ('audit.export', 'Export audit logs'),
  ('user.read', 'Read admin users'),
  ('user.create', 'Create admin users'),
  ('user.update', 'Update admin users'),
  ('user.deactivate', 'Deactivate admin users'),
  ('user.manage', 'Manage admin users'),
  ('user.manage_roles', 'Manage admin user roles'),
  ('role.read', 'Read roles'),
  ('role.create', 'Create roles'),
  ('role.update', 'Update roles'),
  ('role.delete', 'Delete roles'),
  ('role.manage', 'Manage roles'),
  ('permission.read', 'Read permissions'),
  ('permission.manage', 'Manage permissions'),
  ('system.settings_read', 'Read system settings'),
  ('system.settings_update', 'Update system settings'),
  ('system.job_run', 'Run system jobs'),
  ('system.job_read', 'Read system jobs'),
  ('system.maintenance', 'Perform system maintenance'),
  ('system.all', 'Full system access')
ON CONFLICT (permission_name) DO UPDATE
SET description = EXCLUDED.description;

INSERT INTO public.role_permissions (role_id, permission_id)
SELECT r.role_id, p.permission_id
FROM public.roles r
CROSS JOIN public.permissions p
WHERE r.role_name = 'super_admin'
ON CONFLICT DO NOTHING;

INSERT INTO public.role_permissions (role_id, permission_id)
SELECT r.role_id, p.permission_id
FROM public.roles r
JOIN public.permissions p ON p.permission_name IN (
  'dashboard.read',
  'attraction.read', 'attraction.create', 'attraction.update', 'attraction.publish', 'attraction.unpublish', 'attraction.deactivate',
  'photo_spot.read', 'photo_spot.create', 'photo_spot.update', 'photo_spot.deactivate',
  'checkin_code.read', 'checkin_code.create', 'checkin_code.update', 'checkin_code.deactivate', 'checkin_code.download_qr',
  'media.read', 'media.upload', 'media.update', 'media.deactivate',
  'visit.read', 'visit.detail',
  'survey.read', 'survey.detail',
  'certificate.read',
  'stamp.read',
  'export.summary',
  'official_data.read', 'official_data.import', 'official_data.update', 'official_data.link_attraction'
)
WHERE r.role_name IN ('admin', 'province_admin', 'attraction_manager')
ON CONFLICT DO NOTHING;

INSERT INTO public.role_permissions (role_id, permission_id)
SELECT r.role_id, p.permission_id
FROM public.roles r
JOIN public.permissions p ON p.permission_name IN ('dashboard.read', 'attraction.read', 'visit.read', 'survey.read', 'export.summary', 'official_data.read')
WHERE r.role_name = 'viewer'
ON CONFLICT DO NOTHING;

INSERT INTO public.admin_users (admin_id, email, auth_user_id, display_name, is_active)
VALUES
  ('01000000-0000-4000-8000-000000000001', 'admin.demo@example.test', null, 'Demo Super Admin', true),
  ('01000000-0000-4000-8000-000000000002', 'viewer.demo@example.test', null, 'Demo Viewer', true)
ON CONFLICT (email) DO UPDATE
SET display_name = EXCLUDED.display_name,
    is_active = EXCLUDED.is_active;

INSERT INTO public.admin_user_roles (admin_id, role_id)
SELECT au.admin_id, r.role_id
FROM public.admin_users au
JOIN public.roles r ON r.role_name = 'super_admin'
WHERE au.email = 'admin.demo@example.test'
ON CONFLICT DO NOTHING;

INSERT INTO public.admin_user_roles (admin_id, role_id)
SELECT au.admin_id, r.role_id
FROM public.admin_users au
JOIN public.roles r ON r.role_name = 'viewer'
WHERE au.email = 'viewer.demo@example.test'
ON CONFLICT DO NOTHING;

-- ==========================================
-- 3. PUBLIC TOURISM CONTENT
-- ==========================================

WITH attraction_seed(province_en, district_en, type_en, slug, name_th, name_en, short_description_th, short_description_en, latitude, longitude, opening_hours, sustainability_category, capacity) AS (
  VALUES
    ('Yala', 'Betong', 'Viewpoint', 'aiyerweng-skywalk', 'สกายวอล์คอัยเยอร์เวง', 'Aiyerweng Skywalk', 'จุดชมทะเลหมอกสำคัญของเบตง เหมาะสำหรับ QR check-in และภาพใบประกาศ', 'Betong mist viewpoint designed for QR check-in and certificate memories.', 5.9793000, 101.1215000, '05:30-18:00', 'nature_viewpoint', 1200),
    ('Yala', 'Betong', 'Nature & Ecotourism', 'betong-hot-spring', 'บ่อน้ำร้อนเบตง', 'Betong Hot Spring', 'แหล่งพักผ่อนเชิงสุขภาพและธรรมชาติในเบตง', 'Wellness and nature stop in Betong.', 5.7742000, 101.0725000, '08:00-18:00', 'wellness_nature', 700),
    ('Yala', 'Mueang Yala', 'Historical Sites', 'yala-city-pillar', 'ศาลหลักเมืองยะลา', 'Yala City Pillar Shrine', 'จุดหมายใจกลางเมืองสำหรับเรียนรู้เมืองยะลา', 'Central Yala cultural landmark.', 6.5410000, 101.2810000, '08:00-18:00', 'urban_culture', 500),
    ('Yala', 'Bannang Sata', 'Nature & Ecotourism', 'hala-bala-forest-yala', 'ป่าฮาลา-บาลา ฝั่งยะลา', 'Hala-Bala Forest Yala', 'พื้นที่ธรรมชาติสำคัญของชายแดนใต้', 'Southern border rainforest experience.', 6.0800000, 101.3400000, '08:30-16:30', 'ecotourism', 300),
    ('Pattani', 'Mueang Pattani', 'Religious Sites', 'pattani-central-mosque', 'มัสยิดกลางปัตตานี', 'Pattani Central Mosque', 'ศาสนสถานสำคัญและสถาปัตยกรรมโดดเด่นของปัตตานี', 'Iconic mosque and architecture landmark in Pattani.', 6.8643000, 101.2589000, '08:00-18:00', 'culture_religion', 900),
    ('Pattani', 'Mueang Pattani', 'Historical Sites', 'lim-ko-niao-shrine', 'ศาลเจ้าแม่ลิ้มกอเหนี่ยว', 'Lim Ko Niao Shrine', 'แหล่งศรัทธาและประวัติศาสตร์คู่เมืองปัตตานี', 'Historic shrine and faith destination.', 6.8701000, 101.2501000, '08:00-17:30', 'heritage', 650),
    ('Pattani', 'Mueang Pattani', 'Old Town & Architecture', 'pattani-old-town', 'เมืองเก่าปัตตานี', 'Pattani Old Town', 'ย่านเมืองเก่าที่เหมาะกับเส้นทางเดินชมสถาปัตยกรรมและอาหารท้องถิ่น', 'Walkable old town route with food and architecture.', 6.8695000, 101.2515000, 'All day', 'old_town', 1500),
    ('Pattani', 'Yaring', 'Beach & Coastal', 'talo-kapo-beach', 'หาดตะโละกาโปร์', 'Talo Kapo Beach', 'ชายหาดและวิถีประมงใกล้เมืองปัตตานี', 'Coastal and fishing community experience near Pattani.', 6.8810000, 101.4270000, 'All day', 'coastal_community', 800),
    ('Narathiwat', 'Mueang Narathiwat', 'Beach & Coastal', 'narathat-beach', 'หาดนราทัศน์', 'Narathat Beach', 'ชายหาดเมืองนราธิวาสสำหรับพักผ่อนและถ่ายภาพ', 'City beach for leisure and photo memories.', 6.4260000, 101.8260000, 'All day', 'coastal', 1200),
    ('Narathiwat', 'Tak Bai', 'Beach & Coastal', 'ao-manao-narathiwat', 'อ่าวมะนาวนราธิวาส', 'Ao Manao Narathiwat', 'จุดพักผ่อนริมทะเลและเส้นทางชายฝั่ง', 'Quiet coastal stop in Narathiwat.', 6.2340000, 102.0740000, 'All day', 'coastal', 900),
    ('Narathiwat', 'Su-ngai Kolok', 'Community-based Tourism', 'sungai-kolok-border-market', 'ตลาดชายแดนสุไหงโก-ลก', 'Su-ngai Kolok Border Market', 'พื้นที่เศรษฐกิจและวิถีชีวิตชายแดน', 'Border market and local life experience.', 6.0300000, 101.9650000, '08:00-20:00', 'border_economy', 1600),
    ('Narathiwat', 'Waeng', 'Nature & Ecotourism', 'sirindhorn-peat-swamp', 'ป่าพรุสิรินธร', 'Sirindhorn Peat Swamp Forest', 'พื้นที่ชุ่มน้ำและระบบนิเวศสำคัญของนราธิวาส', 'Important peat swamp ecosystem destination.', 6.2750000, 101.9902000, '08:30-16:30', 'wetland_ecotourism', 350),
    ('Songkhla', 'Mueang Songkhla', 'Old Town & Architecture', 'songkhla-old-town', 'ย่านเมืองเก่าสงขลา', 'Songkhla Old Town', 'เมืองเก่าริมทะเลสาบที่เชื่อมโยงอาหาร ศิลปะ และประวัติศาสตร์', 'Lakeside old town with food, art, and history.', 7.2000000, 100.5900000, 'All day', 'old_town', 2500),
    ('Songkhla', 'Hat Yai', 'Viewpoint', 'hat-yai-municipal-park', 'สวนสาธารณะเทศบาลนครหาดใหญ่', 'Hat Yai Municipal Park', 'จุดชมวิวเมืองหาดใหญ่และพื้นที่พักผ่อน', 'City viewpoint and recreation park.', 7.0300000, 100.5000000, '05:00-20:00', 'urban_viewpoint', 2200),
    ('Satun', 'La-ngu', 'Beach & Coastal', 'pak-bara-pier', 'ท่าเรือปากบารา', 'Pak Bara Pier', 'ประตูสู่หมู่เกาะสตูลและจุดเริ่มต้นเส้นทางทะเล', 'Gateway pier to Satun island routes.', 6.8630000, 99.7330000, '06:00-18:00', 'marine_gateway', 1800),
    ('Satun', 'Mueang Satun', 'Nature & Ecotourism', 'tarutao-national-park', 'อุทยานแห่งชาติตะรุเตา', 'Tarutao National Park', 'เส้นทางธรรมชาติและทะเลระดับประเทศในสตูล', 'National park island and nature route.', 6.6500000, 99.6500000, '08:30-16:30', 'marine_ecotourism', 1000),
    ('Yala', 'Mueang Yala', 'Food & Souvenirs', 'tara-restaurant-yala', 'ร้านอาหารธารา ยะลา', 'Tara Restaurant Yala', 'ร้านอาหารท้องถิ่นขึ้นชื่อเมืองยะลา', 'Famous local restaurant in Yala.', 6.5450000, 101.2850000, '10:00-22:00', 'local_food', 200),
    ('Pattani', 'Mueang Pattani', 'Food & Souvenirs', 'roti-de-forest-pattani', 'โรตี เดอ ฟอเรส ปัตตานี', 'Roti de Forest Pattani', 'ร้านคาเฟ่และโรตีฟิวชั่นชื่อดัง', 'Popular cafe and fusion roti restaurant.', 6.8750000, 101.2550000, '09:00-21:00', 'local_food', 150),
    ('Narathiwat', 'Mueang Narathiwat', 'Food & Souvenirs', 'mangkon-thong-narathiwat', 'ร้านอาหารมังกรทอง นราธิวาส', 'Golden Dragon Restaurant', 'ร้านอาหารซีฟู้ดและอาหารท้องถิ่น', 'Seafood and local cuisine restaurant.', 6.4300000, 101.8300000, '10:00-22:00', 'local_food', 250)
)
INSERT INTO public.attractions (
  province_id, district_id, attraction_type_id, slug, name_th, name_en,
  short_description_th, short_description_en, description_th, description_en,
  latitude, longitude, opening_hours, sustainability_category,
  estimated_capacity_per_day, is_published, is_active
)
SELECT
  p.province_id,
  d.district_id,
  at.attraction_type_id,
  s.slug,
  s.name_th,
  s.name_en,
  s.short_description_th,
  s.short_description_en,
  s.short_description_th,
  s.short_description_en,
  s.latitude,
  s.longitude,
  s.opening_hours,
  s.sustainability_category,
  s.capacity,
  true,
  true
FROM attraction_seed s
JOIN public.provinces p ON p.province_name_en = s.province_en
LEFT JOIN public.districts d ON d.province_id = p.province_id AND d.district_name_en = s.district_en
LEFT JOIN public.attraction_types at ON at.type_name_en = s.type_en
ON CONFLICT (slug) DO UPDATE
SET province_id = EXCLUDED.province_id,
    district_id = EXCLUDED.district_id,
    attraction_type_id = EXCLUDED.attraction_type_id,
    name_th = EXCLUDED.name_th,
    name_en = EXCLUDED.name_en,
    short_description_th = EXCLUDED.short_description_th,
    short_description_en = EXCLUDED.short_description_en,
    description_th = EXCLUDED.description_th,
    description_en = EXCLUDED.description_en,
    latitude = EXCLUDED.latitude,
    longitude = EXCLUDED.longitude,
    opening_hours = EXCLUDED.opening_hours,
    sustainability_category = EXCLUDED.sustainability_category,
    estimated_capacity_per_day = EXCLUDED.estimated_capacity_per_day,
    is_published = EXCLUDED.is_published,
    is_active = EXCLUDED.is_active;

WITH media_seed(slug, storage_path, alt_text_th, caption_th, display_order, is_cover) AS (
  VALUES
    ('aiyerweng-skywalk', 'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?q=80&w=1200&auto=format&fit=crop', 'ทะเลหมอกอัยเยอร์เวง', 'จุดชมวิวทะเลหมอกยามเช้า', 1, true),
    ('betong-hot-spring', 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?q=80&w=1200&auto=format&fit=crop', 'บ่อน้ำร้อนเบตง', 'พักผ่อนเชิงสุขภาพ', 1, true),
    ('pattani-central-mosque', 'https://images.unsplash.com/photo-1587823527237-770498eb7909?q=80&w=1200&auto=format&fit=crop', 'มัสยิดกลางปัตตานี', 'สถาปัตยกรรมศาสนสถาน', 1, true),
    ('pattani-old-town', 'https://images.unsplash.com/photo-1524231757912-21f4fe3a7200?q=80&w=1200&auto=format&fit=crop', 'เมืองเก่าปัตตานี', 'เดินชมเมืองเก่าและอาหารท้องถิ่น', 1, true),
    ('narathat-beach', 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?q=80&w=1200&auto=format&fit=crop', 'หาดนราทัศน์', 'ชายหาดเมืองนราธิวาส', 1, true),
    ('songkhla-old-town', 'https://images.unsplash.com/photo-1518005020951-eccb494ad742?q=80&w=1200&auto=format&fit=crop', 'เมืองเก่าสงขลา', 'สถาปัตยกรรมและศิลปะชุมชน', 1, true),
    ('pak-bara-pier', 'https://images.unsplash.com/photo-1500375592092-40eb2168fd21?q=80&w=1200&auto=format&fit=crop', 'ท่าเรือปากบารา', 'ประตูสู่ทะเลสตูล', 1, true)
)
INSERT INTO public.attraction_media (attraction_id, media_type, storage_path, alt_text_th, caption_th, display_order, is_cover, is_active)
SELECT a.attraction_id, 'external_url', m.storage_path, m.alt_text_th, m.caption_th, m.display_order, m.is_cover, true
FROM media_seed m
JOIN public.attractions a ON a.slug = m.slug
ON CONFLICT (attraction_id, storage_path) DO UPDATE
SET alt_text_th = EXCLUDED.alt_text_th,
    caption_th = EXCLUDED.caption_th,
    display_order = EXCLUDED.display_order,
    is_cover = EXCLUDED.is_cover,
    is_active = EXCLUDED.is_active;

WITH spot_seed(slug, spot_name_th, spot_name_en, description_th, display_order, code, label) AS (
  VALUES
    ('aiyerweng-skywalk', 'จุดชมทะเลหมอกหลัก', 'Main mist viewpoint', 'จุดถ่ายภาพหลักสำหรับใบประกาศ', 1, 'DEMO-CODE-123', 'Demo QR: Aiyerweng main viewpoint'),
    ('aiyerweng-skywalk', 'สะพานกระจก', 'Glass skywalk', 'จุดถ่ายภาพบนสะพานกระจก', 2, 'QR-AIYERWENG-SKYWALK', 'Aiyerweng glass skywalk'),
    ('betong-hot-spring', 'บ่อน้ำร้อนหลัก', 'Main hot spring', 'จุดพักผ่อนและถ่ายภาพหน้าแหล่งน้ำร้อน', 1, 'QR-BETONG-HOTSPRING', 'Betong Hot Spring'),
    ('yala-city-pillar', 'ลานศาลหลักเมือง', 'City pillar plaza', 'จุดถ่ายภาพหน้าแลนด์มาร์กเมืองยะลา', 1, 'QR-YALA-CITY-PILLAR', 'Yala City Pillar'),
    ('hala-bala-forest-yala', 'ป้ายเส้นทางธรรมชาติ', 'Nature trail sign', 'จุดเริ่มต้นเส้นทางป่า', 1, 'QR-HALA-BALA-YALA', 'Hala-Bala Yala'),
    ('pattani-central-mosque', 'ลานหน้ามัสยิด', 'Mosque front plaza', 'จุดถ่ายภาพสถาปัตยกรรมหลัก', 1, 'QR-PATTANI-MOSQUE', 'Pattani Central Mosque'),
    ('pattani-central-mosque', 'มุมสะท้อนน้ำ', 'Reflection corner', 'มุมถ่ายภาพเงาสะท้อน', 2, 'QR-PATTANI-MOSQUE-REFLECT', 'Pattani Mosque reflection'),
    ('lim-ko-niao-shrine', 'ซุ้มทางเข้าศาลเจ้า', 'Shrine entrance', 'จุดถ่ายภาพซุ้มทางเข้า', 1, 'QR-LIM-KO-NIAO', 'Lim Ko Niao Shrine'),
    ('pattani-old-town', 'ถนนศิลปะเมืองเก่า', 'Old town art street', 'จุดเดินถ่ายภาพเมืองเก่า', 1, 'QR-PATTANI-OLDTOWN', 'Pattani Old Town'),
    ('talo-kapo-beach', 'ริมหาดตะโละกาโปร์', 'Beachfront point', 'จุดถ่ายภาพชายหาดและเรือประมง', 1, 'QR-TALO-KAPO', 'Talo Kapo Beach'),
    ('narathat-beach', 'ลานริมทะเล', 'Beach promenade', 'จุดพักผ่อนริมทะเล', 1, 'QR-NARATHAT-BEACH', 'Narathat Beach'),
    ('ao-manao-narathiwat', 'จุดชมชายฝั่ง', 'Coastal viewpoint', 'มุมถ่ายภาพชายฝั่ง', 1, 'QR-AO-MANAO-NARA', 'Ao Manao Narathiwat'),
    ('sungai-kolok-border-market', 'ประตูตลาดชายแดน', 'Border market gate', 'จุดถ่ายภาพตลาดชายแดน', 1, 'QR-KOLOK-MARKET', 'Su-ngai Kolok Border Market'),
    ('sirindhorn-peat-swamp', 'ทางเดินศึกษาธรรมชาติ', 'Nature boardwalk', 'ทางเดินชมระบบนิเวศป่าพรุ', 1, 'QR-PEAT-SWAMP', 'Sirindhorn Peat Swamp'),
    ('songkhla-old-town', 'ถนนเมืองเก่าสงขลา', 'Songkhla old street', 'มุมเดินชมเมืองเก่า', 1, 'QR-SONGKHLA-OLDTOWN', 'Songkhla Old Town'),
    ('songkhla-old-town', 'มุมสตรีทอาร์ต', 'Street art corner', 'มุมถ่ายภาพศิลปะชุมชน', 2, 'QR-SONGKHLA-STREETART', 'Songkhla street art'),
    ('hat-yai-municipal-park', 'จุดชมวิวหาดใหญ่', 'Hat Yai viewpoint', 'จุดชมวิวเมืองหาดใหญ่', 1, 'QR-HATYAI-PARK', 'Hat Yai Municipal Park'),
    ('pak-bara-pier', 'ป้ายท่าเรือปากบารา', 'Pak Bara pier sign', 'จุดเริ่มต้นเส้นทางทะเลสตูล', 1, 'QR-PAK-BARA', 'Pak Bara Pier'),
    ('pak-bara-pier', 'มุมเรือออกเดินทาง', 'Boat departure point', 'มุมถ่ายภาพก่อนออกทะเล', 2, 'QR-PAK-BARA-BOAT', 'Pak Bara boat point'),
    ('tarutao-national-park', 'ป้ายอุทยานตะรุเตา', 'Tarutao park sign', 'จุดเช็กอินอุทยาน', 1, 'QR-TARUTAO-PARK', 'Tarutao National Park'),
    ('narathat-beach', 'มุมพระอาทิตย์ตก', 'Sunset corner', 'มุมพระอาทิตย์ตกริมทะเล', 2, 'QR-NARATHAT-SUNSET', 'Narathat sunset'),
    ('pattani-old-town', 'คาเฟ่ชุมชนเมืองเก่า', 'Community cafe corner', 'มุมอาหารและคาเฟ่ท้องถิ่น', 2, 'QR-PATTANI-CAFE', 'Pattani old town cafe')
)
INSERT INTO public.photo_spots (attraction_id, spot_name_th, spot_name_en, description_th, display_order, is_active)
SELECT a.attraction_id, s.spot_name_th, s.spot_name_en, s.description_th, s.display_order, true
FROM spot_seed s
JOIN public.attractions a ON a.slug = s.slug
ON CONFLICT (attraction_id, spot_name_th) DO UPDATE
SET spot_name_en = EXCLUDED.spot_name_en,
    description_th = EXCLUDED.description_th,
    display_order = EXCLUDED.display_order,
    is_active = EXCLUDED.is_active;

WITH spot_seed(slug, spot_name_th, code, label) AS (
  VALUES
    ('aiyerweng-skywalk', 'จุดชมทะเลหมอกหลัก', 'DEMO-CODE-123', 'Demo QR: Aiyerweng main viewpoint'),
    ('aiyerweng-skywalk', 'สะพานกระจก', 'QR-AIYERWENG-SKYWALK', 'Aiyerweng glass skywalk'),
    ('betong-hot-spring', 'บ่อน้ำร้อนหลัก', 'QR-BETONG-HOTSPRING', 'Betong Hot Spring'),
    ('yala-city-pillar', 'ลานศาลหลักเมือง', 'QR-YALA-CITY-PILLAR', 'Yala City Pillar'),
    ('hala-bala-forest-yala', 'ป้ายเส้นทางธรรมชาติ', 'QR-HALA-BALA-YALA', 'Hala-Bala Yala'),
    ('pattani-central-mosque', 'ลานหน้ามัสยิด', 'QR-PATTANI-MOSQUE', 'Pattani Central Mosque'),
    ('pattani-central-mosque', 'มุมสะท้อนน้ำ', 'QR-PATTANI-MOSQUE-REFLECT', 'Pattani Mosque reflection'),
    ('lim-ko-niao-shrine', 'ซุ้มทางเข้าศาลเจ้า', 'QR-LIM-KO-NIAO', 'Lim Ko Niao Shrine'),
    ('pattani-old-town', 'ถนนศิลปะเมืองเก่า', 'QR-PATTANI-OLDTOWN', 'Pattani Old Town'),
    ('talo-kapo-beach', 'ริมหาดตะโละกาโปร์', 'QR-TALO-KAPO', 'Talo Kapo Beach'),
    ('narathat-beach', 'ลานริมทะเล', 'QR-NARATHAT-BEACH', 'Narathat Beach'),
    ('ao-manao-narathiwat', 'จุดชมชายฝั่ง', 'QR-AO-MANAO-NARA', 'Ao Manao Narathiwat'),
    ('sungai-kolok-border-market', 'ประตูตลาดชายแดน', 'QR-KOLOK-MARKET', 'Su-ngai Kolok Border Market'),
    ('sirindhorn-peat-swamp', 'ทางเดินศึกษาธรรมชาติ', 'QR-PEAT-SWAMP', 'Sirindhorn Peat Swamp'),
    ('songkhla-old-town', 'ถนนเมืองเก่าสงขลา', 'QR-SONGKHLA-OLDTOWN', 'Songkhla Old Town'),
    ('songkhla-old-town', 'มุมสตรีทอาร์ต', 'QR-SONGKHLA-STREETART', 'Songkhla street art'),
    ('hat-yai-municipal-park', 'จุดชมวิวหาดใหญ่', 'QR-HATYAI-PARK', 'Hat Yai Municipal Park'),
    ('pak-bara-pier', 'ป้ายท่าเรือปากบารา', 'QR-PAK-BARA', 'Pak Bara Pier'),
    ('pak-bara-pier', 'มุมเรือออกเดินทาง', 'QR-PAK-BARA-BOAT', 'Pak Bara boat point'),
    ('tarutao-national-park', 'ป้ายอุทยานตะรุเตา', 'QR-TARUTAO-PARK', 'Tarutao National Park'),
    ('narathat-beach', 'มุมพระอาทิตย์ตก', 'QR-NARATHAT-SUNSET', 'Narathat sunset'),
    ('pattani-old-town', 'คาเฟ่ชุมชนเมืองเก่า', 'QR-PATTANI-CAFE', 'Pattani old town cafe')
)
INSERT INTO public.checkin_codes (code, attraction_id, photo_spot_id, label, is_active)
SELECT s.code, a.attraction_id, ps.photo_spot_id, s.label, true
FROM spot_seed s
JOIN public.attractions a ON a.slug = s.slug
JOIN public.photo_spots ps ON ps.attraction_id = a.attraction_id AND ps.spot_name_th = s.spot_name_th
ON CONFLICT (code) DO UPDATE
SET attraction_id = EXCLUDED.attraction_id,
    photo_spot_id = EXCLUDED.photo_spot_id,
    label = EXCLUDED.label,
    is_active = EXCLUDED.is_active;

INSERT INTO public.certificate_templates (template_name, background_path, layout_config_json, language, is_default, is_active)
VALUES
  ('Southern Border Memory Card TH', 'certificate-templates/southern-border-th.png', '{"theme":"emerald-gold","photo":"center","language":"th"}'::jsonb, 'th', true, true),
  ('Southern Border Memory Card EN', 'certificate-templates/southern-border-en.png', '{"theme":"emerald-gold","photo":"center","language":"en"}'::jsonb, 'en', false, true)
ON CONFLICT (template_name, language) DO UPDATE
SET background_path = EXCLUDED.background_path,
    layout_config_json = EXCLUDED.layout_config_json,
    is_default = EXCLUDED.is_default,
    is_active = EXCLUDED.is_active;

INSERT INTO public.stamp_definitions (attraction_id, stamp_name_th, stamp_name_en, description_th, description_en, stamp_image_path, is_active)
SELECT attraction_id, name_th || ' Stamp', name_en || ' Stamp', short_description_th, short_description_en, 'stamp-assets/' || slug || '.png', true
FROM public.attractions
WHERE slug IN (
  'aiyerweng-skywalk', 'betong-hot-spring', 'yala-city-pillar', 'hala-bala-forest-yala',
  'pattani-central-mosque', 'lim-ko-niao-shrine', 'pattani-old-town', 'talo-kapo-beach',
  'narathat-beach', 'ao-manao-narathiwat', 'sungai-kolok-border-market', 'sirindhorn-peat-swamp',
  'songkhla-old-town', 'hat-yai-municipal-park', 'pak-bara-pier', 'tarutao-national-park'
)
ON CONFLICT (attraction_id) DO UPDATE
SET stamp_name_th = EXCLUDED.stamp_name_th,
    stamp_name_en = EXCLUDED.stamp_name_en,
    description_th = EXCLUDED.description_th,
    description_en = EXCLUDED.description_en,
    stamp_image_path = EXCLUDED.stamp_image_path,
    is_active = EXCLUDED.is_active;

WITH route_seed(slug, name_th, name_en, description_th, description_en, cover_image_path) AS (
  VALUES
    ('betong-mist-wellness-route', 'เส้นทางทะเลหมอกและเมืองเบตง', 'Betong Mist & Wellness Route', 'อัยเยอร์เวง บ่อน้ำร้อน และเมืองเบตง', 'Aiyerweng, hot spring, and Betong city loop.', 'routes/betong-mist.jpg'),
    ('pattani-faith-old-town-route', 'เส้นทางศรัทธาและเมืองเก่าปัตตานี', 'Pattani Faith & Old Town Route', 'มัสยิดกลาง ศาลเจ้า และเมืองเก่า', 'Mosque, shrine, and old town route.', 'routes/pattani-faith.jpg'),
    ('narathiwat-coastal-route', 'เส้นทางทะเลนราธิวาส', 'Narathiwat Coastal Route', 'หาดนราทัศน์ อ่าวมะนาว และตลาดชายแดน', 'Narathiwat beach, Ao Manao, and border market.', 'routes/narathiwat-coast.jpg'),
    ('songkhla-satun-heritage-sea-route', 'เส้นทางเมืองเก่าและทะเลสตูล', 'Songkhla-Satun Heritage & Sea Route', 'เมืองเก่าสงขลา หาดใหญ่ ปากบารา และตะรุเตา', 'Songkhla old town, Hat Yai, Pak Bara, and Tarutao.', 'routes/songkhla-satun.jpg')
)
INSERT INTO public.suggested_routes (slug, name_th, name_en, description_th, description_en, cover_image_path, is_published, is_active)
SELECT slug, name_th, name_en, description_th, description_en, cover_image_path, true, true
FROM route_seed
ON CONFLICT (name_en) DO UPDATE
SET slug = EXCLUDED.slug,
    name_th = EXCLUDED.name_th,
    description_th = EXCLUDED.description_th,
    description_en = EXCLUDED.description_en,
    cover_image_path = EXCLUDED.cover_image_path,
    is_published = EXCLUDED.is_published,
    is_active = EXCLUDED.is_active;

WITH route_stop_seed(route_en, slug, day_number, display_order, stop_note_th) AS (
  VALUES
    ('Betong Mist & Wellness Route', 'aiyerweng-skywalk', 1, 1, 'เริ่มเช้าด้วยทะเลหมอก'),
    ('Betong Mist & Wellness Route', 'betong-hot-spring', 1, 2, 'พักผ่อนช่วงบ่าย'),
    ('Pattani Faith & Old Town Route', 'pattani-central-mosque', 1, 1, 'ชมสถาปัตยกรรมศาสนสถาน'),
    ('Pattani Faith & Old Town Route', 'lim-ko-niao-shrine', 1, 2, 'เรียนรู้ศรัทธาท้องถิ่น'),
    ('Pattani Faith & Old Town Route', 'pattani-old-town', 1, 3, 'เดินเมืองเก่าและชิมอาหาร'),
    ('Narathiwat Coastal Route', 'narathat-beach', 1, 1, 'พักผ่อนริมทะเล'),
    ('Narathiwat Coastal Route', 'ao-manao-narathiwat', 1, 2, 'ชมชายฝั่งเงียบสงบ'),
    ('Narathiwat Coastal Route', 'sungai-kolok-border-market', 1, 3, 'สำรวจตลาดชายแดน'),
    ('Songkhla-Satun Heritage & Sea Route', 'songkhla-old-town', 1, 1, 'เดินเมืองเก่า'),
    ('Songkhla-Satun Heritage & Sea Route', 'hat-yai-municipal-park', 1, 2, 'ชมวิวเมืองหาดใหญ่'),
    ('Songkhla-Satun Heritage & Sea Route', 'pak-bara-pier', 2, 1, 'เริ่มเส้นทางทะเลสตูล'),
    ('Songkhla-Satun Heritage & Sea Route', 'tarutao-national-park', 2, 2, 'ต่อด้วยธรรมชาติทางทะเล')
)
INSERT INTO public.suggested_route_stops (route_id, attraction_id, day_number, display_order, stop_note_th)
SELECT r.route_id, a.attraction_id, s.day_number, s.display_order, s.stop_note_th
FROM route_stop_seed s
JOIN public.suggested_routes r ON r.name_en = s.route_en
JOIN public.attractions a ON a.slug = s.slug
ON CONFLICT (route_id, day_number, display_order) DO UPDATE
SET attraction_id = EXCLUDED.attraction_id,
    stop_note_th = EXCLUDED.stop_note_th;

INSERT INTO public.travel_stories (slug, title, excerpt, content, province_id, category, image_url, is_published, published_at)
VALUES
  ('mist-morning-aiyerweng', 'เช้าวันใหม่เหนือทะเลหมอกอัยเยอร์เวง', 'แรงบันดาลใจสำหรับการเดินทางเบตงและการเก็บ stamp แรก', 'เรื่องเล่าการเดินทางแบบสั้นสำหรับหน้า SEO และ discovery feed', (SELECT province_id FROM public.provinces WHERE province_name_en = 'Yala'), 'Nature', 'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?q=80&w=1200&auto=format&fit=crop', true, now()),
  ('faith-and-architecture-pattani', 'ศรัทธาและสถาปัตยกรรมในปัตตานี', 'เส้นทางศาสนสถานและเมืองเก่าในวันเดียว', 'เนื้อหา SEO สำหรับการเดินทางเชิงวัฒนธรรม', (SELECT province_id FROM public.provinces WHERE province_name_en = 'Pattani'), 'Culture', 'https://images.unsplash.com/photo-1587823527237-770498eb7909?q=80&w=1200&auto=format&fit=crop', true, now()),
  ('narathiwat-coastal-day', 'หนึ่งวันริมทะเลนราธิวาส', 'หาดนราทัศน์ อ่าวมะนาว และตลาดชายแดน', 'เรื่องเล่าสำหรับ route planning และ travel story', (SELECT province_id FROM public.provinces WHERE province_name_en = 'Narathiwat'), 'Coastal', 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?q=80&w=1200&auto=format&fit=crop', true, now()),
  ('songkhla-old-town-walk', 'เดินเมืองเก่าสงขลาแบบช้า ๆ', 'สถาปัตยกรรม อาหาร และศิลปะชุมชน', 'เรื่องเล่าสำหรับเมืองเก่าและเส้นทางเดิน', (SELECT province_id FROM public.provinces WHERE province_name_en = 'Songkhla'), 'Old Town', 'https://images.unsplash.com/photo-1518005020951-eccb494ad742?q=80&w=1200&auto=format&fit=crop', true, now()),
  ('satun-sea-gateway', 'ปากบารา ประตูสู่ทะเลสตูล', 'เตรียมตัวก่อนออกสู่เส้นทางเกาะและอุทยาน', 'เนื้อหาสำหรับทะเลสตูลและเส้นทางต่อเนื่อง', (SELECT province_id FROM public.provinces WHERE province_name_en = 'Satun'), 'Sea', 'https://images.unsplash.com/photo-1500375592092-40eb2168fd21?q=80&w=1200&auto=format&fit=crop', true, now()),
  ('southern-border-food', 'รสชาติชายแดนใต้ที่ควรลอง', 'อาหารท้องถิ่น คาเฟ่ และของฝากที่เชื่อมโยงการเดินทาง', 'เรื่องเล่าอาหารสำหรับ feed และ suggested route', (SELECT province_id FROM public.provinces WHERE province_name_en = 'Pattani'), 'Food', 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?q=80&w=1200&auto=format&fit=crop', true, now()),
  ('community-market-border', 'ตลาดชายแดนกับชีวิตประจำวัน', 'มองเมืองชายแดนผ่านการเดินตลาดและพูดคุยกับชุมชน', 'เรื่องเล่าชุมชนสำหรับ sustainable tourism', (SELECT province_id FROM public.provinces WHERE province_name_en = 'Narathiwat'), 'Community', 'https://images.unsplash.com/photo-1528909514045-2fa4ac7a08ba?q=80&w=1200&auto=format&fit=crop', true, now()),
  ('responsible-travel-south', 'เที่ยวชายแดนใต้อย่างรับผิดชอบ', 'ข้อคิดด้านความเป็นส่วนตัว ความเคารพพื้นที่ และการท่องเที่ยวยั่งยืน', 'เนื้อหาความเชื่อมั่นและ privacy-friendly tourism', (SELECT province_id FROM public.provinces WHERE province_name_en = 'Yala'), 'Responsible Travel', 'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?q=80&w=1200&auto=format&fit=crop', true, now())
ON CONFLICT (slug) DO UPDATE
SET title = EXCLUDED.title,
    excerpt = EXCLUDED.excerpt,
    content = EXCLUDED.content,
    province_id = EXCLUDED.province_id,
    category = EXCLUDED.category,
    image_url = EXCLUDED.image_url,
    is_published = EXCLUDED.is_published,
    published_at = EXCLUDED.published_at;

-- ==========================================
-- 4. SYNTHETIC TOURIST FLOW DATA
-- ==========================================

INSERT INTO public.tourists (tourist_id, display_name, origin_country_id, origin_province_id, age_group, preferred_language, profile_completed_at)
VALUES
  ('10000000-0000-4000-8000-000000000001', 'นักเดินทางเดโม 01', (SELECT country_id FROM public.countries WHERE iso2_code = 'TH'), (SELECT province_id FROM public.provinces WHERE province_name_en = 'Bangkok'), '18 - 25 ปี', 'th', now() - interval '30 days'),
  ('10000000-0000-4000-8000-000000000002', 'Southern Border Traveller 02', (SELECT country_id FROM public.countries WHERE iso2_code = 'MY'), null, '26 - 35 ปี', 'en', now() - interval '29 days'),
  ('10000000-0000-4000-8000-000000000003', 'นักเดินทางเดโม 03', (SELECT country_id FROM public.countries WHERE iso2_code = 'TH'), (SELECT province_id FROM public.provinces WHERE province_name_en = 'Songkhla'), '36 - 45 ปี', 'th', now() - interval '28 days'),
  ('10000000-0000-4000-8000-000000000004', 'Explorer Demo 04', (SELECT country_id FROM public.countries WHERE iso2_code = 'SG'), null, '26 - 35 ปี', 'en', now() - interval '27 days'),
  ('10000000-0000-4000-8000-000000000005', 'นักเดินทางเดโม 05', (SELECT country_id FROM public.countries WHERE iso2_code = 'TH'), (SELECT province_id FROM public.provinces WHERE province_name_en = 'Phuket'), '46 - 60 ปี', 'th', now() - interval '26 days'),
  ('10000000-0000-4000-8000-000000000006', 'Traveller Demo 06', (SELECT country_id FROM public.countries WHERE iso2_code = 'CN'), null, '18 - 25 ปี', 'en', now() - interval '25 days'),
  ('10000000-0000-4000-8000-000000000007', 'นักเดินทางเดโม 07', (SELECT country_id FROM public.countries WHERE iso2_code = 'TH'), (SELECT province_id FROM public.provinces WHERE province_name_en = 'Yala'), '26 - 35 ปี', 'th', now() - interval '24 days'),
  ('10000000-0000-4000-8000-000000000008', 'Traveller Demo 08', (SELECT country_id FROM public.countries WHERE iso2_code = 'JP'), null, '36 - 45 ปี', 'en', now() - interval '23 days'),
  ('10000000-0000-4000-8000-000000000009', 'นักเดินทางเดโม 09', (SELECT country_id FROM public.countries WHERE iso2_code = 'TH'), (SELECT province_id FROM public.provinces WHERE province_name_en = 'Pattani'), 'มากกว่า 60 ปี', 'th', now() - interval '22 days'),
  ('10000000-0000-4000-8000-000000000010', 'Demo Traveller 10', (SELECT country_id FROM public.countries WHERE iso2_code = 'US'), null, '26 - 35 ปี', 'en', now() - interval '21 days'),
  ('10000000-0000-4000-8000-000000000011', 'นักเดินทางเดโม 11', (SELECT country_id FROM public.countries WHERE iso2_code = 'TH'), (SELECT province_id FROM public.provinces WHERE province_name_en = 'Satun'), '18 - 25 ปี', 'th', now() - interval '20 days'),
  ('10000000-0000-4000-8000-000000000012', 'Demo Traveller 12', (SELECT country_id FROM public.countries WHERE iso2_code = 'GB'), null, '46 - 60 ปี', 'en', now() - interval '19 days')
ON CONFLICT (tourist_id) DO UPDATE
SET display_name = EXCLUDED.display_name,
    origin_country_id = EXCLUDED.origin_country_id,
    origin_province_id = EXCLUDED.origin_province_id,
    age_group = EXCLUDED.age_group,
    preferred_language = EXCLUDED.preferred_language,
    profile_completed_at = EXCLUDED.profile_completed_at;

INSERT INTO public.tourist_identities (identity_id, tourist_id, provider, provider_user_id, is_primary, linked_at, last_seen_at, metadata_json)
VALUES
  ('11000000-0000-4000-8000-000000000001', '10000000-0000-4000-8000-000000000001', 'anonymous_device', 'dev_guest_001', true, now() - interval '30 days', now() - interval '1 day', '{"seed":"demo"}'),
  ('11000000-0000-4000-8000-000000000002', '10000000-0000-4000-8000-000000000002', 'anonymous_device', 'dev_guest_002', true, now() - interval '29 days', now() - interval '2 days', '{"seed":"demo"}'),
  ('11000000-0000-4000-8000-000000000003', '10000000-0000-4000-8000-000000000003', 'anonymous_device', 'dev_guest_003', true, now() - interval '28 days', now() - interval '3 days', '{"seed":"demo"}'),
  ('11000000-0000-4000-8000-000000000004', '10000000-0000-4000-8000-000000000004', 'anonymous_device', 'dev_guest_004', true, now() - interval '27 days', now() - interval '4 days', '{"seed":"demo"}'),
  ('11000000-0000-4000-8000-000000000005', '10000000-0000-4000-8000-000000000005', 'anonymous_device', 'dev_guest_005', true, now() - interval '26 days', now() - interval '5 days', '{"seed":"demo"}'),
  ('11000000-0000-4000-8000-000000000006', '10000000-0000-4000-8000-000000000006', 'anonymous_device', 'dev_guest_006', true, now() - interval '25 days', now() - interval '6 days', '{"seed":"demo"}'),
  ('11000000-0000-4000-8000-000000000007', '10000000-0000-4000-8000-000000000007', 'anonymous_device', 'dev_guest_007', true, now() - interval '24 days', now() - interval '7 days', '{"seed":"demo"}'),
  ('11000000-0000-4000-8000-000000000008', '10000000-0000-4000-8000-000000000008', 'anonymous_device', 'dev_guest_008', true, now() - interval '23 days', now() - interval '8 days', '{"seed":"demo"}'),
  ('11000000-0000-4000-8000-000000000009', '10000000-0000-4000-8000-000000000009', 'anonymous_device', 'dev_guest_009', true, now() - interval '22 days', now() - interval '9 days', '{"seed":"demo"}'),
  ('11000000-0000-4000-8000-000000000010', '10000000-0000-4000-8000-000000000010', 'anonymous_device', 'dev_guest_010', true, now() - interval '21 days', now() - interval '10 days', '{"seed":"demo"}'),
  ('11000000-0000-4000-8000-000000000011', '10000000-0000-4000-8000-000000000011', 'anonymous_device', 'dev_guest_011', true, now() - interval '20 days', now() - interval '11 days', '{"seed":"demo"}'),
  ('11000000-0000-4000-8000-000000000012', '10000000-0000-4000-8000-000000000012', 'anonymous_device', 'dev_guest_012', true, now() - interval '19 days', now() - interval '12 days', '{"seed":"demo"}'),
  ('11000000-0000-4000-8000-000000000013', '10000000-0000-4000-8000-000000000003', 'line', 'line_demo_verified_003', false, now() - interval '10 days', now() - interval '3 days', '{"linked_for":"passport_recovery","seed":"demo"}'),
  ('11000000-0000-4000-8000-000000000014', '10000000-0000-4000-8000-000000000005', 'google', 'google_demo_subject_005', false, now() - interval '9 days', now() - interval '5 days', '{"linked_for":"passport_recovery","seed":"demo"}')
ON CONFLICT (provider, provider_user_id) DO UPDATE
SET tourist_id = EXCLUDED.tourist_id,
    is_primary = EXCLUDED.is_primary,
    linked_at = EXCLUDED.linked_at,
    last_seen_at = EXCLUDED.last_seen_at,
    metadata_json = EXCLUDED.metadata_json;

INSERT INTO public.consent_records (consent_id, tourist_id, consent_version, purpose, has_consented, consented_at, source, consent_type, purpose_key, language, metadata_json)
SELECT
  md5(tourist_id::text || ':certificate_visit_record')::uuid,
  tourist_id,
  'mvp-2026-05',
  'Collect minimal tourist participation data for certificate generation and aggregated tourism planning.',
  true,
  created_at + interval '1 minute',
  'qr_checkin',
  'data_collection',
  'certificate_visit_record',
  preferred_language,
  '{"seed":"demo"}'::jsonb
FROM public.tourists
WHERE tourist_id::text LIKE '10000000-0000-4000-8000-%'
ON CONFLICT (consent_id) DO UPDATE
SET has_consented = EXCLUDED.has_consented,
    consented_at = EXCLUDED.consented_at,
    source = EXCLUDED.source,
    consent_type = EXCLUDED.consent_type,
    purpose_key = EXCLUDED.purpose_key,
    language = EXCLUDED.language,
    metadata_json = EXCLUDED.metadata_json;

WITH visit_seed(visit_id, tourist_id, slug, code, visit_date, companion_en, transport_en, purpose_en, group_size, overnight_status, nights, completion_status, day_offset) AS (
  VALUES
    ('20000000-0000-4000-8000-000000000001', '10000000-0000-4000-8000-000000000001', 'aiyerweng-skywalk', 'DEMO-CODE-123', current_date - 30, 'Friends', 'Private Car', 'Photography/Content', 3, 'overnight', 1, 'survey_completed', 30),
    ('20000000-0000-4000-8000-000000000002', '10000000-0000-4000-8000-000000000002', 'pattani-central-mosque', 'QR-PATTANI-MOSQUE', current_date - 29, 'Family', 'Chartered Van', 'Religious/Merit making', 4, 'same_day', 0, 'certificate_generated', 29),
    ('20000000-0000-4000-8000-000000000003', '10000000-0000-4000-8000-000000000003', 'narathat-beach', 'QR-NARATHAT-BEACH', current_date - 28, 'Couple', 'Private Car', 'Leisure/Vacation', 2, 'overnight', 2, 'survey_completed', 28),
    ('20000000-0000-4000-8000-000000000004', '10000000-0000-4000-8000-000000000004', 'songkhla-old-town', 'QR-SONGKHLA-OLDTOWN', current_date - 27, 'Alone', 'Train', 'Food tasting', 1, 'same_day', 0, 'survey_completed', 27),
    ('20000000-0000-4000-8000-000000000005', '10000000-0000-4000-8000-000000000005', 'pak-bara-pier', 'QR-PAK-BARA', current_date - 26, 'Family', 'Private Car', 'Leisure/Vacation', 5, 'overnight', 2, 'certificate_generated', 26),
    ('20000000-0000-4000-8000-000000000006', '10000000-0000-4000-8000-000000000006', 'betong-hot-spring', 'QR-BETONG-HOTSPRING', current_date - 25, 'Friends', 'Rental Car', 'Leisure/Vacation', 3, 'overnight', 1, 'survey_completed', 25),
    ('20000000-0000-4000-8000-000000000007', '10000000-0000-4000-8000-000000000007', 'yala-city-pillar', 'QR-YALA-CITY-PILLAR', current_date - 24, 'Family', 'Motorcycle', 'Visiting friends/relatives', 2, 'same_day', 0, 'certificate_generated', 24),
    ('20000000-0000-4000-8000-000000000008', '10000000-0000-4000-8000-000000000008', 'lim-ko-niao-shrine', 'QR-LIM-KO-NIAO', current_date - 23, 'Alone', 'Public Bus', 'Religious/Merit making', 1, 'same_day', 0, 'survey_completed', 23),
    ('20000000-0000-4000-8000-000000000009', '10000000-0000-4000-8000-000000000009', 'sirindhorn-peat-swamp', 'QR-PEAT-SWAMP', current_date - 22, 'School/University group', 'Chartered Van', 'Study/Field trip', 18, 'same_day', 0, 'survey_completed', 22),
    ('20000000-0000-4000-8000-000000000010', '10000000-0000-4000-8000-000000000010', 'talo-kapo-beach', 'QR-TALO-KAPO', current_date - 21, 'Friends', 'Private Car', 'Leisure/Vacation', 4, 'same_day', 0, 'certificate_generated', 21),
    ('20000000-0000-4000-8000-000000000011', '10000000-0000-4000-8000-000000000011', 'hat-yai-municipal-park', 'QR-HATYAI-PARK', current_date - 20, 'Family', 'Private Car', 'Photography/Content', 3, 'same_day', 0, 'survey_completed', 20),
    ('20000000-0000-4000-8000-000000000012', '10000000-0000-4000-8000-000000000012', 'tarutao-national-park', 'QR-TARUTAO-PARK', current_date - 19, 'Tour Group', 'Boat', 'Leisure/Vacation', 10, 'overnight', 2, 'survey_completed', 19),
    ('20000000-0000-4000-8000-000000000013', '10000000-0000-4000-8000-000000000001', 'pattani-old-town', 'QR-PATTANI-OLDTOWN', current_date - 18, 'Friends', 'Private Car', 'Food tasting', 3, 'overnight', 1, 'survey_completed', 18),
    ('20000000-0000-4000-8000-000000000014', '10000000-0000-4000-8000-000000000002', 'aiyerweng-skywalk', 'QR-AIYERWENG-SKYWALK', current_date - 17, 'Family', 'Chartered Van', 'Photography/Content', 4, 'overnight', 1, 'certificate_generated', 17),
    ('20000000-0000-4000-8000-000000000015', '10000000-0000-4000-8000-000000000003', 'ao-manao-narathiwat', 'QR-AO-MANAO-NARA', current_date - 16, 'Couple', 'Private Car', 'Leisure/Vacation', 2, 'overnight', 1, 'survey_completed', 16),
    ('20000000-0000-4000-8000-000000000016', '10000000-0000-4000-8000-000000000004', 'sungai-kolok-border-market', 'QR-KOLOK-MARKET', current_date - 15, 'Alone', 'Train', 'Transit/Stopover', 1, 'same_day', 0, 'photo_uploaded', 15),
    ('20000000-0000-4000-8000-000000000017', '10000000-0000-4000-8000-000000000005', 'pattani-central-mosque', 'QR-PATTANI-MOSQUE-REFLECT', current_date - 14, 'Family', 'Private Car', 'Religious/Merit making', 5, 'same_day', 0, 'survey_completed', 14),
    ('20000000-0000-4000-8000-000000000018', '10000000-0000-4000-8000-000000000006', 'songkhla-old-town', 'QR-SONGKHLA-STREETART', current_date - 13, 'Friends', 'Rental Car', 'Photography/Content', 3, 'overnight', 1, 'certificate_generated', 13),
    ('20000000-0000-4000-8000-000000000019', '10000000-0000-4000-8000-000000000007', 'hala-bala-forest-yala', 'QR-HALA-BALA-YALA', current_date - 12, 'Colleagues', 'Chartered Van', 'Study/Field trip', 6, 'same_day', 0, 'survey_completed', 12),
    ('20000000-0000-4000-8000-000000000020', '10000000-0000-4000-8000-000000000008', 'narathat-beach', 'QR-NARATHAT-SUNSET', current_date - 11, 'Alone', 'Public Bus', 'Leisure/Vacation', 1, 'same_day', 0, 'certificate_generated', 11),
    ('20000000-0000-4000-8000-000000000021', '10000000-0000-4000-8000-000000000009', 'aiyerweng-skywalk', 'DEMO-CODE-123', current_date - 10, 'Family', 'Private Car', 'Leisure/Vacation', 4, 'overnight', 1, 'survey_completed', 10),
    ('20000000-0000-4000-8000-000000000022', '10000000-0000-4000-8000-000000000010', 'pattani-old-town', 'QR-PATTANI-CAFE', current_date - 9, 'Friends', 'Private Car', 'Food tasting', 2, 'same_day', 0, 'minimal_form_completed', 9),
    ('20000000-0000-4000-8000-000000000023', '10000000-0000-4000-8000-000000000011', 'pak-bara-pier', 'QR-PAK-BARA-BOAT', current_date - 8, 'Family', 'Boat', 'Leisure/Vacation', 5, 'overnight', 2, 'survey_completed', 8),
    ('20000000-0000-4000-8000-000000000024', '10000000-0000-4000-8000-000000000012', 'sirindhorn-peat-swamp', 'QR-PEAT-SWAMP', current_date - 7, 'Tour Group', 'Chartered Van', 'Study/Field trip', 12, 'same_day', 0, 'certificate_generated', 7),
    ('20000000-0000-4000-8000-000000000025', '10000000-0000-4000-8000-000000000001', 'aiyerweng-skywalk', 'DEMO-CODE-123', current_date - 6, 'Friends', 'Private Car', 'Photography/Content', 3, 'overnight', 1, 'certificate_generated', 6)
)
INSERT INTO public.visits (
  visit_id, tourist_id, attraction_id, photo_spot_id, checkin_code_id, visit_date,
  visited_at, travel_companion_id, transport_mode_id, travel_purpose_id,
  group_size, overnight_status, nights, completion_status
)
SELECT
  v.visit_id::uuid,
  v.tourist_id::uuid,
  a.attraction_id,
  cc.photo_spot_id,
  cc.checkin_code_id,
  v.visit_date,
  (now() - (v.day_offset || ' days')::interval),
  tc.travel_companion_id,
  tm.transport_mode_id,
  tp.travel_purpose_id,
  v.group_size,
  v.overnight_status,
  v.nights,
  v.completion_status
FROM visit_seed v
JOIN public.attractions a ON a.slug = v.slug
LEFT JOIN public.checkin_codes cc ON cc.code = v.code
LEFT JOIN public.travel_companions tc ON tc.name_en = v.companion_en
LEFT JOIN public.transport_modes tm ON tm.name_en = v.transport_en
LEFT JOIN public.travel_purposes tp ON tp.name_en = v.purpose_en
ON CONFLICT (visit_id) DO UPDATE
SET tourist_id = EXCLUDED.tourist_id,
    attraction_id = EXCLUDED.attraction_id,
    photo_spot_id = EXCLUDED.photo_spot_id,
    checkin_code_id = EXCLUDED.checkin_code_id,
    visit_date = EXCLUDED.visit_date,
    visited_at = EXCLUDED.visited_at,
    travel_companion_id = EXCLUDED.travel_companion_id,
    transport_mode_id = EXCLUDED.transport_mode_id,
    travel_purpose_id = EXCLUDED.travel_purpose_id,
    group_size = EXCLUDED.group_size,
    overnight_status = EXCLUDED.overnight_status,
    nights = EXCLUDED.nights,
    completion_status = EXCLUDED.completion_status;

INSERT INTO public.visit_photos (photo_id, visit_id, storage_path, thumbnail_path, original_filename, mime_type, file_size_bytes, width, height, approval_status, uploaded_at)
SELECT
  md5(v.visit_id::text || ':photo')::uuid,
  v.visit_id,
  'visit-photos/demo/' || v.visit_id || '/photo.webp',
  'visit-photos/demo/' || v.visit_id || '/thumb.webp',
  'demo-upload.webp',
  'image/webp',
  245760,
  1200,
  1600,
  'approved',
  COALESCE(v.visited_at, now()) + interval '4 minutes'
FROM public.visits v
WHERE v.completion_status IN ('photo_uploaded', 'certificate_generated', 'survey_completed')
ON CONFLICT (photo_id) DO UPDATE
SET storage_path = EXCLUDED.storage_path,
    thumbnail_path = EXCLUDED.thumbnail_path,
    mime_type = EXCLUDED.mime_type,
    file_size_bytes = EXCLUDED.file_size_bytes,
    approval_status = EXCLUDED.approval_status,
    uploaded_at = EXCLUDED.uploaded_at;

INSERT INTO public.certificates (certificate_id, visit_id, template_id, photo_id, certificate_path, share_url, generated_at, download_count)
SELECT
  md5(v.visit_id::text || ':certificate')::uuid,
  v.visit_id,
  ct.template_id,
  vp.photo_id,
  'certificate-files/demo/' || v.visit_id || '/certificate.png',
  null,
  COALESCE(v.visited_at, now()) + interval '8 minutes',
  CASE WHEN v.completion_status = 'survey_completed' THEN 2 ELSE 1 END
FROM public.visits v
JOIN public.certificate_templates ct ON ct.template_name = 'Southern Border Memory Card TH' AND ct.language = 'th'
LEFT JOIN public.visit_photos vp ON vp.visit_id = v.visit_id
WHERE v.completion_status IN ('certificate_generated', 'survey_completed')
ON CONFLICT (visit_id) DO UPDATE
SET template_id = EXCLUDED.template_id,
    photo_id = EXCLUDED.photo_id,
    certificate_path = EXCLUDED.certificate_path,
    generated_at = EXCLUDED.generated_at,
    download_count = EXCLUDED.download_count;

INSERT INTO public.tourist_stamps (stamp_id, tourist_id, attraction_id, visit_id, stamp_definition_id, earned_at, status)
SELECT DISTINCT ON (v.tourist_id, v.attraction_id)
  md5(v.tourist_id::text || ':' || v.attraction_id::text || ':stamp')::uuid,
  v.tourist_id,
  v.attraction_id,
  v.visit_id,
  sd.stamp_definition_id,
  COALESCE(v.visited_at, now()) + interval '9 minutes',
  'earned'
FROM public.visits v
JOIN public.certificates c ON c.visit_id = v.visit_id
JOIN public.stamp_definitions sd ON sd.attraction_id = v.attraction_id
ORDER BY v.tourist_id, v.attraction_id, v.visited_at
ON CONFLICT (tourist_id, attraction_id) DO UPDATE
SET visit_id = EXCLUDED.visit_id,
    stamp_definition_id = EXCLUDED.stamp_definition_id,
    earned_at = LEAST(public.tourist_stamps.earned_at, EXCLUDED.earned_at),
    status = EXCLUDED.status;

WITH survey_seed(visit_id, overall, facility, cleanliness, safety, accessibility, information, value_score, revisit, recommend, comment_text) AS (
  VALUES
    ('20000000-0000-4000-8000-000000000001', 5, 5, 4, 5, 4, 4, 5, 'yes', 'yes', 'วิวสวยและเหมาะกับการถ่ายภาพมาก'),
    ('20000000-0000-4000-8000-000000000003', 4, 4, 4, 4, 3, 4, 4, 'yes', 'yes', null),
    ('20000000-0000-4000-8000-000000000004', 5, 4, 5, 5, 4, 5, 5, 'yes', 'yes', 'เมืองเก่าเดินง่ายและมีอาหารให้ลอง'),
    ('20000000-0000-4000-8000-000000000006', 4, 4, 4, 4, 4, 4, 4, 'maybe', 'yes', null),
    ('20000000-0000-4000-8000-000000000008', 5, 4, 5, 5, 4, 4, 5, 'yes', 'yes', null),
    ('20000000-0000-4000-8000-000000000009', 3, 3, 4, 4, 2, 3, 3, 'maybe', 'maybe', 'ควรเพิ่มป้ายข้อมูลและทางเดินให้ชัดเจน'),
    ('20000000-0000-4000-8000-000000000011', 4, 4, 4, 4, 4, 4, 4, 'yes', 'yes', null),
    ('20000000-0000-4000-8000-000000000012', 5, 4, 5, 5, 4, 4, 4, 'yes', 'yes', null),
    ('20000000-0000-4000-8000-000000000013', 5, 5, 4, 5, 5, 5, 5, 'yes', 'yes', 'อาหารและบรรยากาศดี'),
    ('20000000-0000-4000-8000-000000000015', 4, 4, 4, 4, 3, 4, 4, 'yes', 'yes', null),
    ('20000000-0000-4000-8000-000000000017', 4, 4, 5, 5, 4, 4, 4, 'yes', 'yes', null),
    ('20000000-0000-4000-8000-000000000019', 3, 3, 3, 4, 2, 3, 3, 'maybe', 'maybe', 'ข้อมูลเส้นทางธรรมชาติยังน้อย'),
    ('20000000-0000-4000-8000-000000000021', 5, 5, 4, 5, 4, 4, 5, 'yes', 'yes', 'อยากกลับมาอีกครั้ง'),
    ('20000000-0000-4000-8000-000000000023', 4, 4, 4, 4, 4, 4, 4, 'yes', 'yes', null)
)
INSERT INTO public.satisfaction_surveys (
  survey_id, visit_id, tourist_id, attraction_id, overall_score, facility_score,
  cleanliness_score, safety_score, accessibility_score, information_score, value_score,
  revisit_intention, recommend_intention, comments, submitted_at, completed_at
)
SELECT
  md5(s.visit_id || ':survey')::uuid,
  v.visit_id,
  v.tourist_id,
  v.attraction_id,
  s.overall,
  s.facility,
  s.cleanliness,
  s.safety,
  s.accessibility,
  s.information,
  s.value_score,
  s.revisit,
  s.recommend,
  s.comment_text,
  COALESCE(v.visited_at, now()) + interval '12 minutes',
  COALESCE(v.visited_at, now()) + interval '12 minutes'
FROM survey_seed s
JOIN public.visits v ON v.visit_id = s.visit_id::uuid
ON CONFLICT (visit_id) DO UPDATE
SET tourist_id = EXCLUDED.tourist_id,
    attraction_id = EXCLUDED.attraction_id,
    overall_score = EXCLUDED.overall_score,
    facility_score = EXCLUDED.facility_score,
    cleanliness_score = EXCLUDED.cleanliness_score,
    safety_score = EXCLUDED.safety_score,
    accessibility_score = EXCLUDED.accessibility_score,
    information_score = EXCLUDED.information_score,
    value_score = EXCLUDED.value_score,
    revisit_intention = EXCLUDED.revisit_intention,
    recommend_intention = EXCLUDED.recommend_intention,
    comments = EXCLUDED.comments,
    submitted_at = EXCLUDED.submitted_at,
    completed_at = EXCLUDED.completed_at;

WITH expense_seed(expense_id, visit_id, category_en, range_en, estimated_amount) AS (
  VALUES
    ('60000000-0000-4000-8000-000000000001', '20000000-0000-4000-8000-000000000001', 'Food & Beverage', '1,001 - 3,000 THB', 1300),
    ('60000000-0000-4000-8000-000000000002', '20000000-0000-4000-8000-000000000001', 'Transportation', '1,001 - 3,000 THB', 900),
    ('60000000-0000-4000-8000-000000000003', '20000000-0000-4000-8000-000000000003', 'Accommodation', '3,001 - 5,000 THB', 2400),
    ('60000000-0000-4000-8000-000000000004', '20000000-0000-4000-8000-000000000003', 'Food & Beverage', '1,001 - 3,000 THB', 1500),
    ('60000000-0000-4000-8000-000000000005', '20000000-0000-4000-8000-000000000004', 'Food & Beverage', '500 - 1,000 THB', 650),
    ('60000000-0000-4000-8000-000000000006', '20000000-0000-4000-8000-000000000006', 'Activities/Entrance fees', '500 - 1,000 THB', 500),
    ('60000000-0000-4000-8000-000000000007', '20000000-0000-4000-8000-000000000008', 'Souvenirs', '500 - 1,000 THB', 700),
    ('60000000-0000-4000-8000-000000000008', '20000000-0000-4000-8000-000000000009', 'Transportation', '3,001 - 5,000 THB', 4200),
    ('60000000-0000-4000-8000-000000000009', '20000000-0000-4000-8000-000000000011', 'Cafe/Special drinks', '500 - 1,000 THB', 550),
    ('60000000-0000-4000-8000-000000000010', '20000000-0000-4000-8000-000000000012', 'Accommodation', '5,001 - 10,000 THB', 6200),
    ('60000000-0000-4000-8000-000000000011', '20000000-0000-4000-8000-000000000012', 'Transportation', '3,001 - 5,000 THB', 3500),
    ('60000000-0000-4000-8000-000000000012', '20000000-0000-4000-8000-000000000013', 'Food & Beverage', '1,001 - 3,000 THB', 1400),
    ('60000000-0000-4000-8000-000000000013', '20000000-0000-4000-8000-000000000015', 'Food & Beverage', '500 - 1,000 THB', 700),
    ('60000000-0000-4000-8000-000000000014', '20000000-0000-4000-8000-000000000017', 'Transportation', '1,001 - 3,000 THB', 1700),
    ('60000000-0000-4000-8000-000000000015', '20000000-0000-4000-8000-000000000019', 'Activities/Entrance fees', 'Less than 500 THB', 300),
    ('60000000-0000-4000-8000-000000000016', '20000000-0000-4000-8000-000000000021', 'Accommodation', '3,001 - 5,000 THB', 2800),
    ('60000000-0000-4000-8000-000000000017', '20000000-0000-4000-8000-000000000021', 'Food & Beverage', '1,001 - 3,000 THB', 1300),
    ('60000000-0000-4000-8000-000000000018', '20000000-0000-4000-8000-000000000023', 'Transportation', '3,001 - 5,000 THB', 3300),
    ('60000000-0000-4000-8000-000000000019', '20000000-0000-4000-8000-000000000023', 'Souvenirs', '1,001 - 3,000 THB', 1800),
    ('60000000-0000-4000-8000-000000000020', '20000000-0000-4000-8000-000000000024', 'Transportation', '1,001 - 3,000 THB', 2100)
)
INSERT INTO public.visit_expenses (expense_id, visit_id, expense_category_id, spending_range_id, estimated_amount)
SELECT
  e.expense_id::uuid,
  e.visit_id::uuid,
  ec.expense_category_id,
  sr.spending_range_id,
  e.estimated_amount
FROM expense_seed e
JOIN public.expense_categories ec ON ec.name_en = e.category_en
JOIN public.spending_ranges sr ON sr.range_label_en = e.range_en
ON CONFLICT (expense_id) DO UPDATE
SET expense_category_id = EXCLUDED.expense_category_id,
    spending_range_id = EXCLUDED.spending_range_id,
    estimated_amount = EXCLUDED.estimated_amount;

-- QR scans and landing views that may or may not become visits.
INSERT INTO public.funnel_events (event_id, visit_id, tourist_id, checkin_code_id, event_type, event_time, metadata)
SELECT
  md5(cc.code || ':qr_scanned:seed')::uuid,
  null,
  null,
  cc.checkin_code_id,
  'qr_scanned',
  now() - interval '35 days' + (row_number() OVER (ORDER BY cc.code) || ' hours')::interval,
  jsonb_build_object('seed', 'demo', 'note', 'qr scan is not a visit')
FROM public.checkin_codes cc
WHERE cc.code LIKE 'QR-%' OR cc.code = 'DEMO-CODE-123'
ON CONFLICT (event_id) DO UPDATE
SET checkin_code_id = EXCLUDED.checkin_code_id,
    event_type = EXCLUDED.event_type,
    event_time = EXCLUDED.event_time,
    metadata = EXCLUDED.metadata;

INSERT INTO public.funnel_events (event_id, visit_id, tourist_id, checkin_code_id, event_type, event_time, metadata)
SELECT
  md5(cc.code || ':landing_viewed:seed')::uuid,
  null,
  null,
  cc.checkin_code_id,
  'landing_viewed',
  now() - interval '35 days' + (row_number() OVER (ORDER BY cc.code) || ' hours')::interval + interval '2 minutes',
  jsonb_build_object('seed', 'demo', 'note', 'landing view is not a visit')
FROM public.checkin_codes cc
WHERE cc.code LIKE 'QR-%' OR cc.code = 'DEMO-CODE-123'
ON CONFLICT (event_id) DO UPDATE
SET checkin_code_id = EXCLUDED.checkin_code_id,
    event_type = EXCLUDED.event_type,
    event_time = EXCLUDED.event_time,
    metadata = EXCLUDED.metadata;

WITH visit_events(event_type, minute_offset) AS (
  VALUES
    ('minimal_form_completed', 3),
    ('photo_uploaded', 5),
    ('certificate_generated', 8),
    ('passport_viewed', 10)
)
INSERT INTO public.funnel_events (event_id, visit_id, tourist_id, checkin_code_id, event_type, event_time, metadata)
SELECT
  md5(v.visit_id::text || ':' || ve.event_type)::uuid,
  v.visit_id,
  v.tourist_id,
  v.checkin_code_id,
  ve.event_type,
  COALESCE(v.visited_at, now()) + (ve.minute_offset || ' minutes')::interval,
  jsonb_build_object('seed', 'demo')
FROM public.visits v
JOIN visit_events ve ON true
WHERE
  (ve.event_type = 'minimal_form_completed' AND v.completion_status IN ('minimal_form_completed', 'photo_uploaded', 'certificate_generated', 'survey_completed'))
  OR (ve.event_type = 'photo_uploaded' AND v.completion_status IN ('photo_uploaded', 'certificate_generated', 'survey_completed'))
  OR (ve.event_type = 'certificate_generated' AND v.completion_status IN ('certificate_generated', 'survey_completed'))
  OR (ve.event_type = 'passport_viewed' AND v.completion_status IN ('certificate_generated', 'survey_completed'))
ON CONFLICT (event_id) DO UPDATE
SET visit_id = EXCLUDED.visit_id,
    tourist_id = EXCLUDED.tourist_id,
    checkin_code_id = EXCLUDED.checkin_code_id,
    event_type = EXCLUDED.event_type,
    event_time = EXCLUDED.event_time,
    metadata = EXCLUDED.metadata;

INSERT INTO public.funnel_events (event_id, visit_id, tourist_id, checkin_code_id, event_type, event_time, metadata)
SELECT
  md5(s.visit_id::text || ':survey_completed')::uuid,
  s.visit_id,
  s.tourist_id,
  v.checkin_code_id,
  'survey_completed',
  COALESCE(s.completed_at, s.submitted_at),
  jsonb_build_object('seed', 'demo', 'optional', true)
FROM public.satisfaction_surveys s
JOIN public.visits v ON v.visit_id = s.visit_id
ON CONFLICT (event_id) DO UPDATE
SET visit_id = EXCLUDED.visit_id,
    tourist_id = EXCLUDED.tourist_id,
    checkin_code_id = EXCLUDED.checkin_code_id,
    event_type = EXCLUDED.event_type,
    event_time = EXCLUDED.event_time,
    metadata = EXCLUDED.metadata;

-- ==========================================
-- 5. EXPORT, AUDIT, AND OFFICIAL DATA FIXTURES
-- ==========================================

INSERT INTO public.export_jobs (job_id, admin_id, export_type, parameters, status, file_path, started_at, completed_at)
VALUES
  ('90000000-0000-4000-8000-000000000001', '01000000-0000-4000-8000-000000000001', 'dashboard_summary', '{"date_from":"2026-05-01","date_to":"2026-05-31","privacy":"aggregated"}'::jsonb, 'completed', 'export-files/demo/dashboard-summary.csv', now() - interval '2 days', now() - interval '2 days' + interval '1 minute'),
  ('90000000-0000-4000-8000-000000000002', '01000000-0000-4000-8000-000000000001', 'visit_records_privacy_safe', '{"date_from":"2026-05-01","date_to":"2026-05-31","private_identifiers":false}'::jsonb, 'completed', 'export-files/demo/visit-records-safe.csv', now() - interval '1 day', now() - interval '1 day' + interval '1 minute')
ON CONFLICT (job_id) DO UPDATE
SET export_type = EXCLUDED.export_type,
    parameters = EXCLUDED.parameters,
    status = EXCLUDED.status,
    file_path = EXCLUDED.file_path,
    started_at = EXCLUDED.started_at,
    completed_at = EXCLUDED.completed_at;

INSERT INTO public.audit_logs (log_id, admin_id, action, entity_type, entity_id, old_data, new_data, ip_address, created_at)
VALUES
  ('91000000-0000-4000-8000-000000000001', '01000000-0000-4000-8000-000000000001', 'seed.attraction.create', 'attraction', 'seed', null, '{"seed":"demo","safe":true}'::jsonb, null, now() - interval '3 days'),
  ('91000000-0000-4000-8000-000000000002', '01000000-0000-4000-8000-000000000001', 'export.create', 'export_job', '90000000-0000-4000-8000-000000000001', null, '{"seed":"demo","private_identifiers":false}'::jsonb, null, now() - interval '2 days')
ON CONFLICT (log_id) DO UPDATE
SET action = EXCLUDED.action,
    entity_type = EXCLUDED.entity_type,
    entity_id = EXCLUDED.entity_id,
    new_data = EXCLUDED.new_data,
    created_at = EXCLUDED.created_at;

INSERT INTO public.data_import_logs (import_log_id, source_name, source_file_name, import_type, status, records_processed, records_inserted, records_failed, imported_by, imported_at, metadata_json)
VALUES
  ('92000000-0000-4000-8000-000000000001', 'Demo official tourism dataset', 'demo-official-tourism-stats.csv', 'tourism_stats', 'success', 15, 15, 0, null, now() - interval '5 days', '{"seed":"demo","note":"Official stats are not platform visits"}'::jsonb)
ON CONFLICT (import_log_id) DO UPDATE
SET source_name = EXCLUDED.source_name,
    source_file_name = EXCLUDED.source_file_name,
    import_type = EXCLUDED.import_type,
    status = EXCLUDED.status,
    records_processed = EXCLUDED.records_processed,
    records_inserted = EXCLUDED.records_inserted,
    records_failed = EXCLUDED.records_failed,
    imported_at = EXCLUDED.imported_at,
    metadata_json = EXCLUDED.metadata_json;

WITH official_seed(province_en, year_value, month_value, tourist_type, visitor_count, revenue_amount) AS (
  VALUES
    ('Yala', 2026, 1, 'thai', 42000, 58000000),
    ('Yala', 2026, 1, 'foreign', 6200, 14800000),
    ('Yala', 2026, 2, 'total', 50100, 74200000),
    ('Pattani', 2026, 1, 'thai', 53000, 69000000),
    ('Pattani', 2026, 1, 'foreign', 5100, 12100000),
    ('Pattani', 2026, 2, 'total', 61200, 81500000),
    ('Narathiwat', 2026, 1, 'thai', 38500, 44000000),
    ('Narathiwat', 2026, 1, 'foreign', 7300, 16600000),
    ('Narathiwat', 2026, 2, 'total', 48800, 60100000),
    ('Songkhla', 2026, 1, 'total', 310000, 580000000),
    ('Songkhla', 2026, 2, 'total', 325000, 605000000),
    ('Satun', 2026, 1, 'total', 145000, 250000000),
    ('Satun', 2026, 2, 'total', 152000, 268000000),
    ('Yala', 2025, 12, 'total', 69000, 101000000),
    ('Pattani', 2025, 12, 'total', 72000, 108000000)
)
INSERT INTO public.official_tourism_stats (
  official_stat_id, province_id, year, month, tourist_type, visitor_count,
  revenue_amount, currency_code, source_name, source_file_name, import_log_id, imported_at
)
SELECT
  md5(o.province_en || ':' || o.year_value || ':' || o.month_value || ':' || o.tourist_type)::uuid,
  p.province_id,
  o.year_value,
  o.month_value,
  o.tourist_type,
  o.visitor_count,
  o.revenue_amount,
  'THB',
  'Demo official tourism dataset',
  'demo-official-tourism-stats.csv',
  '92000000-0000-4000-8000-000000000001',
  now() - interval '5 days'
FROM official_seed o
JOIN public.provinces p ON p.province_name_en = o.province_en
ON CONFLICT (official_stat_id) DO UPDATE
SET province_id = EXCLUDED.province_id,
    year = EXCLUDED.year,
    month = EXCLUDED.month,
    tourist_type = EXCLUDED.tourist_type,
    visitor_count = EXCLUDED.visitor_count,
    revenue_amount = EXCLUDED.revenue_amount,
    currency_code = EXCLUDED.currency_code,
    source_name = EXCLUDED.source_name,
    source_file_name = EXCLUDED.source_file_name,
    import_log_id = EXCLUDED.import_log_id,
    imported_at = EXCLUDED.imported_at;

INSERT INTO public.official_attraction_refs (official_ref_id, attraction_id, source_name, external_id, external_url, official_name_th, official_name_en, official_province_name, official_district_name, raw_data_json, linked_at)
SELECT
  md5(a.slug || ':official_ref')::uuid,
  a.attraction_id,
  'Demo official attraction reference',
  'DEMO-' || upper(replace(a.slug, '-', '_')),
  null,
  a.name_th,
  a.name_en,
  p.province_name_en,
  d.district_name_en,
  jsonb_build_object('seed', 'demo', 'safe_public_reference', true),
  now() - interval '4 days'
FROM public.attractions a
JOIN public.provinces p ON p.province_id = a.province_id
LEFT JOIN public.districts d ON d.district_id = a.district_id
WHERE a.slug IN ('aiyerweng-skywalk', 'pattani-central-mosque', 'narathat-beach', 'songkhla-old-town', 'pak-bara-pier')
ON CONFLICT (official_ref_id) DO UPDATE
SET attraction_id = EXCLUDED.attraction_id,
    source_name = EXCLUDED.source_name,
    external_id = EXCLUDED.external_id,
    official_name_th = EXCLUDED.official_name_th,
    official_name_en = EXCLUDED.official_name_en,
    official_province_name = EXCLUDED.official_province_name,
    official_district_name = EXCLUDED.official_district_name,
    raw_data_json = EXCLUDED.raw_data_json,
    linked_at = EXCLUDED.linked_at;
-- ==========================================
-- 21. ACCOMMODATIONS & RELATIONS
-- ==========================================

WITH acc_seed(province_en, slug, name_th, name_en, type_en, price, lat, lng, img) AS (
  VALUES
    ('Yala', 'betong-grand-view', '?????????????', 'Betong Grand View', 'Hotel', '1,000 - 2,000 THB', 5.7700000, 101.0700000, 'https://images.unsplash.com/photo-1566073771259-6a8506099945?q=80&w=1200&auto=format&fit=crop'),
    ('Yala', 'aiyerweng-resort', '??????????? ???????', 'Aiyerweng Resort', 'Resort', '1,500 - 3,000 THB', 5.9700000, 101.1200000, 'https://images.unsplash.com/photo-1499793983690-e29da59ef1c2?q=80&w=1200&auto=format&fit=crop'),
    ('Pattani', 'cs-pattani-hotel', '?????? ??.???. ???????', 'CS Pattani Hotel', 'Hotel', '1,000 - 2,500 THB', 6.8650000, 101.2500000, 'https://images.unsplash.com/photo-1551882547-ff40eb0d8d73?q=80&w=1200&auto=format&fit=crop'),
    ('Narathiwat', 'imperial-narathiwat', '???????????????? ????????', 'Imperial Narathiwat Hotel', 'Hotel', '1,200 - 2,500 THB', 6.4200000, 101.8200000, 'https://images.unsplash.com/photo-1542314831-c6a4d27ce66f?q=80&w=1200&auto=format&fit=crop')
)
INSERT INTO public.accommodations (
  province_id, slug, name_th, name_en, accommodation_type,
  latitude, longitude, cover_image_url, price_range, is_published, is_active
)
SELECT
  p.province_id,
  s.slug,
  s.name_th,
  s.name_en,
  s.type_en,
  s.lat,
  s.lng,
  s.img,
  s.price,
  true,
  true
FROM acc_seed s
JOIN public.provinces p ON p.province_name_en = s.province_en
ON CONFLICT (slug) DO UPDATE
SET province_id = EXCLUDED.province_id,
    name_th = EXCLUDED.name_th,
    name_en = EXCLUDED.name_en,
    accommodation_type = EXCLUDED.accommodation_type,
    latitude = EXCLUDED.latitude,
    longitude = EXCLUDED.longitude,
    cover_image_url = EXCLUDED.cover_image_url,
    price_range = EXCLUDED.price_range,
    is_published = EXCLUDED.is_published,
    is_active = EXCLUDED.is_active;
