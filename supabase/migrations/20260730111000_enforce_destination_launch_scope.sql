-- Enforce the public Yala launch boundary at the database layer.
-- Service-role repositories must repeat these checks because service_role bypasses RLS.

BEGIN;

CREATE OR REPLACE FUNCTION public.is_live_destination_province(p_province_id bigint)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = pg_catalog, public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.provinces province
    WHERE province.province_id = p_province_id
      AND province.is_active = true
      AND province.destination_status = 'live'
  );
$$;

CREATE OR REPLACE FUNCTION public.is_public_attraction(p_attraction_id bigint)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = pg_catalog, public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.attractions attraction
    WHERE attraction.attraction_id = p_attraction_id
      AND attraction.is_active = true
      AND attraction.is_published = true
      AND public.is_live_destination_province(attraction.province_id)
  );
$$;

CREATE OR REPLACE FUNCTION public.is_public_restaurant(p_restaurant_id bigint)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = pg_catalog, public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.restaurants restaurant
    WHERE restaurant.restaurant_id = p_restaurant_id
      AND restaurant.is_active = true
      AND restaurant.is_published = true
      AND public.is_live_destination_province(restaurant.province_id)
  );
$$;

CREATE OR REPLACE FUNCTION public.is_public_accommodation(p_accommodation_id bigint)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = pg_catalog, public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.accommodations accommodation
    WHERE accommodation.accommodation_id = p_accommodation_id
      AND accommodation.is_active = true
      AND accommodation.is_published = true
      AND public.is_live_destination_province(accommodation.province_id)
  );
$$;

CREATE OR REPLACE FUNCTION public.is_public_story(p_story_id bigint)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = pg_catalog, public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.travel_stories story
    WHERE story.story_id = p_story_id
      AND story.status = 'published'
      AND story.is_published = true
      AND story.archived_at IS NULL
      AND story.geographic_scope = 'province'
      AND (
        story.province_id IS NULL
        OR public.is_live_destination_province(story.province_id)
      )
  );
$$;

CREATE OR REPLACE FUNCTION public.is_public_photo_spot(
  p_photo_spot_id bigint,
  p_attraction_id bigint
)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = pg_catalog, public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.photo_spots photo_spot
    WHERE photo_spot.photo_spot_id = p_photo_spot_id
      AND photo_spot.attraction_id = p_attraction_id
      AND photo_spot.is_active = true
      AND public.is_public_attraction(photo_spot.attraction_id)
  );
$$;

CREATE OR REPLACE FUNCTION public.is_public_route(p_route_id bigint)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = pg_catalog, public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.suggested_routes route
    WHERE route.route_id = p_route_id
      AND route.is_active = true
      AND route.is_published = true
      AND EXISTS (
        SELECT 1
        FROM public.suggested_route_stops route_stop
        WHERE route_stop.route_id = route.route_id
      )
      AND NOT EXISTS (
        SELECT 1
        FROM public.suggested_route_stops route_stop
        JOIN public.attractions attraction
          ON attraction.attraction_id = route_stop.attraction_id
        JOIN public.provinces province
          ON province.province_id = attraction.province_id
        WHERE route_stop.route_id = route.route_id
          AND (
            attraction.is_active <> true
            OR attraction.is_published <> true
            OR province.is_active <> true
            OR province.destination_status <> 'live'
          )
      )
  );
$$;

ALTER FUNCTION public.is_live_destination_province(bigint) OWNER TO postgres;
ALTER FUNCTION public.is_public_attraction(bigint) OWNER TO postgres;
ALTER FUNCTION public.is_public_restaurant(bigint) OWNER TO postgres;
ALTER FUNCTION public.is_public_accommodation(bigint) OWNER TO postgres;
ALTER FUNCTION public.is_public_story(bigint) OWNER TO postgres;
ALTER FUNCTION public.is_public_photo_spot(bigint, bigint) OWNER TO postgres;
ALTER FUNCTION public.is_public_route(bigint) OWNER TO postgres;

