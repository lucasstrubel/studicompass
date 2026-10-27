import type { ReactNode } from "react";
import { useDemoStore } from "@/store/use-demo-store";
import type { ServiceKey } from "@/services/types";
import { ErrorState } from "./ErrorState";
import { SERVICE_LABELS } from "./labels";
import { EmptyState } from "./EmptyState";

/**
 * Loading and error state of a data area (KONZEPT §8, Q-2): the skeleton while one of the services has no
 * data yet, one error with retry per failed service, otherwise the content. After a failed reload the
 * older data stays visible next to the error.
 */
export function ResourceBoundary({
  services,
  skeleton,
  header,
  children,
}: {
  services: ServiceKey[];
  skeleton: ReactNode;
  /** Shown above skeleton or errors (e.g. the page's h1), because the content brings its own header. */
  header?: ReactNode;
  children: () => ReactNode;
}) {
  const resources = useDemoStore((state) => state.resources);
  const retry = useDemoStore((state) => state.retry);
  const connected = useDemoStore((state) => state.connectedChannels);
  const failed = services.filter((key) => resources[key].status === "error");
  const missing = services.filter((key) => !resources[key].data);
  const disconnected = missing.filter(
    (key) => key !== "rules" && key !== "assistant" && !connected[key],
  );

  const errors = failed.map((key) => (
    <ErrorState
      key={key}
      title={`${SERVICE_LABELS[key]} konnte nicht geladen werden`}
      message={
        resources[key].error ??
        "Die Beispieldaten konnten nicht geladen werden."
      }
      updatedAt={resources[key].updatedAt}
      onRetry={() => void retry(key)}
      retryLabel={`${SERVICE_LABELS[key]} erneut laden`}
    />
  ));

  if (
    missing.some((key) => !failed.includes(key) && !disconnected.includes(key))
  )
    return (
      <>
        {header}
        {skeleton}
      </>
    );
  if (missing.length > 0)
    return (
      <>
        {header}
        <div className="space-y-2">{errors}</div>
        {disconnected.map((key) => (
          <EmptyState
            key={key}
            title={`${SERVICE_LABELS[key]} ist getrennt`}
            description="Verbinde den Kanal in den Einstellungen, um seine Beispieldaten zu laden."
          />
        ))}
      </>
    );
  return (
    <>
      {errors.length > 0 && <div className="mb-3 space-y-2">{errors}</div>}
      {children()}
    </>
  );
}
