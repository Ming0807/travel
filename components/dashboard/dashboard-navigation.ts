import {
  ChartLineUp,
  FunnelSimple,
  MapPinLine,
  Smiley,
  Star,
  TreeEvergreen,
  Users,
  Wallet,
} from "@phosphor-icons/react/dist/ssr";

import type { DashboardPageKey } from "@/components/dashboard/DashboardPageHeader";

type DashboardNavigationItem = {
  page: DashboardPageKey | "attractions";
  href: string;
  label: string;
  shortLabel: string;
  exact?: boolean;
  icon: typeof ChartLineUp;
};

export const dashboardNavigation: ReadonlyArray<DashboardNavigationItem> = [
  { page: "overview", href: "/admin/dashboard", label: "ภาพรวมการตัดสินใจ", shortLabel: "ภาพรวม", exact: true, icon: ChartLineUp },
  { page: "tourists", href: "/admin/dashboard/tourists", label: "กลุ่มนักท่องเที่ยว", shortLabel: "กลุ่มนักท่องเที่ยว", icon: Users },
  { page: "visits", href: "/admin/dashboard/visits", label: "พฤติกรรมการเดินทาง", shortLabel: "การเดินทาง", icon: MapPinLine },
  { page: "funnel", href: "/admin/dashboard/funnel", label: "เส้นทางผู้ใช้", shortLabel: "เส้นทางผู้ใช้", icon: FunnelSimple },
  { page: "satisfaction", href: "/admin/dashboard/satisfaction", label: "คุณภาพประสบการณ์", shortLabel: "ประสบการณ์", icon: Smiley },
  { page: "expenses", href: "/admin/dashboard/expenses", label: "สัญญาณค่าใช้จ่าย", shortLabel: "ค่าใช้จ่าย", icon: Wallet },
  { page: "attractions", href: "/admin/dashboard/attractions", label: "วิเคราะห์รายสถานที่", shortLabel: "รายสถานที่", icon: Star },
  { page: "sustainability", href: "/admin/dashboard/sustainability", label: "ความยั่งยืนและข้อเสนอ", shortLabel: "ความยั่งยืน", icon: TreeEvergreen },
];

const SHARED_SCOPE_KEYS = [
  ["date_from", "dateFrom"],
  ["date_to", "dateTo"],
  ["province_id", "provinceId"],
  ["district_id", "districtId"],
  ["attraction_id", "attractionId"],
  ["attraction_type_id", "attractionTypeId"],
  ["origin_country_id", "originCountryId"],
  ["origin_province_id", "originProvinceId"],
  ["age_group", "ageGroup"],
  ["transport_mode_id", "transportModeId"],
  ["travel_purpose_id", "travelPurposeId"],
  ["satisfaction_min", "satisfactionMin"],
  ["satisfaction_max", "satisfactionMax"],
  ["compare", "comparisonMode"],
  ["evidence_scope", "evidenceScope"],
] as const;

function scopeValue(params: URLSearchParams, snakeKey: string, camelKey: string) {
  return params.get(snakeKey) ?? params.get(camelKey);
}

export function buildDashboardNavigationHref(href: string, currentQuery: string) {
  if (!href.startsWith("/admin/dashboard") || !currentQuery) return href;

  const current = new URLSearchParams(currentQuery);
  const next = new URLSearchParams();

  if (href === "/admin/dashboard/attractions") {
    for (const [snakeKey, camelKey] of SHARED_SCOPE_KEYS) {
      if (!["date_from", "date_to", "attraction_id", "evidence_scope"].includes(snakeKey)) continue;
      const value = scopeValue(current, snakeKey, camelKey);
      if (value) next.set(camelKey, value);
    }
  } else {
    for (const [snakeKey, camelKey] of SHARED_SCOPE_KEYS) {
      const value = scopeValue(current, snakeKey, camelKey);
      if (value) next.set(snakeKey, value);
    }
  }

  const query = next.toString();
  return query ? `${href}?${query}` : href;
}