REVOKE ALL ON FUNCTION public.is_live_destination_province(bigint) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.is_public_attraction(bigint) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.is_public_restaurant(bigint) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.is_public_accommodation(bigint) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.is_public_story(bigint) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.is_public_photo_spot(bigint, bigint) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.is_public_route(bigint) FROM PUBLIC;

GRANT EXECUTE ON FUNCTION public.is_live_destination_province(bigint) TO anon, authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.is_public_attraction(bigint) TO anon, authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.is_public_restaurant(bigint) TO anon, authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.is_public_accommodation(bigint) TO anon, authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.is_public_story(bigint) TO anon, authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.is_public_photo_spot(bigint, bigint) TO anon, authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.is_public_route(bigint) TO anon, authenticated, service_role;

DROP POLICY IF EXISTS "Public can read active districts" ON public.districts;
CREATE POLICY "Public can read active districts"
ON public.districts FOR SELECT TO anon, authenticated
USING (
  is_active = true
  AND public.is_live_destination_province(province_id)
);

DROP POLICY IF EXISTS "Public can read published attractions" ON public.attractions;
CREATE POLICY "Public can read published attractions"
ON public.attractions FOR SELECT TO anon, authenticated
USING (public.is_public_attraction(attraction_id));

DROP POLICY IF EXISTS "Public can read active photo spots" ON public.photo_spots;
CREATE POLICY "Public can read active photo spots"
ON public.photo_spots FOR SELECT TO anon, authenticated
USING (public.is_public_photo_spot(photo_spot_id, attraction_id));

DROP POLICY IF EXISTS "Public can read active checkin codes" ON public.checkin_codes;
CREATE POLICY "Public can read active checkin codes"
ON public.checkin_codes FOR SELECT TO anon, authenticated
USING (
  is_active = true
  AND (starts_at IS NULL OR starts_at <= now())
  AND (ends_at IS NULL OR ends_at >= now())
  AND public.is_public_attraction(attraction_id)
  AND (
    photo_spot_id IS NULL
    OR public.is_public_photo_spot(photo_spot_id, attraction_id)
  )
);

DROP POLICY IF EXISTS "Public can read published routes" ON public.suggested_routes;
CREATE POLICY "Public can read published routes"
ON public.suggested_routes FOR SELECT TO anon, authenticated
USING (public.is_public_route(route_id));

DROP POLICY IF EXISTS "Public can read route stops" ON public.suggested_route_stops;
CREATE POLICY "Public can read route stops"
ON public.suggested_route_stops FOR SELECT TO anon, authenticated
USING (
  public.is_public_route(route_id)
  AND public.is_public_attraction(attraction_id)
);

DROP POLICY IF EXISTS "Public can read published restaurants" ON public.restaurants;
CREATE POLICY "Public can read published restaurants"
ON public.restaurants FOR SELECT TO anon, authenticated
USING (public.is_public_restaurant(restaurant_id));

DROP POLICY IF EXISTS "Public can read restaurant attractions" ON public.restaurant_attractions;
CREATE POLICY "Public can read restaurant attractions"
ON public.restaurant_attractions FOR SELECT TO anon, authenticated
USING (
  public.is_public_restaurant(restaurant_id)
  AND public.is_public_attraction(attraction_id)
);

DROP POLICY IF EXISTS "Public can read published accommodations" ON public.accommodations;
CREATE POLICY "Public can read published accommodations"
ON public.accommodations FOR SELECT TO anon, authenticated
USING (public.is_public_accommodation(accommodation_id));

DROP POLICY IF EXISTS "Public can read curated relations" ON public.attraction_related_attractions;
CREATE POLICY "Public can read curated relations"
ON public.attraction_related_attractions FOR SELECT TO anon, authenticated
USING (
  public.is_public_attraction(attraction_id)
  AND public.is_public_attraction(related_attraction_id)
);

DROP POLICY IF EXISTS "Public can read curated relations" ON public.attraction_related_restaurants;
CREATE POLICY "Public can read curated relations"
ON public.attraction_related_restaurants FOR SELECT TO anon, authenticated
USING (
  public.is_public_attraction(attraction_id)
  AND public.is_public_restaurant(restaurant_id)
);

