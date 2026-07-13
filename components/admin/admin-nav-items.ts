import {
  SquaresFour,
  ChartLineUp,
  Users,
  CalendarBlank,
  Star,
  ClipboardText,
  MapPin,
  MapPinLine,
  Article,
  ForkKnife,
  Image as ImageIcon,
  Certificate,
  QrCode,
  Medal,
  Trophy,
  UserCircle,
  Shield,
  Scroll,
  EnvelopeSimple,
  Gear,
} from "@phosphor-icons/react/dist/ssr";

type AdminNavIcon = typeof SquaresFour;

export type NavItem = {
  href: string;
  label: string;
  icon: AdminNavIcon;
  badge?: number | string;
  requiredAny?: string[];
};

export type NavGroup = {
  group: string;
  items: NavItem[];
};

export const navGroups: NavGroup[] = [
  {
    group: "ภาพรวม",
    items: [
      { href: "/admin", label: "หน้าหลัก", icon: SquaresFour },
      { href: "/admin/dashboard", label: "การวิเคราะห์", icon: ChartLineUp },
    ]
  },
  {
    group: "นักท่องเที่ยว",
    items: [
      { href: "/admin/tourists", label: "ข้อมูลนักท่องเที่ยว", icon: Users },
      { href: "/admin/visits", label: "ประวัติการเข้าชม", icon: CalendarBlank },
      { href: "/admin/reviews", label: "รีวิว", icon: Star },
      { href: "/admin/surveys", label: "แบบสำรวจ", icon: ClipboardText },
    ]
  },
  {
    group: "เนื้อหา",
    items: [
      { href: "/admin/content", label: "ศูนย์จัดการเนื้อหา", icon: SquaresFour },
      { href: "/admin/content-health", label: "คุณภาพเนื้อหา", icon: ChartLineUp },
      { href: "/admin/attractions", label: "สถานที่ท่องเที่ยว", icon: MapPin },
      { href: "/admin/routes", label: "เส้นทางแนะนำ", icon: MapPinLine },
      { href: "/admin/stories", label: "เรื่องราว", icon: Article },
      { href: "/admin/restaurants", label: "ร้านอาหาร", icon: ForkKnife },
      { href: "/admin/accommodations", label: "ที่พัก", icon: MapPin },
      { href: "/admin/media", label: "คลังสื่อ", icon: ImageIcon },
      { href: "/admin/photo-spots", label: "จุดถ่ายภาพ", icon: ImageIcon },
    ]
  },
  {
    group: "การดำเนินงาน",
    items: [
      { href: "/admin/certificate-templates", label: "แม่แบบใบประกาศ", icon: Certificate },
      { href: "/admin/checkin-codes", label: "รหัส QR เช็กอิน", icon: QrCode },
      { href: "/admin/badges", label: "เหรียญรางวัล", icon: Medal },
      { href: "/admin/leaderboard", label: "ตารางอันดับ", icon: Trophy },
    ]
  },
  {
    group: "ระบบและสิทธิ์",
    items: [
      {
        href: "/admin/users",
        label: "ผู้ดูแลระบบ",
        icon: UserCircle,
        requiredAny: ["user.manage"],
      },
      {
        href: "/admin/roles",
        label: "บทบาทและสิทธิ์",
        icon: Shield,
        requiredAny: ["role.manage"],
      },
      {
        href: "/admin/audit",
        label: "บันทึกการใช้งาน",
        icon: Scroll,
        requiredAny: ["audit.read"],
      },
      { href: "/admin/messages", label: "ข้อความ", icon: EnvelopeSimple },
      {
        href: "/admin/settings",
        label: "ตั้งค่าระบบ",
        icon: Gear,
        requiredAny: ["system.settings_read", "system.settings_update"],
      },
    ]
  }
];

export function getVisibleNavGroups(
  groups: NavGroup[],
  permissions: readonly string[],
  permissionsResolved: boolean
) {
  const hasSystemAccess = permissions.includes("system.all");

  return groups
    .map((group) => ({
      ...group,
      items: group.items.filter((item) => {
        if (!item.requiredAny?.length) return true;
        if (!permissionsResolved) return false;
        return hasSystemAccess || item.requiredAny.some((permission) => permissions.includes(permission));
      }),
    }))
    .filter((group) => group.items.length > 0);
}
