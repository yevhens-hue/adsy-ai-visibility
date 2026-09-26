import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import CatalogTab from './CatalogTab';
import { SAMPLE_PUBLISHERS } from './PublisherInventoryTable';

describe('CatalogTab', () => {
  beforeEach(() => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ publishers: SAMPLE_PUBLISHERS })
    }));
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('renders active gap banner when selectedGap is set and allows clearing', () => {
    const onClearGap = vi.fn();
    render(
      <CatalogTab
        selectedGap="SEO Backlink Automation"
        onClearGap={onClearGap}
        publishersList={SAMPLE_PUBLISHERS}
        highlightedDomain={null}
        onBackToReport={() => {}}
        onOpenBriefModal={() => {}}
      />
    );

    expect(screen.getAllByText('SEO Backlink Automation').length).toBeGreaterThanOrEqual(1);
    fireEvent.click(screen.getByText('Clear Filter'));
    expect(onClearGap).toHaveBeenCalled();
  });
});
