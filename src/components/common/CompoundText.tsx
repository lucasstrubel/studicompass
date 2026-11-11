import { Fragment } from "react";
import { compoundParts } from "@/lib/compound-breaks";

/**
 * Text whose long German compounds may break at their joints, also on the narrowest window. The joint is an
 * empty element whose soft hyphen comes from CSS (`.soft-hyphen`): a line that breaks there ends in a hyphen,
 * while the text itself stays free of invisible characters for copying, searching and screen readers.
 */
export function CompoundText({ children }: { children: string }) {
  return compoundParts(children).map((part, index) => (
    <Fragment key={index}>
      {index > 0 && <span className="soft-hyphen" aria-hidden="true" />}
      {part}
    </Fragment>
  ));
}
