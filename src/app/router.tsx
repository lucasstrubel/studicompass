import { createBrowserRouter, type RouteObject } from "react-router";
import { HomePage } from "@/app/HomePage";

// Developer route with all shadcn components. import.meta.env.DEV is false in the production
// build, so the route and its lazily loaded chunk are left out of dist/.
const devRoutes: RouteObject[] = import.meta.env.DEV
  ? [
      {
        path: "/_ui",
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

export const router = createBrowserRouter([
  { path: "/", Component: HomePage },
  ...devRoutes,
]);
