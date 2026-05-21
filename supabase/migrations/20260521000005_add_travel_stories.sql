-- Migration: 20260521000005_add_travel_stories
-- Description: Add travel stories table for the articles/stories page

CREATE TABLE public.travel_stories (
    story_id bigint generated always as identity primary key,
    slug varchar(200) not null unique,
    title varchar(255) not null,
    excerpt text,
    content text,
    province_id bigint references public.provinces(province_id),
    category varchar(100),
    image_url text,
    is_published boolean not null default false,
    published_at timestamptz,
    created_at timestamptz not null default now(),
    updated_at timestamptz
);

-- Trigger for updated_at
CREATE TRIGGER set_updated_at_travel_stories
BEFORE UPDATE ON public.travel_stories
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- RLS
ALTER TABLE public.travel_stories ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can view published stories" ON public.travel_stories
FOR SELECT USING (is_published = true);

CREATE POLICY "Admins can manage all stories" ON public.travel_stories
FOR ALL USING (
    (auth.jwt() ->> 'role' = 'super_admin')
);
