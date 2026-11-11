import { useRef } from "react";
import { Outlet } from "react-router";
import { RightRail } from "@/components/layout/RightRail";
import { useRouteHandle } from "@/components/layout/route-handle";
import { Topbar } from "@/components/layout/Topbar";
import { APP_NAME } from "@/config/demo";
import { useDemoStore } from "@/store/use-demo-store";
import { CHANNEL_LABELS } from "@/components/common/labels";
import { AssistantLauncher } from "@/features/assistant/AssistantLauncher";
import { ProductTour } from "@/features/onboarding/ProductTour";
import { CHANNELS } from "@/services/types";
import { cn } from "@/lib/utils";

/** Layout of every app page; the route's handle supplies title and right column. */
export function AppShell() {
  const handle = useRouteHandle();
  const mainRef = useRef<HTMLElement>(null);
  const RightRailContent = handle?.rightRail;
  const PageTop = handle?.pageTop;
  const connected = useDemoStore((state) => state.connectedChannels);
  const disconnected = CHANNELS.filter((channel) => !connected[channel]);

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
      <div className="flex min-h-dvh min-w-0 flex-col">
        <Topbar />
        <main
          id="inhalt"
          ref={mainRef}
          tabIndex={-1}
          className={cn(
            "mx-auto grid w-full max-w-360 min-w-0 flex-1 outline-none xl:grid-cols-[minmax(0,1fr)_auto]",
            PageTop && "content-start",
          )}
        >
          {/*
            The last column (content or right column) keeps its end clear of the assistant button. Full-width
            pages also keep their right edge clear of it from 1280 px, where tables and columns reach that
            edge; from 1600 px the button sits beside the centred page anyway.
          */}
          {PageTop && (
            <div className="min-w-0 px-4 pt-6 md:px-6 md:pt-8 xl:col-span-2 xl:px-8">
              <PageTop />
            </div>
          )}
          <div
            className={cn(
              "min-w-0 px-4 py-6 last:pb-24 md:px-6 md:py-8 md:last:pb-24 xl:px-8 xl:last:pr-24 min-[100rem]:last:pr-8",
              PageTop && "pt-0 md:pt-0",
            )}
          >
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
            <RightRail belowPageTop={Boolean(PageTop)}>
              <RightRailContent />
            </RightRail>
          )}
        </main>
      </div>
      <AssistantLauncher />
      <ProductTour />
    </>
  );
}
