import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { runRealAIAnalysis } from './real-ai';

// Prevent any real OpenAI/Supabase calls during unit tests.
vi.mock('@/lib/supabase', async () => ({
  supabase: {
    from: vi.fn(() => ({
      insert: vi.fn().mockResolvedValue({ error: null }),
    })),
  },
}));

describe('runRealAIAnalysis (deterministic fallback)', () => {
  const originalKey = process.env.OPENAI_API_KEY;

  beforeEach(() => {
    vi.stubEnv('OPENAI_API_KEY', '');
    vi.stubEnv('NEXT_PUBLIC_SUPABASE_URL', 'https://placeholder.supabase.co');
  });

  afterEach(() => {
    if (originalKey === undefined) {
      delete process.env.OPENAI_API_KEY;
    } else {
      vi.stubEnv('OPENAI_API_KEY', originalKey);
    }
    vi.unstubAllEnvs();
  });

  it('returns a public summary with 5 prompts and sample answer (no API key)', async () => {
    const result = (await runRealAIAnalysis('monday.com', 'public')) as any;
    expect(result).toBeDefined();
    expect('run' in result).toBe(true);
    expect(result.run.domain).toBe('monday.com');
    expect(result.run.mode).toBe('public');
    expect(result.run.status).toBe('completed');
    expect(result.prompts.length).toBe(5);
    expect(result.sampleAnswer).toBeDefined();
    expect(result.sampleAnswer?.raw_text).toBeTruthy();
    expect(Array.isArray(result.sampleAnswer?.citations)).toBe(true);
    expect(result.gaps.length).toBeGreaterThan(0);
    expect(result.competitorsCount).toBeGreaterThan(0);
    expect(result.sourcesCount).toBeGreaterThan(0);
  });

  it('returns a full report with 15 prompts and 45 answers (no API key)', async () => {
    const result = (await runRealAIAnalysis('monday.com', 'full')) as any;
    expect(result.run.mode).toBe('full');
    expect(result.prompts.length).toBe(15);
    expect(result.answers.length).toBe(45);
    expect(result.competitors.length).toBeGreaterThanOrEqual(2);
    expect(result.sources.length).toBeGreaterThanOrEqual(2);
    expect(result.gaps.length).toBeGreaterThanOrEqual(2);
    expect(result.answers.every((a: any) => ['ChatGPT', 'Perplexity', 'Claude'].includes(a.platform))).toBe(true);
  });

  it('uses custom prompts/competitors when provided', async () => {
    const customPrompts = ['Сравни X с Y в 2026'];
    const customCompetitors = [{ name: 'Asana', domain: 'asana.com' }];
    const result = (await runRealAIAnalysis('monday.com', 'full', customPrompts, customCompetitors)) as any;
    expect(result.prompts.some((p: any) => p.is_custom)).toBe(true);
    expect(result.competitors.some((c: any) => c.name === 'Asana' && c.domain === 'asana.com')).toBe(true);
  });
});
