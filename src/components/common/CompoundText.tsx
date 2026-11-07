import { Fragment } from "react";
import { compoundParts } from "@/lib/compound-breaks";

/** Text whose long German compounds may break at their joints, also on the narrowest window. */
export function CompoundText({ children }: { children: string }) {
  return compoundParts(children).map((part, index) => (
    <Fragment key={index}>
      {index > 0 && <wbr />}
      {part}
    </Fragment>
  ));
}
