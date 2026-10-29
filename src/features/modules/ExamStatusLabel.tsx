import { CheckCircle2, Circle, CircleAlert } from "lucide-react";
import type { ExamRecord } from "@/domain/types";
import { EXAM_STATUS } from "./module-labels";

/** Exam status as icon and text (KONZEPT §8 S3); "Geplant" when no exam exists yet. */
export function ExamStatusLabel({ exam }: { exam: ExamRecord | null }) {
  const Icon =
    exam?.status === "passed"
      ? CheckCircle2
      : exam?.status === "failed"
        ? CircleAlert
        : Circle;
  return (
    <span className="inline-flex items-center gap-1 text-meta">
      <Icon className="size-4 shrink-0" aria-hidden="true" />
      {exam ? EXAM_STATUS[exam.status] : "Geplant"}
    </span>
  );
}
