import type { ReactNode } from "react";

/** Right column (KONZEPT §7): 320 px next to the main column from 1280 px, below it on smaller screens. */
export function RightRail({ children }: { children: ReactNode }) {
  return (
    <aside className="border-t bg-muted px-4 py-6 md:px-6 xl:w-80 xl:shrink-0 xl:border-t-0 xl:border-l">
      {children}
    </aside>
  );
}
