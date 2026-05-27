/**
 * Security input-sanitization helpers.
 *
 * Rules:
 * - All user-entered text is untrusted.
 * - React text rendering escapes HTML — never use dangerouslySetInnerHTML
 *   with user data.
 * - URLs must be validated against an allowlist of schemes.
 * - No user input should be concatenated into SQL strings.
 */

const MAX_PLAIN_TEXT = 500;
const MAX_URL = 2048;
const MAX_PHONE = 30;
const MAX_USERNAME = 100;

/** Strip control characters (except common whitespace) and trim. */
function stripControl(value: string): string {
  return value.replace(/[\x00-\x08\x0b\x0c\x0e-\x1f\x7f]/g, "").trim();
}

/**
 * Sanitize a plain-text value: strip control chars, truncate, trim.
 * Returns the cleaned string or the fallback if empty after cleaning.
 */
export function sanitizePlainText(
  value: unknown,
  maxLength = MAX_PLAIN_TEXT,
): string {
  if (typeof value !== "string") return "";
  const cleaned = stripControl(value).slice(0, maxLength);
  return cleaned;
}

/** Like sanitizePlainText but returns null instead of empty string. */
export function sanitizeNullableText(
  value: unknown,
  maxLength = MAX_PLAIN_TEXT,
): string | null {
  const cleaned = sanitizePlainText(value, maxLength);
  return cleaned || null;
}

/** Allowed URL schemes for user-supplied links. */
const ALLOWED_URL_SCHEMES = new Set(["https:", "http:"]);

/**
 * Validate a URL. Returns the URL if safe, null otherwise.
 * - Only http/https allowed by default.
 * - Disallows javascript:, data:, vbscript:, file: etc.
 */
export function validateSafeUrl(
  value: unknown,
  allowedProtocols = ALLOWED_URL_SCHEMES,
): string | null {
  if (typeof value !== "string") return null;
  const trimmed = value.trim().slice(0, MAX_URL);
  if (!trimmed) return null;
  try {
    const url = new URL(trimmed);
    if (!allowedProtocols.has(url.protocol)) return null;
    return trimmed;
  } catch {
    return null;
  }
}

/**
 * Validate an image URL — only http/https or absolute internal paths.
 */
export function validateImageUrl(value: unknown): string | null {
  if (typeof value !== "string") return null;
  const trimmed = value.trim().slice(0, MAX_URL);
  if (!trimmed) return null;
  // Allow internal paths
  if (trimmed.startsWith("/")) return trimmed;
  // Allow external URLs
  try {
    const url = new URL(trimmed);
    if (!ALLOWED_URL_SCHEMES.has(url.protocol)) return null;
    return trimmed;
  } catch {
    return null;
  }
}

/**
 * Normalize a phone number: strip non-digits, allow leading +.
 */
export function normalizePhone(value: unknown): string | null {
  if (typeof value !== "string") return null;
  const stripped = value.replace(/[^0-9+]/g, "").slice(0, MAX_PHONE);
  return stripped || null;
}

/**
 * Normalize a username: alphanumeric, underscores, dots, hyphens.
 */
export function normalizeUsername(value: unknown): string | null {
  if (typeof value !== "string") return null;
  const cleaned = stripControl(value)
    .replace(/[^a-zA-Z0-9_.-]/g, "")
    .slice(0, MAX_USERNAME);
  return cleaned || null;
}

/** Allowed Google Maps URL patterns. */
const MAPS_ALLOWED_HOSTS = new Set([
  "maps.google.com",
  "www.google.com",
  "goo.gl",
  "maps.app.goo.gl",
]);

/**
 * Validate a Google Maps URL.
 * Accepts:
 *   https://maps.google.com/...
 *   https://www.google.com/maps/...
 *   https://goo.gl/maps/...
 *   https://maps.app.goo.gl/...
 *   plain lat/lng strings like "24.8607,67.0011"
 */
export function validateGoogleMapsUrl(value: unknown): string | null {
  if (typeof value !== "string") return null;
  const trimmed = value.trim().slice(0, MAX_URL);
  if (!trimmed) return null;

  // Allow lat/lng pairs
  if (/^-?\d+\.?\d*,\s*-?\d+\.?\d*$/.test(trimmed)) {
    return trimmed;
  }

  try {
    const url = new URL(trimmed);
    if (!ALLOWED_URL_SCHEMES.has(url.protocol)) return null;
    if (!MAPS_ALLOWED_HOSTS.has(url.hostname)) return null;
    return trimmed;
  } catch {
    return null;
  }
}

/** Social link platforms and their URL patterns / handle patterns. */
const SOCIAL_PLATFORMS: Record<string, RegExp> = {
  facebook: /^(https:\/\/(www\.)?(facebook|fb)\.com\/[a-zA-Z0-9.]+\/?|@[a-zA-Z0-9._]+)$/,
  instagram: /^(https:\/\/(www\.)?instagram\.com\/[a-zA-Z0-9._]+\/?|@[a-zA-Z0-9._]+)$/,
  twitter: /^(https:\/\/(www\.)?(twitter|x)\.com\/[a-zA-Z0-9_]+\/?|@[a-zA-Z0-9_]+)$/,
  linkedin: /^(https:\/\/(www\.)?linkedin\.com\/(in|company)\/[a-zA-Z0-9-]+\/?)$/,
  youtube: /^(https:\/\/(www\.)?youtube\.com\/(@[a-zA-Z0-9_-]+|channel\/[a-zA-Z0-9_-]+)\/?)$/,
  whatsapp: /^(https:\/\/wa\.me\/\d+|https:\/\/(api\.)?whatsapp\.com\/send\?phone=\d+)$/,
  tiktok: /^(https:\/\/(www\.)?tiktok\.com\/@[a-zA-Z0-9._]+\/?|@[a-zA-Z0-9._]+)$/,
};

/**
 * Normalize a social-link value.
 * Returns the validated URL or handle, or null if invalid.
 * Handles are prefixed with @ and must match known platform patterns.
 */
export function normalizeSocialLink(
  platform: string,
  value: unknown,
): string | null {
  if (typeof value !== "string") return null;
  const trimmed = value.trim().slice(0, MAX_URL);
  if (!trimmed) return null;

  const pattern = SOCIAL_PLATFORMS[platform.toLowerCase()];
  if (!pattern) {
    // Unknown platform: only allow http/https URLs
    return validateSafeUrl(trimmed);
  }

  if (pattern.test(trimmed)) {
    return trimmed;
  }
  return null;
}

/**
 * Validate that a redirect path is safe (relative, no open redirect).
 */
export function isSafeRedirectPath(value: string | null): boolean {
  if (!value) return false;
  return /^\/(?!\/)[a-zA-Z0-9/._-]*$/.test(value);
}

/**
 * Escape LIKE wildcards (% and _) for safe use in ILIKE patterns.
 */
export function escapeLike(value: string): string {
  return value.replace(/[%_]/g, "\\$&");
}
