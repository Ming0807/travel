import "server-only";

import { createSupabaseServiceRoleClient } from "@/lib/supabase/service-role";
import type {
  AdminCertificateTemplateExportFilters,
  AdminCertificateTemplateFilters,
} from "@/lib/validation/admin-certificate-template";
import {
  normalizeCertificateTemplateLayout,
  type CertificateTemplateLayout,
} from "@/lib/certificate/certificate-template-layout";

type AttractionJoin =
  | { name_th: string | null; name_en: string | null }
  | Array<{ name_th: string | null; name_en: string | null }>
  | null;

type CertificateTemplateDatabaseRow = {
  template_id: number;
  template_name: string;
  attraction_id: number | null;
  background_path: string | null;
  layout_config_json: unknown;
  language: string;
  is_default: boolean;
  is_active: boolean;
  created_at: string;
  updated_at: string | null;
  attractions: AttractionJoin;
};

export type AdminCertificateTemplateListItem = Omit<
  CertificateTemplateDatabaseRow,
  "attractions" | "layout_config_json"
> & {
  attraction_name: string | null;
  orientation: "landscape" | "portrait";
};

type FilterableTemplateQuery<T> = {
  eq(column: string, value: unknown): T;
  is(column: string, value: null): T;
  not(column: string, operator: "is", value: null): T;
  or(filters: string): T;
  order(column: string, options: { ascending: boolean }): T;
};

const ADMIN_CERTIFICATE_TEMPLATE_SELECT = `
  template_id,
  template_name,
  attraction_id,
  background_path,
  layout_config_json,
  language,
  is_default,
  is_active,
  created_at,
  updated_at,
  attractions (name_th, name_en)
`;

function mapCertificateTemplate(row: unknown): AdminCertificateTemplateListItem {
  const template = row as CertificateTemplateDatabaseRow;
  const layout = normalizeCertificateTemplateLayout(template.layout_config_json);
  const attraction = Array.isArray(template.attractions)
    ? template.attractions[0]
    : template.attractions;
  return {
    template_id: template.template_id,
    template_name: template.template_name,
    attraction_id: template.attraction_id,
    background_path: template.background_path,
    language: template.language,
    is_default: template.is_default,
    is_active: template.is_active,
    created_at: template.created_at,
    updated_at: template.updated_at,
    attraction_name: attraction?.name_th || attraction?.name_en || null,
    orientation: layout.orientation,
  };
}

export type AdminCertificateTemplateStudio = AdminCertificateTemplateListItem & {
  layoutConfig: CertificateTemplateLayout;
};

export async function getAdminCertificateTemplateForStudio(
  templateId: number
): Promise<AdminCertificateTemplateStudio | null> {
  const supabase = createSupabaseServiceRoleClient();
  const { data, error } = await supabase
    .from("certificate_templates")
    .select(ADMIN_CERTIFICATE_TEMPLATE_SELECT)
    .eq("template_id", templateId)
    .maybeSingle();

  if (error) throw new Error("ADMIN_CERTIFICATE_TEMPLATE_DETAIL_FAILED");
  if (!data) return null;
  const item = mapCertificateTemplate(data);
  return {
    ...item,
    layoutConfig: normalizeCertificateTemplateLayout(
      (data as CertificateTemplateDatabaseRow).layout_config_json
    ),
  };
}

function quoteTemplateSearchPattern(search: string): string {
  const escaped = search
    .replace(/\\/g, "\\\\")
    .replace(/%/g, "\\%")
    .replace(/_/g, "\\_")
    .replace(/"/g, '\\"');
  return `"%${escaped}%"`;
}

function applyTemplateFiltersAndSort<T extends FilterableTemplateQuery<T>>(
  query: T,
  filters: AdminCertificateTemplateExportFilters
): T {
  let filtered = query;
  if (filters.search) {
    filtered = filtered.or(`template_name.ilike.${quoteTemplateSearchPattern(filters.search)}`);
  }
  if (filters.status) filtered = filtered.eq("is_active", filters.status === "active");
  if (filters.language) filtered = filtered.eq("language", filters.language);
  if (filters.scope === "global") filtered = filtered.is("attraction_id", null);
  if (filters.scope === "attraction") filtered = filtered.not("attraction_id", "is", null);

  if (filters.sort === "name_asc" || filters.sort === "name_desc") {
    filtered = filtered.order("template_name", {
      ascending: filters.sort === "name_asc",
    });
  } else {
    filtered = filtered.order("created_at", { ascending: filters.sort === "oldest" });
  }
  return filtered.order("template_id", { ascending: true });
}

export async function listAdminCertificateTemplates(
  filters: AdminCertificateTemplateFilters
): Promise<{
  items: AdminCertificateTemplateListItem[];
  total: number;
  page: number;
  pageSize: number;
}> {
  const supabase = createSupabaseServiceRoleClient();
  const from = (filters.page - 1) * filters.pageSize;
  const to = from + filters.pageSize - 1;
  const { page: _page, pageSize: _pageSize, ...queryFilters } = filters;
  void _page;
  void _pageSize;

  let query = supabase
    .from("certificate_templates")
    .select(ADMIN_CERTIFICATE_TEMPLATE_SELECT, { count: "exact" });
  query = applyTemplateFiltersAndSort(query, queryFilters);
  const { data, error, count } = await query.range(from, to);

  if (error) throw new Error("ADMIN_CERTIFICATE_TEMPLATE_LIST_FAILED");
  return {
    items: (data ?? []).map(mapCertificateTemplate),
    total: count ?? 0,
    page: filters.page,
    pageSize: filters.pageSize,
  };
}

export async function exportAdminCertificateTemplates(
  filters: AdminCertificateTemplateExportFilters,
  limit: number
): Promise<AdminCertificateTemplateListItem[]> {
  const supabase = createSupabaseServiceRoleClient();
  let query = supabase.from("certificate_templates").select(ADMIN_CERTIFICATE_TEMPLATE_SELECT);
  query = applyTemplateFiltersAndSort(query, filters);
  const { data, error } = await query.limit(limit);

  if (error) throw new Error("EXPORT_CERTIFICATE_TEMPLATES_FAILED");
  return (data ?? []).map(mapCertificateTemplate);
}
