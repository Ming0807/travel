-- Migration: 20260812000000_create_restaurant_categories
-- Purpose: Database-backed, multi-category restaurant taxonomy and atomic assignments.

BEGIN;

CREATE TABLE public.restaurant_categories (
    category_id bigint generated always as identity primary key,
    slug varchar(100) not null,
    name_th varchar(120) not null,
    name_en varchar(120),
    section_key varchar(20) not null default 'other'
        CHECK (section_key IN ('local', 'meals', 'cafes', 'other')),
    display_order integer not null default 0 CHECK (display_order >= 0),
    is_featured boolean not null default false,
    is_active boolean not null default true,
    created_at timestamptz not null default now(),
    updated_at timestamptz,
    CONSTRAINT restaurant_categories_slug_key UNIQUE (slug),
    CONSTRAINT restaurant_categories_slug_format_check
        CHECK (slug = lower(slug) AND slug ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$')
);

CREATE TABLE public.restaurant_category_assignments (
    restaurant_id bigint not null
        references public.restaurants(restaurant_id) on delete cascade,
    category_id bigint not null
        references public.restaurant_categories(category_id) on delete cascade,
    display_order integer not null default 0 CHECK (display_order >= 0),
    created_at timestamptz not null default now(),
    PRIMARY KEY (restaurant_id, category_id)
);

CREATE INDEX idx_restaurant_categories_active_order
    ON public.restaurant_categories(is_active, display_order, category_id);
CREATE INDEX idx_restaurant_categories_featured_order
    ON public.restaurant_categories(is_featured, display_order, category_id)
    WHERE is_active = true;
CREATE INDEX idx_restaurant_category_assignments_category_id
    ON public.restaurant_category_assignments(category_id, restaurant_id);

CREATE TRIGGER set_restaurant_categories_updated_at
    BEFORE UPDATE ON public.restaurant_categories
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

COMMENT ON TABLE public.restaurant_categories IS
    'Admin-managed restaurant categories shared by Restaurant CMS and public discovery.';
COMMENT ON TABLE public.restaurant_category_assignments IS
    'Many-to-many restaurant category assignments. Replace through sync_restaurant_categories().';
COMMENT ON COLUMN public.restaurants.food_type IS
    'Deprecated compatibility value derived from the first restaurant category. restaurant_category_assignments is authoritative.';

INSERT INTO public.restaurant_categories
    (slug, name_th, name_en, section_key, display_order, is_featured, is_active)
VALUES
    ('thai', 'อาหารไทย', 'Thai', 'local', 10, false, true),
    ('malay', 'อาหารมลายู', 'Malay', 'local', 20, true, true),
    ('thai-chinese', 'อาหารไทย-จีน', 'Thai-Chinese', 'local', 30, false, true),
    ('halal', 'อาหารฮาลาล', 'Halal', 'meals', 40, true, true),
    ('street-food', 'สตรีทฟู้ด', 'Street Food', 'meals', 50, true, true),
    ('dimsum', 'ติ่มซำ', 'Dimsum', 'meals', 60, false, true),
    ('international', 'อาหารนานาชาติ', 'International', 'meals', 70, false, true),
    ('dessert-cafe', 'ของหวานและคาเฟ่', 'Dessert/Cafe', 'cafes', 80, true, true),
    ('coffee', 'คาเฟ่และกาแฟ', 'Coffee', 'cafes', 90, true, true),
    ('bakery', 'เบเกอรี่', 'Bakery', 'cafes', 100, false, true)
ON CONFLICT (slug) DO UPDATE SET
    name_th = EXCLUDED.name_th,
    name_en = EXCLUDED.name_en,
    section_key = EXCLUDED.section_key;

-- Match controlled legacy values, including composite strings such as
-- "Western / Thai". Unrecognized text intentionally remains uncategorized.
WITH legacy_patterns(slug, pattern) AS (
    VALUES
        ('thai-chinese', '(^|[ /,&+])thai-chinese($|[ /,&+])'),
        ('thai', '(^|[ /,&+])thai($|[ /,&+])'),
        ('malay', '(^|[ /,&+])malay($|[ /,&+])'),
        ('halal', '(^|[ /,&+])halal($|[ /,&+])'),
        ('street-food', '(^|[ /,&+])street[ -]food($|[ /,&+])'),
        ('dimsum', '(^|[ /,&+])dim[ -]?sum($|[ /,&+])'),
        ('international', '(^|[ /,&+])international($|[ /,&+])'),
        ('dessert-cafe', '(^|[ /,&+])(dessert|cafe)($|[ /,&+])'),
        ('coffee', '(^|[ /,&+])coffee($|[ /,&+])'),
        ('bakery', '(^|[ /,&+])bakery($|[ /,&+])')
)
INSERT INTO public.restaurant_category_assignments
    (restaurant_id, category_id, display_order)
SELECT
    restaurant.restaurant_id,
    category.category_id,
    category.display_order
FROM public.restaurants restaurant
JOIN legacy_patterns pattern
  ON lower(coalesce(restaurant.food_type, '')) ~ pattern.pattern
JOIN public.restaurant_categories category
  ON category.slug = pattern.slug
ON CONFLICT (restaurant_id, category_id) DO NOTHING;

CREATE OR REPLACE FUNCTION public.sync_restaurant_categories(
    p_restaurant_id bigint,
    p_category_ids bigint[],
    p_is_published boolean DEFAULT NULL
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = pg_catalog, public
AS $$
DECLARE
    v_category_ids bigint[];
    v_expected_count integer;
    v_active_count integer;
    v_is_published boolean;
    v_primary_name_en text;
BEGIN
    SELECT coalesce(array_agg(category_id ORDER BY first_position), ARRAY[]::bigint[])
    INTO v_category_ids
    FROM (
        SELECT category_id, min(position)::integer AS first_position
        FROM unnest(coalesce(p_category_ids, ARRAY[]::bigint[])) WITH ORDINALITY
            AS selected(category_id, position)
        WHERE category_id IS NOT NULL
        GROUP BY category_id
    ) normalized;

    SELECT restaurant.is_published
    INTO v_is_published
    FROM public.restaurants restaurant
    WHERE restaurant.restaurant_id = p_restaurant_id
    FOR UPDATE;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'RESTAURANT_NOT_FOUND';
    END IF;

    v_expected_count := cardinality(v_category_ids);

    SELECT count(*)::integer
    INTO v_active_count
    FROM public.restaurant_categories category
    WHERE category.category_id = ANY(v_category_ids)
      AND category.is_active = true;

    IF v_active_count <> v_expected_count THEN
        RAISE EXCEPTION 'RESTAURANT_CATEGORY_INVALID';
    END IF;

    v_is_published := coalesce(p_is_published, v_is_published);

    IF v_is_published = true AND v_expected_count = 0 THEN
        RAISE EXCEPTION 'RESTAURANT_CATEGORY_REQUIRED';
    END IF;

    DELETE FROM public.restaurant_category_assignments assignment
    WHERE assignment.restaurant_id = p_restaurant_id;

    INSERT INTO public.restaurant_category_assignments
        (restaurant_id, category_id, display_order)
    SELECT p_restaurant_id, selected.category_id, (selected.position - 1)::integer
    FROM unnest(v_category_ids) WITH ORDINALITY AS selected(category_id, position);

    SELECT category.name_en
    INTO v_primary_name_en
    FROM unnest(v_category_ids) WITH ORDINALITY AS selected(category_id, position)
    JOIN public.restaurant_categories category
      ON category.category_id = selected.category_id
    ORDER BY selected.position
    LIMIT 1;

    UPDATE public.restaurants
    SET food_type = v_primary_name_en,
        is_published = v_is_published,
        updated_at = now()
    WHERE restaurant_id = p_restaurant_id;
END;
$$;

CREATE OR REPLACE FUNCTION public.create_restaurant_with_categories(
    p_payload jsonb,
    p_category_ids bigint[],
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
    INSERT INTO public.restaurants (
        province_id, slug, name_th, name_en, description_th, description_en,
        latitude, longitude, address_text, opening_hours, contact_info,
        is_active, is_published
    ) VALUES (
        (p_payload ->> 'province_id')::bigint,
        p_payload ->> 'slug',
        p_payload ->> 'name_th',
        p_payload ->> 'name_en',
        p_payload ->> 'description_th',
        p_payload ->> 'description_en',
        (p_payload ->> 'latitude')::numeric,
        (p_payload ->> 'longitude')::numeric,
        p_payload ->> 'address_text',
        p_payload ->> 'opening_hours',
        p_payload ->> 'contact_info',
        coalesce((p_payload ->> 'is_active')::boolean, true),
        false
    )
    RETURNING restaurant_id INTO v_restaurant_id;

    PERFORM public.sync_restaurant_categories(v_restaurant_id, p_category_ids, p_is_published);
    RETURN v_restaurant_id;
END;
$$;

CREATE OR REPLACE FUNCTION public.update_restaurant_with_categories(
    p_restaurant_id bigint,
    p_payload jsonb,
    p_category_ids bigint[],
    p_is_published boolean
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = pg_catalog, public
AS $$
BEGIN
    UPDATE public.restaurants
    SET province_id = (p_payload ->> 'province_id')::bigint,
        slug = p_payload ->> 'slug',
        name_th = p_payload ->> 'name_th',
        name_en = p_payload ->> 'name_en',
        description_th = p_payload ->> 'description_th',
        description_en = p_payload ->> 'description_en',
        latitude = (p_payload ->> 'latitude')::numeric,
        longitude = (p_payload ->> 'longitude')::numeric,
        address_text = p_payload ->> 'address_text',
        opening_hours = p_payload ->> 'opening_hours',
        contact_info = p_payload ->> 'contact_info',
        is_active = coalesce((p_payload ->> 'is_active')::boolean, true),
        updated_at = now()
    WHERE restaurant_id = p_restaurant_id;

    IF NOT FOUND THEN RAISE EXCEPTION 'RESTAURANT_NOT_FOUND'; END IF;
    PERFORM public.sync_restaurant_categories(p_restaurant_id, p_category_ids, p_is_published);
END;
$$;

CREATE OR REPLACE FUNCTION public.set_restaurant_category_active(
    p_category_id bigint,
    p_is_active boolean
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = pg_catalog, public
AS $$
BEGIN
    IF p_is_active = false AND EXISTS (
        SELECT 1
        FROM public.restaurant_category_assignments target
        JOIN public.restaurants restaurant
          ON restaurant.restaurant_id = target.restaurant_id
        WHERE target.category_id = p_category_id
          AND restaurant.is_published = true
          AND restaurant.is_active = true
          AND NOT EXISTS (
              SELECT 1
              FROM public.restaurant_category_assignments alternative
              JOIN public.restaurant_categories category
                ON category.category_id = alternative.category_id
              WHERE alternative.restaurant_id = target.restaurant_id
                AND alternative.category_id <> p_category_id
                AND category.is_active = true
          )
    ) THEN
        RAISE EXCEPTION 'RESTAURANT_CATEGORY_LAST_ACTIVE';
    END IF;

    UPDATE public.restaurant_categories
    SET is_active = p_is_active,
        updated_at = now()
    WHERE category_id = p_category_id;
    IF NOT FOUND THEN RAISE EXCEPTION 'RESTAURANT_CATEGORY_NOT_FOUND'; END IF;
END;
$$;

CREATE OR REPLACE FUNCTION public.is_public_restaurant_category(p_category_id bigint)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = pg_catalog, public
AS $$
    SELECT EXISTS (
        SELECT 1
        FROM public.restaurant_category_assignments assignment
        WHERE assignment.category_id = p_category_id
          AND public.is_public_restaurant(assignment.restaurant_id)
    );
$$;

CREATE OR REPLACE FUNCTION public.update_restaurant_category(
    p_category_id bigint,
    p_payload jsonb
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = pg_catalog, public
AS $$
BEGIN
    PERFORM public.set_restaurant_category_active(
        p_category_id,
        coalesce((p_payload ->> 'is_active')::boolean, true)
    );
    UPDATE public.restaurant_categories
    SET slug = p_payload ->> 'slug',
        name_th = p_payload ->> 'name_th',
        name_en = p_payload ->> 'name_en',
        section_key = p_payload ->> 'section_key',
        display_order = (p_payload ->> 'display_order')::integer,
        is_featured = coalesce((p_payload ->> 'is_featured')::boolean, false),
        updated_at = now()
    WHERE category_id = p_category_id;
END;
$$;

CREATE OR REPLACE FUNCTION public.list_restaurant_category_usage()
RETURNS TABLE(category_id bigint, restaurant_count bigint)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = pg_catalog, public
AS $$
    SELECT category.category_id, count(assignment.restaurant_id)::bigint
    FROM public.restaurant_categories category
    LEFT JOIN public.restaurant_category_assignments assignment
      ON assignment.category_id = category.category_id
    GROUP BY category.category_id;
$$;

CREATE OR REPLACE FUNCTION public.list_public_restaurant_categories(p_province_en text DEFAULT NULL)
RETURNS TABLE(
    category_id bigint,
    slug varchar,
    name_th varchar,
    name_en varchar,
    section_key varchar,
    display_order integer,
    is_featured boolean,
    restaurant_count bigint
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = pg_catalog, public
AS $$
    SELECT category.category_id,
           category.slug,
           category.name_th,
           category.name_en,
           category.section_key,
           category.display_order,
           category.is_featured,
           count(DISTINCT restaurant.restaurant_id)::bigint
    FROM public.restaurant_categories category
    JOIN public.restaurant_category_assignments assignment
      ON assignment.category_id = category.category_id
    JOIN public.restaurants restaurant
      ON restaurant.restaurant_id = assignment.restaurant_id
    JOIN public.provinces province
      ON province.province_id = restaurant.province_id
    WHERE category.is_active = true
      AND public.is_public_restaurant(restaurant.restaurant_id)
      AND (p_province_en IS NULL OR province.province_name_en = p_province_en)
    GROUP BY category.category_id
    ORDER BY category.display_order, category.category_id;
$$;

REVOKE ALL ON FUNCTION public.sync_restaurant_categories(bigint, bigint[], boolean)
    FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.sync_restaurant_categories(bigint, bigint[], boolean)
    TO service_role;
REVOKE ALL ON FUNCTION public.create_restaurant_with_categories(jsonb, bigint[], boolean)
    FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.create_restaurant_with_categories(jsonb, bigint[], boolean)
    TO service_role;
REVOKE ALL ON FUNCTION public.update_restaurant_with_categories(bigint, jsonb, bigint[], boolean)
    FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.update_restaurant_with_categories(bigint, jsonb, bigint[], boolean)
    TO service_role;
REVOKE ALL ON FUNCTION public.set_restaurant_category_active(bigint, boolean)
    FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.set_restaurant_category_active(bigint, boolean)
    TO service_role;
REVOKE ALL ON FUNCTION public.is_public_restaurant_category(bigint) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.is_public_restaurant_category(bigint)
    TO anon, authenticated, service_role;
REVOKE ALL ON FUNCTION public.update_restaurant_category(bigint, jsonb)
    FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.update_restaurant_category(bigint, jsonb)
    TO service_role;
REVOKE ALL ON FUNCTION public.list_restaurant_category_usage() FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.list_restaurant_category_usage() TO service_role;
REVOKE ALL ON FUNCTION public.list_public_restaurant_categories(text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.list_public_restaurant_categories(text)
    TO anon, authenticated, service_role;

ALTER TABLE public.restaurant_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.restaurant_category_assignments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can read active restaurant categories"
ON public.restaurant_categories FOR SELECT TO anon, authenticated
USING (
    is_active = true
    AND public.is_public_restaurant_category(category_id)
);

CREATE POLICY "Public can read public restaurant category assignments"
ON public.restaurant_category_assignments FOR SELECT TO anon, authenticated
USING (
    public.is_public_restaurant(restaurant_id)
    AND EXISTS (
        SELECT 1
        FROM public.restaurant_categories category
        WHERE category.category_id = restaurant_category_assignments.category_id
          AND category.is_active = true
    )
);

COMMIT;
