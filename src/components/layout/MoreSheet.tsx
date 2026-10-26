import type { ReactNode } from "react";
import { NavLink } from "react-router";
import { MORE_ITEMS } from "@/components/layout/navigation";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

/**
 * "Mehr" in the mobile tab bar (KONZEPT §7): a sheet from the bottom with Module & Noten, Fristen and
 * Einstellungen. The tab bar passes the look of the trigger; `current` marks it while one of these
 * pages is open.
 */
export function MoreSheet({
  current,
  triggerClassName,
  children,
}: {
  current: boolean;
  triggerClassName: string;
  children: ReactNode;
}) {
  return (
    <Sheet>
      <SheetTrigger
        className={triggerClassName}
        aria-current={current ? "true" : undefined}
      >
        {children}
      </SheetTrigger>
      <SheetContent
        side="bottom"
        aria-describedby={undefined}
        className="rounded-t-3xl"
      >
        <SheetHeader>
          <SheetTitle>Mehr</SheetTitle>
        </SheetHeader>
        <ul className="flex flex-col gap-1 px-4 pb-6">
          {MORE_ITEMS.map((item) => (
            <li key={item.to}>
              <SheetClose asChild>
                <NavLink
                  to={item.to}
                  end={item.end}
                  className="flex h-12 items-center gap-3 rounded-xl px-3 text-body transition-colors hover:bg-muted aria-[current=page]:bg-muted aria-[current=page]:font-semibold"
                >
                  <item.icon className="size-5 shrink-0 text-muted-foreground" />
                  {item.label}
                </NavLink>
              </SheetClose>
            </li>
          ))}
        </ul>
      </SheetContent>
    </Sheet>
  );
}
