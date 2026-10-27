import { useRef } from "react";
import { Outlet } from "react-router";
import { RightRail } from "@/components/layout/RightRail";
import { useRouteHandle } from "@/components/layout/route-handle";
import { Topbar } from "@/components/layout/Topbar";
import { APP_NAME } from "@/config/demo";
import { useDemoStore } from "@/store/use-demo-store";
import { CHANNEL_LABELS } from "@/components/common/labels";
import { ProductTour } from "@/features/onboarding/ProductTour";

/** Layout of every app page (KONZEPT §7, §12.1); the route's handle supplies title and right column. */
export function AppShell() {
  const handle = useRouteHandle();
  const mainRef = useRef<HTMLElement>(null);
  const RightRailContent = handle?.rightRail;
  const connected = useDemoStore((state) => state.connectedChannels);
  const disconnected = (["pos", "moodle", "mail", "website"] as const).filter(
    (channel) => !connected[channel],
  );

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
      <div className="app-frame mx-auto flex min-h-dvh min-w-0 max-w-400 flex-col bg-background md:my-6 md:min-h-[calc(100dvh-3rem)] md:w-[calc(100%-3rem)] md:rounded-3xl md:border">
        <div className="md:rounded-t-3xl md:[&>header]:rounded-t-3xl">
          <Topbar />
        </div>
        <main
          id="inhalt"
          ref={mainRef}
          tabIndex={-1}
          className="grid min-w-0 flex-1 outline-none xl:grid-cols-[minmax(0,1fr)_auto]"
        >
          <div className="min-w-0 px-4 py-6 md:px-6 md:py-7 xl:px-8">
            {!handle?.ownHeader && (
              <h1 className="mb-6 text-page-title">
                {handle?.title ?? APP_NAME}
              </h1>
            )}
            <Outlet />
            {disconnected.length > 0 && (
              <p
                role="status"
                className="mt-4 rounded-lg border bg-muted p-3 text-meta"
              >
                Verbindung getrennt (Simulation):{" "}
                {disconnected
                  .map((channel) => CHANNEL_LABELS[channel])
                  .join(", ")}
                . Vorhandene Daten bleiben sichtbar und werden nicht
                aktualisiert. Verbinde den Kanal in den Einstellungen erneut.
              </p>
            )}
          </div>
          {RightRailContent && (
            <RightRail>
              <RightRailContent />
            </RightRail>
          )}
        </main>
      </div>
      <ProductTour />
    </>
  );
}
