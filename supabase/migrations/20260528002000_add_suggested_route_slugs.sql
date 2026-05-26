-- Migration: 20260528002000_add_suggested_route_slugs
-- Description: Add stable public slugs for suggested routes so admin preview links match /routes/[slug].

ALTER TABLE public.suggested_routes
ADD COLUMN IF NOT EXISTS slug varchar(200);

WITH generated AS (
  SELECT
    route_id,
    NULLIF(
      trim(both '-' from lower(regexp_replace(coalesce(nullif(name_en, ''), name_th, route_id::text), '[^a-zA-Z0-9]+', '-', 'g'))),
      ''
    ) AS generated_slug
  FROM public.suggested_routes
)
UPDATE public.suggested_routes r
SET slug = coalesce(g.generated_slug, 'route-' || r.route_id::text)
FROM generated g
WHERE r.route_id = g.route_id
  AND (r.slug IS NULL OR trim(r.slug) = '');

UPDATE public.suggested_routes
SET slug = 'route-' || route_id::text
WHERE slug IS NULL OR trim(slug) = '';

ALTER TABLE public.suggested_routes
ALTER COLUMN slug SET NOT NULL;

CREATE UNIQUE INDEX IF NOT EXISTS uq_suggested_routes_slug
ON public.suggested_routes(slug);
