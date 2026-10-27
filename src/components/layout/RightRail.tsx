import type { ReactNode } from "react";

/** Right column (KONZEPT §7): 320 px next to the main column from 1280 px, below it on smaller screens. */
export function RightRail({ children }: { children: ReactNode }) {
  return (
    <aside className="min-w-0 border-t bg-muted px-4 pt-6 pb-24 md:px-6 md:rounded-b-3xl xl:w-80 xl:rounded-bl-none xl:border-t-0 xl:border-l">
      {children}
    </aside>
  );
}
