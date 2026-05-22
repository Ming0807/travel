import {
  SquaresFour,
  ChartLineUp,
  MapPin,
  Image as ImageIcon,
  QrCode,
  ClipboardText,
  ChatCircleText,
  Gear,
  Shield,
} from "@phosphor-icons/react/dist/ssr";

import { Users, Layout } from "@phosphor-icons/react/dist/ssr";

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
      { href: "/admin", label: "Dashboard", icon: SquaresFour },
      { href: "/admin/dashboard", label: "Analytics", icon: ChartLineUp },
    ]
  },
  {
    group: "Data & CRM",
    items: [
      { href: "/admin/tourists", label: "Tourists", icon: Users },
      { href: "/admin/visits", label: "Bookings", icon: ChartLineUp },
      { href: "/admin/surveys", label: "Reviews", icon: ChatCircleText },
    ]
  },
  {
    group: "Content",
    items: [
      { href: "/admin/attractions", label: "Destinations", icon: MapPin },
      { href: "/admin/stories", label: "Articles", icon: ClipboardText },
      { href: "/admin/photo-spots", label: "Media", icon: ImageIcon },
      { href: "/admin/certificate-templates", label: "Cert Templates", icon: ImageIcon },
      { href: "/admin/checkin-codes", label: "Checkin Codes", icon: QrCode },
    ]
  },
  {
    group: "System",
    items: [
      { href: "/admin/users", label: "Users", icon: Gear },
      { href: "/admin/roles", label: "Roles", icon: Shield },
      { href: "/admin/audit", label: "Audit Logs", icon: ClipboardText },
      { href: "/admin/messages", label: "Messages", icon: ChatCircleText },
      { href: "/admin/settings", label: "Settings", icon: Gear },
    ]
  }
];
