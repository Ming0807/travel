-- Migration: 20260813002000_add_attraction_related_content_settings
-- Purpose: Store explicit related-content modes and provide an atomic,
--          validated sync RPC without changing the legacy RPC contract.
-- This migration is additive and does not delete content or relation rows.

BEGIN;

CREATE TABLE public.attraction_related_content_settings (
    attraction_id bigint NOT NULL
        REFERENCES public.attractions(attraction_id) ON DELETE CASCADE,
    content_type varchar(20) NOT NULL
        CHECK (content_type IN ('attractions', 'restaurants', 'accommodations', 'stories')),
    mode varchar(20) NOT NULL DEFAULT 'automatic'
        CHECK (mode IN ('automatic', 'manual', 'hybrid', 'hidden')),
    max_items smallint NOT NULL DEFAULT 4
        CHECK (max_items BETWEEN 1 AND 8),
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now(),
    PRIMARY KEY (attraction_id, content_type)
);

COMMENT ON TABLE public.attraction_related_content_settings IS
    'Per-attraction related-content display mode. Missing rows remain backward-compatible and are resolved as automatic or manual from legacy relation rows.';

COMMENT ON COLUMN public.attraction_related_content_settings.mode IS
    'automatic ranks eligible candidates, manual shows ordered relations, hybrid combines both, hidden suppresses the public section while retaining curated relations.';

COMMENT ON COLUMN public.attraction_related_content_settings.max_items IS
    'Maximum public cards for this content type; application and database constrain the value to 1 through 8.';

CREATE INDEX idx_arcs_settings_content_type
    ON public.attraction_related_content_settings(content_type, attraction_id);

-- Reverse indexes keep candidate validation, cleanup, and future reverse
-- relationship views from scanning each junction table by source only.
CREATE INDEX idx_ara_related_attraction_id
    ON public.attraction_related_attractions(related_attraction_id, attraction_id);
CREATE INDEX idx_arr_restaurant_id
    ON public.attraction_related_restaurants(restaurant_id, attraction_id);
CREATE INDEX idx_arac_accommodation_id
    ON public.attraction_related_accommodations(accommodation_id, attraction_id);
CREATE INDEX idx_ars_story_id
    ON public.attraction_related_stories(story_id, attraction_id);

-- Existing databases may contain a legacy self-link. NOT VALID preserves that
-- row for review while enforcing the rule for every new or updated row.
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM pg_constraint
        WHERE conrelid = 'public.attraction_related_attractions'::regclass
          AND conname = 'attraction_related_attractions_no_self_link'
    ) THEN
        ALTER TABLE public.attraction_related_attractions
            ADD CONSTRAINT attraction_related_attractions_no_self_link
            CHECK (attraction_id <> related_attraction_id)
            NOT VALID;
    END IF;
END
$$;

-- Every existing attraction gets an explicit row. Existing relations remain
-- authoritative; attractions without relations retain the automatic default.
INSERT INTO public.attraction_related_content_settings
    (attraction_id, content_type, mode, max_items)
SELECT
    attraction.attraction_id,
    content_type.content_type,
    CASE
        WHEN content_type.content_type = 'attractions' AND EXISTS (
            SELECT 1 FROM public.attraction_related_attractions relation
            WHERE relation.attraction_id = attraction.attraction_id
        ) THEN 'manual'
        WHEN content_type.content_type = 'restaurants' AND EXISTS (
            SELECT 1 FROM public.attraction_related_restaurants relation
            WHERE relation.attraction_id = attraction.attraction_id
        ) THEN 'manual'
        WHEN content_type.content_type = 'accommodations' AND EXISTS (
            SELECT 1 FROM public.attraction_related_accommodations relation
            WHERE relation.attraction_id = attraction.attraction_id
        ) THEN 'manual'
        WHEN content_type.content_type = 'stories' AND EXISTS (
            SELECT 1 FROM public.attraction_related_stories relation
            WHERE relation.attraction_id = attraction.attraction_id
        ) THEN 'manual'
        ELSE 'automatic'
    END,
    CASE WHEN content_type.content_type = 'stories' THEN 3 ELSE 4 END
