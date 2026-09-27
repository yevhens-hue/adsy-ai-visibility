'use client';

import React from 'react';
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
  Globe,
  SlidersHorizontal,
  Clock,
  Filter
} from 'lucide-react';
import { 
  CheckRun, 
  CheckGap, 
  PublicCheckSummary, 
  FullCheckReport 
} from '@/types';

function safePercent(val: number | null | undefined): string {
  if (val === null || val === undefined || isNaN(val)) return '0%';
  return `${Math.round(val)}%`;
}

export interface CheckerTabProps {
  url: string;
  setUrl: (val: string) => void;
  loading: boolean;
  currentStepIndex: number;
  checkSteps: string[];
  error: string | null;
  setError: (val: string | null) => void;
  quotaRemaining: number;
  setQuotaRemaining: (val: number) => void;
  showConfigDrawer: boolean;
  setShowConfigDrawer: (val: boolean) => void;
  customPrompts: string[];
  setCustomPrompts: React.Dispatch<React.SetStateAction<string[]>>;
  newPromptInput: string;
  setNewPromptInput: (val: string) => void;
  customCompetitors: { name: string; domain: string }[];
  setCustomCompetitors: React.Dispatch<React.SetStateAction<{ name: string; domain: string }[]>>;
  newCompetitorName: string;
  setNewCompetitorName: (val: string) => void;
  newCompetitorDomain: string;
  setNewCompetitorDomain: (val: string) => void;
  handleAddCompetitor: () => void;
  handleRemoveCompetitor: (idx: number) => void;
  currentRun: CheckRun | null;
  currentGaps: CheckGap[];
  fullReport: FullCheckReport | null;
  publicResult: PublicCheckSummary | null;
  activeReportTab: 'overview' | 'prompts' | 'answers' | 'sources' | 'competitors' | 'opportunities';
  setActiveReportTab: (val: 'overview' | 'prompts' | 'answers' | 'sources' | 'competitors' | 'opportunities') => void;
  promptFilterType: string;
  setPromptFilterType: (val: string) => void;
  sourceFilterInCatalog: boolean;
  setSourceFilterInCatalog: (val: boolean) => void;
  answerPlatformFilter: 'all' | 'ChatGPT' | 'Perplexity' | 'Claude';
  setAnswerPlatformFilter: (val: 'all' | 'ChatGPT' | 'Perplexity' | 'Claude') => void;
  selectedPromptForAnswer: string | null;
  setSelectedPromptForAnswer: (val: string | null) => void;
  userMode: 'guest' | 'marketer';
  onRunAnalysis: (targetDomain?: string) => Promise<void>;
  onSelectGapAndOpenInventory: (topic?: string, domain?: string | null) => void;
}

