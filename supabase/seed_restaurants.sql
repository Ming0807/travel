-- ==========================================
-- RESTAURANTS SEED DATA
-- ==========================================

WITH restaurant_seed(province_en, slug, name_th, name_en, description_th, description_en, food_type, latitude, longitude, opening_hours, cover_image_url) AS (
  VALUES
    -- YALA (ยะลา)
    ('Yala', 'tara-restaurant-yala', 'ร้านอาหารธารา ยะลา', 'Tara Restaurant Yala', 'ร้านอาหารท้องถิ่นขึ้นชื่อเมืองยะลา', 'Famous local restaurant in Yala.', 'Thai', 6.5450000, 101.2850000, '10:00-22:00', 'https://images.unsplash.com/photo-1552566626-52f8b828add9?q=80&w=700&auto=format&fit=crop'),
    ('Yala', 'yala-halal-kitchen', 'ยะลา ฮาลาล คิทเช่น', 'Yala Halal Kitchen', 'ร้านอาหารฮาลาลยอดนิยมในตัวเมืองยะลา', 'Popular Halal restaurant in Yala city.', 'Halal', 6.5415000, 101.2825000, '11:00-21:00', 'https://images.unsplash.com/photo-1596797038530-2c107229654b?q=80&w=700&auto=format&fit=crop'),
    ('Yala', 'yala-beef-soup', 'ซุปเนื้อยะลา สาขาดั้งเดิม', 'Original Yala Beef Soup', 'ซุปเนื้อรสเด็ดสูตรต้นตำรับยะลา', 'Original recipe beef soup of Yala.', 'Halal', 6.5502000, 101.2801000, '08:00-16:00', 'https://images.unsplash.com/photo-1548943487-a2e4f43b4850?q=80&w=700&auto=format&fit=crop'),
    ('Yala', 'betong-chicken-rice', 'ข้าวมันไก่เบตง ต้นตำรับ', 'Betong Chicken Rice', 'ข้าวมันไก่เบตงของแท้ เนื้อแน่นนุ่ม', 'Authentic Betong chicken rice.', 'Thai-Chinese', 5.7725000, 101.0712000, '06:00-14:00', 'https://images.unsplash.com/photo-1626804475297-41609ea084eb?q=80&w=700&auto=format&fit=crop'),
    ('Yala', 'betong-dimsum', 'ติ่มซำเบตง', 'Betong Dimsum', 'ติ่มซำยามเช้าขึ้นชื่อของอำเภอเบตง', 'Famous morning dimsum in Betong.', 'Dimsum', 5.7745000, 101.0735000, '06:00-11:00', 'https://images.unsplash.com/photo-1563245372-f21724e3856d?q=80&w=700&auto=format&fit=crop'),
    ('Yala', 'yala-roti-tea', 'โรตีชาชักเมืองยะลา', 'Yala Roti & Teh Tarik', 'โรตีกรอบและชาชักหอมหวาน', 'Crispy roti and sweet pulled tea.', 'Dessert/Cafe', 6.5480000, 101.2880000, '16:00-23:00', 'https://images.unsplash.com/photo-1557493631-fb2dd5518b2c?q=80&w=700&auto=format&fit=crop'),
    ('Yala', 'raman-local-market', 'ตลาดอาหารท้องถิ่นรามัน', 'Raman Local Food Market', 'แหล่งรวมอาหารพื้นบ้านและขนมหวาน', 'Hub for traditional food and sweets.', 'Street Food', 6.4800000, 101.4300000, '07:00-12:00', 'https://images.unsplash.com/photo-1533622597524-a1215e26c0a2?q=80&w=700&auto=format&fit=crop'),

    -- PATTANI (ปัตตานี)
    ('Pattani', 'roti-de-forest-pattani', 'โรตี เดอ ฟอเรส', 'Roti de Forest', 'ร้านคาเฟ่และโรตีฟิวชั่นชื่อดัง', 'Popular cafe and fusion roti restaurant.', 'Cafe/Fusion', 6.8750000, 101.2550000, '09:00-21:00', 'https://images.unsplash.com/photo-1509315811345-672d83ef2fbc?q=80&w=700&auto=format&fit=crop'),
    ('Pattani', 'london-restaurant-pattani', 'ร้านอาหารลอนดอน', 'London Restaurant', 'ร้านอาหารเก่าแก่และคลาสสิกของปัตตานี', 'Classic and historical restaurant in Pattani.', 'Local', 6.8685000, 101.2520000, '10:00-21:00', 'https://images.unsplash.com/photo-1514933651103-005eec06c04b?q=80&w=700&auto=format&fit=crop'),
    ('Pattani', 'pattani-river-seafood', 'ซีฟู้ดริมแม่น้ำปัตตานี', 'Pattani Riverside Seafood', 'อาหารทะเลสดๆ ริมแม่น้ำปัตตานี', 'Fresh seafood by the Pattani river.', 'Seafood', 6.8800000, 101.2505000, '16:00-22:00', 'https://images.unsplash.com/photo-1615141982883-c7ad0e69fd62?q=80&w=700&auto=format&fit=crop'),
    ('Pattani', 'nong-chik-golek-chicken', 'ไก่ย่างกอและหนองจิก', 'Nong Chik Golek Chicken', 'ไก่ย่างราดน้ำแกงกอและรสเด็ด', 'Grilled chicken with rich Golek sauce.', 'Local', 6.8400000, 101.1800000, '09:00-17:00', 'https://images.unsplash.com/photo-1598514982205-f36b96d1e8d4?q=80&w=700&auto=format&fit=crop'),
    ('Pattani', 'khao-yam-nam-budu', 'ข้าวยำน้ำบูดูปัตตานี', 'Pattani Budu Rice Salad', 'ข้าวยำสมุนไพรน้ำบูดูสูตรดั้งเดิม', 'Traditional herbal rice salad with Budu sauce.', 'Local', 6.8720000, 101.2580000, '06:00-13:00', 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?q=80&w=700&auto=format&fit=crop'),
    ('Pattani', 'pattani-old-town-cafe', 'คาเฟ่เมืองเก่าปัตตานี', 'Pattani Old Town Cafe', 'คาเฟ่สไตล์คลาสสิกในย่านเมืองเก่า', 'Classic cafe in the heritage old town.', 'Cafe', 6.8695000, 101.2515000, '08:00-18:00', 'https://images.unsplash.com/photo-1497935586351-b67a49e012bf?q=80&w=700&auto=format&fit=crop'),
    ('Pattani', 'yaring-seafood', 'อาหารทะเลสดยะหริ่ง', 'Yaring Fresh Seafood', 'ร้านอาหารทะเลสดใหม่จากชาวประมง', 'Fresh seafood directly from fishermen.', 'Seafood', 6.8820000, 101.4250000, '10:00-20:00', 'https://images.unsplash.com/photo-1559742811-822873691df8?q=80&w=700&auto=format&fit=crop'),

    -- NARATHIWAT (นราธิวาส)
    ('Narathiwat', 'mangkon-thong-narathiwat', 'ร้านอาหารมังกรทอง', 'Golden Dragon Restaurant', 'ร้านอาหารซีฟู้ดและอาหารท้องถิ่น', 'Seafood and local cuisine restaurant.', 'Seafood/Chinese', 6.4300000, 101.8300000, '10:00-22:00', 'https://images.unsplash.com/photo-1565557623262-b51c2513a641?q=80&w=700&auto=format&fit=crop'),
    ('Narathiwat', 'sungai-padi-budu', 'บูดูสุไหงปาดี', 'Su-ngai Padi Budu Shop', 'ร้านขายน้ำบูดูและของฝากขึ้นชื่อ', 'Famous shop for Budu sauce and souvenirs.', 'Local', 6.0850000, 101.8800000, '08:00-17:00', 'https://images.unsplash.com/photo-1596622525164-9669e4fcd64e?q=80&w=700&auto=format&fit=crop'),
    ('Narathiwat', 'nara-fried-chicken', 'ไก่ทอดนราธิวาส', 'Nara Fried Chicken', 'ไก่ทอดหอมเครื่องเทศสไตล์ปักษ์ใต้', 'Southern-style spiced fried chicken.', 'Halal', 6.4250000, 101.8250000, '15:00-22:00', 'https://images.unsplash.com/photo-1626645738196-c2a7c87a8f58?q=80&w=700&auto=format&fit=crop'),
    ('Narathiwat', 'tak-bai-salt-fish', 'ปลากุเลาเค็มตากใบ', 'Tak Bai Salted Fish Shop', 'ร้านของฝากปลากุเลาเค็มคุณภาพสูง', 'Premium salted fish souvenir shop.', 'Local Products', 6.2350000, 102.0700000, '08:00-18:00', 'https://images.unsplash.com/photo-1534080564583-6be75777b70a?q=80&w=700&auto=format&fit=crop'),
    ('Narathiwat', 'kolok-steakhouse', 'โก-ลก สเต็กเฮาส์', 'Kolok Steakhouse', 'ร้านสเต็กเนื้อคุณภาพในสุไหงโก-ลก', 'High-quality beef steakhouse in Kolok.', 'Steakhouse', 6.0350000, 101.9600000, '11:00-21:00', 'https://images.unsplash.com/photo-1600891964092-4316c288032e?q=80&w=700&auto=format&fit=crop'),
    ('Narathiwat', 'narathat-beach-cafe', 'คาเฟ่ริมหาดนราทัศน์', 'Narathat Beach Cafe', 'คาเฟ่ชิลๆ ริมหาดนราทัศน์', 'Chill cafe by the Narathat beach.', 'Cafe', 6.4270000, 101.8270000, '09:00-19:00', 'https://images.unsplash.com/photo-1554118811-1e0d58224f24?q=80&w=700&auto=format&fit=crop'),
    ('Narathiwat', 'yi-ngo-sweet-roti', 'โรตีหวานยี่งอ', 'Yi-ngo Sweet Roti', 'ร้านโรตีแป้งนุ่มของหวานยี่งอ', 'Soft and sweet roti dessert shop.', 'Dessert', 6.4150000, 101.7100000, '16:00-23:00', 'https://images.unsplash.com/photo-1563805042-7684c8a9e9ce?q=80&w=700&auto=format&fit=crop')
)
INSERT INTO public.restaurants (
  province_id, slug, name_th, name_en,
  description_th, description_en, food_type,
  latitude, longitude, opening_hours, cover_image_url,
  is_published, is_active
)
SELECT
  p.province_id,
  s.slug,
  s.name_th,
  s.name_en,
  s.description_th,
  s.description_en,
  s.food_type,
  s.latitude,
  s.longitude,
  s.opening_hours,
  s.cover_image_url,
  true,
  true
FROM restaurant_seed s
JOIN public.provinces p ON p.province_name_en = s.province_en
ON CONFLICT (slug) DO UPDATE
SET province_id = EXCLUDED.province_id,
    name_th = EXCLUDED.name_th,
    name_en = EXCLUDED.name_en,
    description_th = EXCLUDED.description_th,
    description_en = EXCLUDED.description_en,
    food_type = EXCLUDED.food_type,
    latitude = EXCLUDED.latitude,
    longitude = EXCLUDED.longitude,
    opening_hours = EXCLUDED.opening_hours,
    cover_image_url = EXCLUDED.cover_image_url,
    is_published = EXCLUDED.is_published,
    is_active = EXCLUDED.is_active;

-- End of File
