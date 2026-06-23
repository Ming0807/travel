-- Migration: 20260623000000_add_dashboard_satisfaction_dimensions
-- Description: Align dashboard daily summary with the post-certificate survey dimensions.
-- The original summary used facility_score. Current survey UX stores
-- accessibility_score, information_score, and value_score.

ALTER TABLE public.dashboard_daily_summary
  ADD COLUMN IF NOT EXISTS avg_accessibility_score numeric(3,2),
  ADD COLUMN IF NOT EXISTS avg_information_score numeric(3,2),
  ADD COLUMN IF NOT EXISTS avg_value_score numeric(3,2);

CREATE OR REPLACE FUNCTION public.refresh_dashboard_summary()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    DELETE FROM public.dashboard_daily_summary;

    INSERT INTO public.dashboard_daily_summary (
        summary_date,
        attraction_id,
        total_visits,
        unique_tourists,
        certificate_count,
        stamp_count,
        survey_count,
        avg_satisfaction,
        avg_safety_score,
        avg_cleanliness_score,
        avg_accessibility_score,
        avg_information_score,
        avg_value_score,
        avg_facility_score,
        revisit_yes_count,
        recommend_yes_count,
        revisit_answered_count,
        recommend_answered_count,
        expense_response_count,
        total_expense_min,
        total_expense_max,
        has_open_ended_range,
        qr_scan_count,
        landing_view_count,
        certificate_started_count,
        minimal_form_completed_count,
        photo_uploaded_count,
        certificate_generated_count,
        survey_started_count,
        survey_completed_count
    )
    SELECT
        v.visit_date                                                  AS summary_date,
        v.attraction_id,
        COUNT(DISTINCT v.visit_id)                                    AS total_visits,
        COUNT(DISTINCT v.tourist_id)                                  AS unique_tourists,
        COUNT(DISTINCT cert.certificate_id)                           AS certificate_count,
        COUNT(DISTINCT ts.stamp_id)                                   AS stamp_count,
        COUNT(DISTINCT surv.survey_id)                                AS survey_count,
        ROUND(AVG(surv.overall_score)::numeric, 2)                    AS avg_satisfaction,
        ROUND(AVG(surv.safety_score)::numeric, 2)                     AS avg_safety_score,
        ROUND(AVG(surv.cleanliness_score)::numeric, 2)                AS avg_cleanliness_score,
        ROUND(AVG(surv.accessibility_score)::numeric, 2)              AS avg_accessibility_score,
        ROUND(AVG(surv.information_score)::numeric, 2)                AS avg_information_score,
        ROUND(AVG(surv.value_score)::numeric, 2)                      AS avg_value_score,
        ROUND(AVG(surv.facility_score)::numeric, 2)                   AS avg_facility_score,
        COUNT(DISTINCT CASE WHEN surv.revisit_intention = 'yes' THEN surv.survey_id END)
                                                                      AS revisit_yes_count,
        COUNT(DISTINCT CASE WHEN surv.recommend_intention = 'yes' THEN surv.survey_id END)
                                                                      AS recommend_yes_count,
        COUNT(DISTINCT CASE WHEN surv.revisit_intention IS NOT NULL THEN surv.survey_id END)
                                                                      AS revisit_answered_count,
        COUNT(DISTINCT CASE WHEN surv.recommend_intention IS NOT NULL THEN surv.survey_id END)
                                                                      AS recommend_answered_count,
        COUNT(DISTINCT ve.expense_id)                                 AS expense_response_count,
        COALESCE(SUM(sr.min_value), 0)                                AS total_expense_min,
        COALESCE(SUM(
            CASE WHEN sr.max_value IS NOT NULL THEN sr.max_value
                 WHEN sr.min_value IS NOT NULL THEN sr.min_value
                 ELSE 0 END
        ), 0)                                                         AS total_expense_max,
        BOOL_OR(sr.max_value IS NULL AND sr.min_value IS NOT NULL)    AS has_open_ended_range,
        COUNT(DISTINCT CASE WHEN fe.event_type = 'qr_scanned'            THEN fe.event_id END)
                                                                      AS qr_scan_count,
        COUNT(DISTINCT CASE WHEN fe.event_type = 'landing_viewed'        THEN fe.event_id END)
                                                                      AS landing_view_count,
        COUNT(DISTINCT CASE WHEN fe.event_type = 'certificate_started'    THEN fe.event_id END)
                                                                      AS certificate_started_count,
        COUNT(DISTINCT CASE WHEN fe.event_type = 'minimal_form_completed' THEN fe.event_id END)
                                                                      AS minimal_form_completed_count,
        COUNT(DISTINCT CASE WHEN fe.event_type = 'photo_uploaded'         THEN fe.event_id END)
                                                                      AS photo_uploaded_count,
        COUNT(DISTINCT CASE WHEN fe.event_type = 'certificate_generated'  THEN fe.event_id END)
                                                                      AS certificate_generated_count,
        COUNT(DISTINCT CASE WHEN fe.event_type = 'survey_started'         THEN fe.event_id END)
                                                                      AS survey_started_count,
        COUNT(DISTINCT CASE WHEN fe.event_type = 'survey_completed'       THEN fe.event_id END)
                                                                      AS survey_completed_count
    FROM public.visits v
    LEFT JOIN public.certificates cert ON cert.visit_id = v.visit_id
    LEFT JOIN public.tourist_stamps ts ON ts.visit_id = v.visit_id
    LEFT JOIN public.satisfaction_surveys surv ON surv.visit_id = v.visit_id
    LEFT JOIN public.visit_expenses ve ON ve.visit_id = v.visit_id
    LEFT JOIN public.spending_ranges sr ON sr.spending_range_id = ve.spending_range_id
    LEFT JOIN public.funnel_events fe ON fe.visit_id = v.visit_id
    GROUP BY v.visit_date, v.attraction_id
    ORDER BY v.visit_date, v.attraction_id;

    ANALYZE public.dashboard_daily_summary;
END;
$$;
