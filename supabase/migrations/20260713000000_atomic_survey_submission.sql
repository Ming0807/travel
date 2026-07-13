-- Migration: make post-certificate survey submission atomic and idempotent.
-- One optional expense answer is stored per visit. Existing duplicate rows are
-- reduced to the most recently created answer before uniqueness is enforced.

WITH ranked_expenses AS (
  SELECT
    expense_id,
    row_number() OVER (
      PARTITION BY visit_id
      ORDER BY created_at DESC, expense_id DESC
    ) AS row_number
  FROM public.visit_expenses
)
DELETE FROM public.visit_expenses AS expense
USING ranked_expenses AS ranked
WHERE expense.expense_id = ranked.expense_id
  AND ranked.row_number > 1;

CREATE UNIQUE INDEX IF NOT EXISTS uq_visit_expenses_visit
  ON public.visit_expenses(visit_id);

-- A repeated survey submission keeps one funnel completion rather than
-- inflating conversion metrics.
WITH ranked_completions AS (
  SELECT
    event_id,
    row_number() OVER (
      PARTITION BY visit_id
      ORDER BY event_time DESC, event_id DESC
    ) AS row_number
  FROM public.funnel_events
  WHERE event_type = 'survey_completed'
    AND visit_id IS NOT NULL
)
DELETE FROM public.funnel_events AS event
USING ranked_completions AS ranked
WHERE event.event_id = ranked.event_id
  AND ranked.row_number > 1;

CREATE UNIQUE INDEX IF NOT EXISTS uq_funnel_events_survey_completed_visit
  ON public.funnel_events(visit_id)
  WHERE event_type = 'survey_completed' AND visit_id IS NOT NULL;

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
  p_revisit_intention text,
  p_recommend_intention text,
  p_comment text
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
    revisit_intention,
    recommend_intention,
    comments,
    completed_at
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
    p_revisit_intention,
    p_recommend_intention,
    p_comment,
    now()
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
    revisit_intention = EXCLUDED.revisit_intention,
    recommend_intention = EXCLUDED.recommend_intention,
    comments = EXCLUDED.comments,
    completed_at = EXCLUDED.completed_at;

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
  integer, integer, integer, integer, integer, integer, text, text, text
) FROM PUBLIC, anon, authenticated;

GRANT EXECUTE ON FUNCTION public.submit_post_certificate_survey(
  uuid, uuid, bigint, integer, bigint, bigint, text, integer, bigint, bigint,
  integer, integer, integer, integer, integer, integer, text, text, text
) TO service_role;
