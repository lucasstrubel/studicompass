import { useParams } from "react-router";
import { Skeleton } from "@/components/ui/skeleton";
import { ResourceBoundary } from "@/components/common/ResourceBoundary";
import { ModuleDetail } from "./ModuleDetail";
import { ModuleList } from "./ModuleList";

/** Module & Noten (KONZEPT §8 S3): list at /module, detail at /module/:moduleId. */
export function ModulesPage() {
  const { moduleId } = useParams();
  return (
    <ResourceBoundary
      services={["pos"]}
      skeleton={
        <Skeleton
          role="status"
          aria-label="Module werden geladen"
          className="h-64"
        />
      }
    >
      {() => (moduleId ? <ModuleDetail id={moduleId} /> : <ModuleList />)}
    </ResourceBoundary>
  );
}
