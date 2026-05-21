-- Migration: 20260521102219_official_data_import
-- Description: Official/public-sector data import foundation.
-- Note: Local platform visits are not official arrivals. Official statistics
-- are stored separately and must not be mixed with reward-first visit records.

-- Data Import Logs Table
CREATE TABLE public.data_import_logs (
    import_log_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    source_name VARCHAR,
    source_url VARCHAR,
    source_file_name VARCHAR,
    import_type VARCHAR NOT NULL CHECK (import_type IN ('tourism_stats', 'attraction_refs', 'province_master', 'district_master', 'other')),
    status VARCHAR NOT NULL CHECK (status IN ('pending', 'processing', 'success', 'partial_success', 'failed', 'cancelled')),
    records_processed INTEGER DEFAULT 0,
    records_inserted INTEGER DEFAULT 0,
    records_updated INTEGER DEFAULT 0,
    records_failed INTEGER DEFAULT 0,
    error_message TEXT,
    imported_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    imported_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    metadata_json JSONB
);

-- Official Tourism Stats Table
CREATE TABLE public.official_tourism_stats (
    official_stat_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    province_id bigint NOT NULL REFERENCES public.provinces(province_id) ON DELETE CASCADE,
    year INTEGER NOT NULL CHECK (year >= 2000 AND year <= 2100),
    month INTEGER CHECK (month IS NULL OR (month >= 1 AND month <= 12)),
    tourist_type VARCHAR NOT NULL CHECK (tourist_type IN ('thai', 'foreign', 'total', 'unknown')),
    visitor_count INTEGER NOT NULL CHECK (visitor_count >= 0),
    revenue_amount NUMERIC(15, 2) CHECK (revenue_amount IS NULL OR revenue_amount >= 0),
    currency_code VARCHAR DEFAULT 'THB',
    source_name VARCHAR NOT NULL,
    source_url VARCHAR,
    source_file_name VARCHAR,
    import_log_id UUID REFERENCES data_import_logs(import_log_id) ON DELETE SET NULL,
    imported_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Official Attraction Refs Table
CREATE TABLE public.official_attraction_refs (
    official_ref_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    attraction_id bigint REFERENCES public.attractions(attraction_id) ON DELETE SET NULL,
    source_name VARCHAR NOT NULL,
    external_id VARCHAR,
    external_url VARCHAR,
    official_name_th VARCHAR NOT NULL,
    official_name_en VARCHAR,
    official_province_name VARCHAR,
    official_district_name VARCHAR,
    raw_data_json JSONB,
    linked_at TIMESTAMP WITH TIME ZONE,
    linked_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Indexes for performance
CREATE INDEX idx_official_tourism_stats_province ON public.official_tourism_stats(province_id);
CREATE INDEX idx_official_tourism_stats_year_month ON public.official_tourism_stats(year, month);
CREATE INDEX idx_official_tourism_stats_source ON public.official_tourism_stats(source_name, source_file_name);
CREATE INDEX idx_official_attraction_refs_attraction ON public.official_attraction_refs(attraction_id);
CREATE INDEX idx_data_import_logs_imported_at ON public.data_import_logs(imported_at);

-- Row Level Security (RLS)
ALTER TABLE public.data_import_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.official_tourism_stats ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.official_attraction_refs ENABLE ROW LEVEL SECURITY;

-- No broad anon/authenticated policies are created here.
-- Admin import and review goes through Next.js server actions/services using
-- service role after explicit admin permission checks.
