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
