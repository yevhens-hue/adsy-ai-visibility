import { describe, it, expect, beforeEach } from 'vitest';
import { 
  checkRateLimit, 
  resetRateLimiter, 
  getClientIp, 
  checkMonthlyQuota,
  getRateLimitHeaders,
  cleanupStaleRateLimits,
  getRateLimitStoreSize
} from './rate-limiter';
import { NextRequest } from 'next/server';

describe('rate-limiter', () => {
  beforeEach(() => {
    resetRateLimiter();
  });

  it('allows requests within the limit', () => {
    const res1 = checkRateLimit('test-ip', { maxRequests: 2, windowSeconds: 60 });
    expect(res1.allowed).toBe(true);
    expect(res1.remaining).toBe(1);

    const res2 = checkRateLimit('test-ip', { maxRequests: 2, windowSeconds: 60 });
    expect(res2.allowed).toBe(true);
    expect(res2.remaining).toBe(0);
  });

  it('blocks requests exceeding the limit', () => {
    checkRateLimit('test-ip-blocked', { maxRequests: 2, windowSeconds: 60 });
    checkRateLimit('test-ip-blocked', { maxRequests: 2, windowSeconds: 60 });

    const res3 = checkRateLimit('test-ip-blocked', { maxRequests: 2, windowSeconds: 60 });
    expect(res3.allowed).toBe(false);
    expect(res3.remaining).toBe(0);
    expect(res3.resetInSeconds).toBeGreaterThan(0);
  });

  it('extracts client IP from x-forwarded-for header', () => {
    const req = new NextRequest('http://localhost:3000/api/check/full', {
      headers: {
        'x-forwarded-for': '203.0.113.195, 70.41.3.18'
      }
    });
    expect(getClientIp(req)).toBe('203.0.113.195');
  });

  it('enforces monthly quota of 3 requests', () => {
    const q1 = checkMonthlyQuota('user-1', 3);
    expect(q1.allowed).toBe(true);
    expect(q1.remaining).toBe(2);

    const q2 = checkMonthlyQuota('user-1', 3);
    expect(q2.allowed).toBe(true);
    expect(q2.remaining).toBe(1);

    const q3 = checkMonthlyQuota('user-1', 3);
    expect(q3.allowed).toBe(true);
    expect(q3.remaining).toBe(0);

    const q4 = checkMonthlyQuota('user-1', 3);
    expect(q4.allowed).toBe(false);
    expect(q4.remaining).toBe(0);
  });

  it('generates standard RFC compliant rate limit headers', () => {
    const res = checkRateLimit('header-test', { maxRequests: 5, windowSeconds: 60 });
    const headers = getRateLimitHeaders(res, { maxRequests: 5, windowSeconds: 60 });

    expect(headers['X-RateLimit-Limit']).toBe('5');
    expect(headers['X-RateLimit-Remaining']).toBe('4');
    expect(headers['X-RateLimit-Reset']).toBeDefined();
    expect(headers['Retry-After']).toBeUndefined();

    // Trigger limit breach (maxRequests: 5, so 5th is allowed, 6th is blocked)
    checkRateLimit('header-test', { maxRequests: 5, windowSeconds: 60 });
    checkRateLimit('header-test', { maxRequests: 5, windowSeconds: 60 });
    checkRateLimit('header-test', { maxRequests: 5, windowSeconds: 60 });
    checkRateLimit('header-test', { maxRequests: 5, windowSeconds: 60 });
    const blockedRes = checkRateLimit('header-test', { maxRequests: 5, windowSeconds: 60 });
    expect(blockedRes.allowed).toBe(false);
    const blockedHeaders = getRateLimitHeaders(blockedRes, { maxRequests: 5, windowSeconds: 60 });

    expect(blockedHeaders['X-RateLimit-Limit']).toBe('5');
    expect(blockedHeaders['X-RateLimit-Remaining']).toBe('0');
    expect(blockedHeaders['Retry-After']).toBe(String(blockedRes.resetInSeconds));
  });

  it('cleans up stale keys to prevent memory leaks', () => {
    checkRateLimit('stale-ip-1', { maxRequests: 2, windowSeconds: 60 });
    expect(getRateLimitStoreSize()).toBe(1);

    // Call cleanup with future cutoff
    cleanupStaleRateLimits(Date.now() + 70000);
    expect(getRateLimitStoreSize()).toBe(0);
  });
});

