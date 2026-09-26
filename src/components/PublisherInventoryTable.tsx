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
  pricePlacement: number;
  aiVisibility: {
    seenInAi: boolean;
    citationsCount: number;
    relevantToGap: string;
    aiOpportunity: 'High' | 'Medium';
    citedInEngines: string[];
  };
}

export function getAdsyOrderUrl(publisherId?: string | number | null, domain?: string | null): string {
  if (publisherId) {
    const raw = String(publisherId).trim();
    // Pure numeric ID (e.g. 13278 or '13278')
    if (/^\d+$/.test(raw)) {
      return `https://cp.adsy.com/marketer/platform/choose-product/${raw}`;
    }
  }
  if (domain && domain.trim()) {
    const cleanDomain = domain.trim().replace(/^https?:\/\//i, '').replace(/\/.*$/, '');
    return `https://cp.adsy.com/marketer/platform?SiteSearch%5Bsite_url%5D=${encodeURIComponent(cleanDomain)}&SiteSearch%5Bverified%5D=1`;
  }
  return 'https://cp.adsy.com/marketer/platform?SiteSearch%5Bverified%5D=1';
}

export const SAMPLE_PUBLISHERS: VerifiedPublisher[] = [
  {
    id: 'pub-101',
    domain: 'techbullion.com',
    category: 'Technology, Business & Finance',
    country: 'US',
    language: 'English',
    dr: 79,
    da: 68,
    traffic: '320,000',
    completionRate: '98%',
    pricePlacement: 185.00,
    aiVisibility: {
      seenInAi: true,
      citationsCount: 4,
      relevantToGap: 'Enterprise Workflow Solutions Comparison',
      aiOpportunity: 'High',
      citedInEngines: ['ChatGPT', 'Perplexity'],
    },
  },
  {
    id: 'pub-102',
    domain: 'venturebeat.com',
    category: 'Enterprise Tech & AI',
    country: 'US',
    language: 'English',
    dr: 91,
    da: 86,
    traffic: '2,400,000',
    completionRate: '95%',
    pricePlacement: 650.00,
    aiVisibility: {
      seenInAi: true,
      citationsCount: 7,
      relevantToGap: 'Enterprise Workflow Solutions Comparison',
      aiOpportunity: 'High',
      citedInEngines: ['ChatGPT', 'Perplexity', 'Claude'],
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
    aiVisibility: {
      seenInAi: true,
      citationsCount: 3,
      relevantToGap: 'Cost Efficiency & ROI Benchmarks',
      aiOpportunity: 'High',
      citedInEngines: ['Perplexity'],
    },
  },
  {
    id: 'pub-104',
    domain: 'thestartupmag.com',
    category: 'Startups & Productivity Tools',
    country: 'US',
    language: 'English',
    dr: 65,
    da: 58,
    traffic: '85,000',
    completionRate: '99%',
    pricePlacement: 120.00,
    aiVisibility: {
      seenInAi: false,
      citationsCount: 0,
      relevantToGap: 'Cost Efficiency & ROI Benchmarks',
      aiOpportunity: 'Medium',
      citedInEngines: [],
    },
  },
  {
    id: 'pub-105',
    domain: 'business2community.com',
    category: 'Marketing & Digital Strategy',
    country: 'US',
    language: 'English',
    dr: 84,
    da: 76,
    traffic: '720,000',
    completionRate: '94%',
    pricePlacement: 310.00,
    aiVisibility: {
      seenInAi: true,
      citationsCount: 5,
      relevantToGap: 'Enterprise Workflow Solutions Comparison',
      aiOpportunity: 'High',
      citedInEngines: ['ChatGPT', 'Claude'],
    },
  },
];

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
  const [activeFilter, setActiveFilter] = useState<'all' | 'seen_in_ai' | 'high_opportunity'>('all');

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

  const filteredPublishers = publishers.filter((p) => {
    if (activeFilter === 'seen_in_ai' && !p.aiVisibility?.seenInAi) return false;
    if (activeFilter === 'high_opportunity' && p.aiVisibility?.aiOpportunity !== 'High') return false;
    return true;
  });

  // Sort highlighted domain to the very top if set
  const sortedPublishers = [...filteredPublishers].sort((a, b) => {
    if (highlightedDomain) {
      const aMatch = a.domain.toLowerCase() === highlightedDomain.toLowerCase();
      const bMatch = b.domain.toLowerCase() === highlightedDomain.toLowerCase();
      if (aMatch && !bMatch) return -1;
      if (!aMatch && bMatch) return 1;
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
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontWeight: 700, fontSize: '13px', color: 'var(--adsy-text-dark)' }}>
            Filter by AI Signals:
          </span>
          <button 
            onClick={() => setActiveFilter('all')}
            className={`badge-adsy-pill ${activeFilter === 'all' ? 'badge-ai-blue' : ''}`}
            style={{ cursor: 'pointer', border: '1px solid var(--adsy-border)' }}
          >
            All Verified ({publishers.length})
          </button>
          <button 
            onClick={() => setActiveFilter('seen_in_ai')}
            className={`badge-adsy-pill ${activeFilter === 'seen_in_ai' ? 'badge-ai-green' : ''}`}
            style={{ cursor: 'pointer', border: '1px solid var(--adsy-border)' }}
          >
            Seen in AI Sources
          </button>
          <button 
            onClick={() => setActiveFilter('high_opportunity')}
            className={`badge-adsy-pill ${activeFilter === 'high_opportunity' ? 'badge-ai-purple' : ''}`}
            style={{ cursor: 'pointer', border: '1px solid var(--adsy-border)' }}
          >
            High AI Opportunity
          </button>
        </div>

        {selectedGapTopic && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px' }}>
            <span style={{ color: 'var(--adsy-text-secondary)' }}>Active Strategy Gap:</span>
            <span className="badge-adsy-pill badge-ai-purple">
              {selectedGapTopic}
            </span>
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
            {sortedPublishers.map((pub) => {
              const isFav = favorites.has(pub.id);
              const isHighlighted = highlightedDomain && pub.domain.toLowerCase() === highlightedDomain.toLowerCase();
              const priceDisplay = typeof pub.pricePlacement === 'number' && !isNaN(pub.pricePlacement)
                ? `$${pub.pricePlacement.toFixed(2)}`
                : '$240.00';
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
                    <div style={{ display: 'flex', gap: '6px', marginTop: '4px' }}>
                      <span className="badge-adsy-pill" style={{ background: '#F1F5F9', color: '#475569' }}>
                        {pub.country || 'US'}
                      </span>
                      <span className="badge-adsy-pill" style={{ background: '#DCFCE7', color: '#166534' }}>
                        <ShieldCheck size={11} /> Verified
                      </span>
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
                    <div style={{ fontSize: '15px', fontWeight: 800, color: 'var(--adsy-text-dark)' }}>
                      {priceDisplay}
                    </div>
                    <span style={{ fontSize: '11px', color: 'var(--adsy-text-secondary)' }}>placement</span>
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
                      <a 
                        href={getAdsyOrderUrl(pub.id, pub.domain)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="btn-adsy-green" 
                        style={{ padding: '6px 12px', fontSize: '12px' }}
                      >
                        <ShoppingCart size={14} /> Buy Post
                      </a>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
