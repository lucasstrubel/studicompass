import type { ProfileName } from "@/domain/types";
import { PROFILE_NAME_MAX_LENGTH } from "@/lib/profile";

export type ProfileDetails = ProfileName & {
  goalRegularTime: boolean;
  jobHoursPerWeek: number;
};
export type ProfileErrors = Partial<Record<keyof ProfileName, string>>;

export function profileErrors(value: ProfileName): ProfileErrors {
  const errors: ProfileErrors = {};
  if (!value.firstName.trim()) errors.firstName = "Gib deinen Vornamen ein.";
  else if (value.firstName.trim().length > PROFILE_NAME_MAX_LENGTH)
    errors.firstName = `Höchstens ${PROFILE_NAME_MAX_LENGTH} Zeichen.`;
  if (!value.lastName.trim()) errors.lastName = "Gib deinen Nachnamen ein.";
  else if (value.lastName.trim().length > PROFILE_NAME_MAX_LENGTH)
    errors.lastName = `Höchstens ${PROFILE_NAME_MAX_LENGTH} Zeichen.`;
  return errors;
}
