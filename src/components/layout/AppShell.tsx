import { useRef } from "react";
import { Outlet } from "react-router";
import { MobileTabBar } from "@/components/layout/MobileTabBar";
import { RightRail } from "@/components/layout/RightRail";
import { useRouteHandle } from "@/components/layout/route-handle";
import { Sidebar } from "@/components/layout/Sidebar";
import { Topbar } from "@/components/layout/Topbar";
import { APP_NAME } from "@/config/demo";

/** Layout of every app page (KONZEPT §7, §12.1); the route's handle supplies title and right column. */
export function AppShell() {
  const handle = useRouteHandle();
  const mainRef = useRef<HTMLElement>(null);
  const RightRailContent = handle?.rightRail;

  return (
    <>
      {/* Moves the focus without a #hash in the URL, which the router would record as a navigation. */}
      <a
        href="#inhalt"
        onClick={(event) => {
          event.preventDefault();
          mainRef.current?.focus();
        }}
        className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-50 focus:rounded-lg focus:bg-card focus:px-4 focus:py-2 focus:text-foreground focus:shadow-lg"
      >
        Zum Inhalt
      </a>
      <div className="flex min-h-dvh">
        <Sidebar />
        {/* Below 768 px the fixed tab bar covers the last 4 rem of the page. */}
        <div className="flex min-w-0 flex-1 flex-col pb-16 md:pb-0 xl:flex-row">
          <div className="flex min-w-0 flex-1 flex-col">
            <Topbar title={handle?.title ?? APP_NAME} />
            {/* Target of the skip link. Only script focuses it, so it shows no ring. */}
            <main
              id="inhalt"
              ref={mainRef}
              tabIndex={-1}
              className="flex-1 px-4 py-6 outline-none md:px-6 xl:px-8"
            >
              <Outlet />
            </main>
          </div>
          {RightRailContent && (
            <RightRail>
              <RightRailContent />
            </RightRail>
          )}
        </div>
      </div>
      <MobileTabBar />
    </>
  );
}
