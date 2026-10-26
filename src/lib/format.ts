import { format } from "date-fns";
import { de } from "date-fns/locale";

/** Date as shown in the UI (KONZEPT §10.2), e.g. "Mo, 25.01.2027". */
export function formatDate(date: Date): string {
  return format(date, "EEEEEE, dd.MM.yyyy", { locale: de });
}
