import type { ReactNode } from "react";
import { Inbox } from "lucide-react";
import { cn } from "@/lib/utils";

/** Area without content: short title, optional explanation and a way out; no box of its own. */
export function EmptyState({
  title,
  description,
  action,
  className,
}: {
  title: string;
  description?: string;
  action?: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("flex flex-col items-start gap-1.5 py-3", className)}>
      <Inbox className="size-5 text-muted-foreground" aria-hidden="true" />
      <p className="text-card-title">{title}</p>
      {description && (
        <p className="max-w-prose text-body text-muted-foreground">
          {description}
        </p>
      )}
      {action}
    </div>
  );
}