FROM public.attractions attraction
CROSS JOIN (
    VALUES
        ('attractions'::varchar(20)),
        ('restaurants'::varchar(20)),
        ('accommodations'::varchar(20)),
        ('stories'::varchar(20))
) AS content_type(content_type)
ON CONFLICT (attraction_id, content_type) DO NOTHING;

ALTER TABLE public.attraction_related_content_settings ENABLE ROW LEVEL SECURITY;

REVOKE ALL ON TABLE public.attraction_related_content_settings FROM PUBLIC, anon, authenticated;
GRANT SELECT ON TABLE public.attraction_related_content_settings TO anon, authenticated;

CREATE POLICY "Public can read live attraction related-content settings"
    ON public.attraction_related_content_settings
    FOR SELECT TO anon, authenticated
    USING (public.is_public_attraction(attraction_id));

-- The service-role boundary is the only mutation path. There are deliberately
-- no direct client INSERT/UPDATE/DELETE policies for this control-plane table.

CREATE OR REPLACE FUNCTION public.sync_attraction_related_content_v2(
    p_attraction_id bigint,
    p_entity_type text,
    p_related_ids bigint[] DEFAULT ARRAY[]::bigint[],
    p_mode text DEFAULT 'manual',
    p_max_items smallint DEFAULT 4
) RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = pg_catalog, public
AS $$
DECLARE
    v_table_name text;
    v_fk_column text;
    v_ids bigint[] := COALESCE(p_related_ids, ARRAY[]::bigint[]);
    v_unique_ids bigint[];
    v_inserted integer := 0;
