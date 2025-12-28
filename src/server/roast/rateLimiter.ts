type Bucket = { tokens: number; lastRefill: number };

const buckets = new Map<string, Bucket>();

export interface RateLimitOptions {
  limit: number; // tokens per window
  windowMs: number;
}

export const DEFAULT_RATE_LIMIT: RateLimitOptions = { limit: 10, windowMs: 60_000 };

export function hitRateLimit(key: string, options = DEFAULT_RATE_LIMIT): { ok: boolean; remaining: number } {
  const now = Date.now();
  const bucket = buckets.get(key) || { tokens: options.limit, lastRefill: now };

  // refill
  const elapsed = now - bucket.lastRefill;
  if (elapsed > options.windowMs) {
    bucket.tokens = options.limit;
    bucket.lastRefill = now;
  }

  if (bucket.tokens <= 0) {
    buckets.set(key, bucket);
    return { ok: false, remaining: 0 };
  }

  bucket.tokens -= 1;
  buckets.set(key, bucket);
  return { ok: true, remaining: bucket.tokens };
}

// Useful for tests/dev
export function clearRateLimitData() {
  buckets.clear();
}
