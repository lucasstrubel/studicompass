import { createBrowserRouter, type RouteObject } from "react-router";
import { NotFoundPage } from "@/app/NotFoundPage";
import { RootLayout } from "@/app/RootLayout";
import { AppShell } from "@/components/layout/AppShell";
import type { RouteHandle } from "@/components/layout/route-handle";
import { DashboardPage } from "@/features/dashboard/DashboardPage";
import { DashboardRail } from "@/features/dashboard/DashboardRail";
import { OnboardingPage } from "@/features/onboarding/OnboardingPage";

type PageRoute = RouteObject & { handle: RouteHandle };

/**
 * A page that shows only its title in the top bar until its task fills it (P3-02 onwards). The explicit
 * `element: null` marks the empty page as intended; React Router warns about leaf routes without one.
 */
function titleOnly(title: string) {
  return { element: null, handle: { title } };
}

/** Pages inside the app shell (KONZEPT §7). */
const shellRoutes: PageRoute[] = [
  {
    index: true,
    Component: DashboardPage,
    handle: { title: "Übersicht", rightRail: DashboardRail, ownHeader: true },
  },
  { path: "verlauf", ...titleOnly("Studienverlauf") },
  { path: "module", ...titleOnly("Module & Noten") },
  { path: "module/:moduleId", ...titleOnly("Module & Noten") },
  { path: "postfach", ...titleOnly("Postfach") },
  { path: "assistent", ...titleOnly("Assistent") },
  { path: "fristen", ...titleOnly("Fristen") },
  { path: "entscheidung/:examId", ...titleOnly("Folgen-Check") },
  { path: "einstellungen", ...titleOnly("Einstellungen") },
  {
    path: "*",
    Component: NotFoundPage,
    handle: { title: "Seite nicht gefunden" },
  },
];

const onboardingRoute: PageRoute = {
  path: "start",
  Component: OnboardingPage,
  handle: { title: "Onboarding" },
};

// Developer route with all shadcn components. import.meta.env.DEV is false in the production
// build, so the route and its lazily loaded chunk are left out of dist/.
const devRoutes: RouteObject[] = import.meta.env.DEV
  ? [
      {
        path: "_ui",
        // Shown while the lazy chunk loads on a direct visit; avoids React Router's warning.
        hydrateFallbackElement: (
          <p className="p-8">Komponenten werden geladen …</p>
        ),
        lazy: async () => {
          const { UiShowcasePage } =
            await import("@/features/dev-ui/UiShowcasePage");
          return { Component: UiShowcasePage };
        },
      },
    ]
  : [];

export const routes: RouteObject[] = [
  {
    path: "/",
    Component: RootLayout,
    children: [
      { Component: AppShell, children: shellRoutes },
      onboardingRoute,
      ...devRoutes,
    ],
  },
];

export const router = createBrowserRouter(routes);
