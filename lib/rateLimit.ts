/**
 * Simple in-memory rate limiter keyed by arbitrary identifier.
 */
const windowMs = 60 * 1000;
const max = parseInt(process.env.RATE_LIMIT_MAX || '5', 10);
const buckets = new Map<string, { count: number; ts: number }>();

export function checkRateLimit(key: string): boolean {
  const now = Date.now();
  const entry = buckets.get(key);
  if (entry) {
    if (now - entry.ts < windowMs) {
      if (entry.count >= max) {
        return false;
      }
      entry.count++;
    } else {
      buckets.set(key, { count: 1, ts: now });
    }
  } else {
    buckets.set(key, { count: 1, ts: now });
  }
  return true;
}