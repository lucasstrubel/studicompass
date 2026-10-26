import { Ellipsis } from "lucide-react";
import { matchPath, NavLink, useLocation } from "react-router";
import { MoreSheet } from "@/components/layout/MoreSheet";
import { MORE_ITEMS, TAB_ITEMS } from "@/components/layout/navigation";

// Tab links and the "Mehr" button look alike. The current entry (aria-current "page" on links, "true" on
// the button) is marked by bold text and the bar on top. The ring stays inside: the bar ends at the
// bottom edge of the screen.
const TAB_CLASS =
  "group relative flex h-16 w-full flex-col items-center justify-center gap-1 text-meta text-muted-foreground transition-colors hover:text-foreground focus-visible:-outline-offset-2 aria-[current=page]:font-semibold aria-[current=page]:text-foreground aria-[current=true]:font-semibold aria-[current=true]:text-foreground";

function CurrentMarker() {
  return (
    <span className="absolute inset-x-4 top-0 hidden h-0.75 rounded-b-full bg-accent group-aria-[current=page]:block group-aria-[current=true]:block" />
  );
}

/** Tab bar below 768 px (KONZEPT §7): Übersicht · Verlauf · Postfach · Assistent · Mehr. */
export function MobileTabBar() {
  const { pathname } = useLocation();
  const moreIsCurrent = MORE_ITEMS.some(
    (item) => matchPath({ path: item.to, end: false }, pathname) !== null,
  );

  return (
    <nav
      aria-label="Hauptnavigation"
      data-testid="tab-bar"
      className="fixed inset-x-0 bottom-0 z-40 border-t bg-card md:hidden"
    >
      <ul className="grid grid-cols-5">
        {TAB_ITEMS.map((item) => (
          <li key={item.to}>
            <NavLink to={item.to} end={item.end} className={TAB_CLASS}>
              <CurrentMarker />
              <item.icon className="size-5" />
              {item.shortLabel ?? item.label}
            </NavLink>
          </li>
        ))}
        <li>
          <MoreSheet current={moreIsCurrent} triggerClassName={TAB_CLASS}>
            <CurrentMarker />
            <Ellipsis className="size-5" />
            Mehr
          </MoreSheet>
        </li>
      </ul>
    </nav>
  );
}
