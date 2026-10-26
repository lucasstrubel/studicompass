import { Link } from "react-router";
import { Button } from "@/components/ui/button";

/** 404 (KONZEPT §8); the title "Seite nicht gefunden" comes from the route. */
export function NotFoundPage() {
  return (
    <div className="flex flex-col items-start gap-4">
      <p>Diese Seite gibt es nicht.</p>
      <Button asChild>
        <Link to="/">Zur Übersicht</Link>
      </Button>
    </div>
  );
}
