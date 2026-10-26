import { Outlet, ScrollRestoration } from "react-router";
import { useRouteHandle } from "@/components/layout/route-handle";
import { APP_NAME } from "@/config/demo";

/** Root of every route: browser tab title and scroll position. */
export function RootLayout() {
  const title = useRouteHandle()?.title;

  return (
    <>
      {/* React 19 renders this into <head>, taking over the static <title> from index.html. */}
      <title>{title ? `${title} · ${APP_NAME}` : APP_NAME}</title>
      {/* New pages start at the top; back and forward restore the position. Links that only change
          the search params (e.g. the Postfach detail, P4-02) pass preventScrollReset. */}
      <ScrollRestoration />
      <Outlet />
    </>
  );
}
