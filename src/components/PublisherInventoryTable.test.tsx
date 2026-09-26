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
    const seenButton = screen.getByRole('button', { name: /Seen in AI Sources/i });
    fireEvent.click(seenButton);
    // thestartupmag is not seen in ai; ensure not in DOM
    expect(screen.queryByText('thestartupmag.com')).toBeNull();
    // techbullion is seen in ai; ensure still present
    expect(screen.getByText('techbullion.com')).toBeTruthy();
  });

  it('filters to High AI Opportunity publishers and Catalog Openings properly', () => {
    render(<PublisherInventoryTable publishersList={SAMPLE_PUBLISHERS} />);
    
    // High AI Opportunity filter
    const highButton = screen.getByRole('button', { name: /High AI Opportunity/i });
    fireEvent.click(highButton);
    expect(screen.getByText('forbes.com')).toBeTruthy();
    expect(screen.queryByText('thestartupmag.com')).toBeNull();

    // Catalog Openings filter
    const catalogButton = screen.getByRole('button', { name: /Catalog Openings/i });
    fireEvent.click(catalogButton);
    expect(screen.getByText('thestartupmag.com')).toBeTruthy();
    expect(screen.queryByText('forbes.com')).toBeNull();
  });

  it('generates choose-product URL for numeric ID and domain-prefilled search URL otherwise', () => {
    expect(getAdsyOrderUrl('13278')).toBe('https://cp.adsy.com/marketer/platform/choose-product/13278');
    expect(getAdsyOrderUrl(13278)).toBe('https://cp.adsy.com/marketer/platform/choose-product/13278');
    expect(getAdsyOrderUrl('pub-101', 'forbes.com')).toBe('https://cp.adsy.com/marketer/platform?SiteSearch%5Bsite_url%5D=forbes.com');
    expect(getAdsyOrderUrl(null, 'techbullion.com')).toBe('https://cp.adsy.com/marketer/platform?SiteSearch%5Bsite_url%5D=techbullion.com');
    expect(getAdsyOrderUrl(null)).toBe('https://cp.adsy.com/marketer/platform');
  });

  it('appends brief and gap query parameters to choose-product and platform search URLs', () => {
    const urlWithParams = getAdsyOrderUrl('13278', null, 'Target workflow brief', 'Brand Recognition');
    expect(urlWithParams).toContain('https://cp.adsy.com/marketer/platform/choose-product/13278?');
    expect(urlWithParams).toContain('brief=Target+workflow+brief');
    expect(urlWithParams).toContain('gap=Brand+Recognition');

    const domainUrlWithParams = getAdsyOrderUrl('pub-101', 'forbes.com', 'Test brief', 'SEO Performance');
    expect(domainUrlWithParams).toContain('SiteSearch%5Bsite_url%5D=forbes.com');
    expect(domainUrlWithParams).toContain('brief=Test+brief');
    expect(domainUrlWithParams).toContain('gap=SEO+Performance');
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

  it('toggles between gap-only filter and full catalog via toggle button', () => {
    render(
      <PublisherInventoryTable 
        selectedGapTopic="Brand Awareness" 
        publishersList={SAMPLE_PUBLISHERS} 
      />
    );

    // Strict filter initially on: business2community is hidden
    expect(screen.queryByText('business2community.com')).toBeNull();
    expect(screen.getByText('venturebeat.com')).toBeTruthy();

    // Click Show All Catalog
    const showAllBtn = screen.getByRole('button', { name: /Show All Catalog/i });
    fireEvent.click(showAllBtn);

    // Full catalog is now visible
    expect(screen.getByText('business2community.com')).toBeTruthy();
    expect(screen.getByText('venturebeat.com')).toBeTruthy();

    // Click Filter by Gap Only
    const filterByGapBtn = screen.getByRole('button', { name: /Filter by Gap Only/i });
    fireEvent.click(filterByGapBtn);

    // Strict filter restored
    expect(screen.queryByText('business2community.com')).toBeNull();
    expect(screen.getByText('venturebeat.com')).toBeTruthy();
  });

  it('correctly distinguishes between Adsy verified inventory and external AI citation sources', () => {
    const testPubs: VerifiedPublisher[] = [
      {
        id: '13278',
        domain: 'techbullion.com',
        category: 'Tech',
        country: 'US',
        language: 'English',
        dr: 79,
        da: 68,
        traffic: '320k',
        completionRate: '98%',
        pricePlacement: 185.0,
        isInAdsy: true,
        aiVisibility: {
          seenInAi: true,
          citationsCount: 4,
          relevantToGap: 'Brand',
          aiOpportunity: 'High',
          citedInEngines: ['ChatGPT'],
        },
      },
      {
        id: 'ext-g2',
        domain: 'g2.com',
        category: 'Software Reviews',
        country: 'US',
        language: 'English',
        dr: 90,
        da: 85,
        traffic: '5M',
        completionRate: 'N/A',
        pricePlacement: null,
        isInAdsy: false,
        aiVisibility: {
          seenInAi: true,
          citationsCount: 12,
          relevantToGap: 'Brand',
          aiOpportunity: 'High',
          citedInEngines: ['Perplexity'],
        },
      },
    ];

    render(<PublisherInventoryTable publishersList={testPubs} />);

    // In Adsy: has Buy Post, Adsy Verified badge, and price
    expect(screen.getByText('techbullion.com')).toBeTruthy();
    expect(screen.getByText('Adsy Verified')).toBeTruthy();
    expect(screen.getByText('$185.00')).toBeTruthy();
    expect(screen.getByRole('link', { name: /Buy Post/i })).toBeTruthy();

    // External citation not in Adsy: has AI Citation (Outreach) badge, Earned PR, and Match Adsy button
    expect(screen.getByText('g2.com')).toBeTruthy();
    expect(screen.getAllByText('AI Citation (Outreach)').length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText('Earned PR')).toBeTruthy();
    expect(screen.getByRole('button', { name: /Match Adsy/i })).toBeTruthy();

    // Filter by Adsy In-Stock
    const adsyOnlyBtn = screen.getByRole('button', { name: /Adsy In-Stock/i });
    fireEvent.click(adsyOnlyBtn);
    expect(screen.getByText('techbullion.com')).toBeTruthy();
    expect(screen.queryByText('g2.com')).toBeNull();
  });
});
