-- Migration: 20260524000000_create_reviews_module
-- Description: Reviews system for attractions and restaurants with moderation workflow

-- ==========================================
-- 1. REVIEWS TABLE
-- ==========================================
CREATE TABLE public.reviews (
    review_id bigint generated always as identity primary key,
    tourist_id uuid not null references public.tourists(tourist_id) on delete cascade,
    visit_id uuid references public.visits(visit_id) on delete set null,
    attraction_id bigint references public.attractions(attraction_id) on delete cascade,
    restaurant_id bigint references public.restaurants(restaurant_id) on delete cascade,
    rating integer not null check (rating >= 1 and rating <= 5),
    title varchar(255),
    comment text,
    is_approved boolean not null default false,
    is_published boolean not null default false,
    moderated_by uuid references public.admin_users(admin_id),
    moderated_at timestamptz,
    created_at timestamptz not null default now(),
    updated_at timestamptz,
    deleted_at timestamptz
);

-- Ensure at least one target (attraction or restaurant) is specified
ALTER TABLE public.reviews
ADD CONSTRAINT reviews_target_check
CHECK (coalesce(attraction_id::text, restaurant_id::text) is not null);

-- Prevent duplicate reviews from the same tourist for the same attraction
CREATE UNIQUE INDEX idx_reviews_unique_attraction
ON public.reviews(tourist_id, attraction_id)
WHERE deleted_at is null and attraction_id is not null;

-- Prevent duplicate reviews from the same tourist for the same restaurant
CREATE UNIQUE INDEX idx_reviews_unique_restaurant
ON public.reviews(tourist_id, restaurant_id)
WHERE deleted_at is null and restaurant_id is not null;

-- Performance indexes
CREATE INDEX idx_reviews_attraction_id ON public.reviews(attraction_id) WHERE deleted_at is null;
CREATE INDEX idx_reviews_restaurant_id ON public.reviews(restaurant_id) WHERE deleted_at is null;
CREATE INDEX idx_reviews_tourist_id ON public.reviews(tourist_id);
CREATE INDEX idx_reviews_rating ON public.reviews(rating);
CREATE INDEX idx_reviews_created_at ON public.reviews(created_at desc);
CREATE INDEX idx_reviews_moderation ON public.reviews(is_approved, is_published) WHERE deleted_at is null;

-- ==========================================
-- 2. ENABLE RLS
-- ==========================================
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;

-- Public can read approved and published reviews
CREATE POLICY "Public can read approved reviews"
ON public.reviews FOR SELECT
USING (is_approved = true AND is_published = true AND deleted_at is null);

-- Tourists can submit their own reviews
CREATE POLICY "Tourists can insert their own reviews"
ON public.reviews FOR INSERT
WITH CHECK (auth.uid()::text = tourist_id::text);

-- Tourists can view their own reviews
CREATE POLICY "Tourists can view own reviews"
ON public.reviews FOR SELECT
USING (auth.uid()::text = tourist_id::text);

-- ==========================================
-- 3. UPDATED_AT TRIGGER
-- ==========================================
CREATE TRIGGER set_updated_at
BEFORE UPDATE ON public.reviews
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();
