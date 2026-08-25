// In-memory rate limiter — same tradeoff as tree-site's: fine for a single
// low-traffic Vercel instance guarding a single admin login, won't survive
// being distributed across many concurrent serverless instances. If this
// site ever needs sturdier protection, swap in Upstash/Redis.

const attempts = new Map<string, { count: number; resetAt: number }>();

export function checkRateLimit(
  key: string,
  { windowMs, max }: { windowMs: number; max: number }
): { allowed: boolean; retryAfterMs: number } {
  const now = Date.now();
  const entry = attempts.get(key);

  if (!entry || entry.resetAt < now) {
    attempts.set(key, { count: 1, resetAt: now + windowMs });
    return { allowed: true, retryAfterMs: 0 };
  }

  if (entry.count >= max) {
    return { allowed: false, retryAfterMs: entry.resetAt - now };
  }

  entry.count += 1;
  return { allowed: true, retryAfterMs: 0 };
}
