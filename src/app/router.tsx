import { createBrowserRouter, type RouteObject } from "react-router";
import { NotFoundPage } from "@/app/NotFoundPage";
import { RootLayout } from "@/app/RootLayout";
import { AppShell } from "@/components/layout/AppShell";
import type { RouteHandle } from "@/components/layout/route-handle";
import { OverviewEntry } from "@/features/onboarding/OverviewEntry";
import { DashboardRail } from "@/features/dashboard/DashboardRail";
import { DecisionPage } from "@/features/decision/DecisionPage";
import { PlannerRoute, PlannerRouteError } from "@/app/PlannerRoute";
import { OnboardingPage } from "@/features/onboarding/OnboardingPage";
import { AssistantPage } from "@/features/assistant/AssistantPage";
import { InboxPage } from "@/features/inbox/InboxPage";
import { ModulesPage } from "@/features/modules/ModulesPage";
import { DeadlinesPage } from "@/features/deadlines/DeadlinesPage";
import { SettingsPage } from "@/features/settings/SettingsPage";
import { OfficesPage } from "@/features/offices/OfficesPage";

type PageRoute = RouteObject & { handle: RouteHandle };

/** Pages inside the app shell (KONZEPT §7). */
const shellRoutes: PageRoute[] = [
  {
    index: true,
    Component: OverviewEntry,
    handle: { title: "Übersicht", rightRail: DashboardRail, ownHeader: true },
  },
  {
    path: "verlauf",
    Component: PlannerRoute,
    ErrorBoundary: PlannerRouteError,
    handle: { title: "Studienverlauf", ownHeader: true },
  },
  {
    path: "module",
    Component: ModulesPage,
    handle: { title: "Module & Noten" },
  },
  {
    path: "module/:moduleId",
    Component: ModulesPage,
    handle: { title: "Module & Noten" },
  },
  { path: "postfach", Component: InboxPage, handle: { title: "Postfach" } },
  {
    path: "assistent",
    Component: AssistantPage,
    handle: { title: "Assistent" },
  },
  { path: "fristen", Component: DeadlinesPage, handle: { title: "Fristen" } },
  {
    path: "anlaufstellen",
    Component: OfficesPage,
    handle: { title: "Anlaufstellen" },
  },
  {
    path: "entscheidung/:examId",
    Component: DecisionPage,
    handle: { title: "Folgen-Check", ownHeader: true },
  },
  {
    path: "einstellungen",
    Component: SettingsPage,
    handle: { title: "Einstellungen" },
  },
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
