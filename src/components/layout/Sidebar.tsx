import { Compass } from "lucide-react";
import { NavLink } from "react-router";
import {
  DESKTOP_QUERY,
  NAV_ITEMS,
  SETTINGS_ITEM,
  type NavItem,
} from "@/components/layout/navigation";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { APP_NAME } from "@/config/demo";
import { useMediaQuery } from "@/lib/use-media-query";

function SidebarLink({
  item,
  withTooltip,
}: {
  item: NavItem;
  withTooltip: boolean;
}) {
  const link = (
    <NavLink
      to={item.to}
      end={item.end}
      className="group relative flex h-10 items-center gap-3 rounded-lg px-3 text-sidebar-muted transition-colors hover:bg-sidebar-active hover:text-sidebar-foreground aria-[current=page]:bg-sidebar-active aria-[current=page]:font-semibold aria-[current=page]:text-sidebar-foreground md:max-xl:justify-center md:max-xl:px-0"
    >
      {/* Current page (KONZEPT §12.2): 3 px bar plus bold text; NavLink sets aria-current. */}
      <span className="absolute inset-y-2 left-0 hidden w-0.75 rounded-full bg-sidebar-primary group-aria-[current=page]:block" />
      <item.icon className="size-5 shrink-0" />
      <span className="truncate md:max-xl:sr-only">{item.label}</span>
    </NavLink>
  );

  // Only the icon bar gets tooltips: with visible labels, screen readers would hear the label twice.
  if (!withTooltip) return link;
  return (
    <Tooltip>
      <TooltipTrigger asChild>{link}</TooltipTrigger>
      <TooltipContent side="right" sideOffset={8}>
        {item.label}
      </TooltipContent>
    </Tooltip>
  );
}

/** Ink sidebar from 768 px (KONZEPT §7, §12.1): icon bar up to 1279 px, with labels from 1280 px. */
export function Sidebar() {
  const withTooltips = !useMediaQuery(DESKTOP_QUERY);

  return (
    // On ink, --accent-strong reaches only 2.77:1 next to the active row; --sidebar-ring 4.7:1.
    <div
      data-testid="sidebar"
      className="sticky top-0 hidden h-dvh w-18 shrink-0 flex-col overflow-y-auto bg-sidebar px-2 py-4 text-sidebar-foreground [--ring:var(--sidebar-ring)] md:flex xl:w-62 xl:px-3"
    >
      <nav aria-label="Hauptnavigation" className="flex flex-1 flex-col gap-6">
        <div className="flex h-10 items-center gap-2.5 px-3 md:max-xl:justify-center md:max-xl:px-0">
          <Compass className="size-6 shrink-0 text-sidebar-primary" />
          <span className="text-card-title md:max-xl:sr-only">{APP_NAME}</span>
        </div>
        <ul className="flex flex-col gap-1">
          {NAV_ITEMS.map((item) => (
            <li key={item.to}>
              <SidebarLink item={item} withTooltip={withTooltips} />
            </li>
          ))}
        </ul>
        <ul className="mt-auto flex flex-col gap-1">
          <li>
            <SidebarLink item={SETTINGS_ITEM} withTooltip={withTooltips} />
          </li>
        </ul>
      </nav>
    </div>
  );
}
