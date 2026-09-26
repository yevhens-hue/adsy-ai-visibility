import { describe, it, expect } from 'vitest';
import { generatePublicAnalysis, generateFullAnalysis, compareCheckRuns } from './checker';
import { CheckPrompt, CheckCompetitor } from '@/types';

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

describe('Full AI Visibility Analysis (Section 2 & 3 TZ)', () => {
  it('generates 15 prompts across 5 prompt types in full mode', () => {
    const report = generateFullAnalysis('monday.com');
    expect(report.run.domain).toBe('monday.com');
    expect(report.prompts.length).toBe(15);
    expect(report.run.mode).toBe('full');
    expect(report.answers.length).toBe(45); // 15 prompts * 3 engines
    expect(report.competitors.length).toBeGreaterThanOrEqual(2);
    expect(report.sources.length).toBeGreaterThan(0);
    expect(report.gaps.length).toBeGreaterThanOrEqual(2);
  });

  it('supports custom prompts and custom competitors', () => {
    const customPrompts = [
      'What are the best agile project boards in 2026?',
      'How to automate sprint planning with monday.com?'
    ];
    const customCompetitors = [
      { name: 'Asana', domain: 'asana.com' },
      { name: 'ClickUp', domain: 'clickup.com' }
    ];
    const report = generateFullAnalysis('monday.com', customPrompts, customCompetitors);
    expect(report.prompts.some((p: CheckPrompt) => p.is_custom)).toBe(true);
    expect(report.competitors.some((c: CheckCompetitor) => c.name === 'Asana')).toBe(true);
  });

  it('calculates valid comparison diff between two runs', () => {
    const report1 = generateFullAnalysis('monday.com');
    const report2 = generateFullAnalysis('monday.com');
    
    // Simulate difference
    report2.run.visibility_score = (report1.run.visibility_score || 40) + 12;
    report2.run.prompt_coverage = (report1.run.prompt_coverage || 50) + 15;

    const diff = compareCheckRuns(report1.run, report2.run, report1.prompts, report2.prompts);
    expect(diff.visibilityScoreDelta).toBe(12);
    expect(diff.promptCoverageDelta).toBe(15);
  });
});

