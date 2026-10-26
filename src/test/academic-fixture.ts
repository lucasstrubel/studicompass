import { modules } from "@/data/modules";
import { exams } from "@/data/exams";
import { student } from "@/data/student";
import { DEMO_CURRENT_TERM } from "@/config/demo";
import type { AcademicState } from "@/domain/types";

/** Test input only. Expected results always come from KONZEPT §10.4. */
export function academicFixture(): AcademicState {
  return structuredClone({
    modules,
    exams,
    student,
    currentTerm: DEMO_CURRENT_TERM,
  });
}
