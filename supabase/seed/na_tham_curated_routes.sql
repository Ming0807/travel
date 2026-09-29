-- Manual content seed, NOT a schema migration. Run the whole file in SQL Editor.
-- Sources, map limitations and publication checklist:
-- docs/content/NA_THAM_CURATED_ROUTES.md (researched 2026-09-29).
-- Creates three DRAFT routes referencing existing pilot attractions only.
-- Does not insert attractions, coordinates, media, visits or analytics data.
-- Existing route slugs are skipped entirely, preserving subsequent CMS edits.
BEGIN;
SET LOCAL lock_timeout = '5s';
SET LOCAL statement_timeout = '30s';

DO $seed$
DECLARE
  route_spec jsonb;
  stop_spec jsonb;
  new_route_id bigint;
  matched_attraction_id bigint;
  unresolved text;
  route_specs jsonb := $json$[
    {
      "slug": "na-tham-temple-heritage",
      "nameTh": "หน้าถ้ำ: ศรัทธาและมรดกวัดคูหาภิมุข",
      "nameEn": "Na Tham Temple Heritage",
      "descriptionTh": "ทำความรู้จักวัดหน้าถ้ำผ่านจุดเรียนรู้ในบริเวณวัด ตั้งแต่เรื่องเล่าท้องถิ่น พระพุทธไสยาสน์ ไปจนถึงโบราณวัตถุในพิพิธภัณฑ์ เส้นทางนี้มีทั้งพื้นที่วัดและทางขึ้นถ้ำ ควรสอบถามผู้ดูแลเรื่องการเข้าชมและการเดินก่อนเริ่ม ไม่ใช่เส้นทางขับรถถึงทุกจุด และยังไม่ระบุเวลาเดินทางหรือค่าใช้จ่ายที่ไม่ได้ยืนยัน",
      "descriptionEn": "Explore the temple, local beliefs, the reclining Buddha and the museum. Some stops involve stairs and cave access, not roads. Confirm access and walking conditions with the caretaker before visiting. Travel times and fees have not been verified.",
      "stops": [
        {"slug":"wat-khuha-phimuk","noteTh":"เริ่มที่วัดคูหาภิมุข สอบถามจุดจอดรถ ทางขึ้นถ้ำ และพื้นที่ที่เปิดให้เข้าชมกับผู้ดูแลวัดก่อนเริ่มเดิน","noteEn":"Start at the temple and ask the caretaker about parking, stairs and areas currently open."},
        {"slug":"your-father","noteTh":"ชมพ่อท่านเจ้าเขาและเรียนรู้เรื่องเล่าความเชื่อของชุมชน เคารพพื้นที่สักการะและไม่กีดขวางทางเดิน","noteEn":"Visit Pho Than Chao Khao and learn about local beliefs. Respect worshippers and keep paths clear."},
        {"slug":"sleeping-buddha-cave","noteTh":"เข้าชมพระพุทธไสยาสน์ในถ้ำพระนอนตามทางที่ผู้ดูแลอนุญาต มีทางขึ้นถ้ำ ควรประเมินความพร้อมของผู้ร่วมเดินทาง","noteEn":"Visit the reclining Buddha via the permitted access path. Consider each visitor's ability to use the cave stairs."},
        {"slug":"srivijaya","noteTh":"ปิดท้ายที่พิพิธภัณฑ์ศรีวิชัยหรือหอวัฒนธรรมศรีวิชัย ตรวจสอบการเปิดอาคารกับผู้ดูแลล่วงหน้า","noteEn":"Finish at the Srivijaya museum. Confirm building access with the caretaker in advance."}
      ]
    },
    {
      "slug": "na-tham-art-and-community",
      "nameTh": "หน้าถ้ำ: จากศิลปะถ้ำสู่ผืนผ้าสีมายา",
      "nameEn": "Na Tham Cave Art and Simaya Community",
      "descriptionTh": "เชื่อมการเรียนรู้มรดกท้องถิ่นกับงานสร้างสรรค์ของชุมชน ผ่านพิพิธภัณฑ์ศรีวิชัย ถ้ำศิลป์ และชุมชนสีมายา บ้านหน้าถ้ำ ลำดับนี้เป็นข้อเสนอเพื่อจัดการเรียนรู้ ไม่ใช่เส้นทางที่คำนวณว่าเร็วที่สุด ควรนัดหมายชุมชนและตรวจสอบการเข้าชมถ้ำก่อนเดินทาง กิจกรรมผ้ามัดย้อมขึ้นอยู่กับการยืนยันของกลุ่มผู้จัด ไม่ใช่กิจกรรมที่รับประกันว่ามีทุกวัน",
      "descriptionEn": "Connect local heritage with community craft through the museum, Tham Sin and Simaya. This is an editorial learning itinerary, not an optimized road route. Arrange community visits and confirm cave access in advance; dyeing activities depend on the host's confirmation.",
      "stops": [
        {"slug":"srivijaya","noteTh":"เริ่มเรียนรู้บริบทมรดกท้องถิ่นที่พิพิธภัณฑ์ โดยนัดหมายหรือสอบถามเวลาเปิดกับผู้ดูแล","noteEn":"Start with local heritage at the museum; confirm opening arrangements with its caretaker."},
        {"slug":"artcave","noteTh":"ชมแหล่งภาพเขียนถ้ำศิลป์ตามข้อกำหนดของผู้ดูแล ไม่สัมผัสภาพเขียน พิกัดแหล่งโบราณคดีไม่ใช่การยืนยันจุดจอดรถหรือทางขึ้นที่ใช้งานได้ในวันเดินทาง","noteEn":"Follow the caretaker's rules at Tham Sin and do not touch the paintings. The archaeological location does not verify parking or current access."},
        {"slug":"simiya-community","noteTh":"เยี่ยมชมชุมชนสีมายา บ้านหน้าถ้ำ และเรียนรู้งานผ้ามัดย้อมเมื่อกลุ่มชุมชนยืนยันวัน เวลา จุดนัดพบ และค่าใช้จ่ายแล้ว","noteEn":"Visit Simaya and learn about tie-dye craft after the community confirms the date, meeting point and any charges."}
      ]
    },
    {
      "slug": "na-tham-kampan-cave-learning",
      "nameTh": "หน้าถ้ำ: เรียนรู้เขากำปั่นกับผู้ดูแลท้องถิ่น",
      "nameEn": "Na Tham Khao Kampan Guided Learning",
      "descriptionTh": "ข้อเสนอเส้นทางเรียนรู้ภูเขาหินปูนและแหล่งโบราณคดีในพื้นที่หน้าถ้ำ เริ่มทำความรู้จักพื้นที่วัดคูหาภิมุข แล้วต่อไปยังเพิงผาเขากำปั่นและถ้ำสำเภาทอง ต้องประสานผู้ดูแลแต่ละจุด ยืนยันจุดนัดพบ ทางเข้าที่ได้รับอนุญาต สภาพอากาศ และความเหมาะสมของผู้ร่วมเดินทางก่อนใช้เส้นทาง ไม่แนะนำให้เข้าถ้ำเองจากหมุดแผนที่ และไม่ได้รวมบริการผู้นำทางไว้ในระบบ",
      "descriptionEn": "A proposed learning itinerary linking the temple area, Khao Kampan rock shelter and Samphao Thong cave. Arrange access with local caretakers, confirm meeting points and conditions, and assess visitor suitability. Do not enter caves solely by following map markers. Guide services are not included or booked by this platform.",
      "stops": [
        {"slug":"wat-khuha-phimuk","noteTh":"เยี่ยมชมบริเวณวัดก่อนเดินทางต่อ นัดหมายผู้ดูแลเขากำปั่นแยกต่างหาก ไม่ถือว่าวัดเป็นผู้ให้บริการนำเที่ยวทุกจุด","noteEn":"Visit the temple area first. Arrange Khao Kampan access separately; the temple is not assumed to provide tours to every stop."},
        {"slug":"kampan","noteTh":"เรียนรู้เพิงผาเขากำปั่นเฉพาะบริเวณที่ผู้ดูแลอนุญาต ยืนยันทางเข้าและผู้พาเข้าชมก่อนเดินทาง ไม่เก็บหรือเคลื่อนย้ายวัตถุในพื้นที่","noteEn":"Visit only authorized areas of the rock shelter with locally confirmed access. Do not collect or move objects."},
        {"slug":"golden-junk-cave","noteTh":"ติดต่อพระสงฆ์หรือผู้ดูแลถ้ำสำเภาทองก่อนเข้าชม ตรวจสอบแสงสว่าง ทางเดิน และเงื่อนไขการเปิดในวันนั้น ไม่สัมผัสหรือทำลายหินงอกหินย้อย","noteEn":"Contact the monks or cave caretaker before entry. Check lighting, paths and current access conditions; do not touch cave formations."}
      ]
    }
  ]$json$::jsonb;
