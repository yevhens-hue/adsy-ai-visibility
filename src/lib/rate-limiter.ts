import { NextRequest } from 'next/server';

interface RateLimitRecord {
  timestamps: number[];
}

interface MonthlyQuotaRecord {
  month: string;
  count: number;
}

const rateLimitStore = new Map<string, RateLimitRecord>();
const monthlyQuotaStore = new Map<string, MonthlyQuotaRecord>();

export interface RateLimitOptions {
  maxRequests: number;
  windowSeconds: number;
}

export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  resetInSeconds: number;
}

export interface MonthlyQuotaResult {
  allowed: boolean;
  remaining: number;
  month: string;
}

export function resetRateLimiter(): void {
  rateLimitStore.clear();
  monthlyQuotaStore.clear();
}

export function checkMonthlyQuota(identifier: string, maxMonthly = 3): MonthlyQuotaResult {
  const currentMonth = new Date().toISOString().slice(0, 7);
  const record = monthlyQuotaStore.get(identifier);
  if (!record || record.month !== currentMonth) {
    monthlyQuotaStore.set(identifier, { month: currentMonth, count: 1 });
    return {
      allowed: true,
      remaining: Math.max(0, maxMonthly - 1),
      month: currentMonth,
    };
  }

  if (record.count >= maxMonthly) {
    return {
      allowed: false,
      remaining: 0,
      month: currentMonth,
    };
  }

  record.count += 1;
  monthlyQuotaStore.set(identifier, record);
  return {
    allowed: true,
    remaining: Math.max(0, maxMonthly - record.count),
    month: currentMonth,
  };
}

export function getClientIp(req: NextRequest): string {
  // Prioritize trusted edge headers provided by Vercel/Cloudflare infrastructure
  const vercelIp = req.headers.get('x-vercel-ip');
  if (vercelIp && vercelIp.trim()) return vercelIp.trim();

  const realIp = req.headers.get('x-real-ip');
  if (realIp && realIp.trim()) return realIp.trim();

  const cfIp = req.headers.get('cf-connecting-ip');
  if (cfIp && cfIp.trim()) return cfIp.trim();

  const forwarded = req.headers.get('x-forwarded-for');
  if (forwarded) {
    const first = forwarded.split(',')[0].trim();
    if (first) return first;
  }
  return '127.0.0.1';
}

export function checkRateLimit(
  identifier: string,
  options: RateLimitOptions = { maxRequests: 10, windowSeconds: 60 }
): RateLimitResult {
  const now = Date.now();
  const windowMs = options.windowSeconds * 1000;
  const cutoff = now - windowMs;

  const record = rateLimitStore.get(identifier) || { timestamps: [] };
  // Filter out timestamps outside window
  const activeTimestamps = record.timestamps.filter((ts) => ts > cutoff);

  if (activeTimestamps.length >= options.maxRequests) {
    const oldest = activeTimestamps[0];
    const resetInSeconds = Math.max(1, Math.ceil((oldest + windowMs - now) / 1000));
    return {
      allowed: false,
      remaining: 0,
      resetInSeconds,
    };
  }

  activeTimestamps.push(now);
  rateLimitStore.set(identifier, { timestamps: activeTimestamps });

  // Auto-prune stale keys if store grows large to prevent memory leaks
  if (rateLimitStore.size > 1000) {
    cleanupStaleRateLimits(now - windowMs);
  }

  return {
    allowed: true,
    remaining: options.maxRequests - activeTimestamps.length,
    resetInSeconds: options.windowSeconds,
  };
}

/**
 * Removes identifiers whose latest request timestamp is older than the cutoff.
 */
export function cleanupStaleRateLimits(cutoffTimestamp?: number): number {
  const cutoff = cutoffTimestamp ?? (Date.now() - 60000);
  let removedCount = 0;
  for (const [key, record] of rateLimitStore.entries()) {
    if (!record.timestamps.length || record.timestamps[record.timestamps.length - 1] <= cutoff) {
      rateLimitStore.delete(key);
      removedCount++;
    }
  }
  return removedCount;
}

export function getRateLimitStoreSize(): number {
  return rateLimitStore.size;
}

/**
 * Generates RFC-compliant HTTP RateLimit headers.
 */
export function getRateLimitHeaders(
  result: RateLimitResult,
  options: RateLimitOptions
): Record<string, string> {
  const headers: Record<string, string> = {
    'X-RateLimit-Limit': String(options.maxRequests),
    'X-RateLimit-Remaining': String(result.remaining),
    'X-RateLimit-Reset': String(Math.floor(Date.now() / 1000) + result.resetInSeconds),
  };

  if (!result.allowed) {
    headers['Retry-After'] = String(result.resetInSeconds);
  }

  return headers;
}

