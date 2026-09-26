import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import ReportComparisonModal from './ReportComparisonModal';
import { RunComparisonDiff, CheckRun } from '@/types';

const baseRun = (overrides: Partial<CheckRun> = {}): CheckRun => ({
  id: 'r1',
  domain: 'monday.com',
  brand_name: 'Monday',
  mode: 'full',
  status: 'completed',
  visibility_score: 50,
  prompt_coverage: 40,
  brand_mention_share: 30,
  data_coverage: 100,
  platforms: ['ChatGPT', 'Perplexity', 'Claude'],
  prompts_count: 15,
  created_at: new Date('2026-09-01T00:00:00Z').toISOString(),
  ...overrides,
});

describe('ReportComparisonModal', () => {
  it('renders delta metrics and calls onClose', () => {
    const diff: RunComparisonDiff = {
      run1: baseRun({ visibility_score: 40, prompt_coverage: 30 }),
      run2: baseRun({ visibility_score: 52, prompt_coverage: 45 }),
      visibilityScoreDelta: 12,
      promptCoverageDelta: 15,
      brandMentionShareDelta: 5,
      newMentions: ['New query 1'],
      lostMentions: [],
      commonPromptsCount: 10,
    };

    const onClose = vi.fn();
    render(<ReportComparisonModal diff={diff} onClose={onClose} />);

    expect(screen.getByText(/AI Visibility Runs Comparison/)).toBeTruthy();
    expect(screen.getByText('+12% pts')).toBeTruthy();
    expect(screen.getByText('Newly Gained AI Mentions (1)')).toBeTruthy();

    fireEvent.click(screen.getByRole('button', { name: /Close Diff View/i }));
    expect(onClose).toHaveBeenCalled();
  });

  it('renders lost mentions section when there are lost items', () => {
    const diff: RunComparisonDiff = {
      run1: baseRun(),
      run2: baseRun(),
      visibilityScoreDelta: 0,
      promptCoverageDelta: 0,
      brandMentionShareDelta: null,
      newMentions: [],
      lostMentions: ['Lost query 1'],
      commonPromptsCount: 0,
    };

    render(<ReportComparisonModal diff={diff} onClose={() => {}} />);
    expect(screen.getByText('Lost or Inactive Mentions (1)')).toBeTruthy();
    expect(screen.getByText('Lost query 1')).toBeTruthy();
    // zero-state only shown when lostMentions is empty
    expect(screen.queryByText(/Zero lost mentions/)).toBeNull();
  });
});
