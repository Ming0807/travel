-- Migration: 20260521120000_database_foundation_hardening
-- Description: Add data quality constraints and indexes needed for
-- database-first development, idempotent seed data, admin CRUD, and dashboards.

-- ==========================================
-- Reference/master data uniqueness for rerunnable DML
-- ==========================================

CREATE UNIQUE INDEX IF NOT EXISTS uq_attraction_types_type_name_en
  ON public.attraction_types(type_name_en);

CREATE UNIQUE INDEX IF NOT EXISTS uq_transport_modes_name_en
  ON public.transport_modes(name_en);

CREATE UNIQUE INDEX IF NOT EXISTS uq_travel_purposes_name_en
  ON public.travel_purposes(name_en);

CREATE UNIQUE INDEX IF NOT EXISTS uq_travel_companions_name_en
  ON public.travel_companions(name_en);

CREATE UNIQUE INDEX IF NOT EXISTS uq_expense_categories_name_en
  ON public.expense_categories(name_en);

CREATE UNIQUE INDEX IF NOT EXISTS uq_spending_ranges_label_en
  ON public.spending_ranges(range_label_en);

CREATE UNIQUE INDEX IF NOT EXISTS uq_age_groups_label
  ON public.age_groups(label);

CREATE UNIQUE INDEX IF NOT EXISTS uq_photo_spots_attraction_spot_name_th
  ON public.photo_spots(attraction_id, spot_name_th);

CREATE UNIQUE INDEX IF NOT EXISTS uq_stamp_definitions_attraction
  ON public.stamp_definitions(attraction_id);

CREATE UNIQUE INDEX IF NOT EXISTS uq_certificate_templates_template_name_language
  ON public.certificate_templates(template_name, language);

CREATE UNIQUE INDEX IF NOT EXISTS uq_suggested_routes_name_en
  ON public.suggested_routes(name_en);

CREATE UNIQUE INDEX IF NOT EXISTS uq_attraction_media_attraction_storage_path
  ON public.attraction_media(attraction_id, storage_path);

-- ==========================================
-- Flow correctness and idempotency
-- ==========================================

CREATE UNIQUE INDEX IF NOT EXISTS uq_certificates_visit
  ON public.certificates(visit_id);

CREATE UNIQUE INDEX IF NOT EXISTS uq_satisfaction_surveys_visit
  ON public.satisfaction_surveys(visit_id);

ALTER TABLE public.checkin_codes
  DROP CONSTRAINT IF EXISTS checkin_codes_date_range_check;

ALTER TABLE public.checkin_codes
  ADD CONSTRAINT checkin_codes_date_range_check
  CHECK (starts_at IS NULL OR ends_at IS NULL OR starts_at <= ends_at);

ALTER TABLE public.attractions
  DROP CONSTRAINT IF EXISTS attractions_latitude_check;

ALTER TABLE public.attractions
  ADD CONSTRAINT attractions_latitude_check
  CHECK (latitude IS NULL OR (latitude >= -90 AND latitude <= 90));

ALTER TABLE public.attractions
  DROP CONSTRAINT IF EXISTS attractions_longitude_check;

ALTER TABLE public.attractions
  ADD CONSTRAINT attractions_longitude_check
  CHECK (longitude IS NULL OR (longitude >= -180 AND longitude <= 180));

ALTER TABLE public.attractions
  DROP CONSTRAINT IF EXISTS attractions_capacity_check;

ALTER TABLE public.attractions
  ADD CONSTRAINT attractions_capacity_check
  CHECK (estimated_capacity_per_day IS NULL OR estimated_capacity_per_day >= 0);

ALTER TABLE public.satisfaction_surveys
  DROP CONSTRAINT IF EXISTS satisfaction_surveys_comment_length_check;

ALTER TABLE public.satisfaction_surveys
  ADD CONSTRAINT satisfaction_surveys_comment_length_check
  CHECK (comments IS NULL OR length(comments) <= 1000);

-- ==========================================
-- Dashboard and admin query indexes
-- ==========================================

CREATE INDEX IF NOT EXISTS idx_attractions_province_status
  ON public.attractions(province_id, is_published, is_active);

CREATE INDEX IF NOT EXISTS idx_attractions_type
  ON public.attractions(attraction_type_id);

CREATE INDEX IF NOT EXISTS idx_photo_spots_attraction_active
  ON public.photo_spots(attraction_id, is_active);

CREATE INDEX IF NOT EXISTS idx_checkin_codes_code_active
  ON public.checkin_codes(code, is_active);

CREATE INDEX IF NOT EXISTS idx_visits_visit_date
  ON public.visits(visit_date);

CREATE INDEX IF NOT EXISTS idx_visits_attraction_visit_date
  ON public.visits(attraction_id, visit_date);

CREATE INDEX IF NOT EXISTS idx_visits_tourist
  ON public.visits(tourist_id);

CREATE INDEX IF NOT EXISTS idx_visits_completion_status
  ON public.visits(completion_status);

CREATE INDEX IF NOT EXISTS idx_funnel_events_type_time
  ON public.funnel_events(event_type, event_time);

CREATE INDEX IF NOT EXISTS idx_funnel_events_checkin_time
  ON public.funnel_events(checkin_code_id, event_time);

CREATE INDEX IF NOT EXISTS idx_certificates_visit_generated
  ON public.certificates(visit_id, generated_at);

CREATE INDEX IF NOT EXISTS idx_tourist_stamps_attraction_earned
  ON public.tourist_stamps(attraction_id, earned_at);

CREATE INDEX IF NOT EXISTS idx_satisfaction_surveys_tourist
  ON public.satisfaction_surveys(tourist_id);

CREATE INDEX IF NOT EXISTS idx_visit_expenses_visit
  ON public.visit_expenses(visit_id);

CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at
  ON public.audit_logs(created_at);

CREATE INDEX IF NOT EXISTS idx_export_jobs_admin_created_at
  ON public.export_jobs(admin_id, created_at);

CREATE INDEX IF NOT EXISTS idx_travel_stories_published
  ON public.travel_stories(is_published, published_at);
