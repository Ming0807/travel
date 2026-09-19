-- Scope the public pilot catalog to the confirmed Ban Na Tham area records.
-- Historical visits, surveys, certificates, stamps, and funnel events are retained.
-- A twelfth attraction can be added and published later without changing this migration.

DO $$
DECLARE
    v_attraction_slugs text[] := ARRAY[
        'your-father',
        'sleeping-buddha-cave',
        'kampan',
        'golden-junk-cave',
        'nang-monto-cave',
        'srivijaya',
        'dark-cave',
        'simiya-community',
        'tigercave',
        'artcave',
        'wat-khuha-phimuk'
    ];
    v_restaurant_slugs text[] := ARRAY[
        'lae-pha-ban-na-tham',
        'krua-rim-harn',
        'glieb-bua',
        'uncle-kills-duck-eggs'
    ];
    v_accommodation_slugs text[] := ARRAY[
        'bantham',
        'counting-stars-homestay',
        'garden-house-camping',
        'ban-lae-pha'
    ];
    v_missing text[];
BEGIN
    SELECT array_agg(expected.slug ORDER BY expected.slug)
    INTO v_missing
    FROM unnest(v_attraction_slugs) AS expected(slug)
    WHERE NOT EXISTS (
        SELECT 1 FROM public.attractions AS attraction WHERE attraction.slug = expected.slug
    );
    IF v_missing IS NOT NULL THEN
        RAISE EXCEPTION 'NA_THAM_ATTRACTION_ALLOWLIST_MISSING: %', array_to_string(v_missing, ', ');
    END IF;

    SELECT array_agg(expected.slug ORDER BY expected.slug)
    INTO v_missing
    FROM unnest(v_restaurant_slugs) AS expected(slug)
    WHERE NOT EXISTS (
        SELECT 1 FROM public.restaurants AS restaurant WHERE restaurant.slug = expected.slug
    );
    IF v_missing IS NOT NULL THEN
        RAISE EXCEPTION 'NA_THAM_RESTAURANT_ALLOWLIST_MISSING: %', array_to_string(v_missing, ', ');
    END IF;

    SELECT array_agg(expected.slug ORDER BY expected.slug)
    INTO v_missing
    FROM unnest(v_accommodation_slugs) AS expected(slug)
    WHERE NOT EXISTS (
        SELECT 1 FROM public.accommodations AS accommodation WHERE accommodation.slug = expected.slug
    );
    IF v_missing IS NOT NULL THEN
        RAISE EXCEPTION 'NA_THAM_ACCOMMODATION_ALLOWLIST_MISSING: %', array_to_string(v_missing, ', ');
    END IF;

    UPDATE public.attractions
    SET is_active = false,
        is_published = false,
        updated_at = now()
    WHERE NOT (slug = ANY(v_attraction_slugs))
      AND (is_active IS DISTINCT FROM false OR is_published IS DISTINCT FROM false);

    UPDATE public.checkin_codes AS code
    SET is_active = false,
        updated_at = now()
    FROM public.attractions AS attraction
    WHERE code.attraction_id = attraction.attraction_id
      AND attraction.is_active = false
      AND code.is_active = true;

    UPDATE public.photo_spots AS spot
    SET is_active = false,
        updated_at = now()
    FROM public.attractions AS attraction
    WHERE spot.attraction_id = attraction.attraction_id
      AND attraction.is_active = false
      AND spot.is_active = true;

    UPDATE public.stamp_definitions AS stamp
    SET is_active = false,
        updated_at = now()
    FROM public.attractions AS attraction
    WHERE stamp.attraction_id = attraction.attraction_id
      AND attraction.is_active = false
      AND stamp.is_active = true;

    UPDATE public.research_checkin_codes AS deployment
    SET is_active = false
    FROM public.checkin_codes AS code
    WHERE deployment.checkin_code_id = code.checkin_code_id
      AND code.is_active = false
      AND deployment.is_active = true;

    UPDATE public.nfc_tags AS tag
    SET status = 'inactive',
        last_change_reason = 'Attraction archived outside the Ban Na Tham pilot catalog',
        updated_at = now(),
        version = version + 1
    FROM public.attractions AS attraction
    WHERE tag.attraction_id_snapshot = attraction.attraction_id
      AND attraction.is_active = false
      AND tag.status = 'active';

    UPDATE public.suggested_routes AS route
    SET is_active = false,
        is_published = false,
        updated_at = now()
    WHERE EXISTS (
        SELECT 1
        FROM public.suggested_route_stops AS stop
        JOIN public.attractions AS attraction
          ON attraction.attraction_id = stop.attraction_id
        WHERE stop.route_id = route.route_id
          AND attraction.is_active = false
    )
      AND (route.is_active IS DISTINCT FROM false OR route.is_published IS DISTINCT FROM false);

    UPDATE public.restaurants
    SET is_active = false,
        is_published = false,
        updated_at = now()
    WHERE NOT (slug = ANY(v_restaurant_slugs))
      AND (is_active IS DISTINCT FROM false OR is_published IS DISTINCT FROM false);

    UPDATE public.accommodations
    SET is_active = false,
        is_published = false,
        updated_at = now()
    WHERE NOT (slug = ANY(v_accommodation_slugs))
      AND (is_active IS DISTINCT FROM false OR is_published IS DISTINCT FROM false);
END;
$$;
