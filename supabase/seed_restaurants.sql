-- ==========================================
-- RESTAURANTS (FOOD & SOUVENIRS) SEED DATA
-- ==========================================

WITH attraction_seed(province_en, district_en, type_en, slug, name_th, name_en, short_description_th, short_description_en, latitude, longitude, opening_hours, sustainability_category, capacity) AS (
  VALUES
    -- YALA (ยะลา)
    ('Yala', 'Mueang Yala', 'Food & Souvenirs', 'tara-restaurant-yala', 'ร้านอาหารธารา', 'Tara Restaurant', 'ร้านอาหารท้องถิ่นขึ้นชื่อเมืองยะลา', 'Famous local restaurant in Yala.', 6.5450000, 101.2850000, '10:00-22:00', 'local_food', 200),
    ('Yala', 'Mueang Yala', 'Food & Souvenirs', 'yala-halal-kitchen', 'ยะลา ฮาลาล คิทเช่น', 'Yala Halal Kitchen', 'ร้านอาหารฮาลาลยอดนิยมในตัวเมืองยะลา', 'Popular Halal restaurant in Yala city.', 6.5415000, 101.2825000, '11:00-21:00', 'local_food', 150),
    ('Yala', 'Mueang Yala', 'Food & Souvenirs', 'yala-beef-soup', 'ซุปเนื้อยะลา สาขาดั้งเดิม', 'Original Yala Beef Soup', 'ซุปเนื้อรสเด็ดสูตรต้นตำรับยะลา', 'Original recipe beef soup of Yala.', 6.5502000, 101.2801000, '08:00-16:00', 'local_food', 100),
    ('Yala', 'Betong', 'Food & Souvenirs', 'betong-chicken-rice', 'ข้าวมันไก่เบตง ต้นตำรับ', 'Betong Chicken Rice', 'ข้าวมันไก่เบตงของแท้ เนื้อแน่นนุ่ม', 'Authentic Betong chicken rice.', 5.7725000, 101.0712000, '06:00-14:00', 'local_food', 120),
    ('Yala', 'Betong', 'Food & Souvenirs', 'betong-dimsum', 'ติ่มซำเบตง', 'Betong Dimsum', 'ติ่มซำยามเช้าขึ้นชื่อของอำเภอเบตง', 'Famous morning dimsum in Betong.', 5.7745000, 101.0735000, '06:00-11:00', 'local_food', 150),
    ('Yala', 'Mueang Yala', 'Food & Souvenirs', 'yala-roti-tea', 'โรตีชาชักเมืองยะลา', 'Yala Roti & Teh Tarik', 'โรตีกรอบและชาชักหอมหวาน', 'Crispy roti and sweet pulled tea.', 6.5480000, 101.2880000, '16:00-23:00', 'local_food', 80),
    ('Yala', 'Raman', 'Food & Souvenirs', 'raman-local-market', 'ตลาดอาหารท้องถิ่นรามัน', 'Raman Local Food Market', 'แหล่งรวมอาหารพื้นบ้านและขนมหวาน', 'Hub for traditional food and sweets.', 6.4800000, 101.4300000, '07:00-12:00', 'local_economy', 300),

    -- PATTANI (ปัตตานี)
    ('Pattani', 'Mueang Pattani', 'Food & Souvenirs', 'roti-de-forest-pattani', 'โรตี เดอ ฟอเรส', 'Roti de Forest', 'ร้านคาเฟ่และโรตีฟิวชั่นชื่อดัง', 'Popular cafe and fusion roti restaurant.', 6.8750000, 101.2550000, '09:00-21:00', 'local_food', 150),
    ('Pattani', 'Mueang Pattani', 'Food & Souvenirs', 'london-restaurant-pattani', 'ร้านอาหารลอนดอน', 'London Restaurant', 'ร้านอาหารเก่าแก่และคลาสสิกของปัตตานี', 'Classic and historical restaurant in Pattani.', 6.8685000, 101.2520000, '10:00-21:00', 'local_food', 250),
    ('Pattani', 'Mueang Pattani', 'Food & Souvenirs', 'pattani-river-seafood', 'ซีฟู้ดริมแม่น้ำปัตตานี', 'Pattani Riverside Seafood', 'อาหารทะเลสดๆ ริมแม่น้ำปัตตานี', 'Fresh seafood by the Pattani river.', 6.8800000, 101.2505000, '16:00-22:00', 'local_food', 200),
    ('Pattani', 'Nong Chik', 'Food & Souvenirs', 'nong-chik-golek-chicken', 'ไก่ย่างกอและหนองจิก', 'Nong Chik Golek Chicken', 'ไก่ย่างราดน้ำแกงกอและรสเด็ด', 'Grilled chicken with rich Golek sauce.', 6.8400000, 101.1800000, '09:00-17:00', 'local_food', 100),
    ('Pattani', 'Mueang Pattani', 'Food & Souvenirs', 'khao-yam-nam-budu', 'ข้าวยำน้ำบูดูปัตตานี', 'Pattani Budu Rice Salad', 'ข้าวยำสมุนไพรน้ำบูดูสูตรดั้งเดิม', 'Traditional herbal rice salad with Budu sauce.', 6.8720000, 101.2580000, '06:00-13:00', 'local_food', 80),
    ('Pattani', 'Mueang Pattani', 'Food & Souvenirs', 'pattani-old-town-cafe', 'คาเฟ่เมืองเก่าปัตตานี', 'Pattani Old Town Cafe', 'คาเฟ่สไตล์คลาสสิกในย่านเมืองเก่า', 'Classic cafe in the heritage old town.', 6.8695000, 101.2515000, '08:00-18:00', 'local_food', 60),
    ('Pattani', 'Yaring', 'Food & Souvenirs', 'yaring-seafood', 'อาหารทะเลสดยะหริ่ง', 'Yaring Fresh Seafood', 'ร้านอาหารทะเลสดใหม่จากชาวประมง', 'Fresh seafood directly from fishermen.', 6.8820000, 101.4250000, '10:00-20:00', 'local_economy', 150),

    -- NARATHIWAT (นราธิวาส)
    ('Narathiwat', 'Mueang Narathiwat', 'Food & Souvenirs', 'mangkon-thong-narathiwat', 'ร้านอาหารมังกรทอง', 'Golden Dragon Restaurant', 'ร้านอาหารซีฟู้ดและอาหารท้องถิ่น', 'Seafood and local cuisine restaurant.', 6.4300000, 101.8300000, '10:00-22:00', 'local_food', 250),
    ('Narathiwat', 'Su-ngai Padi', 'Food & Souvenirs', 'sungai-padi-budu', 'บูดูสุไหงปาดี', 'Su-ngai Padi Budu Shop', 'ร้านขายน้ำบูดูและของฝากขึ้นชื่อ', 'Famous shop for Budu sauce and souvenirs.', 6.0850000, 101.8800000, '08:00-17:00', 'local_products', 100),
    ('Narathiwat', 'Mueang Narathiwat', 'Food & Souvenirs', 'nara-fried-chicken', 'ไก่ทอดนราธิวาส', 'Nara Fried Chicken', 'ไก่ทอดหอมเครื่องเทศสไตล์ปักษ์ใต้', 'Southern-style spiced fried chicken.', 6.4250000, 101.8250000, '15:00-22:00', 'local_food', 80),
    ('Narathiwat', 'Tak Bai', 'Food & Souvenirs', 'tak-bai-salt-fish', 'ปลากุเลาเค็มตากใบ', 'Tak Bai Salted Fish Shop', 'ร้านของฝากปลากุเลาเค็มคุณภาพสูง', 'Premium salted fish souvenir shop.', 6.2350000, 102.0700000, '08:00-18:00', 'local_products', 50),
    ('Narathiwat', 'Su-ngai Kolok', 'Food & Souvenirs', 'kolok-steakhouse', 'โก-ลก สเต็กเฮาส์', 'Kolok Steakhouse', 'ร้านสเต็กเนื้อคุณภาพในสุไหงโก-ลก', 'High-quality beef steakhouse in Kolok.', 6.0350000, 101.9600000, '11:00-21:00', 'local_food', 120),
    ('Narathiwat', 'Mueang Narathiwat', 'Food & Souvenirs', 'narathat-beach-cafe', 'คาเฟ่ริมหาดนราทัศน์', 'Narathat Beach Cafe', 'คาเฟ่ชิลๆ ริมหาดนราทัศน์', 'Chill cafe by the Narathat beach.', 6.4270000, 101.8270000, '09:00-19:00', 'local_food', 100),
    ('Narathiwat', 'Yi-ngo', 'Food & Souvenirs', 'yi-ngo-sweet-roti', 'โรตีหวานยี่งอ', 'Yi-ngo Sweet Roti', 'ร้านโรตีแป้งนุ่มของหวานยี่งอ', 'Soft and sweet roti dessert shop.', 6.4150000, 101.7100000, '16:00-23:00', 'local_food', 60)
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

-- End of File
