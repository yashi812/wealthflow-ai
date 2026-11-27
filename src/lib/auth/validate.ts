// ============================================================================
// WealthFlow AI — server-side input validation + naive in-memory rate limiting
//
// Authentication credentials (passwords, reset tokens, OAuth) are handled by
// Clerk, so this module only carries the validation helpers the app itself
// needs (email/lead-field checks) plus a small rate limiter for app-level
// actions. Business data is validated again server-side in each server fn.
// ============================================================================
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
export function isEmail(v: string): boolean {
  return typeof v === "string" && v.length <= 254 && EMAIL_RE.test(v);
}

export function isName(v: string): boolean {
  return typeof v === "string" && v.trim().length >= 1 && v.trim().length <= 120;
}

export function isOrgName(v: string): boolean {
  return typeof v === "string" && v.trim().length >= 2 && v.trim().length <= 120;
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
 * Rate-limit by key (e.g. "lead-create:1.2.3.4"). Allows `limit` attempts per
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
