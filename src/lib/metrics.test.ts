import { describe, it, expect } from 'vitest';
import {
  normalizeDomain,
  calculateVisibilityScore,
  calculatePromptCoverage,
  calculateBrandMentionShare,
} from './metrics';

describe('Domain Normalization', () => {
  it('extracts clean domain and brand from full URL', () => {
    expect(normalizeDomain('https://www.monday.com/pricing')).toEqual({
      domain: 'monday.com',
      brandGuess: 'Monday',
    });
  });

  it('handles raw domain without protocol', () => {
    expect(normalizeDomain('hubspot.com')).toEqual({
      domain: 'hubspot.com',
      brandGuess: 'Hubspot',
    });
  });

  it('trims whitespace and trailing slashes', () => {
    expect(normalizeDomain('  https://adsy.com/  ')).toEqual({
      domain: 'adsy.com',
      brandGuess: 'Adsy',
    });
  });
});

describe('AI Visibility Metrics (Section 2.2 TZ)', () => {
  it('calculates Visibility Score correctly: mentions / total observations * 100', () => {
    // Example: 10 observations with mention out of 30 total observations
    const score = calculateVisibilityScore(10, 30);
    expect(score).toBe(33.33);
  });

  it('returns null for Visibility Score when total observations is 0 (No data, not 0%)', () => {
    expect(calculateVisibilityScore(0, 0)).toBeNull();
  });

  it('calculates Prompt Coverage correctly: covered prompts / total prompts with answer * 100', () => {
    // Example from TZ: 7 prompts covered out of 15 prompts
    const coverage = calculatePromptCoverage(7, 15);
    expect(coverage).toBe(46.67);
  });

  it('returns null for Prompt Coverage when total prompts is 0', () => {
    expect(calculatePromptCoverage(0, 0)).toBeNull();
  });

  it('calculates Brand Mention Share correctly: brand mentions / sum of all brands mentions * 100', () => {
    // Brand mentions: 10. Competitor A: 15, Competitor B: 5. Sum = 30.
    const share = calculateBrandMentionShare(10, 30);
    expect(share).toBe(33.33);
  });

  it('returns null for Brand Mention Share when total brand mentions is 0', () => {
    expect(calculateBrandMentionShare(0, 0)).toBeNull();
  });
});