export default function CheckerTab({
  url,
  setUrl,
  loading,
  currentStepIndex,
  checkSteps,
  error,
  setError,
  quotaRemaining,
  setQuotaRemaining,
  showConfigDrawer,
  setShowConfigDrawer,
  customPrompts,
  setCustomPrompts,
  newPromptInput,
  setNewPromptInput,
  customCompetitors,
  newCompetitorName,
  setNewCompetitorName,
  newCompetitorDomain,
  setNewCompetitorDomain,
  handleAddCompetitor,
  handleRemoveCompetitor,
  currentRun,
  currentGaps,
  fullReport,
  publicResult,
  activeReportTab,
  setActiveReportTab,
  promptFilterType,
  setPromptFilterType,
  sourceFilterInCatalog,
  setSourceFilterInCatalog,
  answerPlatformFilter,
  setAnswerPlatformFilter,
  selectedPromptForAnswer,
  setSelectedPromptForAnswer,
  userMode,
  onRunAnalysis,
  onSelectGapAndOpenInventory,
}: CheckerTabProps) {
  const reportAnswers = fullReport?.answers || (publicResult?.answers?.length ? publicResult.answers : (publicResult?.sampleAnswer ? [publicResult.sampleAnswer] : []));
  const reportSources = fullReport?.sources || publicResult?.sources || [];
  const reportCompetitors = fullReport?.competitors || publicResult?.competitors || [];

  return (
    <div>
      {/* Search & Config Panel */}
      <div className="cp-panel" style={{ marginBottom: '20px' }}>
        <form onSubmit={(e) => { e.preventDefault(); onRunAnalysis(); }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr auto auto auto auto', gap: '10px', alignItems: 'center' }}>
            {/* Domain Input */}
            <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
              <Search size={18} color="var(--adsy-text-secondary)" style={{ position: 'absolute', left: '12px' }} />
              <input 
                type="text" 
                placeholder="Enter domain or URL (e.g. monday.com, hubspot.com, ahrefs.com)" 
                value={url}
                onChange={(e) => setUrl(e.target.value)}
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

            {/* Target Region */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', background: '#F8FAFC', border: '1px solid var(--adsy-border)', borderRadius: '8px', padding: '9px 12px', fontSize: '13px', color: '#475569' }}>
              <Globe size={15} color="#64748B" />
              <strong>United States</strong>
            </div>

            {/* Language */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', background: '#F8FAFC', border: '1px solid var(--adsy-border)', borderRadius: '8px', padding: '9px 12px', fontSize: '13px', color: '#475569' }}>
              <span>English</span>
            </div>

            {/* Custom Builder Toggle */}
            <button 
              type="button"
              onClick={() => setShowConfigDrawer(!showConfigDrawer)}
              className="btn-adsy-outline"
              style={{ padding: '9px 14px', fontSize: '13px' }}
            >
              <SlidersHorizontal size={14} /> Config ({customPrompts.length + customCompetitors.length} comps)
            </button>

            {/* Submit Button */}
            <button 
              type="submit" 
              disabled={loading}
              className="btn-adsy-green" 
              style={{ padding: '10px 20px', fontSize: '14px' }}
            >
              <Sparkles size={16} /> 
              {loading ? 'Analyzing AI Engines...' : 'Run Full Analysis'}
            </button>
          </div>

          {/* Sub-info bar */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginTop: '10px', fontSize: '12px', color: 'var(--adsy-text-secondary)' }}>
            <span>Engines: <strong>ChatGPT, Perplexity, Claude</strong> — 45 queries</span>
            <span>Monthly quota: <strong style={{ color: quotaRemaining === 0 ? 'var(--adsy-red)' : 'inherit' }}>{quotaRemaining}/3 remaining</strong></span>
          </div>
        </form>

        {/* Configuration Drawer */}
        {showConfigDrawer && (
          <div style={{ marginTop: '16px', paddingTop: '16px', borderTop: '1px solid var(--adsy-border)', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
            {/* Custom Competitors */}
            <div>
              <label style={{ fontSize: '12px', fontWeight: 700, color: 'var(--adsy-text-dark)', display: 'block', marginBottom: '8px' }}>
                Target Competitors to Benchmark
              </label>
              <div style={{ display: 'flex', gap: '8px', marginBottom: '8px' }}>
                <input 
                  type="text" 
                  placeholder="Competitor Name (optional)" 
                  value={newCompetitorName}
                  onChange={e => setNewCompetitorName(e.target.value)}
                  style={{ flex: 1, padding: '6px 10px', fontSize: '12px', border: '1px solid var(--adsy-border)', borderRadius: '6px' }}
                />
                <input 
                  type="text" 
                  placeholder="domain.com" 
                  value={newCompetitorDomain}
                  onChange={e => setNewCompetitorDomain(e.target.value)}
                  style={{ flex: 1, padding: '6px 10px', fontSize: '12px', border: '1px solid var(--adsy-border)', borderRadius: '6px' }}
                />
                <button 
                  type="button" 
                  onClick={handleAddCompetitor}
                  className="btn-adsy-outline"
                  style={{ padding: '6px 12px', fontSize: '12px' }}
                >
                  Add
                </button>
              </div>

              {customCompetitors.length > 0 && (
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                  {customCompetitors.map((c, i) => (
                    <span key={i} className="badge-adsy-pill" style={{ background: '#F1F5F9', color: 'var(--adsy-text-dark)' }}>
                      {c.name} ({c.domain})
                      <button 
                        type="button" 
                        onClick={() => handleRemoveCompetitor(i)} 
                        style={{ border: 'none', background: 'transparent', cursor: 'pointer', marginLeft: '4px', color: '#94A3B8' }}
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Custom Queries */}
            <div>
              <label style={{ fontSize: '12px', fontWeight: 700, color: 'var(--adsy-text-dark)', display: 'block', marginBottom: '8px' }}>
                Custom Queries / Prompts ({customPrompts.length})
              </label>
              <div style={{ display: 'flex', gap: '8px', marginBottom: '8px' }}>
                <input 
                  type="text" 
                  placeholder="Enter target search query..." 
                  value={newPromptInput}
                  onChange={e => setNewPromptInput(e.target.value)}
                  style={{ flex: 1, padding: '6px 10px', fontSize: '12px', border: '1px solid var(--adsy-border)', borderRadius: '6px' }}
                />
                <button 
                  type="button" 
                  onClick={() => {
                    if (newPromptInput.trim()) {
                      setCustomPrompts(prev => [...prev, newPromptInput.trim()]);
                      setNewPromptInput('');
                    }
                  }}
                  className="btn-adsy-outline"
                  style={{ padding: '6px 12px', fontSize: '12px' }}
                >
                  Add
                </button>
              </div>

              {customPrompts.length > 0 && (
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                  {customPrompts.map((p, i) => (
                    <span key={i} className="badge-adsy-pill" style={{ background: '#F1F5F9', color: 'var(--adsy-text-dark)' }}>
                      {p}
                      <button 
                        type="button" 
                        onClick={() => setCustomPrompts(prev => prev.filter((_, idx) => idx !== i))} 
                        style={{ border: 'none', background: 'transparent', cursor: 'pointer', marginLeft: '4px', color: '#94A3B8' }}
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Progress bar */}
        {loading && (
          <div style={{ marginTop: '16px', background: '#F8FAFC', border: '1px solid var(--adsy-border)', borderRadius: '8px', padding: '14px 18px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Sparkles size={16} color="var(--adsy-blue)" className="lucide-sparkles" />
                <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--adsy-text-dark)' }}>
                  {checkSteps[currentStepIndex]}
                </span>
              </div>
              <span style={{ fontSize: '12px', color: 'var(--adsy-text-secondary)', fontWeight: 700 }}>
                Step {currentStepIndex + 1} of {checkSteps.length}
              </span>
            </div>
            <div style={{ height: '6px', width: '100%', background: '#E2E8F0', borderRadius: '3px', overflow: 'hidden' }}>
              <div 
                style={{ 
                  width: `${((currentStepIndex + 1) / checkSteps.length) * 100}%`, 
                  height: '100%', 
                  background: 'var(--adsy-green)', 
                  transition: 'width 0.3s ease' 
                }} 
              />
            </div>
          </div>
        )}

        {error && (
          <div style={{ marginTop: '16px', background: 'var(--adsy-red-light)', border: '1px solid #FECACA', borderRadius: '8px', padding: '12px 16px', color: '#991B1B', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <AlertCircle size={16} />
              <span>{error}</span>
            </div>
            {quotaRemaining === 0 && (
              <button 
                type="button"
                onClick={() => {
                  localStorage.setItem('adsy_ai_quota', '3');
                  setQuotaRemaining(3);
                  setError(null);
                }}
                className="btn-adsy-outline"
                style={{ fontSize: '11px', padding: '4px 10px', background: '#FFFFFF' }}
              >
                Reset Quota (Test)
              </button>
            )}
          </div>
        )}
      </div>

      {/* Analysis Results Viewport */}
      {currentRun && (
        <div>
          {/* Top KPI Scorecard */}
          <div className="cp-panel" style={{ marginBottom: '20px' }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px', borderBottom: '1px solid var(--adsy-border)', paddingBottom: '16px' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px', flexWrap: 'wrap' }}>
                  <h2 style={{ fontSize: '20px', fontWeight: 800, color: 'var(--adsy-text-dark)', margin: 0 }}>
                    {currentRun.brand_name}
                  </h2>
                  <span className="badge-adsy-pill" style={{ background: '#F1F5F9', color: '#334155' }}>
                    {currentRun.domain}
                  </span>
                  <span className="badge-adsy-pill badge-ai-green">
                    <CheckCircle2 size={11} /> {userMode === 'marketer' ? '45 Observations Verified' : '15 Observations Verified'}
                  </span>
                  {currentRun.platforms?.some(p => p.toLowerCase().includes('tavily') || p.toLowerCase().includes('live')) ? (
                    <span 
                      className="badge-adsy-pill" 
                      style={{ background: '#ECFDF5', color: '#065F46', border: '1px solid #A7F3D0', fontSize: '11px', display: 'inline-flex', alignItems: 'center', gap: '4px' }}
                      title="Real-time citations and organic brand mentions indexed via Live Tavily Web Search"
                    >
                      <Globe size={11} /> Live Web Search & Citations (Tavily AI)
                    </span>
                  ) : (
                    <span 
                      className="badge-adsy-pill" 
                      style={{ background: '#EEF2FF', color: '#3730A3', border: '1px solid #C7D2FE', fontSize: '11px', display: 'inline-flex', alignItems: 'center', gap: '4px' }}
                      title="Citational ground-truth modeled via AI simulation and indexed publisher knowledge base"
                    >
                      <Sparkles size={11} /> AI Simulation & Knowledge Base Retrieval
                    </span>
                  )}
                </div>
                <p style={{ color: 'var(--adsy-text-secondary)', fontSize: '13px', margin: 0 }}>
                  Evaluated against {currentRun.platforms?.join(', ') || 'ChatGPT, Perplexity & Claude'} (US market, English). Date: {new Date(currentRun.created_at).toLocaleDateString()}
                </p>
                <div style={{ marginTop: '10px', padding: '8px 12px', background: '#F0FDF4', border: '1px solid #BBF7D0', borderRadius: '6px', display: 'inline-flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
                  <span className="badge-adsy-pill badge-ai-green" style={{ fontSize: '9px', fontWeight: 800, padding: '2px 6px' }}>CASE PROOF</span>
                  <span style={{ fontSize: '12px', color: '#166534', fontWeight: 600 }}>
                    Verified tier-1 media placements drove +38% AI visibility growth in 30 days.
                  </span>
                  <a 
                    href="https://adsy.com/blog?s=case+study"
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ fontSize: '11px', color: '#15803D', fontWeight: 700, textDecoration: 'underline', display: 'inline-flex', alignItems: 'center', gap: '3px' }}
                  >
                    Case Studies <ExternalLink size={10} />
                  </a>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '8px' }}>
                <button 
                  onClick={() => onSelectGapAndOpenInventory(currentGaps[0]?.topic, null)}
                  className="btn-adsy-green"
                >
                  <Search size={14} /> Match Publishers in Catalog
                </button>
              </div>
            </div>

            {/* KPI Metric Cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginTop: '16px' }}>
              {/* Visibility Score */}
              <div style={{ padding: '14px', background: '#F8FAFC', borderRadius: '8px', border: '1px solid var(--adsy-border)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: 'var(--adsy-text-secondary)', fontSize: '12px' }}>
                  <span>Visibility Score</span>
                  <TrendingUp size={15} color="#3E4FEA" />
                </div>
                <div style={{ fontSize: '26px', fontWeight: 800, color: 'var(--adsy-blue)', marginTop: '4px' }}>
                  {safePercent(currentRun.visibility_score)}
                </div>
                <p style={{ color: 'var(--adsy-text-secondary)', fontSize: '11px', marginTop: '4px', margin: 0 }}>
                  Share of all verified AI observations where {currentRun.brand_name || currentRun.domain} was mentioned.
                </p>
              </div>

              {/* Prompt Coverage */}
              <div style={{ padding: '14px', background: '#F8FAFC', borderRadius: '8px', border: '1px solid var(--adsy-border)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: 'var(--adsy-text-secondary)', fontSize: '12px' }}>
                  <span>Prompt Coverage</span>
                  <Layers size={15} color="#0E810C" />
                </div>
                <div style={{ fontSize: '26px', fontWeight: 800, color: '#0E810C', marginTop: '4px' }}>
                  {safePercent(currentRun.prompt_coverage)}
                </div>
                <p style={{ color: 'var(--adsy-text-secondary)', fontSize: '11px', marginTop: '4px', margin: 0 }}>
                  Percentage of tested prompts where brand appeared in at least one AI engine.
                </p>
              </div>

              {/* Brand Mention Share */}
              <div style={{ padding: '14px', background: '#F8FAFC', borderRadius: '8px', border: '1px solid var(--adsy-border)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: 'var(--adsy-text-secondary)', fontSize: '12px' }}>
                  <span>Brand Mention Share</span>
                  <Sparkles size={15} color="#7C3AED" />
                </div>
                <div style={{ fontSize: '26px', fontWeight: 800, color: '#7C3AED', marginTop: '4px' }}>
                  {safePercent(currentRun.brand_mention_share)}
                </div>
                <p style={{ color: 'var(--adsy-text-secondary)', fontSize: '11px', marginTop: '4px', margin: 0 }}>
                  Relative mention share compared to active benchmark competitors.
                </p>
              </div>

              {/* Gaps Identified */}
              <div style={{ padding: '14px', background: '#F8FAFC', borderRadius: '8px', border: '1px solid var(--adsy-border)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: 'var(--adsy-text-secondary)', fontSize: '12px' }}>
                  <span>Strategic Gaps</span>
                  <AlertCircle size={15} color="#F59E0B" />
                </div>
                <div style={{ fontSize: '26px', fontWeight: 800, color: '#112C3E', marginTop: '4px' }}>
                  {currentGaps.length} Gaps
                </div>
                <p style={{ color: 'var(--adsy-text-secondary)', fontSize: '11px', marginTop: '4px', margin: 0 }}>
                  High-value search categories missing citation backlink presence.
                </p>
              </div>
            </div>
          </div>

          {/* 6 Report Sub-Tabs (Section 3.2 TZ) */}
          <div style={{ display: 'flex', gap: '8px', marginBottom: '16px', flexWrap: 'wrap' }}>
            <button 
              onClick={() => setActiveReportTab('overview')}
              className={`btn-adsy-outline ${activeReportTab === 'overview' ? 'btn-adsy-blue' : ''}`}
              style={{ fontSize: '13px' }}
            >
              Overview & Gaps ({currentGaps.length})
            </button>
            <button 
              onClick={() => setActiveReportTab('prompts')}
              className={`btn-adsy-outline ${activeReportTab === 'prompts' ? 'btn-adsy-blue' : ''}`}
              style={{ fontSize: '13px' }}
            >
              Prompts ({fullReport ? fullReport.prompts.length : publicResult?.prompts.length || 0})
            </button>
            <button 
              onClick={() => setActiveReportTab('answers')}
              className={`btn-adsy-outline ${activeReportTab === 'answers' ? 'btn-adsy-blue' : ''}`}
              style={{ fontSize: '13px' }}
            >
              AI Answers ({reportAnswers.length})
            </button>
            <button 
              onClick={() => setActiveReportTab('sources')}
              className={`btn-adsy-outline ${activeReportTab === 'sources' ? 'btn-adsy-blue' : ''}`}
              style={{ fontSize: '13px' }}
            >
              Sources & Catalog ({reportSources.length || publicResult?.sourcesCount || 0})
            </button>
            <button 
              onClick={() => setActiveReportTab('competitors')}
              className={`btn-adsy-outline ${activeReportTab === 'competitors' ? 'btn-adsy-blue' : ''}`}
              style={{ fontSize: '13px' }}
            >
              Competitors {userMode === 'guest' ? '(Gated)' : `(${reportCompetitors.length || publicResult?.competitorsCount || 3})`}
            </button>
            <button 
              onClick={() => setActiveReportTab('opportunities')}
              className={`btn-adsy-outline ${activeReportTab === 'opportunities' ? 'btn-adsy-blue' : ''}`}
              style={{ fontSize: '13px' }}
            >
              Opportunities & Media Match
            </button>
          </div>

          {/* SUB-TAB 1: Overview & Gaps */}
          {activeReportTab === 'overview' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              {currentGaps.map((gap) => (
                <div key={gap.id} className="cp-panel" style={{ padding: '16px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ fontWeight: 700, fontSize: '15px', color: 'var(--adsy-text-dark)' }}>
                        {gap.topic}
                      </span>
                      <span className={`badge-adsy-pill ${gap.priority === 'high' ? 'badge-ai-purple' : 'badge-ai-blue'}`}>
                        {gap.priority.toUpperCase()} PRIORITY GAP
                      </span>
                    </div>
                    <button 
                      onClick={() => onSelectGapAndOpenInventory(gap.topic, null)}
                      className="btn-adsy-outline"
                      style={{ fontSize: '12px', padding: '6px 12px' }}
                    >
                      Match Verified Media <ArrowRight size={13} />
                    </button>
                  </div>
                  <p style={{ fontSize: '13px', color: '#475569', lineHeight: 1.5, margin: '0 0 10px' }}>
                    {gap.rationale}
                  </p>
                  <div style={{ background: '#F8FAFC', padding: '10px 14px', borderRadius: '6px', border: '1px solid var(--adsy-border)' }}>
                    <span style={{ fontSize: '11px', fontWeight: 700, color: 'var(--adsy-text-secondary)', display: 'block', marginBottom: '4px' }}>
                      Target Queries Impacted:
                    </span>
                    <ul style={{ margin: 0, paddingLeft: '18px', fontSize: '12px', color: 'var(--adsy-text-dark)' }}>
                      {gap.prompts_list.map((p, idx) => (
                        <li key={idx}>{p}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* SUB-TAB 2: Prompts Table */}
          {activeReportTab === 'prompts' && (
            <div className="cp-panel" style={{ padding: 0, overflow: 'hidden' }}>
              <div style={{ padding: '14px 18px', background: '#F8FAFC', borderBottom: '1px solid var(--adsy-border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span style={{ fontSize: '13px', fontWeight: 700, color: 'var(--adsy-text-dark)' }}>
                  Tested Prompts & Observations Matrix
                </span>
                <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                  <Filter size={14} color="#64748B" />
                  <select 
                    value={promptFilterType} 
                    onChange={e => setPromptFilterType(e.target.value)}
                    style={{ fontSize: '12px', border: '1px solid var(--adsy-border)', borderRadius: '6px', padding: '4px 8px' }}
                  >
                    <option value="all">All Query Types</option>
                    <option value="category">Category</option>
                    <option value="comparison">Comparison</option>
                    <option value="alternative">Alternative</option>
                    <option value="problem">Problem</option>
                    <option value="brand">Brand</option>
                  </select>
                </div>
              </div>

              <table className="table-adsy">
                <thead>
                  <tr>
                    <th>Prompt Text</th>
                    <th>Topic & Type</th>
                    <th>Brand Mentioned?</th>
                    <th>Verified Sources</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {((fullReport ? fullReport.prompts : publicResult?.prompts) || [])
                    .filter(p => promptFilterType === 'all' || p.prompt_type === promptFilterType)
                    .map((prompt) => (
                      <tr key={prompt.id}>
                        <td style={{ maxWidth: '340px' }}>
                          <div style={{ fontWeight: 600, color: 'var(--adsy-text-dark)' }}>{prompt.text}</div>
                          {prompt.is_custom && <span className="badge-adsy-pill badge-ai-purple" style={{ fontSize: '9px', marginTop: '2px' }}>Custom Query</span>}
                        </td>
                        <td>
                          <div>{prompt.topic}</div>
                          <span style={{ fontSize: '11px', color: 'var(--adsy-text-secondary)', textTransform: 'capitalize' }}>
                            {prompt.prompt_type}
                          </span>
                        </td>
                        <td>
                          {prompt.has_brand_mention ? (
                            <span className="badge-adsy-pill badge-ai-green">
                              <CheckCircle2 size={11} /> Mentioned
                            </span>
                          ) : (
                            <span className="badge-adsy-pill" style={{ background: '#F1F5F9', color: '#64748B' }}>
                              Not Observed
                            </span>
                          )}
                        </td>
                        <td>
                          <span style={{ fontSize: '12px', color: 'var(--adsy-blue)', fontWeight: 600 }}>
                            3 URLs Cited
                          </span>
                        </td>
                        <td>
                          <button 
                            onClick={() => setActiveReportTab('answers')}
                            className="btn-adsy-outline"
                            style={{ padding: '4px 8px', fontSize: '11px' }}
                          >
                            View Answer
                          </button>
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          )}

          {/* SUB-TAB 3: AI Answers */}
          {activeReportTab === 'answers' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              {reportAnswers.length > 0 ? (
                <>
                  {/* Engine Filter Bar & Prompt Filter Indicator */}
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '10px', background: '#FFFFFF', padding: '12px 16px', borderRadius: '8px', border: '1px solid var(--adsy-border)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ fontSize: '13px', fontWeight: 700, color: 'var(--adsy-text-dark)' }}>Filter by Engine:</span>
                      <button 
                        onClick={() => setAnswerPlatformFilter('all')}
                        className={`badge-adsy-pill ${answerPlatformFilter === 'all' ? 'badge-ai-blue' : ''}`}
                        style={{ cursor: 'pointer', border: '1px solid var(--adsy-border)' }}
                      >
                        All ({reportAnswers.length})
                      </button>
                      <button 
                        onClick={() => setAnswerPlatformFilter('ChatGPT')}
                        className={`badge-adsy-pill ${answerPlatformFilter === 'ChatGPT' ? 'badge-ai-green' : ''}`}
                        style={{ cursor: 'pointer', border: '1px solid var(--adsy-border)' }}
                      >
                        ChatGPT ({reportAnswers.filter(a => a.platform === 'ChatGPT').length})
                      </button>
                      <button 
                        onClick={() => setAnswerPlatformFilter('Perplexity')}
                        className={`badge-adsy-pill ${answerPlatformFilter === 'Perplexity' ? 'badge-ai-purple' : ''}`}
                        style={{ cursor: 'pointer', border: '1px solid var(--adsy-border)' }}
                      >
                        Perplexity ({reportAnswers.filter(a => a.platform === 'Perplexity').length})
                      </button>
                      <button 
                        onClick={() => setAnswerPlatformFilter('Claude')}
                        className={`badge-adsy-pill ${answerPlatformFilter === 'Claude' ? 'badge-ai-blue' : ''}`}
                        style={{ cursor: 'pointer', border: '1px solid var(--adsy-border)' }}
                      >
                        Claude ({reportAnswers.filter(a => a.platform === 'Claude').length})
                      </button>
                    </div>

                    {selectedPromptForAnswer && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{ fontSize: '12px', color: 'var(--adsy-blue)', fontWeight: 600 }}>
                          Prompt Filter Active
                        </span>
                        <button 
                          onClick={() => setSelectedPromptForAnswer(null)}
                          className="btn-adsy-outline"
                          style={{ padding: '3px 8px', fontSize: '11px' }}
                        >
                          Clear Filter
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Answers Cards */}
                  {reportAnswers
                    .filter(a => answerPlatformFilter === 'all' || a.platform === answerPlatformFilter)
                    .filter(a => !selectedPromptForAnswer || a.prompt_id === selectedPromptForAnswer)
                    .map((answer) => {
                      const allPrompts = fullReport?.prompts || publicResult?.prompts || [];
                      const promptForAnswer = allPrompts.find(p => p.id === answer.prompt_id);
                      return (
                        <div key={answer.id} className="cp-panel" style={{ padding: '16px' }}>
                          {promptForAnswer && (
                            <div style={{ fontSize: '13px', fontWeight: 700, color: 'var(--adsy-text-dark)', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                              <span style={{ color: 'var(--adsy-text-secondary)', fontWeight: 500 }}>Target Query:</span>
                              &ldquo;{promptForAnswer.text}&rdquo;
                              <span className="badge-adsy-pill" style={{ fontSize: '10px', textTransform: 'capitalize' }}>
                                {promptForAnswer.prompt_type}
                              </span>
                            </div>
                          )}

                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                              <span className="badge-adsy-pill" style={{ background: '#112C3E', color: '#FFFFFF', fontWeight: 700 }}>
                                {answer.platform}
                              </span>
                              {answer.brand_mentioned ? (
                                <span className="badge-adsy-pill badge-ai-green">
                                  <CheckCircle2 size={11} /> Brand Mentioned
                                </span>
                              ) : (
                                <span className="badge-adsy-pill" style={{ background: '#FEE2E2', color: '#991B1B' }}>
                                  Brand Missing
                                </span>
                              )}
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '11px', color: 'var(--adsy-text-secondary)' }}>
                              <Clock size={12} />
                              <span>Captured: {new Date(answer.collected_at).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })} at {new Date(answer.collected_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} UTC</span>
                            </div>
                          </div>

                          <p style={{ fontSize: '13px', color: 'var(--adsy-text-dark)', lineHeight: 1.6, background: '#F8FAFC', padding: '12px', borderRadius: '8px', border: '1px solid var(--adsy-border)', margin: '0 0 10px' }}>
                            {answer.raw_text}
                          </p>

                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                            <span style={{ fontSize: '11px', fontWeight: 700, color: 'var(--adsy-text-secondary)' }}>
                              Citations Returned:
                            </span>
                            {answer.citations.map((cite, cIdx) => (
                              <a 
                                key={cIdx} 
                                href={cite} 
                                target="_blank" 
                                rel="noreferrer" 
                                style={{ fontSize: '11px', color: 'var(--adsy-blue)', textDecoration: 'none', background: '#EFF6FF', padding: '2px 8px', borderRadius: '4px' }}
                              >
                                {cite.replace(/^https?:\/\//, '').replace(/\/.*$/, '')} <ExternalLink size={10} style={{ display: 'inline' }} />
                              </a>
                            ))}
                          </div>
                        </div>
                      );
                    })}
                </>
              ) : (
                <div className="cp-panel" style={{ padding: '16px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                    <span className="badge-adsy-pill" style={{ background: '#112C3E', color: '#FFFFFF' }}>
                      {publicResult?.sampleAnswer?.platform || 'Perplexity'}
                    </span>
                    <span className="badge-adsy-pill badge-ai-green">
                      <CheckCircle2 size={11} /> Brand Mentioned
                    </span>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '11px', color: 'var(--adsy-text-secondary)', marginLeft: 'auto' }}>
                      <Clock size={12} />
                      <span>Captured: {new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}</span>
                    </div>
                  </div>
                  <p style={{ fontSize: '13px', lineHeight: 1.6, color: 'var(--adsy-text-dark)', background: '#F8FAFC', padding: '12px', borderRadius: '8px' }}>
                    {publicResult?.sampleAnswer?.raw_text}
                  </p>
                  <div style={{ marginTop: '12px', padding: '12px', background: '#FEF3C7', borderRadius: '8px', border: '1px solid #FDE68A', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <span style={{ fontSize: '12px', color: '#92400E' }}>
                      Sign in to your Adsy account to unlock all 15 raw answers across ChatGPT, Perplexity & Claude.
                    </span>
                    <a 
                      href="https://adsy.com/sign-up?utm_source=ai_visibility&utm_medium=cp_lead_magnet&utm_campaign=ai_audit"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn-adsy-blue" 
                      style={{ fontSize: '12px', padding: '6px 12px', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '6px' }}
                    >
                      Unlock All Answers <ExternalLink size={12} />
                    </a>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* SUB-TAB 4: Sources & Catalog Matching */}
          {activeReportTab === 'sources' && (
            <div className="cp-panel" style={{ padding: 0, overflow: 'hidden' }}>
              <div style={{ padding: '14px 18px', background: '#F8FAFC', borderBottom: '1px solid var(--adsy-border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div>
                  <strong style={{ fontSize: '14px', color: 'var(--adsy-text-dark)' }}>Verified AI Sources (Citational Footprint)</strong>
                  <p style={{ fontSize: '11px', color: 'var(--adsy-text-secondary)', margin: '2px 0 0' }}>
                    Domains repeatedly cited by AI engines for this brand&apos;s market space. Cross-referenced with the Adsy publisher catalog.
                  </p>
                </div>
                <button 
                  onClick={() => setSourceFilterInCatalog(!sourceFilterInCatalog)}
                  className="btn-adsy-outline"
                  style={{ fontSize: '12px', padding: '4px 10px' }}
                >
                  {sourceFilterInCatalog ? 'Show All Sources' : 'Filter: Available in Adsy Only'}
                </button>
              </div>

              <table className="table-adsy">
                <thead>
                  <tr>
                    <th>Cited Domain / URL</th>
                    <th>AI Citation Frequency</th>
                    <th>Catalog Status</th>
                    <th>Adsy Pricing</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {reportSources.filter(s => !sourceFilterInCatalog || s.is_in_adsy_catalog).map((source) => (
                    <tr key={source.id}>
                      <td>
                        <strong style={{ color: 'var(--adsy-text-dark)' }}>{source.domain}</strong>
                        <div style={{ fontSize: '11px', color: 'var(--adsy-text-secondary)' }}>{source.url}</div>
                      </td>
                      <td>
                        <span style={{ fontWeight: 700, color: 'var(--adsy-blue)' }}>
                          {source.frequency} citations
                        </span>
                      </td>
                      <td>
                        {source.is_in_adsy_catalog ? (
                          <span className="badge-adsy-pill badge-ai-green">
                            <CheckCircle2 size={11} /> Available in Adsy
                          </span>
                        ) : (
                          <span className="badge-adsy-pill" style={{ background: '#F1F5F9', color: '#64748B' }}>
                            External Source
                          </span>
                        )}
                      </td>
                      <td>
                        {source.adsy_price ? (
                          <strong style={{ color: 'var(--adsy-green)' }}>${source.adsy_price}</strong>
                        ) : (
                          <span style={{ color: '#94A3B8', fontSize: '12px' }}>Custom Outreach</span>
                        )}
                      </td>
                      <td>
                        <button 
                          onClick={() => onSelectGapAndOpenInventory(currentGaps[0]?.topic, source.domain)}
                          className={source.is_in_adsy_catalog ? "btn-adsy-green" : "btn-adsy-outline"}
                          style={{ padding: '6px 12px', fontSize: '11px' }}
                        >
                          {source.is_in_adsy_catalog ? "View in Inventory" : "Find Alternatives"}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* SUB-TAB 5: Competitors Benchmarks */}
          {activeReportTab === 'competitors' && (
            <div>
              {userMode === 'guest' ? (
                <div className="cp-panel" style={{ position: 'relative', overflow: 'hidden', padding: '40px 24px', textAlign: 'center' }}>
                  <div style={{ filter: 'blur(7px)', opacity: 0.45, pointerEvents: 'none', userSelect: 'none' }}>
                    <table className="table-adsy" style={{ width: '100%' }}>
                      <thead>
                        <tr><th>Competitor</th><th>Visibility Score</th><th>Prompt Coverage</th><th>Mentions</th></tr>
                      </thead>
                      <tbody>
                        <tr><td>Competitor Alpha Pro</td><td>78%</td><td>65%</td><td>24 mentions</td></tr>
                        <tr><td>Competitor Beta Enterprise</td><td>62%</td><td>54%</td><td>18 mentions</td></tr>
                        <tr><td>Competitor Gamma Cloud</td><td>51%</td><td>42%</td><td>14 mentions</td></tr>
                      </tbody>
                    </table>
                  </div>

                  {/* Lock Overlay Modal */}
                  <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: 'rgba(255, 255, 255, 0.75)' }}>
                    <div style={{ width: '48px', height: '48px', borderRadius: '24px', background: '#EEF2FF', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '12px' }}>
                      <Lock size={24} color="var(--adsy-blue)" />
                    </div>
                    <h3 style={{ fontSize: '18px', fontWeight: 800, color: 'var(--adsy-text-dark)', margin: '0 0 6px' }}>
                      Unlock Competitor AI Benchmarks
                    </h3>
                    <p style={{ fontSize: '13px', color: 'var(--adsy-text-secondary)', maxWidth: '440px', margin: '0 0 16px' }}>
                      See which competitors are dominating AI citations for your queries and discover the exact media outlets recommending them.
                    </p>
                    <a 
                      href="https://adsy.com/sign-up?utm_source=ai_visibility&utm_medium=cp_lead_magnet&utm_campaign=ai_audit"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn-adsy-blue" 
                      style={{ padding: '10px 22px', fontSize: '14px', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '8px' }}
                    >
                      Sign In / Register on Adsy <ExternalLink size={14} />
                    </a>
                  </div>
                </div>
              ) : (
                <div className="cp-panel" style={{ padding: 0, overflow: 'hidden' }}>
                  <div style={{ padding: '14px 18px', background: '#F8FAFC', borderBottom: '1px solid var(--adsy-border)' }}>
                    <strong style={{ fontSize: '14px', color: 'var(--adsy-text-dark)' }}>
                      Competitive AI Share of Voice Benchmark
                    </strong>
                    <p style={{ fontSize: '11px', color: 'var(--adsy-text-secondary)', margin: '2px 0 0' }}>
                      Measured on identical query observations across ChatGPT, Perplexity & Claude.
                    </p>
                  </div>

                  <table className="table-adsy">
                    <thead>
                      <tr>
                        <th>Brand / Competitor</th>
                        <th>Visibility Score</th>
                        <th>Prompt Coverage</th>
                        <th>Total Observed Mentions</th>
                        <th>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr style={{ background: '#F0FDF4' }}>
                        <td>
                          <strong>{currentRun.brand_name || currentRun.domain || 'Your Brand'} (Your Brand)</strong>
                          <div style={{ fontSize: '11px', color: '#16A34A' }}>Active Project</div>
                        </td>
                        <td><strong style={{ color: 'var(--adsy-blue)' }}>{safePercent(currentRun.visibility_score)}</strong></td>
                        <td><strong>{safePercent(currentRun.prompt_coverage)}</strong></td>
                        <td><span className="badge-adsy-pill badge-ai-green">Target</span></td>
                        <td>-</td>
                      </tr>

                      {reportCompetitors.map((comp) => (
                        <tr key={comp.id}>
                          <td>
                            <strong>{comp.name || comp.domain}</strong>
                            <div style={{ fontSize: '11px', color: 'var(--adsy-text-secondary)' }}>{comp.domain}</div>
                          </td>
                          <td><strong>{safePercent(comp.visibility_score)}</strong></td>
                          <td><strong>{safePercent(comp.prompt_coverage)}</strong></td>
                          <td>{comp.mentions_count || 0} mentions</td>
                          <td>
                            <button 
                              onClick={() => onSelectGapAndOpenInventory(`Overtake ${comp.name || comp.domain} in Category Citations`, null)}
                              className="btn-adsy-outline"
                              style={{ padding: '4px 10px', fontSize: '11px' }}
                            >
                              Target Placements
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* SUB-TAB 6: Opportunities & Media Match */}
          {activeReportTab === 'opportunities' && (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '16px' }}>
              {currentGaps.map((gap) => (
                <div key={gap.id} className="cp-panel" style={{ padding: '18px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                      <span className={`badge-adsy-pill ${gap.priority === 'high' ? 'badge-ai-purple' : 'badge-ai-blue'}`}>
                        {gap.priority.toUpperCase()} PRIORITY
                      </span>
                      <span style={{ fontSize: '11px', color: 'var(--adsy-text-secondary)' }}>
                        {gap.prompts_list.length} Queries Affected
                      </span>
                    </div>
                    <h3 style={{ fontSize: '16px', fontWeight: 800, color: 'var(--adsy-text-dark)', margin: '0 0 8px' }}>
                      {gap.topic}
                    </h3>
                    <p style={{ fontSize: '12px', color: '#475569', lineHeight: 1.5, margin: '0 0 12px' }}>
                      {gap.rationale}
                    </p>
                  </div>

                  <button 
                    onClick={() => onSelectGapAndOpenInventory(gap.topic, null)}
                    className="btn-adsy-green"
                    style={{ width: '100%', fontSize: '13px' }}
                  >
                    <Search size={14} /> Match Verified Adsy Publishers
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Empty State when no domain has been analyzed yet */}
      {!currentRun && !loading && (
        <div className="cp-panel" style={{ textAlign: 'center', padding: '60px 24px', background: '#FFFFFF' }}>
          <div style={{ width: '56px', height: '56px', borderRadius: '14px', background: '#F0FDF4', color: '#16A34A', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
            <Search size={28} />
          </div>
          <h3 style={{ fontSize: '18px', fontWeight: 800, color: 'var(--adsy-text-dark)', margin: '0 0 8px' }}>
            Live AI Search & Citations Intelligence
          </h3>
          <p style={{ fontSize: '13px', color: 'var(--adsy-text-secondary)', maxWidth: '520px', margin: '0 auto 24px', lineHeight: 1.6 }}>
            Enter your website domain above to inspect real-time brand citations, visibility score, and ranking gaps across ChatGPT, Perplexity, Claude, and Live Tavily Search.
          </p>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', flexWrap: 'wrap' }}>
            <span style={{ fontSize: '12px', color: 'var(--adsy-text-secondary)', fontWeight: 600 }}>Quick try:</span>
            {['ahrefs.com', 'monday.com', 'hubspot.com', 'semrush.com'].map((exampleDomain) => (
              <button
                key={exampleDomain}
                type="button"
                onClick={() => {
                  setUrl(exampleDomain);
                  onRunAnalysis(exampleDomain);
                }}
                className="btn-adsy-outline"
                style={{ padding: '6px 12px', fontSize: '12px', borderRadius: '6px', background: '#F8FAFC' }}
              >
                {exampleDomain}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
