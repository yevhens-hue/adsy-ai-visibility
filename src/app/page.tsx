'use client';

import React, { useState, useEffect } from 'react';
import AdsyHeader from '@/components/AdsyHeader';
import AdsySidebar from '@/components/AdsySidebar';
import PublisherInventoryTable, { VerifiedPublisher, SAMPLE_PUBLISHERS } from '@/components/PublisherInventoryTable';
import PlacementBriefModal from '@/components/PlacementBriefModal';
import ReportComparisonModal from '@/components/ReportComparisonModal';
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
  Plus,
  Trash2,
  GitCompare,
  Filter
} from 'lucide-react';
import { PublicCheckSummary, FullCheckReport, CheckRun, CheckPrompt, RunComparisonDiff } from '@/types';
import { compareCheckRuns } from '@/lib/checker';

const CHECK_STEPS = [
  'Preparing targeted prompts across Category, Comparison & Alternative types...',
  'Querying AI engines (ChatGPT, Perplexity, Claude)...',
  'Extracting brand mentions & verified citation URLs...',
  'Computing Visibility Score, prompt coverage & identifying strategic gaps...'
];

const QUOTA_MAX = 3;
const QUOTA_KEY = 'adsy_ai_quota';
const QUOTA_MONTH_KEY = 'adsy_ai_quota_month';
const GUEST_SESSION_KEY = 'adsy_ai_guest_session';

function getOrCreateGuestSession(): string {
  if (typeof window === 'undefined') return '';
  let sid = sessionStorage.getItem(GUEST_SESSION_KEY);
  if (!sid) {
    sid = `guest-${Date.now()}-${Math.random().toString(36).slice(2)}`;
    sessionStorage.setItem(GUEST_SESSION_KEY, sid);
  }
  return sid;
}

function getQuotaRemaining(): number {
  if (typeof window === 'undefined') return QUOTA_MAX;
  const currentMonth = new Date().toISOString().slice(0, 7); // "2026-09"
  const savedMonth = localStorage.getItem(QUOTA_MONTH_KEY);
  if (savedMonth !== currentMonth) {
    localStorage.setItem(QUOTA_MONTH_KEY, currentMonth);
    localStorage.setItem(QUOTA_KEY, String(QUOTA_MAX));
    return QUOTA_MAX;
  }
  return parseInt(localStorage.getItem(QUOTA_KEY) || String(QUOTA_MAX), 10);
}

function decrementQuota(): number {
  const current = getQuotaRemaining();
  const next = Math.max(0, current - 1);
  localStorage.setItem(QUOTA_KEY, String(next));
  return next;
}

