import { Undo2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { selectCurrentExams, selectUndoableExamId } from "@/store/selectors";
import { useDemoStore } from "@/store/use-demo-store";
import { DemoBadge } from "./DemoBadge";

/**
 * Marks a simulated withdrawal wherever its effects show (overview, timeline) and offers to undo the latest
 * one (KONZEPT §10.6).
 */
export function WithdrawalNotice() {
  const withdrawn = useDemoStore(selectCurrentExams).filter(
    (item) => item.exam.status === "withdrawn",
  );
  const undoableId = useDemoStore(selectUndoableExamId);
  const undoable = withdrawn.find((item) => item.exam.id === undoableId);
  const undo = useDemoStore((state) => state.undo);
  if (withdrawn.length === 0) return null;
  return (
    <div className="flex flex-wrap items-center gap-3 rounded-xl border border-status-info bg-status-info-soft p-3 text-status-info-foreground">
      <DemoBadge variant="simulation" className="bg-card" />
      <p className="flex-1 text-body">
        Simulierte Abmeldung:{" "}
        {withdrawn.map((item) => item.module.title).join(", ")}. Im echten
        Betrieb meldest du dich im POS ab.
      </p>
      {undoable && (
        <Button variant="outline" size="sm" onClick={undo}>
          <Undo2 aria-hidden="true" />
          Rückgängig
          {withdrawn.length > 1 && `: ${undoable.module.title}`}
        </Button>
      )}
    </div>
  );
}
