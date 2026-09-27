import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextRequest } from 'next/server';
import { GET } from './route';
import { supabase } from '@/lib/supabase';
import type { Mock } from 'vitest';

vi.mock('@/lib/supabase', () => ({
  supabase: {
    from: vi.fn(),
  },
}));

interface QueryResult {
  data: unknown;
  error: Error | null;
}
interface QueryBuilder extends QueryResult {
  select: Mock;
  order: Mock;
  limit: Mock;
  single: Mock;
  in: Mock;
  eq?: Mock;
  then: (resolve: (value: QueryResult) => unknown) => Promise<unknown>;
}

const queryBuilder = (data: unknown, error: Error | null = null): QueryBuilder => {
  const result: QueryResult = { data, error };
  const builder: QueryBuilder = {
    ...result,
    select: vi.fn().mockReturnThis(),
    order: vi.fn().mockReturnThis(),
    limit: vi.fn().mockResolvedValue(result),
    single: vi.fn().mockResolvedValue(result),
    in: vi.fn().mockResolvedValue(result),
    then: (resolve: (value: QueryResult) => unknown) => Promise.resolve(result).then(resolve),
  };
  builder.eq = vi.fn(() => {
    const eqObj: QueryBuilder = {
      ...result,
      select: vi.fn().mockReturnThis(),
      order: vi.fn().mockReturnThis(),
      limit: vi.fn().mockResolvedValue(result),
      single: vi.fn().mockResolvedValue(result),
      in: vi.fn().mockResolvedValue(result),
      then: (resolve: (value: QueryResult) => unknown) => Promise.resolve(result).then(resolve),
    };
    return eqObj;
  });
  return builder;
};

describe('GET /api/runs', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns historical runs when no id is provided', async () => {
    const runs = [
      { id: 'r1', domain: 'monday.com', brand_name: 'Monday', mode: 'full', status: 'completed', visibility_score: 50, prompt_coverage: 50, created_at: new Date().toISOString() },
    ];
    (supabase.from as unknown as Mock).mockReturnValue(queryBuilder(runs));

    const req = new NextRequest('http://localhost/api/runs');
    const res = await GET(req);
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.success).toBe(true);
    expect(json.data.length).toBe(1);
  });

  it('returns 404 when run not found', async () => {
    (supabase.from as unknown as Mock).mockReturnValue(queryBuilder(null, new Error('not found')));

    const req = new NextRequest('http://localhost/api/runs?id=missing');
    const res = await GET(req);
    expect(res.status).toBe(404);
  });

  it('returns a full run report when id is provided', async () => {
    const run = { id: 'r1', domain: 'monday.com', brand_name: 'Monday', mode: 'full', status: 'completed', visibility_score: 50, prompt_coverage: 50, created_at: new Date().toISOString() };
    const prompts = [{ id: 'p1', text: 'q1' }, { id: 'p2', text: 'q2' }];

    let callCount = 0;
    (supabase.from as unknown as Mock).mockImplementation((table: string) => {
      callCount += 1;
      if (table === 'check_runs') {
        return queryBuilder(run); // first call single()
      }
      return queryBuilder(prompts); // prompts/competitors/sources/gaps/answers
    });

    const req = new NextRequest('http://localhost/api/runs?id=r1');
    const res = await GET(req);
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.data.run.id).toBe('r1');
    expect(callCount).toBeGreaterThan(0);
  });
});
