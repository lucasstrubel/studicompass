import type { Channel, TrafficLight } from "@/domain/types";

/** UI names of the traffic-light status (KONZEPT §14). */
export const STATUS_LABELS: Record<TrafficLight, string> = {
  onTrack: "Im Plan",
  tight: "Knapp",
  critical: "Kritisch",
};

/** UI names of the channels (Kanal, KONZEPT §14). */
export const CHANNEL_LABELS: Record<Channel, string> = {
  pos: "POS",
  moodle: "Moodle",
  mail: "Mail",
  website: "Website",
};
