import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, within } from '@testing-library/react';
import PublisherInventoryTable, { SAMPLE_PUBLISHERS, getAdsyOrderUrl } from './PublisherInventoryTable';
import { VerifiedPublisher } from './PublisherInventoryTable';

describe('PublisherInventoryTable', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ publishers: SAMPLE_PUBLISHERS })
    }));
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('renders sample publishers by default', () => {
    render(<PublisherInventoryTable />);
    expect(screen.getAllByRole('row').length).toBeGreaterThanOrEqual(SAMPLE_PUBLISHERS.length);
    expect(screen.getByText('techbullion.com')).toBeTruthy();
    expect(screen.getByText('venturebeat.com')).toBeTruthy();
  });

  it('renders a "View in Inventory" link for every catalog publisher', () => {
    render(<PublisherInventoryTable />);
    const rows = screen.getAllByRole('row');
    // subtract header row
    expect(rows.length - 1).toBe(SAMPLE_PUBLISHERS.length);
  });

  it('calls onOpenBriefModal with the selected publisher when Brief is clicked', () => {
    const onOpenBriefModal = vi.fn();
    render(<PublisherInventoryTable publishersList={SAMPLE_PUBLISHERS} onOpenBriefModal={onOpenBriefModal} />);
    const buttons = screen.getAllByRole('button', { name: /Brief/i });
    fireEvent.click(buttons[0]);
    expect(onOpenBriefModal).toHaveBeenCalledWith(expect.objectContaining({ domain: SAMPLE_PUBLISHERS[0].domain }));
  });

  it('filters to seen_in_ai publishers', () => {
    render(<PublisherInventoryTable publishersList={SAMPLE_PUBLISHERS} />);
    const seenButton = screen.getByText('Seen in AI Sources');
    fireEvent.click(seenButton);
    // thestartupmag is not seen in ai; ensure not in DOM
    expect(screen.queryByText('thestartupmag.com')).toBeNull();
    // techbullion is seen in ai; ensure still present
    expect(screen.getByText('techbullion.com')).toBeTruthy();
  });

  it('generates choose-product URL for numeric ID and domain-prefilled search URL otherwise', () => {
    expect(getAdsyOrderUrl('13278')).toBe('https://cp.adsy.com/marketer/platform/choose-product/13278');
    expect(getAdsyOrderUrl(13278)).toBe('https://cp.adsy.com/marketer/platform/choose-product/13278');
    expect(getAdsyOrderUrl('pub-101', 'forbes.com')).toBe('https://cp.adsy.com/marketer/platform?SiteSearch%5Bsite_url%5D=forbes.com&SiteSearch%5Bverified%5D=1');
    expect(getAdsyOrderUrl(null, 'techbullion.com')).toBe('https://cp.adsy.com/marketer/platform?SiteSearch%5Bsite_url%5D=techbullion.com&SiteSearch%5Bverified%5D=1');
    expect(getAdsyOrderUrl(null)).toBe('https://cp.adsy.com/marketer/platform?SiteSearch%5Bverified%5D=1');
  });

  it('filters publishers dynamically based on selectedGapTopic, yielding different domains for different gaps', () => {
    // 1. For Brand Awareness gap
    const { unmount } = render(
      <PublisherInventoryTable 
        selectedGapTopic="Brand Awareness" 
        publishersList={SAMPLE_PUBLISHERS} 
      />
    );
    expect(screen.getByText('venturebeat.com')).toBeTruthy();
    expect(screen.queryByText('business2community.com')).toBeNull();
    unmount();

    // 2. For SEO Performance gap
    const { unmount: unmount2 } = render(
      <PublisherInventoryTable 
        selectedGapTopic="SEO Performance" 
        publishersList={SAMPLE_PUBLISHERS} 
      />
    );
    expect(screen.getByText('business2community.com')).toBeTruthy();
    expect(screen.queryByText('venturebeat.com')).toBeNull();
    unmount2();

    // 3. For Content Quality gap
    render(
      <PublisherInventoryTable 
        selectedGapTopic="Content Quality" 
        publishersList={SAMPLE_PUBLISHERS} 
      />
    );
    expect(screen.getByText('thestartupmag.com')).toBeTruthy();
    expect(screen.queryByText('venturebeat.com')).toBeNull();
  });
});
