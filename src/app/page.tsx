'use client';

import React, { useState, useEffect, useMemo } from 'react';
import AdsyHeader from '@/components/AdsyHeader';
import AdsySidebar from '@/components/AdsySidebar';
import PublisherInventoryTable, { VerifiedPublisher, SAMPLE_PUBLISHERS } from '@/components/PublisherInventoryTable';
import CatalogTab from '@/components/CatalogTab';
import HistoryTab from '@/components/HistoryTab';
import CheckerTab from '@/components/CheckerTab';
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
  ArrowLeft,
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

function safePercent(val: number | null | undefined): string {
  if (val === null || val === undefined || isNaN(val)) return '0%';
  return `${Math.round(val)}%`;
}
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
  const [newPromptInput, setNewPromptInput] = useState('');
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

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const searchParams = new URLSearchParams(window.location.search);
      const urlMode = searchParams.get('mode');
      if (urlMode === 'guest') {
        setUserMode('guest');
      }
    }
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

  const [highlightedDomain, setHighlightedDomain] = useState<string | null>(null);

  const currentRun = fullReport?.run || publicResult?.run;
  const currentGaps = fullReport?.gaps || publicResult?.gaps || [];

  const currentCatalogPublishers = useMemo(() => {
    if (!fullReport?.sources || fullReport.sources.length === 0) {
      return undefined;
    }
    const reportPubs: VerifiedPublisher[] = fullReport.sources.map((s, idx) => {
      const hash = s.domain.split('').reduce((acc, c) => acc + c.charCodeAt(0), 0);
      const dr = 68 + (hash % 26);
      const da = Math.max(50, dr - 10);
      const traffic = `${((hash % 900) + 140).toLocaleString()},000`;
      const completionRate = `${95 + (hash % 5)}%`;

      // Match source to the specific gap where its citations were observed, or round-robin across available gaps
      let assignedGap = 'Strategic Market Visibility';
      if (currentGaps && currentGaps.length > 0) {
        const promptMap = new Map((fullReport.prompts || []).map(p => [p.id, p.text]));
        const gapMatch = currentGaps.find(g => 
          g.prompts_list?.some(pText => {
            const ans = fullReport.answers?.find(a => {
              const pStr = promptMap.get(a.prompt_id);
              return (pStr === pText || (a as any).prompt_text === pText) && a.citations?.some(c => c.toLowerCase().includes(s.domain.toLowerCase()));
            });
            return !!ans;
          })
        );
        assignedGap = gapMatch ? gapMatch.topic : currentGaps[idx % currentGaps.length].topic;
      }

      return {
        id: s.adsy_publisher_id || `pub-rep-${idx}-${s.domain}`,
        domain: s.domain,
        category: `${currentRun?.brand_name || 'Technology'} AI Citations`,
        country: 'US',
        language: 'English',
        dr,
        da,
        traffic,
        completionRate,
        pricePlacement: typeof s.adsy_price === 'number' && !isNaN(s.adsy_price) ? s.adsy_price : 240.00,
        aiVisibility: {
          seenInAi: true,
          citationsCount: typeof s.frequency === 'number' ? s.frequency : 6,
          relevantToGap: assignedGap,
          aiOpportunity: (typeof s.frequency === 'number' && s.frequency >= 8) ? 'High' : 'Medium',
          citedInEngines: (typeof s.frequency === 'number' && s.frequency >= 12)
            ? ['ChatGPT', 'Perplexity', 'Claude']
            : (typeof s.frequency === 'number' && s.frequency >= 6)
              ? ['ChatGPT', 'Perplexity']
              : ['Perplexity'],
        },
      };
    });

    const existingDomains = new Set(reportPubs.map(p => p.domain.toLowerCase()));
    const catalogAlternatives = SAMPLE_PUBLISHERS.filter(p => !existingDomains.has(p.domain.toLowerCase()));
    return [...reportPubs, ...catalogAlternatives];
  }, [fullReport, selectedGap, currentGaps, currentRun]);

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
            <CheckerTab
              url={url}
              setUrl={setUrl}
              loading={loading}
              currentStepIndex={currentStepIndex}
              checkSteps={CHECK_STEPS}
              error={error}
              setError={setError}
              quotaRemaining={quotaRemaining}
              setQuotaRemaining={setQuotaRemaining}
              showConfigDrawer={showConfigDrawer}
              setShowConfigDrawer={setShowConfigDrawer}
              customPrompts={customPrompts}
              setCustomPrompts={setCustomPrompts}
              newPromptInput={newPromptInput}
              setNewPromptInput={setNewPromptInput}
              customCompetitors={customCompetitors}
              setCustomCompetitors={setCustomCompetitors}
              newCompetitorName={newCompetitorName}
              setNewCompetitorName={setNewCompetitorName}
              newCompetitorDomain={newCompetitorDomain}
              setNewCompetitorDomain={setNewCompetitorDomain}
              handleAddCompetitor={handleAddCompetitor}
              handleRemoveCompetitor={handleRemoveCompetitor}
              currentRun={currentRun || null}
              currentGaps={currentGaps}
              fullReport={fullReport}
              publicResult={publicResult}
              activeReportTab={activeReportTab}
              setActiveReportTab={setActiveReportTab}
              promptFilterType={promptFilterType}
              setPromptFilterType={setPromptFilterType}
              sourceFilterInCatalog={sourceFilterInCatalog}
              setSourceFilterInCatalog={setSourceFilterInCatalog}
              answerPlatformFilter={answerPlatformFilter}
              setAnswerPlatformFilter={setAnswerPlatformFilter}
              selectedPromptForAnswer={selectedPromptForAnswer}
              setSelectedPromptForAnswer={setSelectedPromptForAnswer}
              userMode={userMode}
              onRunAnalysis={handleRunAnalysis}
              onSelectGapAndOpenInventory={(topic, dom) => {
                if (topic) setSelectedGap(topic);
                if (dom) setHighlightedDomain(dom);
                else setHighlightedDomain(null);
                setActiveMainTab('inventory');
              }}
            />
          )}

          {/* TAB 2: Verified Platforms (AI Search & Catalog) */}
          {activeMainTab === 'inventory' && (
            <CatalogTab 
              selectedGap={selectedGap}
              onClearGap={() => setSelectedGap(undefined)}
              publishersList={currentCatalogPublishers}
              highlightedDomain={highlightedDomain}
              currentDomain={currentRun?.domain || (url ? url.trim().toLowerCase() : undefined)}
              onBackToReport={() => setActiveMainTab('checker')}
              onOpenBriefModal={(pub: VerifiedPublisher) => setBriefPublisher(pub)}
            />
          )}

          {/* TAB 3: Saved Runs History & Run Comparison */}
          {activeMainTab === 'reports' && (
            <HistoryTab 
              savedReports={savedReports}
              selectedForComparison={selectedForComparison}
              onToggleCompareRun={(runId) => {
                if (selectedForComparison.includes(runId)) {
                  setSelectedForComparison(prev => prev.filter(id => id !== runId));
                } else if (selectedForComparison.length < 2) {
                  setSelectedForComparison(prev => [...prev, runId]);
                }
              }}
              onTriggerComparison={handleTriggerComparison}
              onLoadSavedRun={loadSavedRun}
            />
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
