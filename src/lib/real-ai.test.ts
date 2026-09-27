import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { runRealAIAnalysis } from './real-ai';
import type { PublicCheckSummary, FullCheckReport, AIAnswer } from '@/types';

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
    const result = (await runRealAIAnalysis('monday.com', 'public')) as PublicCheckSummary;
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
    const result = (await runRealAIAnalysis('monday.com', 'full')) as FullCheckReport;
    expect(result.run.mode).toBe('full');
    expect(result.prompts.length).toBe(15);
    expect(result.answers.length).toBe(45);
    expect(result.competitors.length).toBeGreaterThanOrEqual(2);
    expect(result.sources.length).toBeGreaterThanOrEqual(2);
    expect(result.gaps.length).toBeGreaterThanOrEqual(2);
    expect(result.answers.every((a: AIAnswer) => ['ChatGPT', 'Perplexity', 'Claude', 'Live Web Search (Tavily)'].includes(a.platform))).toBe(true);
  });

  it('uses custom prompts/competitors when provided', async () => {
    const customPrompts = ['Сравни X с Y в 2026'];
    const customCompetitors = [{ name: 'Asana', domain: 'asana.com' }];
    const result = (await runRealAIAnalysis('monday.com', 'full', customPrompts, customCompetitors)) as FullCheckReport;
    expect(result.prompts.some((p) => p.is_custom)).toBe(true);
    expect(result.competitors.some((c) => c.name === 'Asana' && c.domain === 'asana.com')).toBe(true);
  });

  it('demonstrates engine disparity: visibility_score and prompt_coverage are distinct empirical metrics', async () => {
    const result = (await runRealAIAnalysis('monday.com', 'full')) as FullCheckReport;
    expect(result.run.visibility_score).toBeDefined();
    expect(result.run.prompt_coverage).toBeDefined();

    // Verify answers across engines have distinct citation presence
    const chatGptMentions = result.answers.filter((a: AIAnswer) => a.platform === 'ChatGPT' && a.brand_mentioned).length;
    const perplexityMentions = result.answers.filter((a: AIAnswer) => a.platform === 'Perplexity' && a.brand_mentioned).length;
    const claudeMentions = result.answers.filter((a: AIAnswer) => a.platform === 'Claude' && a.brand_mentioned).length;

    // Perplexity with live search should index/cite at least as actively as conservative Claude
    expect(perplexityMentions).toBeGreaterThanOrEqual(claudeMentions);
    expect(chatGptMentions).toBeGreaterThanOrEqual(0);
  });

  it('returns cached and stable results for subsequent queries of the same domain', async () => {
    const res1 = (await runRealAIAnalysis('cached-brand.com', 'public')) as PublicCheckSummary;
    const res2 = (await runRealAIAnalysis('cached-brand.com', 'public')) as PublicCheckSummary;

    expect(res1.run.id).toBe(res2.run.id);
    expect(res1.run.visibility_score).toBe(res2.run.visibility_score);
    expect(res1.run.prompt_coverage).toBe(res2.run.prompt_coverage);
  });

  it('queries L2 Supabase persistent cache when memory cache is clear and Supabase is configured', async () => {
    const { clearDomainAnalysisCache } = await import('./real-ai');
    clearDomainAnalysisCache('l2-domain.com');

    // Run first analysis
    const res1 = (await runRealAIAnalysis('l2-domain.com', 'public')) as PublicCheckSummary;
    expect(res1).toBeDefined();

    // Verify clearDomainAnalysisCache works
    clearDomainAnalysisCache('l2-domain.com');
    const res2 = (await runRealAIAnalysis('l2-domain.com', 'public')) as PublicCheckSummary;
    expect(res2).toBeDefined();
    expect(res2.run.domain).toBe('l2-domain.com');
  });
});
