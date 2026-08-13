-- Migration: 20260813000000_add_attraction_type_assignments
-- Purpose: Multi-category attractions with one compatibility primary category.

BEGIN;

CREATE TABLE public.attraction_type_assignments (
    attraction_id bigint not null
        references public.attractions(attraction_id) on delete cascade,
    attraction_type_id bigint not null
        references public.attraction_types(attraction_type_id) on delete restrict,
    is_primary boolean not null default false,
    display_order integer not null default 0 CHECK (display_order >= 0),
    created_at timestamptz not null default now(),
    updated_at timestamptz,
    PRIMARY KEY (attraction_id, attraction_type_id)
);

CREATE UNIQUE INDEX uq_attraction_type_assignments_primary
    ON public.attraction_type_assignments(attraction_id)
    WHERE is_primary = true;

CREATE INDEX idx_attraction_type_assignments_type_attraction
    ON public.attraction_type_assignments(attraction_type_id, attraction_id);

CREATE INDEX idx_attraction_type_assignments_attraction_order
    ON public.attraction_type_assignments(attraction_id, display_order, attraction_type_id);

CREATE TRIGGER set_attraction_type_assignments_updated_at
    BEFORE UPDATE ON public.attraction_type_assignments
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

COMMENT ON TABLE public.attraction_type_assignments IS
    'Controlled many-to-many attraction categories. One assignment is primary and mirrors attractions.attraction_type_id.';
COMMENT ON COLUMN public.attractions.attraction_type_id IS
    'Compatibility primary category. All categories are stored in attraction_type_assignments.';

INSERT INTO public.attraction_type_assignments (
    attraction_id,
    attraction_type_id,
    is_primary,
    display_order
)
SELECT
    attraction.attraction_id,
    attraction.attraction_type_id,
    true,
    0
FROM public.attractions attraction
WHERE attraction.attraction_type_id IS NOT NULL
ON CONFLICT (attraction_id, attraction_type_id) DO UPDATE SET
    is_primary = true,
    display_order = 0,
    updated_at = now();

CREATE OR REPLACE FUNCTION public.mirror_primary_attraction_type()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = pg_catalog, public
AS $$
BEGIN
    UPDATE public.attraction_type_assignments
    SET is_primary = false,
        updated_at = now()
    WHERE attraction_id = NEW.attraction_id
      AND is_primary = true
      AND attraction_type_id IS DISTINCT FROM NEW.attraction_type_id;

    IF NEW.attraction_type_id IS NOT NULL THEN
        INSERT INTO public.attraction_type_assignments (
            attraction_id,
            attraction_type_id,
            is_primary,
            display_order
        ) VALUES (
            NEW.attraction_id,
            NEW.attraction_type_id,
            true,
            0
        )
        ON CONFLICT (attraction_id, attraction_type_id) DO UPDATE SET
            is_primary = true,
            display_order = 0,
            updated_at = now();
    END IF;

    RETURN NEW;
END;
$$;

CREATE TRIGGER mirror_attractions_primary_type
    AFTER INSERT OR UPDATE OF attraction_type_id ON public.attractions
    FOR EACH ROW EXECUTE FUNCTION public.mirror_primary_attraction_type();

