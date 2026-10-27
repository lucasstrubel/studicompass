import { ClipboardList, Globe, GraduationCap, Mail } from "lucide-react";
import type { Channel } from "@/domain/types";
import { cn } from "@/lib/utils";
import { CHANNEL_LABELS } from "./labels";

const CHANNEL_ICONS: Record<Channel, typeof Mail> = {
  pos: ClipboardList,
  moodle: GraduationCap,
  mail: Mail,
  website: Globe,
};

/** Origin system of a piece of information (Kanal, KONZEPT §14) as icon + name. */
export function ChannelBadge({
  channel,
  className,
}: {
  channel: Channel;
  className?: string;
}) {
  const Icon = CHANNEL_ICONS[channel];
  return (
    <span
      className={cn(
        "inline-flex w-fit shrink-0 items-center gap-1 rounded-full border px-2 py-0.5 text-meta text-muted-foreground",
        className,
      )}
    >
      <Icon className="size-3.5" aria-hidden="true" />
      {CHANNEL_LABELS[channel]}
    </span>
  );
}
