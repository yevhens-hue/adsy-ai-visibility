import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, act } from '@testing-library/react';
import PlacementBriefModal, { } from './PlacementBriefModal';
import { VerifiedPublisher } from './PublisherInventoryTable';

const publisher: VerifiedPublisher = {
  id: 'pub-101',
  domain: 'techbullion.com',
  category: 'Technology, Business & Finance',
  country: 'US',
  language: 'English',
  dr: 79,
  da: 68,
  traffic: '320,000',
  completionRate: '98%',
  pricePlacement: 185.0,
  aiVisibility: {
    seenInAi: true,
    citationsCount: 4,
    relevantToGap: 'Enterprise Workflow Solutions Comparison',
    aiOpportunity: 'High',
    citedInEngines: ['ChatGPT', 'Perplexity'],
  },
};

describe('PlacementBriefModal', () => {
  it('renders publisher info and brief text', () => {
    render(
      <PlacementBriefModal
        publisher={publisher}
        gapTopic="Enterprise Workflow Solutions Comparison"
        brandName="Monday"
        onClose={() => {}}
      />
    );

    expect(screen.getByText(/Article Recommendations for Adsy Order/)).toBeTruthy();
    expect(screen.getAllByText(/techbullion.com/).length).toBeGreaterThan(0);
    expect(screen.getByText(/Monday/)).toBeTruthy();
  });

  it('copies brief text to clipboard', async () => {
    const writeText = vi.fn().mockResolvedValue(undefined);
    Object.assign(navigator, { clipboard: { writeText } });
    vi.useFakeTimers();

    render(
      <PlacementBriefModal
        publisher={publisher}
        gapTopic="Gap"
        brandName="Monday"
        onClose={() => {}}
      />
    );

    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: /Copy Brief/i }));
    });
    expect(writeText).toHaveBeenCalled();
    await act(async () => {
      vi.runAllTimers();
    });
    vi.useRealTimers();
  });

  it('saves brief and opens Adsy CP on order click', async () => {
    const fetchMock = vi.fn().mockResolvedValue(new Response(null, { status: 200 }));
    vi.stubGlobal('fetch', fetchMock);
    const openSpy = vi.spyOn(window, 'open').mockImplementation(() => null);

    render(
      <PlacementBriefModal
        publisher={publisher}
        gapTopic="Gap"
        brandName="Monday"
        runId="run-1"
        onClose={() => {}}
      />
    );

    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: /Save Brief & Order on Adsy CP/i }));
    });

    expect(fetchMock).toHaveBeenCalledWith(
      '/api/brief/save',
      expect.objectContaining({ method: 'POST' }),
    );
    expect(openSpy).toHaveBeenCalledWith(
      expect.stringContaining('SiteSearch%5Bsite_url%5D=techbullion.com'),
      '_blank',
    );
    openSpy.mockRestore();
    vi.unstubAllGlobals();
  });

  it('opens direct choose-product URL when publisher has a numeric ID', async () => {
    const fetchMock = vi.fn().mockResolvedValue(new Response(null, { status: 200 }));
    vi.stubGlobal('fetch', fetchMock);
    const openSpy = vi.spyOn(window, 'open').mockImplementation(() => null);

    render(
      <PlacementBriefModal
        publisher={{ ...publisher, id: '13278' }}
        gapTopic="Gap"
        brandName="Monday"
        runId="run-1"
        onClose={() => {}}
      />
    );

    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: /Save Brief & Order on Adsy CP/i }));
    });

    expect(openSpy).toHaveBeenCalledWith(
      expect.stringContaining('https://cp.adsy.com/marketer/platform/choose-product/13278'),
      '_blank',
    );
    expect(openSpy).toHaveBeenCalledWith(
      expect.stringContaining('gap=Gap'),
      '_blank',
    );
    openSpy.mockRestore();
    vi.unstubAllGlobals();
  });
});
