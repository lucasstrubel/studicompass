import type { ComponentProps, ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

/** Compact group for switching a view or filter; the pressed option looks raised, the others recede. */
export function SegmentedGroup({
  label,
  children,
}: {
  label: string;
  children: ReactNode;
}) {
  return (
    <div
      role="group"
      aria-label={label}
      className="inline-flex max-w-full flex-wrap gap-0.5 rounded-lg bg-muted p-0.5"
    >
      {children}
    </div>
  );
}

export function SegmentedButton({
  pressed,
  className,
  ...props
}: Omit<ComponentProps<typeof Button>, "variant" | "size"> & {
  pressed: boolean;
}) {
  return (
    <Button
      variant="ghost"
      size="sm"
      aria-pressed={pressed}
      className={cn(
        "text-muted-foreground hover:bg-card/60 aria-pressed:bg-card aria-pressed:font-semibold aria-pressed:text-foreground",
        className,
      )}
      {...props}
    />
  );
}
