import type { ReactNode } from "react";
import { ArrowRight } from "lucide-react";
import { DemoBadge } from "@/components/common/DemoBadge";
import { StatusBadge } from "@/components/common/StatusBadge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { format } from "@/domain/terms";
import type { PlanProjection, Term } from "@/domain/types";

/** The move the dialog reports on; null when it is reopened without a recorded move. */
export interface LastMove {
  moduleId: string;
  title: string;
  term: Term;
}

function Change({
  label,
  real,
  simulated,
}: {
  label: string;
  real: Term | null;
  simulated: Term | null;
}) {
  const text = (term: Term | null) => (term ? format(term) : "nicht planbar");
  return (
    <div className="flex flex-wrap items-baseline justify-between gap-x-3 border-b py-2 last:border-b-0">
      <dt className="text-meta text-muted-foreground">{label}</dt>
      <dd className="flex items-center gap-1.5 text-body tabular-nums">
        <span>{text(real)}</span>
        <ArrowRight className="size-3.5" aria-hidden="true" />
        <span className="sr-only">wird zu</span>
        <span className="font-semibold">{text(simulated)}</span>
      </dd>
    </div>
  );
}

/**
 * Result of a what-if move (KONZEPT §8 S2, P5-11): opens right where Niklas moved a module, so the
 * consequences no longer require scrolling back to the top (feedback P5-F19). The page keeps a compact
 * simulation status that reopens it.
 */
export function SimulationResultDialog({
  open,
  onOpenChange,
  move,
  plan,
  basePlan,
  shifted,
  consequences,
  onUndoMove,
  onDiscard,
  onCloseAutoFocus,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  move: LastMove | null;
  plan: PlanProjection;
  basePlan: PlanProjection;
  /** Titles of the modules that moved along, without the module Niklas moved himself. */
  shifted: string[];
  consequences: ReactNode;
  onUndoMove: () => void;
  onDiscard: () => void;
  onCloseAutoFocus: (event: Event) => void;
}) {
  const listed = shifted.slice(0, 4);
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        // Head and actions stay visible; only the middle scrolls, and the column never outgrows the dialog.
        className="max-h-[90dvh] grid-cols-[minmax(0,1fr)] grid-rows-[auto_minmax(0,1fr)_auto] gap-4 sm:max-w-xl"
        onCloseAutoFocus={onCloseAutoFocus}
      >
        <DialogHeader>
          <DemoBadge variant="simulation" className="w-fit" />
          <DialogTitle className="text-section-title">
            {move
              ? `Simulation: ${move.title} → ${format(move.term)}`
              : "Simulation: Ergebnis"}
          </DialogTitle>
          <DialogDescription className="text-body text-muted-foreground">
            So ändert sich dein Plan. Deine echten Daten bleiben unverändert.
          </DialogDescription>
        </DialogHeader>
        <div className="-mx-2 min-h-0 space-y-4 overflow-y-auto px-2 focus-visible:-outline-offset-2">
          <dl>
            <Change
              label="Abschluss"
              real={basePlan.graduationTerm}
              simulated={plan.graduationTerm}
            />
            <Change
              label="Praxissemester"
              real={basePlan.internshipTerm}
              simulated={plan.internshipTerm}
            />
            <div className="flex flex-wrap items-center justify-between gap-x-3 py-2">
              <dt className="text-meta text-muted-foreground">Status</dt>
              <dd>
                <StatusBadge status={plan.trafficLight} />
              </dd>
            </div>
          </dl>
          {shifted.length > 0 && (
            <p className="text-body">
              <span className="font-semibold">
                Mit verschoben: {shifted.length}{" "}
                {shifted.length === 1 ? "Modul" : "Module"}
              </span>{" "}
              ({listed.join(", ")}
              {shifted.length > listed.length &&
                ` und ${shifted.length - listed.length} weitere`}
              ). Sie folgen den Regeln, etwa wenn sich ein Meilenstein
              verschiebt.
            </p>
          )}
          {consequences}
        </div>
        <DialogFooter className="gap-2 sm:flex-wrap sm:justify-start">
          <Button onClick={() => onOpenChange(false)}>Weiter simulieren</Button>
          {move && (
            <Button variant="outline" onClick={onUndoMove}>
              Verschiebung zurücknehmen
            </Button>
          )}
          <Button variant="outline" onClick={onDiscard}>
            Simulation verwerfen
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
