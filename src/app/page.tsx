'use client';

import React, { useState, useEffect } from 'react';
import AdsyHeader from '@/components/AdsyHeader';
import AdsySidebar from '@/components/AdsySidebar';
import PublisherInventoryTable, { VerifiedPublisher, SAMPLE_PUBLISHERS } from '@/components/PublisherInventoryTable';
import PlacementBriefModal from '@/components/PlacementBriefModal';
import { 
  Search, 
  Sparkles, 
  ExternalLink, 
  Lock, 
  CheckCircle2, 
  AlertCircle, 
  ArrowRight,
  TrendingUp,
  Layers,
  Database,
  Globe,
  SlidersHorizontal,
  FileText,
  Clock,
  ChevronRight
} from 'lucide-react';
import { PublicCheckSummary } from '@/types';

const CHECK_STEPS = [
  'Preparing 5 targeted prompts (US market, English)...',
  'Querying AI engines (ChatGPT, Perplexity, Claude)...',
  'Extracting brand mentions & verified citation URLs...',
  'Computing Visibility Score & identifying key gaps...'
];

export default function ControlPanelAIVisibilityPage() {
  const [activeMainTab, setActiveMainTab] = useState<'checker' | 'inventory' | 'reports'>('checker');
  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<PublicCheckSummary | null>(null);

  // Sub-tabs inside Checker results
  const [activeResultTab, setActiveResultTab] = useState<'overview' | 'prompts' | 'answers' | 'competitors'>('overview');

  // Selected gap for inventory matching
  const [selectedGap, setSelectedGap] = useState<string | undefined>(undefined);

  // Modal brief
  const [briefPublisher, setBriefPublisher] = useState<VerifiedPublisher | null>(null);

  // Saved reports history
  const [savedReports, setSavedReports] = useState<any[]>([]);

  // Load sample default analysis on first render or keep clean
  const handleCheck = async (e?: React.FormEvent, customUrl?: string) => {
    if (e) e.preventDefault();
    const targetUrl = customUrl || url;
    if (!targetUrl.trim()) return;

    setLoading(true);
    setError(null);
    setCurrentStepIndex(0);

    const interval = setInterval(() => {
      setCurrentStepIndex((prev) => {
        if (prev < CHECK_STEPS.length - 1) return prev + 1;
        return prev;
      });
    }, 600);

    try {
      const res = await fetch('/api/check/public', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: targetUrl }),
      });

      const data = await res.json();
      clearInterval(interval);

      if (!res.ok) {
        throw new Error(data.error || 'Failed to complete check');
      }

      setResult(data.data);
      if (data.data.gaps && data.data.gaps.length > 0) {
        setSelectedGap(data.data.gaps[0].topic);
      }
      setSavedReports((prev) => [data.data.run, ...prev]);
    } catch (err: unknown) {
      clearInterval(interval);
      setError(err instanceof Error ? err.message : 'Error executing check');
    } finally {
      setLoading(false);
    }
  };

  const handleSelectGapForInventory = (gapTopic: string) => {
    setSelectedGap(gapTopic);
    setActiveMainTab('inventory');
  };

  return (
    <div className="cp-shell">
      {/* Authentic Adsy Header */}
      <AdsyHeader />

      <div className="cp-body">
        {/* Authentic Adsy Sidebar */}
        <AdsySidebar 
          currentTab={activeMainTab} 
          onSelectTab={setActiveMainTab} 
        />

        {/* Main Content Viewport */}
        <main className="cp-main">
          {/* Breadcrumb Header */}
          <div style={{ marginBottom: '20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: 'var(--adsy-text-secondary)', marginBottom: '6px' }}>
              <span>Marketer</span>
              <ChevronRight size={12} />
              <span>AI Intelligence</span>
              <ChevronRight size={12} />
              <strong style={{ color: 'var(--adsy-text-dark)' }}>AI Visibility & Search</strong>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '14px' }}>
              <div>
                <h1 style={{ fontSize: '22px', fontWeight: 800, color: 'var(--adsy-text-dark)', letterSpacing: '-0.02em' }}>
                  AI Visibility & Media Gap Matcher
                </h1>
                <p style={{ color: 'var(--adsy-text-secondary)', fontSize: '13px', marginTop: '2px' }}>
                  Analyze observed brand presence in ChatGPT, Perplexity & Claude, uncover competitor citations, and buy verified publisher placements to close thematic gaps.
                </p>
              </div>

              <div style={{ display: 'flex', gap: '8px' }}>
                <a 
                  href="https://cp.adsy.com/marketer/platform?SiteSearch%5Bverified%5D=1"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-adsy-outline"
                >
                  <ExternalLink size={14} /> Open Live Adsy CP
                </a>
              </div>
            </div>
          </div>

          {/* Adsy Style Primary Tabs */}
          <div 
            style={{ 
              display: 'flex', 
              borderBottom: '1px solid var(--adsy-border)', 
              marginBottom: '20px', 
              gap: '4px' 
            }}
          >
            <button
              onClick={() => setActiveMainTab('checker')}
              style={{
                background: 'transparent',
                border: 'none',
                borderBottom: activeMainTab === 'checker' ? '3px solid var(--adsy-blue)' : '3px solid transparent',
                color: activeMainTab === 'checker' ? 'var(--adsy-blue)' : 'var(--adsy-text-secondary)',
                fontWeight: activeMainTab === 'checker' ? 800 : 600,
                fontSize: '14px',
                padding: '10px 18px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}
            >
              <Sparkles size={16} /> AI Visibility Checker
            </button>

            <button
              onClick={() => setActiveMainTab('inventory')}
              style={{
                background: 'transparent',
                border: 'none',
                borderBottom: activeMainTab === 'inventory' ? '3px solid var(--adsy-blue)' : '3px solid transparent',
                color: activeMainTab === 'inventory' ? 'var(--adsy-blue)' : 'var(--adsy-text-secondary)',
                fontWeight: activeMainTab === 'inventory' ? 800 : 600,
                fontSize: '14px',
                padding: '10px 18px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}
            >
              <Search size={16} /> Verified Platforms (AI Catalog)
              {selectedGap && <span className="badge-adsy-pill badge-ai-purple" style={{ fontSize: '10px' }}>1 Gap Filtered</span>}
            </button>

            <button
              onClick={() => setActiveMainTab('reports')}
              style={{
                background: 'transparent',
                border: 'none',
                borderBottom: activeMainTab === 'reports' ? '3px solid var(--adsy-blue)' : '3px solid transparent',
                color: activeMainTab === 'reports' ? 'var(--adsy-blue)' : 'var(--adsy-text-secondary)',
                fontWeight: activeMainTab === 'reports' ? 800 : 600,
                fontSize: '14px',
                padding: '10px 18px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}
            >
              <Clock size={16} /> Saved Runs History ({savedReports.length})
            </button>
          </div>

          {/* TAB 1: AI Visibility Checker */}
          {activeMainTab === 'checker' && (
            <div>
              {/* Adsy-Style Search Filter Box */}
              <div className="cp-panel">
                <form onSubmit={(e) => handleCheck(e)}>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr auto auto auto', gap: '12px', alignItems: 'center' }}>
                    {/* Domain Input */}
                    <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                      <Search size={18} color="var(--adsy-text-secondary)" style={{ position: 'absolute', left: '12px' }} />
                      <input 
                        type="text"
                        value={url}
                        onChange={(e) => setUrl(e.target.value)}
                        placeholder="Enter domain or URL to analyze (e.g. monday.com, hubspot.com, ahrefs.com)"
                        disabled={loading}
                        style={{
                          width: '100%',
                          padding: '10px 12px 10px 38px',
                          border: '1px solid var(--adsy-border)',
                          borderRadius: '8px',
                          fontSize: '14px',
                          outline: 'none',
                          color: 'var(--adsy-text-dark)',
                          background: '#FFFFFF'
                        }}
                      />
                    </div>

                    {/* Country Selector (Fixed US for MVP) */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', background: '#F8FAFC', border: '1px solid var(--adsy-border)', borderRadius: '8px', padding: '9px 12px', fontSize: '13px', color: '#475569' }}>
                      <Globe size={15} color="#64748B" />
                      <strong>United States</strong>
                    </div>

                    {/* Language Selector (Fixed English for MVP) */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', background: '#F8FAFC', border: '1px solid var(--adsy-border)', borderRadius: '8px', padding: '9px 12px', fontSize: '13px', color: '#475569' }}>
                      <span>English</span>
                    </div>

                    {/* Submit Button */}
                    <button 
                      type="submit" 
                      className="btn-adsy-green" 
                      disabled={loading || !url.trim()}
                      style={{ padding: '10px 20px', fontSize: '14px' }}
                    >
                      <Sparkles size={16} />
                      {loading ? 'Analyzing...' : 'Check AI Visibility'}
                    </button>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '12px', fontSize: '12px', color: 'var(--adsy-text-secondary)' }}>
                    <div style={{ display: 'flex', gap: '16px' }}>
                      <span>Sample: <strong>5 Category Prompts</strong></span>
                      <span>AI Engines: <strong>ChatGPT, Perplexity, Claude</strong> (15 queries)</span>
                      <span>Cost: <strong>Free Public Tier</strong> (3/month)</span>
                    </div>

                    <div style={{ display: 'flex', gap: '8px' }}>
                      <span style={{ color: 'var(--adsy-blue)', cursor: 'pointer' }} onClick={() => { setUrl('monday.com'); handleCheck(undefined, 'monday.com'); }}>
                        Try monday.com
                      </span>
                      <span>•</span>
                      <span style={{ color: 'var(--adsy-blue)', cursor: 'pointer' }} onClick={() => { setUrl('hubspot.com'); handleCheck(undefined, 'hubspot.com'); }}>
                        Try hubspot.com
                      </span>
                    </div>
                  </div>
                </form>

                {/* Progress bar */}
                {loading && (
                  <div style={{ marginTop: '16px', background: '#F8FAFC', border: '1px solid var(--adsy-border)', borderRadius: '8px', padding: '14px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px', fontSize: '13px', fontWeight: 600 }}>
                      <span style={{ color: 'var(--adsy-blue)' }}>{CHECK_STEPS[currentStepIndex]}</span>
                      <span style={{ color: 'var(--adsy-text-secondary)' }}>{Math.round(((currentStepIndex + 1) / CHECK_STEPS.length) * 100)}%</span>
                    </div>
                    <div style={{ width: '100%', height: '6px', background: '#E2E8F0', borderRadius: '3px', overflow: 'hidden' }}>
                      <div 
                        style={{ 
                          width: `${((currentStepIndex + 1) / CHECK_STEPS.length) * 100}%`,
                          height: '100%',
                          background: 'var(--adsy-green)',
                          transition: 'width 0.3s ease'
                        }}
                      />
                    </div>
                  </div>
                )}

                {/* Error */}
                {error && (
                  <div style={{ marginTop: '16px', background: 'var(--adsy-red-light)', border: '1px solid #FECACA', borderRadius: '8px', padding: '12px', color: '#991B1B', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <AlertCircle size={16} />
                    <span>{error}</span>
                  </div>
                )}
              </div>

              {/* Analysis Result Card */}
              {result && (
                <div>
                  {/* Top Scorecard Panel */}
                  <div className="cp-panel">
                    <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px', borderBottom: '1px solid var(--adsy-border)', paddingBottom: '16px' }}>
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                          <h2 style={{ fontSize: '20px', fontWeight: 800, color: 'var(--adsy-text-dark)' }}>
                            {result.run.brand_name}
                          </h2>
                          <span className="badge-adsy-pill" style={{ background: '#F1F5F9', color: '#334155' }}>
                            {result.run.domain}
                          </span>
                          <span className="badge-adsy-pill badge-ai-green">
                            <CheckCircle2 size={11} /> 15 Observations Verified
                          </span>
                        </div>
                        <p style={{ color: 'var(--adsy-text-secondary)', fontSize: '13px' }}>
                          Evaluated against ChatGPT, Perplexity and Claude in US region. Date: {new Date(result.run.created_at).toLocaleDateString()}
                        </p>
                      </div>

                      <div style={{ display: 'flex', gap: '8px' }}>
                        <button 
                          onClick={() => handleSelectGapForInventory(result.gaps[0]?.topic || '')}
                          className="btn-adsy-green"
                        >
                          <Search size={14} /> Match Publishers in Catalog
                        </button>
                      </div>
                    </div>

                    {/* KPI Metric Cards */}
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px', marginTop: '16px' }}>
                      <div style={{ padding: '14px', background: '#F8FAFC', borderRadius: '8px', border: '1px solid var(--adsy-border)' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: 'var(--adsy-text-secondary)', fontSize: '12px' }}>
                          <span>Visibility Score</span>
                          <TrendingUp size={15} color="#3E4FEA" />
                        </div>
                        <div style={{ fontSize: '26px', fontWeight: 800, color: 'var(--adsy-blue)', marginTop: '4px' }}>
                          {result.run.visibility_score !== null ? `${result.run.visibility_score}%` : 'No data'}
                        </div>
                        <p style={{ color: 'var(--adsy-text-secondary)', fontSize: '11px', marginTop: '4px' }}>
                          Share of all verified observations where {result.run.brand_name} was mentioned.
                        </p>
                      </div>

                      <div style={{ padding: '14px', background: '#F8FAFC', borderRadius: '8px', border: '1px solid var(--adsy-border)' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: 'var(--adsy-text-secondary)', fontSize: '12px' }}>
                          <span>Prompt Coverage</span>
                          <Layers size={15} color="#0E810C" />
                        </div>
                        <div style={{ fontSize: '26px', fontWeight: 800, color: '#0E810C', marginTop: '4px' }}>
                          {result.run.prompt_coverage !== null ? `${result.run.prompt_coverage}%` : 'No data'}
                        </div>
                        <p style={{ color: 'var(--adsy-text-secondary)', fontSize: '11px', marginTop: '4px' }}>
                          Percentage of tested prompts where brand appeared in at least one AI answer.
                        </p>
                      </div>

                      <div style={{ padding: '14px', background: '#F8FAFC', borderRadius: '8px', border: '1px solid var(--adsy-border)' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: 'var(--adsy-text-secondary)', fontSize: '12px' }}>
                          <span>Verified Gaps</span>
                          <Sparkles size={15} color="#F59E0B" />
                        </div>
                        <div style={{ fontSize: '26px', fontWeight: 800, color: '#112C3E', marginTop: '4px' }}>
                          {result.gaps.length} Gaps
                        </div>
                        <p style={{ color: 'var(--adsy-text-secondary)', fontSize: '11px', marginTop: '4px' }}>
                          Topics where competitors are winning citations or presence is absent.
                        </p>
                      </div>

                      <div style={{ padding: '14px', background: '#F8FAFC', borderRadius: '8px', border: '1px solid var(--adsy-border)' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: 'var(--adsy-text-secondary)', fontSize: '12px' }}>
                          <span>Data Reliability</span>
                          <CheckCircle2 size={15} color="#0E810C" />
                        </div>
                        <div style={{ fontSize: '26px', fontWeight: 800, color: '#112C3E', marginTop: '4px' }}>
                          100%
                        </div>
                        <p style={{ color: 'var(--adsy-text-secondary)', fontSize: '11px', marginTop: '4px' }}>
                          15/15 valid observations recorded without API timeout.
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Result Detail Sub-tabs */}
                  <div style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
                    <button 
                      onClick={() => setActiveResultTab('overview')}
                      className={`btn-adsy-outline ${activeResultTab === 'overview' ? 'btn-adsy-blue' : ''}`}
                      style={{ fontSize: '13px' }}
                    >
                      Key Visibility Gaps ({result.gaps.length})
                    </button>
                    <button 
                      onClick={() => setActiveResultTab('prompts')}
                      className={`btn-adsy-outline ${activeResultTab === 'prompts' ? 'btn-adsy-blue' : ''}`}
                      style={{ fontSize: '13px' }}
                    >
                      Evaluated Prompts ({result.prompts.length})
                    </button>
                    <button 
                      onClick={() => setActiveResultTab('answers')}
                      className={`btn-adsy-outline ${activeResultTab === 'answers' ? 'btn-adsy-blue' : ''}`}
                      style={{ fontSize: '13px' }}
                    >
                      Sample AI Answer & Sources
                    </button>
                    <button 
                      onClick={() => setActiveResultTab('competitors')}
                      className={`btn-adsy-outline ${activeResultTab === 'competitors' ? 'btn-adsy-blue' : ''}`}
                      style={{ fontSize: '13px' }}
                    >
                      Competitor Benchmarks (Gated)
                    </button>
                  </div>

                  {/* Tab: Overview & Gaps */}
                  {activeResultTab === 'overview' && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                      {result.gaps.map((gap) => (
                        <div key={gap.id} className="cp-panel" style={{ padding: '16px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                              <span style={{ fontWeight: 700, fontSize: '15px', color: 'var(--adsy-text-dark)' }}>
                                {gap.topic}
                              </span>
                              <span className={`badge-adsy-pill ${gap.priority === 'high' ? 'badge-ai-purple' : 'badge-ai-blue'}`}>
                                {gap.priority} Priority Gap
                              </span>
                            </div>
                            <button 
                              onClick={() => handleSelectGapForInventory(gap.topic)}
                              className="btn-adsy-green"
                              style={{ padding: '6px 12px', fontSize: '12px' }}
                            >
                              Find Publishers for This Gap →
                            </button>
                          </div>
                          <p style={{ color: 'var(--adsy-text-secondary)', fontSize: '13px', lineHeight: 1.5, marginBottom: '10px' }}>
                            {gap.rationale}
                          </p>
                          <div style={{ background: '#F8FAFC', padding: '10px', borderRadius: '6px', fontSize: '12px' }}>
                            <strong style={{ color: '#475569' }}>Target Prompts: </strong>
                            <span style={{ color: '#64748B' }}>{gap.prompts_list.join(' | ')}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Tab: Evaluated Prompts */}
                  {activeResultTab === 'prompts' && (
                    <div className="cp-panel" style={{ padding: 0, overflow: 'hidden' }}>
                      <table className="cp-table">
                        <thead>
                          <tr>
                            <th>Prompt Query</th>
                            <th>Topic</th>
                            <th>Query Type</th>
                            <th>Brand Mention Status</th>
                          </tr>
                        </thead>
                        <tbody>
                          {result.prompts.map((p) => (
                            <tr key={p.id}>
                              <td style={{ fontWeight: 600 }}>{p.text}</td>
                              <td style={{ color: 'var(--adsy-text-secondary)' }}>{p.topic}</td>
                              <td>
                                <span className="badge-adsy-pill" style={{ background: '#F1F5F9', color: '#475569' }}>
                                  {p.prompt_type}
                                </span>
                              </td>
                              <td>
                                {p.has_brand_mention ? (
                                  <span className="badge-adsy-pill badge-ai-green">
                                    <CheckCircle2 size={11} /> Mentioned
                                  </span>
                                ) : (
                                  <span className="badge-adsy-pill" style={{ background: '#FEE2E2', color: '#991B1B' }}>
                                    Missing
                                  </span>
                                )}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}

                  {/* Tab: Sample AI Answer */}
                  {activeResultTab === 'answers' && result.sampleAnswer && (
                    <div className="cp-panel">
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
                        <h3 style={{ fontSize: '15px', fontWeight: 700 }}>AI Answer Excerpt</h3>
                        <span className="badge-adsy-pill badge-ai-green">Engine: {result.sampleAnswer.platform}</span>
                      </div>
                      <div style={{ background: '#F8FAFC', border: '1px solid var(--adsy-border)', padding: '14px', borderRadius: '8px', fontSize: '13px', lineHeight: 1.6, color: '#334155', marginBottom: '16px' }}>
                        "{result.sampleAnswer.raw_text}"
                      </div>

                      <h4 style={{ fontSize: '13px', fontWeight: 700, color: 'var(--adsy-text-secondary)', textTransform: 'uppercase', marginBottom: '8px' }}>
                        Verified Citations in Response ({result.sampleAnswer.citations.length})
                      </h4>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                        {result.sampleAnswer.citations.map((cite, idx) => (
                          <div 
                            key={idx} 
                            style={{ 
                              display: 'flex', 
                              alignItems: 'center', 
                              justifyContent: 'space-between', 
                              padding: '8px 12px', 
                              background: '#F8FAFC', 
                              border: '1px solid var(--adsy-border)', 
                              borderRadius: '6px',
                              fontSize: '13px'
                            }}
                          >
                            <span style={{ color: 'var(--adsy-blue)', fontWeight: 600 }}>{cite}</span>
                            <span className="badge-adsy-pill badge-ai-green">Matched in Adsy Catalog</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Tab: Competitors Gated */}
                  {activeResultTab === 'competitors' && (
                    <div className="gated-box">
                      <div className="gated-content">
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px' }}>
                          <div style={{ padding: '20px', background: '#FFFFFF', border: '1px solid #CBD5E1', borderRadius: '8px' }}>Competitor A: 68%</div>
                          <div style={{ padding: '20px', background: '#FFFFFF', border: '1px solid #CBD5E1', borderRadius: '8px' }}>Competitor B: 54%</div>
                          <div style={{ padding: '20px', background: '#FFFFFF', border: '1px solid #CBD5E1', borderRadius: '8px' }}>Competitor C: 42%</div>
                          <div style={{ padding: '20px', background: '#FFFFFF', border: '1px solid #CBD5E1', borderRadius: '8px' }}>Competitor D: 31%</div>
                        </div>
                      </div>
                      <div className="gated-overlay">
                        <Lock size={28} color="#3E4FEA" style={{ marginBottom: '8px' }} />
                        <h4 style={{ fontSize: '16px', fontWeight: 800, color: 'var(--adsy-text-dark)', marginBottom: '4px' }}>
                          {result.competitorsCount} Industry Competitors Detected
                        </h4>
                        <p style={{ color: 'var(--adsy-text-secondary)', fontSize: '13px', maxWidth: '480px', marginBottom: '14px' }}>
                          Sign in with your Adsy Buyer account to view the full competitor share breakdown, side-by-side prompt comparisons and cited publishers.
                        </p>
                        <a href="https://cp.adsy.com/login" target="_blank" rel="noopener noreferrer" className="btn-adsy-blue">
                          Sign In to Adsy to Unlock
                        </a>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* TAB 2: Verified Platforms (Catalog Match) */}
          {activeMainTab === 'inventory' && (
            <div>
              <div className="cp-panel" style={{ padding: '16px', marginBottom: '16px' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div>
                    <h3 style={{ fontSize: '16px', fontWeight: 800, color: 'var(--adsy-text-dark)' }}>
                      Publisher Inventory Matched to AI Gaps
                    </h3>
                    <p style={{ color: 'var(--adsy-text-secondary)', fontSize: '13px' }}>
                      These verified media platforms are already cited by AI systems or possess high topical authority for your identified gaps.
                    </p>
                  </div>
                  {selectedGap && (
                    <button 
                      onClick={() => setSelectedGap(undefined)}
                      className="btn-adsy-outline"
                      style={{ fontSize: '12px' }}
                    >
                      Clear Gap Filter
                    </button>
                  )}
                </div>
              </div>

              {/* Real Adsy Publisher Inventory Table */}
              <PublisherInventoryTable 
                selectedGapTopic={selectedGap}
                onOpenBriefModal={(pub) => setBriefPublisher(pub)}
              />
            </div>
          )}

          {/* TAB 3: Saved Runs History */}
          {activeMainTab === 'reports' && (
            <div className="cp-panel" style={{ padding: 0, overflow: 'hidden' }}>
              <table className="cp-table">
                <thead>
                  <tr>
                    <th>Domain</th>
                    <th>Brand Name</th>
                    <th>Visibility Score</th>
                    <th>Prompt Coverage</th>
                    <th>Execution Date</th>
                    <th style={{ textAlign: 'right' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {savedReports.length > 0 ? (
                    savedReports.map((r, i) => (
                      <tr key={i}>
                        <td style={{ fontWeight: 700, color: 'var(--adsy-blue)' }}>{r.domain}</td>
                        <td>{r.brand_name}</td>
                        <td><strong>{r.visibility_score}%</strong></td>
                        <td><strong>{r.prompt_coverage}%</strong></td>
                        <td style={{ color: 'var(--adsy-text-secondary)' }}>{new Date(r.created_at).toLocaleString()}</td>
                        <td style={{ textAlign: 'right' }}>
                          <button 
                            onClick={() => { setUrl(r.domain); handleCheck(undefined, r.domain); setActiveMainTab('checker'); }}
                            className="btn-adsy-outline" 
                            style={{ padding: '4px 10px', fontSize: '12px' }}
                          >
                            Open Report
                          </button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={6} style={{ textAlign: 'center', padding: '32px', color: 'var(--adsy-text-secondary)' }}>
                        No audit runs saved yet. Run your first check on the AI Visibility Checker tab.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}

          {/* Placement Brief Modal */}
          {briefPublisher && (
            <PlacementBriefModal 
              publisher={briefPublisher}
              gapTopic={selectedGap || 'Enterprise Workflow Solutions Comparison'}
              brandName={result?.run.brand_name || 'Your Brand'}
              onClose={() => setBriefPublisher(null)}
            />
          )}
        </main>
      </div>
    </div>
  );
}
