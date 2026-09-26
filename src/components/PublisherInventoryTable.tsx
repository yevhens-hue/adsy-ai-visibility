'use client';

import React, { useState } from 'react';
import { 
  Star, 
  ExternalLink, 
  Sparkles, 
  CheckCircle2, 
  FileText, 
  ShoppingCart, 
  ShieldCheck,
  ArrowLeft
} from 'lucide-react';

export interface VerifiedPublisher {
  id: string;
  domain: string;
  category: string;
  country: string;
  language: string;
  dr: number;
  da: number;
  traffic: string;
  completionRate: string;
  pricePlacement?: number | null;
  isInAdsy?: boolean;
  aiVisibility: {
    seenInAi: boolean;
    citationsCount: number;
    relevantToGap: string;
    aiOpportunity: 'High' | 'Medium';
    citedInEngines: string[];
  };
}

export function getAdsyOrderUrl(
  publisherId?: string | number | null, 
  domain?: string | null, 
  briefText?: string | null, 
  targetGap?: string | null
): string {
  const params = new URLSearchParams();
  if (briefText && briefText.trim()) {
    params.set('brief', briefText.trim().slice(0, 500));
  }
  if (targetGap && targetGap.trim()) {
    params.set('gap', targetGap.trim());
  }

  if (publisherId) {
    const raw = String(publisherId).trim();
    // Pure numeric ID (e.g. 13278 or '13278')
    if (/^\d+$/.test(raw)) {
      const base = `https://cp.adsy.com/marketer/platform/choose-product/${raw}`;
      const qs = params.toString();
      return qs ? `${base}?${qs}` : base;
    }
  }

  if (domain && domain.trim()) {
    const cleanDomain = domain.trim().replace(/^https?:\/\//i, '').replace(/\/.*$/, '');
    let url = `https://cp.adsy.com/marketer/platform?SiteSearch%5Bsite_url%5D=${encodeURIComponent(cleanDomain)}`;
    const qs = params.toString();
    return qs ? `${url}&${qs}` : url;
  }

  const qs = params.toString();
  return qs 
    ? `https://cp.adsy.com/marketer/platform?${qs}` 
    : 'https://cp.adsy.com/marketer/platform';
}

import { KNOWN_ADSY_CATALOG } from '@/lib/adsy-catalog';
export { KNOWN_ADSY_CATALOG };

export const SAMPLE_PUBLISHERS: VerifiedPublisher[] = [
  {
    id: '13278',
    domain: 'techbullion.com',
    category: 'Technology, Business & Finance',
    country: 'US',
    language: 'English',
    dr: 79,
    da: 68,
    traffic: '320,000',
    completionRate: '98%',
    pricePlacement: 73.80,
    isInAdsy: true,
    aiVisibility: {
      seenInAi: true,
      citationsCount: 4,
      relevantToGap: 'Brand Awareness & Executive Visibility',
      aiOpportunity: 'High',
      citedInEngines: ['ChatGPT', 'Perplexity'],
    },
  },
  {
    id: '97966',
    domain: 'venturebeat.com',
    category: 'Enterprise Tech & AI',
    country: 'US',
    language: 'English',
    dr: 91,
    da: 86,
    traffic: '2,400,000',
    completionRate: '95%',
    pricePlacement: 1529.18,
    isInAdsy: true,
    aiVisibility: {
      seenInAi: true,
      citationsCount: 7,
      relevantToGap: 'Brand Awareness & Executive Visibility',
      aiOpportunity: 'High',
      citedInEngines: ['ChatGPT', 'Perplexity', 'Claude'],
    },
  },
  {
    id: '60417',
    domain: 'forbes.com',
    category: 'Global Business, Leadership & Tech',
    country: 'US',
    language: 'English',
    dr: 94,
    da: 92,
    traffic: '32,000,000',
    completionRate: '92%',
    pricePlacement: 1250.00,
    isInAdsy: true,
    aiVisibility: {
      seenInAi: true,
      citationsCount: 15,
      relevantToGap: 'Brand Awareness & Executive Visibility',
      aiOpportunity: 'High',
      citedInEngines: ['ChatGPT', 'Perplexity', 'Claude'],
    },
  },
  {
    id: '14493',
    domain: 'techtimes.com',
    category: 'Consumer Tech & Emerging Trends',
    country: 'US',
    language: 'English',
    dr: 76,
    da: 62,
    traffic: '410,000',
    completionRate: '97%',
    pricePlacement: 1079.96,
    isInAdsy: true,
    aiVisibility: {
      seenInAi: false,
      citationsCount: 0,
      relevantToGap: 'Brand Awareness & Executive Visibility',
      aiOpportunity: 'Medium',
      citedInEngines: [],
    },
  },
  {
    id: '18368',
    domain: 'business2community.com',
    category: 'Marketing & Digital Strategy',
    country: 'US',
    language: 'English',
    dr: 84,
    da: 76,
    traffic: '720,000',
    completionRate: '94%',
    pricePlacement: 2386.33,
    isInAdsy: true,
    aiVisibility: {
      seenInAi: true,
      citationsCount: 5,
      relevantToGap: 'SEO Performance & Search Authority',
      aiOpportunity: 'High',
      citedInEngines: ['ChatGPT', 'Claude'],
    },
  },
  {
    id: '51869',
    domain: 'ipsnews.net',
    category: 'International News & Search Authority',
    country: 'US',
    language: 'English',
    dr: 81,
    da: 74,
    traffic: '520,000',
    completionRate: '98%',
    pricePlacement: 49.00,
    isInAdsy: true,
    aiVisibility: {
      seenInAi: true,
      citationsCount: 5,
      relevantToGap: 'SEO Performance & Search Authority',
      aiOpportunity: 'High',
      citedInEngines: ['ChatGPT', 'Perplexity'],
    },
  },
  {
    id: '13132',
    domain: 'thestartupmag.com',
    category: 'Startups & Productivity Tools',
    country: 'US',
    language: 'English',
    dr: 65,
    da: 58,
    traffic: '85,000',
    completionRate: '99%',
    pricePlacement: 79.50,
    isInAdsy: true,
    aiVisibility: {
      seenInAi: false,
      citationsCount: 0,
      relevantToGap: 'Content Quality & Execution Guides',
      aiOpportunity: 'Medium',
      citedInEngines: [],
    },
  },
  {
    id: 'pub-107',
    domain: 'contentmarketinginstitute.com',
    category: 'Content Marketing & Editorial Quality',
    country: 'US',
    language: 'English',
    dr: 89,
    da: 82,
    traffic: '890,000',
    completionRate: '97%',
    pricePlacement: 580.00,
    isInAdsy: false,
    aiVisibility: {
      seenInAi: true,
      citationsCount: 8,
      relevantToGap: 'Content Quality & Execution Guides',
      aiOpportunity: 'High',
      citedInEngines: ['ChatGPT', 'Claude', 'Perplexity'],
    },
  },
  {
    id: '55774',
    domain: 'metapress.com',
    category: 'Editorial Guides & Publishing Authority',
    country: 'US',
    language: 'English',
    dr: 77,
    da: 65,
    traffic: '210,000',
    completionRate: '97%',
    pricePlacement: 49.50,
    isInAdsy: true,
    aiVisibility: {
      seenInAi: true,
      citationsCount: 4,
      relevantToGap: 'Content Quality & Execution Guides',
      aiOpportunity: 'High',
      citedInEngines: ['ChatGPT', 'Claude'],
    },
  },
  {
    id: 'pub-103',
    domain: 'financebuzz.com',
    category: 'Finance, Banking & SaaS',
    country: 'US',
    language: 'English',
    dr: 77,
    da: 64,
    traffic: '480,000',
    completionRate: '97%',
    pricePlacement: 240.00,
    isInAdsy: false,
    aiVisibility: {
      seenInAi: true,
      citationsCount: 3,
      relevantToGap: 'Cost Efficiency & ROI Benchmarks',
      aiOpportunity: 'Medium',
      citedInEngines: ['Perplexity'],
    },
  },
  {
    id: '51871',
    domain: 'bignewsnetwork.com',
    category: 'Global Business, Financial & Syndi Network',
    country: 'US',
    language: 'English',
    dr: 75,
    da: 68,
    traffic: '340,000',
    completionRate: '96%',
    pricePlacement: 37.58,
    isInAdsy: true,
    aiVisibility: {
      seenInAi: true,
      citationsCount: 3,
      relevantToGap: 'Cost Efficiency & ROI Benchmarks',
      aiOpportunity: 'High',
      citedInEngines: ['Perplexity'],
    },
  },
  {
    id: '50706',
    domain: 'urbansplatter.com',
    category: 'Real Estate, Architecture & Urban Trends',
    country: 'US',
    language: 'English',
    dr: 68,
    da: 54,
    traffic: '160,000',
    completionRate: '97%',
    pricePlacement: 68.00,
    isInAdsy: true,
    aiVisibility: {
      seenInAi: false,
      citationsCount: 0,
      relevantToGap: 'Content Quality & Execution Guides',
      aiOpportunity: 'Medium',
      citedInEngines: [],
    },
  },
];

export function computeGapRelevance(pub: VerifiedPublisher, gapTopic?: string): { isMatch: boolean; score: number; reason: string } {
  if (!gapTopic || !gapTopic.trim()) {
    return { isMatch: true, score: 1, reason: 'All Inventory' };
  }
  const cleanGap = gapTopic.toLowerCase();
  const cat = (pub.category || '').toLowerCase();
  const dom = (pub.domain || '').toLowerCase();
  const gapField = (pub.aiVisibility?.relevantToGap || '').toLowerCase();

  // 1. Direct match on relevantToGap field
  if (gapField.includes(cleanGap) || cleanGap.includes(gapField)) {
    return { isMatch: true, score: 10, reason: `Targeted for ${gapTopic}` };
  }

  // Determine intent category of the gap
  const isBrandGap = cleanGap.includes('brand') || cleanGap.includes('aware') || cleanGap.includes('recogni') || cleanGap.includes('prominen') || cleanGap.includes('who are') || cleanGap.includes('top guest');
  const isSeoGap = cleanGap.includes('seo') || cleanGap.includes('search') || cleanGap.includes('rank') || cleanGap.includes('backlink') || cleanGap.includes('traffic') || cleanGap.includes('performance');
  const isContentGap = cleanGap.includes('content') || cleanGap.includes('qualit') || cleanGap.includes('process') || cleanGap.includes('guide') || cleanGap.includes('measure') || cleanGap.includes('editorial');
  const isCostGap = cleanGap.includes('cost') || cleanGap.includes('roi') || cleanGap.includes('price') || cleanGap.includes('pricing') || cleanGap.includes('financial') || cleanGap.includes('budget');

  // Check if publisher has designated specialization
  const pubIsSeo = gapField.includes('seo') || cat.includes('seo') || dom.includes('searchenginewatch');
  const pubIsContent = gapField.includes('content') || cat.includes('content') || dom.includes('thestartupmag') || dom.includes('contentmarketinginstitute');
  const pubIsCost = gapField.includes('cost') || gapField.includes('roi') || (cat.includes('finance') && !cat.includes('business')) || dom.includes('financebuzz');
  const pubIsBrand = gapField.includes('brand') || dom.includes('forbes') || dom.includes('venturebeat') || dom.includes('techbullion') || ((cat.includes('business') || cat.includes('leadership')) && !cat.includes('marketing'));

  if (isBrandGap) {
    if (pubIsBrand && !pubIsSeo && !pubIsContent && !pubIsCost) {
      return { isMatch: true, score: 9, reason: 'High-DR Brand Authority' };
    }
    return { isMatch: false, score: 0, reason: 'General Catalog Media' };
  }

  if (isSeoGap) {
    if (pubIsSeo || cat.includes('marketing') || cat.includes('digital') || dom.includes('business2community')) {
      return { isMatch: true, score: 9, reason: 'SEO & Search Authority Media' };
    }
    return { isMatch: false, score: 0, reason: 'General Catalog Media' };
  }

  if (isContentGap) {
    if (pubIsContent || cat.includes('startup') || cat.includes('productivity') || cat.includes('editorial')) {
      return { isMatch: true, score: 9, reason: 'Content Architecture & Guides' };
    }
    return { isMatch: false, score: 0, reason: 'General Catalog Media' };
  }

  if (isCostGap) {
    if (pubIsCost || cat.includes('saas') || cat.includes('banking')) {
      return { isMatch: true, score: 9, reason: 'Financial & ROI Benchmarks' };
    }
    return { isMatch: false, score: 0, reason: 'General Catalog Media' };
  }

  return { isMatch: false, score: 0, reason: 'General Catalog Media' };
}

interface PublisherInventoryTableProps {
  selectedGapTopic?: string;
  publishersList?: VerifiedPublisher[];
  highlightedDomain?: string | null;
  currentDomain?: string;
  onBackToReport?: () => void;
  onOpenBriefModal?: (publisher: VerifiedPublisher) => void;
}

export default function PublisherInventoryTable({ 
  selectedGapTopic, 
  publishersList, 
  highlightedDomain,
  currentDomain,
  onBackToReport,
  onOpenBriefModal 
}: PublisherInventoryTableProps) {
  const [publishers, setPublishers] = useState<VerifiedPublisher[]>(publishersList || SAMPLE_PUBLISHERS);
  const [favorites, setFavorites] = useState<Set<string>>(new Set());
  const [activeFilter, setActiveFilter] = useState<'all' | 'seen_in_ai' | 'high_opportunity' | 'medium_opportunity' | 'adsy_only'>('all');
  const [filterStrictByGap, setFilterStrictByGap] = useState<boolean>(true);

  // 1. Calculate matching publishers based on gap filter
  const gapFilteredPublishers = React.useMemo(() => {
    if (selectedGapTopic && filterStrictByGap) {
      return publishers.filter((p) => computeGapRelevance(p, selectedGapTopic).isMatch);
    }
    return publishers;
  }, [publishers, selectedGapTopic, filterStrictByGap]);

  // 2. Exact dynamic counts for filter buttons
  const countAll = gapFilteredPublishers.length;
  const countSeenInAi = React.useMemo(
    () => gapFilteredPublishers.filter((p) => Boolean(p.aiVisibility?.seenInAi)).length,
    [gapFilteredPublishers]
  );
  const countHighOpp = React.useMemo(
    () => gapFilteredPublishers.filter((p) => p.aiVisibility?.aiOpportunity === 'High').length,
    [gapFilteredPublishers]
  );
  const countMediumOpp = React.useMemo(
    () => gapFilteredPublishers.filter((p) => p.aiVisibility?.aiOpportunity === 'Medium' || !p.aiVisibility?.seenInAi).length,
    [gapFilteredPublishers]
  );
  const countAdsyOnly = React.useMemo(
    () => gapFilteredPublishers.filter((p) => p.isInAdsy !== false).length,
    [gapFilteredPublishers]
  );

  const gapMatchesCount = React.useMemo(() => {
    if (!selectedGapTopic) return 0;
    return publishers.filter(p => computeGapRelevance(p, selectedGapTopic).isMatch).length;
  }, [publishers, selectedGapTopic]);

  React.useEffect(() => {
    if (publishersList && publishersList.length > 0) {
      setPublishers(publishersList);
      return;
    }

    async function fetchInventory() {
      try {
        const res = await fetch('/api/inventory');
        if (res.ok) {
          const json = await res.json();
          if (json.data && json.data.length > 0) {
            setPublishers(json.data);
          }
        }
      } catch (e) {
        console.warn('Failed to load inventory from API:', e);
      }
    }
    fetchInventory();
  }, [publishersList]);

  const toggleFavorite = (id: string) => {
    setFavorites((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const filteredPublishers = React.useMemo(() => {
    return gapFilteredPublishers.filter((p) => {
      if (activeFilter === 'seen_in_ai') {
        return Boolean(p.aiVisibility?.seenInAi);
      }
      if (activeFilter === 'high_opportunity') {
        return p.aiVisibility?.aiOpportunity === 'High';
      }
      if (activeFilter === 'medium_opportunity') {
        return p.aiVisibility?.aiOpportunity === 'Medium' || !p.aiVisibility?.seenInAi;
      }
      if (activeFilter === 'adsy_only') {
        return p.isInAdsy !== false;
      }
      return true;
    });
  }, [gapFilteredPublishers, activeFilter]);

  // Sort highlighted domain to top, followed by gap score relevance
  const sortedPublishers = [...filteredPublishers].sort((a, b) => {
    if (highlightedDomain) {
      const aMatch = a.domain.toLowerCase() === highlightedDomain.toLowerCase();
      const bMatch = b.domain.toLowerCase() === highlightedDomain.toLowerCase();
      if (aMatch && !bMatch) return -1;
      if (!aMatch && bMatch) return 1;
    }
    if (selectedGapTopic) {
      const scoreA = computeGapRelevance(a, selectedGapTopic).score;
      const scoreB = computeGapRelevance(b, selectedGapTopic).score;
      if (scoreA !== scoreB) return scoreB - scoreA;
    }
    return 0;
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      {/* Return to Report Navigation Bar */}
      {onBackToReport && currentDomain && (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: '#F8FAFC', padding: '10px 16px', borderRadius: '8px', border: '1px solid var(--adsy-border)' }}>
          <button 
            onClick={onBackToReport}
            className="btn-adsy-outline"
            style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '13px', fontWeight: 700 }}
          >
            <ArrowLeft size={15} /> Back to AI Visibility Report ({currentDomain})
          </button>
          <span style={{ fontSize: '12px', color: 'var(--adsy-text-secondary)' }}>
            Viewing Verified Media Catalog matching your AI gap strategy
          </span>
        </div>
      )}

      {/* Table Filter & Sub-bar */}
      <div 
        style={{ 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '12px',
          background: '#FFFFFF',
          padding: '12px 16px',
          border: '1px solid var(--adsy-border)',
          borderRadius: '8px'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
          <span style={{ fontWeight: 700, fontSize: '13px', color: 'var(--adsy-text-dark)' }}>
            Filter by AI Signals:
          </span>
          <button 
            type="button"
            onClick={() => setActiveFilter('all')}
            className="badge-adsy-pill"
            style={{ 
              cursor: 'pointer', 
              background: activeFilter === 'all' ? '#1E40AF' : '#F8FAFC',
              color: activeFilter === 'all' ? '#FFFFFF' : '#334155',
              border: activeFilter === 'all' ? '1px solid #1E40AF' : '1px solid var(--adsy-border)',
              fontWeight: activeFilter === 'all' ? 700 : 500,
              padding: '6px 12px',
              transition: 'all 0.15s ease'
            }}
          >
            All Available ({countAll})
          </button>
          <button 
            type="button"
            onClick={() => setActiveFilter('seen_in_ai')}
            className="badge-adsy-pill"
            style={{ 
              cursor: 'pointer', 
              background: activeFilter === 'seen_in_ai' ? '#166534' : '#F8FAFC',
              color: activeFilter === 'seen_in_ai' ? '#FFFFFF' : '#334155',
              border: activeFilter === 'seen_in_ai' ? '1px solid #166534' : '1px solid var(--adsy-border)',
              fontWeight: activeFilter === 'seen_in_ai' ? 700 : 500,
              padding: '6px 12px',
              transition: 'all 0.15s ease'
            }}
          >
            Seen in AI Sources ({countSeenInAi})
          </button>
          <button 
            type="button"
            onClick={() => setActiveFilter('high_opportunity')}
            className="badge-adsy-pill"
            style={{ 
              cursor: 'pointer', 
              background: activeFilter === 'high_opportunity' ? '#6B21A8' : '#F8FAFC',
              color: activeFilter === 'high_opportunity' ? '#FFFFFF' : '#334155',
              border: activeFilter === 'high_opportunity' ? '1px solid #6B21A8' : '1px solid var(--adsy-border)',
              fontWeight: activeFilter === 'high_opportunity' ? 700 : 500,
              padding: '6px 12px',
              transition: 'all 0.15s ease'
            }}
          >
            High AI Opportunity ({countHighOpp})
          </button>
          <button 
            type="button"
            onClick={() => setActiveFilter('medium_opportunity')}
            className="badge-adsy-pill"
            style={{ 
              cursor: 'pointer', 
              background: activeFilter === 'medium_opportunity' ? '#D97706' : '#F8FAFC',
              color: activeFilter === 'medium_opportunity' ? '#FFFFFF' : '#334155',
              border: activeFilter === 'medium_opportunity' ? '1px solid #D97706' : '1px solid var(--adsy-border)',
              fontWeight: activeFilter === 'medium_opportunity' ? 700 : 500,
              padding: '6px 12px',
              transition: 'all 0.15s ease'
            }}
          >
            Catalog Openings ({countMediumOpp})
          </button>
          <button 
            type="button"
            onClick={() => setActiveFilter('adsy_only')}
            className="badge-adsy-pill"
            style={{ 
              cursor: 'pointer', 
              background: activeFilter === 'adsy_only' ? '#0E810C' : '#F8FAFC',
              color: activeFilter === 'adsy_only' ? '#FFFFFF' : '#334155',
              border: activeFilter === 'adsy_only' ? '1px solid #0E810C' : '1px solid var(--adsy-border)',
              fontWeight: activeFilter === 'adsy_only' ? 700 : 500,
              padding: '6px 12px',
              transition: 'all 0.15s ease'
            }}
          >
            <ShieldCheck size={12} style={{ display: 'inline', verticalAlign: 'middle', marginRight: '4px' }} />
            Adsy In-Stock ({countAdsyOnly})
          </button>
        </div>

        {selectedGapTopic && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px' }}>
              <span style={{ color: 'var(--adsy-text-secondary)' }}>Targeted Gap:</span>
              <span className="badge-adsy-pill badge-ai-purple" style={{ fontWeight: 700 }}>
                {selectedGapTopic} ({filterStrictByGap ? `${filteredPublishers.length} targeted` : `${gapMatchesCount} of ${publishers.length} match`})
              </span>
            </div>
            <button
              type="button"
              onClick={() => setFilterStrictByGap(!filterStrictByGap)}
              className="btn-adsy-outline"
              style={{ fontSize: '11px', padding: '3px 8px', background: filterStrictByGap ? '#FFFFFF' : '#EFF6FF', fontWeight: 600 }}
            >
              {filterStrictByGap ? `Show All Catalog (${publishers.length})` : `Filter by Gap Only (${gapMatchesCount})`}
            </button>
          </div>
        )}
      </div>

      {/* Table matching cp.adsy.com/marketer/platform */}
      <div style={{ overflowX: 'auto' }}>
        <table className="cp-table">
          <thead>
            <tr>
              <th style={{ width: '40px' }}></th>
              <th>Platform / Domain</th>
              <th>Category</th>
              <th>DR</th>
              <th>DA</th>
              <th>Traffic</th>
              <th>Completion</th>
              <th>AI Signals & Gaps</th>
              <th>Price</th>
              <th style={{ textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {sortedPublishers.length === 0 ? (
              <tr>
                <td colSpan={10} style={{ textAlign: 'center', padding: '36px 20px', color: 'var(--adsy-text-secondary)' }}>
                  <div style={{ fontSize: '14px', fontWeight: 700, color: 'var(--adsy-text-dark)', marginBottom: '6px' }}>
                    No publishers match the selected filter combination
                  </div>
                  <div style={{ fontSize: '12px', marginBottom: '14px' }}>
                    Active AI Signal filter: <strong>{activeFilter}</strong>. Total available in this view: <strong>{countAll}</strong>.
                  </div>
                  <button 
                    type="button"
                    onClick={() => { setActiveFilter('all'); setFilterStrictByGap(false); }}
                    className="btn-adsy-blue"
                    style={{ fontSize: '12px', padding: '6px 14px' }}
                  >
                    Reset All Filters
                  </button>
                </td>
              </tr>
            ) : (
              sortedPublishers.map((pub) => {
                const isFav = favorites.has(pub.id);
              const isHighlighted = highlightedDomain && pub.domain.toLowerCase() === highlightedDomain.toLowerCase();
              const isAvailableInAdsy = pub.isInAdsy !== false;
              const priceDisplay = isAvailableInAdsy && typeof pub.pricePlacement === 'number' && !isNaN(pub.pricePlacement)
                ? `$${pub.pricePlacement.toFixed(2)}`
                : null;
              const enginesText = (pub.aiVisibility?.citedInEngines && pub.aiVisibility.citedInEngines.length > 0)
                ? pub.aiVisibility.citedInEngines.join(', ')
                : 'ChatGPT, Perplexity';

              return (
                <tr 
                  key={pub.id} 
                  style={{ 
                    background: isHighlighted ? '#FEF9C3' : undefined,
                    transition: 'background 0.3s ease'
                  }}
                >
                  <td>
                    <button 
                      onClick={() => toggleFavorite(pub.id)}
                      style={{ border: 'none', background: 'transparent', cursor: 'pointer' }}
                    >
                      <Star size={16} fill={isFav ? '#EAB308' : 'none'} color={isFav ? '#EAB308' : '#CBD5E1'} />
                    </button>
                  </td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ fontWeight: 700, color: 'var(--adsy-blue)', fontSize: '14px' }}>
                        {pub.domain}
                      </span>
                      <a 
                        href={pub.domain.startsWith('http') ? pub.domain : `https://${pub.domain}`} 
                        target="_blank" 
                        rel="noopener noreferrer"
                      >
                        <ExternalLink size={13} color="#94A3B8" />
                      </a>
                    </div>
                    <div style={{ display: 'flex', gap: '6px', marginTop: '4px', flexWrap: 'wrap' }}>
                      <span className="badge-adsy-pill" style={{ background: '#F1F5F9', color: '#475569' }}>
                        {pub.country || 'US'}
                      </span>
                      {isAvailableInAdsy ? (
                        <span className="badge-adsy-pill" style={{ background: '#DCFCE7', color: '#166534' }}>
                          <ShieldCheck size={11} /> Adsy Verified
                        </span>
                      ) : (
                        <span className="badge-adsy-pill" style={{ background: '#FEF3C7', color: '#92400E' }}>
                          AI Citation (Outreach)
                        </span>
                      )}
                      {isHighlighted && (
                        <span className="badge-adsy-pill badge-ai-purple">
                          Target Source Selected
                        </span>
                      )}
                    </div>
                  </td>
                  <td style={{ color: '#475569', fontSize: '12px', maxWidth: '180px' }}>
                    {pub.category || 'Technology & Digital Strategy'}
                  </td>
                  <td>
                    <span style={{ fontWeight: 700, color: '#1E293B' }}>{pub.dr ?? 75}</span>
                  </td>
                  <td>
                    <span style={{ fontWeight: 700, color: '#64748B' }}>{pub.da ?? 65}</span>
                  </td>
                  <td>
                    <span style={{ fontWeight: 600 }}>{pub.traffic || '250,000'}</span>
                  </td>
                  <td>
                    <span style={{ color: '#0E810C', fontWeight: 600 }}>{pub.completionRate || '98%'}</span>
                  </td>
                  <td>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                      {selectedGapTopic && (
                        <span 
                          className="badge-adsy-pill" 
                          style={{ background: '#EEF2FF', color: '#3730A3', fontWeight: 700, fontSize: '10px' }}
                          title={`Strategic reason: ${computeGapRelevance(pub, selectedGapTopic).reason}`}
                        >
                          {computeGapRelevance(pub, selectedGapTopic).reason}
                        </span>
                      )}
                      {pub.aiVisibility?.seenInAi ? (
                        <span className="badge-adsy-pill badge-ai-green">
                          <CheckCircle2 size={11} /> Seen in AI ({enginesText})
                        </span>
                      ) : (
                        <span className="badge-adsy-pill" style={{ background: '#F1F5F9', color: '#64748B' }}>
                          Thematic Alternative
                        </span>
                      )}
                      <span className={`badge-adsy-pill ${pub.aiVisibility?.aiOpportunity === 'High' ? 'badge-ai-purple' : 'badge-ai-blue'}`}>
                        <Sparkles size={11} /> AI Opportunity: {pub.aiVisibility?.aiOpportunity || 'High'}
                      </span>
                    </div>
                  </td>
                  <td>
                    {priceDisplay ? (
                      <>
                        <div style={{ fontSize: '15px', fontWeight: 800, color: 'var(--adsy-text-dark)' }}>
                          {priceDisplay}
                        </div>
                        <span style={{ fontSize: '10px', color: '#166534', fontWeight: 600, display: 'block' }}>
                          Adsy Marketplace*
                        </span>
                        <span style={{ fontSize: '9px', color: '#94A3B8', display: 'block' }}>
                          Live quote in CP
                        </span>
                      </>
                    ) : (
                      <>
                        <div style={{ fontSize: '13px', fontWeight: 700, color: '#B45309' }}>
                          Earned PR
                        </div>
                        <span style={{ fontSize: '10px', color: '#92400E', fontWeight: 600, display: 'block' }}>
                          Direct Outreach
                        </span>
                        <span style={{ fontSize: '9px', color: '#94A3B8', display: 'block' }}>
                          Not sold in Adsy
                        </span>
                      </>
                    )}
                  </td>
                  <td style={{ textAlign: 'right' }}>
                    <div style={{ display: 'inline-flex', gap: '6px' }}>
                      <button 
                        onClick={() => onOpenBriefModal?.(pub)}
                        className="btn-adsy-outline" 
                        style={{ padding: '6px 10px', fontSize: '12px' }}
                        title="Generate Placement Brief"
                      >
                        <FileText size={14} /> Brief
                      </button>
                      {isAvailableInAdsy ? (
                        <a 
                          href={getAdsyOrderUrl(pub.id, pub.domain)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="btn-adsy-green" 
                          style={{ padding: '6px 12px', fontSize: '12px' }}
                        >
                          <ShoppingCart size={14} /> Buy Post
                        </a>
                      ) : (
                        <button 
                          onClick={() => {
                            setActiveFilter('adsy_only');
                          }}
                          className="btn-adsy-outline" 
                          style={{ padding: '6px 10px', fontSize: '12px', color: '#2563EB', borderColor: '#BFDBFE', background: '#EFF6FF', fontWeight: 600 }}
                          title="View verified Adsy alternatives for this gap"
                        >
                          Match Adsy
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              );
            }))}
          </tbody>
        </table>
        <div style={{ padding: '10px 16px', background: '#F8FAFC', borderTop: '1px solid var(--adsy-border)', fontSize: '11px', color: 'var(--adsy-text-secondary)', lineHeight: 1.5 }}>
          *Цены в Adsy CP динамические и устанавливаются паблишерами индивидуально (зависят от опции размещения или написания статьи). Площадки со статусом <strong>AI Citation (Outreach)</strong> являются внешними авторитетными медиа, обнаруженными в AI-ответах; для них используйте генератор ТЗ (кнопка <strong>Brief</strong>) для прямого outreach или кнопку <strong>Match Adsy</strong> для выбора подтвержденных аналогов из каталога Adsy.
        </div>
      </div>
    </div>
  );
}
