import { parsePhoneNumberFromString } from "libphonenumber-js";

/**
 * Validates a phone number, defaulting to Pakistan (PK) region.
 * Returns true if empty/null/undefined (optional field) or valid.
 */
export function isValidPhoneNumber(phone: string | null | undefined): boolean {
  if (!phone) return true;
  const trimmed = phone.trim();
  if (!trimmed) return true;

  try {
    const phoneNumber = parsePhoneNumberFromString(trimmed, "PK");
    return phoneNumber ? phoneNumber.isValid() : false;
  } catch {
    return false;
  }
}
