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
  const forwarded = req.headers.get('x-forwarded-for');
  if (forwarded) {
    const first = forwarded.split(',')[0].trim();
    if (first) return first;
  }
  const realIp = req.headers.get('x-real-ip');
  if (realIp && realIp.trim()) {
    return realIp.trim();
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

  return {
    allowed: true,
    remaining: options.maxRequests - activeTimestamps.length,
    resetInSeconds: options.windowSeconds,
  };
}
