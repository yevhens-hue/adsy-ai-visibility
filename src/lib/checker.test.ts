import { describe, it, expect } from 'vitest';
import { generatePublicAnalysis } from './checker';

describe('Public AI Visibility Checker (Section 1 & Q1 TZ)', () => {
  it('generates 5 prompts for the given domain and brand', () => {
    const analysis = generatePublicAnalysis('monday.com');
    expect(analysis.run.domain).toBe('monday.com');
    expect(analysis.prompts.length).toBe(5);
    expect(analysis.run.mode).toBe('public');
    expect(analysis.run.platforms).toEqual(['ChatGPT', 'Perplexity', 'Claude']);
  });

  it('includes up to 2 key gaps in public mode', () => {
    const analysis = generatePublicAnalysis('monday.com');
    expect(analysis.gaps.length).toBeLessThanOrEqual(2);
    expect(analysis.gaps.length).toBeGreaterThan(0);
    expect(analysis.gaps[0]).toHaveProperty('topic');
    expect(analysis.gaps[0]).toHaveProperty('rationale');
  });

  it('includes sample AI answer with citations', () => {
    const analysis = generatePublicAnalysis('monday.com');
    expect(analysis.sampleAnswer).toBeDefined();
    expect(analysis.sampleAnswer?.raw_text).toBeTruthy();
    expect(Array.isArray(analysis.sampleAnswer?.citations)).toBe(true);
  });

  it('computes valid Visibility Score and Prompt Coverage or null', () => {
    const analysis = generatePublicAnalysis('monday.com');
    if (analysis.run.visibility_score !== null) {
      expect(analysis.run.visibility_score).toBeGreaterThanOrEqual(0);
      expect(analysis.run.visibility_score).toBeLessThanOrEqual(100);
    }
    if (analysis.run.prompt_coverage !== null) {
      expect(analysis.run.prompt_coverage).toBeGreaterThanOrEqual(0);
      expect(analysis.run.prompt_coverage).toBeLessThanOrEqual(100);
    }
  });

  it('indicates hidden competitors count for blurred UI', () => {
    const analysis = generatePublicAnalysis('monday.com');
    expect(analysis.competitorsCount).toBeGreaterThan(0);
  });
});