DROP POLICY IF EXISTS "Public can read curated relations" ON public.attraction_related_accommodations;
CREATE POLICY "Public can read curated relations"
ON public.attraction_related_accommodations FOR SELECT TO anon, authenticated
USING (
  public.is_public_attraction(attraction_id)
  AND public.is_public_accommodation(accommodation_id)
);

DROP POLICY IF EXISTS "Public can read curated relations" ON public.attraction_related_stories;
CREATE POLICY "Public can read curated relations"
ON public.attraction_related_stories FOR SELECT TO anon, authenticated
USING (
  public.is_public_attraction(attraction_id)
  AND public.is_public_story(story_id)
);

DROP POLICY IF EXISTS "Public can view published stories" ON public.travel_stories;
CREATE POLICY "Public can view published stories"
ON public.travel_stories FOR SELECT TO anon, authenticated
USING (public.is_public_story(story_id));

DROP POLICY IF EXISTS "Public can read published story topic links" ON public.story_topic_links;
CREATE POLICY "Public can read published story topic links"
ON public.story_topic_links FOR SELECT TO anon, authenticated
USING (
  public.is_public_story(story_id)
  AND EXISTS (
    SELECT 1
    FROM public.story_topics topic
    WHERE topic.topic_id = story_topic_links.topic_id
      AND topic.is_active = true
  )
);

DROP POLICY IF EXISTS "Public can read published story tag links" ON public.story_tag_links;
CREATE POLICY "Public can read published story tag links"
ON public.story_tag_links FOR SELECT TO anon, authenticated
USING (
  public.is_public_story(story_id)
  AND EXISTS (
    SELECT 1
    FROM public.story_tags tag
    WHERE tag.tag_id = story_tag_links.tag_id
      AND tag.is_active = true
  )
);

DROP POLICY IF EXISTS "Public can read published story recommendations" ON public.story_recommendations;
CREATE POLICY "Public can read published story recommendations"
ON public.story_recommendations FOR SELECT TO anon, authenticated
USING (
  is_active = true
  AND public.is_public_story(source_story_id)
  AND public.is_public_story(target_story_id)
);

DROP POLICY IF EXISTS "Public can read approved reviews" ON public.reviews;
CREATE POLICY "Public can read approved reviews"
ON public.reviews FOR SELECT TO anon, authenticated
USING (
  is_approved = true
  AND is_published = true
  AND deleted_at IS NULL
  AND (attraction_id IS NOT NULL OR restaurant_id IS NOT NULL)
  AND (attraction_id IS NULL OR public.is_public_attraction(attraction_id))
  AND (restaurant_id IS NULL OR public.is_public_restaurant(restaurant_id))
);

DROP POLICY IF EXISTS "Allow public read access to content_media" ON public.content_media;
CREATE POLICY "Allow public read access to content_media"
ON public.content_media FOR SELECT TO anon, authenticated
USING (
  is_active = true
  AND lifecycle_status = 'active'
  AND (
    (attraction_id IS NOT NULL AND public.is_public_attraction(attraction_id))
    OR (restaurant_id IS NOT NULL AND public.is_public_restaurant(restaurant_id))
    OR (accommodation_id IS NOT NULL AND public.is_public_accommodation(accommodation_id))
    OR (story_id IS NOT NULL AND public.is_public_story(story_id))
    OR (route_id IS NOT NULL AND public.is_public_route(route_id))
  )
);

DROP POLICY IF EXISTS "Public can read active stamp definitions" ON public.stamp_definitions;
CREATE POLICY "Public can read active stamp definitions"
ON public.stamp_definitions FOR SELECT TO anon, authenticated
USING (
  is_active = true
  AND public.is_public_attraction(attraction_id)
);

DROP POLICY IF EXISTS "Public can read default certificate templates" ON public.certificate_templates;
CREATE POLICY "Public can read default certificate templates"
ON public.certificate_templates FOR SELECT TO anon, authenticated
USING (
  is_active = true
  AND (
    attraction_id IS NULL
    OR public.is_public_attraction(attraction_id)
  )
);

COMMIT;
