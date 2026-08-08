-- Operational data-quality hardening for the current tourism survey.
-- The research instrument remains nullable and inactive until separately approved.

ALTER TABLE public.tourists
  ALTER COLUMN preferred_language TYPE varchar(10),
  ALTER COLUMN preferred_language DROP NOT NULL;

UPDATE public.tourists
SET preferred_language = NULL
WHERE preferred_language IS NOT NULL
  AND preferred_language NOT IN ('th', 'en', 'ms');

DO $$
BEGIN
  ALTER TABLE public.tourists
    ADD CONSTRAINT tourists_preferred_language_check
    CHECK (preferred_language IS NULL OR preferred_language IN ('th', 'en', 'ms'));
EXCEPTION
  WHEN duplicate_object THEN NULL;
END;
$$;

ALTER TABLE public.tourists
  ADD COLUMN IF NOT EXISTS preferred_language_source varchar(20);

DO $$
BEGIN
  ALTER TABLE public.tourists
    ADD CONSTRAINT tourists_preferred_language_source_check
    CHECK (preferred_language_source IS NULL OR preferred_language_source IN ('detected', 'selected'));
EXCEPTION
  WHEN duplicate_object THEN NULL;
END;
$$;

ALTER TABLE public.satisfaction_surveys
  ADD COLUMN IF NOT EXISTS survey_instrument_version varchar(50);

ALTER TABLE public.satisfaction_surveys
  ALTER COLUMN survey_instrument_version TYPE varchar(50);

DO $$
BEGIN
  ALTER TABLE public.satisfaction_surveys
    ADD CONSTRAINT satisfaction_surveys_instrument_version_check
    CHECK (
      survey_instrument_version IS NULL
      OR (btrim(survey_instrument_version) <> '' AND length(survey_instrument_version) <= 50)
    );
EXCEPTION
  WHEN duplicate_object THEN NULL;
END;
$$;

-- The previous function has a different signature. Remove it before creating
-- the hardened signature so there is only one callable contract after commit.
REVOKE ALL ON FUNCTION public.submit_post_certificate_survey(
  uuid, uuid, bigint, integer, bigint, bigint, text, integer, bigint, bigint,
  integer, integer, integer, integer, integer, integer, text, text, text
) FROM PUBLIC, anon, authenticated;

DROP FUNCTION IF EXISTS public.submit_post_certificate_survey(
  uuid, uuid, bigint, integer, bigint, bigint, text, integer, bigint, bigint,
  integer, integer, integer, integer, integer, integer, text, text, text
);

