-- READ ONLY: inspect the confirmed eleven-place pilot and its map readiness.
-- A valid numeric coordinate is not proof of a safe entrance or road access.
WITH pilot(slug, reference_latitude, reference_longitude, source_url) AS (
  VALUES
    ('your-father', NULL::numeric, NULL::numeric, NULL::text),
    ('sleeping-buddha-cave', NULL, NULL, NULL),
    ('kampan', NULL, NULL, NULL),
    ('golden-junk-cave', NULL, NULL, NULL),
    ('nang-monto-cave', NULL, NULL, NULL),
    ('srivijaya', NULL, NULL, NULL),
    ('dark-cave', NULL, NULL, NULL),
    ('simiya-community', NULL, NULL, NULL),
    ('tigercave', NULL, NULL, NULL),
    ('artcave', 6.522165, 101.233363, 'https://archaeology.sac.or.th/archaeology/89'),
    ('wat-khuha-phimuk', 6.528737, 101.224914, 'https://archaeology.sac.or.th/archaeology/829')
)
SELECT pilot.slug, attraction.attraction_id, attraction.name_th,
  attraction.is_active, attraction.is_published,
  attraction.latitude, attraction.longitude,
  CASE
    WHEN attraction.attraction_id IS NULL THEN 'MISSING_RECORD'
    WHEN attraction.is_active IS NOT TRUE OR attraction.is_published IS NOT TRUE THEN 'NOT_PUBLIC'
    WHEN attraction.latitude IS NULL OR attraction.longitude IS NULL THEN 'MISSING_COORDINATES'
    WHEN attraction.latitude NOT BETWEEN -90 AND 90 OR attraction.longitude NOT BETWEEN -180 AND 180 THEN 'INVALID_COORDINATES'
    ELSE 'NUMERIC_COORDINATES_PRESENT_VERIFY_ENTRANCE'
  END AS review_status,
  pilot.reference_latitude, pilot.reference_longitude, pilot.source_url,
  CASE WHEN attraction.latitude BETWEEN -90 AND 90 AND attraction.longitude BETWEEN -180 AND 180
    THEN 'https://www.google.com/maps/search/?api=1&query=' || attraction.latitude::text || '%2C' || attraction.longitude::text
    ELSE NULL END AS stored_coordinate_map,
  CASE WHEN pilot.reference_latitude IS NOT NULL
    THEN 'https://www.google.com/maps/search/?api=1&query=' || pilot.reference_latitude::text || '%2C' || pilot.reference_longitude::text
    ELSE NULL END AS reference_site_map
FROM pilot
LEFT JOIN public.attractions attraction USING (slug)
ORDER BY pilot.slug;
