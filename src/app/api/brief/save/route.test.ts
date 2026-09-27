import { describe, it, expect, vi, beforeEach, afterEach, type Mock } from 'vitest';
import { NextRequest } from 'next/server';
import { POST } from './route';
import { supabase } from '@/lib/supabase';

vi.mock('@/lib/supabase', () => ({
  supabase: {
    from: vi.fn(),
  },
}));

describe('POST /api/brief/save', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.stubEnv('NEXT_PUBLIC_SUPABASE_URL', 'https://placeholder.supabase.co');
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it('returns 400 when payload is missing target domain and publisher', async () => {
    const req = new NextRequest('http://localhost/api/brief/save', {
      method: 'POST',
      body: JSON.stringify({ target_brand: 'X' }),
      headers: { 'Content-Type': 'application/json' },
    });
    const res = await POST(req);
    expect(res.status).toBe(400);
    const json = await res.json();
    expect(json.error).toContain('required');
  });

  it('returns success and echoes brief when supabase is placeholder', async () => {
    const brief = {
      id: 'brief-1',
      run_id: 'run-1',
      gap_id: 'gap-1',
      target_brand: 'Monday',
      target_domain: 'monday.com',
      gap_topic: 'Enterprise Workflow Solutions Comparison',
      gap_priority: 'high',
      target_prompts: ['q1'],
      publisher_domain: 'techbullion.com',
      publisher_price: 185,
      why_this_site: 'relevant',
      writer_instructions: 'write',
      reference_sources: ['techbullion.com'],
      created_at: new Date().toISOString(),
    };

    const req = new NextRequest('http://localhost/api/brief/save', {
      method: 'POST',
      body: JSON.stringify(brief),
      headers: { 'Content-Type': 'application/json' },
    });
    const res = await POST(req);
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.success).toBe(true);
    expect(json.brief.target_domain).toBe('monday.com');
    expect(supabase.from).not.toHaveBeenCalled();
  });

  it('persists to Supabase when URL is configured', async () => {
    vi.stubEnv('NEXT_PUBLIC_SUPABASE_URL', 'https://real-project.supabase.co');
    const insertMock = vi.fn().mockResolvedValue({ error: null });
    (supabase.from as unknown as Mock).mockReturnValue({ insert: insertMock });

    const brief = {
      id: 'brief-2',
      run_id: 'run-2',
      gap_id: null,
      target_brand: 'Monday',
      target_domain: 'monday.com',
      gap_topic: 'Topic',
      gap_priority: 'high',
      target_prompts: ['q1'],
      publisher_domain: 'techbullion.com',
      publisher_price: 185,
      why_this_site: 'x',
      writer_instructions: 'y',
      reference_sources: ['techbullion.com'],
      created_at: new Date().toISOString(),
    };

    const req = new NextRequest('http://localhost/api/brief/save', {
      method: 'POST',
      body: JSON.stringify(brief),
      headers: { 'Content-Type': 'application/json' },
    });
    const res = await POST(req);
    expect(res.status).toBe(200);
    expect(supabase.from).toHaveBeenCalledWith('placement_briefs');
    expect(insertMock).toHaveBeenCalled();
  });
});
