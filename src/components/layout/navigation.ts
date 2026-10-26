import {
  BookOpen,
  CalendarClock,
  Inbox,
  LayoutDashboard,
  MessageCircleQuestionMark,
  Route,
  Settings,
  type LucideIcon,
} from "lucide-react";

/** Desktop top links start at 1280 px; the hamburger is always available. */
export const DESKTOP_QUERY = "(min-width: 80rem)";

export interface NavItem {
  to: string;
  label: string;
  icon: LucideIcon;
  /** Active only on exactly this path; the Übersicht at "/" would otherwise match every page. */
  end?: boolean;
}

/** Main navigation in the order of KONZEPT §7. */
export const NAV_ITEMS: readonly NavItem[] = [
  {
    to: "/",
    label: "Übersicht",
    icon: LayoutDashboard,
    end: true,
  },
  {
    to: "/verlauf",
    label: "Studienverlauf",
    icon: Route,
  },
  { to: "/module", label: "Module & Noten", icon: BookOpen },
  { to: "/postfach", label: "Postfach", icon: Inbox },
  {
    to: "/assistent",
    label: "Assistent",
    icon: MessageCircleQuestionMark,
  },
  { to: "/fristen", label: "Fristen", icon: CalendarClock },
];

/** Settings in the full menu; there is no login/logout. */
export const SETTINGS_ITEM: NavItem = {
  to: "/einstellungen",
  label: "Einstellungen",
  icon: Settings,
};

/** Primary desktop links; the full menu provides every destination. */
export const TOP_NAV_ITEMS = NAV_ITEMS.slice(0, 4);
