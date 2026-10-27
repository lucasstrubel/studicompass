import { useSearchParams } from "react-router";
import { ResourceBoundary } from "@/components/common/ResourceBoundary";
import { Skeleton } from "@/components/ui/skeleton";
import { AssistantChat } from "./AssistantChat";

/** Assistent (KONZEPT §8 S5): `?frage=` asks a catalog question or free text, `?module=` sets the context. */
export function AssistantPage() {
  const [params] = useSearchParams();
  return (
    <ResourceBoundary
      services={["assistant", "rules"]}
      skeleton={
        <Skeleton
          role="status"
          aria-label="Assistent wird geladen"
          className="h-48"
        />
      }
    >
      {() => (
        <AssistantChat
          initialQuestion={params.get("frage") ?? params.get("q") ?? ""}
          moduleId={params.get("module") ?? params.get("modul")}
        />
      )}
    </ResourceBoundary>
  );
}
