import {
  CheckCircle2,
  CircleAlert,
  CircleDashed,
  Clock,
  Undo2,
  type LucideIcon,
} from "lucide-react";
import type { ExamRecord, ExamStatus } from "@/domain/types";
import { EXAM_STATUS } from "./module-labels";

// One icon per status, the same ones as in the Studienverlauf and on the Übersicht.
const ICONS: Record<ExamStatus, LucideIcon> = {
  passed: CheckCircle2,
  failed: CircleAlert,
  registered: Clock,
  withdrawn: Undo2,
};

/** Exam status as icon and text; "Geplant" when no exam exists yet. */
export function ExamStatusLabel({ exam }: { exam: ExamRecord | null }) {
  const Icon = exam ? ICONS[exam.status] : CircleDashed;
  return (
    <span className="inline-flex items-center gap-1 text-meta">
      <Icon className="size-4 shrink-0" aria-hidden="true" />
      {exam ? EXAM_STATUS[exam.status] : "Geplant"}
    </span>
  );
}
