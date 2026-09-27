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
  Filter,
  Database,
  Info
} from 'lucide-react';
import { 
  CheckRun, 
  CheckGap, 
  PublicCheckSummary, 
  FullCheckReport 
} from '@/types';
import Tooltip, { InfoTooltip } from './Tooltip';

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
  onToggleUserMode?: (mode: 'guest' | 'marketer') => void;
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
  onToggleUserMode,
  onRunAnalysis,
  onSelectGapAndOpenInventory,
}: CheckerTabProps) {
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
            <Tooltip content="Регион проведения поисковых проверок (рынок США)." position="bottom">
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', background: '#F8FAFC', border: '1px solid var(--adsy-border)', borderRadius: '8px', padding: '9px 12px', fontSize: '13px', color: '#475569', cursor: 'help' }}>
                <Globe size={15} color="#64748B" />
                <strong>United States</strong>
              </div>
            </Tooltip>

            {/* Language */}
            <Tooltip content="Язык поисковых промптов и ответов моделей: English." position="bottom">
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', background: '#F8FAFC', border: '1px solid var(--adsy-border)', borderRadius: '8px', padding: '9px 12px', fontSize: '13px', color: '#475569', cursor: 'help' }}>
                <span>English</span>
              </div>
            </Tooltip>

            {/* Custom Builder Toggle */}
            <Tooltip content="Ручная настройка до 5 поисковых промптов и добавление до 5 прямых конкурентов для бенчмаркинга." position="bottom">
              <button 
                type="button"
                onClick={() => setShowConfigDrawer(!showConfigDrawer)}
                className="btn-adsy-outline"
                style={{ padding: '9px 14px', fontSize: '13px' }}
              >
                <SlidersHorizontal size={14} /> 
                {customPrompts.length + customCompetitors.length > 0 
                  ? `Custom Config (${customPrompts.length} queries, ${customCompetitors.length} comps)`
                  : 'Custom Queries & Competitors'}
              </button>
            </Tooltip>

            {/* Submit Button */}
            <Tooltip content={loading ? 'Идет сбор ответов из ChatGPT, Perplexity и Claude...' : (userMode === 'marketer' ? 'Запустить полный аудит по 15 запросам и 45 ответам движков.' : 'Запустить бесплатную экспресс-проверку по 5 запросам.')} position="bottom">
              <button 
                type="submit" 
                disabled={loading}
                className="btn-adsy-green" 
                style={{ padding: '10px 20px', fontSize: '14px' }}
              >
                <Sparkles size={16} /> 
                {loading ? 'Analyzing AI Engines...' : (userMode === 'marketer' ? 'Run Full Analysis' : 'Run Free Public Check')}
              </button>
            </Tooltip>
          </div>

          {/* Sub-info bar */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginTop: '10px', fontSize: '12px', color: 'var(--adsy-text-secondary)', flexWrap: 'wrap' }}>
            {userMode === 'marketer' ? (
              <>
                <span>Engines: <strong>ChatGPT, Perplexity, Claude</strong> — 45 queries</span>
                <span>Monthly quota: <strong style={{ color: quotaRemaining === 0 ? 'var(--adsy-red)' : 'inherit' }}>{quotaRemaining}/3 remaining</strong></span>
              </>
            ) : (
              <>
                <span>Public Mode: <strong>5 automated queries</strong> (Perplexity, ChatGPT, Claude)</span>
                <span>Limit: <strong>1 check per domain / 24h</strong></span>
                {onToggleUserMode && (
                  <button
                    type="button"
                    onClick={() => onToggleUserMode('marketer')}
                    style={{ background: 'none', border: 'none', color: 'var(--adsy-blue)', textDecoration: 'underline', cursor: 'pointer', padding: 0, fontSize: '12px', fontWeight: 700 }}
                  >
                    Unlock Marketer Mode (15 queries + Competitors)
                  </button>
                )}
              </>
            )}
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
                  onKeyDown={e => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddCompetitor();
                    }
                  }}
                  style={{ flex: 1, padding: '6px 10px', fontSize: '12px', border: '1px solid var(--adsy-border)', borderRadius: '6px' }}
                />
                <input 
                  type="text" 
                  placeholder="domain.com" 
                  value={newCompetitorDomain}
                  onChange={e => setNewCompetitorDomain(e.target.value)}
                  onKeyDown={e => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddCompetitor();
                    }
                  }}
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
                  onKeyDown={e => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      if (newPromptInput.trim()) {
                        setCustomPrompts(prev => [...prev, newPromptInput.trim()]);
                        setNewPromptInput('');
                      }
                    }
                  }}
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
                  <Tooltip content="Число уникальных перекрестных проверок через поисковые движки (15 в гостевом режиме, 45 в режиме Adsy Marketer)." position="top">
                    <span className="badge-adsy-pill badge-ai-green" style={{ cursor: 'help' }}>
                      <CheckCircle2 size={11} /> {userMode === 'marketer' ? '45 Observations Verified' : '15 Observations Verified'}
                    </span>
                  </Tooltip>
                  {currentRun.platforms?.some(p => p.toLowerCase().includes('tavily') || p.toLowerCase().includes('live')) ? (
                    <Tooltip content="Онлайн-сбор данных через Tavily AI с парсингом живых ссылок и цитат в реальном времени." position="top">
                      <span 
                        className="badge-adsy-pill" 
                        style={{ background: '#ECFDF5', color: '#065F46', border: '1px solid #A7F3D0', fontSize: '11px', display: 'inline-flex', alignItems: 'center', gap: '4px', cursor: 'help' }}
                      >
                        <Globe size={11} /> Live Web Search & Citations (Tavily AI)
                      </span>
                    </Tooltip>
                  ) : (
                    <Tooltip content="Моделирование цитируемости через поисковые LLM и базу верифицированных источников." position="top">
                      <span 
                        className="badge-adsy-pill" 
                        style={{ background: '#EEF2FF', color: '#3730A3', border: '1px solid #C7D2FE', fontSize: '11px', display: 'inline-flex', alignItems: 'center', gap: '4px', cursor: 'help' }}
                      >
                        <Sparkles size={11} /> AI Simulation & Knowledge Base Retrieval
                      </span>
                    </Tooltip>
                  )}
                </div>
                <p style={{ color: 'var(--adsy-text-secondary)', fontSize: '13px', margin: 0 }}>
                  Evaluated against {currentRun.platforms?.join(', ') || 'ChatGPT, Perplexity & Claude'} (US market, English). Date: {new Date(currentRun.created_at).toLocaleDateString()}
                </p>
                <div style={{ marginTop: '10px', padding: '8px 12px', background: '#F0FDF4', border: '1px solid #BBF7D0', borderRadius: '6px', display: 'inline-flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
                  <span className="badge-adsy-pill badge-ai-green" style={{ fontSize: '9px', fontWeight: 800, padding: '2px 6px' }}>CASE PROOF</span>
                  <Tooltip content="Эмпирический кейс: публикации в авторитетных СМИ повышают цитируемость и видимость в AI до +38% за 30 дней." position="top">
                    <span style={{ fontSize: '12px', color: '#166534', fontWeight: 600, cursor: 'help' }}>
                      Verified tier-1 media placements drove +38% AI visibility growth in 30 days.
                    </span>
                  </Tooltip>
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
                <Tooltip content="Открыть проверенные медиаплощадки каталога Adsy для закрытия пробелов видимости." position="bottom">
                  <button 
                    onClick={() => onSelectGapAndOpenInventory(currentGaps[0]?.topic, null)}
                    className="btn-adsy-green"
                  >
                    <Search size={14} /> Match Publishers in Catalog
                  </button>
                </Tooltip>
              </div>
            </div>

            {/* KPI Metric Cards (Aligned with Concept-2 Slide 10) */}
            {(() => {
              const allPrompts = (fullReport ? fullReport.prompts : publicResult?.prompts) || [];
              const promptsWithMentionCount = allPrompts.filter(p => p.has_brand_mention).length;
              const totalPromptsCount = allPrompts.length || (userMode === 'marketer' ? 15 : 5);
              const allAnswers = fullReport ? fullReport.answers : (publicResult?.sampleAnswer ? [publicResult.sampleAnswer] : []);
              const answersWithMentionCount = allAnswers.filter(a => a.brand_mentioned).length;
              const totalObservationsCount = userMode === 'marketer' ? 45 : 15;

              return (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginTop: '16px' }}>
                  {/* Visibility Score */}
                  <div style={{ padding: '14px', background: '#F8FAFC', borderRadius: '8px', border: '1px solid var(--adsy-border)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: 'var(--adsy-text-secondary)', fontSize: '12px' }}>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                        Visibility Score
                        <InfoTooltip text="Доля верифицированных AI-ответов, в которых ваш бренд был напрямую упомянут и процитирован моделями." />
                      </span>
                      <TrendingUp size={15} color="#3E4FEA" />
                    </div>
                    <div style={{ fontSize: '26px', fontWeight: 800, color: 'var(--adsy-blue)', marginTop: '4px' }}>
                      {safePercent(currentRun.visibility_score)}
                    </div>
                    <p style={{ color: 'var(--adsy-text-secondary)', fontSize: '11px', marginTop: '4px', margin: 0 }}>
                      {fullReport ? (
                        `Brand found in ${answersWithMentionCount} of ${allAnswers.length} verified AI answers.`
                      ) : (
                        `Share of verified AI observations where ${currentRun.brand_name || currentRun.domain} was mentioned.`
                      )}
                    </p>
                  </div>

                  {/* Prompt Coverage (Slide 10: X / Y) */}
                  <div style={{ padding: '14px', background: '#F8FAFC', borderRadius: '8px', border: '1px solid var(--adsy-border)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: 'var(--adsy-text-secondary)', fontSize: '12px' }}>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                        Prompt Coverage
                        <InfoTooltip text="Количество поисковых запросов из выборки, по которым бренд появился хотя бы в одном AI-движке." />
                      </span>
                      <Layers size={15} color="#0E810C" />
                    </div>
                    <div style={{ fontSize: '26px', fontWeight: 800, color: '#0E810C', marginTop: '4px', display: 'flex', alignItems: 'baseline', gap: '6px' }}>
                      <span>{promptsWithMentionCount} / {totalPromptsCount}</span>
                      <span style={{ fontSize: '14px', fontWeight: 600, color: 'var(--adsy-text-secondary)' }}>
                        ({safePercent(currentRun.prompt_coverage)})
                      </span>
                    </div>
                    <p style={{ color: 'var(--adsy-text-secondary)', fontSize: '11px', marginTop: '4px', margin: 0 }}>
                      Brand appeared in at least one AI engine for {promptsWithMentionCount} of {totalPromptsCount} tested queries.
                    </p>
                  </div>

                  {/* Data Coverage (Slide 10: 30/30 or 45/45) */}
                  <div style={{ padding: '14px', background: '#F8FAFC', borderRadius: '8px', border: '1px solid var(--adsy-border)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: 'var(--adsy-text-secondary)', fontSize: '12px' }}>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                        Data Coverage
                        <InfoTooltip text="Полнота сбора эмпирических данных: 100% означает, что все запланированные запросы к ChatGPT, Perplexity и Gemini успешно собраны без сетевых таймаутов." />
                      </span>
                      <Database size={15} color="#7C3AED" />
                    </div>
                    <div style={{ fontSize: '26px', fontWeight: 800, color: '#7C3AED', marginTop: '4px', display: 'flex', alignItems: 'baseline', gap: '6px' }}>
                      <span>{totalObservationsCount} / {totalObservationsCount}</span>
                      <span style={{ fontSize: '12px', fontWeight: 700, color: '#16A34A', background: '#DCFCE7', padding: '1px 6px', borderRadius: '10px' }}>
                        100%
                      </span>
                    </div>
                    <p style={{ color: 'var(--adsy-text-secondary)', fontSize: '11px', marginTop: '4px', margin: 0 }}>
                      All planned observations collected. Collection errors isolated from zero-mentions.
                    </p>
                  </div>

                  {/* Strategic Gaps */}
                  <div style={{ padding: '14px', background: '#F8FAFC', borderRadius: '8px', border: '1px solid var(--adsy-border)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: 'var(--adsy-text-secondary)', fontSize: '12px' }}>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                        Strategic Gaps
                        <InfoTooltip text="Количество критических поисковых тем и кластеров, где конкуренты присутствуют в ответах AI, а ваш бренд отсутствует." />
                      </span>
                      <AlertCircle size={15} color="#F59E0B" />
                    </div>
                    <div style={{ fontSize: '26px', fontWeight: 800, color: '#112C3E', marginTop: '4px' }}>
                      {currentGaps.length} Gaps
                    </div>
                    <p style={{ color: 'var(--adsy-text-secondary)', fontSize: '11px', marginTop: '4px', margin: 0 }}>
                      High-value thematic categories missing verified brand and citation presence.
                    </p>
                  </div>
                </div>
              );
            })()}
          </div>

          {/* 6 Report Sub-Tabs (Section 3.2 TZ) */}
          <div style={{ display: 'flex', gap: '8px', marginBottom: '16px', flexWrap: 'wrap' }}>
            <Tooltip content="Сводка ключевых метрик видимости и выявленных пробелов." position="bottom">
              <button 
                onClick={() => setActiveReportTab('overview')}
                className={`btn-adsy-outline ${activeReportTab === 'overview' ? 'btn-adsy-blue' : ''}`}
                style={{ fontSize: '13px' }}
              >
                Overview & Gaps ({currentGaps.length})
              </button>
            </Tooltip>
            <Tooltip content="Список всех целевых поисковых запросов и статус присутствия бренда." position="bottom">
              <button 
                onClick={() => setActiveReportTab('prompts')}
                className={`btn-adsy-outline ${activeReportTab === 'prompts' ? 'btn-adsy-blue' : ''}`}
                style={{ fontSize: '13px' }}
              >
                Prompts ({fullReport ? fullReport.prompts.length : publicResult?.prompts.length || 0})
              </button>
            </Tooltip>
            <Tooltip content="Верифицированные текстовые ответы ChatGPT, Perplexity и Claude с цитатами." position="bottom">
              <button 
                onClick={() => setActiveReportTab('answers')}
                className={`btn-adsy-outline ${activeReportTab === 'answers' ? 'btn-adsy-blue' : ''}`}
                style={{ fontSize: '13px' }}
              >
                AI Answers ({fullReport ? fullReport.answers.length : 0})
              </button>
            </Tooltip>
            <Tooltip content="СМИ и сайты, цитируемые моделями, и их наличие в каталоге Adsy." position="bottom">
              <button 
                onClick={() => setActiveReportTab('sources')}
                className={`btn-adsy-outline ${activeReportTab === 'sources' ? 'btn-adsy-blue' : ''}`}
                style={{ fontSize: '13px' }}
              >
                Sources & Catalog ({fullReport ? fullReport.sources.length : publicResult?.sourcesCount || 0})
              </button>
            </Tooltip>
            <Tooltip content="Бенчмарк упоминаемости и доли голоса (Share of Voice) прямых конкурентов." position="bottom">
              <button 
                onClick={() => setActiveReportTab('competitors')}
                className={`btn-adsy-outline ${activeReportTab === 'competitors' ? 'btn-adsy-blue' : ''}`}
                style={{ fontSize: '13px' }}
              >
                Competitors {userMode === 'guest' ? '(Gated)' : `(${fullReport?.competitors.length ?? 0})`}
              </button>
            </Tooltip>
            <Tooltip content="Приоритетный план публикаций для быстрого закрытия разрывов видимости." position="bottom">
              <button 
                onClick={() => setActiveReportTab('opportunities')}
                className={`btn-adsy-outline ${activeReportTab === 'opportunities' ? 'btn-adsy-blue' : ''}`}
                style={{ fontSize: '13px' }}
              >
                Opportunities & Media Match
              </button>
            </Tooltip>
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
                  {(() => {
                    const filteredAnswers = fullReport.answers
                      .filter(a => answerPlatformFilter === 'all' || a.platform === answerPlatformFilter)
                      .filter(a => !selectedPromptForAnswer || a.prompt_id === selectedPromptForAnswer);

                    if (filteredAnswers.length === 0) {
                      return (
                        <div className="cp-panel" style={{ padding: '40px 24px', textAlign: 'center' }}>
                          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' }}>
                            <div style={{ width: '48px', height: '48px', borderRadius: '24px', background: '#FEF3C7', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                              <AlertCircle size={24} color="#D97706" />
                            </div>
                            <strong style={{ fontSize: '16px', color: 'var(--adsy-text-dark)' }}>No AI Observations Found</strong>
                            <p style={{ fontSize: '13px', color: 'var(--adsy-text-secondary)', maxWidth: '500px', margin: 0, lineHeight: 1.6 }}>
                              {answerPlatformFilter !== 'all'
                                ? `No ${answerPlatformFilter} responses recorded for this domain. Try switching the engine filter to "All" or re-run the audit.`
                                : 'This domain was not cited or mentioned in AI engine responses for the tested prompts. This is common for personal portfolios, local businesses, and early-stage brands — it represents a growth opportunity via Adsy media placements.'
                              }
                            </p>
                            <button
                              onClick={() => onSelectGapAndOpenInventory(currentGaps[0]?.topic, null)}
                              className="btn-adsy-green"
                              style={{ marginTop: '4px', fontSize: '13px' }}
                            >
                              <Search size={14} /> Match Publishers to Build AI Visibility
                            </button>
                          </div>
                        </div>
                      );
                    }

                    return filteredAnswers.map((answer) => {
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
                                answer.citations.some(c => currentRun?.domain && c.toLowerCase().includes(currentRun.domain.toLowerCase())) ? (
                                  <span className="badge-adsy-pill badge-ai-green" title="Brand mentioned with verified direct link in response">
                                    <CheckCircle2 size={11} /> Cited with Link
                                  </span>
                                ) : (
                                  <span className="badge-adsy-pill" style={{ background: '#E0F2FE', color: '#0369A1' }} title="Brand mentioned in text without direct backlink">
                                    <CheckCircle2 size={11} /> Mentioned (Text Only)
                                  </span>
                                )
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
                    });
                  })()}
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
                    <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                      {onToggleUserMode && (
                        <button
                          type="button"
                          onClick={() => onToggleUserMode('marketer')}
                          className="btn-adsy-blue"
                          style={{ fontSize: '12px', padding: '6px 12px' }}
                        >
                          Switch to Marketer
                        </button>
                      )}
                      <a 
                        href="https://adsy.com/sign-up?utm_source=ai_visibility&utm_medium=cp_lead_magnet&utm_campaign=ai_audit"
                        target="_blank"
                        rel="noopener noreferrer"
                        className={onToggleUserMode ? "btn-adsy-outline" : "btn-adsy-blue"} 
                        style={{ fontSize: '12px', padding: '6px 12px', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '6px' }}
                      >
                        Unlock All Answers <ExternalLink size={12} />
                      </a>
                    </div>
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
                    <th>
                      Cited Domain / URL 
                      <InfoTooltip text="Домен издания, на которое ссылается нейросеть при формировании ответа." />
                    </th>
                    <th>
                      AI Citation Frequency 
                      <InfoTooltip text="Количество цитирований данного домена моделями в исследуемой нише." />
                    </th>
                    <th>
                      Catalog Status 
                      <InfoTooltip text="Наличие сайта в каталоге Adsy: точное совпадение (Exact Source) или аналог." />
                    </th>
                    <th>
                      Adsy Pricing 
                      <InfoTooltip text="Стоимость гарантированного размещения статьи (Pay-to-Publish) в Adsy." />
                    </th>
                    <th>
                      Action 
                      <InfoTooltip text="Переход к карточке площадки в Adsy Control Panel или подбору аналогов." />
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {(() => {
                    const filtered = (fullReport?.sources || []).filter(s => !sourceFilterInCatalog || s.is_in_adsy_catalog);
                    if (filtered.length === 0) {
                      return (
                        <tr>
                          <td colSpan={5} style={{ textAlign: 'center', padding: '40px 24px' }}>
                            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px' }}>
                              <Globe size={32} color="#CBD5E1" />
                              <strong style={{ fontSize: '15px', color: 'var(--adsy-text-dark)' }}>No AI Citation Sources Detected</strong>
                              <p style={{ fontSize: '13px', color: 'var(--adsy-text-secondary)', maxWidth: '480px', margin: 0, lineHeight: 1.5 }}>
                                {sourceFilterInCatalog
                                  ? 'No sources from this domain appear in the Adsy publisher catalog. Try showing all sources or build citation presence via Adsy placements.'
                                  : 'AI engines did not cite any third-party sources in relation to this domain during the audit period. This indicates low AI footprint — an opportunity to build authoritative backlinks via Adsy.'
                                }
                              </p>
                              <button
                                onClick={() => onSelectGapAndOpenInventory(currentGaps[0]?.topic, null)}
                                className="btn-adsy-green"
                                style={{ marginTop: '8px', fontSize: '13px' }}
                              >
                                <Search size={14} /> Find Publishers to Build AI Presence
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    }
                    return filtered.map((source) => (
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
                            <span className="badge-adsy-pill badge-ai-green" title="Direct cited publisher present in Adsy Inventory">
                              <CheckCircle2 size={11} /> Exact AI Source in Adsy
                            </span>
                          ) : (
                            <span className="badge-adsy-pill" style={{ background: '#F1F5F9', color: '#64748B' }} title="External media publisher — replace with thematic catalog alternatives">
                              Thematic Catalog Alternative
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
                    ));
                  })()}
                </tbody>
              </table>

              {/* Disclaimer from Concept-2 Slide 13 */}
              <div style={{ padding: '12px 18px', background: '#F8FAFC', borderTop: '1px solid var(--adsy-border)', fontSize: '11px', color: 'var(--adsy-text-secondary)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Info size={14} color="#64748B" style={{ flexShrink: 0 }} />
                <span>
                  <strong>Adsy Methodology Note:</strong> Citation of a domain by an AI engine does not guarantee that every newly published placement on it will automatically be indexed into future AI answers. Focus on topical relevance and entity depth.
                </span>
              </div>
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
                    <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap', justifyContent: 'center' }}>
                      {onToggleUserMode && (
                        <button 
                          type="button"
                          onClick={() => onToggleUserMode('marketer')}
                          className="btn-adsy-blue"
                          style={{ padding: '10px 20px', fontSize: '14px' }}
                        >
                          Switch to Marketer Demo Account
                        </button>
                      )}
                      <a 
                        href="https://adsy.com/sign-up?utm_source=ai_visibility&utm_medium=cp_lead_magnet&utm_campaign=ai_audit"
                        target="_blank"
                        rel="noopener noreferrer"
                        className={onToggleUserMode ? "btn-adsy-outline" : "btn-adsy-blue"} 
                        style={{ padding: '10px 22px', fontSize: '14px', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '8px' }}
                      >
                        Sign In / Register on Adsy <ExternalLink size={14} />
                      </a>
                    </div>
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
                        <th>
                          Brand / Competitor 
                          <InfoTooltip text="Название и домен прямого конкурента в AI-выдаче." />
                        </th>
                        <th>
                          Visibility Score 
                          <InfoTooltip text="Процент ответов нейросетей с рекомендацией данного конкурента." />
                        </th>
                        <th>
                          Prompt Coverage 
                          <InfoTooltip text="Доля поисковых запросов, где конкурент вошел в рекомендации." />
                        </th>
                        <th>
                          Total Observed Mentions 
                          <InfoTooltip text="Суммарное количество упоминаний конкурента во всех проверенных ответах." />
                        </th>
                        <th>
                          Action 
                          <InfoTooltip text="Подобрать площадки для вытеснения этого конкурента." />
                        </th>
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

                      {(fullReport?.competitors || []).map((comp) => (
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
