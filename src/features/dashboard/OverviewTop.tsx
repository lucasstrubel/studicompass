import { PageHeader } from "@/components/common/PageHeader";
import { ResourceBoundary } from "@/components/common/ResourceBoundary";
import { WithdrawalNotice } from "@/components/common/WithdrawalNotice";
import { DEMO_NOW } from "@/config/demo";
import { format, semesterNumber } from "@/domain/terms";
import { greeting } from "@/lib/format";
import { selectAcademicState, selectProfileName } from "@/store/selectors";
import { useDemoStore } from "@/store/use-demo-store";

/**
 * Greeting and simulation notice above both columns of the overview, so the first card of each column
 * starts at the same height.
 */
export function OverviewTop() {
  const complete = useDemoStore((state) => state.onboardingComplete);
  const academic = useDemoStore(selectAcademicState);
  const firstName = useDemoStore(selectProfileName)?.firstName;
  if (!complete) return null;
  return (
    <div className="flex flex-col gap-6 pb-8">
      <PageHeader
        className="mb-0"
        title={`${greeting(DEMO_NOW)}${firstName ? `, ${firstName}` : ""}`}
        meta={
          academic && (
            <span>
              {semesterNumber(academic.currentTerm, academic.student.startTerm)}
              . Semester · {format(academic.currentTerm)}
            </span>
          )
        }
      />
      <ResourceBoundary services={["pos"]} skeleton={null}>
        {() => <WithdrawalNotice />}
      </ResourceBoundary>
    </div>
  );
}
