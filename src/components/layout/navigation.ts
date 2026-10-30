import {
  BookOpen,
  CalendarClock,
  Inbox,
  LayoutDashboard,
  MessageCircleQuestionMark,
  Route,
  Settings,
  ContactRound,
  type LucideIcon,
} from "lucide-react";

/** From 1280 px every area sits in the top bar and the hamburger is hidden (P5-09). */
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
  { to: "/fristen", label: "Fristen", icon: CalendarClock },
  { to: "/postfach", label: "Postfach", icon: Inbox },
  {
    to: "/assistent",
    label: "Assistent",
    icon: MessageCircleQuestionMark,
  },
  { to: "/anlaufstellen", label: "Anlaufstellen", icon: ContactRound },
];

/** Settings in the full menu; there is no login/logout. */
export const SETTINGS_ITEM: NavItem = {
  to: "/einstellungen",
  label: "Einstellungen",
  icon: Settings,
};

/** Desktop links: every area, so the top bar replaces the hamburger menu from 1280 px (P5-09). */
export const TOP_NAV_ITEMS = NAV_ITEMS;
