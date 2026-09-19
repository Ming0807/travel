-- Keep restaurant detail and attraction detail relationships consistent.
-- The function validates the complete request before replacing either direction.

CREATE OR REPLACE FUNCTION public.sync_restaurant_attractions(
    p_restaurant_id bigint,
    p_attraction_ids bigint[] DEFAULT ARRAY[]::bigint[]
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = pg_catalog, public
AS $$
DECLARE
    v_attraction_ids bigint[];
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM public.restaurants WHERE restaurant_id = p_restaurant_id
    ) THEN
        RAISE EXCEPTION 'RESTAURANT_NOT_FOUND';
    END IF;

    SELECT COALESCE(array_agg(ordered.attraction_id ORDER BY ordered.first_position), ARRAY[]::bigint[])
    INTO v_attraction_ids
    FROM (
        SELECT requested.attraction_id, MIN(requested.ordinality) AS first_position
        FROM unnest(COALESCE(p_attraction_ids, ARRAY[]::bigint[]))
             WITH ORDINALITY AS requested(attraction_id, ordinality)
        WHERE requested.attraction_id > 0
        GROUP BY requested.attraction_id
    ) AS ordered;

    IF cardinality(v_attraction_ids) > 12 THEN
        RAISE EXCEPTION 'RESTAURANT_ATTRACTION_LIMIT_EXCEEDED';
    END IF;

    IF EXISTS (
        SELECT 1
        FROM unnest(v_attraction_ids) AS requested(attraction_id)
        LEFT JOIN public.attractions attraction
          ON attraction.attraction_id = requested.attraction_id
        WHERE attraction.attraction_id IS NULL
           OR attraction.is_active IS DISTINCT FROM true
    ) THEN
        RAISE EXCEPTION 'RESTAURANT_ATTRACTION_INVALID';
    END IF;

    DELETE FROM public.restaurant_attractions
    WHERE restaurant_id = p_restaurant_id;

    DELETE FROM public.attraction_related_restaurants
    WHERE restaurant_id = p_restaurant_id;

    INSERT INTO public.restaurant_attractions (
        restaurant_id,
        attraction_id,
        display_order
    )
    SELECT p_restaurant_id, selected.attraction_id, selected.ordinality - 1
    FROM unnest(v_attraction_ids) WITH ORDINALITY AS selected(attraction_id, ordinality);

    INSERT INTO public.attraction_related_restaurants (
        attraction_id,
        restaurant_id,
        display_order
    )
    SELECT selected.attraction_id, p_restaurant_id, selected.ordinality - 1
    FROM unnest(v_attraction_ids) WITH ORDINALITY AS selected(attraction_id, ordinality);
END;
$$;

REVOKE ALL ON FUNCTION public.sync_restaurant_attractions(bigint, bigint[])
FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.sync_restaurant_attractions(bigint, bigint[])
TO service_role;

CREATE OR REPLACE FUNCTION public.create_restaurant_with_categories_and_attractions(
    p_payload jsonb,
    p_category_ids bigint[],
    p_attraction_ids bigint[],
    p_is_published boolean
)
RETURNS bigint
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = pg_catalog, public
AS $$
DECLARE
    v_restaurant_id bigint;
BEGIN
    v_restaurant_id := public.create_restaurant_with_categories(
        p_payload,
        p_category_ids,
        p_is_published
    );
    PERFORM public.sync_restaurant_attractions(v_restaurant_id, p_attraction_ids);
    RETURN v_restaurant_id;
END;
$$;

CREATE OR REPLACE FUNCTION public.update_restaurant_with_categories_and_attractions(
    p_restaurant_id bigint,
    p_payload jsonb,
    p_category_ids bigint[],
    p_attraction_ids bigint[],
    p_is_published boolean
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = pg_catalog, public
AS $$
BEGIN
    PERFORM public.update_restaurant_with_categories(
        p_restaurant_id,
        p_payload,
        p_category_ids,
        p_is_published
    );
    PERFORM public.sync_restaurant_attractions(p_restaurant_id, p_attraction_ids);
END;
$$;

REVOKE ALL ON FUNCTION public.create_restaurant_with_categories_and_attractions(jsonb, bigint[], bigint[], boolean)
FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.create_restaurant_with_categories_and_attractions(jsonb, bigint[], bigint[], boolean)
TO service_role;

REVOKE ALL ON FUNCTION public.update_restaurant_with_categories_and_attractions(bigint, jsonb, bigint[], bigint[], boolean)
FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.update_restaurant_with_categories_and_attractions(bigint, jsonb, bigint[], bigint[], boolean)
TO service_role;