export default function ControlPanelAIVisibilityPage() {
  // Navigation & User State
  const [activeMainTab, setActiveMainTab] = useState<'checker' | 'inventory' | 'reports'>('checker');
  const [userMode, setUserMode] = useState<'guest' | 'marketer'>('marketer'); // Toggle for testing both flows

  // Checker inputs
  const [url, setUrl] = useState('monday.com');
  const [loading, setLoading] = useState(false);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [error, setError] = useState<string | null>(null);

  // Monthly quota state (Section 2.2 TZ - 3 free runs/month)
  const [quotaRemaining, setQuotaRemaining] = useState<number>(QUOTA_MAX);

  // Guest session ID persisted in sessionStorage (Section 1.2 TZ)
  const [guestSessionId, setGuestSessionId] = useState<string>('');

  // Custom prompt & competitor builder (Section 2.2 TZ)
  const [showConfigDrawer, setShowConfigDrawer] = useState(false);
  const [customPrompts, setCustomPrompts] = useState<string[]>([]);
  const [customCompetitors, setCustomCompetitors] = useState<{ name: string; domain: string }[]>([]);
  const [newCompetitorName, setNewCompetitorName] = useState('');
  const [newCompetitorDomain, setNewCompetitorDomain] = useState('');

  // Results state
  const [publicResult, setPublicResult] = useState<PublicCheckSummary | null>(null);
  const [fullReport, setFullReport] = useState<FullCheckReport | null>(null);

  // Sub-tabs inside Report (Section 3.2 TZ)
  const [activeReportTab, setActiveReportTab] = useState<'overview' | 'prompts' | 'answers' | 'sources' | 'competitors' | 'opportunities'>('overview');

  // Filters inside Prompts & Sources tabs
  const [promptFilterType, setPromptFilterType] = useState<string>('all');
  const [sourceFilterInCatalog, setSourceFilterInCatalog] = useState<boolean>(false);
  const [answerPlatformFilter, setAnswerPlatformFilter] = useState<'all' | 'ChatGPT' | 'Perplexity' | 'Claude'>('all');
  const [selectedPromptForAnswer, setSelectedPromptForAnswer] = useState<string | null>(null);

  // Selected gap for inventory matching
  const [selectedGap, setSelectedGap] = useState<string | undefined>(undefined);

  // Modals state
  const [briefPublisher, setBriefPublisher] = useState<VerifiedPublisher | null>(null);
  const [comparisonDiff, setComparisonDiff] = useState<RunComparisonDiff | null>(null);

  // Saved runs history & comparison selection
  const [savedReports, setSavedReports] = useState<{ run: CheckRun; prompts: CheckPrompt[] }[]>([]);
  const [selectedForComparison, setSelectedForComparison] = useState<string[]>([]);

  // Function to load a specific run from Supabase
  const loadSavedRun = async (runId: string) => {
    try {
      const res = await fetch(`/api/runs?id=${runId}`);
      if (res.ok) {
        const json = await res.json();
        if (json.data) {
          const loaded: FullCheckReport = json.data;
          setFullReport(loaded);
          setPublicResult(null);
          setUrl(loaded.run.domain);
          if (loaded.gaps && loaded.gaps.length > 0) {
            setSelectedGap(loaded.gaps[0].topic);
          }
          setActiveMainTab('checker');
        }
      }
    } catch (e) {
      console.warn('Error loading run details:', e);
    }
  };

  // Init quota, guest session, and fetch real runs from Supabase
  useEffect(() => {
    setQuotaRemaining(getQuotaRemaining());
    setGuestSessionId(getOrCreateGuestSession());

    async function initHistory() {
      try {
        const res = await fetch('/api/runs');
        if (res.ok) {
          const json = await res.json();
          const runs: CheckRun[] = json.data || [];
          if (runs.length > 0) {
            setSavedReports(runs.map(r => ({ run: r, prompts: [] })));
            // Load the most recent real run
            await loadSavedRun(runs[0].id);
          }
        }
      } catch (e) {
        console.warn('Error fetching runs history:', e);
      }
    }
    initHistory();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleRunAnalysis = async (targetDomain?: string, isFull = userMode === 'marketer') => {
    const domainToCheck = targetDomain || url;
    if (!domainToCheck.trim()) return;

    // Quota gate for full analysis (Section 2.2 TZ - 3 runs/month)
    if (isFull && quotaRemaining <= 0) {
      setError('Monthly quota exhausted (3/3 used). Quota resets on the 1st of next month.');
      return;
    }

    setLoading(true);
    setError(null);
    setCurrentStepIndex(0);

    const interval = setInterval(() => {
      setCurrentStepIndex((prev) => (prev < CHECK_STEPS.length - 1 ? prev + 1 : prev));
    }, 500);

    try {
      const endpoint = isFull ? '/api/check/full' : '/api/check/public';
      const bodyPayload = isFull
        ? { url: domainToCheck, customPrompts, customCompetitors }
        : { url: domainToCheck, guestSessionId };

      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(bodyPayload),
      });

      const json = await res.json();
      clearInterval(interval);

      if (!res.ok) {
        throw new Error(json.error || 'Failed to complete analysis');
      }

      if (isFull) {
        const rep: FullCheckReport = json.data;
        setFullReport(rep);
        setPublicResult(null);
        if (rep.gaps && rep.gaps.length > 0) {
          setSelectedGap(rep.gaps[0].topic);
        }
        setSavedReports((prev) => [
          { run: rep.run, prompts: rep.prompts },
          ...prev.filter(r => r.run.id !== rep.run.id)
        ]);
        // Decrement monthly quota on successful full run
        const newQuota = decrementQuota();
        setQuotaRemaining(newQuota);
      } else {
        const pub: PublicCheckSummary = json.data;
        setPublicResult(pub);
        setFullReport(null);
        if (pub.gaps && pub.gaps.length > 0) {
          setSelectedGap(pub.gaps[0].topic);
        }
        setSavedReports((prev) => [
          { run: pub.run, prompts: pub.prompts },
          ...prev.filter(r => r.run.id !== pub.run.id)
        ]);
      }
    } catch (err: unknown) {
      clearInterval(interval);
      setError(err instanceof Error ? err.message : 'Error executing analysis');
    } finally {
      setLoading(false);
    }
  };

  const handleAddCompetitor = () => {
    const rawName = newCompetitorName.trim();
    const rawDomain = newCompetitorDomain.trim();
    if (!rawName && !rawDomain) return;

    let finalDomain = rawDomain || rawName;
    finalDomain = finalDomain.replace(/^https?:\/\//i, '').replace(/\/.*$/, '').toLowerCase();
    
    let finalName = rawName;
    if (!finalName || finalName.includes('.')) {
      const clean = (finalDomain || rawName).replace(/^www\./, '').split('.')[0];
      finalName = clean.charAt(0).toUpperCase() + clean.slice(1);
    }

    setCustomCompetitors(prev => [...prev, { name: finalName, domain: finalDomain }]);
    setNewCompetitorName('');
    setNewCompetitorDomain('');
  };

  const handleRemoveCompetitor = (idx: number) => {
    setCustomCompetitors(prev => prev.filter((_, i) => i !== idx));
  };

  const handleTriggerComparison = () => {
    if (selectedForComparison.length !== 2) return;
    const run1Data = savedReports.find(r => r.run.id === selectedForComparison[0]);
    const run2Data = savedReports.find(r => r.run.id === selectedForComparison[1]);
    if (!run1Data || !run2Data) return;

    const diff = compareCheckRuns(run1Data.run, run2Data.run, run1Data.prompts, run2Data.prompts);
    setComparisonDiff(diff);
  };

  const currentRun = fullReport?.run || publicResult?.run;
  const currentGaps = fullReport?.gaps || publicResult?.gaps || [];

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
          {/* Header */}
          <div style={{ marginBottom: '20px' }}>
            <h1 style={{ fontSize: '22px', fontWeight: 800, color: 'var(--adsy-text-dark)', letterSpacing: '-0.02em', margin: 0 }}>
              AI Visibility & Media Gap Matcher
            </h1>
            <p style={{ color: 'var(--adsy-text-secondary)', fontSize: '13px', margin: '4px 0 0' }}>
              Analyze observed brand presence in ChatGPT, Perplexity & Claude, uncover competitor citations, and identify verified publisher placements to close thematic gaps.
            </p>
          </div>

          {/* Adsy Style Primary Navigation Tabs */}
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

          {/* TAB 1: AI Visibility Checker & Report */}
          {activeMainTab === 'checker' && (
            <div>
              {/* Search & Config Panel */}
              <div className="cp-panel" style={{ marginBottom: '20px' }}>
                <form onSubmit={(e) => { e.preventDefault(); handleRunAnalysis(); }}>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr auto auto auto auto', gap: '10px', alignItems: 'center' }}>
                    {/* Domain Input */}
                    <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                      <Search size={18} color="var(--adsy-text-secondary)" style={{ position: 'absolute', left: '12px' }} />
                      <input 
                        type="text"
                        value={url}
                        onChange={(e) => setUrl(e.target.value)}
                        placeholder="Enter domain or URL (e.g. monday.com, hubspot.com, ahrefs.com)"
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

                    {/* Country Selector (US Fixed for MVP) */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', background: '#F8FAFC', border: '1px solid var(--adsy-border)', borderRadius: '8px', padding: '9px 12px', fontSize: '13px', color: '#475569' }}>
                      <Globe size={15} color="#64748B" />
                      <strong>United States</strong>
                    </div>

                    {/* Language Selector (English Fixed for MVP) */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', background: '#F8FAFC', border: '1px solid var(--adsy-border)', borderRadius: '8px', padding: '9px 12px', fontSize: '13px', color: '#475569' }}>
                      <span>English</span>
                    </div>

                    {/* Configure Prompts & Competitors Button */}
                    <button
                      type="button"
                      onClick={() => setShowConfigDrawer(!showConfigDrawer)}
                      className="btn-adsy-outline"
                      style={{ padding: '9px 14px', fontSize: '13px' }}
                    >
                      <SlidersHorizontal size={14} /> Config ({customCompetitors.length} comps)
                    </button>

                    {/* Check Action Button */}
                    <button
                      type="submit"
                      disabled={loading || !url.trim()}
                      className="btn-adsy-green"
                      style={{ padding: '10px 20px', fontSize: '14px' }}
                    >
                      <Sparkles size={16} />
                      {loading ? 'Analyzing AI...' : 'Run Full Analysis'}
                    </button>
                  </div>

                  {/* Status bar */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginTop: '10px', fontSize: '12px', color: 'var(--adsy-text-secondary)' }}>
                    <span>Engines: <strong>ChatGPT, Perplexity, Claude</strong> — 45 queries</span>
                    <span>
                      Monthly quota: <strong style={{ color: quotaRemaining === 0 ? '#DC2626' : quotaRemaining === 1 ? '#F59E0B' : 'inherit' }}>{quotaRemaining}/{QUOTA_MAX} remaining</strong>
                      {quotaRemaining === 0 && (
                        <button 
                          type="button"
                          onClick={() => {
                            localStorage.setItem('adsy_ai_quota', '3');
                            setQuotaRemaining(3);
                            setError(null);
                          }}
                          style={{ border: 'none', background: 'transparent', color: 'var(--adsy-blue)', textDecoration: 'underline', cursor: 'pointer', fontSize: '11px', marginLeft: '6px' }}
                        >
                          (Reset for test)
                        </button>
                      )}
                    </span>
                  </div>
                </form>

                {/* Configuration Drawer for Custom Prompts & Competitors */}
                {showConfigDrawer && (
                  <div style={{ marginTop: '16px', paddingTop: '16px', borderTop: '1px dashed var(--adsy-border)' }}>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                      {/* Competitors List */}
                      <div>
                        <h4 style={{ fontSize: '13px', fontWeight: 700, color: 'var(--adsy-text-dark)', marginBottom: '8px' }}>
                          Target Competitors to Benchmark
                        </h4>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginBottom: '10px' }}>
                          {customCompetitors.map((comp, idx) => (
                            <div key={idx} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '6px 10px', background: '#F8FAFC', borderRadius: '6px', border: '1px solid var(--adsy-border)', fontSize: '12px' }}>
                              <span><strong>{comp.name}</strong> ({comp.domain})</span>
                              <button onClick={() => handleRemoveCompetitor(idx)} style={{ border: 'none', background: 'transparent', cursor: 'pointer', color: '#DC2626' }}>
                                <Trash2 size={13} />
                              </button>
                            </div>
                          ))}
                        </div>
                        <div style={{ display: 'flex', gap: '6px' }}>
                          <input 
                            placeholder="Name (e.g. Asana)" 
                            value={newCompetitorName} 
                            onChange={e => setNewCompetitorName(e.target.value)} 
                            style={{ flex: 1, padding: '6px 10px', fontSize: '12px', border: '1px solid var(--adsy-border)', borderRadius: '6px' }} 
                          />
                          <input 
                            placeholder="Domain (asana.com)" 
                            value={newCompetitorDomain} 
                            onChange={e => setNewCompetitorDomain(e.target.value)} 
                            style={{ flex: 1, padding: '6px 10px', fontSize: '12px', border: '1px solid var(--adsy-border)', borderRadius: '6px' }} 
                          />
                          <button onClick={handleAddCompetitor} className="btn-adsy-outline" style={{ padding: '6px 12px', fontSize: '12px' }}>
                            <Plus size={13} /> Add
                          </button>
                        </div>
                      </div>

                      {/* Custom Prompts */}
                      <div>
                        <h4 style={{ fontSize: '13px', fontWeight: 700, color: 'var(--adsy-text-dark)', marginBottom: '8px' }}>
                          Custom Queries / Prompts ({customPrompts.length})
                        </h4>
                        <textarea
                          rows={3}
                          value={customPrompts.join('\n')}
                          onChange={e => setCustomPrompts(e.target.value.split('\n').filter(Boolean))}
                          placeholder="Enter one prompt per line to inject into analysis"
                          style={{ width: '100%', padding: '8px 10px', fontSize: '12px', border: '1px solid var(--adsy-border)', borderRadius: '6px', fontFamily: 'monospace' }}
                        />
                        <span style={{ fontSize: '11px', color: 'var(--adsy-text-secondary)' }}>
                          Custom queries replace default category prompts in the 15-observation matrix.
                        </span>
                      </div>
                    </div>
                  </div>
                )}

                {/* Progress Bar */}
                {loading && (
                  <div style={{ marginTop: '16px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: 'var(--adsy-text-secondary)', marginBottom: '6px' }}>
                      <span style={{ fontWeight: 600, color: 'var(--adsy-blue)' }}>
                        {CHECK_STEPS[currentStepIndex]}
                      </span>
                      <span>{Math.round(((currentStepIndex + 1) / CHECK_STEPS.length) * 100)}%</span>
                    </div>
                    <div style={{ height: '6px', width: '100%', background: '#E2E8F0', borderRadius: '3px', overflow: 'hidden' }}>
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
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                          <h2 style={{ fontSize: '20px', fontWeight: 800, color: 'var(--adsy-text-dark)', margin: 0 }}>
                            {currentRun.brand_name}
                          </h2>
                          <span className="badge-adsy-pill" style={{ background: '#F1F5F9', color: '#334155' }}>
                            {currentRun.domain}
                          </span>
                          <span className="badge-adsy-pill badge-ai-green">
                            <CheckCircle2 size={11} /> {userMode === 'marketer' ? '45 Observations Verified' : '15 Observations Verified'}
                          </span>
                        </div>
                        <p style={{ color: 'var(--adsy-text-secondary)', fontSize: '13px', margin: 0 }}>
                          Evaluated against ChatGPT, Perplexity & Claude (US market, English). Date: {new Date(currentRun.created_at).toLocaleDateString()}
                        </p>
                      </div>

                      <div style={{ display: 'flex', gap: '8px' }}>
                        <button 
                          onClick={() => {
                            if (currentGaps.length > 0) setSelectedGap(currentGaps[0].topic);
                            setActiveMainTab('inventory');
                          }}
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
                          {currentRun.visibility_score !== null ? `${currentRun.visibility_score}%` : 'No data'}
                        </div>
                        <p style={{ color: 'var(--adsy-text-secondary)', fontSize: '11px', marginTop: '4px', margin: 0 }}>
                          Share of all verified AI observations where {currentRun.brand_name} was mentioned.
                        </p>
                      </div>

                      {/* Prompt Coverage */}
                      <div style={{ padding: '14px', background: '#F8FAFC', borderRadius: '8px', border: '1px solid var(--adsy-border)' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: 'var(--adsy-text-secondary)', fontSize: '12px' }}>
                          <span>Prompt Coverage</span>
                          <Layers size={15} color="#0E810C" />
                        </div>
                        <div style={{ fontSize: '26px', fontWeight: 800, color: '#0E810C', marginTop: '4px' }}>
                          {currentRun.prompt_coverage !== null ? `${currentRun.prompt_coverage}%` : 'No data'}
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
                          {currentRun.brand_mention_share !== null ? `${currentRun.brand_mention_share}%` : 'N/A'}
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
                      AI Answers ({fullReport ? fullReport.answers.length : 1})
                    </button>
                    <button 
                      onClick={() => setActiveReportTab('sources')}
                      className={`btn-adsy-outline ${activeReportTab === 'sources' ? 'btn-adsy-blue' : ''}`}
                      style={{ fontSize: '13px' }}
                    >
                      Sources & Catalog ({fullReport ? fullReport.sources.length : publicResult?.sourcesCount || 0})
                    </button>
                    <button 
                      onClick={() => setActiveReportTab('competitors')}
                      className={`btn-adsy-outline ${activeReportTab === 'competitors' ? 'btn-adsy-blue' : ''}`}
                      style={{ fontSize: '13px' }}
                    >
                      Competitors {userMode === 'guest' ? '(Gated)' : `(${fullReport?.competitors.length || 3})`}
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
                              onClick={() => {
                                setSelectedGap(gap.topic);
                                setActiveMainTab('inventory');
                              }}
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
                      {fullReport ? (
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
                                All ({fullReport.answers.length})
                              </button>
                              <button 
                                onClick={() => setAnswerPlatformFilter('ChatGPT')}
                                className={`badge-adsy-pill ${answerPlatformFilter === 'ChatGPT' ? 'badge-ai-green' : ''}`}
                                style={{ cursor: 'pointer', border: '1px solid var(--adsy-border)' }}
                              >
                                ChatGPT ({fullReport.answers.filter(a => a.platform === 'ChatGPT').length})
                              </button>
                              <button 
                                onClick={() => setAnswerPlatformFilter('Perplexity')}
                                className={`badge-adsy-pill ${answerPlatformFilter === 'Perplexity' ? 'badge-ai-purple' : ''}`}
                                style={{ cursor: 'pointer', border: '1px solid var(--adsy-border)' }}
                              >
                                Perplexity ({fullReport.answers.filter(a => a.platform === 'Perplexity').length})
                              </button>
                              <button 
                                onClick={() => setAnswerPlatformFilter('Claude')}
                                className={`badge-adsy-pill ${answerPlatformFilter === 'Claude' ? 'badge-ai-blue' : ''}`}
                                style={{ cursor: 'pointer', border: '1px solid var(--adsy-border)' }}
                              >
                                Claude ({fullReport.answers.filter(a => a.platform === 'Claude').length})
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
                          {fullReport.answers
                            .filter(a => answerPlatformFilter === 'all' || a.platform === answerPlatformFilter)
                            .filter(a => !selectedPromptForAnswer || a.prompt_id === selectedPromptForAnswer)
                            .map((answer) => {
                              const promptForAnswer = fullReport.prompts.find(p => p.id === answer.prompt_id);
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
                                    <span style={{ fontSize: '11px', color: 'var(--adsy-text-secondary)' }}>
                                      {new Date(answer.collected_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    </span>
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
                                        {new URL(cite).hostname} <ExternalLink size={10} style={{ display: 'inline' }} />
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
                          </div>
                          <p style={{ fontSize: '13px', lineHeight: 1.6, color: 'var(--adsy-text-dark)', background: '#F8FAFC', padding: '12px', borderRadius: '8px' }}>
                            {publicResult?.sampleAnswer?.raw_text}
                          </p>
                          <div style={{ marginTop: '12px', padding: '12px', background: '#FEF3C7', borderRadius: '8px', border: '1px solid #FDE68A', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                            <span style={{ fontSize: '12px', color: '#92400E' }}>
                              Sign in to your Adsy account to unlock all 15 raw answers across ChatGPT, Perplexity & Claude.
                            </span>
                            <button onClick={() => setUserMode('marketer')} className="btn-adsy-blue" style={{ fontSize: '12px', padding: '6px 12px' }}>
                              Unlock All Answers
                            </button>
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
                            Domains repeatedly cited by AI engines for this brand's market space. Cross-referenced with the Adsy publisher catalog.
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
                          {(fullReport?.sources || []).filter(s => !sourceFilterInCatalog || s.is_in_adsy_catalog).map((source) => (
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
                                {source.is_in_adsy_catalog ? (
                                  <button 
                                    onClick={() => {
                                      setSelectedGap(currentGaps[0]?.topic);
                                      setActiveMainTab('inventory');
                                    }}
                                    className="btn-adsy-green" 
                                    style={{ padding: '6px 12px', fontSize: '11px' }}
                                  >
                                    View in Inventory
                                  </button>
                                ) : (
                                  <button 
                                    onClick={() => {
                                      setSelectedGap(currentGaps[0]?.topic);
                                      setActiveMainTab('inventory');
                                    }}
                                    className="btn-adsy-outline" 
                                    style={{ padding: '6px 12px', fontSize: '11px' }}
                                  >
                                    Find Alternatives
                                  </button>
                                )}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}

                  {/* SUB-TAB 5: Competitors Benchmarks (Gated in Public mode) */}
                  {activeReportTab === 'competitors' && (
                    <div>
                      {userMode === 'guest' ? (
                        <div className="cp-panel" style={{ position: 'relative', overflow: 'hidden', padding: '40px 24px', textAlign: 'center' }}>
                          {/* Blurred mockup background */}
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
                            <button onClick={() => setUserMode('marketer')} className="btn-adsy-blue" style={{ padding: '10px 22px', fontSize: '14px' }}>
                              Sign In to Adsy to Reveal Competitors
                            </button>
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
                              {/* Client Brand */}
                              <tr style={{ background: '#F0FDF4' }}>
                                <td>
                                  <strong>{currentRun.brand_name} (Your Brand)</strong>
                                  <div style={{ fontSize: '11px', color: '#16A34A' }}>Active Project</div>
                                </td>
                                <td><strong style={{ color: 'var(--adsy-blue)' }}>{currentRun.visibility_score}%</strong></td>
                                <td><strong>{currentRun.prompt_coverage}%</strong></td>
                                <td><span className="badge-adsy-pill badge-ai-green">Target</span></td>
                                <td>-</td>
                              </tr>

                              {/* Competitors */}
                              {(fullReport?.competitors || []).map((comp) => (
                                <tr key={comp.id}>
                                  <td>
                                    <strong>{comp.name}</strong>
                                    <div style={{ fontSize: '11px', color: 'var(--adsy-text-secondary)' }}>{comp.domain}</div>
                                  </td>
                                  <td><strong>{comp.visibility_score}%</strong></td>
                                  <td><strong>{comp.prompt_coverage}%</strong></td>
                                  <td>{comp.mentions_count} mentions</td>
                                  <td>
                                    <button 
                                      onClick={() => {
                                        setSelectedGap(`Overtake ${comp.name} in Category Citations`);
                                        setActiveMainTab('inventory');
                                      }}
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
                            onClick={() => {
                              setSelectedGap(gap.topic);
                              setActiveMainTab('inventory');
                            }}
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
            </div>
          )}

          {/* TAB 2: Verified Platforms (AI Search & Catalog) */}
          {activeMainTab === 'inventory' && (
            <div>
              {/* Selected Gap Context Banner */}
              {selectedGap && (
                <div style={{ background: '#EFF6FF', border: '1px solid #BFDBFE', borderRadius: '8px', padding: '12px 18px', marginBottom: '16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <Sparkles size={18} color="var(--adsy-blue)" />
                    <div>
                      <span style={{ fontSize: '12px', color: '#1E40AF', fontWeight: 700 }}>
                        Active Media Strategy Filter:
                      </span>
                      <strong style={{ fontSize: '13px', color: '#1E3A8A', display: 'block' }}>
                        {selectedGap}
                      </strong>
                    </div>
                  </div>
                  <button 
                    onClick={() => setSelectedGap(undefined)}
                    className="btn-adsy-outline"
                    style={{ fontSize: '11px', padding: '4px 10px', background: '#FFFFFF' }}
                  >
                    Clear Filter
                  </button>
                </div>
              )}

              {/* Publisher Inventory Table matching cp.adsy.com/marketer/platform */}
              <PublisherInventoryTable 
                selectedGapTopic={selectedGap}
                onOpenBriefModal={(pub: VerifiedPublisher) => setBriefPublisher(pub)}
              />
            </div>
          )}

          {/* TAB 3: Saved Runs History & Run Comparison (Section 5.2 / Q12 TZ) */}
          {activeMainTab === 'reports' && (
            <div className="cp-panel" style={{ padding: 0, overflow: 'hidden' }}>
              <div style={{ padding: '14px 18px', background: '#F8FAFC', borderBottom: '1px solid var(--adsy-border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div>
                  <strong style={{ fontSize: '14px', color: 'var(--adsy-text-dark)' }}>
                    Historical AI Visibility Runs ({savedReports.length})
                  </strong>
                  <p style={{ fontSize: '11px', color: 'var(--adsy-text-secondary)', margin: '2px 0 0' }}>
                    Select any two runs to generate an automated Diff View (Visibility Score delta, newly gained & lost mentions).
                  </p>
                </div>

                <button 
                  onClick={handleTriggerComparison}
                  disabled={selectedForComparison.length !== 2}
                  className="btn-adsy-blue"
                  style={{ fontSize: '12px', padding: '6px 14px', opacity: selectedForComparison.length === 2 ? 1 : 0.5 }}
                >
                  <GitCompare size={14} /> Compare 2 Selected Runs ({selectedForComparison.length}/2)
                </button>
              </div>

              <table className="table-adsy">
                <thead>
                  <tr>
                    <th style={{ width: '40px' }}>Diff</th>
                    <th>Date / Timestamp</th>
                    <th>Domain</th>
                    <th>Mode</th>
                    <th>Visibility Score</th>
                    <th>Prompt Coverage</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {savedReports.map(({ run }) => {
                    const isChecked = selectedForComparison.includes(run.id);
                    return (
                      <tr key={run.id} style={{ background: isChecked ? '#EFF6FF' : 'transparent' }}>
                        <td>
                          <input 
                            type="checkbox"
                            checked={isChecked}
                            onChange={(e) => {
                              if (e.target.checked) {
                                if (selectedForComparison.length < 2) {
                                  setSelectedForComparison(prev => [...prev, run.id]);
                                }
                              } else {
                                setSelectedForComparison(prev => prev.filter(id => id !== run.id));
                              }
                            }}
                          />
                        </td>
                        <td>
                          <strong>{new Date(run.created_at).toLocaleDateString()}</strong>
                          <div style={{ fontSize: '11px', color: 'var(--adsy-text-secondary)' }}>
                            {new Date(run.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </div>
                        </td>
                        <td><strong>{run.domain}</strong></td>
                        <td>
                          <span className="badge-adsy-pill" style={{ background: run.mode === 'full' ? '#EDE9FE' : '#F1F5F9', color: run.mode === 'full' ? '#6D28D9' : '#475569' }}>
                            {run.mode.toUpperCase()}
                          </span>
                        </td>
                        <td>
                          <strong style={{ color: 'var(--adsy-blue)' }}>{run.visibility_score}%</strong>
                        </td>
                        <td>
                          <strong>{run.prompt_coverage}%</strong>
                        </td>
                        <td>
                          <button 
                            onClick={() => loadSavedRun(run.id)}
                            className="btn-adsy-outline"
                            style={{ padding: '4px 10px', fontSize: '11px' }}
                          >
                            Load Report
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </main>
      </div>

      {/* Placement Brief Generator Modal (Section 6.2 TZ) */}
      {briefPublisher && (
        <PlacementBriefModal 
          publisher={briefPublisher}
          gapTopic={selectedGap || 'Enterprise Workflow Category Solutions'}
          brandName={currentRun?.brand_name || 'Brand'}
          runId={currentRun?.id}
          gapId={currentGaps.find(g => g.topic === selectedGap)?.id}
          onClose={() => setBriefPublisher(null)}
        />
      )}

      {/* Report Comparison Diff Modal (Section 5.2 / Q12 TZ) */}
      {comparisonDiff && (
        <ReportComparisonModal 
          diff={comparisonDiff}
          onClose={() => setComparisonDiff(null)}
        />
      )}
    </div>
  );
}
