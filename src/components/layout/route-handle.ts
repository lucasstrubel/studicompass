import type { ComponentType } from "react";
import { useMatches } from "react-router";

/** What a route tells the shell, set as `handle` on the route in src/app/router.tsx. */
export interface RouteHandle {
  /** Page title: h1 in the content area and browser tab title "<title> · StudiCompass". */
  title: string;
  /** Content of the right column (KONZEPT §7): next to the main area on desktop, below it otherwise. */
  rightRail?: ComponentType;
  /** The page renders its own h1 (PageHeader); the shell then leaves its h1 out. */
  ownHeader?: boolean;
}

function isRouteHandle(handle: unknown): handle is RouteHandle {
  return (
    typeof handle === "object" &&
    handle !== null &&
    "title" in handle &&
    typeof handle.title === "string" &&
    (!("rightRail" in handle) ||
      handle.rightRail === undefined ||
      typeof handle.rightRail === "function") &&
    (!("ownHeader" in handle) ||
      handle.ownHeader === undefined ||
      typeof handle.ownHeader === "boolean")
  );
}

/** Handle of the deepest matched route that has one. */
export function useRouteHandle(): RouteHandle | undefined {
  return useMatches()
    .map((match) => match.handle)
    .filter(isRouteHandle)
    .at(-1);
}
