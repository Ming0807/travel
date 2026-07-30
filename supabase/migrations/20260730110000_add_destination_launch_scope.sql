-- Separate destination launch availability from province master data used by
-- tourist origin profiles. This migration is intentionally non-destructive.

BEGIN;

ALTER TABLE public.provinces
  ADD COLUMN IF NOT EXISTS destination_status text NOT NULL DEFAULT 'hidden',
  ADD COLUMN IF NOT EXISTS destination_display_order smallint;

ALTER TABLE public.provinces
  DROP CONSTRAINT IF EXISTS provinces_destination_status_check,
  DROP CONSTRAINT IF EXISTS provinces_destination_display_order_check;

ALTER TABLE public.provinces
  ADD CONSTRAINT provinces_destination_status_check
    CHECK (destination_status IN ('hidden', 'pilot', 'live', 'retired')),
  ADD CONSTRAINT provinces_destination_display_order_check
    CHECK (destination_display_order IS NULL OR destination_display_order > 0);

UPDATE public.provinces
SET destination_status = 'hidden',
    destination_display_order = NULL;

DO $$
BEGIN
  IF (
    SELECT count(*)
    FROM public.provinces
    WHERE lower(province_name_en) = 'yala'
       OR province_name_th = 'ยะลา'
  ) <> 1 THEN
    RAISE EXCEPTION 'Expected exactly one Yala province row before enabling destination launch scope';
  END IF;
END
$$;

UPDATE public.provinces
SET destination_status = 'live',
    destination_display_order = 1
WHERE province_name_en = 'Yala'
   OR province_name_th = 'ยะลา';

DO $$
BEGIN
  IF (
    SELECT count(*)
    FROM public.provinces
    WHERE destination_status = 'live'
  ) <> 1 THEN
    RAISE EXCEPTION 'Destination launch scope must contain exactly one live province';
  END IF;
END
$$;

CREATE INDEX IF NOT EXISTS idx_provinces_destination_launch
  ON public.provinces(destination_status, destination_display_order, province_id)
  WHERE is_active = true;

CREATE INDEX IF NOT EXISTS idx_attractions_live_destination_lookup
  ON public.attractions(province_id, is_published, is_active, attraction_id);

COMMENT ON COLUMN public.provinces.destination_status IS
  'Destination publishing lifecycle only. Never use this column to filter tourist origin geography.';
COMMENT ON COLUMN public.provinces.destination_display_order IS
  'Display order for destination selectors; unrelated to tourist origin geography.';

COMMIT;
