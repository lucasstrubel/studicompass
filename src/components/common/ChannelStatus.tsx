import { CHANNEL_LABELS } from "./labels";
import { ResourceBoundary } from "./ResourceBoundary";
import { Skeleton } from "@/components/ui/skeleton";
import { useDemoStore } from "@/store/use-demo-store";
import { formatShortDateTime } from "@/lib/format";
import { CHANNELS } from "@/services/types";

/**
 * One quiet line while everything is fine; errors and disconnects take the room they need. Individual boundaries
 * keep healthy channels usable when another one fails.
 */
export function ChannelStatus() {
  const resources = useDemoStore((state) => state.resources);
  const connected = useDemoStore((state) => state.connectedChannels);
  return (
    <section
      aria-label="Sync-Status"
      className="flex flex-wrap gap-x-5 gap-y-1 text-meta text-muted-foreground"
    >
      {CHANNELS.map((channel) => (
        <div key={channel} className="max-w-full min-w-0">
          {!connected[channel] && resources[channel].data && (
            <p className="font-semibold text-foreground">
              Verbindung getrennt · vorhandene Daten bleiben sichtbar
            </p>
          )}
          <ResourceBoundary
            services={[channel]}
            skeleton={
              <Skeleton
                role="status"
                aria-label={`${CHANNEL_LABELS[channel]} wird geladen`}
                className="h-5 w-48"
              />
            }
          >
            {() => (
              <p>
                {CHANNEL_LABELS[channel]} · zuletzt aktualisiert{" "}
                {resources[channel].updatedAt
                  ? formatShortDateTime(new Date(resources[channel].updatedAt))
                  : "unbekannt"}
              </p>
            )}
          </ResourceBoundary>
        </div>
      ))}
    </section>
  );
}
