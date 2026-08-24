// ============================================================================
// WealthFlow AI — server-side input validation + naive in-memory rate limiting
// ============================================================================

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export function isEmail(v: string): boolean {
  return typeof v === "string" && v.length <= 254 && EMAIL_RE.test(v);
}

/** Password policy: 8-128 chars, must not be entirely whitespace. */
export function isStrongPassword(v: string): boolean {
  if (typeof v !== "string") return false;
  if (v.length < 8 || v.length > 128) return false;
  return v.trim().length >= 8;
}

export function isName(v: string): boolean {
  return typeof v === "string" && v.trim().length >= 1 && v.trim().length <= 120;
}

export function isOrgName(v: string): boolean {
  return typeof v === "string" && v.trim().length >= 2 && v.trim().length <= 120;
}

export interface FieldError {
  field: string;
  message: string;
}

export function validateSignup(input: {
  name?: unknown;
  email?: unknown;
  password?: unknown;
  orgName?: unknown;
}): FieldError[] {
  const errors: FieldError[] = [];
  if (!isName(String(input.name ?? ""))) errors.push({ field: "name", message: "Enter your full name (max 120 chars)." });
  if (!isEmail(String(input.email ?? ""))) errors.push({ field: "email", message: "Enter a valid email address." });
  if (!isStrongPassword(String(input.password ?? ""))) errors.push({ field: "password", message: "Password must be 8–128 characters." });
  if (!isOrgName(String(input.orgName ?? ""))) errors.push({ field: "orgName", message: "Enter a firm / organization name (min 2 chars)." });
  return errors;
}

export function validateLogin(input: { email?: unknown; password?: unknown }): FieldError[] {
  const errors: FieldError[] = [];
  if (!isEmail(String(input.email ?? ""))) errors.push({ field: "email", message: "Enter a valid email address." });
  if (!isStrongPassword(String(input.password ?? ""))) errors.push({ field: "password", message: "Enter your password (8+ chars)." });
  return errors;
}

// ----------------------------------------------------------------------------
// Rate limiting — in-memory sliding window. Adequate for a single-instance
// deploy; swap for a shared store (DB/Redis) when scaling horizontally.
// ----------------------------------------------------------------------------
interface Bucket {
  timestamps: number[];
}
const buckets = new Map<string, Bucket>();

/**
 * Rate-limit by key (e.g. "login:1.2.3.4"). Allows `limit` attempts per
 * `windowMs`. Returns true when the attempt is allowed, false when blocked.
 */
export function rateLimit(key: string, limit: number, windowMs: number): boolean {
  const now = Date.now();
  let bucket = buckets.get(key);
  if (!bucket) {
    bucket = { timestamps: [] };
    buckets.set(key, bucket);
  }
  bucket.timestamps = bucket.timestamps.filter((t) => now - t < windowMs);
  if (bucket.timestamps.length >= limit) return false;
  bucket.timestamps.push(now);
  return true;
}

/** Prevent limitless growth of the in-memory bucket map. */
export function pruneRateLimits(maxEntries = 5000): void {
  if (buckets.size > maxEntries) {
    const keys = [...buckets.keys()].slice(0, buckets.size - maxEntries);
    for (const k of keys) buckets.delete(k);
  }
}

export function jsonError(status: number, error: string): Response {
  return new Response(JSON.stringify({ error }), {
    status,
    headers: { "content-type": "application/json" },
  });
}
