import "server-only";

import { createSupabaseServiceRoleClient } from "@/lib/supabase/service-role";
import { 
  DataImportLog, 
  OfficialTourismStat, 
  DataImportStatus, 
  DataImportType,
  OfficialTourismStatWithProvince
} from "@/types/official-data";

export type OfficialDataProvinceOption = {
  province_id: number;
  province_name_th: string;
  province_name_en: string;
};

export class AdminOfficialDataRepository {
  static async createImportLog(input: {
    source_name: string;
    source_url?: string;
    source_file_name?: string;
    import_type: DataImportType;
    imported_by?: string;
  }): Promise<DataImportLog> {
    const supabase = createSupabaseServiceRoleClient();
    
    const { data, error } = await supabase
      .from('data_import_logs')
      .insert({
        source_name: input.source_name,
        source_url: input.source_url,
        source_file_name: input.source_file_name,
        import_type: input.import_type,
        status: 'processing' as DataImportStatus,
        imported_by: input.imported_by,
      })
      .select()
      .single();
      
    if (error) throw error;
    return data as DataImportLog;
  }

  static async updateImportLogStatus(
    importLogId: string, 
    update: {
      status: DataImportStatus;
      records_processed?: number;
      records_inserted?: number;
      records_updated?: number;
      records_failed?: number;
      error_message?: string;
      metadata_json?: Record<string, unknown>;
    }
  ): Promise<void> {
    const supabase = createSupabaseServiceRoleClient();
    
    const { error } = await supabase
      .from('data_import_logs')
      .update(update)
      .eq('import_log_id', importLogId);
      
    if (error) throw error;
  }

  static async insertTourismStats(stats: Omit<OfficialTourismStat, 'official_stat_id' | 'created_at' | 'updated_at'>[]): Promise<void> {
    const supabase = createSupabaseServiceRoleClient();
    
    const { error } = await supabase
      .from('official_tourism_stats')
      .insert(stats);
      
    if (error) throw error;
  }
  
  static async getProvinces(): Promise<OfficialDataProvinceOption[]> {
    const supabase = createSupabaseServiceRoleClient();
    
    const { data, error } = await supabase
      .from('provinces')
      .select('province_id, province_name_th, province_name_en');
      
    if (error) throw error;
    return (data ?? []) as OfficialDataProvinceOption[];
  }

  static async listImportLogs(limit: number = 50, offset: number = 0): Promise<DataImportLog[]> {
    const supabase = createSupabaseServiceRoleClient();
    
    const { data, error } = await supabase
      .from('data_import_logs')
      .select('*')
      .order('imported_at', { ascending: false })
      .range(offset, offset + limit - 1);
      
    if (error) throw error;
    return data as DataImportLog[];
  }

  static async getTourismStats(limit: number = 50, offset: number = 0): Promise<OfficialTourismStatWithProvince[]> {
    const supabase = createSupabaseServiceRoleClient();
    
    const { data, error } = await supabase
      .from('official_tourism_stats')
      .select(`
        *,
        provinces(province_name_th, province_name_en)
      `)
      .order('year', { ascending: false })
      .order('month', { ascending: false })
      .range(offset, offset + limit - 1);
      
    if (error) throw error;
    return (data ?? []) as OfficialTourismStatWithProvince[];
  }
}
