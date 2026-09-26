import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import HistoryTab from './HistoryTab';
import { CheckRun } from '@/types';

const sampleRun: CheckRun = {
  id: 'run-123',
  domain: 'monday.com',
  brand_name: 'Monday',
  mode: 'full',
  status: 'completed',
  visibility_score: 75,
  prompt_coverage: 80,
  brand_mention_share: 65,
  data_coverage: 100,
  platforms: ['ChatGPT', 'Perplexity', 'Claude'],
  prompts_count: 15,
  created_at: new Date().toISOString(),
};

describe('HistoryTab', () => {
  it('renders historical runs list and handles comparison selection', () => {
    const onToggleCompareRun = vi.fn();
    const onTriggerComparison = vi.fn();
    const onLoadSavedRun = vi.fn();

    render(
      <HistoryTab
        savedReports={[{ run: sampleRun }]}
        selectedForComparison={[]}
        onToggleCompareRun={onToggleCompareRun}
        onTriggerComparison={onTriggerComparison}
        onLoadSavedRun={onLoadSavedRun}
      />
    );

    expect(screen.getByText('monday.com')).toBeTruthy();
    expect(screen.getByText('75%')).toBeTruthy();

    const checkbox = screen.getByRole('checkbox');
    fireEvent.click(checkbox);
    expect(onToggleCompareRun).toHaveBeenCalledWith('run-123');

    const loadBtn = screen.getByRole('button', { name: /Load Report/i });
    fireEvent.click(loadBtn);
    expect(onLoadSavedRun).toHaveBeenCalledWith('run-123');
  });
});
