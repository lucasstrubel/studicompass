import type { Module, Term, TrafficLight } from "./types";
import { nextOffering } from "./terms";

/** DR-3 and DR-7: milestone shifts and >3 open foundation exams override ECTS status. */
export function trafficLight(
  earned: number,
  target: number,
  milestoneShift = 0,
  openFoundation = 0,
): TrafficLight {
  if (milestoneShift > 0 || openFoundation > 3 || target - earned >= 24)
    return "critical";
  return target - earned <= 6 ? "onTrack" : "tight";
}

/** DR-4: earliest offering strictly after the supplied term. */
export function nextOfferingTerm(module: Module, after: Term): Term {
  return nextOffering(after, module.offering);
}
