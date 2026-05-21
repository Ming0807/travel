export type DataImportStatus = 'pending' | 'processing' | 'success' | 'partial_success' | 'failed' | 'cancelled';

export type DataImportType = 'tourism_stats' | 'attraction_refs' | 'province_master' | 'district_master' | 'other';

export interface DataImportLog {
  import_log_id: string;
  source_name?: string;
  source_url?: string;
  source_file_name?: string;
  import_type: DataImportType;
  status: DataImportStatus;
  records_processed: number;
  records_inserted: number;
  records_updated: number;
  records_failed: number;
  error_message?: string;
  imported_by?: string;
  imported_at: string;
  metadata_json?: Record<string, unknown>;
}

export interface OfficialTourismStat {
  official_stat_id: string;
  province_id: number;
  year: number;
  month?: number;
  tourist_type: 'thai' | 'foreign' | 'total' | 'unknown';
  visitor_count: number;
  revenue_amount?: number;
  currency_code?: string;
  source_name: string;
  source_url?: string;
  source_file_name?: string;
  import_log_id?: string;
  imported_at: string;
  created_at: string;
  updated_at: string;
}

export interface OfficialAttractionRef {
  official_ref_id: string;
  attraction_id?: number;
  source_name: string;
  external_id?: string;
  external_url?: string;
  official_name_th: string;
  official_name_en?: string;
  official_province_name?: string;
  official_district_name?: string;
  raw_data_json?: Record<string, unknown>;
  linked_at?: string;
  linked_by?: string;
  created_at: string;
  updated_at: string;
}

export interface OfficialTourismStatWithProvince extends OfficialTourismStat {
  provinces?: {
    province_name_th: string;
    province_name_en: string;
  } | null;
}