CREATE OR REPLACE FUNCTION public.submit_post_certificate_survey(
  p_visit_id uuid,
  p_tourist_id uuid,
  p_travel_companion_id bigint,
  p_group_size integer,
  p_transport_mode_id bigint,
  p_travel_purpose_id bigint,
  p_overnight_status text,
  p_nights_count integer,
  p_expense_category_id bigint,
  p_spending_range_id bigint,
  p_overall_score integer,
  p_safety_score integer,
  p_cleanliness_score integer,
  p_accessibility_score integer,
  p_information_score integer,
  p_value_score integer,
  p_facility_score integer,
  p_revisit_intention text,
  p_recommend_intention text,
  p_comment text,
  p_survey_instrument_version varchar(50) DEFAULT NULL
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  v_attraction_id bigint;
  v_checkin_code_id bigint;
  v_completion_status text;
BEGIN
  SELECT attraction_id, checkin_code_id, completion_status
    INTO v_attraction_id, v_checkin_code_id, v_completion_status
  FROM public.visits
  WHERE visit_id = p_visit_id
    AND tourist_id = p_tourist_id
  FOR UPDATE;

  IF NOT FOUND THEN
    RETURN jsonb_build_object('success', false, 'error_code', 'VISIT_NOT_FOUND');
  END IF;

  IF v_completion_status NOT IN ('certificate_generated', 'survey_completed')
     AND NOT EXISTS (
       SELECT 1 FROM public.certificates WHERE visit_id = p_visit_id
     ) THEN
    RETURN jsonb_build_object('success', false, 'error_code', 'CERTIFICATE_REQUIRED');
  END IF;

  IF p_facility_score IS NOT NULL AND (p_facility_score < 1 OR p_facility_score > 5) THEN
    RETURN jsonb_build_object('success', false, 'error_code', 'SURVEY_VALIDATION_FAILED', 'field', 'facilityScore');
  END IF;

  IF p_travel_companion_id IS NOT NULL AND NOT EXISTS (
    SELECT 1 FROM public.travel_companions
    WHERE travel_companion_id = p_travel_companion_id AND is_active = true
  ) THEN
    RETURN jsonb_build_object(
      'success', false,
      'error_code', 'SURVEY_REFERENCE_INVALID',
      'field', 'travelCompanionId',
      'table', 'travel_companions'
    );
  END IF;

  IF p_transport_mode_id IS NOT NULL AND NOT EXISTS (
    SELECT 1 FROM public.transport_modes
    WHERE transport_mode_id = p_transport_mode_id AND is_active = true
  ) THEN
    RETURN jsonb_build_object(
      'success', false,
      'error_code', 'SURVEY_REFERENCE_INVALID',
      'field', 'transportModeId',
      'table', 'transport_modes'
    );
  END IF;

  IF p_travel_purpose_id IS NOT NULL AND NOT EXISTS (
    SELECT 1 FROM public.travel_purposes
    WHERE travel_purpose_id = p_travel_purpose_id AND is_active = true
  ) THEN
    RETURN jsonb_build_object(
      'success', false,
      'error_code', 'SURVEY_REFERENCE_INVALID',
      'field', 'travelPurposeId',
      'table', 'travel_purposes'
    );
  END IF;

  IF p_expense_category_id IS NOT NULL AND NOT EXISTS (
    SELECT 1 FROM public.expense_categories
    WHERE expense_category_id = p_expense_category_id AND is_active = true
  ) THEN
    RETURN jsonb_build_object(
      'success', false,
      'error_code', 'SURVEY_REFERENCE_INVALID',
      'field', 'expenseCategoryId',
      'table', 'expense_categories'
    );
  END IF;

  IF p_spending_range_id IS NOT NULL AND NOT EXISTS (
    SELECT 1 FROM public.spending_ranges
    WHERE spending_range_id = p_spending_range_id AND is_active = true
  ) THEN
    RETURN jsonb_build_object(
      'success', false,
      'error_code', 'SURVEY_REFERENCE_INVALID',
      'field', 'spendingRangeId',
      'table', 'spending_ranges'
    );
  END IF;

  UPDATE public.visits
  SET
    travel_companion_id = p_travel_companion_id,
    group_size = p_group_size,
    transport_mode_id = p_transport_mode_id,
    travel_purpose_id = p_travel_purpose_id,
    overnight_status = p_overnight_status,
    nights = p_nights_count,
    completion_status = 'survey_completed'
  WHERE visit_id = p_visit_id;

  IF p_expense_category_id IS NULL AND p_spending_range_id IS NULL THEN
    DELETE FROM public.visit_expenses WHERE visit_id = p_visit_id;
  ELSE
    INSERT INTO public.visit_expenses (
      visit_id,
      expense_category_id,
      spending_range_id,
      estimated_amount
    ) VALUES (
      p_visit_id,
      p_expense_category_id,
      p_spending_range_id,
      NULL
    )
    ON CONFLICT (visit_id) DO UPDATE
    SET
      expense_category_id = EXCLUDED.expense_category_id,
      spending_range_id = EXCLUDED.spending_range_id,
      estimated_amount = EXCLUDED.estimated_amount;
  END IF;

  INSERT INTO public.satisfaction_surveys (
    visit_id,
    tourist_id,
    attraction_id,
    overall_score,
    safety_score,
    cleanliness_score,
    accessibility_score,
    information_score,
    value_score,
    facility_score,
    revisit_intention,
    recommend_intention,
    comments,
    completed_at,
    survey_instrument_version
  ) VALUES (
    p_visit_id,
    p_tourist_id,
    v_attraction_id,
    p_overall_score,
    p_safety_score,
    p_cleanliness_score,
    p_accessibility_score,
    p_information_score,
    p_value_score,
    p_facility_score,
    p_revisit_intention,
    p_recommend_intention,
    p_comment,
    now(),
    p_survey_instrument_version
  )
  ON CONFLICT (visit_id) DO UPDATE
  SET
    tourist_id = EXCLUDED.tourist_id,
    attraction_id = EXCLUDED.attraction_id,
    overall_score = EXCLUDED.overall_score,
    safety_score = EXCLUDED.safety_score,
    cleanliness_score = EXCLUDED.cleanliness_score,
    accessibility_score = EXCLUDED.accessibility_score,
    information_score = EXCLUDED.information_score,
    value_score = EXCLUDED.value_score,
    facility_score = EXCLUDED.facility_score,
    revisit_intention = EXCLUDED.revisit_intention,
    recommend_intention = EXCLUDED.recommend_intention,
    comments = EXCLUDED.comments,
    completed_at = EXCLUDED.completed_at,
    survey_instrument_version = EXCLUDED.survey_instrument_version;

  INSERT INTO public.funnel_events (
    visit_id,
    tourist_id,
    checkin_code_id,
    event_type,
    metadata
  ) VALUES (
    p_visit_id,
    p_tourist_id,
    v_checkin_code_id,
    'survey_completed',
    jsonb_build_object('attraction_id', v_attraction_id)
  )
  ON CONFLICT (visit_id)
    WHERE event_type = 'survey_completed' AND visit_id IS NOT NULL
  DO NOTHING;

  RETURN jsonb_build_object('success', true);
EXCEPTION
  WHEN OTHERS THEN
    RETURN jsonb_build_object(
      'success', false,
      'error_code', 'SURVEY_TRANSACTION_FAILED'
    );
END;
$$;

REVOKE ALL ON FUNCTION public.submit_post_certificate_survey(
  uuid, uuid, bigint, integer, bigint, bigint, text, integer, bigint, bigint,
  integer, integer, integer, integer, integer, integer, integer, text, text, text, varchar
) FROM PUBLIC, anon, authenticated;

GRANT EXECUTE ON FUNCTION public.submit_post_certificate_survey(
  uuid, uuid, bigint, integer, bigint, bigint, text, integer, bigint, bigint,
  integer, integer, integer, integer, integer, integer, integer, text, text, text, varchar
) TO service_role;
