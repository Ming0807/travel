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

export type NavItem = {
  href: string;
  label: string;
  icon: any;
  badge?: number | string;
};

export type NavGroup = {
  group: string;
  items: NavItem[];
};

export const navGroups: NavGroup[] = [
  {
    group: "Overview",
    items: [
      { href: "/admin", label: "Home", icon: SquaresFour },
      { href: "/admin/dashboard", label: "Analytics", icon: ChartLineUp },
    ]
  },
  {
    group: "CRM",
    items: [
      { href: "/admin/tourists", label: "Tourists", icon: Users },
      { href: "/admin/visits", label: "Bookings", icon: CalendarBlank },
      { href: "/admin/reviews", label: "Reviews", icon: Star },
      { href: "/admin/surveys", label: "Surveys", icon: ClipboardText },
    ]
  },
  {
    group: "Content",
    items: [
      { href: "/admin/attractions", label: "Destinations", icon: MapPin },
      { href: "/admin/routes", label: "Travel Routes", icon: MapPinLine },
      { href: "/admin/stories", label: "Articles", icon: Article },
      { href: "/admin/restaurants", label: "Restaurants", icon: ForkKnife },
      { href: "/admin/media", label: "Media Library", icon: ImageIcon },
      { href: "/admin/photo-spots", label: "Photo Spots", icon: ImageIcon },
    ]
  },
  {
    group: "Operations",
    items: [
      { href: "/admin/certificate-templates", label: "Cert Templates", icon: Certificate },
      { href: "/admin/checkin-codes", label: "Checkin Codes", icon: QrCode },
      { href: "/admin/badges", label: "Badges", icon: Medal },
      { href: "/admin/leaderboard", label: "Leaderboard", icon: Trophy },
    ]
  },
  {
    group: "System",
    items: [
      { href: "/admin/users", label: "Users", icon: UserCircle },
      { href: "/admin/roles", label: "Roles", icon: Shield },
      { href: "/admin/audit", label: "Audit Logs", icon: Scroll },
      { href: "/admin/messages", label: "Messages", icon: EnvelopeSimple },
      { href: "/admin/settings", label: "Settings", icon: Gear },
    ]
  }
];
