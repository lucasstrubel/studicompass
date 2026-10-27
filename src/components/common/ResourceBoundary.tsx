import type { ReactNode } from "react";
import { useDemoStore } from "@/store/use-demo-store";
import type { ServiceKey } from "@/services/types";
import { ErrorState } from "./ErrorState";
import { SERVICE_LABELS } from "./labels";

/**
 * Loading and error state of a data area (KONZEPT §8, Q-2): the skeleton while one of the services has no
 * data yet, one error with retry per failed service, otherwise the content. After a failed reload the
 * older data stays visible next to the error.
 */
export function ResourceBoundary({
  services,
  skeleton,
  children,
}: {
  services: ServiceKey[];
  skeleton: ReactNode;
  children: () => ReactNode;
}) {
  const resources = useDemoStore((state) => state.resources);
  const retry = useDemoStore((state) => state.retry);
  const failed = services.filter((key) => resources[key].status === "error");
  const missing = services.filter((key) => !resources[key].data);

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

  if (missing.some((key) => !failed.includes(key))) return <>{skeleton}</>;
  if (missing.length > 0) return <div className="space-y-2">{errors}</div>;
  return (
    <>
      {errors.length > 0 && <div className="mb-3 space-y-2">{errors}</div>}
      {children()}
    </>
  );
}
