import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextRequest } from 'next/server';
import { POST } from './route';

vi.mock('@/lib/real-ai', () => ({
  runRealAIAnalysis: vi.fn(async (url: string) => ({
    run: { id: 'run-full', domain: url, brand_name: 'Monday', mode: 'full', status: 'completed' },
    prompts: [],
    answers: [],
    sources: [],
    competitors: [],
    gaps: [],
  })),
}));

import { runRealAIAnalysis } from '@/lib/real-ai';

describe('GET /api/check/full', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('POST returns 400 when url is missing', async () => {
    const req = new NextRequest('http://localhost/api/check/full', {
      method: 'POST',
      body: JSON.stringify({}),
      headers: { 'Content-Type': 'application/json' },
    });
    const res = await POST(req);
    expect(res.status).toBe(400);
  });

  it('POST forwards custom prompts and competitors', async () => {
    const req = new NextRequest('http://localhost/api/check/full', {
      method: 'POST',
      body: JSON.stringify({
        url: 'monday.com',
        customPrompts: ['q1'],
        customCompetitors: [{ name: 'Asana', domain: 'asana.com' }],
      }),
      headers: { 'Content-Type': 'application/json' },
    });
    const res = await POST(req);
    expect(res.status).toBe(200);
    expect(runRealAIAnalysis).toHaveBeenCalledWith(
      'monday.com',
      'full',
      ['q1'],
      [{ name: 'Asana', domain: 'asana.com' }],
    );
  });

  it('POST returns 429 when rate limit is exceeded', async () => {
    // 10 allowed requests
    for (let i = 0; i < 10; i++) {
      const req = new NextRequest('http://localhost/api/check/full', {
        method: 'POST',
        body: JSON.stringify({ url: 'monday.com' }),
        headers: { 'Content-Type': 'application/json', 'x-forwarded-for': '198.51.100.1' },
      });
      const res = await POST(req);
      expect(res.status).toBe(200);
    }

    // 11th request hits limit
    const blockedReq = new NextRequest('http://localhost/api/check/full', {
      method: 'POST',
      body: JSON.stringify({ url: 'monday.com' }),
      headers: { 'Content-Type': 'application/json', 'x-forwarded-for': '198.51.100.1' },
    });
    const blockedRes = await POST(blockedReq);
    expect(blockedRes.status).toBe(429);
    const json = await blockedRes.json();
    expect(json.error).toContain('Rate limit exceeded');
  });
});
