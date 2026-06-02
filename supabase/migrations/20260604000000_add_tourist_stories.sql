-- Migration: 20260604000000_add_tourist_stories
-- Description: Add UGC fields (author_type, tourist_id, status) to travel_stories and update RLS

-- 1. Add new columns
ALTER TABLE public.travel_stories 
  ADD COLUMN IF NOT EXISTS author_type varchar(50) not null default 'admin' check (author_type in ('admin', 'tourist')),
  ADD COLUMN IF NOT EXISTS tourist_id uuid references public.tourists(tourist_id) on delete set null,
  ADD COLUMN IF NOT EXISTS status varchar(50) not null default 'draft' check (status in ('draft', 'pending', 'published', 'rejected'));

-- 2. Migrate existing data based on is_published flag
UPDATE public.travel_stories
SET status = CASE WHEN is_published THEN 'published' ELSE 'draft' END;

-- Update RLS for tourists
DROP POLICY IF EXISTS "Tourists can view their own stories" ON public.travel_stories;
CREATE POLICY "Tourists can view their own stories"
ON public.travel_stories
FOR SELECT
USING (auth.uid()::text = tourist_id::text);

DROP POLICY IF EXISTS "Tourists can insert own stories" ON public.travel_stories;
CREATE POLICY "Tourists can insert own stories"
ON public.travel_stories
FOR INSERT
WITH CHECK (
  author_type = 'tourist' 
  AND auth.uid()::text = tourist_id::text
);

DROP POLICY IF EXISTS "Tourists can update own draft/pending stories" ON public.travel_stories;
CREATE POLICY "Tourists can update own draft/pending stories"
ON public.travel_stories
FOR UPDATE
USING (
  auth.uid()::text = tourist_id::text
  AND status IN ('draft', 'pending', 'rejected')
)
WITH CHECK (
  auth.uid()::text = tourist_id::text
  AND author_type = 'tourist'
);

DROP POLICY IF EXISTS "Public can view published stories" ON public.travel_stories;
CREATE POLICY "Public can view published stories" ON public.travel_stories FOR SELECT USING (status = 'published' OR is_published = true);
