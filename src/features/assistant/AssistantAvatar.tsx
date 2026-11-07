import { m } from "motion/react";

/**
 * The assistant's face is the compass needle. While an answer is being prepared the needle searches; when it
 * arrives it swings back and settles. A spring can start from wherever the needle is at that moment, which a
 * CSS animation cannot. Reduced motion keeps it still (MotionConfig in AppProviders).
 */
export function AssistantAvatar({ thinking = false }: { thinking?: boolean }) {
  return (
    <span
      aria-hidden="true"
      className="flex size-8 shrink-0 items-center justify-center rounded-full bg-foreground text-background"
    >
      <svg viewBox="0 0 24 24" className="size-5">
        <m.g
          initial={false}
          animate={
            thinking ? { rotate: [0, -40, 28, -18, 12, 0] } : { rotate: 0 }
          }
          transition={
            thinking
              ? { duration: 1, ease: "easeInOut", repeat: Infinity }
              : { type: "spring", duration: 0.6, bounce: 0.3 }
          }
        >
          <path d="M20 4 14.5 14.5 9.5 9.5Z" className="fill-accent" />
          <path d="M4 20 9.5 9.5 14.5 14.5Z" className="fill-current" />
        </m.g>
      </svg>
    </span>
  );
}
