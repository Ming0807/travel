-- Migration: 20260813001000_harden_attraction_category_publication
-- Purpose: Prevent every direct write path from publishing an attraction without a primary category.

BEGIN;

CREATE OR REPLACE FUNCTION public.enforce_published_attraction_category()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = pg_catalog, public
AS $$
BEGIN
    IF NEW.is_published = true AND NEW.attraction_type_id IS NULL THEN
        RAISE EXCEPTION 'ATTRACTION_PRIMARY_CATEGORY_REQUIRED';
    END IF;
    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS enforce_published_attraction_category ON public.attractions;
CREATE TRIGGER enforce_published_attraction_category
    BEFORE INSERT OR UPDATE OF is_published, attraction_type_id ON public.attractions
    FOR EACH ROW EXECUTE FUNCTION public.enforce_published_attraction_category();

ALTER FUNCTION public.enforce_published_attraction_category() OWNER TO postgres;
REVOKE ALL ON FUNCTION public.enforce_published_attraction_category() FROM PUBLIC, anon, authenticated;

COMMIT;
