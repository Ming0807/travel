-- Story editorial platform foundation.
-- Additive and backward-compatible: public story slugs and travel_stories IDs remain unchanged.

ALTER TABLE public.travel_stories
  ADD COLUMN IF NOT EXISTS content_document jsonb,
  ADD COLUMN IF NOT EXISTS content_schema_version integer NOT NULL DEFAULT 1,
  ADD COLUMN IF NOT EXISTS primary_language varchar(10) NOT NULL DEFAULT 'th',
  ADD COLUMN IF NOT EXISTS geographic_scope varchar(30) NOT NULL DEFAULT 'province',
  ADD COLUMN IF NOT EXISTS seo_title varchar(255),
  ADD COLUMN IF NOT EXISTS seo_description varchar(320),
  ADD COLUMN IF NOT EXISTS scheduled_at timestamptz,
  ADD COLUMN IF NOT EXISTS first_published_at timestamptz,
  ADD COLUMN IF NOT EXISTS archived_at timestamptz,
  ADD COLUMN IF NOT EXISTS reviewed_by uuid REFERENCES public.admin_users(admin_id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS reviewed_at timestamptz,
  ADD COLUMN IF NOT EXISTS reading_minutes integer,
  ADD COLUMN IF NOT EXISTS content_quality_score integer;

-- Remove legacy checks before writing the expanded workflow values.
ALTER TABLE public.travel_stories
  DROP CONSTRAINT IF EXISTS travel_stories_status_check,
  DROP CONSTRAINT IF EXISTS travel_stories_author_workflow_check,
  DROP CONSTRAINT IF EXISTS travel_stories_content_schema_version_check,
  DROP CONSTRAINT IF EXISTS travel_stories_primary_language_check,
  DROP CONSTRAINT IF EXISTS travel_stories_geographic_scope_check,
  DROP CONSTRAINT IF EXISTS travel_stories_reading_minutes_check,
  DROP CONSTRAINT IF EXISTS travel_stories_content_quality_score_check,
  DROP CONSTRAINT IF EXISTS travel_stories_scheduled_at_check;

UPDATE public.travel_stories
SET status = 'submitted'
WHERE author_type = 'tourist' AND status IN ('draft', 'pending');

UPDATE public.travel_stories
SET status = 'in_review'
WHERE author_type = 'admin' AND status = 'pending';

UPDATE public.travel_stories
SET status = 'archived', archived_at = COALESCE(archived_at, now())
WHERE author_type = 'admin' AND status = 'rejected';

UPDATE public.travel_stories
SET first_published_at = COALESCE(first_published_at, published_at, created_at)
WHERE status = 'published' OR is_published = true;

ALTER TABLE public.travel_stories
  ADD CONSTRAINT travel_stories_status_check CHECK (status IN (
    'draft', 'submitted', 'in_review', 'changes_requested', 'approved',
    'scheduled', 'published', 'rejected', 'archived'
  )),
  ADD CONSTRAINT travel_stories_author_workflow_check CHECK (
    (author_type = 'admin' AND status IN (
      'draft', 'in_review', 'approved', 'scheduled', 'published', 'archived'
    ))
    OR
    (author_type = 'tourist' AND status IN (
      'submitted', 'in_review', 'changes_requested', 'approved', 'published', 'rejected', 'archived'
    ))
  ),
  ADD CONSTRAINT travel_stories_content_schema_version_check
    CHECK (content_schema_version > 0),
  ADD CONSTRAINT travel_stories_primary_language_check
    CHECK (primary_language IN ('th', 'en', 'ms')),
  ADD CONSTRAINT travel_stories_geographic_scope_check
    CHECK (geographic_scope IN ('province', 'cross_province')),
  ADD CONSTRAINT travel_stories_reading_minutes_check
    CHECK (reading_minutes IS NULL OR reading_minutes BETWEEN 1 AND 240),
  ADD CONSTRAINT travel_stories_content_quality_score_check
    CHECK (content_quality_score IS NULL OR content_quality_score BETWEEN 0 AND 100),
  ADD CONSTRAINT travel_stories_scheduled_at_check
    CHECK (status <> 'scheduled' OR scheduled_at IS NOT NULL);

CREATE OR REPLACE FUNCTION public.sync_travel_story_publication_state()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  IF NEW.status = 'pending' THEN
    IF NEW.author_type = 'tourist' THEN
      NEW.status := 'submitted';
    ELSE
      NEW.status := 'in_review';
    END IF;
  END IF;

  IF TG_OP = 'INSERT' THEN
    IF NEW.is_published = true AND NEW.status <> 'published' THEN
      NEW.status := 'published';
    END IF;
  ELSIF NEW.status IS NOT DISTINCT FROM OLD.status
    AND NEW.is_published IS DISTINCT FROM OLD.is_published THEN
    IF NEW.is_published THEN
      NEW.status := 'published';
    ELSIF OLD.status = 'published' THEN
      NEW.status := 'draft';
    END IF;
  END IF;

  NEW.is_published := (NEW.status = 'published');

  IF NEW.status = 'published' THEN
    NEW.published_at := COALESCE(NEW.published_at, now());
    NEW.first_published_at := COALESCE(NEW.first_published_at, NEW.published_at, now());
  ELSE
    NEW.published_at := NULL;
  END IF;

  IF NEW.status = 'archived' THEN
    NEW.archived_at := COALESCE(NEW.archived_at, now());
  ELSIF TG_OP = 'UPDATE' AND OLD.status = 'archived' THEN
    NEW.archived_at := NULL;
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS sync_travel_story_publication_state ON public.travel_stories;
CREATE TRIGGER sync_travel_story_publication_state
BEFORE INSERT OR UPDATE OF status, is_published, scheduled_at
ON public.travel_stories
FOR EACH ROW
EXECUTE FUNCTION public.sync_travel_story_publication_state();

CREATE TABLE public.story_topics (
  topic_id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  topic_key varchar(100) NOT NULL UNIQUE,
  name_th varchar(150) NOT NULL,
  name_en varchar(150),
  description text,
  display_order integer NOT NULL DEFAULT 0 CHECK (display_order >= 0),
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz,
  CONSTRAINT story_topics_key_check CHECK (topic_key ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$')
);

CREATE TABLE public.story_tags (
  tag_id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  tag_key varchar(100) NOT NULL UNIQUE,
  name_th varchar(150) NOT NULL,
  name_en varchar(150),
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz,
  CONSTRAINT story_tags_key_check CHECK (tag_key ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$')
);

CREATE TABLE public.story_topic_links (
  story_id bigint NOT NULL REFERENCES public.travel_stories(story_id) ON DELETE CASCADE,
  topic_id bigint NOT NULL REFERENCES public.story_topics(topic_id) ON DELETE RESTRICT,
  is_primary boolean NOT NULL DEFAULT false,
  created_by uuid REFERENCES public.admin_users(admin_id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (story_id, topic_id)
);

INSERT INTO public.story_topics (topic_key, name_th, name_en, display_order, is_active)
VALUES
  ('nature', 'ธรรมชาติ', 'Nature', 10, true),
  ('culture', 'วัฒนธรรมและประวัติศาสตร์', 'Culture and History', 20, true),
  ('food', 'อาหารและวิถีท้องถิ่น', 'Food and Local Life', 30, true),
  ('community', 'ชุมชนและความยั่งยืน', 'Community and Sustainability', 40, true),
  ('travel-guide', 'คู่มือการเดินทาง', 'Travel Guide', 50, true),
  ('faith', 'ศรัทธาและศาสนสถาน', 'Faith and Sacred Places', 60, true),
  ('events', 'เทศกาลและกิจกรรม', 'Events and Activities', 70, true)
ON CONFLICT (topic_key) DO UPDATE
SET name_th = EXCLUDED.name_th,
    name_en = EXCLUDED.name_en,
    display_order = EXCLUDED.display_order;

INSERT INTO public.story_topic_links (story_id, topic_id, is_primary)
SELECT
  story.story_id,
  topic.topic_id,
  true
FROM public.travel_stories story
JOIN public.story_topics topic
  ON topic.topic_key = CASE
    WHEN lower(COALESCE(story.category, '')) ~ 'nature|ธรรมชาติ' THEN 'nature'
    WHEN lower(COALESCE(story.category, '')) ~ 'culture|history|วัฒนธรรม|ประวัติ' THEN 'culture'
    WHEN lower(COALESCE(story.category, '')) ~ 'food|อาหาร' THEN 'food'
    WHEN lower(COALESCE(story.category, '')) ~ 'community|ชุมชน|ยั่งยืน' THEN 'community'
    WHEN lower(COALESCE(story.category, '')) ~ 'faith|religion|ศรัทธา|ศาสนา' THEN 'faith'
    WHEN lower(COALESCE(story.category, '')) ~ 'event|festival|เทศกาล|กิจกรรม' THEN 'events'
    ELSE 'travel-guide'
  END
WHERE NOT EXISTS (
  SELECT 1 FROM public.story_topic_links existing
  WHERE existing.story_id = story.story_id AND existing.is_primary = true
)
ON CONFLICT (story_id, topic_id) DO NOTHING;

CREATE UNIQUE INDEX uq_story_topic_links_primary
  ON public.story_topic_links(story_id)
  WHERE is_primary = true;

CREATE TABLE public.story_tag_links (
  story_id bigint NOT NULL REFERENCES public.travel_stories(story_id) ON DELETE CASCADE,
  tag_id bigint NOT NULL REFERENCES public.story_tags(tag_id) ON DELETE RESTRICT,
  created_by uuid REFERENCES public.admin_users(admin_id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (story_id, tag_id)
);

CREATE TABLE public.story_revisions (
  revision_id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  story_id bigint NOT NULL REFERENCES public.travel_stories(story_id) ON DELETE CASCADE,
  revision_number integer NOT NULL CHECK (revision_number > 0),
  snapshot jsonb NOT NULL CHECK (jsonb_typeof(snapshot) = 'object'),
  content_schema_version integer NOT NULL DEFAULT 1 CHECK (content_schema_version > 0),
  source_action varchar(50) NOT NULL DEFAULT 'save' CHECK (source_action IN (
    'create', 'save', 'submit_review', 'approve', 'schedule', 'publish',
    'unpublish', 'archive', 'restore', 'moderate'
  )),
  change_summary varchar(500),
  created_by uuid REFERENCES public.admin_users(admin_id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (story_id, revision_number)
);

CREATE TABLE public.story_review_events (
  review_event_id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  story_id bigint NOT NULL REFERENCES public.travel_stories(story_id) ON DELETE CASCADE,
  from_status varchar(50) NOT NULL,
  to_status varchar(50) NOT NULL,
  review_note text,
  reviewer_id uuid REFERENCES public.admin_users(admin_id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT story_review_events_note_length_check
    CHECK (review_note IS NULL OR char_length(review_note) <= 2000)
);

CREATE TABLE public.story_recommendations (
  recommendation_id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  source_story_id bigint NOT NULL REFERENCES public.travel_stories(story_id) ON DELETE CASCADE,
  target_story_id bigint NOT NULL REFERENCES public.travel_stories(story_id) ON DELETE CASCADE,
  display_order integer NOT NULL DEFAULT 0 CHECK (display_order >= 0),
  reason varchar(255),
  is_active boolean NOT NULL DEFAULT true,
  created_by uuid REFERENCES public.admin_users(admin_id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz,
  UNIQUE (source_story_id, target_story_id),
  CHECK (source_story_id <> target_story_id)
);

CREATE INDEX idx_travel_stories_workflow
  ON public.travel_stories(author_type, status, updated_at DESC);
CREATE INDEX idx_travel_stories_scheduled
  ON public.travel_stories(scheduled_at)
  WHERE status = 'scheduled';
CREATE INDEX idx_travel_stories_public_feed
  ON public.travel_stories(published_at DESC, province_id, category)
  WHERE status = 'published';
CREATE INDEX idx_story_topic_links_topic
  ON public.story_topic_links(topic_id, story_id);
CREATE INDEX idx_story_tag_links_tag
  ON public.story_tag_links(tag_id, story_id);
CREATE INDEX idx_story_revisions_story_created
  ON public.story_revisions(story_id, created_at DESC);
CREATE INDEX idx_story_review_events_story_created
  ON public.story_review_events(story_id, created_at DESC);
CREATE INDEX idx_story_recommendations_source_order
  ON public.story_recommendations(source_story_id, display_order, target_story_id)
  WHERE is_active = true;

CREATE TRIGGER set_updated_at_story_topics
BEFORE UPDATE ON public.story_topics
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER set_updated_at_story_tags
BEFORE UPDATE ON public.story_tags
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER set_updated_at_story_recommendations
BEFORE UPDATE ON public.story_recommendations
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

ALTER TABLE public.story_topics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.story_tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.story_topic_links ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.story_tag_links ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.story_revisions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.story_review_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.story_recommendations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can read active story topics"
ON public.story_topics FOR SELECT TO anon, authenticated
USING (is_active = true);

CREATE POLICY "Public can read active story tags"
ON public.story_tags FOR SELECT TO anon, authenticated
USING (is_active = true);

CREATE POLICY "Public can read published story topic links"
ON public.story_topic_links FOR SELECT TO anon, authenticated
USING (EXISTS (
  SELECT 1
  FROM public.travel_stories story
  JOIN public.story_topics topic ON topic.topic_id = story_topic_links.topic_id
  WHERE story.story_id = story_topic_links.story_id
    AND story.status = 'published'
    AND topic.is_active = true
));

CREATE POLICY "Public can read published story tag links"
ON public.story_tag_links FOR SELECT TO anon, authenticated
USING (EXISTS (
  SELECT 1
  FROM public.travel_stories story
  JOIN public.story_tags tag ON tag.tag_id = story_tag_links.tag_id
  WHERE story.story_id = story_tag_links.story_id
    AND story.status = 'published'
    AND tag.is_active = true
));

CREATE POLICY "Public can read published story recommendations"
ON public.story_recommendations FOR SELECT TO anon, authenticated
USING (
  is_active = true
  AND EXISTS (
    SELECT 1 FROM public.travel_stories source_story
    WHERE source_story.story_id = story_recommendations.source_story_id
      AND source_story.status = 'published'
  )
  AND EXISTS (
    SELECT 1 FROM public.travel_stories target_story
    WHERE target_story.story_id = story_recommendations.target_story_id
      AND target_story.status = 'published'
  )
);

GRANT SELECT ON public.story_topics, public.story_tags,
  public.story_topic_links, public.story_tag_links, public.story_recommendations
TO anon, authenticated;

INSERT INTO public.permissions (permission_name, description)
VALUES
  ('story.read', 'Read story records'),
  ('story.create', 'Create editorial stories'),
  ('story.update', 'Update story records'),
  ('story.publish', 'Publish approved stories'),
  ('story.unpublish', 'Return published stories to draft'),
  ('story.delete', 'Delete story records when policy allows'),
  ('story.manage', 'Legacy full story management permission'),
  ('story.review', 'Review editorial and tourist story submissions'),
  ('story.schedule', 'Schedule approved editorial stories'),
  ('story.revision_read', 'Read story revision history'),
  ('story.revision_restore', 'Restore a previous story revision'),
  ('story.taxonomy_manage', 'Manage story topics and tags'),
  ('story.recommend_manage', 'Manage curated story recommendations')
ON CONFLICT (permission_name) DO UPDATE
SET description = EXCLUDED.description;

INSERT INTO public.role_permissions (role_id, permission_id)
SELECT r.role_id, p.permission_id
FROM public.roles r
JOIN public.permissions p ON p.permission_name LIKE 'story.%'
WHERE r.role_name IN ('super_admin', 'admin')
ON CONFLICT DO NOTHING;

INSERT INTO public.role_permissions (role_id, permission_id)
SELECT r.role_id, p.permission_id
FROM public.roles r
JOIN public.permissions p ON p.permission_name IN (
  'story.read', 'story.create', 'story.update', 'story.publish', 'story.unpublish'
)
WHERE r.role_name IN ('province_admin', 'attraction_manager')
ON CONFLICT DO NOTHING;

INSERT INTO public.role_permissions (role_id, permission_id)
SELECT r.role_id, p.permission_id
FROM public.roles r
JOIN public.permissions p ON p.permission_name = 'story.read'
WHERE r.role_name = 'viewer'
ON CONFLICT DO NOTHING;
