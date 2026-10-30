import { CircleCheck, Clock, OctagonAlert } from "lucide-react";
import type { ExamAdmission } from "@/domain/types";
import { cn } from "@/lib/utils";

const ADMISSION: Record<
  Exclude<ExamAdmission, "none">,
  { label: string; Icon: typeof Clock; className: string }
> = {
  admitted: {
    label: "Zur Prüfung zugelassen",
    Icon: CircleCheck,
    className: "text-status-on-track-foreground",
  },
  open: {
    label: "Zulassung offen: Prüfungsvorleistung noch nicht erbracht",
    Icon: Clock,
    className: "text-status-info-foreground",
  },
  notAdmitted: {
    label: "Nicht zugelassen: Prüfungsvorleistung nicht erbracht",
    Icon: OctagonAlert,
    className: "text-status-critical-foreground",
  },
};

/**
 * Admission to an exam (DR-13, P5-13) as icon, text and colour; nothing while no Prüfungsvorleistung is
 * entered. The rule's source belongs to the card that shows it.
 */
export function AdmissionStatus({
  admission,
  short = false,
  className,
}: {
  admission: ExamAdmission;
  /** Short wording for tight spots such as table rows. */
  short?: boolean;
  className?: string;
}) {
  if (admission === "none") return null;
  const { label, Icon, className: tone } = ADMISSION[admission];
  return (
    <span
      className={cn(
        "inline-flex items-start gap-1 text-meta font-semibold",
        tone,
        className,
      )}
    >
      <Icon className="mt-0.5 size-3.5 shrink-0" aria-hidden="true" />
      {short ? label.split(":")[0] : label}
    </span>
  );
}
