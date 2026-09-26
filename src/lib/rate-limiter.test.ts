import { describe, it, expect, beforeEach } from 'vitest';
import { checkRateLimit, resetRateLimiter, getClientIp } from './rate-limiter';
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

  it('falls back to 127.0.0.1 if no IP headers present', () => {
    const req = new NextRequest('http://localhost:3000/api/check/full');
    expect(getClientIp(req)).toBe('127.0.0.1');
  });
});