BEGIN
    IF p_attraction_id IS NULL OR NOT EXISTS (
        SELECT 1 FROM public.attractions
        WHERE attraction_id = p_attraction_id
    ) THEN
        RAISE EXCEPTION USING
            ERRCODE = '23503',
            MESSAGE = 'Source attraction does not exist';
    END IF;

    CASE p_entity_type
        WHEN 'attractions' THEN
            v_table_name := 'attraction_related_attractions';
            v_fk_column := 'related_attraction_id';
        WHEN 'restaurants' THEN
            v_table_name := 'attraction_related_restaurants';
            v_fk_column := 'restaurant_id';
        WHEN 'accommodations' THEN
            v_table_name := 'attraction_related_accommodations';
            v_fk_column := 'accommodation_id';
        WHEN 'stories' THEN
            v_table_name := 'attraction_related_stories';
            v_fk_column := 'story_id';
        ELSE
            RAISE EXCEPTION USING
                ERRCODE = '22P02',
                MESSAGE = 'Unsupported related-content type';
    END CASE;

    IF p_mode IS NULL OR p_mode NOT IN ('automatic', 'manual', 'hybrid', 'hidden') THEN
        RAISE EXCEPTION USING
            ERRCODE = '22P02',
            MESSAGE = 'Unsupported related-content mode';
    END IF;

    IF p_max_items IS NULL OR p_max_items < 1 OR p_max_items > 8 THEN
        RAISE EXCEPTION USING
            ERRCODE = '22003',
            MESSAGE = 'max_items must be between 1 and 8';
    END IF;

    IF EXISTS (
        SELECT 1 FROM unnest(v_ids) AS item(id)
        WHERE item.id IS NULL
    ) THEN
        RAISE EXCEPTION USING
            ERRCODE = '22004',
            MESSAGE = 'Related-content IDs cannot contain null values';
    END IF;

    -- DISTINCT is intentionally ordered by first occurrence so the editor's
    -- order survives duplicate input without relying on array sorting.
    SELECT COALESCE(array_agg(deduped.id ORDER BY deduped.first_position), ARRAY[]::bigint[])
    INTO v_unique_ids
    FROM (
        SELECT item.id, min(item.ordinality) AS first_position
        FROM unnest(v_ids) WITH ORDINALITY AS item(id, ordinality)
        GROUP BY item.id
    ) AS deduped;

    IF p_entity_type = 'attractions' AND EXISTS (
        SELECT 1 FROM unnest(v_unique_ids) AS item(id)
        WHERE item.id = p_attraction_id
    ) THEN
        RAISE EXCEPTION USING
            ERRCODE = '23514',
            MESSAGE = 'An attraction cannot relate to itself';
    END IF;

    IF p_entity_type = 'attractions' AND EXISTS (
        SELECT 1
        FROM unnest(v_unique_ids) AS item(id)
        WHERE NOT EXISTS (
            SELECT 1 FROM public.attractions target
            WHERE target.attraction_id = item.id
        )
    ) THEN
        RAISE EXCEPTION USING ERRCODE = '23503', MESSAGE = 'Related attraction does not exist';
    ELSIF p_entity_type = 'restaurants' AND EXISTS (
        SELECT 1
        FROM unnest(v_unique_ids) AS item(id)
        WHERE NOT EXISTS (
            SELECT 1 FROM public.restaurants target
            WHERE target.restaurant_id = item.id
        )
    ) THEN
        RAISE EXCEPTION USING ERRCODE = '23503', MESSAGE = 'Related restaurant does not exist';
    ELSIF p_entity_type = 'accommodations' AND EXISTS (
        SELECT 1
        FROM unnest(v_unique_ids) AS item(id)
        WHERE NOT EXISTS (
            SELECT 1 FROM public.accommodations target
            WHERE target.accommodation_id = item.id
        )
    ) THEN
        RAISE EXCEPTION USING ERRCODE = '23503', MESSAGE = 'Related accommodation does not exist';
    ELSIF p_entity_type = 'stories' AND EXISTS (
        SELECT 1
        FROM unnest(v_unique_ids) AS item(id)
        WHERE NOT EXISTS (
            SELECT 1 FROM public.travel_stories target
            WHERE target.story_id = item.id
        )
    ) THEN
        RAISE EXCEPTION USING ERRCODE = '23503', MESSAGE = 'Related story does not exist';
    END IF;

    -- All modes persist the submitted curated order. Hidden controls public
    -- rendering only; it must not turn a real editor update into a no-op.
    EXECUTE format('DELETE FROM public.%I WHERE attraction_id = $1', v_table_name)
    USING p_attraction_id;

    IF cardinality(v_unique_ids) > 0 THEN
        EXECUTE format(
            'INSERT INTO public.%I (attraction_id, %I, display_order)
             SELECT $1, item.id, item.ordinality::integer
             FROM unnest($2) WITH ORDINALITY AS item(id, ordinality)',
            v_table_name,
            v_fk_column
        ) USING p_attraction_id, v_unique_ids;
        GET DIAGNOSTICS v_inserted = ROW_COUNT;
    END IF;

    INSERT INTO public.attraction_related_content_settings
        (attraction_id, content_type, mode, max_items, updated_at)
    VALUES
        (p_attraction_id, p_entity_type, p_mode, p_max_items, now())
    ON CONFLICT (attraction_id, content_type) DO UPDATE
    SET mode = EXCLUDED.mode,
        max_items = EXCLUDED.max_items,
        updated_at = EXCLUDED.updated_at;

    RETURN jsonb_build_object(
        'success', true,
        'attraction_id', p_attraction_id,
        'content_type', p_entity_type,
        'mode', p_mode,
        'max_items', p_max_items,
        'curated_count', v_inserted
    );
END;
$$;

ALTER FUNCTION public.sync_attraction_related_content_v2(bigint, text, bigint[], text, smallint)
    OWNER TO postgres;
REVOKE ALL ON FUNCTION public.sync_attraction_related_content_v2(bigint, text, bigint[], text, smallint)
    FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.sync_attraction_related_content_v2(bigint, text, bigint[], text, smallint)
    TO service_role;

COMMIT;