BEGIN
  -- Serialize this seed without locking unrelated content tables.
  PERFORM pg_advisory_xact_lock(20260929, 2501);

  SELECT string_agg(required.slug, ', ' ORDER BY required.slug)
  INTO unresolved
  FROM (
    SELECT DISTINCT stop->>'slug' AS slug
    FROM jsonb_array_elements(route_specs) AS route
    CROSS JOIN LATERAL jsonb_array_elements(route->'stops') AS stop
    WHERE NOT EXISTS (SELECT 1 FROM public.suggested_routes existing WHERE existing.slug = route->>'slug')
  ) required
  WHERE NOT EXISTS (
    SELECT 1 FROM public.attractions attraction
    JOIN public.provinces province ON province.province_id = attraction.province_id
    WHERE attraction.slug = required.slug
      AND attraction.is_active = true
      AND attraction.is_published = true
      AND province.province_name_en = 'Yala'
  );
  IF unresolved IS NOT NULL THEN
    RAISE EXCEPTION 'NA_THAM_ROUTE_SEED: missing, inactive, unpublished or non-Yala attractions: %', unresolved;
  END IF;

  FOR route_spec IN SELECT value FROM jsonb_array_elements(route_specs)
  LOOP
    new_route_id := NULL;
    INSERT INTO public.suggested_routes
      (slug, name_th, name_en, description_th, description_en, is_active, is_published)
    VALUES
      (route_spec->>'slug', route_spec->>'nameTh', route_spec->>'nameEn',
       route_spec->>'descriptionTh', route_spec->>'descriptionEn', true, false)
    ON CONFLICT (slug) DO NOTHING
    RETURNING route_id INTO new_route_id;

    IF new_route_id IS NULL THEN
      RAISE NOTICE 'Preserved existing route: %', route_spec->>'slug';
      CONTINUE;
    END IF;

    FOR stop_spec IN
      SELECT jsonb_build_object('data', value, 'position', ordinality)
      FROM jsonb_array_elements(route_spec->'stops') WITH ORDINALITY
    LOOP
      SELECT attraction_id INTO STRICT matched_attraction_id
      FROM public.attractions WHERE slug = stop_spec->'data'->>'slug';
      INSERT INTO public.suggested_route_stops
        (route_id, attraction_id, day_number, display_order, stop_note_th, stop_note_en)
      VALUES
        (new_route_id, matched_attraction_id, 1, (stop_spec->>'position')::integer,
         stop_spec->'data'->>'noteTh', stop_spec->'data'->>'noteEn');
    END LOOP;
  END LOOP;
END;
$seed$;

COMMIT;

SELECT route.slug, route.name_th, route.is_published, count(stop.stop_id) AS stop_count
FROM public.suggested_routes route
LEFT JOIN public.suggested_route_stops stop USING (route_id)
WHERE route.slug IN ('na-tham-temple-heritage', 'na-tham-art-and-community', 'na-tham-kampan-cave-learning')
GROUP BY route.route_id, route.slug, route.name_th, route.is_published
ORDER BY route.slug;
