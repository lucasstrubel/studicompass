import { useId, useLayoutEffect, useRef } from "react";
import { PROFILE_NAME_MAX_LENGTH } from "@/lib/profile";
import type { ProfileDetails, ProfileErrors } from "./profile-input";

/** Shared, labelled fields for onboarding and settings; errors focus the first affected input. */
export function ProfileFields({
  value,
  onChange,
  errors,
}: {
  value: ProfileDetails;
  onChange: (change: Partial<ProfileDetails>) => void;
  errors: ProfileErrors;
}) {
  const id = useId();
  const first = useRef<HTMLInputElement>(null);
  const last = useRef<HTMLInputElement>(null);
  useLayoutEffect(() => {
    if (errors.firstName) first.current?.focus();
    else if (errors.lastName) last.current?.focus();
  }, [errors]);
  return (
    <div className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        {(
          [
            {
              field: "firstName",
              label: "Vorname",
              autoComplete: "given-name",
              ref: first,
            },
            {
              field: "lastName",
              label: "Nachname",
              autoComplete: "family-name",
              ref: last,
            },
          ] as const
        ).map(({ field, label, autoComplete, ref }) => (
          <div key={field} className="min-w-0 space-y-1">
            <label
              htmlFor={`${id}-${field}`}
              className="text-meta font-semibold"
            >
              {label}
            </label>
            <input
              id={`${id}-${field}`}
              ref={ref}
              autoComplete={autoComplete}
              required
              maxLength={PROFILE_NAME_MAX_LENGTH}
              value={value[field]}
              aria-invalid={errors[field] ? true : undefined}
              aria-describedby={
                errors[field] ? `${id}-${field}-error` : undefined
              }
              onChange={(event) => onChange({ [field]: event.target.value })}
              className="h-10 w-full min-w-0 rounded-lg border border-input bg-card px-3 text-body aria-invalid:border-status-critical"
            />
            {errors[field] && (
              <p
                id={`${id}-${field}-error`}
                className="text-meta text-status-critical-foreground"
              >
                {errors[field]}
              </p>
            )}
          </div>
        ))}
      </div>
      <label className="flex items-center gap-2 text-body">
        <input
          className="accent-primary"
          type="checkbox"
          checked={value.goalRegularTime}
          onChange={(event) =>
            onChange({ goalRegularTime: event.target.checked })
          }
        />
        Mein Ziel: Abschluss in Regelstudienzeit
      </label>
      <label htmlFor={`${id}-hours`} className="block text-body">
        Nebenjob:{" "}
        <output className="tabular-nums">{value.jobHoursPerWeek}</output>{" "}
        Std./Woche
      </label>
      <input
        className="w-full accent-primary"
        id={`${id}-hours`}
        type="range"
        min={0}
        max={40}
        step={1}
        value={value.jobHoursPerWeek}
        onChange={(event) =>
          onChange({ jobHoursPerWeek: Number(event.target.value) })
        }
      />
    </div>
  );
}
