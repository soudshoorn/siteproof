import { headers } from "next/headers";

interface RateLimitConfig {
  maxRequests: number;
  windowMs: number;
}

const store = new Map<string, { count: number; resetAt: number }>();

function cleanupStore() {
  const now = Date.now();
  for (const [key, value] of store) {
    if (value.resetAt < now) {
      store.delete(key);
    }
  }
}

// Clean up every 5 minutes in long-running processes
if (typeof setInterval !== "undefined") {
  setInterval(cleanupStore, 5 * 60 * 1000);
}

export async function rateLimit(
  key: string,
  config: RateLimitConfig
): Promise<{ success: boolean; remaining: number; resetAt: number }> {
  const now = Date.now();
  const entry = store.get(key);

  if (!entry || entry.resetAt < now) {
    store.set(key, { count: 1, resetAt: now + config.windowMs });
    return {
      success: true,
      remaining: config.maxRequests - 1,
      resetAt: now + config.windowMs,
    };
  }

  if (entry.count >= config.maxRequests) {
    return { success: false, remaining: 0, resetAt: entry.resetAt };
  }

  entry.count++;
  return {
    success: true,
    remaining: config.maxRequests - entry.count,
    resetAt: entry.resetAt,
  };
}

/**
 * Get client IP from request headers. Only call this in Server Component / API route context.
 */
export async function getClientIp(): Promise<string> {
  const headerStore = await headers();
  return (
    headerStore.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    headerStore.get("x-real-ip") ||
    "unknown"
  );
}

export const RATE_LIMITS = {
  quickScan: { maxRequests: 3, windowMs: 24 * 60 * 60 * 1000 }, // 3 per day
  auth: { maxRequests: 10, windowMs: 60 * 1000 }, // 10 per minute
  api: { maxRequests: 60, windowMs: 60 * 1000 }, // 60 per minute
  publicApi: { maxRequests: 100, windowMs: 60 * 1000 }, // 100 per minute
  scanStart: { maxRequests: 10, windowMs: 60 * 1000 }, // 10 per minute
} as const;
