import type { ReactNode } from "react";

/** Right column: next to the main column from 1280 px, below it on smaller screens. It has no surface of its own. */
export function RightRail({ children }: { children: ReactNode }) {
  return (
    <aside className="min-w-0 border-t px-4 pt-6 pb-24 md:px-6 xl:w-88 xl:border-t-0 xl:pt-8 xl:pr-8 xl:pl-0">
      {children}
    </aside>
  );
}
