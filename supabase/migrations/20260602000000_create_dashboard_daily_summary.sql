-- Migration: 20260602000000_create_dashboard_daily_summary
-- Description: Pre-aggregated daily tourism metrics table for fast dashboard KPI queries.
-- Replaces 5+ raw-table join queries with a single daily-level rollup.
-- Refresh via: SELECT public.refresh_dashboard_summary();

-- ==========================================
-- 1. DASHBOARD DAILY SUMMARY TABLE
-- ==========================================
-- Stores one row per attraction per day with pre-computed counts and averages.
-- Supports fast aggregation by date range, province (via attractions join), and any date grouping.

CREATE TABLE public.dashboard_daily_summary (
    id bigint generated always as identity primary key,
    summary_date date not null,
    attraction_id bigint not null references public.attractions(attraction_id) on delete cascade,

    -- Visit / tourist counts
    total_visits integer not null default 0,
    unique_tourists integer not null default 0,

    -- Certificate & stamp counts
    certificate_count integer not null default 0,
    stamp_count integer not null default 0,

    -- Satisfaction survey aggregates
    survey_count integer not null default 0,
    avg_satisfaction numeric(3,2),
    avg_safety_score numeric(3,2),
    avg_cleanliness_score numeric(3,2),
    avg_facility_score numeric(3,2),
    revisit_yes_count integer not null default 0,
    recommend_yes_count integer not null default 0,
    revisit_answered_count integer not null default 0,
    recommend_answered_count integer not null default 0,

    -- Expense aggregates (range-based estimates)
    expense_response_count integer not null default 0,
    total_expense_min numeric(14,2) not null default 0,
    total_expense_max numeric(14,2) not null default 0,
    has_open_ended_range boolean not null default false,

    -- Funnel event counts (per visit-linked funnel events)
    qr_scan_count integer not null default 0,
    landing_view_count integer not null default 0,
    certificate_started_count integer not null default 0,
    minimal_form_completed_count integer not null default 0,
    photo_uploaded_count integer not null default 0,
    certificate_generated_count integer not null default 0,
    survey_started_count integer not null default 0,
    survey_completed_count integer not null default 0,

    -- Metadata
    created_at timestamptz not null default now(),

    -- One row per attraction per day
    UNIQUE(summary_date, attraction_id)
);

-- Indexes for fast dashboard queries
CREATE INDEX idx_dash_summary_date ON public.dashboard_daily_summary(summary_date);
CREATE INDEX idx_dash_summary_attraction ON public.dashboard_daily_summary(attraction_id);
CREATE INDEX idx_dash_summary_date_attraction ON public.dashboard_daily_summary(summary_date, attraction_id);

-- ==========================================
-- 2. ROW LEVEL SECURITY
-- ==========================================
-- Admin-only via service role; no public access policy needed.
ALTER TABLE public.dashboard_daily_summary ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Service role can manage dashboard summary"
    ON public.dashboard_daily_summary
    FOR ALL
    TO service_role
    USING (true)
    WITH CHECK (true);

-- ==========================================
-- 3. REFRESH FUNCTION (full recompute)
-- ==========================================
-- Call this periodically or on-demand to refresh the summary.
-- Performance: trivially fast at MVP scale (< 10k visits).
-- For production with 100k+ visits, consider incremental or partition-based refresh.
--
-- Usage:
--   SELECT public.refresh_dashboard_summary();

CREATE OR REPLACE FUNCTION public.refresh_dashboard_summary()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    -- Clear existing summary data
    DELETE FROM public.dashboard_daily_summary;

    -- Insert fresh daily aggregates per attraction
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
        -- Visits
        COUNT(DISTINCT v.visit_id)                                    AS total_visits,
        COUNT(DISTINCT v.tourist_id)                                  AS unique_tourists,
        -- Certificates & stamps
        COUNT(DISTINCT cert.certificate_id)                           AS certificate_count,
        COUNT(DISTINCT ts.stamp_id)                                   AS stamp_count,
        -- Survey counts
        COUNT(DISTINCT surv.survey_id)                                AS survey_count,
        ROUND(AVG(surv.overall_score)::numeric, 2)                    AS avg_satisfaction,
        ROUND(AVG(surv.safety_score)::numeric, 2)                     AS avg_safety_score,
        ROUND(AVG(surv.cleanliness_score)::numeric, 2)                AS avg_cleanliness_score,
        ROUND(AVG(surv.facility_score)::numeric, 2)                   AS avg_facility_score,
        COUNT(DISTINCT CASE WHEN surv.revisit_intention = 'yes' THEN surv.survey_id END)
                                                                      AS revisit_yes_count,
        COUNT(DISTINCT CASE WHEN surv.recommend_intention = 'yes' THEN surv.survey_id END)
                                                                      AS recommend_yes_count,
        COUNT(DISTINCT CASE WHEN surv.revisit_intention IS NOT NULL THEN surv.survey_id END)
                                                                      AS revisit_answered_count,
        COUNT(DISTINCT CASE WHEN surv.recommend_intention IS NOT NULL THEN surv.survey_id END)
                                                                      AS recommend_answered_count,
        -- Expenses (range-based estimates)
        COUNT(DISTINCT ve.expense_id)                                 AS expense_response_count,
        COALESCE(SUM(sr.min_value), 0)                                AS total_expense_min,
        COALESCE(SUM(
            CASE WHEN sr.max_value IS NOT NULL THEN sr.max_value
                 WHEN sr.min_value IS NOT NULL THEN sr.min_value
                 ELSE 0 END
        ), 0)                                                         AS total_expense_max,
        BOOL_OR(sr.max_value IS NULL AND sr.min_value IS NOT NULL)    AS has_open_ended_range,
        -- Funnel events (linked via visit_id)
        COUNT(DISTINCT CASE WHEN fe.event_type = 'qr_scanned'                  THEN fe.event_id END)
                                                                      AS qr_scan_count,
        COUNT(DISTINCT CASE WHEN fe.event_type = 'landing_viewed'              THEN fe.event_id END)
                                                                      AS landing_view_count,
        COUNT(DISTINCT CASE WHEN fe.event_type = 'certificate_started'          THEN fe.event_id END)
                                                                      AS certificate_started_count,
        COUNT(DISTINCT CASE WHEN fe.event_type = 'minimal_form_completed'       THEN fe.event_id END)
                                                                      AS minimal_form_completed_count,
        COUNT(DISTINCT CASE WHEN fe.event_type = 'photo_uploaded'               THEN fe.event_id END)
                                                                      AS photo_uploaded_count,
        COUNT(DISTINCT CASE WHEN fe.event_type = 'certificate_generated'        THEN fe.event_id END)
                                                                      AS certificate_generated_count,
        COUNT(DISTINCT CASE WHEN fe.event_type = 'survey_started'               THEN fe.event_id END)
                                                                      AS survey_started_count,
        COUNT(DISTINCT CASE WHEN fe.event_type = 'survey_completed'             THEN fe.event_id END)
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

    -- Update query planner statistics
    ANALYZE public.dashboard_daily_summary;
END;
$$;

-- ==========================================
-- 4. HELPER: check when summary was last refreshed
-- ==========================================

CREATE OR REPLACE FUNCTION public.get_dashboard_summary_refresh_time()
RETURNS timestamptz
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    last_refresh timestamptz;
BEGIN
    SELECT MAX(created_at) INTO last_refresh FROM public.dashboard_daily_summary;
    RETURN last_refresh;
END;
$$;

-- Note: Call the initial refresh after migration if desired:
-- SELECT public.refresh_dashboard_summary();