CREATE OR REPLACE FUNCTION public.sync_attraction_types(
    p_attraction_id bigint,
    p_attraction_type_ids bigint[],
    p_primary_attraction_type_id bigint,
    p_is_published boolean DEFAULT NULL
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = pg_catalog, public
AS $$
DECLARE
    v_type_ids bigint[];
    v_expected_count integer;
    v_active_count integer;
    v_is_published boolean;
BEGIN
    SELECT coalesce(array_agg(attraction_type_id ORDER BY first_position), ARRAY[]::bigint[])
    INTO v_type_ids
    FROM (
        SELECT attraction_type_id, min(position)::integer AS first_position
        FROM unnest(coalesce(p_attraction_type_ids, ARRAY[]::bigint[])) WITH ORDINALITY
            AS selected(attraction_type_id, position)
        WHERE attraction_type_id IS NOT NULL
        GROUP BY attraction_type_id
    ) normalized;

    SELECT attraction.is_published
    INTO v_is_published
    FROM public.attractions attraction
    WHERE attraction.attraction_id = p_attraction_id
    FOR UPDATE;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'ATTRACTION_NOT_FOUND';
    END IF;

    v_expected_count := cardinality(v_type_ids);

    IF v_expected_count > 4 THEN
        RAISE EXCEPTION 'ATTRACTION_CATEGORY_LIMIT_EXCEEDED';
    END IF;

    IF v_expected_count = 0 AND p_primary_attraction_type_id IS NOT NULL THEN
        RAISE EXCEPTION 'ATTRACTION_PRIMARY_CATEGORY_INVALID';
    END IF;

    IF v_expected_count > 0 AND p_primary_attraction_type_id IS NULL THEN
        RAISE EXCEPTION 'ATTRACTION_PRIMARY_CATEGORY_REQUIRED';
    END IF;

    IF p_primary_attraction_type_id IS NOT NULL
       AND NOT (p_primary_attraction_type_id = ANY(v_type_ids)) THEN
        RAISE EXCEPTION 'ATTRACTION_PRIMARY_CATEGORY_INVALID';
    END IF;

    SELECT count(*)::integer
    INTO v_active_count
    FROM public.attraction_types category
    WHERE category.attraction_type_id = ANY(v_type_ids)
      AND category.is_active = true;

    IF v_active_count <> v_expected_count THEN
        RAISE EXCEPTION 'ATTRACTION_CATEGORY_INVALID';
    END IF;

    v_is_published := coalesce(p_is_published, v_is_published);
    IF v_is_published = true AND p_primary_attraction_type_id IS NULL THEN
        RAISE EXCEPTION 'ATTRACTION_PRIMARY_CATEGORY_REQUIRED';
    END IF;

    DELETE FROM public.attraction_type_assignments assignment
    WHERE assignment.attraction_id = p_attraction_id;

    INSERT INTO public.attraction_type_assignments (
        attraction_id,
        attraction_type_id,
        is_primary,
        display_order
    )
    SELECT
        p_attraction_id,
        selected.attraction_type_id,
        selected.attraction_type_id = p_primary_attraction_type_id,
        CASE
            WHEN selected.attraction_type_id = p_primary_attraction_type_id THEN 0
            ELSE selected.position::integer
        END
    FROM unnest(v_type_ids) WITH ORDINALITY AS selected(attraction_type_id, position)
    ORDER BY
        (selected.attraction_type_id = p_primary_attraction_type_id) DESC,
        selected.position;

    UPDATE public.attractions
    SET attraction_type_id = p_primary_attraction_type_id,
        is_published = v_is_published,
        updated_at = now()
    WHERE attraction_id = p_attraction_id;
END;
$$;

ALTER TABLE public.attraction_type_assignments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can read categories of published attractions"
ON public.attraction_type_assignments
FOR SELECT
USING (
    public.is_public_attraction(attraction_id)
    AND EXISTS (
        SELECT 1
        FROM public.attraction_types category
        WHERE category.attraction_type_id = attraction_type_assignments.attraction_type_id
          AND category.is_active = true
    )
);

ALTER FUNCTION public.mirror_primary_attraction_type() OWNER TO postgres;
ALTER FUNCTION public.sync_attraction_types(bigint, bigint[], bigint, boolean) OWNER TO postgres;

REVOKE ALL ON FUNCTION public.mirror_primary_attraction_type() FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.sync_attraction_types(bigint, bigint[], bigint, boolean) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.sync_attraction_types(bigint, bigint[], bigint, boolean) TO service_role;

GRANT SELECT ON TABLE public.attraction_type_assignments TO anon, authenticated;
GRANT ALL ON TABLE public.attraction_type_assignments TO service_role;

COMMIT;
