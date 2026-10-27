import type { ReactNode } from "react";
import { Inbox } from "lucide-react";
import { cn } from "@/lib/utils";

/** Area without content: short title, optional explanation and a way out. */
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
    <div
      className={cn(
        "flex flex-col items-start gap-2 rounded-xl border border-dashed border-input p-4",
        className,
      )}
    >
      <Inbox className="size-4.5 text-muted-foreground" aria-hidden="true" />
      <p className="text-card-title">{title}</p>
      {description && (
        <p className="text-meta text-muted-foreground">{description}</p>
      )}
      {action}
    </div>
  );
}
