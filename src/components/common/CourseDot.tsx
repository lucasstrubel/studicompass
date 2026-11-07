import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export type CourseDotState = "done" | "current" | "planned";

/**
 * One control of the course line outside the hero: filled once passed, in the brand colour where the student
 * is now, open ahead and with a second ring at the end. Decorative: the surrounding text says the same.
 */
export function CourseDot({
  state,
  last = false,
  children,
}: {
  state: CourseDotState;
  /** The finish: drawn as the double circle of an orienteering map. */
  last?: boolean;
  children?: ReactNode;
}) {
  return (
    <span
      aria-hidden="true"
      className={cn(
        "relative z-10 flex size-7 shrink-0 items-center justify-center rounded-full text-meta font-semibold tabular-nums",
        state === "done" && "bg-foreground text-background",
        state === "current" && "bg-accent text-accent-foreground",
        state === "planned" && "border-2 border-input bg-background",
        last &&
          state === "planned" &&
          "outline-2 outline-offset-2 outline-input",
      )}
    >
      {children}
    </span>
  );
}

/** The stretch between two controls: solid once passed, dotted ahead. */
export function CourseLine({
  state,
  className,
}: {
  state: CourseDotState;
  className?: string;
}) {
  return (
    <span
      aria-hidden="true"
      className={cn(
        state === "done"
          ? "h-0.5 bg-foreground"
          : "border-t-2 border-dotted border-input",
        className,
      )}
    />
  );
}
