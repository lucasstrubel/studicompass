import { CHANNEL_LABELS } from "./labels";
import { ResourceBoundary } from "./ResourceBoundary";
import { Skeleton } from "@/components/ui/skeleton";
import { useDemoStore } from "@/store/use-demo-store";
import { formatShortDateTime } from "@/lib/format";

const CHANNELS = ["pos", "moodle", "mail", "website"] as const;

/** Individual boundaries keep healthy channels usable when another one fails. */
export function ChannelStatus() {
  const resources = useDemoStore((state) => state.resources);
  const connected = useDemoStore((state) => state.connectedChannels);
  return (
    <section
      aria-label="Sync-Status"
      className="grid gap-2 text-meta sm:grid-cols-2 xl:grid-cols-4"
    >
      {CHANNELS.map((channel) => (
        <div key={channel} className="min-w-0 rounded-lg border bg-card p-3">
          {!connected[channel] && (
            <p className="mb-2 font-semibold">
              Verbindung getrennt · vorhandene Daten bleiben sichtbar
            </p>
          )}
          <ResourceBoundary
            services={[channel]}
            skeleton={
              <Skeleton
                role="status"
                aria-label={`${CHANNEL_LABELS[channel]} wird geladen`}
                className="h-10"
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
