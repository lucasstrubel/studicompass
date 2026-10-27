import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

/**
 * Page heading (the page's only h1) with optional meta line, description and actions. Routes that use it
 * set `ownHeader` in their handle, so the shell leaves out its own h1.
 */
export function PageHeader({
  title,
  description,
  meta,
  actions,
  headingLevel = 1,
  className,
}: {
  title: string;
  /** 2 only where the page already has an h1 (component showcase). */
  headingLevel?: 1 | 2;
  description?: ReactNode;
  meta?: ReactNode;
  actions?: ReactNode;
  className?: string;
}) {
  const Heading = headingLevel === 1 ? "h1" : "h2";
  return (
    <header
      className={cn(
        "mb-6 flex flex-wrap items-end justify-between gap-4",
        className,
      )}
    >
      <div className="min-w-0 space-y-2">
        {meta && (
          <div className="flex flex-wrap items-center gap-2">{meta}</div>
        )}
        <Heading className="text-page-title">{title}</Heading>
        {description && (
          <div className="max-w-prose text-body text-muted-foreground">
            {description}
          </div>
        )}
      </div>
      {actions && <div className="flex flex-wrap gap-2">{actions}</div>}
    </header>
  );
}
