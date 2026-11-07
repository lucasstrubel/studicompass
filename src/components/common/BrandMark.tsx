import { cn } from "@/lib/utils";

/**
 * The compass needle: logo and avatar of the assistant. The pointing half carries the brand colour, the other
 * half the text colour of its surface. `mono` draws both halves from the text colour, for mandarin surfaces.
 */
export function BrandMark({
  className,
  mono = false,
}: {
  className?: string;
  mono?: boolean;
}) {
  return (
    <svg
      viewBox="0 0 24 24"
      aria-hidden="true"
      className={cn("size-6 shrink-0", className)}
    >
      <path
        d="M20 4 14.5 14.5 9.5 9.5Z"
        strokeWidth="1"
        strokeLinejoin="round"
        className={cn(
          mono ? "fill-current stroke-current" : "fill-accent stroke-accent",
        )}
      />
      <path
        d="M4 20 9.5 9.5 14.5 14.5Z"
        strokeWidth="1"
        strokeLinejoin="round"
        className={cn("fill-current stroke-current", mono && "opacity-45")}
      />
    </svg>
  );
}
