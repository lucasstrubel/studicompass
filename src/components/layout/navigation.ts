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

/**
 * KONZEPT §7 desktop (≥ 1280 px, Tailwind xl): the sidebar shows its labels. Between 768 and 1279 px it
 * is an icon bar whose tooltips name the icons; below 768 px the tab bar takes over.
 */
export const DESKTOP_QUERY = "(min-width: 80rem)";

export interface NavItem {
  to: string;
  label: string;
  /** Shorter label for the mobile tab bar (KONZEPT §7: "Verlauf"). */
  shortLabel?: string;
  icon: LucideIcon;
  /** Active only on exactly this path; the Übersicht at "/" would otherwise match every page. */
  end?: boolean;
  /** Place below 768 px: in the tab bar or in the "Mehr" sheet (KONZEPT §7). */
  mobile: "tab" | "more";
}

/** Main navigation in the order of KONZEPT §7. */
export const NAV_ITEMS: readonly NavItem[] = [
  {
    to: "/",
    label: "Übersicht",
    icon: LayoutDashboard,
    end: true,
    mobile: "tab",
  },
  {
    to: "/verlauf",
    label: "Studienverlauf",
    shortLabel: "Verlauf",
    icon: Route,
    mobile: "tab",
  },
  { to: "/module", label: "Module & Noten", icon: BookOpen, mobile: "more" },
  { to: "/postfach", label: "Postfach", icon: Inbox, mobile: "tab" },
  {
    to: "/assistent",
    label: "Assistent",
    icon: MessageCircleQuestionMark,
    mobile: "tab",
  },
  { to: "/fristen", label: "Fristen", icon: CalendarClock, mobile: "more" },
];

/** Bottom of the sidebar (KONZEPT §7); no "Abmelden", as the prototype has no login (§12.1). */
export const SETTINGS_ITEM: NavItem = {
  to: "/einstellungen",
  label: "Einstellungen",
  icon: Settings,
  mobile: "more",
};

/** Mobile tab bar: Übersicht · Verlauf · Postfach · Assistent, followed by "Mehr". */
export const TAB_ITEMS = NAV_ITEMS.filter((item) => item.mobile === "tab");

/** Contents of the "Mehr" sheet: Module & Noten, Fristen, Einstellungen. */
export const MORE_ITEMS = [...NAV_ITEMS, SETTINGS_ITEM].filter(
  (item) => item.mobile === "more",
);
