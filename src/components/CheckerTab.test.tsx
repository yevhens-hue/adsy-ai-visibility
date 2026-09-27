import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import CheckerTab from './CheckerTab';
import { CheckRun } from '@/types';

const mockRun: CheckRun = {
  id: 'run-1',
  domain: 'monday.com',
  brand_name: 'Monday',
  mode: 'full',
  status: 'completed',
  visibility_score: 80,
  prompt_coverage: 85,
  brand_mention_share: 70,
  data_coverage: 100,
  platforms: ['ChatGPT', 'Perplexity', 'Claude'],
  prompts_count: 15,
  created_at: new Date().toISOString(),
};

describe('CheckerTab', () => {
  it('renders search form and triggers onRunAnalysis on submit', () => {
    const onRunAnalysis = vi.fn().mockResolvedValue(undefined);
    const onSelectGapAndOpenInventory = vi.fn();

    render(
      <CheckerTab
        url="monday.com"
        setUrl={() => {}}
        loading={false}
        currentStepIndex={0}
        checkSteps={['Step 1']}
        error={null}
        setError={() => {}}
        quotaRemaining={3}
        setQuotaRemaining={() => {}}
        showConfigDrawer={false}
        setShowConfigDrawer={() => {}}
        customPrompts={[]}
        setCustomPrompts={() => {}}
        newPromptInput=""
        setNewPromptInput={() => {}}
        customCompetitors={[]}
        setCustomCompetitors={() => {}}
        newCompetitorName=""
        setNewCompetitorName={() => {}}
        newCompetitorDomain=""
        setNewCompetitorDomain={() => {}}
        handleAddCompetitor={() => {}}
        handleRemoveCompetitor={() => {}}
        currentRun={mockRun}
        currentGaps={[]}
        fullReport={null}
        publicResult={null}
        activeReportTab="overview"
        setActiveReportTab={() => {}}
        promptFilterType="all"
        setPromptFilterType={() => {}}
        sourceFilterInCatalog={false}
        setSourceFilterInCatalog={() => {}}
        answerPlatformFilter="all"
        setAnswerPlatformFilter={() => {}}
        selectedPromptForAnswer={null}
        setSelectedPromptForAnswer={() => {}}
        userMode="marketer"
        onRunAnalysis={onRunAnalysis}
        onSelectGapAndOpenInventory={onSelectGapAndOpenInventory}
      />
    );

    expect(screen.getByText('Visibility Score')).toBeTruthy();
    expect(screen.getByText('80%')).toBeTruthy();
    expect(screen.getByText(/Live Web Search & Citations/i)).toBeTruthy();

    const submitBtn = screen.getByRole('button', { name: /Run Full Analysis/i });
    fireEvent.click(submitBtn);
    expect(onRunAnalysis).toHaveBeenCalled();
  });
});
