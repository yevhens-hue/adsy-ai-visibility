import { describe, it, expect, vi, beforeEach } from 'vitest';
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
interface InvBuilder extends QueryResult {
  select: Mock;
  eq: Mock;
}

const queryBuilder = (data: unknown, error: Error | null = null): InvBuilder => ({
  data,
  error,
  select: vi.fn().mockReturnThis(),
  eq: vi.fn().mockResolvedValue({ data, error }),
});

describe('GET /api/inventory', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns deduplicated publishers in Adsy catalog', async () => {
    const sources = [
      { domain: 'techbullion.com', adsy_price: 185, adsy_publisher_id: 'PUB-101', frequency: 4 },
      { domain: 'techbullion.com', adsy_price: 185, adsy_publisher_id: 'PUB-101', frequency: 4 },
      { domain: 'venturebeat.com', adsy_price: 650, adsy_publisher_id: 'PUB-102', frequency: 7 },
    ];
    (supabase.from as unknown as Mock).mockReturnValue(queryBuilder(sources));

    const res = await GET();
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.success).toBe(true);
    expect(json.data.length).toBe(2);
    expect(supabase.from).toHaveBeenCalledWith('check_sources');
  });

  it('returns 500 when Supabase throws', async () => {
    (supabase.from as unknown as Mock).mockImplementation(() => {
      throw new Error('DB down');
    });

    const res = await GET();
    expect(res.status).toBe(500);
    const json = await res.json();
    expect(json.error).toBe('DB down');
  });
});
