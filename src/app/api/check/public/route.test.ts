import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextRequest } from 'next/server';
import { POST } from './route';

vi.mock('@/lib/real-ai', () => ({
  runRealAIAnalysis: vi.fn(async (url: string, _mode: string) => ({
    run: {
      id: 'run-1',
      domain: url,
      brand_name: 'Monday',
      mode: _mode,
      status: 'completed',
      visibility_score: 50,
      prompt_coverage: 50,
      brand_mention_share: 30,
      data_coverage: 100,
      platforms: ['ChatGPT', 'Perplexity', 'Claude'],
      prompts_count: 5,
      created_at: new Date().toISOString(),
    },
    prompts: [],
    sampleAnswer: { id: 'a1', prompt_id: 'p1', platform: 'Perplexity', raw_text: 'x', citations: [], brand_mentioned: true, mentioned_competitors: [], collected_at: new Date().toISOString() },
    gaps: [],
    competitorsCount: 4,
    sourcesCount: 8,
  })),
}));

import { runRealAIAnalysis } from '@/lib/real-ai';

describe('GET /api/check/public', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('POST returns 400 when url is missing', async () => {
    const req = new NextRequest('http://localhost/api/check/public', {
      method: 'POST',
      body: JSON.stringify({}),
      headers: { 'Content-Type': 'application/json' },
    });
    const res = await POST(req);
    expect(res.status).toBe(400);
    const json = await res.json();
    expect(json.error).toBe('Please provide a valid website URL or domain');
  });

  it('POST returns 400 when url is empty string', async () => {
    const req = new NextRequest('http://localhost/api/check/public', {
      method: 'POST',
      body: JSON.stringify({ url: '   ' }),
      headers: { 'Content-Type': 'application/json' },
    });
    const res = await POST(req);
    expect(res.status).toBe(400);
  });

  it('POST accepts domain field as alias', async () => {
    const req = new NextRequest('http://localhost/api/check/public', {
      method: 'POST',
      body: JSON.stringify({ domain: 'monday.com' }),
      headers: { 'Content-Type': 'application/json' },
    });
    const res = await POST(req);
    expect(res.status).toBe(200);
    expect(runRealAIAnalysis).toHaveBeenCalledWith('monday.com', 'public');
    const json = await res.json();
    expect(json.success).toBe(true);
    expect(json.data.run.domain).toBe('monday.com');
  });
});
